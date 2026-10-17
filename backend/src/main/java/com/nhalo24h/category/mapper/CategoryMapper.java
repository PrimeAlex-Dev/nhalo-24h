package com.nhalo24h.category.mapper;

import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.dto.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(ServiceCategory category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getSlug(),
            category.getDescription(),
            category.getIconUrl(),
            category.getStatus(),
            category.getDisplayOrder(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
