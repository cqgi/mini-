package com.cug.miniblog.personalCenter.service;

import com.cug.miniblog.common.entity.User;

import java.util.List;

public interface UsersService {
    /**
     * 获取当前登录用户的个人资料
     * 接口文档：4.1 获取个人资料 GET /users/profile
     * @param userId 当前登录用户ID
     * @return 用户个人资料（昵称/头像/邮箱/简介等）
     */
    User getProfile(Long userId);

    /**
     * 更新当前登录用户的个人资料
     * 接口文档：4.2 更新个人资料 PUT /users/profile
     * @param userId 当前登录用户ID
     * @param nickname 新昵称（2-20字符，可选）
     * @param avatar 新头像URL（可选）
     * @param bio 个人简介（最多200字符，可选）
     * @return 是否更新成功
     */
    boolean updateProfile(Long userId, String nickname, String avatar, String bio);

    /**
     * 获取当前用户的所有文章（支持按状态筛选）
     * 接口文档：4.3 获取我的文章列表 GET /users/articles
     * @param userId 当前登录用户ID
     * @param status 文章状态（draft/pending/published/failed，可选）
     * @return 文章ID列表/文章基础信息列表
     */
    List<Long> getMyArticles(Long userId, String status);

    /**
     * 获取当前用户发表的所有评论
     * 接口文档：4.4 获取我的评论列表 GET /users/comments
     * @param userId 当前登录用户ID
     * @return 评论ID列表/评论基础信息列表
     */
    List<Long> getMyComments(Long userId);

    /**
     * 获取当前用户收藏的文章列表
     * 接口文档：4.5 获取收藏列表 GET /users/favorites
     * @param userId 当前登录用户ID
     * @return 收藏的文章ID列表
     */
    List<Long> getFavorites(Long userId);

    /**
     * 收藏一篇文章
     * 接口文档：4.6 收藏文章 POST /users/favorites/{articleId}
     * @param userId 当前登录用户ID
     * @param articleId 要收藏的文章ID
     * @return 是否收藏成功
     */
    boolean collectArticle(Long userId, Long articleId);

    /**
     * 取消收藏一篇文章
     * 接口文档：4.7 取消收藏 DELETE /users/favorites/{articleId}
     * @param userId 当前登录用户ID
     * @param articleId 要取消收藏的文章ID
     * @return 是否取消成功
     */
    boolean cancelCollect(Long userId, Long articleId);
}
