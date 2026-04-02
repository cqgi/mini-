package com.cug.miniblog.personalCenter.service;

import com.cug.miniblog.common.entity.User;

public interface AuthService {
    /**
     * 用户注册
     * 接口文档：1.1 用户注册 POST /auth/register
     * @param username 用户名（4-20位字母数字组合，唯一）
     * @param email 邮箱（格式正确且唯一）
     * @param password 密码（6-20位）
     * @return 注册成功的用户基础信息（userId/username/email）
     */
    User register(String username, String email, String password);

    /**
     * 普通用户登录
     * 接口文档：1.2 用户登录 POST /auth/login
     * @param username 用户名
     * @param password 密码
     * @return 登录成功的令牌Token
     */
    String login(String username, String password);

    /**
     * 管理员登录
     * 接口文档：1.3 管理员登录 POST /auth/admin/login
     * @param username 管理员用户名
     * @param password 管理员密码
     * @return 登录成功的令牌Token（带管理员权限标识）
     */
    //String adminLogin(String username, String password);
}
