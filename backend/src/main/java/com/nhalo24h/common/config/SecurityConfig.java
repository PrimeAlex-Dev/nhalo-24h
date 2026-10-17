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
    private final com.nhalo24h.auth.jwt.JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
        CorsProperties corsProperties,
        ObjectMapper objectMapper,
        com.nhalo24h.auth.jwt.JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.corsProperties = corsProperties;
        this.objectMapper = objectMapper;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
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
                // Công khai các endpoint Authentication (Login, Logout)
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/logout"
                ).permitAll()
                // Danh mục dịch vụ: Khách xem công khai (GET), thao tác tạo/sửa (POST, PATCH) chỉ dành cho ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/service-categories", "/api/v1/service-categories/**").permitAll()
                .requestMatchers("/api/v1/service-categories/**").hasRole("ADMIN")
                // Quản lý người dùng: Toàn bộ API chỉ dành cho Quản trị viên (ADMIN)
                .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                // Xem thông tin cá nhân: Bất kỳ vai trò nào đã đăng nhập
                .requestMatchers("/api/v1/auth/me").authenticated()
                // Hồ sơ khách hàng: Chỉ dành cho người dùng có vai trò CUSTOMER
                .requestMatchers("/api/v1/customer/**").hasRole("CUSTOMER")
                // Mọi API nghiệp vụ còn lại đều yêu cầu xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

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
