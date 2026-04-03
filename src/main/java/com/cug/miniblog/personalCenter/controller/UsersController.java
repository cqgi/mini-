package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.service.UsersService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    // http://localhost:8080/users/articles?userId=1&status=pending
    @GetMapping("/articles")
    public List<Long> getMyArticles(Long userId, String status) {
        return usersService.getMyArticles(userId, status);
    }
    // http://localhost:8080/users/comments?userId=2
    @GetMapping("/comments")
    public List<Long> getMyComments(Long userId) {
        return usersService.getMyComments(userId);
    }
    // http://localhost:8080/users/favorites?userId=1
    @GetMapping("/favorites")
    public List<Long> getFavorites(Long userId) {
        return usersService.getFavorites(userId);
    }
    // http://localhost:8080/users/favorites/123
    //http://localhost:8080/users/favorites/2?userId=1
    @PostMapping("/favorites/{articleId}")
    public boolean collectArticle(Long userId, @PathVariable Long articleId) {
        return usersService.collectArticle(userId, articleId);
    }
    // http://localhost:8080/users/favorites/123?userId=1
    @DeleteMapping("/favorites/{articleId}")
    public boolean cancelCollect(Long userId, @PathVariable Long articleId) {
        return usersService.cancelCollect(userId, articleId);
    }
}
