package com.nhalo24h.category.controller;

import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.dto.CategoryResponse;
import com.nhalo24h.category.dto.CreateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryStatusRequest;
import com.nhalo24h.category.service.ServiceCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/service-categories")
@Tag(name = "Service Category Management", description = "Các API phục vụ quản lý danh mục dịch vụ: Tạo, Xem danh sách, Chi tiết, Cập nhật và Bật/tắt trạng thái")
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    public ServiceCategoryController(ServiceCategoryService serviceCategoryService) {
        this.serviceCategoryService = serviceCategoryService;
    }

    @PostMapping
    @Operation(summary = "Tạo danh mục dịch vụ mới", description = "Tạo một danh mục dịch vụ mới. Nếu không truyền slug, hệ thống sẽ tự động sinh slug từ tên.")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = serviceCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách danh mục dịch vụ", description = "Lấy danh sách danh mục dịch vụ có hỗ trợ lọc theo trạng thái (ACTIVE/INACTIVE), tìm kiếm theo tên hoặc slug, và phân trang. Mặc định sắp xếp theo displayOrder tăng dần.")
    public ResponseEntity<Page<CategoryResponse>> getCategories(
        @Parameter(description = "Lọc theo trạng thái (ACTIVE, INACTIVE)")
        @RequestParam(required = false) CategoryStatus status,

        @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc slug")
        @RequestParam(required = false) String search,

        @ParameterObject
        @PageableDefault(page = 0, size = 20, sort = "displayOrder", direction = Sort.Direction.ASC)
        Pageable pageable
    ) {
        Page<CategoryResponse> response = serviceCategoryService.getCategories(status, search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết danh mục dịch vụ", description = "Lấy thông tin chi tiết một danh mục dịch vụ theo UUID.")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable UUID id) {
        CategoryResponse response = serviceCategoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục dịch vụ", description = "Cập nhật thông tin danh mục dịch vụ (tên, slug, mô tả, iconUrl, thứ tự hiển thị).")
    public ResponseEntity<CategoryResponse> updateCategory(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateCategoryRequest request
    ) {
        CategoryResponse response = serviceCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Bật/tắt trạng thái danh mục dịch vụ", description = "Thay đổi trạng thái danh mục sang ACTIVE hoặc INACTIVE.")
    public ResponseEntity<CategoryResponse> updateCategoryStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateCategoryStatusRequest request
    ) {
        CategoryResponse response = serviceCategoryService.updateCategoryStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
