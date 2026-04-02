package com.cug.miniblog.personalCenter.service.impl;

import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.service.UsersService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl implements UsersService {
    @Resource
    private UserMapper userMapper;
    // 常量正则
    private static final String NICKNAME_PATTERN = "^.{2,20}$";
    private static final String BIO_PATTERN = "^.{0,200}$";
    @Override
    public User getProfile(Long userId) {
        return userMapper.selectById(userId);
    }
    @Override
    public boolean updateProfile(Long userId, String nickname, String avatar, String bio) {
        // 检查是否为空
        if(userId==null||nickname==null||avatar==null||bio==null){
            return false;
        }
        // 检查昵称是否符合要求
        if(!nickname.matches(NICKNAME_PATTERN)){
            return false;
        }
        // 检查个人简介是否符合要求
        if(!avatar.matches(BIO_PATTERN)){
            return false;
        }
        // 检查是否存在
        User user = userMapper.selectById(userId);
        if(user==null){
            return false;
        }
        // 更新用户信息
        user.setNickname(nickname);
        user.setAvatar(avatar);
        user.setBio(bio);
        // 更新数据库
        userMapper.updateById(user);
        return true;
    }
}
