package com.cug.miniblog.contextManagement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 后台评论列表项
 */
@Data
public class AdminCommentVO {

    private Long commentId;

    private Long articleId;

    private String articleTitle;

    private Long userId;

    private String userNickname;

    private Long parentId;

    private String content;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
