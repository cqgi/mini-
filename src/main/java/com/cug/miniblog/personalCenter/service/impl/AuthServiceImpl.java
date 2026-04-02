package com.cug.miniblog.personalCenter.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.service.AuthService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.regex.Pattern;

@Service
public class AuthServiceImpl  implements AuthService {
    @Resource
    private UserMapper userMapper;

    // 常量正则
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{4,20}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?![0-9]+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,20}$");

    @Transactional
    @Override
    public User register(String username, String email, String password) {
        // 是否为空
        if(username==null||email==null||password==null||username.isBlank()||email.isBlank()||password.isBlank()){
            throw new IllegalArgumentException("用户名、邮箱、密码不能为空");
        }
        // 检查标准
        if(!USERNAME_PATTERN.matcher(username).matches()){
            throw new IllegalArgumentException("用户名必须是字母、数字或下划线，长度在4到20之间");
        }
        if(!EMAIL_PATTERN.matcher(email).matches()){
            throw new IllegalArgumentException("邮箱必须是正确的邮箱格式");
        }
        if(!PASSWORD_PATTERN.matcher(password).matches()){
            throw new IllegalArgumentException("密码必须包含字母和数字，长度在6到20之间");
        }
        // 唯一性校验
        boolean usernameExists=userMapper.exists(Wrappers.lambdaQuery(User.class).eq(User::getUsername,username));
        if(usernameExists){
            throw new IllegalArgumentException("用户名已存在");
        }
        boolean emailExists=userMapper.exists(Wrappers.lambdaQuery(User.class).eq(User::getEmail,email));
        if(emailExists){
            throw new IllegalArgumentException("邮箱已存在");
        }
        // 待加密密码
        // 构建对象
        User user=new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        // 待生成随机名称
        String nickname="用户_"+String.format("%07d",new Random().nextInt(90000000)+10000000);
        user.setNickname(nickname);
        // 暂时没有默认头像地址
        user.setAvatar("默认头像地址.jpg");
        user.setRole(0);
        // 插入数据库
        userMapper.insert(user);
        return user;
    }
    @Transactional
    @Override
    public String login(String username, String password) {
        // 是否为空
        if (username == null || password == null) {
            throw new IllegalArgumentException("用户名或密码不能为空");
        }
        if(username.isBlank()||password.isBlank()){
            throw new IllegalArgumentException("用户名或密码不能为空");
        }
        //检查标准
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("用户名必须是字母、数字或下划线，长度在4到20之间");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("密码必须包含字母和数字，长度在6到20之间");
        }
        // 校验用户是否存在
        User user = userMapper.selectOne(Wrappers.lambdaQuery(User.class).eq(User::getUsername, username));
        if (user == null) {
            throw new IllegalArgumentException("用户名不存在");
        }
        // 校验密码是否正确
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("密码错误");
        }
        // 登录成功，返回令牌
        return  "登录成功"+user.getUsername();
    }
    @Transactional
    @Override
    public String adminLogin(String username, String password) {
        // 是否为空
        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("用户名或密码不能为空");
        }
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("用户名必须是字母、数字或下划线，长度在4到20之间");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("密码必须包含字母和数字，长度在6到20之间");
        }
        // 校验用户是否存在并且是否为管理员
        User user = userMapper.selectOne(Wrappers.lambdaQuery(User.class).eq(User::getUsername, username).eq(User::getRole, 1));
        if (user == null) {
            throw new IllegalArgumentException("用户名不存在");
        }
        if(user.getRole()==0){
            throw new IllegalArgumentException("用户不是管理员");
        }
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("密码错误");
        }
        // 登录成功，返回令牌
        return  "登录成功，管理员权限"+user.getUsername();
    }
}