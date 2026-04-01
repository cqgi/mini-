package com.cug.miniblog.personalCenter.service.impl;

import com.cug.miniblog.personalCenter.mapper.TUserMapper;
import com.cug.miniblog.personalCenter.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl extends AuthService {
    @Autowired
    private TUserMapper tUserMapper;


}
