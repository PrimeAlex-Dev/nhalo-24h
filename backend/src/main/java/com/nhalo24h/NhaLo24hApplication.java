package com.nhalo24h;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class NhaLo24hApplication {

    public static void main(String[] args) {
        SpringApplication.run(NhaLo24hApplication.class, args);
    }
}
