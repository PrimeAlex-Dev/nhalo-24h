package com.nhalo24h.report.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ProviderReport;
import com.nhalo24h.report.domain.ReportReasonType;
import com.nhalo24h.report.domain.ReportStatus;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record ReportResponse(
    UUID id,
    String reportCode,
    UUID orderId,
    String orderCode,
    String orderTitle,
    UUID providerId,
    String providerName,
    String providerAvatar,
    UUID reporterId,
    String reporterName,
    String reporterPhone,
    ReportReasonType reasonType,
    String title,
    String description,
    List<String> evidenceImages,
    String expectedResolution,
    ReportStatus status,
    PenaltyType penaltyType,
    Long penaltyAmount,
    String adminNotes,
    String resolvedByName,
    Instant resolvedAt,
    Instant createdAt,
    Instant updatedAt
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static ReportResponse from(ProviderReport report) {
        String provName = "Thợ đối tác";
        String provAvatar = null;
        if (report.getProvider() != null) {
            provAvatar = report.getProvider().getAvatarUrl();
            if (report.getProvider().getUser() != null) {
                provName = report.getProvider().getUser().getFullName();
            }
        }

        String repName = "Khách hàng";
        String repPhone = null;
        UUID repId = null;
        if (report.getReporter() != null) {
            repId = report.getReporter().getId();
            repName = report.getReporter().getFullName();
            repPhone = report.getReporter().getPhone();
        }

        String resolvedName = null;
        if (report.getResolvedBy() != null) {
            resolvedName = report.getResolvedBy().getFullName();
        }

        List<String> images = parseCommaOrJsonList(report.getEvidenceImages());

        return new ReportResponse(
            report.getId(),
            report.getReportCode(),
            report.getOrder() != null ? report.getOrder().getId() : null,
            report.getOrder() != null ? report.getOrder().getOrderCode() : null,
            report.getOrder() != null ? report.getOrder().getTitle() : null,
            report.getProvider() != null ? report.getProvider().getId() : null,
            provName,
            provAvatar,
            repId,
            repName,
            repPhone,
            report.getReasonType(),
            report.getTitle(),
            report.getDescription(),
            images,
            report.getExpectedResolution(),
            report.getStatus(),
            report.getPenaltyType(),
            report.getPenaltyAmount() != null ? report.getPenaltyAmount() : 0L,
            report.getAdminNotes(),
            resolvedName,
            report.getResolvedAt(),
            report.getCreatedAt(),
            report.getUpdatedAt()
        );
    }

    private static List<String> parseCommaOrJsonList(String str) {
        if (str == null || str.isBlank()) {
            return Collections.emptyList();
        }
        String trimmed = str.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                return OBJECT_MAPPER.readValue(trimmed, new TypeReference<List<String>>() {});
            } catch (Exception ignored) {
            }
        }
        return Arrays.stream(trimmed.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    }
}
