package com.cug.miniblog.common.service.impl;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectRequest;
import com.cug.miniblog.common.config.OssProperties;
import com.cug.miniblog.common.service.FileUploadService;
import com.cug.miniblog.common.vo.UploadedFileVO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class AliyunOssFileUploadServiceImpl implements FileUploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );
    private static final long MAX_AVATAR_SIZE = 2L * 1024 * 1024;
    private static final long MAX_COVER_SIZE = 5L * 1024 * 1024;

    private final OssProperties ossProperties;

    public AliyunOssFileUploadServiceImpl(OssProperties ossProperties) {
        this.ossProperties = ossProperties;
    }

    @Override
    public UploadedFileVO uploadImage(String scene, Long userId, MultipartFile file) {
        validateConfiguration();
        validateUser(userId);
        validateFile(file);

        String normalizedScene = normalizeScene(scene);
        long maxSize = "avatar".equals(normalizedScene) ? MAX_AVATAR_SIZE : MAX_COVER_SIZE;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(
                    "avatar".equals(normalizedScene) ? "头像图片不能超过 2MB" : "封面图片不能超过 5MB"
            );
        }

        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        String extension = CONTENT_TYPE_EXTENSIONS.get(contentType);
        String objectKey = buildObjectKey(normalizedScene, userId, extension);

        OSS ossClient = new OSSClientBuilder().build(
                ossProperties.getEndpoint(),
                ossProperties.getAccessKeyId(),
                ossProperties.getAccessKeySecret()
        );
        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(contentType);

            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossProperties.getBucket(),
                    objectKey,
                    inputStream,
                    metadata
            );
            ossClient.putObject(putObjectRequest);
        } catch (IOException exception) {
            throw new IllegalStateException("读取上传文件失败", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("上传文件到 OSS 失败", exception);
        } finally {
            ossClient.shutdown();
        }

        return new UploadedFileVO(objectKey, buildPublicUrl(objectKey));
    }

    private void validateConfiguration() {
        if (StrUtil.hasBlank(
                ossProperties.getEndpoint(),
                ossProperties.getBucket(),
                ossProperties.getAccessKeyId(),
                ossProperties.getAccessKeySecret(),
                ossProperties.getPublicBaseUrl()
        )) {
            throw new IllegalStateException("OSS 配置不完整，请先设置后端环境变量");
        }
    }

    private void validateUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("当前登录用户无效，无法上传文件");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("请选择图片文件");
        }

        String contentType = file.getContentType();
        if (StrUtil.isBlank(contentType)) {
            throw new IllegalArgumentException("无法识别图片类型");
        }

        String normalizedContentType = contentType.toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(normalizedContentType)) {
            throw new IllegalArgumentException("仅支持 JPG、PNG、WEBP、GIF 图片");
        }
    }

    private String normalizeScene(String scene) {
        if ("avatar".equalsIgnoreCase(scene)) {
            return "avatar";
        }
        if ("cover".equalsIgnoreCase(scene)) {
            return "cover";
        }
        throw new IllegalArgumentException("不支持的上传场景");
    }

    private String buildObjectKey(String scene, Long userId, String extension) {
        String prefix = "avatar".equals(scene)
                ? ossProperties.getAvatarPrefix()
                : ossProperties.getCoverPrefix();
        String datePath = LocalDate.now().toString();
        return String.format("%s/%d/%s/%s.%s", prefix, userId, datePath, IdUtil.fastSimpleUUID(), extension);
    }

    private String buildPublicUrl(String objectKey) {
        return StrUtil.removeSuffix(ossProperties.getPublicBaseUrl().trim(), "/") + "/" + objectKey;
    }
}
