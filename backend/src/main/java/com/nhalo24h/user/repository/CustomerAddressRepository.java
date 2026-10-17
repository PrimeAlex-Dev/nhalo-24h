package com.nhalo24h.user.repository;

import com.nhalo24h.user.domain.CustomerAddress;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {

    List<CustomerAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    Optional<CustomerAddress> findByIdAndUserId(UUID id, UUID userId);

    List<CustomerAddress> findAllByUserIdAndIsDefaultTrue(UUID userId);

    Optional<CustomerAddress> findByUserIdAndIsDefaultTrue(UUID userId);

    long countByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
