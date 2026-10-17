package com.nhalo24h.provider.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin hồ sơ thợ hiển thị công khai cho khách hàng")
public record PublicProviderResponse(
    @Schema(description = "ID hồ sơ thợ", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "ID tài khoản người dùng", example = "0d9e48cb-6fdb-4b6d-a291-6f50e1179af9")
    UUID userId,

    @Schema(description = "Tên thợ", example = "Nguyễn Văn Minh")
    String name,

    @Schema(description = "URL ảnh đại diện", example = "https://example.com/avatar.jpg")
    String avatar,

    @Schema(description = "Chức danh / Tiêu đề nghề nghiệp", example = "Thợ Kỹ Thuật Điện Nước 5★")
    String headline,

    @Schema(description = "Công ty / Đơn vị (hoặc chức danh)", example = "Nhà Lo 24h Pro")
    String company,

    @Schema(description = "Giới thiệu bản thân", example = "Chuyên sửa chữa điện nước gia đình, bảo hành uy tín.")
    String about,

    @Schema(description = "Số năm kinh nghiệm", example = "5")
    Integer experienceYears,

    @Schema(description = "Đơn giá tham khảo (VNĐ/giờ)", example = "150000")
    Long pricePerHour,

    @Schema(description = "Khu vực hoạt động", example = "Quận Ninh Kiều, Cần Thơ")
    String serviceArea,

    @Schema(description = "Khoảng cách ước tính", example = "2,4 km")
    String distance,

    @Schema(description = "Thời gian phản hồi trung bình", example = "~10 phút")
    String responseTime,

    @Schema(description = "Trạng thái sẵn sàng nhận việc", example = "true")
    Boolean isAvailable,

    @Schema(description = "Nhãn trạng thái hiển thị", example = "Available today")
    String availability,

    @Schema(description = "Danh mục chính", example = "Điện gia dụng")
    String category,

    @Schema(description = "Danh sách danh mục dịch vụ đảm nhận")
    List<ProviderCategoryDto> categories,

    @Schema(description = "Điểm đánh giá trung bình", example = "4.9")
    Double rating,

    @Schema(description = "Tổng số lượt đánh giá", example = "128")
    Integer reviewsCount,

    @Schema(description = "Tổng số việc đã hoàn thành", example = "140+ việc")
    String completedJobsCount,

    @Schema(description = "Đã xác minh danh tính", example = "true")
    Boolean verified,

    @Schema(description = "Thợ xuất sắc / Top rated", example = "true")
    Boolean isTopRated
) {
}
