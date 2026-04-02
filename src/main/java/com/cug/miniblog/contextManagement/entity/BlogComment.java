package com.cug.miniblog.contextManagement.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
@TableName("t_comment")
public class BlogComment implements Serializable {
    private static final long serialVersionUID = 1L;
@Override
public String toString() {
    return "BlogComment{" +
            "commentId=" + commentId +
            ", userId=" + userId +
            ", articleId=" + articleId +
            ", parentId=" + parentId +
            ", content='" + content + '\'' +
            ", liked=" + liked +
            ", isDeleted=" + isDeleted +
            ", createTime=" + createTime +
            ", updateTime=" + updateTime +
            '}';
}
    public Long getArticleId() {
        return articleId;
    }

    public void setArticleId(Long articleId) {
        this.articleId = articleId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Integer getLiked() {
        return liked;
    }

    public void setLiked(Integer liked) {
        this.liked = liked;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * 主键
     */
    private Long commentId;

    /**
     * 用户id
     */
    private Long userId;
   /**
     *  关联文章id
     * **/
    private Long articleId;

    /**
     * 关联的1级评论id，如果是一级评论，则值为0
     */
    private Long parentId;


    /**
     * 回复的内容
     */
    private String content;

    /**
     * 点赞数
     */
    private Integer liked;

    /**
     * 状态，0：正常，1：被删除
     */
    private Boolean isDeleted;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

}
