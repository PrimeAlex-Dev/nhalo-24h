package com.nhalo24h.user.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.CreateUserRequest;
import com.nhalo24h.user.dto.UpdateUserRequest;
import com.nhalo24h.user.dto.UpdateUserStatusRequest;
import com.nhalo24h.user.dto.UserResponse;
import com.nhalo24h.user.mapper.UserMapper;
import com.nhalo24h.user.repository.UserRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    /**
     * UC-USER-01: Tạo người dùng mới.
     * Mặc định role là CUSTOMER nếu request không chỉ định.
     */
    public UserResponse createUser(CreateUserRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        // Kiểm tra tính duy nhất của email (không phân biệt hoa/thường)
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Thất bại khi tạo user: Email '{}' đã tồn tại", normalizedEmail);
            throw new AppException(ErrorCode.CONFLICT, "Email '" + normalizedEmail + "' đã được sử dụng");
        }

        // Kiểm tra tính duy nhất và định dạng của số điện thoại nếu được cung cấp
        String normalizedPhone = normalizePhone(request.phone());
        if (normalizedPhone != null) {
            if (!normalizedPhone.matches("^0[0-9]{9}$")) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0");
            }
            if (userRepository.existsByPhone(normalizedPhone)) {
                log.warn("Thất bại khi tạo user: Số điện thoại '{}' đã tồn tại", normalizedPhone);
                throw new AppException(ErrorCode.CONFLICT, "Số điện thoại '" + normalizedPhone + "' đã được sử dụng");
            }
        }

        UserRole role = request.role() != null ? request.role() : UserRole.CUSTOMER;
        User user = new User(request.fullName().trim(), normalizedEmail, normalizedPhone, role);

        User savedUser = userRepository.save(user);
        log.info("Tạo mới người dùng thành công: ID = {}, Email = {}, Role = {}", savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return userMapper.toResponse(savedUser);
    }

    /**
     * UC-USER-02: Lấy danh sách người dùng có phân trang và lọc theo role, status, từ khóa tìm kiếm.
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UserRole role, UserStatus status, String search, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> cb.conjunction();

        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("fullName")), keyword),
                cb.like(cb.lower(root.get("email")), keyword),
                cb.like(root.get("phone"), keyword)
            ));
        }

        return userRepository.findAll(spec, pageable).map(userMapper::toResponse);
    }

    /**
     * UC-USER-02: Xem chi tiết một người dùng theo ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = findUserByIdOrThrow(id);
        return userMapper.toResponse(user);
    }

    /**
     * UC-USER-03: Cập nhật thông tin hồ sơ người dùng (họ tên, số điện thoại).
     */
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUserByIdOrThrow(id);

        if (request.fullName() != null && !request.fullName().trim().isEmpty()) {
            user.setFullName(request.fullName().trim());
        }

        if (request.phone() != null) {
            String newPhone = normalizePhone(request.phone());
            if (newPhone != null) {
                if (!newPhone.matches("^0[0-9]{9}$")) {
                    throw new AppException(ErrorCode.INVALID_INPUT, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0");
                }
                if (!newPhone.equals(user.getPhone()) && userRepository.existsByPhoneAndIdNot(newPhone, id)) {
                    log.warn("Thất bại khi cập nhật user {}: Số điện thoại '{}' đã thuộc user khác", id, newPhone);
                    throw new AppException(ErrorCode.CONFLICT, "Số điện thoại '" + newPhone + "' đã được sử dụng bởi người dùng khác");
                }
            }
            user.setPhone(newPhone);
        }

        User updatedUser = userRepository.save(user);
        log.info("Cập nhật thành công thông tin người dùng ID: {}", id);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * UC-USER-04: Vô hiệu hóa hoặc kích hoạt lại tài khoản người dùng (giữ nguyên dữ liệu).
     */
    public UserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request) {
        User user = findUserByIdOrThrow(id);
        user.setStatus(request.status());

        User updatedUser = userRepository.save(user);
        log.info("Cập nhật trạng thái người dùng ID: {} sang {}", id, request.status());
        return userMapper.toResponse(updatedUser);
    }

    private User findUserByIdOrThrow(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng với ID: " + id));
    }

    private String normalizePhone(String rawPhone) {
        if (rawPhone == null) {
            return null;
        }
        String trimmed = rawPhone.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
