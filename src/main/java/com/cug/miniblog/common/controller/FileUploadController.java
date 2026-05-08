package com.cug.miniblog.common.controller;

import com.cug.miniblog.common.service.FileUploadService;
import com.cug.miniblog.contextManagement.dto.Result;
import com.cug.miniblog.personalCenter.utils.UserContext;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result uploadImage(@RequestParam("scene") String scene, @RequestParam("file") MultipartFile file) {
        try {
            return Result.ok(fileUploadService.uploadImage(scene, UserContext.getUserId(), file));
        } catch (IllegalArgumentException exception) {
            return Result.fail(exception.getMessage());
        } catch (IllegalStateException exception) {
            return Result.fail(exception.getMessage());
        }
    }
}
