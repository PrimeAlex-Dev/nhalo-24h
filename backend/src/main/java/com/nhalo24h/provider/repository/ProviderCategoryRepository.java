package com.nhalo24h.provider.repository;

import com.nhalo24h.provider.domain.ProviderCategory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderCategoryRepository extends JpaRepository<ProviderCategory, UUID> {

    List<ProviderCategory> findByProviderProfileId(UUID providerProfileId);

    void deleteByProviderProfileId(UUID providerProfileId);
}
