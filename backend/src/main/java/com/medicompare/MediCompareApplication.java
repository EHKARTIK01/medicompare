package com.medicompare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MediCompareApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediCompareApplication.class, args);
    }
}
