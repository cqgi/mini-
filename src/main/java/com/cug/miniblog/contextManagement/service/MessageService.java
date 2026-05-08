package com.cug.miniblog.contextManagement.service;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cug.miniblog.common.entity.PrivateMessage;
import java.util.List;
import java.util.Map;

public interface MessageService {
    // 发送私信
    Map<String, Object> send(Long senderId, Long receiverId, String content);
    // 分页查询（带用户信息）
    Page<Map<String, Object>> page(Long userId, Integer pageNum, Integer pageSize);
    // 查询与某个用户的会话历史
    Page<Map<String, Object>> conversation(Long userId, Long contactId, Integer pageNum, Integer pageSize);
    // 批量已读
    boolean batchRead(List<Long> ids, Long userId);
    // 批量删除
    boolean batchDelete(List<Long> ids, Long userId);
    // 详情
    PrivateMessage detail(Long id, Long userId);
}
