package com.nhalo24h.review.controller;

import com.nhalo24h.review.dto.ProviderRatingSummaryResponse;
import com.nhalo24h.review.dto.ReviewResponse;
import com.nhalo24h.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Public Reviews", description = "API Đánh giá thợ công khai cho mọi người dùng")
@RestController
@RequestMapping("/api/v1/providers/{providerId}")
public class PublicReviewController {

    private final ReviewService reviewService;

    public PublicReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "Lấy danh sách đánh giá công khai của một thợ")
    @GetMapping("/reviews")
    public ResponseEntity<Page<ReviewResponse>> getPublicReviews(
            @PathVariable UUID providerId,
            @RequestParam(required = false) Short star,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> response = reviewService.getPublicReviews(providerId, star, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy thống kê điểm số & phân bố sao của thợ")
    @GetMapping("/rating-summary")
    public ResponseEntity<ProviderRatingSummaryResponse> getRatingSummary(@PathVariable UUID providerId) {
        ProviderRatingSummaryResponse response = reviewService.getRatingSummary(providerId);
        return ResponseEntity.ok(response);
    }
}
