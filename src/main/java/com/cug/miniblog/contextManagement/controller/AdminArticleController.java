package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.ArticleQueryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.service.IArticleService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台文章读接口
 */
@RestController
@RequestMapping("/admin/articles")
public class AdminArticleController {

    @Resource
    private IArticleService articleService;

    /**
     * 后台文章列表
     */
    @GetMapping
    public Result listAdminArticles(ArticleQueryDTO articleQueryDTO) {
        return articleService.listAdminArticles(articleQueryDTO);
    }

    /**
     * 后台文章详情
     */
    @GetMapping("/{articleId}")
    public Result getAdminArticleDetail(@PathVariable("articleId") Long articleId) {
        return articleService.getAdminArticleDetail(articleId);
    }

    /**
     * 后台删除文章
     */
    @DeleteMapping("/{articleId}")
    public Result deleteAdminArticle(@PathVariable("articleId") Long articleId) {
        return articleService.deleteArticle(articleId);
    }

    /**
     * 后台切换文章置顶状态
     */
    @PatchMapping("/{articleId}/top")
    public Result changeAdminTopStatus(@PathVariable("articleId") Long articleId, @RequestParam("isTop") Integer isTop) {
        return articleService.changeTopStatus(articleId, isTop);
    }
}
