package com.nhalo24h.report.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.report.domain.ReportStatus;
import com.nhalo24h.report.dto.ConfirmCompensationPayoutRequest;
import com.nhalo24h.report.dto.RefundPenaltyRequest;
import com.nhalo24h.report.dto.RevokeSuspensionRequest;
import com.nhalo24h.report.dto.ReportResponse;
import com.nhalo24h.report.dto.ResolveReportRequest;
import com.nhalo24h.report.service.ProviderReportService;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Reports", description = "API Quản lý & Xử lý Khiếu nại thợ dành cho Quản trị viên")
@RestController
@RequestMapping("/api/v1/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ProviderReportService reportService;
    private final UserRepository userRepository;

    public AdminReportController(ProviderReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Admin xem danh sách khiếu nại theo trạng thái hoặc từ khóa")
    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getAdminReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReportResponse> response = reportService.getAdminReports(status, search, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin xem chi tiết hồ sơ khiếu nại")
    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse> getReportDetail(@PathVariable UUID reportId) {
        ReportResponse response = reportService.getReportById(reportId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin kết luận xử lý khiếu nại, chế tài và trích phạt cọc ký quỹ thợ")
    @PostMapping("/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody ResolveReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User adminUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản quản trị viên"));

        ReportResponse response = reportService.resolveReport(reportId, request, adminUser);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin hoàn trả tiền phạt ký quỹ cho thợ khi xử oan hoặc hai bên hòa giải")
    @PostMapping("/{reportId}/refund-penalty")
    public ResponseEntity<ReportResponse> refundDisputePenalty(
            @PathVariable UUID reportId,
            @Valid @RequestBody RefundPenaltyRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User adminUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản quản trị viên"));

        ReportResponse response = reportService.refundDisputePenalty(reportId, request, adminUser);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin xác nhận đã chuyển khoản chi trả bồi thường cho Khách hàng")
    @PostMapping("/{reportId}/confirm-compensation")
    public ResponseEntity<ReportResponse> confirmCompensationPayout(
            @PathVariable UUID reportId,
            @Valid @RequestBody ConfirmCompensationPayoutRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User adminUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản quản trị viên"));

        ReportResponse response = reportService.confirmCompensationPayout(reportId, request, adminUser);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin gỡ đình chỉ / mở khóa tức thì cho thợ khi xử phạt nhầm hoặc các bên hòa giải")
    @PostMapping("/{reportId}/revoke-suspension")
    public ResponseEntity<ReportResponse> revokeDisciplinaryAction(
            @PathVariable UUID reportId,
            @Valid @RequestBody RevokeSuspensionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User adminUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản quản trị viên"));

        ReportResponse response = reportService.revokeDisciplinaryAction(reportId, request, adminUser);
        return ResponseEntity.ok(response);
    }
}
