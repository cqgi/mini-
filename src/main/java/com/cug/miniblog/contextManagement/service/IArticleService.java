package com.cug.miniblog.contextManagement.service;

import com.cug.miniblog.contextManagement.dto.ArticleQueryDTO;
import com.cug.miniblog.contextManagement.dto.CreateArticleDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateArticleDTO;

/**
 * 文章写操作 Service
 */
public interface IArticleService {

    /**
     * 前台文章列表
     */
    Result listPublishedArticles(ArticleQueryDTO articleQueryDTO);

    /**
     * 前台文章详情
     */
    Result getPublishedArticleDetail(Long articleId);

    /**
     * 后台文章列表
     */
    Result listAdminArticles(ArticleQueryDTO articleQueryDTO);

    /**
     * 后台文章详情
     */
    Result getAdminArticleDetail(Long articleId);

    /**
     * 新增文章
     */
    Result createArticle(CreateArticleDTO createArticleDTO);

    /**
     * 更新文章
     */
    Result updateArticle(Long articleId, UpdateArticleDTO updateArticleDTO);

    /**
     * 逻辑删除文章
     */
    Result deleteArticle(Long articleId);

    /**
     * 切换置顶状态
     */
    Result changeTopStatus(Long articleId, Integer isTop);
}
