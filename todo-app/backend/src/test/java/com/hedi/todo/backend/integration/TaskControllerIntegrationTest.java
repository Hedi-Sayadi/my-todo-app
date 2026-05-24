package com.hedi.todo.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.repository.CategoryRepository;
import java.time.LocalDate;
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
public class TaskControllerIntegrationTest {

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

  private RestTemplate restTemplate = new RestTemplate();

  @Autowired private CategoryRepository categoryRepository;

  @Test
  void createTaskThroughController() {
    // register user
    RegisterRequestDTO reg =
        RegisterRequestDTO.builder()
            .firstName("Test")
            .lastName("User")
            .email("integration@example.com")
            .password("password123")
            .confirmPassword("password123")
            .build();

    String base = "http://localhost:" + port;

    ResponseEntity<AuthResponseDTO> regResp =
        restTemplate.postForEntity(base + "/api/auth/register", reg, AuthResponseDTO.class);
    assertThat(regResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    String token = regResp.getBody().getToken();
    assertThat(token).isNotBlank();

    // create category directly
    Category c = new Category();
    c.setName("ControllerCategory");
    Category saved = categoryRepository.save(c);

    // create task DTO
    TaskRequestDTO req =
        TaskRequestDTO.builder()
            .title("Controller Task")
            .description("via TestRestTemplate")
            .priority(TaskPriority.HIGH)
            .status(TaskStatus.TODO)
            .categoryId(saved.getId())
            .deadline(LocalDate.now().plusDays(1))
            .build();

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);
    HttpEntity<TaskRequestDTO> entity = new HttpEntity<>(req, headers);

    ResponseEntity<TaskResponseDTO> resp =
        restTemplate.exchange(base + "/api/tasks", HttpMethod.POST, entity, TaskResponseDTO.class);
    assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    TaskResponseDTO created = resp.getBody();
    assertThat(created).isNotNull();
    assertThat(created.getTitle()).isEqualTo("Controller Task");

    // fetch all tasks
    HttpEntity<Void> getEntity = new HttpEntity<>(headers);
    ResponseEntity<TaskResponseDTO[]> listResp =
        restTemplate.exchange(
            base + "/api/tasks", HttpMethod.GET, getEntity, TaskResponseDTO[].class);
    assertThat(listResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(listResp.getBody())
        .extracting(TaskResponseDTO::getTitle)
        .contains("Controller Task");
  }
}
