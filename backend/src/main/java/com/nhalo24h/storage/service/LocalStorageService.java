package com.nhalo24h.storage.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        validateFile(file);

        try {
            Path targetDir = Paths.get(uploadDir, subFolder != null ? subFolder : "").toAbsolutePath().normalize();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String extension = extractExtension(file);
            String uniqueFileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;
            Path targetPath = targetDir.resolve(uniqueFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            String subPath = (subFolder != null && !subFolder.isBlank()) ? "/" + subFolder : "";
            return cleanBaseUrl + subPath + "/" + uniqueFileName;
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể lưu file vào máy chủ: " + e.getMessage());
        }
    }

    @Override
    public List<String> storeFiles(List<MultipartFile> files, String subFolder) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                urls.add(storeFile(file, subFolder));
            }
        }
        return urls;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "File tải lên không được rỗng");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.INVALID_INPUT, "File ảnh '" + file.getOriginalFilename() + "' vượt quá kích thước cho phép (tối đa 10MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Định dạng file không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP");
        }

        String extension = extractExtension(file);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Phần mở rộng file không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp");
        }
    }

    private String extractExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        String contentType = file.getContentType();
        if ("image/png".equalsIgnoreCase(contentType)) return ".png";
        if ("image/webp".equalsIgnoreCase(contentType)) return ".webp";
        return ".jpg";
    }
}
