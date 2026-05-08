package com.cug.miniblog.personalCenter.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 后台用户展示对象
 */
@Data
public class AdminUserVO {

    private Long userId;

    private String username;

    private String nickname;

    private String email;

    private String avatar;

    private String bio;

    private Integer role;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
