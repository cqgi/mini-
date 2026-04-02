package com.cug.miniblog.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_tag")
public class Tag implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "tag_id", type = IdType.AUTO)
    private Long tagId;

    private String tagName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic(value = "0", delval = "1")
    private Integer isDeleted;
}
