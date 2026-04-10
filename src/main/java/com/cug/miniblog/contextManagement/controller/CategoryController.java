package com.cug.miniblog.contextManagement.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cug.miniblog.common.entity.Category;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.mapper.CategoryMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 分类读接口
 */
@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Resource
    private CategoryMapper categoryMapper;

    /**
     * 分类列表
     */
    @GetMapping
    public Result listCategories() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Category::getSort)
                .orderByAsc(Category::getCategoryId);
        List<Category> categories = categoryMapper.selectList(wrapper);
        return Result.ok(categories);
    }
}
