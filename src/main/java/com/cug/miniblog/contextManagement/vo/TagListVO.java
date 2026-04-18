package com.cug.miniblog.contextManagement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 标签列表展示对象
 */
@Data
public class TagListVO {
    private Long tagId;
    private String tagName;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Long articleCount;
}
