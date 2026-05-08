package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import com.cug.miniblog.common.entity.PrivateMessage;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.contextManagement.mapper.PrivateMessageMapper;
import com.cug.miniblog.contextManagement.service.MessageService;
import com.cug.miniblog.contextManagement.utils.WebSocketServer;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl extends ServiceImpl<PrivateMessageMapper, PrivateMessage> implements MessageService {

    @Autowired
    private UserMapper userMapper;

    // 1. 发送私信 + 用户校验 + WebSocket推送
    @Override
    public Map<String, Object> send(Long senderId, Long receiverId, String content) {
        Map<String, Object> res = new HashMap<>();
        // 参数校验
        if (!StringUtils.hasText(content) || senderId.equals(receiverId)) {
            res.put("success", false);
            res.put("msg", "非法参数");
            return res;
        }
        // 扩展1：用户合法性校验
        User sender = userMapper.selectById(senderId);
        User receiver = userMapper.selectById(receiverId);
        if (sender == null || receiver == null) {
            res.put("success", false);
            res.put("msg", "用户不存在");
            return res;
        }
        // 保存消息
        PrivateMessage msg = new PrivateMessage();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        msg.setSendTime(LocalDateTime.now());
        msg.setIsRead(0);
        msg.setDeleted(0);
        this.save(msg);

        // 扩展3：WebSocket实时推送
        WebSocketServer.send(receiverId, content);
        res.put("success", true);
        res.put("msg", "发送成功");
        return res;
    }

    // 2. 修复版：纯MP单表分页 + 手动关联用户信息
    @Override
    public Page<Map<String, Object>> page(Long userId, Integer pageNum, Integer pageSize) {
        Page<PrivateMessage> page = new Page<>(pageNum, pageSize);

        // 1. MP单表查询私信列表
        IPage<PrivateMessage> messagePage = this.page(page,
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PrivateMessage>()
                        .eq(PrivateMessage::getReceiverId, userId)
                        .eq(PrivateMessage::getDeleted, 0)
                        .orderByDesc(PrivateMessage::getSendTime)
        );

        // 2. 提取所有发送者ID，批量查询用户（性能高）
        List<PrivateMessage> records = messagePage.getRecords();
        Set<Long> senderIds = records.stream().map(PrivateMessage::getSenderId).collect(Collectors.toSet());
        Map<Long, User> userMap = Collections.emptyMap();
        if (!senderIds.isEmpty()) {
            List<User> userList = userMapper.selectBatchIds(senderIds);
            userMap = userList.stream().collect(Collectors.toMap(User::getUserId, u -> u));
        }

        // 3. 组装数据：私信 + 发送者昵称+头像
        List<Map<String, Object>> resultList = new ArrayList<>();
        for (PrivateMessage msg : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("content", msg.getContent());
            map.put("sendTime", msg.getSendTime());
            map.put("isRead", msg.getIsRead());
            map.put("senderId", msg.getSenderId());

            // 放入用户信息（扩展7：自动返回昵称+头像）
            User user = userMap.get(msg.getSenderId());
            if (user != null) {
                map.put("senderName", user.getUsername());
                map.put("senderAvatar", user.getAvatar());
            }
            resultList.add(map);
        }

        // 4. 封装分页返回
        Page<Map<String, Object>> resultPage = new Page<>(pageNum, pageSize);
        resultPage.setRecords(resultList);
        resultPage.setTotal(messagePage.getTotal());
        return resultPage;
    }

    @Override
    public Page<Map<String, Object>> conversation(Long userId, Long contactId, Integer pageNum, Integer pageSize) {
        Page<PrivateMessage> page = new Page<>(pageNum, pageSize);
        IPage<PrivateMessage> messagePage = this.page(page,
                new LambdaQueryWrapper<PrivateMessage>()
                        .eq(PrivateMessage::getDeleted, 0)
                        .and(wrapper -> wrapper
                                .eq(PrivateMessage::getSenderId, userId)
                                .eq(PrivateMessage::getReceiverId, contactId)
                                .or()
                                .eq(PrivateMessage::getSenderId, contactId)
                                .eq(PrivateMessage::getReceiverId, userId))
                        .orderByAsc(PrivateMessage::getSendTime)
        );

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (PrivateMessage msg : messagePage.getRecords()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("senderId", msg.getSenderId());
            map.put("receiverId", msg.getReceiverId());
            map.put("content", msg.getContent());
            map.put("sendTime", msg.getSendTime());
            map.put("isRead", msg.getIsRead());
            map.put("mine", msg.getSenderId().equals(userId));
            resultList.add(map);
        }

        Page<Map<String, Object>> resultPage = new Page<>(pageNum, pageSize);
        resultPage.setRecords(resultList);
        resultPage.setTotal(messagePage.getTotal());
        resultPage.setPages(messagePage.getPages());
        return resultPage;
    }

    // 扩展6：批量标记已读（MP更新）
    @Override
    public boolean batchRead(List<Long> ids, Long userId) {
        return this.update(new LambdaUpdateWrapper<PrivateMessage>()
                .set(PrivateMessage::getIsRead, 1)
                .in(PrivateMessage::getId, ids)
                .eq(PrivateMessage::getReceiverId, userId)
                .eq(PrivateMessage::getDeleted, 0));
    }

    // 扩展6：批量删除（MP软删除）
    @Override
    public boolean batchDelete(List<Long> ids, Long userId) {
        return this.update(new LambdaUpdateWrapper<PrivateMessage>()
                .set(PrivateMessage::getDeleted, 1)
                .in(PrivateMessage::getId, ids)
                .and(w -> w.eq(PrivateMessage::getSenderId, userId).or().eq(PrivateMessage::getReceiverId, userId)));
    }

    // 详情 + 自动已读
    @Override
    public PrivateMessage detail(Long id, Long userId) {
        PrivateMessage msg = this.getById(id);
        if (msg == null || !msg.getReceiverId().equals(userId)) return null;
        if (msg.getIsRead() == 0) batchRead(List.of(id), userId);
        return msg;
    }
}
