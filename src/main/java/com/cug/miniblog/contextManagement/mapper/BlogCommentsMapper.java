package com.cug.miniblog.contextManagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cug.miniblog.contextManagement.entity.BlogComment;
import org.apache.ibatis.annotations.Mapper;

/**
 * comments mapper接口
 *
 *
 * **/
@Mapper
public interface BlogCommentsMapper extends BaseMapper<BlogComment> {


}
