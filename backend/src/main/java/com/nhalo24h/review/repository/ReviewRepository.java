package com.nhalo24h.review.repository;

import com.nhalo24h.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByOrderId(UUID orderId);

    boolean existsByOrderId(UUID orderId);

    Page<Review> findByProviderProfileIdAndIsVisibleTrue(UUID providerProfileId, Pageable pageable);

    Page<Review> findByProviderProfileIdAndIsVisibleTrueAndRating(UUID providerProfileId, Short rating, Pageable pageable);

    Page<Review> findByProviderProfileId(UUID providerProfileId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.providerProfile.id = :providerProfileId AND r.isVisible = true")
    Double getAverageRating(@Param("providerProfileId") UUID providerProfileId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.providerProfile.id = :providerProfileId AND r.isVisible = true")
    Integer countVisibleReviews(@Param("providerProfileId") UUID providerProfileId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.providerProfile.id = :providerProfileId AND r.isVisible = true AND r.rating = :rating")
    Long countByRating(@Param("providerProfileId") UUID providerProfileId, @Param("rating") Short rating);
}
