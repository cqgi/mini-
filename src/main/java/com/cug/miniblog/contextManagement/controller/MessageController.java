package com.cug.miniblog.contextManagement.controller;
import com.cug.miniblog.contextManagement.service.MessageService;
import com.cug.miniblog.contextManagement.utils.JwtUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Resource
    private MessageService messageService;
    @Resource
    private JwtUtil jwtUtil;

    // 统一获取当前登录用户ID
    private Long getLoginUser(HttpServletRequest request) {
        return jwtUtil.getUserId(request.getHeader("token"));
    }

    // 发送私信
    @PostMapping("/send")
    public Map<String, Object> send(@RequestParam Long receiverId,
                                    @RequestParam String content,
                                    HttpServletRequest request) {
        return messageService.send(getLoginUser(request), receiverId, content);
    }

    // 分页列表（带用户头像+昵称）
    @GetMapping("/page")
    public Map<String, Object> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        return Map.of("success", true, "data", messageService.page(getLoginUser(request), pageNum, pageSize));
    }

    // 批量已读
    @PostMapping("/batch-read")
    public Map<String, Object> batchRead(@RequestBody List<Long> ids, HttpServletRequest request) {
        return Map.of("success", messageService.batchRead(ids, getLoginUser(request)));
    }

    // 批量删除
    @PostMapping("/batch-delete")
    public Map<String, Object> batchDelete(@RequestBody List<Long> ids, HttpServletRequest request) {
        return Map.of("success", messageService.batchDelete(ids, getLoginUser(request)));
    }

    // 详情
    @GetMapping("/detail/{id}")
    public Map<String, Object> detail(@PathVariable Long id, HttpServletRequest request) {
        return Map.of("success", true, "data", messageService.detail(id, getLoginUser(request)));
    }
}