package com.nhalo24h.auth.repository;

import com.nhalo24h.auth.domain.InvalidatedToken;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    void deleteByExpiryTimeBefore(Instant now);
}
