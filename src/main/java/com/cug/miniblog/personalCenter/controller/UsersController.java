package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.service.UsersService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UsersController {
    @Resource
    private UsersService usersService;
    // http://localhost:8080/users/profile?userId=1
    @GetMapping("/profile")
    public User getProfile(Long userId) {
        return usersService.getProfile(userId);
    }
    // http://localhost:8080/users/profile?userId=1&nickname=newNickname&avatar=newAvatar&bio=newBio
    @PutMapping("/profile")
    public boolean updateProfile(Long userId, String nickname, String avatar, String bio) {
        return usersService.updateProfile(userId, nickname, avatar, bio);
    }
}
