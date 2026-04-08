package com.cug.miniblog.personalCenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.Collect;
import com.cug.miniblog.common.entity.Comment;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.mapper.ArticleMapper;
import com.cug.miniblog.personalCenter.mapper.CollectMapper;
import com.cug.miniblog.personalCenter.mapper.CommentMapper;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.service.UsersService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsersServiceImpl implements UsersService {
    @Resource
    private UserMapper userMapper;
    @Resource
    private ArticleMapper articleMapper;
    @Resource
    private CollectMapper collectMapper;
    @Resource
    private CommentMapper commentMapper;
    // 常量正则
    private static final String NICKNAME_PATTERN = "^.{2,20}$";
    private static final String BIO_PATTERN = "^.{0,200}$";
    @Override
    public User getProfile(Long userId) {
        return userMapper.selectById(userId);
    }
    @Override
    public boolean updateProfile(Long userId, String nickname, String avatar, String bio) {
        // 检查是否为空
        if(userId==null||nickname==null||avatar==null||bio==null){
            return false;
        }
        // 检查昵称是否符合要求
        if(!nickname.matches(NICKNAME_PATTERN)){
            return false;
        }
        // 检查个人简介是否符合要求
        if(!avatar.matches(BIO_PATTERN)){
            return false;
        }
        // 检查是否存在
        User user = userMapper.selectById(userId);
        if(user==null){
            return false;
        }
        // 更新用户信息
        user.setNickname(nickname);
        user.setAvatar(avatar);
        user.setBio(bio);
        // 更新数据库
        userMapper.updateById(user);
        return true;
    }

    @Override
    public boolean collectArticle(Long userId, Long articleId) {
        if (userId == null || articleId == null) {
            return false;
        }
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return false;
        }
        LambdaQueryWrapper<Collect> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collect::getUserId, userId)
                .eq(Collect::getArticleId, articleId);
        Collect existCollect = collectMapper.selectOne(queryWrapper);
        if (existCollect != null) {
            return false;
        }
        Collect collect = new Collect();
        collect.setUserId(userId);
        collect.setArticleId(articleId);
        collect.setCreateTime(LocalDateTime.now());
        return collectMapper.insert(collect) > 0;
    }

    @Override
    public boolean cancelCollect(Long userId, Long articleId) {
        if (userId == null || articleId == null) {
            return false;
        }
        LambdaQueryWrapper<Collect> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collect::getUserId, userId)
                .eq(Collect::getArticleId, articleId);
        return collectMapper.delete(queryWrapper) > 0;
    }

    @Override
    public List<Long> getFavorites(Long userId) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Collect> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collect::getUserId, userId)
                .select(Collect::getArticleId);
        List<Collect> collects = collectMapper.selectList(queryWrapper);
        return collects.stream()
                .map(Collect::getArticleId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getMyComments(Long userId) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Comment> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Comment::getUserId, userId)
                .select(Comment::getCommentId);
        List<Comment> comments = commentMapper.selectList(queryWrapper);
        return comments.stream()
                .map(Comment::getCommentId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getMyArticles(Long userId, String status) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Article> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Article::getUserId, userId);
        if (status != null && !status.isEmpty()) {
            Integer statusValue = getStatusValue(status);
            if (statusValue != null) {
                queryWrapper.eq(Article::getStatus, statusValue);
            }
        }
        queryWrapper.select(Article::getArticleId);
        List<Article> articles = articleMapper.selectList(queryWrapper);
        return articles.stream()
                .map(Article::getArticleId)
                .collect(Collectors.toList());
    }

    private Integer getStatusValue(String status) {
        switch (status.toLowerCase()) {
            case "draft":
                return 0;
            case "pending":
                return 1;
            case "published":
                return 2;
            case "failed":
                return 3;
            default:
                return null;
        }
    }
}
