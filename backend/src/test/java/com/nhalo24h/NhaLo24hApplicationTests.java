package com.nhalo24h;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NhaLo24hApplicationTests {

    @Test
    @DisplayName("Khởi tạo Spring ApplicationContext, Flyway migration và Hibernate validate thành công")
    void contextLoads() {
        // Kiểm tra toàn bộ Spring ApplicationContext, DataSource, Flyway migration
        // và Hibernate validate khởi động hoàn tất không có lỗi.
    }
}
