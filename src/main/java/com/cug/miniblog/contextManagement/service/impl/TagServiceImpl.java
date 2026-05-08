package com.cug.miniblog.contextManagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cug.miniblog.common.entity.ArticleTag;
import com.cug.miniblog.common.entity.Tag;
import com.cug.miniblog.contextManagement.dto.CreateTagDTO;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.contextManagement.dto.UpdateTagDTO;
import com.cug.miniblog.contextManagement.mapper.ArticleTagMapper;
import com.cug.miniblog.contextManagement.mapper.TagMapper;
import com.cug.miniblog.contextManagement.service.ITagService;
import com.cug.miniblog.contextManagement.vo.TagListVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 标签服务实现类
 */
@Service
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag> implements ITagService {

    @Resource
    private TagMapper tagMapper;

    @Resource
    private ArticleTagMapper articleTagMapper;

    @Override
    public Result listTags(Long current, Long size, String keyword) {
        long normalizedCurrent = normalizePositiveLong(current, 1L);
        long normalizedSize = normalizePositiveLong(size, 10L);
        Page<Tag> page = new Page<>(normalizedCurrent, normalizedSize);
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Tag::getTagName, keyword.trim());
        }
        wrapper.orderByAsc(Tag::getCreateTime).orderByAsc(Tag::getTagId);

        Page<Tag> tagPage = tagMapper.selectPage(page, wrapper);
        List<TagListVO> records = buildTagList(tagPage.getRecords());
        return Result.ok(records, tagPage.getTotal());
    }

    @Override
    public Result getTag(Long tagId) {
        if (tagId == null) {
            return Result.fail("标签ID不能为空");
        }

        Tag tag = tagMapper.selectById(tagId);
        if (tag == null) {
            return Result.fail("标签不存在");
        }
        return Result.ok(tag);
    }

    @Override
    public Result createTag(CreateTagDTO createTagDTO) {
        Result validateResult = validateTagName(createTagDTO == null ? null : createTagDTO.getTagName());
        if (validateResult != null) {
            return validateResult;
        }

        String tagName = createTagDTO.getTagName().trim();
        Result duplicateResult = validateTagNameExists(tagName, null);
        if (duplicateResult != null) {
            return duplicateResult;
        }

        Tag tag = new Tag();
        tag.setTagName(tagName);
        tag.setIsDeleted(0);
        tag.setCreateTime(LocalDateTime.now());
        tag.setUpdateTime(LocalDateTime.now());
        tagMapper.insert(tag);

        return Result.ok("标签创建成功", tag.getTagId());
    }

    @Override
    public Result updateTag(Long tagId, UpdateTagDTO updateTagDTO) {
        if (tagId == null) {
            return Result.fail("标签ID不能为空");
        }

        Result validateResult = validateTagName(updateTagDTO == null ? null : updateTagDTO.getTagName());
        if (validateResult != null) {
            return validateResult;
        }

        Tag existedTag = tagMapper.selectById(tagId);
        if (existedTag == null) {
            return Result.fail("标签不存在");
        }

        String tagName = updateTagDTO.getTagName().trim();
        if (!tagName.equals(existedTag.getTagName())) {
            Result duplicateResult = validateTagNameExists(tagName, tagId);
            if (duplicateResult != null) {
                return duplicateResult;
            }
        }

        Tag tag = new Tag();
        tag.setTagId(tagId);
        tag.setTagName(tagName);
        tag.setUpdateTime(LocalDateTime.now());
        tagMapper.updateById(tag);

        return Result.ok("标签更新成功", tagId);
    }

    @Override
    public Result deleteTag(Long tagId) {
        if (tagId == null) {
            return Result.fail("标签ID不能为空");
        }

        Tag tag = tagMapper.selectById(tagId);
        if (tag == null) {
            return Result.fail("标签不存在");
        }

        LambdaQueryWrapper<ArticleTag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ArticleTag::getTagId, tagId);
        Long articleTagCount = articleTagMapper.selectCount(wrapper);
        if (articleTagCount != null && articleTagCount > 0) {
            return Result.fail("当前标签下仍有关联文章，无法删除");
        }

        tagMapper.deleteById(tagId);
        return Result.ok("标签删除成功", tagId);
    }

    private Result validateTagName(String tagName) {
        if (!StringUtils.hasText(tagName)) {
            return Result.fail("标签名称不能为空");
        }
        return null;
    }

    private Result validateTagNameExists(String tagName, Long ignoreTagId) {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tag::getTagName, tagName);
        if (ignoreTagId != null) {
            wrapper.ne(Tag::getTagId, ignoreTagId);
        }

        Long count = tagMapper.selectCount(wrapper);
        if (count != null && count > 0) {
            return Result.fail("标签名称已存在");
        }
        return null;
    }

    private long normalizePositiveLong(Long value, long defaultValue) {
        return value == null || value < 1 ? defaultValue : value;
    }

    private List<TagListVO> buildTagList(List<Tag> tags) {
        if (CollectionUtils.isEmpty(tags)) {
            return Collections.emptyList();
        }

        List<Long> tagIds = tags.stream().map(Tag::getTagId).toList();
        Map<Long, Long> articleCountMap = articleTagMapper.selectPublishedArticleCountsByTagIds(tagIds)
                .stream()
                .collect(Collectors.toMap(
                        ArticleTagMapper.TagArticleCountRow::getTagId,
                        ArticleTagMapper.TagArticleCountRow::getArticleCount
                ));

        return tags.stream()
                .map(tag -> {
                    TagListVO tagListVO = new TagListVO();
                    tagListVO.setTagId(tag.getTagId());
                    tagListVO.setTagName(tag.getTagName());
                    tagListVO.setCreateTime(tag.getCreateTime());
                    tagListVO.setUpdateTime(tag.getUpdateTime());
                    tagListVO.setArticleCount(articleCountMap.getOrDefault(tag.getTagId(), 0L));
                    return tagListVO;
                })
                .sorted((left, right) -> {
                    int compareCount = Long.compare(right.getArticleCount(), left.getArticleCount());
                    if (compareCount != 0) {
                        return compareCount;
                    }
                    return left.getTagName().compareToIgnoreCase(right.getTagName());
                })
                .toList();
    }
}
