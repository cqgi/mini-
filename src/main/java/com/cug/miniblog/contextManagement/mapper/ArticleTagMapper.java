package com.cug.miniblog.contextManagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.common.entity.ArticleTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文章标签关联 Mapper
 */
@Mapper
public interface ArticleTagMapper extends BaseMapper<ArticleTag> {

    /**
     * 根据文章 ID 物理删除旧标签关联。
     * 这里使用物理删除而不是逻辑删除，避免被联合唯一索引(article_id, tag_id)拦住后续重新绑定。
     */
    @Delete("DELETE FROM t_article_tag WHERE article_id = #{articleId}")
    int deleteByArticleId(@Param("articleId") Long articleId);

    /**
     * 批量插入文章标签关联。
     */
    @Insert({
            "<script>",
            "INSERT INTO t_article_tag (article_id, tag_id, is_deleted) VALUES ",
            "<foreach collection='articleTags' item='item' separator=','>",
            "(#{item.articleId}, #{item.tagId}, #{item.isDeleted})",
            "</foreach>",
            "</script>"
    })
    int insertBatch(@Param("articleTags") List<ArticleTag> articleTags);
}
