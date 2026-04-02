package com.cug.miniblog.contextManagement.service;

import com.cug.miniblog.contextManagement.dto.CreateArticleDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateArticleDTO;

/**
 * 文章写操作 Service
 */
public interface IArticleService {

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
