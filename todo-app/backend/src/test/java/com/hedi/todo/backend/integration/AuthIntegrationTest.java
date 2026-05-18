package com.hedi.todo.backend.integration;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.LoginRequestDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthIntegrationTest {

    @Container
    public static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void registerPgProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
    }

    @LocalServerPort
    private int port;

    private RestTemplate rest = new RestTemplate();

    @Test
    void registerAndLogin() {
        String base = "http://localhost:" + port;
        RegisterRequestDTO reg = RegisterRequestDTO.builder()
                .firstName("Auth")
                .lastName("Tester")
                .email("auth@example.com")
                .password("password123")
                .confirmPassword("password123")
                .build();

        ResponseEntity<AuthResponseDTO> regResp = rest.postForEntity(base + "/api/auth/register", reg, AuthResponseDTO.class);
        assertThat(regResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(regResp.getBody()).isNotNull();
        String token = regResp.getBody().getToken();
        assertThat(token).isNotBlank();

        LoginRequestDTO login = LoginRequestDTO.builder()
                .email("auth@example.com")
                .password("password123")
                .build();

        ResponseEntity<AuthResponseDTO> loginResp = rest.postForEntity(base + "/api/auth/login", login, AuthResponseDTO.class);
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResp.getBody().getToken()).isNotBlank();
    }

    @Test
    void invalidLoginReturnsUnauthorized() {
        String base = "http://localhost:" + port;
        LoginRequestDTO login = LoginRequestDTO.builder()
                .email("noone@example.com")
                .password("wrong")
                .build();

        assertThatThrownBy(() -> rest.postForEntity(base + "/api/auth/login", login, AuthResponseDTO.class))
                .isInstanceOf(HttpClientErrorException.class)
                .hasMessageContaining("401");
    }
}
