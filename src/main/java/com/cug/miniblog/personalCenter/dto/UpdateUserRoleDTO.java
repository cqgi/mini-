package com.cug.miniblog.personalCenter.dto;

import lombok.Data;

/**
 * 修改用户角色请求参数
 */
@Data
public class UpdateUserRoleDTO {

    /**
     * 角色：0=普通用户，1=管理员
     */
    private Integer role;
}
