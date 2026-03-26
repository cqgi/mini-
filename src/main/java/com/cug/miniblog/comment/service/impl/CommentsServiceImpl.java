package com.cug.miniblog.comment.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cug.miniblog.comment.entity.BlogComments;
import com.cug.miniblog.comment.mapper.BlogCommentsMapper;
import com.cug.miniblog.comment.service.ICommentsService;
import org.springframework.stereotype.Service;

@Service
public class CommentsServiceImpl extends ServiceImpl<BlogCommentsMapper, BlogComments> implements ICommentsService {
}
