package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.service.ICategoryService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 分类读接口
 */
@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Resource
    private ICategoryService categoryService;

    /**
     * 分类列表
     */
    @GetMapping
    public Result listCategories() {
        return categoryService.listCategories();
    }
}
