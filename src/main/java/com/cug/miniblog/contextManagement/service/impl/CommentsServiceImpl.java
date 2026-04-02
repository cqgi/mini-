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
import java.util.HashMap;
import java.util.List;

@Service
public class CommentsServiceImpl extends ServiceImpl<BlogCommentsMapper, BlogComment> implements ICommentsService {
    @Resource
    BlogCommentsMapper blogCommentsMapper;
    /**
     * 发表评论
     * @param content 评论内容
     * @param userId 用户id
     * @param parentId 父评论id
     * @param articleId 文章id
     * @return 评论结果
     */
    @Override
    public Result postComment(String content, Long userId,Long parentId,Long articleId) {

        if(content==null){return  Result.fail("评论内容不能为空");}
        BlogComment comment=new BlogComment();
        comment.setUserId(userId);
        comment.setParentId(parentId);
        comment.setArticleId(articleId);
        comment.setContent(content);
        comment.setLiked(0);
        comment.setIsDeleted(false);
        comment.setCreateTime(LocalDateTime.now());
        blogCommentsMapper.insert(comment);
        return Result.ok();
    }
    /**
     * 获取评论列表
     * @param articleId 文章id
     * @return 评论列表
     */
    @Override
    public List<BlogComment> getTopCommentList(Long articleId) {
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        // 条件：指定文章 + 一级评论
        wrapper.eq(BlogComment::getArticleId, articleId)
                .isNull(BlogComment::getParentId)
                .eq(BlogComment::getIsDeleted,false)
                // 排序：点赞数最多的评论在前
                .orderByDesc(BlogComment::getLiked)
                // 排序：点赞数相同最新评论在前
                .orderByDesc(BlogComment::getCreateTime);

        return blogCommentsMapper.selectList(wrapper);
    }
    /**
     * 获取评论树列表
     * @param articleId 文章id
     * @return 评论树列表
     */
    @Override
     public  HashMap<Long,List<BlogComment>>getCommentHashList(Long articleId) {
        HashMap<Long,List<BlogComment>> commentMap=new HashMap<>();
        for(BlogComment comment:getTopCommentList(articleId)){
            getCommentListByParentId(comment.getCommentId(),commentMap);
        }

        return commentMap;
    }
    /**
     * 点赞评论
     * @param commentId 评论id
     * @return 点赞结果
     */
    @Override
    public Result likeComment(Long commentId) {
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BlogComment::getCommentId, commentId)
                .eq(BlogComment::getIsDeleted, false);
        BlogComment comment = blogCommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.fail("评论不存在");
        }
        comment.setLiked(comment.getLiked()+1);
        blogCommentsMapper.update(comment,wrapper);
        return Result.ok("点赞成功");
    }
    /**
     * 删除评论
     * @param commentId 评论id
     * @param userId 用户id
     * @return 删除结果
     */
    @Override
    public Result deleteComment(Long commentId, Long userId) {
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BlogComment::getCommentId, commentId)
                .eq(BlogComment::getUserId, userId)
                .eq(BlogComment::getIsDeleted, false);
        BlogComment comment = blogCommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.ok("评论不存在");
        }
        comment.setIsDeleted(true);
        blogCommentsMapper.update(comment,wrapper);
        return Result.ok("评论删除成功");
    }

    /**
    * 回复评论
    * @param commentId 回复的评论id
    * @param content 回复内容
    * @param userId 用户id
     * @return 回复结果
     */
    @Override
    public Result replyComment(Long commentId, String content, Long userId) {
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BlogComment::getCommentId, commentId)
                .eq(BlogComment::getUserId, userId)
                .eq(BlogComment::getIsDeleted, false);
        BlogComment comment = blogCommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.fail("回复的评论不存在");
        }
        BlogComment replyComment=new BlogComment();
        replyComment.setUserId(userId);
        replyComment.setParentId(commentId);
        replyComment.setArticleId(comment.getArticleId());
        replyComment.setContent(content);
        replyComment.setIsDeleted(false);
        replyComment.setCreateTime(LocalDateTime.now());
        blogCommentsMapper.insert(replyComment);
        return Result.ok("回复成功");
    }
    /**
     * 递归获取评论子回复列表
     * @param parentId 父评论id
     * @param commentMap 评论映射
     * @return 评论映射
     *
     */
private HashMap<Long,List<BlogComment>> getCommentListByParentId(Long parentId,HashMap<Long,List<BlogComment>> commentMap) {
        if(parentId==null){return  null;}
        LambdaQueryWrapper<BlogComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BlogComment::getParentId, parentId)
                .eq(BlogComment::getIsDeleted, false);
        List<BlogComment> commentList = blogCommentsMapper.selectList(wrapper);
        commentMap.put(parentId,commentList);
        for (BlogComment comment : commentList) {
            getCommentListByParentId(comment.getCommentId(), commentMap);
        }
        return commentMap;
    }
    }
