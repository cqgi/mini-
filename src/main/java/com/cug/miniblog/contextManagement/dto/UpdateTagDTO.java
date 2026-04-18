package com.cug.miniblog.contextManagement.dto;

import lombok.Data;

/**
 * 更新标签请求参数
 */
@Data
public class UpdateTagDTO {

    /**
     * 标签名称
     */
    private String tagName;
}
