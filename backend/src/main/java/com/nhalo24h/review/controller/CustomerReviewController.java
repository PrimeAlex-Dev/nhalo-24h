package com.nhalo24h.review.controller;

import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.review.dto.CreateReviewRequest;
import com.nhalo24h.review.dto.ReviewResponse;
import com.nhalo24h.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Customer Reviews", description = "API Đánh giá thợ dành cho Khách hàng")
@RestController
@RequestMapping("/api/v1/reviews")
public class CustomerReviewController {

    private final ReviewService reviewService;

    public CustomerReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "Tạo đánh giá mới cho đơn hàng đã hoàn tất")
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewResponse response = reviewService.createReview(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lấy thông tin đánh giá theo mã đơn hàng")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReviewResponse> getReviewByOrderId(@PathVariable UUID orderId) {
        ReviewResponse response = reviewService.getReviewByOrderId(orderId);
        return ResponseEntity.ok(response);
    }
}
