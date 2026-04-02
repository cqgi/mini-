package com.cug.miniblog;

import com.cug.miniblog.contextManagement.controller.BlogCommentsController;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.List;


@SpringBootTest
class MiniBlogApplicationTests {

    @Autowired
    private BlogCommentsController blogCommentsController;
    @Test
    void testPostComment() {
        BlogComment comment = new BlogComment();
        comment.setArticleId(1L);
        comment.setUserId(1L);
        comment.setParentId(16L);
        comment.setLiked(0);
        comment.setContent("This is a comment");

        Result result = blogCommentsController.PostComment(comment);
        System.out.println(result);
    }
    @Test
    void testGetCommentList() {
        List<BlogComment> commentList = blogCommentsController.getTopComment(1L);
       commentList.forEach(System.out::println);
    }
    @Test
    void testLikeComment() {
        Result result = blogCommentsController.likeComment(14L);
        System.out.println(result);
    }
    @Test
    void testDeleteComment() {
        Result result = blogCommentsController.deleteComment(14L,1L);
        System.out.println(result);
    }
    @Test
    void testReplyComment() {
        Result result = blogCommentsController.replyComment(14L, 1l, "This is a reply");
        System.out.println(result);
    }
    @Test
    void testGetCommentHashList() {
        HashMap<Long,List<BlogComment>> commentHashList = blogCommentsController.getCommentHashList(1L);
        commentHashList.forEach((key,value)->{
            System.out.println(key+":"+value.size());
            value.forEach(System.out::println);
            System.out.println("-----------------");
        });
    }
}
