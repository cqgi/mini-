package com.cug.miniblog.personalCenter.controller;

import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.personalCenter.dto.AdminUserQueryDTO;
import com.cug.miniblog.personalCenter.dto.UpdateUserRoleDTO;
import com.cug.miniblog.personalCenter.service.UsersService;
import com.cug.miniblog.personalCenter.utils.UserContext;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台用户管理接口
 */
@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @Resource
    private UsersService usersService;

    /**
     * 后台用户列表
     */
    @GetMapping
    public Result listAdminUsers(AdminUserQueryDTO adminUserQueryDTO) {
        return usersService.listAdminUsers(adminUserQueryDTO);
    }

    /**
     * 后台用户详情
     */
    @GetMapping("/{userId}")
    public Result getAdminUser(@PathVariable("userId") Long userId) {
        return usersService.getAdminUser(userId);
    }

    /**
     * 后台修改用户角色
     */
    @PutMapping("/{userId}/role")
    public Result updateAdminUserRole(
            @PathVariable("userId") Long userId,
            @RequestBody UpdateUserRoleDTO updateUserRoleDTO
    ) {
        return usersService.updateAdminUserRole(userId, updateUserRoleDTO, UserContext.getUserId());
    }

    /**
     * 后台删除用户
     */
    @DeleteMapping("/{userId}")
    public Result deleteAdminUser(@PathVariable("userId") Long userId) {
        return usersService.deleteAdminUser(userId, UserContext.getUserId());
    }
}
