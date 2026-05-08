package com.cug.miniblog.personalCenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.Collect;
import com.cug.miniblog.common.entity.Comment;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.personalCenter.mapper.ArticleMapper;
import com.cug.miniblog.personalCenter.mapper.CollectMapper;
import com.cug.miniblog.personalCenter.mapper.CommentMapper;
import com.cug.miniblog.personalCenter.mapper.UserMapper;
import com.cug.miniblog.personalCenter.dto.AdminUserQueryDTO;
import com.cug.miniblog.personalCenter.dto.UpdateUserRoleDTO;
import com.cug.miniblog.personalCenter.service.UsersService;
import com.cug.miniblog.personalCenter.vo.AdminUserVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsersServiceImpl implements UsersService {
    @Resource
    private UserMapper userMapper;
    @Resource
    private ArticleMapper articleMapper;
    @Resource
    private CollectMapper collectMapper;
    @Resource
    private CommentMapper commentMapper;
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
        if(!bio.matches(BIO_PATTERN)){
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

    @Override
    public Result listAdminUsers(AdminUserQueryDTO adminUserQueryDTO) {
        AdminUserQueryDTO queryDTO = normalizeAdminUserQuery(adminUserQueryDTO);
        Page<User> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        QueryWrapper<User> wrapper = new QueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            String keyword = queryDTO.getKeyword().trim();
            wrapper.and(w -> w.like("username", keyword)
                    .or()
                    .like("nickname", keyword)
                    .or()
                    .like("email", keyword));
        }
        if (queryDTO.getRole() != null) {
            wrapper.eq("role", queryDTO.getRole());
        }
        wrapper.orderByDesc("create_time");

        Page<User> userPage = userMapper.selectPage(page, wrapper);
        List<AdminUserVO> records = buildAdminUserList(userPage.getRecords());
        return Result.ok(records, userPage.getTotal());
    }

    @Override
    public Result getAdminUser(Long userId) {
        if (userId == null) {
            return Result.fail("用户ID不能为空");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        return Result.ok(buildAdminUserVO(user));
    }

    @Override
    public Result updateAdminUserRole(Long userId, UpdateUserRoleDTO updateUserRoleDTO, Long operatorUserId) {
        if (userId == null) {
            return Result.fail("用户ID不能为空");
        }
        if (operatorUserId == null) {
            return Result.fail(401, "请先登录");
        }
        Integer role = updateUserRoleDTO == null ? null : updateUserRoleDTO.getRole();
        if (role == null || (role != 0 && role != 1)) {
            return Result.fail("角色只能是0或1");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        if (operatorUserId.equals(userId) && role == 0) {
            return Result.fail("你当前使用的就是管理员账号，不能降级自己");
        }

        User updateUser = new User();
        updateUser.setUserId(userId);
        updateUser.setRole(role);
        updateUser.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(updateUser);
        return Result.ok("用户角色更新成功", userId);
    }

    @Override
    public Result deleteAdminUser(Long userId, Long operatorUserId) {
        if (userId == null) {
            return Result.fail("用户ID不能为空");
        }
        if (operatorUserId == null) {
            return Result.fail(401, "请先登录");
        }
        if (operatorUserId.equals(userId)) {
            return Result.fail("不能删除当前登录管理员");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }

        userMapper.deleteById(userId);
        return Result.ok("用户删除成功", userId);
    }

    @Override
    public boolean collectArticle(Long userId, Long articleId) {
        if (userId == null || articleId == null) {
            return false;
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return false;
        }
        Collect existCollect = collectMapper.selectIncludingDeleted(userId, articleId);
        if (existCollect == null) {
            Collect collect = new Collect();
            collect.setUserId(userId);
            collect.setArticleId(articleId);
            collect.setCreateTime(LocalDateTime.now());
            return collectMapper.insert(collect) > 0;
        }
        if (Integer.valueOf(0).equals(existCollect.getIsDeleted())) {
            return true;
        }
        return collectMapper.restoreDeletedById(existCollect.getCollectId()) > 0;
    }

    @Override
    public boolean cancelCollect(Long userId, Long articleId) {
        if (userId == null || articleId == null) {
            return false;
        }
        LambdaQueryWrapper<Collect> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collect::getUserId, userId)
                .eq(Collect::getArticleId, articleId);
        return collectMapper.delete(queryWrapper) > 0;
    }

    @Override
    public List<Long> getFavorites(Long userId) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Collect> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collect::getUserId, userId)
                .select(Collect::getArticleId);
        List<Collect> collects = collectMapper.selectList(queryWrapper);
        return collects.stream()
                .map(Collect::getArticleId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getMyComments(Long userId) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Comment> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Comment::getUserId, userId)
                .select(Comment::getCommentId);
        List<Comment> comments = commentMapper.selectList(queryWrapper);
        return comments.stream()
                .map(Comment::getCommentId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getMyArticles(Long userId, String status) {
        if (userId == null) {
            return null;
        }
        LambdaQueryWrapper<Article> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Article::getUserId, userId);
        if (status != null && !status.isEmpty()) {
            Integer statusValue = getStatusValue(status);
            if (statusValue != null) {
                queryWrapper.eq(Article::getStatus, statusValue);
            }
        }
        queryWrapper.select(Article::getArticleId);
        List<Article> articles = articleMapper.selectList(queryWrapper);
        return articles.stream()
                .map(Article::getArticleId)
                .collect(Collectors.toList());
    }

    private Integer getStatusValue(String status) {
        switch (status.toLowerCase()) {
            case "draft":
                return 0;
            case "pending":
                return 1;
            case "published":
                return 2;
            case "failed":
                return 3;
            default:
                return null;
        }
    }

    private AdminUserQueryDTO normalizeAdminUserQuery(AdminUserQueryDTO adminUserQueryDTO) {
        AdminUserQueryDTO queryDTO = adminUserQueryDTO == null ? new AdminUserQueryDTO() : adminUserQueryDTO;
        if (queryDTO.getCurrent() == null || queryDTO.getCurrent() < 1) {
            queryDTO.setCurrent(1L);
        }
        if (queryDTO.getSize() == null || queryDTO.getSize() < 1) {
            queryDTO.setSize(10L);
        }
        if (queryDTO.getRole() != null && queryDTO.getRole() != 0 && queryDTO.getRole() != 1) {
            queryDTO.setRole(null);
        }
        return queryDTO;
    }

    private List<AdminUserVO> buildAdminUserList(List<User> users) {
        if (users == null || users.isEmpty()) {
            return Collections.emptyList();
        }
        return users.stream()
                .map(this::buildAdminUserVO)
                .collect(Collectors.toList());
    }

    private AdminUserVO buildAdminUserVO(User user) {
        AdminUserVO adminUserVO = new AdminUserVO();
        adminUserVO.setUserId(user.getUserId());
        adminUserVO.setUsername(user.getUsername());
        adminUserVO.setNickname(user.getNickname());
        adminUserVO.setEmail(user.getEmail());
        adminUserVO.setAvatar(user.getAvatar());
        adminUserVO.setBio(user.getBio());
        adminUserVO.setRole(user.getRole());
        adminUserVO.setCreateTime(user.getCreateTime());
        adminUserVO.setUpdateTime(user.getUpdateTime());
        return adminUserVO;
    }
}
