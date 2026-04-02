package com.cug.miniblog;

import com.cug.miniblog.contextManagement.controller.BlogCommentsController;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import jakarta.annotation.Resource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MiniBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniBlogApplication.class, args);
    }

}
