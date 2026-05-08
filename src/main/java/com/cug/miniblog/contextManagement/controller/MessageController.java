package com.cug.miniblog.contextManagement.controller;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.service.MessageService;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.utils.UserContext;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Resource
    private MessageService messageService;
    @Resource
    private UserMapper userMapper;

    // 发送私信
    @PostMapping("/send")
    public Result send(@RequestParam Long receiverId,
                       @RequestParam String content) {
        Map<String, Object> result = messageService.send(UserContext.getUserId(), receiverId, content);
        return Boolean.TRUE.equals(result.get("success"))
                ? Result.ok(String.valueOf(result.getOrDefault("msg", "发送成功")), null)
                : Result.fail(String.valueOf(result.getOrDefault("msg", "私信发送失败")));
    }

    // 分页列表（带用户头像+昵称）
    @GetMapping("/page")
    public Result page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok(messageService.page(UserContext.getUserId(), pageNum, pageSize));
    }

    @GetMapping("/conversation/{contactId}")
    public Result conversation(@PathVariable Long contactId,
                               @RequestParam(defaultValue = "1") Integer pageNum,
                               @RequestParam(defaultValue = "50") Integer pageSize) {
        return Result.ok(messageService.conversation(UserContext.getUserId(), contactId, pageNum, pageSize));
    }

    // 批量已读
    @PostMapping("/batch-read")
    public Result batchRead(@RequestBody List<Long> ids) {
        return messageService.batchRead(ids, UserContext.getUserId())
                ? Result.ok()
                : Result.fail("标记已读失败");
    }

    // 批量删除
    @PostMapping("/batch-delete")
    public Result batchDelete(@RequestBody List<Long> ids) {
        return messageService.batchDelete(ids, UserContext.getUserId())
                ? Result.ok()
                : Result.fail("删除私信失败");
    }

    // 详情
    @GetMapping("/detail/{id}")
    public Result detail(@PathVariable Long id) {
        return Result.ok(messageService.detail(id, UserContext.getUserId()));
    }

    @GetMapping("/contacts")
    public Result contacts(@RequestParam(required = false) String keyword) {
        Long currentUserId = UserContext.getUserId();
        List<Map<String, Object>> contacts = userMapper.selectList(
                        Wrappers.lambdaQuery(User.class)
                                .ne(User::getUserId, currentUserId)
                                .and(keyword != null && !keyword.isBlank(), wrapper -> wrapper
                                        .like(User::getUsername, keyword.trim())
                                        .or()
                                        .like(User::getNickname, keyword.trim()))
                                .orderByDesc(User::getCreateTime)
                                .last("limit 20")
                )
                .stream()
                .map(user -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("userId", user.getUserId());
                    item.put("username", user.getUsername() == null ? "" : user.getUsername());
                    item.put("nickname", user.getNickname() == null ? "" : user.getNickname());
                    item.put("avatar", user.getAvatar() == null ? "" : user.getAvatar());
                    return item;
                })
                .collect(Collectors.toList());
        return Result.ok(contacts);
    }
}
