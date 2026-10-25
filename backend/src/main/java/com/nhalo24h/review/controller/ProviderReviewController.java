package com.nhalo24h.review.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.review.dto.ProviderReplyRequest;
import com.nhalo24h.review.dto.ReviewResponse;
import com.nhalo24h.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Provider Reviews", description = "API Quản lý Đánh giá dành cho Thợ")
@RestController
@RequestMapping("/api/v1/provider/reviews")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderReviewController {

    private final ReviewService reviewService;

    public ProviderReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "Thợ xem tất cả các đánh giá nhận được từ khách hàng")
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> response = reviewService.getProviderReviews(principal.getId(), pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Thợ gửi phản hồi lịch sự cho một đánh giá")
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ProviderReplyRequest request
    ) {
        ReviewResponse response = reviewService.replyToReview(principal.getId(), reviewId, request);
        return ResponseEntity.ok(response);
    }
}
