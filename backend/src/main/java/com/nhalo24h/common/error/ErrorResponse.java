package com.nhalo24h.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;

@Schema(description = "Cấu trúc phản hồi lỗi chuẩn của hệ thống")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    @Schema(description = "Thời điểm xảy ra lỗi theo chuẩn ISO-8601", example = "2026-10-15T12:00:00Z")
    Instant timestamp,

    @Schema(description = "Mã trạng thái HTTP", example = "400")
    int status,

    @Schema(description = "Mã lỗi định danh của ứng dụng", example = "INVALID_INPUT")
    String errorCode,

    @Schema(description = "Thông điệp mô tả lỗi", example = "Dữ liệu yêu cầu không hợp lệ")
    String message,

    @Schema(description = "Đường dẫn API gây ra lỗi", example = "/api/v1/services")
    String path,

    @Schema(description = "Danh sách chi tiết lỗi trường dữ liệu nếu có")
    List<FieldErrorItem> details
) {
    public static ErrorResponse of(int status, String errorCode, String message, String path) {
        return new ErrorResponse(Instant.now(), status, errorCode, message, path, null);
    }

    public static ErrorResponse of(int status, String errorCode, String message, String path, List<FieldErrorItem> details) {
        return new ErrorResponse(Instant.now(), status, errorCode, message, path, details);
    }

    @Schema(description = "Chi tiết lỗi của từng trường dữ liệu")
    public record FieldErrorItem(
        @Schema(description = "Tên trường gặp lỗi", example = "phoneNumber")
        String field,

        @Schema(description = "Lý do vi phạm ràng buộc", example = "Số điện thoại không đúng định dạng")
        String message
    ) {
    }
}
