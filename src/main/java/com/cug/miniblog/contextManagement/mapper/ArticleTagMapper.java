package com.cug.miniblog.contextManagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.common.entity.ArticleTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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

    /**
     * 根据文章 ID 查询标签详情。
     */
    @Select({
            "<script>",
            "SELECT at.article_id AS articleId, t.tag_id AS tagId, t.tag_name AS tagName ",
            "FROM t_article_tag at ",
            "JOIN t_tag t ON at.tag_id = t.tag_id ",
            "WHERE at.is_deleted = 0 AND t.is_deleted = 0 ",
            "AND at.article_id IN ",
            "<foreach collection='articleIds' item='articleId' open='(' separator=',' close=')'>",
            "#{articleId}",
            "</foreach>",
            "</script>"
    })
    List<ArticleTagQueryRow> selectTagsByArticleIds(@Param("articleIds") List<Long> articleIds);

    /**
     * 文章标签查询行对象
     */
    class ArticleTagQueryRow {
        private Long articleId;
        private Long tagId;
        private String tagName;

        public Long getArticleId() {
            return articleId;
        }

        public void setArticleId(Long articleId) {
            this.articleId = articleId;
        }

        public Long getTagId() {
            return tagId;
        }

        public void setTagId(Long tagId) {
            this.tagId = tagId;
        }

        public String getTagName() {
            return tagName;
        }

        public void setTagName(String tagName) {
            this.tagName = tagName;
        }
    }
}
