package com.nhalo24h.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Tiện ích chuẩn hóa chuỗi và sinh slug (SEO-friendly identifier).
 */
public final class SlugUtils {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-+");
    private static final Pattern LEADING_TRAILING_HYPHEN = Pattern.compile("(^-+|-+$)");

    private SlugUtils() {
    }

    /**
     * Chuyển đổi một chuỗi văn bản (kể cả có dấu tiếng Việt) thành slug chuẩn.
     * Ví dụ: "Điện dân dụng" -> "dien-dan-dung"
     */
    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        String text = input.trim();
        // Xử lý các ký tự đặc thù tiếng Việt không nằm trong NFD diacritics
        text = text.replace("đ", "d").replace("Đ", "d");
        // Khử dấu tiếng Việt
        text = Normalizer.normalize(text, Normalizer.Form.NFD);
        text = DIACRITICS.matcher(text).replaceAll("");
        // Đưa về chữ thường
        text = text.toLowerCase(Locale.ROOT);
        // Thay thế ký tự không phải chữ số thành dấu gạch ngang
        text = NON_ALPHANUMERIC.matcher(text).replaceAll("-");
        // Khử gạch ngang liên tiếp
        text = MULTI_HYPHEN.matcher(text).replaceAll("-");
        // Khử gạch ngang ở đầu và cuối chuỗi
        return LEADING_TRAILING_HYPHEN.matcher(text).replaceAll("");
    }
}
