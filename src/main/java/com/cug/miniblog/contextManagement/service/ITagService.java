package com.cug.miniblog.contextManagement.service;

import com.cug.miniblog.contextManagement.dto.CreateTagDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateTagDTO;

/**
 * 标签服务接口
 */
public interface ITagService {

    /**
     * 标签列表（分页）
     */
    Result listTags(Long current, Long size, String keyword);

    /**
     * 标签详情
     */
    Result getTag(Long tagId);

    /**
     * 新建标签
     */
    Result createTag(CreateTagDTO createTagDTO);

    /**
     * 修改标签
     */
    Result updateTag(Long tagId, UpdateTagDTO updateTagDTO);

    /**
     * 删除标签
     */
    Result deleteTag(Long tagId);
}
