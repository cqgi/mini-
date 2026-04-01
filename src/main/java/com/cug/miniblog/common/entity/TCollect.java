package com.cug.miniblog.common.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TCollect {
    private Long collectId;
    private Long userId;
    private Long articleId;
    private LocalDateTime createTime;
    private Integer isDeleted;
}
