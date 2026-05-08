package com.cug.miniblog.contextManagement.service;

import com.cug.miniblog.contextManagement.dto.CreateCategoryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateCategoryDTO;

/**
 * 分类服务接口
 */
public interface ICategoryService {

    /**
     * 分类列表
     */
    Result listCategories();

    /**
     * 分类详情
     */
    Result getCategory(Long categoryId);

    /**
     * 新建分类
     */
    Result createCategory(CreateCategoryDTO createCategoryDTO);

    /**
     * 修改分类
     */
    Result updateCategory(Long categoryId, UpdateCategoryDTO updateCategoryDTO);

    /**
     * 删除分类
     */
    Result deleteCategory(Long categoryId);
}
