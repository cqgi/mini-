package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.dto.UpdateProfileDTO;
import com.cug.miniblog.personalCenter.service.UsersService;
import com.cug.miniblog.personalCenter.utils.UserContext;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UsersController {
    @Resource
    private UsersService usersService;
    // http://localhost:8080/users/profile?userId=1
    @GetMapping("/profile")
    public User getProfile() {
        Long userId = UserContext.getUserId();
        return usersService.getProfile(userId);
    }
    // PUT /users/profile
    // Content-Type: application/json
    @PutMapping("/profile")
    public boolean updateProfile(@RequestBody UpdateProfileDTO updateProfileDTO) {
        Long userId = UserContext.getUserId();
        return usersService.updateProfile(
                userId,
                updateProfileDTO.getNickname(),
                updateProfileDTO.getAvatar(),
                updateProfileDTO.getBio()
        );
    }
    // http://localhost:8080/users/articles?userId=1&status=pending
    @GetMapping("/articles")
    public List<Long> getMyArticles(String status) {
        Long userId = UserContext.getUserId();
        return usersService.getMyArticles(userId, status);
    }
    // http://localhost:8080/users/comments?userId=1
    @GetMapping("/comments")
    public List<Long> getMyComments() {
        Long userId = UserContext.getUserId();
        return usersService.getMyComments(userId);
    }
    // http://localhost:8080/users/favorites?userId=1
    @GetMapping("/favorites")
    public List<Long> getFavorites() {
        Long userId = UserContext.getUserId();
        return usersService.getFavorites(userId);
    }
    // http://localhost:8080/users/favorites/123
    //http://localhost:8080/users/favorites/2?userId=1
    @PostMapping("/favorites/{articleId}")
    public boolean collectArticle(@PathVariable Long articleId) {
        Long userId = UserContext.getUserId();
        return usersService.collectArticle(userId, articleId);
    }
    // http://localhost:8080/users/favorites/123?userId=1
    @DeleteMapping("/favorites/{articleId}")
    public boolean cancelCollect(@PathVariable Long articleId) {
        Long userId = UserContext.getUserId();
        return usersService.cancelCollect(userId, articleId);
    }
}
