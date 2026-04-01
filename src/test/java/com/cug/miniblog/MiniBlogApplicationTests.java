package com.cug.miniblog;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.cug.miniblog.contextManagement.controller.BlogCommentsController;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import com.cug.miniblog.contextManagement.dto.Result;

import jakarta.annotation.Resource;

@SpringBootTest
class MiniBlogApplicationTests {

    @Resource
    private BlogCommentsController blogCommentsController;

    @Test
    void contextLoads() {
        BlogComment comment = new BlogComment();
        comment.setArticleId(1L);
        comment.setUserId(1L);
        comment.setContent("这是一条评论");
        Result result = blogCommentsController.PostComment(comment);
        System.out.println(result);
    }

}
