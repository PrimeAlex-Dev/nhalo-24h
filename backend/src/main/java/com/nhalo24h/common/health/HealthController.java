package com.nhalo24h.common.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "System Health", description = "Endpoint kiểm tra tình trạng kết nối và vận hành của hệ thống")
public class HealthController {

    private final String applicationName;

    public HealthController(@Value("${spring.application.name:nhalo24h-backend}") String applicationName) {
        this.applicationName = applicationName;
    }

    @GetMapping
    @Operation(summary = "Kiểm tra sức khỏe hệ thống", description = "Trả về trạng thái UP nếu backend đang hoạt động bình thường")
    public ResponseEntity<HealthCheckResponse> checkHealth() {
        return ResponseEntity.ok(HealthCheckResponse.up(applicationName));
    }
}
