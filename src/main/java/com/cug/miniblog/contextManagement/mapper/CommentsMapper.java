package com.cug.miniblog.contextManagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.common.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

/**
 * comments mapper接口
 *
 *
 * **/
@Mapper
public interface CommentsMapper extends BaseMapper<Comment> {


}
