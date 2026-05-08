package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cug.miniblog.common.entity.Article;
import com.cug.miniblog.common.entity.Comment;
import com.cug.miniblog.common.entity.User;
import com.cug.miniblog.contextManagement.dto.CommentQueryDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.mapper.CommentsMapper;
import com.cug.miniblog.contextManagement.mapper.ContextArticleMapper;
import com.cug.miniblog.contextManagement.mapper.ContextUserMapper;
import com.cug.miniblog.contextManagement.service.ICommentsService;
import com.cug.miniblog.contextManagement.vo.AdminCommentVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CommentsServiceImpl extends ServiceImpl<CommentsMapper, Comment> implements ICommentsService {
    @Resource
    CommentsMapper CommentsMapper;
    @Resource(name = "contextArticleMapper")
    private ContextArticleMapper articleMapper;
    @Resource(name = "contextUserMapper")
    private ContextUserMapper userMapper;
    /**
     * 发表评论
     * @param content 评论内容
     * @param userId 用户id
     * @param parentId 父评论id
     * @param articleId 文章id
     * @return 评论结果
     */
    @Override
    public Result postComment(String content, Long userId,Long parentId,Long articleId) {

        if(content==null){return  Result.fail("评论内容不能为空");}
        Comment comment=new Comment();
        comment.setUserId(userId);
        comment.setParentId(parentId==0?null:parentId);
        comment.setArticleId(articleId);
        comment.setContent(content);
        //comment.setLiked(0);
        comment.setIsDeleted(0);
        comment.setCreateTime(LocalDateTime.now());
        CommentsMapper.insert(comment);
        return Result.ok("评论成功");
    }
    /**
     * 获取评论列表
     * @param articleId 文章id
     * @return 评论列表
     */
    @Override
    public List<Comment> getTopCommentList(Long articleId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        // 条件：指定文章 + 一级评论
        wrapper.eq(Comment::getArticleId, articleId)
                .isNull(Comment::getParentId)
                .eq(Comment::getIsDeleted,false)
                // 排序：点赞数最多的评论在前
               // .orderByDesc(Comment::getLiked)
                // 排序：点赞数相同最新评论在前
                .orderByDesc(Comment::getCreateTime);

        return CommentsMapper.selectList(wrapper);
    }
    /**
     * 获取评论树列表
     * @param articleId 文章id
     * @return 评论树列表
     */
    @Override
     public  HashMap<Long,List<Comment>>getCommentHashList(Long articleId) {
        HashMap<Long,List<Comment>> commentMap=new HashMap<>();
        for(Comment comment:getTopCommentList(articleId)){
            getCommentListByParentId(comment.getCommentId(),commentMap);
        }

        return commentMap;
    }
    /**
     * 点赞评论
     * @param commentId 评论id
     * @return 点赞结果
     */
   @Override
    public Result likeComment(Long commentId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getCommentId, commentId)
                .eq(Comment::getIsDeleted, false);
        Comment comment = CommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.fail("评论不存在");
        }
        return Result.fail("当前数据库未配置评论点赞字段");
    }
    /**
     * 删除评论
     * @param commentId 评论id
     * @param userId 用户id
     * @return 删除结果
     */
    @Override
    public Result deleteComment(Long commentId, Long userId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getCommentId, commentId)
                .eq(Comment::getUserId, userId)
                .eq(Comment::getIsDeleted, false);
        Comment comment = CommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.ok("评论不存在");
        }
        comment.setIsDeleted(1);
        CommentsMapper.update(comment,wrapper);
        return Result.ok("评论删除成功");
    }

    @Override
    public Result listAdminComments(CommentQueryDTO commentQueryDTO) {
        CommentQueryDTO queryDTO = normalizeQuery(commentQueryDTO);
        String keyword = StringUtils.hasText(queryDTO.getKeyword()) ? queryDTO.getKeyword().trim() : null;

        Page<Comment> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(queryDTO.getArticleId() != null, Comment::getArticleId, queryDTO.getArticleId())
                .eq(queryDTO.getUserId() != null, Comment::getUserId, queryDTO.getUserId())
                .like(StringUtils.hasText(keyword), Comment::getContent, keyword)
                .orderByDesc(Comment::getCreateTime);

        Page<Comment> commentPage = CommentsMapper.selectPage(page, wrapper);
        return Result.ok(buildAdminCommentList(commentPage.getRecords()), commentPage.getTotal());
    }

    @Override
    public Result deleteAdminComment(Long commentId) {
        if (commentId == null) {
            return Result.fail("评论ID不能为空");
        }

        Comment dbComment = CommentsMapper.selectById(commentId);
        if (dbComment == null) {
            return Result.fail("评论不存在");
        }

        CommentsMapper.deleteById(commentId);
        return Result.ok("评论删除成功", commentId);
    }

    /**
    * 回复评论
    * @param commentId 回复的评论id
    * @param content 回复内容
    * @param userId 用户id
     * @return 回复结果
     */
    @Override
    public Result replyComment(Long commentId, String content, Long commentUserId,Long userId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getCommentId, commentId)
                .eq(Comment::getUserId, commentUserId)
                .eq(Comment::getIsDeleted, false);
        Comment comment = CommentsMapper.selectOne(wrapper);
        if (comment == null) {
            return Result.fail("回复的评论不存在");
        }
        Comment replyComment=new Comment();
        replyComment.setParentId(commentId);
        replyComment.setUserId(userId);
        replyComment.setArticleId(comment.getArticleId());
        replyComment.setContent(content);
        replyComment.setIsDeleted(0);
        replyComment.setCreateTime(LocalDateTime.now());
        CommentsMapper.insert(replyComment);
        return Result.ok("回复成功");
    }
    /**
     * 递归获取评论子回复列表
     * @param parentId 父评论id
     * @param commentMap 评论映射
     * @return 评论映射
     *
     */
