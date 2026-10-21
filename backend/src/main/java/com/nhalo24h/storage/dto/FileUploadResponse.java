package com.nhalo24h.storage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Kết quả tải lên file hình ảnh")
public record FileUploadResponse(
    @Schema(description = "Danh sách URL hình ảnh đã lưu trên hệ thống")
    List<String> fileUrls
) {
}
