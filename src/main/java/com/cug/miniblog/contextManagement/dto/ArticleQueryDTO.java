package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

/**
 * 文章查询参数
 */
@Data
public class ArticleQueryDTO {

    /**
     * 页码，默认 1
     */
    private Long current = 1L;

    /**
     * 每页大小，默认 10
     */
    private Long size = 10L;

    /**
     * 标题关键字
     */
    private String keyword;

    /**
     * 分类 ID
     */
    private Long categoryId;

    /**
     * 发布状态：0=草稿，1=已发布
     */
    private Integer status;

    /**
     * 是否置顶：0=否，1=是
     */
    private Integer isTop;
}
