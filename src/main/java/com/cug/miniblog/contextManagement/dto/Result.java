package com.cug.miniblog.contextManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Result implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 业务状态码：200=成功，400=失败
     */
    private Integer code;

    /**
     * 是否成功，便于前端快速判断
     */
    private Boolean success;

    /**
     * 通用响应消息
     */
    private String message;

    /**
     * 兼容旧字段：失败提示信息
     */
    private String errorMsg;

    /**
     * 响应数据
     */
    private Object data;

    /**
     * 列表总数，分页场景使用
     */
    private Long total;
@Override
public String toString() {
    return "Result{" +
            "success=" + success +
            ", errorMsg='" + errorMsg + '\'' +
            ", data=" + data +
            ", total=" + total +
            '}';
}

    public static final int SUCCESS_CODE = 200;
    public static final int FAIL_CODE = 400;

    public static final int SUCCESS_CODE = 200;
    public static final int FAIL_CODE = 400;

    public static Result ok(){
        return Result.builder()
                .code(SUCCESS_CODE)
                .success(true)
                .message("success")
                .errorMsg(null)
                .data(null)
                .total(null)
                .build();
    }

    public static Result ok(Object data){
        return Result.builder()
                .code(SUCCESS_CODE)
                .success(true)
                .message("success")
                .errorMsg(null)
                .data(data)
                .total(null)
                .build();
    }

    public static Result ok(List<?> data, Long total){
        return Result.builder()
                .code(SUCCESS_CODE)
                .success(true)
                .message("success")
                .errorMsg(null)
                .data(data)
                .total(total)
                .build();
    }

    public static Result ok(String message, Object data) {
        return Result.builder()
                .code(SUCCESS_CODE)
                .success(true)
                .message(message)
                .errorMsg(null)
                .data(data)
                .total(null)
                .build();
    }

    public static Result fail(String errorMsg){
        return Result.builder()
                .code(FAIL_CODE)
                .success(false)
                .message(errorMsg)
                .errorMsg(errorMsg)
                .data(null)
                .total(null)
                .build();
    }

    public static Result fail(Integer code, String errorMsg) {
        return Result.builder()
                .code(code)
                .success(false)
                .message(errorMsg)
                .errorMsg(errorMsg)
                .data(null)
                .total(null)
                .build();
    }
}
