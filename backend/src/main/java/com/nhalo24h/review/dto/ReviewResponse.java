package com.nhalo24h.review.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.review.domain.Review;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record ReviewResponse(
    UUID id,
    UUID orderId,
    String orderCode,
    String orderTitle,
    UUID providerProfileId,
    String providerName,
    String providerAvatar,
    UUID customerId,
    String customerName,
    String customerAvatar,
    Short rating,
    Short punctualityRating,
    Short skillRating,
    Short attitudeRating,
    Short priceRating,
    String comment,
    List<String> tags,
    List<String> images,
    Boolean isAnonymous,
    Boolean isVisible,
    String providerReply,
    Instant providerRepliedAt,
    Instant createdAt,
    Instant updatedAt
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static ReviewResponse from(Review review) {
        String custName = "Khách hàng";
        String custAvatar = null;
        UUID custId = null;

        if (review.getCustomer() != null) {
            custId = review.getCustomer().getId();
            custName = review.getCustomer().getFullName();
        }

        if (Boolean.TRUE.equals(review.getIsAnonymous()) && custName != null && custName.length() > 2) {
            String[] parts = custName.split("\\s+");
            if (parts.length > 1) {
                custName = parts[0] + " " + parts[parts.length - 1].charAt(0) + "***";
            } else {
                custName = custName.substring(0, 1) + "***";
            }
            custAvatar = null; // Ẩn avatar khi đánh giá ẩn danh
        }

        String provName = "Thợ đối tác";
        String provAvatar = null;
        if (review.getProviderProfile() != null) {
            provAvatar = review.getProviderProfile().getAvatarUrl();
            if (review.getProviderProfile().getUser() != null) {
                provName = review.getProviderProfile().getUser().getFullName();
            }
        }

        List<String> parsedTags = parseCommaOrJsonList(review.getTags());
        List<String> parsedImages = parseCommaOrJsonList(review.getImages());

        return new ReviewResponse(
            review.getId(),
            review.getOrder() != null ? review.getOrder().getId() : null,
            review.getOrder() != null ? review.getOrder().getOrderCode() : null,
            review.getOrder() != null ? review.getOrder().getTitle() : null,
            review.getProviderProfile() != null ? review.getProviderProfile().getId() : null,
            provName,
            provAvatar,
            custId,
            custName,
            custAvatar,
            review.getRating(),
            review.getPunctualityRating(),
            review.getSkillRating(),
            review.getAttitudeRating(),
            review.getPriceRating(),
            review.getComment(),
            parsedTags,
            parsedImages,
            review.getIsAnonymous(),
            review.getIsVisible(),
            review.getProviderReply(),
            review.getProviderRepliedAt(),
            review.getCreatedAt(),
            review.getUpdatedAt()
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
