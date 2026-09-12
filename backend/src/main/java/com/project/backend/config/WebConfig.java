package com.project.backend.config;


import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    // Note: CORS is now configured in SecurityConfig via CorsConfigurationSource
    // to ensure Spring Security filters (preflight OPTIONS) and Spring MVC are handled consistently
    // without emitting duplicate Access-Control-Allow-* headers.
}
