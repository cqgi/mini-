package com.cug.miniblog.contextManagement.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文章详情展示对象
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ArticleDetailVO extends ArticleListVO {
    private String content;
}