private HashMap<Long,List<Comment>> getCommentListByParentId(Long parentId,HashMap<Long,List<Comment>> commentMap) {
        if(parentId==null){return  null;}
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getParentId, parentId)
                .eq(Comment::getIsDeleted, 0);
        List<Comment> commentList = CommentsMapper.selectList(wrapper);
        commentMap.put(parentId,commentList);
        for (Comment comment : commentList) {
            getCommentListByParentId(comment.getCommentId(), commentMap);
        }
        return commentMap;
    }

    private CommentQueryDTO normalizeQuery(CommentQueryDTO commentQueryDTO) {
        CommentQueryDTO queryDTO = commentQueryDTO == null ? new CommentQueryDTO() : commentQueryDTO;
        if (queryDTO.getCurrent() == null || queryDTO.getCurrent() < 1) {
            queryDTO.setCurrent(1L);
        }
        if (queryDTO.getSize() == null || queryDTO.getSize() < 1) {
            queryDTO.setSize(10L);
        }
        if (queryDTO.getArticleId() != null && queryDTO.getArticleId() < 1) {
            queryDTO.setArticleId(null);
        }
        if (queryDTO.getUserId() != null && queryDTO.getUserId() < 1) {
            queryDTO.setUserId(null);
        }
        return queryDTO;
    }

    private List<AdminCommentVO> buildAdminCommentList(List<Comment> comments) {
        if (comments == null || comments.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, Article> articleMap = queryArticleMap(comments);
        Map<Long, User> userMap = queryUserMap(comments);
        return comments.stream().map(comment -> {
            AdminCommentVO adminCommentVO = new AdminCommentVO();
            adminCommentVO.setCommentId(comment.getCommentId());
            adminCommentVO.setArticleId(comment.getArticleId());
            adminCommentVO.setUserId(comment.getUserId());
            adminCommentVO.setParentId(comment.getParentId());
            adminCommentVO.setContent(comment.getContent());
            adminCommentVO.setCreateTime(comment.getCreateTime());
            adminCommentVO.setUpdateTime(comment.getUpdateTime());

            Article article = articleMap.get(comment.getArticleId());
            if (article != null) {
                adminCommentVO.setArticleTitle(article.getTitle());
            }

            User user = userMap.get(comment.getUserId());
            if (user != null) {
                adminCommentVO.setUserNickname(user.getNickname());
            }
            return adminCommentVO;
        }).toList();
    }

    private Map<Long, Article> queryArticleMap(List<Comment> comments) {
        Set<Long> articleIds = comments.stream()
                .map(Comment::getArticleId)
                .filter(articleId -> articleId != null)
                .collect(Collectors.toSet());
        if (articleIds.isEmpty()) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Article::getArticleId, articleIds)
                .select(Article::getArticleId, Article::getTitle);
        return articleMapper.selectList(wrapper).stream()
                .collect(Collectors.toMap(Article::getArticleId, article -> article));
    }

    private Map<Long, User> queryUserMap(List<Comment> comments) {
        Set<Long> userIds = comments.stream()
                .map(Comment::getUserId)
                .filter(userId -> userId != null)
                .collect(Collectors.toSet());
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(User::getUserId, userIds)
                .select(User::getUserId, User::getNickname);
        return userMapper.selectList(wrapper).stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));
    }
}
