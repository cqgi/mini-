package com.cug.miniblog.personalCenter.dto;

import lombok.Data;

/**
 * 后台用户列表查询参数
 */
@Data
public class AdminUserQueryDTO {

    /**
     * 当前页
     */
    private Long current;

    /**
     * 每页条数
     */
    private Long size;

    /**
     * 关键字，按用户名/昵称/邮箱模糊匹配
     */
    private String keyword;

    /**
     * 角色：0=普通用户，1=管理员
     */
    private Integer role;
}
