package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "Yêu cầu gửi báo giá cuối sau khảo sát hoặc yêu cầu điều chỉnh phát sinh trong khi sửa")
public record SubmitSurveyQuoteRequest(
    @Schema(description = "Tiền công thực tế chốt (VNĐ)", example = "250000")
    @NotNull(message = "Tiền công không được để trống")
    @Min(value = 0, message = "Tiền công không được âm")
    Long laborFee,

    @Schema(description = "Kết quả kiểm tra hiện trạng hoặc lý do điều chỉnh phát sinh", example = "Phát hiện hỏng thêm tụ đề và rò gas đầu tán, cần thay thế linh kiện.")
    @NotBlank(message = "Vui lòng nhập kết quả khảo sát hoặc lý do điều chỉnh chi phí")
    String diagnosisOrReason,

    @Schema(description = "Danh sách vật tư / linh kiện cần dùng")
    @Valid
    List<QuoteItemDto> items,

    @Schema(description = "Danh sách ảnh chụp hiện trường lúc khảo sát (tùy chọn)")
    List<String> surveyImageUrls
) {
}
