package com.nhalo24h.report.dto;

import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record ResolveReportRequest(
    @NotNull(message = "Trạng thái giải quyết không được để trống")
    ReportStatus status,

    PenaltyType penaltyType,

    Long penaltyAmount,

    String adminNotes
) {
}
