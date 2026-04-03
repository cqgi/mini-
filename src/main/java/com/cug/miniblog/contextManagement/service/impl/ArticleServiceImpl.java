package com.cug.miniblog.contextManagement.service.impl;

import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.ArticleTag;
import com.cug.miniblog.contextManagement.dto.CreateArticleDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateArticleDTO;
import com.cug.miniblog.contextManagement.mapper.ArticleMapper;
import com.cug.miniblog.contextManagement.mapper.ArticleTagMapper;
import com.cug.miniblog.contextManagement.service.IArticleService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 文章写操作实现类
 */
@Service
public class ArticleServiceImpl implements IArticleService {

    @Resource
    private ArticleMapper articleMapper;

    @Resource
    private ArticleTagMapper articleTagMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result createArticle(CreateArticleDTO createArticleDTO) {
        if (createArticleDTO == null) {
            return Result.fail("请求参数不能为空");
        }

        Result validateResult = validateCreateOrUpdateParam(
                createArticleDTO.getTitle(),
                createArticleDTO.getContent(),
                createArticleDTO.getUserId(),
                createArticleDTO.getCategoryId(),
                createArticleDTO.getStatus()
        );
        if (validateResult != null) {
            return validateResult;
        }

        Article article = new Article();
        article.setTitle(createArticleDTO.getTitle().trim());
        article.setSummary(createArticleDTO.getSummary());
        article.setContent(createArticleDTO.getContent().trim());
        article.setCover(createArticleDTO.getCover());
        article.setUserId(createArticleDTO.getUserId());
        article.setCategoryId(createArticleDTO.getCategoryId());
        article.setViewCount(0L);
        article.setIsTop(0);
        article.setStatus(createArticleDTO.getStatus());
        article.setIsDeleted(0);
        articleMapper.insert(article);

        // 文章主表插入成功后，再批量写入标签关联。
        // 两步操作放在同一个事务中，只要任一步失败就整体回滚，避免出现“文章已保存但标签丢失”的不一致数据。
        saveArticleTags(article.getArticleId(), createArticleDTO.getTagIds());
        return Result.ok("文章创建成功", article.getArticleId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result updateArticle(Long articleId, UpdateArticleDTO updateArticleDTO) {
        if (articleId == null) {
            return Result.fail("文章ID不能为空");
        }
        if (updateArticleDTO == null) {
            return Result.fail("请求参数不能为空");
        }

        Result validateResult = validateCreateOrUpdateParam(
                updateArticleDTO.getTitle(),
                updateArticleDTO.getContent(),
                updateArticleDTO.getUserId(),
                updateArticleDTO.getCategoryId(),
                updateArticleDTO.getStatus()
        );
        if (validateResult != null) {
            return validateResult;
        }

        Article dbArticle = articleMapper.selectById(articleId);
        if (dbArticle == null) {
            return Result.fail("文章不存在");
        }

        Article article = new Article();
        article.setArticleId(articleId);
        article.setTitle(updateArticleDTO.getTitle().trim());
        article.setSummary(updateArticleDTO.getSummary());
        article.setContent(updateArticleDTO.getContent().trim());
        article.setCover(updateArticleDTO.getCover());
        article.setUserId(updateArticleDTO.getUserId());
        article.setCategoryId(updateArticleDTO.getCategoryId());
        article.setStatus(updateArticleDTO.getStatus());
        articleMapper.updateById(article);

        // 更新文章时，标签关联采用“先删后插”策略。
        // 这里同样必须放在事务中，保证文章内容更新与标签关系变更要么同时成功，要么同时失败。
        articleTagMapper.deleteByArticleId(articleId);
        saveArticleTags(articleId, updateArticleDTO.getTagIds());
        return Result.ok("文章更新成功", articleId);
    }

    @Override
    public Result deleteArticle(Long articleId) {
        if (articleId == null) {
            return Result.fail("文章ID不能为空");
        }

        Article dbArticle = articleMapper.selectById(articleId);
        if (dbArticle == null) {
            return Result.fail("文章不存在");
        }

        // Article 实体配置了 @TableLogic，这里应走 MyBatis-Plus 的逻辑删除入口，
        // 由框架自动将 is_deleted 更新为 1，避免手动 update 触发异常。
        articleMapper.deleteById(articleId);
        return Result.ok("文章删除成功", articleId);
    }

    @Override
    public Result changeTopStatus(Long articleId, Integer isTop) {
        if (articleId == null) {
            return Result.fail("文章ID不能为空");
        }
        if (isTop == null || (isTop != 0 && isTop != 1)) {
            return Result.fail("置顶状态只能是0或1");
        }

        Article dbArticle = articleMapper.selectById(articleId);
        if (dbArticle == null) {
            return Result.fail("文章不存在");
        }

        Article article = new Article();
        article.setArticleId(articleId);
        article.setIsTop(isTop);
        articleMapper.updateById(article);
        return Result.ok(isTop == 1 ? "文章置顶成功" : "文章取消置顶成功", articleId);
    }

    private Result validateCreateOrUpdateParam(String title, String content, Long userId, Long categoryId, Integer status) {
        if (!StringUtils.hasText(title)) {
            return Result.fail("文章标题不能为空");
        }
        if (title.trim().length() > 100) {
            return Result.fail("文章标题长度不能超过100个字符");
        }
        if (!StringUtils.hasText(content)) {
            return Result.fail("文章内容不能为空");
        }
        if (userId == null) {
            return Result.fail("作者ID不能为空");
        }
        if (categoryId == null) {
            return Result.fail("分类ID不能为空");
        }
        if (status == null || (status != 0 && status != 1)) {
            return Result.fail("文章状态只能是0或1");
        }
        return null;
    }

    /**
     * 保存文章标签关联。
     * 这里统一做去重，避免同一个标签重复提交导致唯一索引冲突。
     */
    private void saveArticleTags(Long articleId, List<Long> tagIds) {
        if (articleId == null || CollectionUtils.isEmpty(tagIds)) {
            return;
        }

        Set<Long> distinctTagIds = new LinkedHashSet<>(tagIds);
        List<ArticleTag> articleTags = new ArrayList<>(distinctTagIds.size());
        for (Long tagId : distinctTagIds) {
            if (tagId == null) {
                continue;
            }
            ArticleTag articleTag = new ArticleTag();
            articleTag.setArticleId(articleId);
            articleTag.setTagId(tagId);
            articleTag.setIsDeleted(0);
            articleTags.add(articleTag);
        }

        if (!articleTags.isEmpty()) {
            articleTagMapper.insertBatch(articleTags);
        }
    }
}
