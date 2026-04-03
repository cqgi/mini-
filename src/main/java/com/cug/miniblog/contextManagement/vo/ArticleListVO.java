package com.cug.miniblog.contextManagement.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文章列表展示对象
 */
@Data
public class ArticleListVO {
    private Long articleId;
    private String title;
    private String summary;
    private String cover;
    private Long userId;
    private Long categoryId;
    private Long viewCount;
    private Integer isTop;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String authorNickname;
    private String authorAvatar;
    private String categoryName;
    private List<String> tagNames;
}
