package com.nhalo24h.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        List<ErrorResponse.FieldErrorItem> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> new ErrorResponse.FieldErrorItem(
                error.getField(),
                error.getDefaultMessage() != null ? error.getDefaultMessage() : "Giá trị không hợp lệ"
            ))
            .toList();

        ErrorResponse response = ErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            ErrorCode.INVALID_INPUT.name(),
            "Dữ liệu đầu vào không hợp lệ",
            request.getRequestURI(),
            details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
        ConstraintViolationException ex,
        HttpServletRequest request
    ) {
        List<ErrorResponse.FieldErrorItem> details = ex.getConstraintViolations()
            .stream()
            .map(violation -> new ErrorResponse.FieldErrorItem(
                violation.getPropertyPath().toString(),
                violation.getMessage()
            ))
            .toList();

        ErrorResponse response = ErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            ErrorCode.INVALID_INPUT.name(),
            "Ràng buộc dữ liệu không thỏa mãn",
            request.getRequestURI(),
            details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(
        AppException ex,
        HttpServletRequest request
    ) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse response = ErrorResponse.of(
            errorCode.getHttpStatus().value(),
            errorCode.name(),
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
        AuthenticationException ex,
        HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.UNAUTHORIZED.value(),
            ErrorCode.UNAUTHORIZED.name(),
            "Xác thực thất bại hoặc phiên làm việc đã hết hạn",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
        AccessDeniedException ex,
        HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.FORBIDDEN.value(),
            ErrorCode.FORBIDDEN.name(),
            ErrorCode.FORBIDDEN.getDefaultMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
        NoResourceFoundException ex,
        HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.NOT_FOUND.value(),
            ErrorCode.RESOURCE_NOT_FOUND.name(),
            "Không tìm thấy endpoint yêu cầu: " + request.getRequestURI(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(
        HttpRequestMethodNotSupportedException ex,
        HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.METHOD_NOT_ALLOWED.value(),
            ErrorCode.METHOD_NOT_ALLOWED.name(),
            "Phương thức " + ex.getMethod() + " không được hỗ trợ cho endpoint này",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
        org.springframework.http.converter.HttpMessageNotReadableException ex,
        HttpServletRequest request
    ) {
        log.warn("Dữ liệu request body không đọc được hoặc sai định dạng trên path {}: {}", request.getRequestURI(), ex.getMessage());

        String message = "Dữ liệu JSON không hợp lệ hoặc sai định dạng";
        List<ErrorResponse.FieldErrorItem> details = null;

        Throwable cause = ex.getCause();
        if (cause instanceof com.fasterxml.jackson.databind.exc.InvalidFormatException ifx) {
            String fieldName = ifx.getPath().stream()
                .map(ref -> ref.getFieldName() != null ? ref.getFieldName() : "")
                .filter(name -> !name.isEmpty())
                .reduce((first, second) -> second)
                .orElse("field");

            Class<?> targetType = ifx.getTargetType();
            if (targetType != null && targetType.isEnum()) {
                String acceptedValues = java.util.Arrays.toString(targetType.getEnumConstants());
                message = "Giá trị '" + ifx.getValue() + "' không hợp lệ cho trường '" + fieldName + "'. Các giá trị được chấp nhận: " + acceptedValues;
                details = List.of(new ErrorResponse.FieldErrorItem(fieldName, "Phải là một trong các giá trị: " + acceptedValues));
            } else {
                message = "Giá trị '" + ifx.getValue() + "' không đúng kiểu dữ liệu cho trường '" + fieldName + "'";
                details = List.of(new ErrorResponse.FieldErrorItem(fieldName, message));
            }
        }

        ErrorResponse response = ErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            ErrorCode.INVALID_INPUT.name(),
            message,
            request.getRequestURI(),
            details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex,
        HttpServletRequest request
    ) {
        log.warn("Tham số request không đúng kiểu dữ liệu trên path {}: param={}, value={}", request.getRequestURI(), ex.getName(), ex.getValue());

        String paramName = ex.getName();
        Object value = ex.getValue();
        Class<?> requiredType = ex.getRequiredType();

        String message;
        if (requiredType != null && requiredType.isEnum()) {
            String acceptedValues = java.util.Arrays.toString(requiredType.getEnumConstants());
            message = "Tham số '" + paramName + "' nhận giá trị '" + value + "' không hợp lệ. Các giá trị được chấp nhận: " + acceptedValues;
        } else if (requiredType != null && requiredType.equals(java.util.UUID.class)) {
            message = "Tham số '" + paramName + "' có giá trị '" + value + "' không phải là định dạng UUID hợp lệ";
        } else {
            message = "Tham số '" + paramName + "' có giá trị '" + value + "' không hợp lệ";
        }

        ErrorResponse response = ErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            ErrorCode.INVALID_INPUT.name(),
            message,
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
        Exception ex,
        HttpServletRequest request
    ) {
        log.error("Unhandled internal server error occurred on path: {}", request.getRequestURI(), ex);

        ErrorResponse response = ErrorResponse.of(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ErrorCode.INTERNAL_SERVER_ERROR.name(),
            ErrorCode.INTERNAL_SERVER_ERROR.getDefaultMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
