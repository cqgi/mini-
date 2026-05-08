package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.Category;
import com.cug.miniblog.contextManagement.dto.CreateCategoryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateCategoryDTO;
import com.cug.miniblog.contextManagement.mapper.CategoryMapper;
import com.cug.miniblog.contextManagement.mapper.ContextArticleMapper;
import com.cug.miniblog.contextManagement.service.ICategoryService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分类服务实现类
 */
@Service
public class CategoryServiceImpl implements ICategoryService {

    @Resource
    private CategoryMapper categoryMapper;

    @Resource(name = "contextArticleMapper")
    private ContextArticleMapper articleMapper;

    @Override
    public Result listCategories() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Category::getSort)
                .orderByAsc(Category::getCategoryId);
        List<Category> categories = categoryMapper.selectList(wrapper);
        return Result.ok(categories);
    }

    @Override
    public Result getCategory(Long categoryId) {
        if (categoryId == null) {
            return Result.fail("分类ID不能为空");
        }

        Category category = categoryMapper.selectById(categoryId);
        if (category == null) {
            return Result.fail("分类不存在");
        }
        return Result.ok(category);
    }

    @Override
    public Result createCategory(CreateCategoryDTO createCategoryDTO) {
        Result validateResult = validateCategoryParam(
                createCategoryDTO == null ? null : createCategoryDTO.getCategoryName(),
                createCategoryDTO == null ? null : createCategoryDTO.getSort()
        );
        if (validateResult != null) {
            return validateResult;
        }

        String categoryName = createCategoryDTO.getCategoryName().trim();
        Result duplicateResult = validateCategoryNameExists(categoryName, null);
        if (duplicateResult != null) {
            return duplicateResult;
        }

        Category category = new Category();
        category.setCategoryName(categoryName);
        category.setDescription(normalizeDescription(createCategoryDTO.getDescription()));
        category.setSort(normalizeSort(createCategoryDTO.getSort()));
        category.setIsDeleted(0);
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.insert(category);

        return Result.ok("分类创建成功", category.getCategoryId());
    }

    @Override
    public Result updateCategory(Long categoryId, UpdateCategoryDTO updateCategoryDTO) {
        if (categoryId == null) {
            return Result.fail("分类ID不能为空");
        }

        Result validateResult = validateCategoryParam(
                updateCategoryDTO == null ? null : updateCategoryDTO.getCategoryName(),
                updateCategoryDTO == null ? null : updateCategoryDTO.getSort()
        );
        if (validateResult != null) {
            return validateResult;
        }

        Category existedCategory = categoryMapper.selectById(categoryId);
        if (existedCategory == null) {
            return Result.fail("分类不存在");
        }

        String categoryName = updateCategoryDTO.getCategoryName().trim();
        if (!categoryName.equals(existedCategory.getCategoryName())) {
            Result duplicateResult = validateCategoryNameExists(categoryName, categoryId);
            if (duplicateResult != null) {
                return duplicateResult;
            }
        }

        Category category = new Category();
        category.setCategoryId(categoryId);
        category.setCategoryName(categoryName);
        category.setDescription(normalizeDescription(updateCategoryDTO.getDescription()));
        category.setSort(normalizeSort(updateCategoryDTO.getSort()));
        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.updateById(category);

        return Result.ok("分类更新成功", categoryId);
    }

    @Override
    public Result deleteCategory(Long categoryId) {
        if (categoryId == null) {
            return Result.fail("分类ID不能为空");
        }

        Category category = categoryMapper.selectById(categoryId);
        if (category == null) {
            return Result.fail("分类不存在");
        }

        LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
        articleWrapper.eq(Article::getCategoryId, categoryId);
        Long articleCount = articleMapper.selectCount(articleWrapper);
        if (articleCount != null && articleCount > 0) {
            return Result.fail("当前分类下仍有关联文章，无法删除");
        }

        categoryMapper.deleteById(categoryId);
        return Result.ok("分类删除成功", categoryId);
    }

    private Result validateCategoryParam(String categoryName, Integer sort) {
        if (!StringUtils.hasText(categoryName)) {
            return Result.fail("分类名称不能为空");
        }
        if (categoryName.trim().length() > 30) {
            return Result.fail("分类名称长度不能超过30个字符");
        }
        if (sort != null && sort < 0) {
            return Result.fail("排序值不能小于0");
        }
        return null;
    }

    private Result validateCategoryNameExists(String categoryName, Long ignoreCategoryId) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getCategoryName, categoryName);
        if (ignoreCategoryId != null) {
            wrapper.ne(Category::getCategoryId, ignoreCategoryId);
        }

        Long count = categoryMapper.selectCount(wrapper);
        if (count != null && count > 0) {
            return Result.fail("分类名称已存在");
        }
        return null;
    }

    private String normalizeDescription(String description) {
        if (!StringUtils.hasText(description)) {
            return null;
        }
        String normalized = description.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private Integer normalizeSort(Integer sort) {
        return sort == null ? 0 : sort;
    }
}
