package com.nhalo24h.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateReviewRequest(
    @NotNull(message = "Mã đơn hàng không được để trống")
    UUID orderId,

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    Short rating,

    Short punctualityRating,
    Short skillRating,
    Short attitudeRating,
    Short priceRating,

    String comment,
    List<String> tags,
    List<String> images,
    Boolean isAnonymous
) {
}
