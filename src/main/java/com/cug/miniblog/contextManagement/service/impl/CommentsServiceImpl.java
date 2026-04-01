package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import com.cug.miniblog.contextManagement.mapper.BlogCommentsMapper;
import com.cug.miniblog.contextManagement.service.ICommentsService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentsServiceImpl extends ServiceImpl<BlogCommentsMapper, BlogComment> implements ICommentsService {
    @Resource
    BlogCommentsMapper blogCommentsMapper;
    @Override
    public Result postComment(String content, Long userId,Long parentId,Long articleId) {

        if(content==null){return  Result.fail("评论内容不能为空");}
        BlogComment comment=new BlogComment();
        comment.setUserId(userId);
        comment.setParentId(parentId);
        comment.setArticleId(articleId);
        comment.setContent(content);
//        comment.setLiked(0);
        comment.setIsDeleted(true);
        comment.setCreateTime(LocalDateTime.now());
        blogCommentsMapper.insert(comment);
        return Result.ok();
    }

    @Override
    public List<BlogComment> getTopCommentList(Long articleId) {
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        // 条件：指定文章 + 一级评论
        wrapper.eq(BlogComment::getArticleId, articleId)
                .eq(BlogComment::getParentId, 0L)
                // 排序：最新评论在前
                .orderByDesc(BlogComment::getCreateTime);
        // 软删除MP自动过滤
        return blogCommentsMapper.selectList(wrapper);
    }
    //TODD
    @Override
     public List<BlogComment> getCommentTreeList(Long articleId) {

        return null;
    }
//    @Override
//    public Result likeComment(Long commentId) {
//        BlogComment comment = blogCommentsMapper.selectById(commentId);
//        if (comment == null) {
//            return Result.fail("评论不存在");
//        }
//        comment.setLiked(comment.getLiked()+1);
//        blogCommentsMapper.updateById(comment);
//        return Result.ok();
//    }
    @Override
    public Result deleteComment(Long commentId, Long userId) {
        return null;
    }

    @Override
    public Result replyComment(Long commentId, String content, Long userId) {
        return null;
    }




}