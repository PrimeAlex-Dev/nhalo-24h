package com.nhalo24h.report.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.report.dto.CreateReportRequest;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.service.ProviderReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Customer Reports", description = "API Báo cáo sự cố & Khiếu nại thợ dành cho Khách hàng")
@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerReportController {

    private final ProviderReportService reportService;

    public CustomerReportController(ProviderReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "Khách hàng gửi báo cáo sự cố / khiếu nại thợ")
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReportRequest request
    ) {
        ReportResponse response = reportService.createReport(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Khách hàng xem danh sách các khiếu nại đã gửi")
    @GetMapping("/my")
    public ResponseEntity<Page<ReportResponse>> getMyReports(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReportResponse> response = reportService.getCustomerReports(principal.getId(), pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xem chi tiết một khiếu nại")
    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable UUID reportId) {
        ReportResponse response = reportService.getReportById(reportId);
        return ResponseEntity.ok(response);
    }
}
