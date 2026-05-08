package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

/**
 * 后台评论列表查询参数
 */
@Data
public class CommentQueryDTO {

    /**
     * 当前页
     */
    private Long current;

    /**
     * 每页条数
     */
    private Long size;

    /**
     * 文章 ID
     */
    private Long articleId;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 关键词，按评论内容模糊匹配
     */
    private String keyword;
}
