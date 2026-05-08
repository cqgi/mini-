package com.cug.miniblog.personalCenter.dto;

import lombok.Data;

/**
 * 更新用户资料请求参数
 */
@Data
public class UpdateProfileDTO {

    /**
     * 用户昵称
     */
    private String nickname;

    /**
     * 头像地址
     */
    private String avatar;

    /**
     * 个人简介
     */
    private String bio;
}
