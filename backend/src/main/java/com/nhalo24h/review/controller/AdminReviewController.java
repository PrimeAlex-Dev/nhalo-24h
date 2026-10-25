package com.nhalo24h.review.controller;

import com.nhalo24h.review.dto.ReviewResponse;
import com.nhalo24h.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Admin Reviews", description = "API Kiểm duyệt Đánh giá dành cho Quản trị viên")
@RestController
@RequestMapping("/api/v1/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "Admin xem toàn bộ đánh giá trên hệ thống")
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> response = reviewService.getAllReviewsForAdmin(pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Admin ẩn hoặc mở hiển thị một đánh giá")
    @PutMapping("/{reviewId}/visibility")
    public ResponseEntity<ReviewResponse> toggleReviewVisibility(
            @PathVariable UUID reviewId,
            @RequestParam boolean visible
    ) {
        ReviewResponse response = reviewService.toggleReviewVisibility(reviewId, visible);
        return ResponseEntity.ok(response);
    }
}
