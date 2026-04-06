package com.example.ComplainSystem.config;

import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder encoder;

    public AdminSeeder(UserRepo userRepo, BCryptPasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepo.findByEmail("admin@mail.com").isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@mail.com")
                    .password(encoder.encode("admin123"))
                    .role("ADMIN")
                    .build();
            userRepo.save(admin);
            log.info("Default ADMIN user created.");
        }
    }
}
