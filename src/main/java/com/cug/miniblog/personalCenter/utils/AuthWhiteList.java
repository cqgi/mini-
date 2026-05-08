package com.cug.miniblog.personalCenter.utils;

public class AuthWhiteList {
    // 放行接口
    public static final String[] WHITE_LIST = {
            "/auth/login",
            "/auth/register",
            "/auth/admin/login",
            "/articles",
            "/articles/*",
            "/categories",
            "/tags",
            "/tags/*",
            "/blog-comments/blog/*/topCommentList",
            "/blog-comments/blog/*/commentTreeList"
    };
}
