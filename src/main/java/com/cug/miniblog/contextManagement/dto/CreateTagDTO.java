package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

/**
 * 创建标签请求参数
 */
@Data
public class CreateTagDTO {

    /**
     * 标签名称
     */
    private String tagName;
}
