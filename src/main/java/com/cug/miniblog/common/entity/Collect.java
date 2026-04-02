package com.cug.miniblog.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_collect")
public class Collect implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "collect_id", type = IdType.AUTO)
    private Long collectId;

    private Long userId;

    private Long articleId;

    private LocalDateTime createTime;

    @TableLogic(value = "0", delval = "1")
    private Integer isDeleted;
}
