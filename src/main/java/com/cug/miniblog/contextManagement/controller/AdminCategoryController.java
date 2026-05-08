package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.CreateCategoryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateCategoryDTO;
import com.cug.miniblog.contextManagement.service.ICategoryService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台分类管理接口
 */
@RestController
@RequestMapping("/admin/categories")
public class AdminCategoryController {

    @Resource
    private ICategoryService categoryService;

    /**
     * 后台分类列表
     */
    @GetMapping
    public Result listAdminCategories() {
        return categoryService.listCategories();
    }

    /**
     * 后台分类详情
     */
    @GetMapping("/{categoryId}")
    public Result getAdminCategory(@PathVariable("categoryId") Long categoryId) {
        return categoryService.getCategory(categoryId);
    }

    /**
     * 后台创建分类
     */
    @PostMapping
    public Result createAdminCategory(@RequestBody CreateCategoryDTO createCategoryDTO) {
        return categoryService.createCategory(createCategoryDTO);
    }

    /**
     * 后台修改分类
     */
    @PutMapping("/{categoryId}")
    public Result updateAdminCategory(
            @PathVariable("categoryId") Long categoryId,
            @RequestBody UpdateCategoryDTO updateCategoryDTO
    ) {
        return categoryService.updateCategory(categoryId, updateCategoryDTO);
    }

    /**
     * 后台删除分类
     */
    @DeleteMapping("/{categoryId}")
    public Result deleteAdminCategory(@PathVariable("categoryId") Long categoryId) {
        return categoryService.deleteCategory(categoryId);
    }
}
