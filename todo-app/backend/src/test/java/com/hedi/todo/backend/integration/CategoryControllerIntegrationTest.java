package com.hedi.todo.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CategoryControllerIntegrationTest {

  @Container
  public static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16")
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

  @LocalServerPort private int port;

  private RestTemplate rest = new RestTemplate();

  @Autowired private CategoryRepository categoryRepository;

  AuthResponseDTO registerAndGetToken() {
    String base = "http://localhost:" + port;
    RegisterRequestDTO reg =
        RegisterRequestDTO.builder()
            .firstName("Cat")
            .lastName("Tester")
            .email("cat@example.com")
            .password("password123")
            .confirmPassword("password123")
            .build();
    ResponseEntity<AuthResponseDTO> regResp =
        rest.postForEntity(base + "/api/auth/register", reg, AuthResponseDTO.class);
    return regResp.getBody();
  }

  @Test
  void createAndGetCategory() {
    String base = "http://localhost:" + port;
    AuthResponseDTO auth = registerAndGetToken();
    String token = auth.getToken();

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);

    CategoryRequestDTO dto =
        CategoryRequestDTO.builder().name("IntegrationCat").description("desc").build();
    HttpEntity<CategoryRequestDTO> entity = new HttpEntity<>(dto, headers);

    ResponseEntity<CategoryResponseDTO> resp =
        rest.exchange(base + "/api/categories", HttpMethod.POST, entity, CategoryResponseDTO.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    CategoryResponseDTO created = resp.getBody();
    assertThat(created.getName()).isEqualTo("IntegrationCat");

    ResponseEntity<CategoryResponseDTO[]> listResp =
        rest.exchange(
            base + "/api/categories",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            CategoryResponseDTO[].class);
    assertThat(listResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(listResp.getBody())
        .extracting(CategoryResponseDTO::getName)
        .contains("IntegrationCat");
  }
}
