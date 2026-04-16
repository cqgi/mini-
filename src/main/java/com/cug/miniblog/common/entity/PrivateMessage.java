package com.cug.miniblog.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("private_message")
public class PrivateMessage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long senderId;      // 发送者ID
    private Long receiverId;    // 接收者ID
    private String content;     // 内容
    private LocalDateTime sendTime; // 发送时间
    private Integer isRead;     // 0未读 1已读
    private Integer deleted;    // 0未删 1已删
}
