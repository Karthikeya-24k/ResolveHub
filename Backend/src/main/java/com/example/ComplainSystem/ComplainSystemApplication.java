package com.example.ComplainSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import com.example.ComplainSystem.config.AppProperties;

@SpringBootApplication
@EnableMethodSecurity
@EnableAsync
@EnableConfigurationProperties(AppProperties.class)
public class ComplainSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ComplainSystemApplication.class, args);
	}

}

