package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.service.AuthService;
import com.cug.miniblog.personalCenter.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private TestService testService;
    @Autowired
    private AuthService authService;

    // http://localhost:8080/auth/test
    @RequestMapping("/test")
    public String test1() {
        return testService.testUser(1);
    }
    // http://localhost:8080/auth/register?username=jake&email=jake@example.com&password=123456iiiI
    @RequestMapping("/register")
    public User register(String username, String email, String password) {
        return authService.register(username, email, password);
    }
    // http://localhost:8080/auth/login?username=jake&password=123456iiiI
    @RequestMapping("/login")
    public String login(String username, String password) {
        return authService.login(username, password);
    }
}
