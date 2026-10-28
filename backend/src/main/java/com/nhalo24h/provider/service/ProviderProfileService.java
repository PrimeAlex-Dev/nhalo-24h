package com.nhalo24h.provider.service;

import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderCategory;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.dto.ProviderCategoryDto;
import com.nhalo24h.provider.dto.ProviderProfileResponse;
import com.nhalo24h.provider.dto.PublicProviderResponse;
import com.nhalo24h.provider.dto.UpdateProviderProfileRequest;
import com.nhalo24h.provider.repository.ProviderCategoryRepository;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.storage.service.StorageService;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.service.WalletService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProviderProfileService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ProviderCategoryRepository providerCategoryRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final StorageService storageService;
    private final WalletService walletService;
    private final OrderRepository orderRepository;

    public ProviderProfileService(
        UserRepository userRepository,
        ProviderProfileRepository providerProfileRepository,
        ProviderCategoryRepository providerCategoryRepository,
        ServiceCategoryRepository serviceCategoryRepository,
        StorageService storageService,
        WalletService walletService,
        OrderRepository orderRepository
    ) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.providerCategoryRepository = providerCategoryRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.storageService = storageService;
        this.walletService = walletService;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public ProviderProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> {
                ProviderProfile newProfile = new ProviderProfile(user);
                return providerProfileRepository.save(newProfile);
            });

        // Lazy check: Nếu đã hết thời hạn đình chỉ nhận việc thì tự động gỡ phạt
        if (profile.getSuspendedUntil() != null && Instant.now().isAfter(profile.getSuspendedUntil())) {
            profile.setSuspendedUntil(null);
            profile = providerProfileRepository.save(profile);
        }

        return mapToProviderProfileResponse(user, profile);
    }

    @Transactional
    public ProviderProfileResponse updateProfile(UUID userId, UpdateProviderProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
            userRepository.save(user);
        }

        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> new ProviderProfile(user));

        if (request.avatarUrl() != null) {
            String newAvatarUrl = request.avatarUrl().trim().isEmpty() ? null : request.avatarUrl().trim();
            if (!Objects.equals(profile.getAvatarUrl(), newAvatarUrl)) {
                if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isBlank()) {
                    storageService.deleteFile(profile.getAvatarUrl());
                }
                profile.setAvatarUrl(newAvatarUrl);
            }
        }
        if (request.headline() != null) {
            profile.setHeadline(request.headline().trim().isEmpty() ? null : request.headline().trim());
        }
        if (request.bio() != null) {
            profile.setBio(request.bio().trim().isEmpty() ? null : request.bio().trim());
        }
        if (request.experienceYears() != null) {
            profile.setExperienceYears(Math.max(0, request.experienceYears()));
        }
        if (request.pricePerHour() != null) {
            profile.setPricePerHour(Math.max(0L, request.pricePerHour()));
        }
        if (request.serviceArea() != null) {
            profile.setServiceArea(request.serviceArea().trim().isEmpty() ? null : request.serviceArea().trim());
        }
        if (request.isAvailable() != null) {
            if (Boolean.TRUE.equals(request.isAvailable())) {
                // Kiểm tra kỷ luật đình chỉ
                if (profile.isSuspended()) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
                    throw new AppException(ErrorCode.FORBIDDEN,
                            "Tài khoản đang bị đình chỉ nhận việc đến " + formatter.format(profile.getSuspendedUntil()) +
                            " do vi phạm quy chế sàn. Không thể bật nhận việc.");
                }
                walletService.validateProviderCanAcceptOrders(profile.getId());
            }
            profile.setIsAvailable(request.isAvailable());
        }

        profile = providerProfileRepository.save(profile);

        // Cập nhật danh mục phụ trách nếu có truyền
        if (request.categoryIds() != null) {
            syncCategories(profile, request.categoryIds());
            profile = providerProfileRepository.findById(profile.getId()).orElse(profile);
        }

        return mapToProviderProfileResponse(user, profile);
    }

    @Transactional
    public ProviderProfileResponse updateCategories(UUID userId, List<UUID> categoryIds) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> providerProfileRepository.save(new ProviderProfile(user)));

        syncCategories(profile, categoryIds);
        profile = providerProfileRepository.findById(profile.getId()).orElse(profile);

        return mapToProviderProfileResponse(user, profile);
    }

    @Transactional
    public ProviderProfileResponse uploadAvatar(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> providerProfileRepository.save(new ProviderProfile(user)));

        String oldAvatarUrl = profile.getAvatarUrl();
        String newAvatarUrl = storageService.storeFile(file, "avatars");

        profile.setAvatarUrl(newAvatarUrl);
        profile = providerProfileRepository.save(profile);

        if (oldAvatarUrl != null && !oldAvatarUrl.isBlank()) {
            storageService.deleteFile(oldAvatarUrl);
        }

        return mapToProviderProfileResponse(user, profile);
    }

    @Transactional
    public ProviderProfileResponse deleteAvatar(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin người dùng"));

        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
            .orElseGet(() -> providerProfileRepository.save(new ProviderProfile(user)));

        String oldAvatarUrl = profile.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.isBlank()) {
            storageService.deleteFile(oldAvatarUrl);
            profile.setAvatarUrl(null);
            profile = providerProfileRepository.save(profile);
        }

        return mapToProviderProfileResponse(user, profile);
    }

    @Transactional(readOnly = true)
    public List<PublicProviderResponse> getPublicProviders(String category, String search, Boolean availableOnly) {
        // Mặc định luôn lọc chỉ các thợ đang hoạt động và sẵn sàng nhận việc (trừ khi có chỉ định khác)
        boolean filterAvailable = (availableOnly == null) || Boolean.TRUE.equals(availableOnly);

        List<ProviderProfile> allProfiles = providerProfileRepository.findAllActiveProviders();

        final String normalizedCategory = (category != null && !category.isBlank())
            ? category.trim().toLowerCase()
            : null;

        final String normalizedSearch = (search != null && !search.isBlank())
            ? search.trim().toLowerCase()
            : null;

        return allProfiles.stream()
            .filter(p -> {
                // 1. Thợ bị đình chỉ kỷ luật hoặc tài khoản User không ACTIVE -> Tuyệt đối không hiển thị công khai
                if (p.isSuspended()) {
                    return false;
                }
                if (p.getUser() == null || p.getUser().getStatus() != UserStatus.ACTIVE) {
                    return false;
                }

                // 2. Nếu đang lọc thợ khả thi / sẵn sàng nhận việc (mặc định filterAvailable = true)
                if (filterAvailable) {
                    // Thợ tắt nhận việc -> không hiển thị
                    if (!Boolean.TRUE.equals(p.getIsAvailable())) {
                        return false;
                    }
                    // Thợ có ví không đủ điều kiện (hụt cọc, cooling rút cọc, closed) -> không hiển thị
                    if (!walletService.isProviderEligibleToAcceptOrders(p.getId())) {
                        return false;
                    }
                }

                // 3. Lọc theo danh mục dịch vụ
                if (normalizedCategory != null) {
                    boolean matchesCategory = p.getProviderCategories().stream().anyMatch(pc -> {
                        ServiceCategory sc = pc.getCategory();
                        return sc.getName().toLowerCase().contains(normalizedCategory) ||
                               sc.getSlug().equalsIgnoreCase(normalizedCategory) ||
                               sc.getId().toString().equalsIgnoreCase(normalizedCategory);
                    });
                    if (!matchesCategory) {
                        return false;
                    }
                }

                // 4. Lọc theo từ khóa tìm kiếm
                if (normalizedSearch != null) {
                    String name = p.getUser() != null ? p.getUser().getFullName().toLowerCase() : "";
                    String headline = p.getHeadline() != null ? p.getHeadline().toLowerCase() : "";
                    String serviceArea = p.getServiceArea() != null ? p.getServiceArea().toLowerCase() : "";
                    String bio = p.getBio() != null ? p.getBio().toLowerCase() : "";

                    boolean matchesSearch = name.contains(normalizedSearch) ||
                                           headline.contains(normalizedSearch) ||
                                           serviceArea.contains(normalizedSearch) ||
                                           bio.contains(normalizedSearch);
                    if (!matchesSearch) {
                        return false;
                    }
                }

                return true;
            })
            .map(this::mapToPublicProviderResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PublicProviderResponse getPublicProviderById(UUID id) {
        ProviderProfile profile = providerProfileRepository.findByIdWithUser(id)
            .or(() -> providerProfileRepository.findByUserIdWithUser(id))
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ thợ"));

        return mapToPublicProviderResponse(profile);
    }

    private void syncCategories(ProviderProfile profile, List<UUID> categoryIds) {
        if (categoryIds == null) {
            return;
        }

        if (profile.getProviderCategories() == null) {
            profile.setProviderCategories(new HashSet<>());
        }

        Set<UUID> targetCategoryIds = new HashSet<>(categoryIds);

        Set<UUID> currentCategoryIds = profile.getProviderCategories().stream()
            .filter(pc -> pc.getCategory() != null)
            .map(pc -> pc.getCategory().getId())
            .collect(Collectors.toSet());

        // Nếu danh mục không hề thay đổi -> không cần thao tác gì, tránh sinh SQL thừa và tránh lỗi duplicate constraint
        if (currentCategoryIds.equals(targetCategoryIds)) {
            return;
        }

        // 1. Loại bỏ các danh mục không còn được chọn
        profile.getProviderCategories().removeIf(pc -> 
            pc.getCategory() == null || !targetCategoryIds.contains(pc.getCategory().getId())
        );

        // 2. Chỉ tạo mới các danh mục thực sự mới
        for (UUID catId : targetCategoryIds) {
            if (!currentCategoryIds.contains(catId)) {
                serviceCategoryRepository.findById(catId).ifPresent(cat -> {
                    ProviderCategory pc = new ProviderCategory(profile, cat);
                    profile.getProviderCategories().add(pc);
                });
            }
        }

        providerProfileRepository.save(profile);
    }

    private ProviderProfileResponse mapToProviderProfileResponse(User user, ProviderProfile profile) {
        List<ProviderCategoryDto> categoryDtos = profile.getProviderCategories() != null
            ? profile.getProviderCategories().stream()
                .map(pc -> new ProviderCategoryDto(
                    pc.getCategory().getId(),
                    pc.getCategory().getName(),
                    pc.getCategory().getSlug(),
                    pc.getCategory().getIconUrl()
                ))
                .toList()
            : Collections.emptyList();

        return new ProviderProfileResponse(
            profile.getId(),
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            profile.getAvatarUrl(),
            profile.getHeadline(),
            profile.getBio(),
            profile.getExperienceYears(),
            profile.getPricePerHour(),
            profile.getServiceArea(),
            profile.getIsAvailable(),
            profile.getSuspendedUntil(),
            profile.isSuspended(),
            profile.getWarningCount() != null ? profile.getWarningCount() : 0,
            categoryDtos,
            profile.getRatingAverage() != null ? profile.getRatingAverage() : 5.0,
            profile.getReviewCount() != null ? profile.getReviewCount() : 0,
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }

    private PublicProviderResponse mapToPublicProviderResponse(ProviderProfile profile) {
        User user = profile.getUser();
        String name = user != null ? user.getFullName() : "Thợ đối tác";

        List<ProviderCategoryDto> categoryDtos = profile.getProviderCategories() != null
            ? profile.getProviderCategories().stream()
                .map(pc -> new ProviderCategoryDto(
                    pc.getCategory().getId(),
                    pc.getCategory().getName(),
                    pc.getCategory().getSlug(),
                    pc.getCategory().getIconUrl()
                ))
                .toList()
            : Collections.emptyList();

        String primaryCategory = !categoryDtos.isEmpty() ? categoryDtos.get(0).name() : "Chưa có";

        String headline = (profile.getHeadline() != null && !profile.getHeadline().isBlank())
            ? profile.getHeadline()
            : primaryCategory;

        boolean isEligible = walletService.isProviderEligibleToAcceptOrders(profile.getId());
        boolean isSuspended = profile.isSuspended();
        boolean isUserActive = profile.getUser() != null && profile.getUser().getStatus() == UserStatus.ACTIVE;
        boolean isAvail = Boolean.TRUE.equals(profile.getIsAvailable()) && !isSuspended && isUserActive && isEligible;
        String availability = isAvail ? "Available today" : "Available soon";

        long completedJobs = orderRepository.countByAssignedProviderIdAndStatus(profile.getId(), OrderStatus.COMPLETED);

        return new PublicProviderResponse(
            profile.getId(),
            user != null ? user.getId() : null,
            name,
            profile.getAvatarUrl(),
            headline,
            "Nhà Lo 24h Pro",
            profile.getBio(),
            profile.getExperienceYears() != null ? profile.getExperienceYears() : 0,
            profile.getPricePerHour() != null ? profile.getPricePerHour() : 0L,
            profile.getServiceArea() != null ? profile.getServiceArea() : "TP. Hồ Chí Minh",
            "1.8 km",
            "~10 phút",
            isAvail,
            availability,
            primaryCategory,
            categoryDtos,
            profile.getRatingAverage() != null ? profile.getRatingAverage() : 5.0,
            profile.getReviewCount() != null ? profile.getReviewCount() : 0,
            String.valueOf(completedJobs),
            true,
            true
        );
    }
}
