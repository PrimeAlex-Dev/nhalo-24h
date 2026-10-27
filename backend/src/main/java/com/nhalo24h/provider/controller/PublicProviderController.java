package com.nhalo24h.provider.controller;

import com.nhalo24h.provider.dto.PublicProviderResponse;
import com.nhalo24h.provider.service.ProviderProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/providers")
@Tag(name = "Public Providers", description = "Các API công khai tra cứu và tìm kiếm thông tin thợ phục vụ khách hàng")
public class PublicProviderController {

    private final ProviderProfileService providerProfileService;

    public PublicProviderController(ProviderProfileService providerProfileService) {
        this.providerProfileService = providerProfileService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm danh sách thợ", description = "Lấy danh sách thợ thật từ database, hỗ trợ lọc theo danh mục, từ khóa tìm kiếm và trạng thái sẵn sàng.")
    public ResponseEntity<List<PublicProviderResponse>> getProviders(
        @Parameter(description = "Tên, slug hoặc UUID của danh mục dịch vụ")
        @RequestParam(required = false) String category,

        @Parameter(description = "Từ khóa tìm kiếm theo tên, chuyên môn hoặc khu vực")
        @RequestParam(required = false) String search,

        @Parameter(description = "Chỉ hiển thị thợ đang sẵn sàng nhận việc")
        @RequestParam(required = false, defaultValue = "true") Boolean availableOnly
    ) {
        List<PublicProviderResponse> response = providerProfileService.getPublicProviders(category, search, availableOnly);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết hồ sơ thợ", description = "Lấy thông tin chi tiết một thợ theo ID hồ sơ hoặc User ID.")
    public ResponseEntity<PublicProviderResponse> getProviderById(@PathVariable UUID id) {
        PublicProviderResponse response = providerProfileService.getPublicProviderById(id);
        return ResponseEntity.ok(response);
    }
}
