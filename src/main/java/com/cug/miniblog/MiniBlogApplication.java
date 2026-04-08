package com.cug.miniblog;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@MapperScan("com.cug.miniblog.**.mapper")
@SpringBootApplication
public class MiniBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniBlogApplication.class, args);
    }

}
