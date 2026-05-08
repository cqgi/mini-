package com.cug.miniblog;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cug.miniblog.common.entity.PrivateMessage;
import com.cug.miniblog.contextManagement.controller.CommentsController;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.common.entity.Comment;
import com.cug.miniblog.contextManagement.service.MessageService;
import com.cug.miniblog.contextManagement.utils.JwtUtil;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MiniBlogApplicationTests {

    @Autowired
    private CommentsController blogCommentsController;

    @Test
    void testPostComment() {
        Comment comment = new Comment();
        comment.setArticleId(1L);
        comment.setUserId(1L);
        comment.setParentId(16L);
        comment.setIsLiked(0L);
        comment.setContent("This is a comment");

        Result result = blogCommentsController.PostComment(comment);
        System.out.println(result);
    }

    @Test
    void testGetCommentList() {
        List<Comment> commentList = blogCommentsController.getTopComment(1L);
        commentList.forEach(System.out::println);
    }

    @Test
    void testLikeComment() {
        Result result = blogCommentsController.likeComment(14L);
        System.out.println(result);
    }

    @Test
    void testDeleteComment() {
        Result result = blogCommentsController.deleteComment(14L, 1L);
        System.out.println(result);
    }

    @Test
    void testReplyComment() {
        Result result = blogCommentsController.replyComment(14L, 1l, 2L,"this is a reply");
        System.out.println(result);
    }

    @Test
    void testGetCommentHashList() {
        HashMap<Long, List<Comment>> commentHashList = blogCommentsController.getCommentHashList(1L);
        commentHashList.forEach((key, value) -> {
            System.out.println(key + ":" + value.size());
            value.forEach(System.out::println);
            System.out.println("-----------------");
        });


    }

    @Resource
    private MessageService messageService;
    @Resource
    private JwtUtil jwtUtil;

    // 测试用户ID（数据库必须存在）
    private final Long SENDER_ID = 1L;  // 发送者
    private final Long RECEIVER_ID = 2L; // 接收者

    // 1. 测试：发送私信
    @Test
    public void testSendMessage() {
        Map<String, Object> result = messageService.send(SENDER_ID, RECEIVER_ID, "测试私信内容！");
        System.out.println("发送私信结果：" + result);
    }

    // 2. 测试：分页查询私信列表（带用户昵称+头像）
    @Test
    public void testPageMessage() {
        Page<Map<String, Object>> page = messageService.page(RECEIVER_ID, 1, 10);
        System.out.println("分页列表：" + page);
    }

    // 3. 测试：查看私信详情（自动标记已读）
    @Test
    public void testMessageDetail() {
        PrivateMessage msg = messageService.detail(1L, RECEIVER_ID); // 1L=私信ID
        System.out.println("私信详情：" + msg);
    }

    // 4. 测试：批量标记已读
    @Test
    public void testBatchRead() {
        List<Long> ids = Arrays.asList(1L, 2L); // 要标记的私信ID
        boolean result = messageService.batchRead(ids, RECEIVER_ID);
        System.out.println("批量已读：" + result);
    }

    // 5. 测试：批量删除私信
    @Test
    public void testBatchDelete() {
        List<Long> ids = Arrays.asList(1L); // 要删除的私信ID
        boolean result = messageService.batchDelete(ids, SENDER_ID);
        System.out.println("批量删除：" + result);
    }

    // 工具：生成JWT Token（接口测试用）
    @Test
    public void createToken() {
        String token = jwtUtil.generateToken(1L); // 生成用户1的Token
        System.out.println("Token：" + token);
    }
}

