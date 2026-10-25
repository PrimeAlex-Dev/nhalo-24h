package com.nhalo24h.report.dto;

import com.nhalo24h.report.domain.ReportReasonType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record CreateReportRequest(
    UUID orderId,

    @NotNull(message = "ID thợ bị khiếu nại không được để trống")
    UUID providerId,

    @NotNull(message = "Loại vi phạm không được để trống")
    ReportReasonType reasonType,

    @NotBlank(message = "Tiêu đề khiếu nại không được để trống")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    String title,

    @NotBlank(message = "Mô tả sự việc không được để trống")
    String description,

    List<String> evidenceImages,

    @Size(max = 100, message = "Nguyện vọng xử lý tối đa 100 ký tự")
    String expectedResolution
) {
}
