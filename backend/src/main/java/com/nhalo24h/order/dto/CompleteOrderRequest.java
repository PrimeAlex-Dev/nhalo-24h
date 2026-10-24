package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Thông tin tổng kết khi thợ báo hoàn thành công việc")
public record CompleteOrderRequest(
    @Schema(description = "Ghi chú tổng kết công việc và hướng dẫn sử dụng/bảo hành", example = "Đã thay ống thoát nước mới và kiểm tra kín nước hoàn toàn.")
    String completionNote,

    @Schema(description = "Danh sách ảnh nghiệm thu hoàn thành công việc")
    List<String> completionImageUrls
) {
}
