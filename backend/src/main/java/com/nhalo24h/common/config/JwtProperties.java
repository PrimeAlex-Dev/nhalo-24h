package com.nhalo24h.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
    String secretKey,
    long expirationSeconds
) {
}
