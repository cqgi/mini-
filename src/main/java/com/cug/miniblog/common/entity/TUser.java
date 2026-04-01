package com.cug.miniblog.common.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TUser {
    private Long userId;
    private String username;
    private String password;
    private String nickname;
    private String email;
    private String avatar;
    private Integer role;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDeleted;
}
