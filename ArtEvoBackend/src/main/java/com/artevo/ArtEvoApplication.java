package com.artevo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// 1. Add these new imports
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class ArtEvoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArtEvoApplication.class, args);
    }

    // 2. Add this Bean method
    // This creates the "phone line" to call your microservice
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}