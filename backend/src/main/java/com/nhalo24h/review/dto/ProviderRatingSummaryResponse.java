package com.nhalo24h.review.dto;

import java.util.UUID;

public record ProviderRatingSummaryResponse(
    UUID providerProfileId,
    Double averageRating,
    Integer totalReviews,
    Long star5Count,
    Long star4Count,
    Long star3Count,
    Long star2Count,
    Long star1Count
) {
}
