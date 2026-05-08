package com.cug.miniblog.common.service;

import com.cug.miniblog.common.vo.UploadedFileVO;
import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    UploadedFileVO uploadImage(String scene, Long userId, MultipartFile file);
}
