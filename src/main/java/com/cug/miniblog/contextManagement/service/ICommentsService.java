package com.cug.miniblog.contextManagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;

import java.util.List;

/**
 *评论服务接口
 *
 * **/
public interface ICommentsService extends IService<BlogComment> {
    /**
     * 添加评论
     * @param content,用户评论内容
     * @param userId,用户id
     * @param parentId,关联的1级评论id，如果是一级评论，则值为0
     * @param articleId,关联文章id
     *
     * @return
     */
    Result postComment(String content,Long userId,Long parentId,Long articleId);
    /**
     * 获取评论列表
     * @param articleId,文章id
     * @return
     */
    List<BlogComment> getTopCommentList(Long articleId);
    /**
     * 获取文章的树形评论列表（一级+子回复）
     * @param articleId,文章id
     * @return
     */
    List<BlogComment> getCommentTreeList(Long articleId);
//    /**
//     * 点赞评论
//     * @param commentId,评论id
//     * @return
//     */
//    Result likeComment(Long commentId);
    /**
     * 删除评论
     * @param commentId,评论id
     * @return
     */
    Result deleteComment(Long commentId,Long userId);
    /**
     * 回复评论
     * @param commentId,评论id
     * @param content,回复内容
     * @return
     */
    Result replyComment(Long commentId,String content,Long userId);
}