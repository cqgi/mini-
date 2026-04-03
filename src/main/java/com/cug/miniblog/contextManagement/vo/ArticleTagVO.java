package com.cug.miniblog.contextManagement.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文章标签展示对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleTagVO {
    private Long tagId;
    private String tagName;
}
