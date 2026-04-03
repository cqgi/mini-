package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.ArticleQueryDTO;
import com.cug.miniblog.contextManagement.dto.CreateArticleDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateArticleDTO;
import com.cug.miniblog.contextManagement.service.IArticleService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 文章管理写接口
 */
@RestController
@RequestMapping("/articles")
public class ArticleController {

    @Resource
    private IArticleService articleService;

    /**
     * 前台文章列表
     */
    @GetMapping
    public Result listPublishedArticles(ArticleQueryDTO articleQueryDTO) {
        return articleService.listPublishedArticles(articleQueryDTO);
    }

    /**
     * 前台文章详情
     */
    @GetMapping("/{articleId}")
    public Result getPublishedArticleDetail(@PathVariable("articleId") Long articleId) {
        return articleService.getPublishedArticleDetail(articleId);
    }

    /**
     * 新增文章
     */
    @PostMapping
    public Result createArticle(@RequestBody CreateArticleDTO createArticleDTO) {
        return articleService.createArticle(createArticleDTO);
    }

    /**
     * 更新文章
     */
    @PutMapping("/{articleId}")
    public Result updateArticle(@PathVariable("articleId") Long articleId, @RequestBody UpdateArticleDTO updateArticleDTO) {
        return articleService.updateArticle(articleId, updateArticleDTO);
    }

    /**
     * 逻辑删除文章
     */
    @DeleteMapping("/{articleId}")
    public Result deleteArticle(@PathVariable("articleId") Long articleId) {
        return articleService.deleteArticle(articleId);
    }

    /**
     * 切换置顶状态
     */
    @PatchMapping("/{articleId}/top")
    public Result changeTopStatus(@PathVariable("articleId") Long articleId, @RequestParam("isTop") Integer isTop) {
        return articleService.changeTopStatus(articleId, isTop);
    }

}
