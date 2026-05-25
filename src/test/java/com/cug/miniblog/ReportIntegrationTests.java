package com.cug.miniblog;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cug.miniblog.common.entity.Comment;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.common.service.FileUploadService;
import com.cug.miniblog.common.vo.UploadedFileVO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.service.IArticleService;
import com.cug.miniblog.contextManagement.service.ICategoryService;
import com.cug.miniblog.contextManagement.service.ICommentsService;
import com.cug.miniblog.contextManagement.service.ITagService;
import com.cug.miniblog.contextManagement.service.MessageService;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.service.AuthService;
import com.cug.miniblog.personalCenter.service.UsersService;
import com.cug.miniblog.personalCenter.utils.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Mirrors the 12 integration scenarios documented in the team test report.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ReportIntegrationTests {

    private static final Long USER_ID = 1L;
    private static final Long ADMIN_ID = 99L;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;
    @MockitoBean
    private UsersService usersService;
    @MockitoBean
    private IArticleService articleService;
    @MockitoBean
    private ICommentsService commentsService;
    @MockitoBean
    private ITagService tagService;
    @MockitoBean
    private ICategoryService categoryService;
    @MockitoBean
    private MessageService messageService;
    @MockitoBean
    private FileUploadService fileUploadService;
    @MockitoBean
    private UserMapper userMapper;
    @MockitoBean
    private ServerEndpointExporter serverEndpointExporter;

    @Test
    @DisplayName("TC-01 注册与登录：注册成功后可获得登录 token")
    void registerAndLogin() throws Exception {
        User registered = new User();
        registered.setUserId(USER_ID);
        registered.setUsername("report_user");
        registered.setEmail("report@example.com");
        when(authService.register("report_user", "report@example.com", "123456"))
                .thenReturn(registered);
        when(authService.login("report_user", "123456"))
                .thenReturn("mock-login-token");

        mockMvc.perform(post("/auth/register")
                        .param("username", "report_user")
                        .param("email", "report@example.com")
                        .param("password", "123456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID))
                .andExpect(jsonPath("$.username").value("report_user"));

        mockMvc.perform(post("/auth/login")
                        .param("username", "report_user")
                        .param("password", "123456"))
                .andExpect(status().isOk())
                .andExpect(content().string("mock-login-token"));
    }

    @Test
    @DisplayName("TC-02 访客公开浏览：首页、发现页、文章详情公开可访问")
    void guestPublicBrowsing() throws Exception {
        when(articleService.listPublishedArticles(any())).thenReturn(Result.ok(List.of("article"), 1L));
        when(articleService.getPublishedArticleDetail(1L)).thenReturn(Result.ok(Map.of("title", "公开文章")));
        when(categoryService.listCategories()).thenReturn(Result.ok(List.of("Java")));

        mockMvc.perform(get("/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mockMvc.perform(get("/articles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("公开文章"));
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("TC-03 个人资料修改：登录用户可读取并更新资料")
    void updateProfile() throws Exception {
        User profile = new User();
        profile.setUserId(USER_ID);
        profile.setNickname("新昵称");
        when(usersService.getProfile(USER_ID)).thenReturn(profile);
        when(usersService.updateProfile(eq(USER_ID), eq("新昵称"), eq("https://cdn.example/avatar.png"), eq("简介")))
                .thenReturn(true);

        mockMvc.perform(get("/users/profile").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("新昵称"));

        mockMvc.perform(put("/users/profile")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"新昵称","avatar":"https://cdn.example/avatar.png","bio":"简介"}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("TC-04 文章发布与编辑：登录用户可发布、编辑并查看文章详情")
    void createEditAndViewArticle() throws Exception {
        when(articleService.createArticle(any())).thenReturn(Result.ok(Map.of("articleId", 1)));
        when(articleService.updateArticle(eq(1L), any())).thenReturn(Result.ok());
        when(articleService.getPublishedArticleDetail(1L)).thenReturn(Result.ok(Map.of("title", "更新后的文章")));

        mockMvc.perform(post("/articles")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"原文章","content":"内容","categoryId":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(put("/articles/1")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"更新后的文章","content":"更新内容","categoryId":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/articles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("更新后的文章"));
    }

    @Test
    @DisplayName("TC-05 评论与回复：可发表评论并回复其他用户")
    void commentsAndReplies() throws Exception {
        when(commentsService.postComment(eq("这是一条评论"), eq(USER_ID), eq(0L), eq(1L))).thenReturn(Result.ok());
        when(commentsService.replyComment(eq(10L), eq("这是一条回复"), eq(2L), eq(USER_ID))).thenReturn(Result.ok());
        HashMap<Long, List<Comment>> tree = new HashMap<>();
        tree.put(10L, new ArrayList<>());
        when(commentsService.getCommentHashList(1L)).thenReturn(tree);

        mockMvc.perform(post("/blog-comments/blog/post")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"articleId":1,"userId":1,"parentId":0,"content":"这是一条评论"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/blog-comments/blog/10/2/1/reply")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("这是一条回复"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/blog-comments/blog/1/commentTreeList"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("10")));
    }

    @Test
    @DisplayName("TC-06 收藏切换：收藏后再取消收藏，状态同步成功")
    void favoriteToggle() throws Exception {
        when(usersService.collectArticle(USER_ID, 1L)).thenReturn(true);
        when(usersService.cancelCollect(USER_ID, 1L)).thenReturn(true);
        when(usersService.getFavorites(USER_ID)).thenReturn(List.of(1L));

        mockMvc.perform(post("/users/favorites/1").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
        mockMvc.perform(get("/users/favorites").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value(1));
        mockMvc.perform(delete("/users/favorites/1").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("TC-07 标签筛选：按标签或关键词筛选文章")
    void tagFiltering() throws Exception {
        when(tagService.listTags(isNull(), isNull(), eq("Java"))).thenReturn(Result.ok(List.of("Java"), 1L));
        when(articleService.listPublishedArticles(any())).thenReturn(Result.ok(List.of("Java文章"), 1L));

        mockMvc.perform(get("/tags").param("keyword", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mockMvc.perform(get("/articles").param("tagId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("TC-08 搜索纠错：错别字关键词返回建议词")
    void searchSuggestion() throws Exception {
        when(articleService.listPublishedArticles(any()))
                .thenReturn(Result.ok(List.of("接口联调测试复盘"), 1L, "联调测试"));

        mockMvc.perform(get("/articles").param("keyword", "联调厕试"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestion").value("联调测试"));
    }

    @Test
    @DisplayName("TC-09 私信会话：联系人、历史消息和发送接口可用")
    void privateMessageConversation() throws Exception {
        when(messageService.send(USER_ID, 2L, "你好")).thenReturn(Map.of("success", true, "msg", "发送成功"));
        when(messageService.page(eq(USER_ID), anyInt(), anyInt())).thenReturn(new Page<>(1, 10));
        when(messageService.conversation(eq(USER_ID), eq(2L), anyInt(), anyInt())).thenReturn(new Page<>(1, 50));

        mockMvc.perform(post("/messages/send")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .param("receiverId", "2")
                        .param("content", "你好"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/messages/page").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/messages/conversation/2").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("TC-10 对象存储上传：头像或封面上传后返回可访问地址")
    void ossUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "fake-image".getBytes()
        );
        when(fileUploadService.uploadImage(eq("avatar"), eq(USER_ID), any()))
                .thenReturn(new UploadedFileVO("avatar/1.png", "https://oss.example/avatar/1.png"));

        mockMvc.perform(multipart("/files/upload")
                        .file(file)
                        .param("scene", "avatar")
                        .header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.url").value("https://oss.example/avatar/1.png"));
    }

    @Test
    @DisplayName("TC-11 管理员后台：管理员可访问内容、栏目、用户管理")
    void adminConsole() throws Exception {
        when(articleService.listAdminArticles(any())).thenReturn(Result.ok(List.of("文章"), 1L));
        when(categoryService.listCategories()).thenReturn(Result.ok(List.of("栏目")));
        when(usersService.listAdminUsers(any())).thenReturn(Result.ok(List.of("用户"), 1L));

        mockMvc.perform(get("/admin/articles").header("Authorization", bearerToken(ADMIN_ID, 1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mockMvc.perform(get("/admin/categories").header("Authorization", bearerToken(ADMIN_ID, 1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mockMvc.perform(get("/admin/users").header("Authorization", bearerToken(ADMIN_ID, 1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("TC-12 局域网访问：跨来源公开接口可正常响应")
    void lanAccessPublicApi() throws Exception {
        when(articleService.listPublishedArticles(any())).thenReturn(Result.ok(List.of("article"), 1L));

        mockMvc.perform(get("/articles")
                        .header("Origin", "http://192.168.1.10:3001")
                        .header("Host", "192.168.1.20:8080"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("未登录访问受保护接口会返回 401")
    void protectedApiRequiresLogin() throws Exception {
        mockMvc.perform(get("/users/profile"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("401")));
    }

    @Test
    @DisplayName("非管理员访问后台接口会返回 403")
    void adminApiRequiresAdminRole() throws Exception {
        mockMvc.perform(get("/admin/articles").header("Authorization", bearerToken(USER_ID, 0)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("403")));
    }

    @Test
    @DisplayName("私信批量已读和删除接口转发当前登录用户")
    void privateMessageBatchActionsUseCurrentUser() throws Exception {
        when(messageService.batchRead(anyList(), eq(USER_ID))).thenReturn(true);
        when(messageService.batchDelete(anyList(), eq(USER_ID))).thenReturn(true);

        mockMvc.perform(post("/messages/batch-read")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[1,2]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mockMvc.perform(post("/messages/batch-delete")
                        .header("Authorization", bearerToken(USER_ID, 0))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[1]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(messageService).batchRead(List.of(1L, 2L), USER_ID);
        verify(messageService).batchDelete(List.of(1L), USER_ID);
    }

    private static String bearerToken(Long userId, Integer role) {
        return "Bearer " + JwtUtil.generateToken(userId, role);
    }
}
