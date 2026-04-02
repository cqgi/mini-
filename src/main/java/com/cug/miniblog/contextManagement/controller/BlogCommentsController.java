package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import com.cug.miniblog.contextManagement.service.impl.CommentsServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/blog-comments")
public class BlogCommentsController {

    @Resource
    private CommentsServiceImpl commentService;
    /**
     * 发表评论
     */
    @PostMapping("/blog/post")
    public Result PostComment(@RequestBody BlogComment comment)
    {
    if(comment.getContent() == null) return Result.fail("评论内容不能为空");
    String content = comment.getContent();
    Long userId=comment.getUserId();
    Long parentId=comment.getParentId();
    Long articleId=comment.getArticleId();
    commentService.postComment(content,userId,parentId,articleId);
    return Result.ok();
    }
    /**
     * 查询文章的一级评论列表
     */
    @GetMapping("/blog/{articleId}/topCommentList")
    public List<BlogComment> getTopComment(@PathVariable Long articleId) {
        return commentService.getTopCommentList(articleId);
    }
    /**
     * 查询文章的树形评论列表（一级+子回复）
     */
    @GetMapping("/blog/{articleId}/commentTreeList")
    public HashMap<Long,List<BlogComment>> getCommentHashList(@PathVariable Long articleId) {
        return commentService.getCommentHashList(articleId);
    }
    /**
     * 点赞评论
     */
    @PutMapping("/blog/{commentId}/like")
    public Result likeComment(@PathVariable Long commentId) {
        return commentService.likeComment(commentId);
    }
    /**
     * 删除评论
     */
    @DeleteMapping("/blog/{commentId}/{userId}/delete")
    public Result deleteComment(@PathVariable Long commentId, @PathVariable Long userId) {
        return commentService.deleteComment(commentId, userId);
    }
    /**
     * 回复评论
     */
    @PostMapping("/blog/{commentId}/{userId}/reply")
    public Result replyComment(@PathVariable Long commentId, @PathVariable Long userId, @RequestBody String content) {
        return commentService.replyComment(commentId, content, userId);
    }
}
