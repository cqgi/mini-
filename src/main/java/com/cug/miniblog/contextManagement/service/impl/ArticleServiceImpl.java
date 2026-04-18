package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.ArticleTag;
import com.cug.miniblog.common.entity.Category;
import com.cug.miniblog.common.entity.Tag;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.contextManagement.dto.ArticleQueryDTO;
import com.cug.miniblog.contextManagement.dto.CreateArticleDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateArticleDTO;
import com.cug.miniblog.contextManagement.mapper.ArticleTagMapper;
import com.cug.miniblog.contextManagement.mapper.ArticleTagMapper.ArticleTagQueryRow;
import com.cug.miniblog.contextManagement.mapper.CategoryMapper;
import com.cug.miniblog.contextManagement.mapper.ContextArticleMapper;
import com.cug.miniblog.contextManagement.mapper.ContextUserMapper;
import com.cug.miniblog.contextManagement.mapper.TagMapper;
import com.cug.miniblog.contextManagement.service.IArticleService;
import com.cug.miniblog.contextManagement.vo.ArticleDetailVO;
import com.cug.miniblog.contextManagement.vo.ArticleListVO;
import com.cug.miniblog.contextManagement.vo.ArticleTagVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 文章写操作实现类
 */
@Service
public class ArticleServiceImpl implements IArticleService {

    @Resource(name = "contextArticleMapper")
    private ContextArticleMapper articleMapper;

    @Resource
    private ArticleTagMapper articleTagMapper;

    @Resource(name = "contextUserMapper")
    private ContextUserMapper userMapper;

    @Resource
    private CategoryMapper categoryMapper;

    @Resource
    private TagMapper tagMapper;

    @Override
    public Result listPublishedArticles(ArticleQueryDTO articleQueryDTO) {
        ArticleQueryDTO queryDTO = normalizeQuery(articleQueryDTO);
        String keyword = normalizeKeyword(queryDTO.getKeyword());
        List<Long> articleIds = queryArticleIdsByTagId(queryDTO.getTagId());
        if (queryDTO.getTagId() != null && CollectionUtils.isEmpty(articleIds)) {
            return Result.ok(Collections.emptyList(), 0L);
        }
        Page<Article> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, 1)
                .eq(queryDTO.getCategoryId() != null, Article::getCategoryId, queryDTO.getCategoryId())
                .in(queryDTO.getTagId() != null, Article::getArticleId, articleIds)
                .eq(queryDTO.getIsTop() != null, Article::getIsTop, queryDTO.getIsTop())
                .like(StringUtils.hasText(keyword), Article::getTitle, keyword)
                .orderByDesc(Article::getIsTop)
                .orderByDesc(Article::getCreateTime);

        Page<Article> articlePage = articleMapper.selectPage(page, wrapper);
        List<ArticleListVO> articleList = buildArticleList(articlePage.getRecords());
        return Result.ok(articleList, articlePage.getTotal());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result getPublishedArticleDetail(Long articleId) {
        if (articleId == null) {
            return Result.fail("文章ID不能为空");
        }

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getArticleId, articleId)
                .eq(Article::getStatus, 1);
        Article article = articleMapper.selectOne(wrapper);
        if (article == null) {
            return Result.fail("文章不存在");
        }

