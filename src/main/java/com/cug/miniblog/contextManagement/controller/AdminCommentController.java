package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.CommentQueryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.service.ICommentsService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台评论管理接口
 */
@RestController
@RequestMapping("/admin/comments")
public class AdminCommentController {

    @Resource
    private ICommentsService commentsService;

    /**
     * 后台评论列表
     */
    @GetMapping
    public Result listAdminComments(CommentQueryDTO commentQueryDTO) {
        return commentsService.listAdminComments(commentQueryDTO);
    }

    /**
     * 后台删除评论
     */
    @DeleteMapping("/{commentId}")
    public Result deleteAdminComment(@PathVariable("commentId") Long commentId) {
        return commentsService.deleteAdminComment(commentId);
    }
}
