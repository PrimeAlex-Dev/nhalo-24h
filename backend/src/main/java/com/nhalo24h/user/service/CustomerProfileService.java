package com.nhalo24h.user.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.domain.CustomerProfile;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.dto.CustomerProfileResponse;
import com.nhalo24h.user.dto.UpdateCustomerProfileRequest;
import com.nhalo24h.user.repository.CustomerProfileRepository;
import com.nhalo24h.user.repository.UserRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerProfileService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public CustomerProfileService(
        UserRepository userRepository,
        CustomerProfileRepository customerProfileRepository
    ) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        CustomerProfile profile = customerProfileRepository.findByUserId(userId).orElse(null);

        return new CustomerProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            profile != null ? profile.getGender() : null,
            profile != null ? profile.getAddress() : null,
            user.getRole(),
            user.getCreatedAt(),
            profile != null && profile.getUpdatedAt() != null ? profile.getUpdatedAt() : user.getUpdatedAt()
        );
    }

    @Transactional
    public CustomerProfileResponse updateProfile(UUID userId, UpdateCustomerProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        // Cập nhật họ tên trên bảng users
        user.setFullName(request.fullName().trim());
        user = userRepository.save(user);

        // Cập nhật hoặc khởi tạo thông tin trên bảng customer_profiles
        CustomerProfile profile = customerProfileRepository.findByUserId(userId).orElse(null);
        String cleanedAddress = (request.address() != null && !request.address().isBlank()) 
            ? request.address().trim() 
            : null;

        if (profile == null) {
            profile = new CustomerProfile(user, request.gender(), cleanedAddress);
        } else {
            profile.setGender(request.gender());
            profile.setAddress(cleanedAddress);
        }
        profile = customerProfileRepository.save(profile);

        return new CustomerProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            profile.getGender(),
            profile.getAddress(),
            user.getRole(),
            user.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
