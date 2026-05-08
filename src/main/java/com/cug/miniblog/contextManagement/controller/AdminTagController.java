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
 * 后台标签管理接口
 */
@RestController
@RequestMapping("/admin/tags")
public class AdminTagController {

    @Resource
    private ITagService tagService;

    /**
     * 后台标签列表
     */
    @GetMapping
    public Result listAdminTags(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String keyword
    ) {
        return tagService.listTags(current, size, keyword);
    }

    /**
     * 后台标签详情
     */
    @GetMapping("/{tagId}")
    public Result getAdminTag(@PathVariable("tagId") Long tagId) {
        return tagService.getTag(tagId);
    }

    /**
     * 后台创建标签
     */
    @PostMapping
    public Result createAdminTag(@RequestBody CreateTagDTO createTagDTO) {
        return tagService.createTag(createTagDTO);
    }

    /**
     * 后台修改标签
     */
    @PutMapping("/{tagId}")
    public Result updateAdminTag(@PathVariable("tagId") Long tagId, @RequestBody UpdateTagDTO updateTagDTO) {
        return tagService.updateTag(tagId, updateTagDTO);
    }

    /**
     * 后台删除标签
     */
    @DeleteMapping("/{tagId}")
    public Result deleteAdminTag(@PathVariable("tagId") Long tagId) {
        return tagService.deleteTag(tagId);
    }
}
