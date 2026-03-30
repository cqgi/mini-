package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import com.cug.miniblog.contextManagement.service.impl.CommentsServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blog-comments")
public class BlogCommentsController {

    @Resource
    private CommentsServiceImpl commentService;
    /**
     * 发表评论
     */
    @PostMapping("/blog")
    public Result PostComment(@RequestBody BlogComment comment)
    {
    if(comment.getContent() == null) return Result.fail("评论内容不能为空");
    String content = comment.getContent();
    Long userId=comment.getUserId();
    Long parentId=comment.getParentId();
    Long blogId=comment.getBlogId();
    commentService.postComment(content,userId,parentId,blogId);
    return Result.ok();
    }
    /**
     * 查询文章的一级评论列表
     */
    @GetMapping("/blog/{blogId}/topCommentList")
    public List<BlogComment> getTopComment(@PathVariable Long blogId) {
        return commentService.getTopCommentList(blogId);
    }
    /**
     * 点赞评论
     */
    @PutMapping("/blog/{commentId}/like")
    public Result likeComment(@PathVariable Long commentId) {
        return commentService.likeComment(commentId);
    }
}
