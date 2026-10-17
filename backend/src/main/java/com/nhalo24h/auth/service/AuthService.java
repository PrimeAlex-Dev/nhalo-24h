package com.nhalo24h.auth.service;

import com.nhalo24h.auth.domain.InvalidatedToken;
import com.nhalo24h.auth.dto.AuthResponse;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.dto.MessageResponse;
import com.nhalo24h.auth.jwt.JwtTokenProvider;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.UserResponse;
import com.nhalo24h.user.mapper.UserMapper;
import com.nhalo24h.user.repository.UserRepository;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    public AuthService(
        UserRepository userRepository,
        InvalidatedTokenRepository invalidatedTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider,
        UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.invalidatedTokenRepository = invalidatedTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
    }

    /**
     * Xác thực thông tin đăng nhập và cấp phát JWT access token.
     */
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> {
                log.warn("Đăng nhập thất bại: Không tìm thấy tài khoản với email '{}'", normalizedEmail);
                return new AppException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
            });

        // Kiểm tra tài khoản có bị vô hiệu hóa không
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Đăng nhập thất bại: Tài khoản ID={} ({}) đang ở trạng thái {}", user.getId(), normalizedEmail, user.getStatus());
            throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản của bạn đã bị vô hiệu hóa");
        }

        // Kiểm tra tài khoản đã thiết lập mật khẩu chưa
        if (!user.hasPassword()) {
            log.warn("Đăng nhập thất bại: Tài khoản ID={} ({}) chưa thiết lập mật khẩu", user.getId(), normalizedEmail);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản chưa được thiết lập mật khẩu");
        }

        // Kiểm tra khớp mật khẩu đã băm (BCrypt)
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Đăng nhập thất bại: Mật khẩu không chính xác cho email '{}'", normalizedEmail);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
        }

        // Phát hành JWT token
        String accessToken = jwtTokenProvider.generateToken(user);
        long expiresIn = jwtTokenProvider.getExpirationSeconds();

        log.info("Người dùng ID={} ({}) đăng nhập thành công", user.getId(), user.getEmail());
        return AuthResponse.of(accessToken, expiresIn, userMapper.toResponse(user));
    }

    /**
     * Đăng xuất: Vô hiệu hóa hiệu lực của token bằng cách lưu jti vào InvalidatedTokenRepository.
     */
    public MessageResponse logout(String bearerToken) {
        if (StringUtils.hasText(bearerToken)) {
            String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;
            try {
                if (jwtTokenProvider.validateToken(token)) {
                    String tokenId = jwtTokenProvider.extractTokenId(token);
                    UUID userId = jwtTokenProvider.extractUserId(token);
                    Instant expiryTime = jwtTokenProvider.extractExpiryTime(token);

                    invalidatedTokenRepository.save(new InvalidatedToken(tokenId, userId, expiryTime));
                    log.info("Token jti={} của user ID={} đã được vô hiệu hóa thành công", tokenId, userId);
                }
            } catch (Exception e) {
                log.warn("Không thể vô hiệu hóa token trong quá trình logout: {}", e.getMessage());
            }
        }

        SecurityContextHolder.clearContext();
        return MessageResponse.of("Đăng xuất thành công");
    }

    /**
     * Lấy thông tin tài khoản đang đăng nhập.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng với ID: " + userId));
        return userMapper.toResponse(user);
    }
}
