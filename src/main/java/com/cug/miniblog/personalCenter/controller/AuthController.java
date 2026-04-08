package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.service.AuthService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Resource
    private AuthService authService;
    // http://localhost:8081/auth/register?username=jake&email=jake@example.com&password=123456iiiI
    @PostMapping("/register")
    public User register(String username, String email, String password) {
        return authService.register(username, email, password);
    }
    // http://localhost:8080/auth/login?username=jake&password=123456iiiI
    @PostMapping("/login")
    public String login(String username, String password) {
        return authService.login(username, password);
    }
    @PostMapping("/admin/login")
    public String adminLogin(String username, String password) {
        return authService.adminLogin(username, password);
    }
}
