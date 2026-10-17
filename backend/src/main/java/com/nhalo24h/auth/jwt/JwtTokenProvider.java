package com.nhalo24h.auth.jwt;

import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.common.config.JwtProperties;
import com.nhalo24h.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final JwtProperties jwtProperties;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public JwtTokenProvider(JwtProperties jwtProperties, InvalidatedTokenRepository invalidatedTokenRepository) {
        this.jwtProperties = jwtProperties;
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtProperties.secretKey());
        } catch (Exception e) {
            keyBytes = jwtProperties.secretKey().getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT access token cho user với jti (UUID) duy nhất.
     */
    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.expirationSeconds());
        String tokenId = UUID.randomUUID().toString();

        return Jwts.builder()
            .id(tokenId)
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(getSigningKey(), Jwts.SIG.HS256)
            .compact();
    }

    /**
     * Trích xuất toàn bộ Claims từ token.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    /**
     * Kiểm tra tính hợp lệ của token:
     * - Chữ ký hợp lệ.
     * - Chưa hết hạn.
     * - Chưa bị vô hiệu hóa (logout/blacklist).
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            String tokenId = claims.getId();

            if (tokenId != null && invalidatedTokenRepository.existsById(tokenId)) {
                log.warn("Token với jti={} đã bị vô hiệu hóa (đã logout)", tokenId);
                return false;
            }

            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token đã hết hạn: {}", e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Token không hợp lệ: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Trích xuất User ID (UUID) từ token.
     */
    public UUID extractUserId(String token) {
        Claims claims = parseClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Trích xuất Token ID (jti) từ token.
     */
    public String extractTokenId(String token) {
        return parseClaims(token).getId();
    }

    /**
     * Trích xuất thời điểm hết hạn từ token.
     */
    public Instant extractExpiryTime(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    public long getExpirationSeconds() {
        return jwtProperties.expirationSeconds();
    }
}
