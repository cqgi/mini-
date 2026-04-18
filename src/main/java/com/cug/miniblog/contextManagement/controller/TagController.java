package com.cug.miniblog.contextManagement.controller;

import com.cug.miniblog.contextManagement.dto.CreateTagDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateTagDTO;
import com.cug.miniblog.contextManagement.service.ITagService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 标签管理接口
 */
@RestController
@RequestMapping("/tags")
public class TagController {

    @Resource
    private ITagService tagService;

    /**
     * 标签列表（分页）
     */
    @GetMapping
    public Result listTags(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String keyword
    ) {
        return tagService.listTags(current, size, keyword);
    }

    /**
     * 标签详情
     */
    @GetMapping("/{tagId}")
    public Result getTag(@PathVariable("tagId") Long tagId) {
        return tagService.getTag(tagId);
    }

    /**
     * 创建标签
     */
    @PostMapping
    public Result createTag(@RequestBody CreateTagDTO createTagDTO) {
        return tagService.createTag(createTagDTO);
    }

    /**
     * 修改标签
     */
    @PutMapping("/{tagId}")
    public Result updateTag(@PathVariable("tagId") Long tagId, @RequestBody UpdateTagDTO updateTagDTO) {
        return tagService.updateTag(tagId, updateTagDTO);
    }

    /**
     * 删除标签
     */
    @DeleteMapping("/{tagId}")
    public Result deleteTag(@PathVariable("tagId") Long tagId) {
        return tagService.deleteTag(tagId);
    }
}
