package com.cug.miniblog.contextManagement.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 文章详情展示对象
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ArticleDetailVO extends ArticleListVO {
    private String content;
    private List<ArticleTagVO> tags;
}
