package com.nhalo24h.category.repository;

import com.nhalo24h.category.domain.ServiceCategory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID>, JpaSpecificationExecutor<ServiceCategory> {

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, UUID id);

    Optional<ServiceCategory> findBySlugIgnoreCase(String slug);
}
