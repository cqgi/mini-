package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

import java.util.List;

/**
 * 创建文章请求参数
 */
@Data
public class CreateArticleDTO {

    /**
     * 文章标题
     */
    private String title;

    /**
     * 文章摘要
     */
    private String summary;

    /**
     * 文章内容
     */
    private String content;

    /**
     * 封面地址
     */
    private String cover;

    /**
     * 作者 ID
     */
    private Long userId;

    /**
     * 分类 ID
     */
    private Long categoryId;

    /**
     * 发布状态：0=草稿，1=已发布
     */
    private Integer status;

    /**
     * 标签 ID 列表
     */
    private List<Long> tagIds;
}
