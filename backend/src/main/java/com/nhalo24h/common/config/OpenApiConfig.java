package com.nhalo24h.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI nhaLo24hOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Nhà Lo 24h - Backend API")
                .description("Hệ thống REST API nền tảng kết nối khách hàng với dịch vụ chăm sóc, bảo trì và sửa chữa nhà ở.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Nhà Lo 24h Engineering Team")
                    .email("dev@nhalo24h.vn")
                )
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
            .components(new Components()
                .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                    .name(SECURITY_SCHEME_NAME)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Nhập JSON Web Token (JWT) theo định dạng: Bearer {token}")
                )
            );
    }
}
