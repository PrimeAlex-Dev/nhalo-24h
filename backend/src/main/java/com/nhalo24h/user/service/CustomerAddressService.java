package com.nhalo24h.user.service;

import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.dto.CreateCustomerAddressRequest;
import com.nhalo24h.user.dto.CustomerAddressResponse;
import com.nhalo24h.user.dto.UpdateCustomerAddressRequest;
import com.nhalo24h.user.repository.CustomerAddressRepository;
import com.nhalo24h.user.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerAddressService {

    private final UserRepository userRepository;
    private final CustomerAddressRepository customerAddressRepository;

    public CustomerAddressService(
        UserRepository userRepository,
        CustomerAddressRepository customerAddressRepository
    ) {
        this.userRepository = userRepository;
        this.customerAddressRepository = customerAddressRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerAddressResponse> getAddresses(UUID userId) {
        return customerAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public CustomerAddressResponse createAddress(UUID userId, CreateCustomerAddressRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        long addressCount = customerAddressRepository.countByUserId(userId);
        boolean shouldBeDefault = (addressCount == 0) || Boolean.TRUE.equals(request.isDefault());

        if (shouldBeDefault) {
            List<CustomerAddress> existingDefaults = customerAddressRepository.findAllByUserIdAndIsDefaultTrue(userId);
            for (CustomerAddress def : existingDefaults) {
                def.setDefault(false);
            }
            if (!existingDefaults.isEmpty()) {
                customerAddressRepository.saveAllAndFlush(existingDefaults);
            }
        }

        CustomerAddress address = new CustomerAddress(
            user,
            request.label().trim(),
            request.fullAddress().trim(),
            shouldBeDefault
        );

        address = customerAddressRepository.save(address);
        return mapToResponse(address);
    }

    @Transactional
    public CustomerAddressResponse updateAddress(UUID userId, UUID addressId, UpdateCustomerAddressRequest request) {
        CustomerAddress address = customerAddressRepository.findByIdAndUserId(addressId, userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa chỉ yêu cầu"));

        if (Boolean.TRUE.equals(request.isDefault()) && !address.isDefault()) {
            List<CustomerAddress> existingDefaults = customerAddressRepository.findAllByUserIdAndIsDefaultTrue(userId);
            for (CustomerAddress def : existingDefaults) {
                def.setDefault(false);
            }
            if (!existingDefaults.isEmpty()) {
                customerAddressRepository.saveAllAndFlush(existingDefaults);
            }
            address.setDefault(true);
        }

        address.setLabel(request.label().trim());
        address.setFullAddress(request.fullAddress().trim());

        address = customerAddressRepository.save(address);
        return mapToResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        CustomerAddress address = customerAddressRepository.findByIdAndUserId(addressId, userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa chỉ yêu cầu"));

        boolean wasDefault = address.isDefault();
        customerAddressRepository.delete(address);
        customerAddressRepository.flush();

        // Nếu xóa địa chỉ mặc định và vẫn còn địa chỉ khác, tự động đặt địa chỉ còn lại gần nhất làm mặc định
        if (wasDefault) {
            List<CustomerAddress> remaining = customerAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                CustomerAddress newDefault = remaining.get(0);
                newDefault.setDefault(true);
                customerAddressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public CustomerAddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        CustomerAddress address = customerAddressRepository.findByIdAndUserId(addressId, userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa chỉ yêu cầu"));

        if (!address.isDefault()) {
            List<CustomerAddress> existingDefaults = customerAddressRepository.findAllByUserIdAndIsDefaultTrue(userId);
            for (CustomerAddress def : existingDefaults) {
                def.setDefault(false);
            }
            if (!existingDefaults.isEmpty()) {
                customerAddressRepository.saveAllAndFlush(existingDefaults);
            }
            address.setDefault(true);
            address = customerAddressRepository.save(address);
        }

        return mapToResponse(address);
    }

    private CustomerAddressResponse mapToResponse(CustomerAddress address) {
        return new CustomerAddressResponse(
            address.getId(),
            address.getLabel(),
            address.getFullAddress(),
            address.isDefault(),
            address.getCreatedAt(),
            address.getUpdatedAt()
        );
    }
}
