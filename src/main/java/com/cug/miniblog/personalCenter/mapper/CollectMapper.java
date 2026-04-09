package com.cug.miniblog.personalCenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.common.entity.Collect;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface CollectMapper extends BaseMapper<Collect> {
    @Select("""
            SELECT collect_id, user_id, article_id, create_time, is_deleted
            FROM t_collect
            WHERE user_id = #{userId} AND article_id = #{articleId}
            LIMIT 1
            """)
    Collect selectIncludingDeleted(@Param("userId") Long userId, @Param("articleId") Long articleId);

    @Update("""
            UPDATE t_collect
            SET is_deleted = 0
            WHERE collect_id = #{collectId} AND is_deleted = 1
            """)
    int restoreDeletedById(@Param("collectId") Long collectId);
}
