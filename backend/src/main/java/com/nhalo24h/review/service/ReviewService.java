package com.nhalo24h.review.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.review.domain.Review;
import com.nhalo24h.review.dto.CreateReviewRequest;
import com.nhalo24h.review.dto.ProviderRatingSummaryResponse;
import com.nhalo24h.review.dto.ProviderReplyRequest;
import com.nhalo24h.review.dto.ReviewResponse;
import com.nhalo24h.review.repository.ReviewRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderRepository orderRepository,
                         ProviderProfileRepository providerProfileRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(UUID customerUserId, CreateReviewRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền đánh giá đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new AppException(ErrorCode.CONFLICT, "Chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất");
        }

        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng này đã được đánh giá trước đó");
        }

        ProviderProfile providerProfile = order.getAssignedProvider();
        if (providerProfile == null) {
            throw new AppException(ErrorCode.CONFLICT, "Đơn hàng chưa có thợ đảm nhận để đánh giá");
        }

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khách hàng"));

        Review review = new Review(order, providerProfile, customer, request.rating());
        review.setPunctualityRating(request.punctualityRating());
        review.setSkillRating(request.skillRating());
        review.setAttitudeRating(request.attitudeRating());
        review.setPriceRating(request.priceRating());
        review.setComment(request.comment());
        review.setIsAnonymous(Boolean.TRUE.equals(request.isAnonymous()));
        review.setIsVisible(true);

        if (request.tags() != null && !request.tags().isEmpty()) {
            review.setTags(serializeList(request.tags()));
        }

        if (request.images() != null && !request.images().isEmpty()) {
            review.setImages(serializeList(request.images()));
        }

        Review saved = reviewRepository.save(review);
        log.info("Khách hàng {} đã đánh giá {}★ cho thợ {}", customer.getFullName(), request.rating(), providerProfile.getId());

        // Cập nhật lại chỉ số rating_average và review_count của thợ
        recalculateProviderRating(providerProfile.getId());

        return ReviewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewByOrderId(UUID orderId) {
        Review review = reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Đơn hàng chưa có đánh giá"));
        return ReviewResponse.from(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPublicReviews(UUID providerProfileId, Short starFilter, Pageable pageable) {
        Page<Review> page;
        if (starFilter != null && starFilter >= 1 && starFilter <= 5) {
            page = reviewRepository.findByProviderProfileIdAndIsVisibleTrueAndRating(providerProfileId, starFilter, pageable);
        } else {
            page = reviewRepository.findByProviderProfileIdAndIsVisibleTrue(providerProfileId, pageable);
        }
        return page.map(ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public ProviderRatingSummaryResponse getRatingSummary(UUID providerProfileId) {
        Double avg = reviewRepository.getAverageRating(providerProfileId);
        Integer count = reviewRepository.countVisibleReviews(providerProfileId);

        double roundedAvg = (avg != null && avg > 0) ? Math.round(avg * 10.0) / 10.0 : 5.0;
        int total = (count != null) ? count : 0;

        long s5 = reviewRepository.countByRating(providerProfileId, (short) 5);
        long s4 = reviewRepository.countByRating(providerProfileId, (short) 4);
        long s3 = reviewRepository.countByRating(providerProfileId, (short) 3);
        long s2 = reviewRepository.countByRating(providerProfileId, (short) 2);
        long s1 = reviewRepository.countByRating(providerProfileId, (short) 1);

        return new ProviderRatingSummaryResponse(
                providerProfileId,
                roundedAvg,
                total,
                s5, s4, s3, s2, s1
        );
    }

    @Transactional
    public ReviewResponse replyToReview(UUID providerUserId, UUID reviewId, ProviderReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đánh giá"));

        ProviderProfile profile = review.getProviderProfile();
        if (profile == null || profile.getUser() == null || !profile.getUser().getId().equals(providerUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền phản hồi đánh giá này");
        }

        review.setProviderReply(request.replyComment());
        review.setProviderRepliedAt(Instant.now());
        Review saved = reviewRepository.save(review);
        log.info("Thợ {} đã phản hồi đánh giá ID: {}", providerUserId, reviewId);

        return ReviewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProviderReviews(UUID providerUserId, Pageable pageable) {
        ProviderProfile profile = providerProfileRepository.findByUserId(providerUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ"));

        return reviewRepository.findByProviderProfileId(profile.getId(), pageable)
                .map(ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviewsForAdmin(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(ReviewResponse::from);
    }

    @Transactional
    public ReviewResponse toggleReviewVisibility(UUID reviewId, boolean visible) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đánh giá"));

        review.setIsVisible(visible);
        Review saved = reviewRepository.save(review);

        if (review.getProviderProfile() != null) {
            recalculateProviderRating(review.getProviderProfile().getId());
        }

        return ReviewResponse.from(saved);
    }

    private void recalculateProviderRating(UUID providerProfileId) {
        providerProfileRepository.findById(providerProfileId).ifPresent(profile -> {
            Double avg = reviewRepository.getAverageRating(providerProfileId);
            Integer count = reviewRepository.countVisibleReviews(providerProfileId);

            double rounded = (avg != null && avg > 0) ? Math.round(avg * 10.0) / 10.0 : 5.0;
            int total = (count != null) ? count : 0;

            profile.setRatingAverage(rounded);
            profile.setReviewCount(total);
            providerProfileRepository.save(profile);
            log.info("Đã cập nhật chỉ số thợ {}: Rating = {}, Reviews = {}", providerProfileId, rounded, total);
        });
    }

    private String serializeList(List<String> list) {
        try {
            return OBJECT_MAPPER.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return String.join(",", list);
        }
    }
}
