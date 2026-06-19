package com.example.ComplainSystem.config;


import com.example.ComplainSystem.repository.UserRepo;
import com.example.ComplainSystem.util.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserRepo userRepo;

    @Value("${app.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter, UserRepo userRepo) {
        this.jwtFilter = jwtFilter;
        this.userRepo  = userRepo;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Providing this bean disables Spring Boot's inMemoryUserDetailsManager auto-config
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            var user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Supports comma-separated list: http://localhost:5173,https://resolvehub.vercel.app
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/users/register", "/users/login").permitAll()
                .requestMatchers("/organizations/auth/external").permitAll()
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/track/**").permitAll()
                .requestMatchers("/applications/submit").permitAll()
                .requestMatchers("/applications", "/applications/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/organizations/my").hasRole("ADMIN")
                .requestMatchers("/organizations", "/organizations/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                .requestMatchers("/users/stats", "/users/admins").hasRole("SUPER_ADMIN")
                .requestMatchers("/users/change-password").hasAnyRole("USER", "ADMIN", "STAFF", "SUPER_ADMIN")
                .requestMatchers("/users/managed", "/users/managed/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/users/*/role").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/users").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/users/*").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/issues/assign").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/issues/status").hasAnyRole("STAFF", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/issues/all").hasAnyRole("STAFF", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/issues", "/issues/**").hasAnyRole("USER", "ADMIN", "STAFF", "SUPER_ADMIN")
                .requestMatchers("/comments", "/comments/**").hasAnyRole("USER", "ADMIN", "STAFF", "SUPER_ADMIN")
                .requestMatchers("/notifications", "/notifications/**").hasAnyRole("USER", "ADMIN", "STAFF", "SUPER_ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