        articleMapper.updateViewCount(articleId);
        article.setViewCount(article.getViewCount() == null ? 1L : article.getViewCount() + 1);
        return Result.ok(buildArticleDetail(article));
    }

    @Override
    public Result listAdminArticles(ArticleQueryDTO articleQueryDTO) {
        ArticleQueryDTO queryDTO = normalizeQuery(articleQueryDTO);
        String keyword = normalizeKeyword(queryDTO.getKeyword());
        List<Long> articleIds = queryArticleIdsByTagId(queryDTO.getTagId());
        if (queryDTO.getTagId() != null && CollectionUtils.isEmpty(articleIds)) {
            return Result.ok(Collections.emptyList(), 0L);
        }
        Page<Article> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(queryDTO.getCategoryId() != null, Article::getCategoryId, queryDTO.getCategoryId())
                .in(queryDTO.getTagId() != null, Article::getArticleId, articleIds)
                .eq(queryDTO.getStatus() != null, Article::getStatus, queryDTO.getStatus())
                .eq(queryDTO.getIsTop() != null, Article::getIsTop, queryDTO.getIsTop())
                .like(StringUtils.hasText(keyword), Article::getTitle, keyword)
                .orderByDesc(Article::getIsTop)
                .orderByDesc(Article::getUpdateTime);

        Page<Article> articlePage = articleMapper.selectPage(page, wrapper);
        List<ArticleListVO> articleList = buildArticleList(articlePage.getRecords());
        return Result.ok(articleList, articlePage.getTotal());
    }

    @Override
    public Result getAdminArticleDetail(Long articleId) {
        if (articleId == null) {
            return Result.fail("文章ID不能为空");
        }

        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return Result.fail("文章不存在");
        }
        return Result.ok(buildArticleDetail(article));
    }

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
        Result relationCheckResult = validateArticleRelations(
                createArticleDTO.getUserId(),
                createArticleDTO.getCategoryId(),
                createArticleDTO.getTagIds()
        );
        if (relationCheckResult != null) {
            return relationCheckResult;
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
        Result relationCheckResult = validateArticleRelations(
                updateArticleDTO.getUserId(),
                updateArticleDTO.getCategoryId(),
                updateArticleDTO.getTagIds()
        );
        if (relationCheckResult != null) {
            return relationCheckResult;
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

    private Result validateArticleRelations(Long userId, Long categoryId, List<Long> tagIds) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.fail("作者不存在");
        }

        Category category = categoryMapper.selectById(categoryId);
        if (category == null) {
            return Result.fail("分类不存在");
        }

        if (CollectionUtils.isEmpty(tagIds)) {
            return null;
        }

        Set<Long> distinctTagIds = tagIds.stream()
                .filter(tagId -> tagId != null)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (distinctTagIds.isEmpty()) {
            return null;
        }

        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Tag::getTagId, distinctTagIds);
        Long count = tagMapper.selectCount(wrapper);
        if (count == null || count != distinctTagIds.size()) {
            return Result.fail("标签不存在");
        }
        return null;
    }

    private ArticleQueryDTO normalizeQuery(ArticleQueryDTO articleQueryDTO) {
        ArticleQueryDTO queryDTO = articleQueryDTO == null ? new ArticleQueryDTO() : articleQueryDTO;
        if (queryDTO.getCurrent() == null || queryDTO.getCurrent() < 1) {
            queryDTO.setCurrent(1L);
        }
        if (queryDTO.getSize() == null || queryDTO.getSize() < 1) {
            queryDTO.setSize(10L);
        }
        if (queryDTO.getTagId() != null && queryDTO.getTagId() < 1) {
            queryDTO.setTagId(null);
        }
        return queryDTO;
    }

    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim() : null;
    }

    private List<ArticleListVO> buildArticleList(List<Article> articles) {
        if (CollectionUtils.isEmpty(articles)) {
            return Collections.emptyList();
        }

        Map<Long, User> userMap = queryUserMap(articles);
        Map<Long, Category> categoryMap = queryCategoryMap(articles);
        Map<Long, List<ArticleTagVO>> articleTagMap = queryArticleTagMap(articles);

        List<ArticleListVO> result = new ArrayList<>(articles.size());
        for (Article article : articles) {
            ArticleListVO articleListVO = new ArticleListVO();
            fillBaseArticleInfo(articleListVO, article, userMap, categoryMap);
            List<ArticleTagVO> tagVOList = articleTagMap.getOrDefault(article.getArticleId(), Collections.emptyList());
            articleListVO.setTags(tagVOList);
            articleListVO.setTagNames(tagVOList.stream().map(ArticleTagVO::getTagName).toList());
            result.add(articleListVO);
        }
        return result;
    }

    private ArticleDetailVO buildArticleDetail(Article article) {
        Map<Long, User> userMap = queryUserMap(Collections.singletonList(article));
        Map<Long, Category> categoryMap = queryCategoryMap(Collections.singletonList(article));
        Map<Long, List<ArticleTagVO>> articleTagMap = queryArticleTagMap(Collections.singletonList(article));

        ArticleDetailVO articleDetailVO = new ArticleDetailVO();
        fillBaseArticleInfo(articleDetailVO, article, userMap, categoryMap);
        articleDetailVO.setContent(article.getContent());
        List<ArticleTagVO> tagVOList = articleTagMap.getOrDefault(article.getArticleId(), Collections.emptyList());
        articleDetailVO.setTags(tagVOList);
        articleDetailVO.setTagNames(tagVOList.stream().map(ArticleTagVO::getTagName).toList());
        return articleDetailVO;
    }

    private void fillBaseArticleInfo(ArticleListVO articleListVO, Article article, Map<Long, User> userMap, Map<Long, Category> categoryMap) {
        articleListVO.setArticleId(article.getArticleId());
        articleListVO.setTitle(article.getTitle());
        articleListVO.setSummary(article.getSummary());
        articleListVO.setCover(article.getCover());
        articleListVO.setUserId(article.getUserId());
        articleListVO.setCategoryId(article.getCategoryId());
        articleListVO.setViewCount(article.getViewCount());
        articleListVO.setIsTop(article.getIsTop());
        articleListVO.setStatus(article.getStatus());
        articleListVO.setCreateTime(article.getCreateTime());
        articleListVO.setUpdateTime(article.getUpdateTime());

        User user = userMap.get(article.getUserId());
        if (user != null) {
            articleListVO.setAuthorNickname(user.getNickname());
            articleListVO.setAuthorAvatar(user.getAvatar());
        }

        Category category = categoryMap.get(article.getCategoryId());
        if (category != null) {
            articleListVO.setCategoryName(category.getCategoryName());
        }
    }

    private Map<Long, User> queryUserMap(List<Article> articles) {
        Set<Long> userIds = articles.stream().map(Article::getUserId).collect(Collectors.toSet());
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(User::getUserId, userIds);
        return userMapper.selectList(wrapper).stream().collect(Collectors.toMap(User::getUserId, user -> user));
    }

    private Map<Long, Category> queryCategoryMap(List<Article> articles) {
        Set<Long> categoryIds = articles.stream().map(Article::getCategoryId).collect(Collectors.toSet());
        if (CollectionUtils.isEmpty(categoryIds)) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Category::getCategoryId, categoryIds);
        return categoryMapper.selectList(wrapper).stream().collect(Collectors.toMap(Category::getCategoryId, category -> category));
    }

    private Map<Long, List<ArticleTagVO>> queryArticleTagMap(List<Article> articles) {
        List<Long> articleIds = articles.stream().map(Article::getArticleId).toList();
        if (CollectionUtils.isEmpty(articleIds)) {
            return Collections.emptyMap();
        }

        List<ArticleTagQueryRow> queryRows = articleTagMapper.selectTagsByArticleIds(articleIds);
        Map<Long, List<ArticleTagVO>> articleTagMap = new HashMap<>();
        for (ArticleTagQueryRow queryRow : queryRows) {
            articleTagMap.computeIfAbsent(queryRow.getArticleId(), key -> new ArrayList<>())
                    .add(new ArticleTagVO(queryRow.getTagId(), queryRow.getTagName()));
        }
        return articleTagMap;
    }

    private List<Long> queryArticleIdsByTagId(Long tagId) {
        if (tagId == null) {
            return Collections.emptyList();
        }
        return articleTagMapper.selectArticleIdsByTagId(tagId);
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
