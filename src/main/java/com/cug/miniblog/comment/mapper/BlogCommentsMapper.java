package com.cug.miniblog.comment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.comment.entity.BlogComment;
import org.apache.ibatis.annotations.Mapper;

/**
 * comments mapper接口
 *
 *
 * **/
@Mapper
public interface BlogCommentsMapper extends BaseMapper<BlogComment> {


}
