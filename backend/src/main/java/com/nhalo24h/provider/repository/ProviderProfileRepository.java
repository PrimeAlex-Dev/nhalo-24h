package com.nhalo24h.provider.repository;

import com.nhalo24h.provider.domain.ProviderProfile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, UUID>, JpaSpecificationExecutor<ProviderProfile> {

    Optional<ProviderProfile> findByUserId(UUID userId);

    @Query("SELECT p FROM ProviderProfile p JOIN FETCH p.user u WHERE u.id = :userId")
    Optional<ProviderProfile> findByUserIdWithUser(@Param("userId") UUID userId);

    @Query("SELECT p FROM ProviderProfile p JOIN FETCH p.user u WHERE p.id = :id")
    Optional<ProviderProfile> findByIdWithUser(@Param("id") UUID id);

    @Query("SELECT DISTINCT p FROM ProviderProfile p JOIN FETCH p.user u LEFT JOIN FETCH p.providerCategories pc LEFT JOIN FETCH pc.category WHERE u.status = 'ACTIVE'")
    List<ProviderProfile> findAllActiveProviders();
}
