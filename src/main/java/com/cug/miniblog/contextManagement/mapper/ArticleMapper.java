package com.cug.miniblog.contextManagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.common.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * 文章 Mapper
 */
@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    /**
     * 增加文章浏览量
     */
    @Update("UPDATE t_article SET view_count = view_count + 1 WHERE article_id = #{articleId} AND is_deleted = 0")
    int updateViewCount(@Param("articleId") Long articleId);
}
