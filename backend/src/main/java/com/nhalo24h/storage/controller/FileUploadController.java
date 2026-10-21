package com.nhalo24h.storage.controller;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.storage.dto.FileUploadResponse;
import com.nhalo24h.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "File Upload", description = "Các API tải lên hình ảnh và tài liệu đa phương tiện")
public class FileUploadController {

    private final StorageService storageService;

    public FileUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải lên danh sách hình ảnh sự cố", description = "Nhận tối đa 5 file ảnh (JPG, PNG, WEBP, tối đa 10MB/ảnh) và trả về danh sách URL truy cập")
    public ResponseEntity<FileUploadResponse> uploadImages(
        @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Vui lòng chọn ít nhất một file ảnh để tải lên");
        }
        if (files.size() > 5) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Mỗi lần chỉ được tải lên tối đa 5 hình ảnh");
        }

        List<String> urls = storageService.storeFiles(files, "orders");
        return ResponseEntity.ok(new FileUploadResponse(urls));
    }
}
