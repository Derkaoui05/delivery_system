package com.project.backend.config;

import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args){
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(30) NOT NULL");
        } catch (Exception e) {
            System.err.println("Note: could not alter users.role: " + e.getMessage());
        }

        if(userRepo.existsByEmail("admin@livraison.com")){
            return;
        }
        User admin = new User();
        admin.setEmail("admin@livraison.com");
        admin.setPasswordHash(passwordEncoder.encode("admin1234"));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepo.save(admin);
        System.out.println("Seeded admin account : admin@livraison.com / admin1234");
    }
}
