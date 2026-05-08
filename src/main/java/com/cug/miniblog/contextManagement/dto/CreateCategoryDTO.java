package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

/**
 * 创建分类请求参数
 */
@Data
public class CreateCategoryDTO {

    /**
     * 分类名称
     */
    private String categoryName;

    /**
     * 分类描述
     */
    private String description;

    /**
     * 排序值
     */
    private Integer sort;
}
