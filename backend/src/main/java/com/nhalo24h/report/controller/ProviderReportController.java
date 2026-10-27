package com.nhalo24h.report.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.service.ProviderReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Provider Reports", description = "API Xem Lịch sử Khiếu nại & Kỷ luật dành cho Thợ")
@RestController
@RequestMapping("/api/v1/provider/reports")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderReportController {

    private final ProviderReportService reportService;

    public ProviderReportController(ProviderReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "Thợ xem danh sách các khiếu nại liên quan đến mình")
    @GetMapping("/my-disputes")
    public ResponseEntity<Page<ReportResponse>> getMyDisputes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReportResponse> response = reportService.getProviderReports(principal.getId(), pageable);
        return ResponseEntity.ok(response);
    }
}
