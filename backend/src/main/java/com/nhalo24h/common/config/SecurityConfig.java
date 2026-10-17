package com.nhalo24h.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.common.error.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Cấu hình bảo mật nền tảng Spring Security cho dự án Nhà Lo 24h.
 * 
 * Lưu ý quan trọng:
 * - Ở giai đoạn khởi tạo kiến trúc, hệ thống chỉ cấu hình khung nền tảng:
 *   Stateless session, CORS, CSRF disable (phù hợp REST API), PasswordEncoder,
 *   và phân quyền tối thiểu (chỉ mở các endpoint tài liệu kỹ thuật & health check).
 * - Luồng xác thực chi tiết (JWT Filter, UserDetailsService, Login, Register, Refresh Token)
 *   chưa được triển khai ở giai đoạn này và được dành riêng cho module Authentication ở giai đoạn tiếp theo.
 * - Hệ thống CHƯA được coi là hoàn thiện bảo mật cho tới khi module Authentication và JWT Filter được tích hợp.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsProperties corsProperties;
    private final ObjectMapper objectMapper;

    public SecurityConfig(CorsProperties corsProperties, ObjectMapper objectMapper) {
        this.corsProperties = corsProperties;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            )
            .authorizeHttpRequests(auth -> auth
                // Công khai tài liệu API Swagger & OpenAPI
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                // Công khai endpoint kiểm tra sức khỏe hệ thống
                .requestMatchers(
                    "/api/v1/health"
                ).permitAll()
                // Giai đoạn phát triển nội bộ: Công khai User & Category Management API
                .requestMatchers(
                    "/api/v1/users/**",
                    "/api/v1/service-categories/**"
                ).permitAll()
                // Mọi API nghiệp vụ còn lại đều yêu cầu xác thực
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> origins = corsProperties.allowedOrigins();
        configuration.setAllowedOrigins(origins != null && !origins.isEmpty() ? origins : List.of("http://localhost:5173"));
        
        List<String> methods = corsProperties.allowedMethods();
        configuration.setAllowedMethods(methods != null && !methods.isEmpty() ? methods : List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        List<String> headers = corsProperties.allowedHeaders();
        configuration.setAllowedHeaders(headers != null && !headers.isEmpty() ? headers : List.of("*"));
        
        List<String> exposed = corsProperties.exposedHeaders();
        if (exposed != null && !exposed.isEmpty()) {
            configuration.setExposedHeaders(exposed);
        }
        
        configuration.setAllowCredentials(corsProperties.allowCredentials());
        configuration.setMaxAge(corsProperties.maxAgeSeconds() > 0 ? corsProperties.maxAgeSeconds() : 3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ErrorResponse errorResponse = ErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.UNAUTHORIZED.name(),
                ErrorCode.UNAUTHORIZED.getDefaultMessage(),
                request.getRequestURI()
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        };
    }

    private AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ErrorResponse errorResponse = ErrorResponse.of(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.FORBIDDEN.name(),
                ErrorCode.FORBIDDEN.getDefaultMessage(),
                request.getRequestURI()
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        };
    }
}
