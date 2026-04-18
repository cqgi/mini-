package com.cug.miniblog.personalCenter.interceptor;

import cn.hutool.core.util.StrUtil;
import com.cug.miniblog.personalCenter.utils.AuthWhiteList;
import com.cug.miniblog.personalCenter.utils.JwtUtil;
import com.cug.miniblog.personalCenter.utils.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final AntPathMatcher matcher = new AntPathMatcher();

    public LoginInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        // 白名单直接放行
        for (String pattern : AuthWhiteList.WHITE_LIST) {
            if (matcher.match(pattern, uri)) {
                return true;
            }
        }

        // 获取 token
        String token = request.getHeader("Authorization");
        if (StrUtil.isBlank(token) || !token.startsWith("Bearer ")) {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write("{\"code\":401,\"message\":\"请先登录\"}");
            return false;
        }

        token = token.replace("Bearer ", "");
        try {
            Long userId = jwtUtil.extractUserId(token);
            UserContext.setUserId(userId);
            return true;
        } catch (Exception e) {
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write("{\"code\":401,\"message\":\"token无效或已过期\"}");
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}