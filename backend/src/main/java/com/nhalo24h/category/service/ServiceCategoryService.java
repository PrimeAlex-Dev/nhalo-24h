package com.nhalo24h.category.service;

import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.dto.CategoryResponse;
import com.nhalo24h.category.dto.CreateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryStatusRequest;
import com.nhalo24h.category.mapper.CategoryMapper;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.common.util.SlugUtils;
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
public class ServiceCategoryService {

    private static final Logger log = LoggerFactory.getLogger(ServiceCategoryService.class);

    private final ServiceCategoryRepository serviceCategoryRepository;
    private final CategoryMapper categoryMapper;

    public ServiceCategoryService(ServiceCategoryRepository serviceCategoryRepository, CategoryMapper categoryMapper) {
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.categoryMapper = categoryMapper;
    }

    /**
     * Tạo danh mục dịch vụ mới.
     * Tự động sinh slug từ tên nếu client không chỉ định slug.
     */
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String rawSlug = request.slug() != null && !request.slug().trim().isEmpty() 
            ? request.slug() 
            : request.name();

        String normalizedSlug = SlugUtils.toSlug(rawSlug);
        if (normalizedSlug.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Không thể tạo slug hợp lệ từ tên danh mục");
        }

        if (serviceCategoryRepository.existsBySlugIgnoreCase(normalizedSlug)) {
            log.warn("Thất bại khi tạo danh mục: Slug '{}' đã tồn tại", normalizedSlug);
            throw new AppException(ErrorCode.CONFLICT, "Slug '" + normalizedSlug + "' đã tồn tại");
        }

        int displayOrder = request.displayOrder() != null ? request.displayOrder() : 0;
        CategoryStatus status = request.status() != null ? request.status() : CategoryStatus.ACTIVE;

        ServiceCategory category = new ServiceCategory(
            request.name().trim(),
            normalizedSlug,
            request.description(),
            request.iconUrl(),
            status,
            displayOrder
        );

        ServiceCategory savedCategory = serviceCategoryRepository.save(category);
        log.info("Tạo mới danh mục dịch vụ thành công: ID = {}, Slug = {}, Name = '{}'", 
            savedCategory.getId(), savedCategory.getSlug(), savedCategory.getName());

        return categoryMapper.toResponse(savedCategory);
    }

    /**
     * Lấy danh sách danh mục dịch vụ có phân trang, lọc theo status và tìm kiếm theo tên hoặc slug.
     */
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(CategoryStatus status, String search, Pageable pageable) {
        Specification<ServiceCategory> spec = (root, query, cb) -> cb.conjunction();

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), keyword),
                cb.like(cb.lower(root.get("slug")), keyword)
            ));
        }

        return serviceCategoryRepository.findAll(spec, pageable).map(categoryMapper::toResponse);
    }

    /**
     * Lấy thông tin chi tiết một danh mục dịch vụ theo ID.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        ServiceCategory category = findCategoryByIdOrThrow(id);
        return categoryMapper.toResponse(category);
    }

    /**
     * Cập nhật thông tin danh mục dịch vụ (tên, slug, mô tả, iconUrl, thứ tự hiển thị).
     */
    public CategoryResponse updateCategory(UUID id, UpdateCategoryRequest request) {
        ServiceCategory category = findCategoryByIdOrThrow(id);

        if (request.name() != null) {
            if (request.name().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Tên danh mục không được để trống");
            }
            category.setName(request.name().trim());
        }

        if (request.slug() != null) {
            if (request.slug().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Slug không được để trống");
            }
            String newSlug = SlugUtils.toSlug(request.slug());
            if (newSlug.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Slug không hợp lệ");
            }
            if (!newSlug.equalsIgnoreCase(category.getSlug()) && serviceCategoryRepository.existsBySlugIgnoreCaseAndIdNot(newSlug, id)) {
                log.warn("Thất bại khi cập nhật danh mục {}: Slug '{}' đã tồn tại", id, newSlug);
                throw new AppException(ErrorCode.CONFLICT, "Slug '" + newSlug + "' đã tồn tại");
            }
            category.setSlug(newSlug);
        }

        if (request.description() != null) {
            category.setDescription(request.description().trim().isEmpty() ? null : request.description().trim());
        }

        if (request.iconUrl() != null) {
            category.setIconUrl(request.iconUrl().trim().isEmpty() ? null : request.iconUrl().trim());
        }

        if (request.displayOrder() != null) {
            category.setDisplayOrder(request.displayOrder());
        }

        ServiceCategory updatedCategory = serviceCategoryRepository.save(category);
        log.info("Cập nhật thành công danh mục dịch vụ ID: {}", id);
        return categoryMapper.toResponse(updatedCategory);
    }

    /**
     * Bật hoặc tắt trạng thái danh mục dịch vụ (ACTIVE / INACTIVE).
     */
    public CategoryResponse updateCategoryStatus(UUID id, UpdateCategoryStatusRequest request) {
        ServiceCategory category = findCategoryByIdOrThrow(id);
        category.setStatus(request.status());

        ServiceCategory updatedCategory = serviceCategoryRepository.save(category);
        log.info("Cập nhật trạng thái danh mục dịch vụ ID: {} sang {}", id, request.status());
        return categoryMapper.toResponse(updatedCategory);
    }

    private ServiceCategory findCategoryByIdOrThrow(UUID id) {
        return serviceCategoryRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy danh mục dịch vụ với ID: " + id));
    }
}
