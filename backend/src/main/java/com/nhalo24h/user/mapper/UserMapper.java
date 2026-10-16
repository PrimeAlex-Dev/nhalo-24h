package com.nhalo24h.user.mapper;

import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getStatus(),
            user.isEmailVerified(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
