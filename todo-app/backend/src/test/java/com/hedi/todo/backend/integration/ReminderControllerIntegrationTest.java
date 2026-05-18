package com.hedi.todo.backend.integration;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.LoginRequestDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.entity.Category;
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
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ReminderControllerIntegrationTest {

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

    @Autowired
    private CategoryRepository categoryRepository;

    AuthResponseDTO registerAndGetToken() {
        String base = "http://localhost:" + port;
        RegisterRequestDTO reg = RegisterRequestDTO.builder()
                .firstName("Rem")
                .lastName("Tester")
                .email("rem@example.com")
                .password("password123")
                .confirmPassword("password123")
                .build();
        ResponseEntity<AuthResponseDTO> regResp = rest.postForEntity(base + "/api/auth/register", reg, AuthResponseDTO.class);
        return regResp.getBody();
    }

    @Test
    void createAndFetchReminder() {
        String base = "http://localhost:" + port;
        AuthResponseDTO auth = registerAndGetToken();
        String token = auth.getToken();

        Category c = new Category();
        c.setName("RemCat");
        Category saved = categoryRepository.save(c);

        // create a task via repository (reuse TaskRepository if needed in test) by creating minimal Task through REST via TaskController
        // create category and then task via REST
        // create reminder

        // create task
        // build a TaskRequestDTO dynamically to avoid tight coupling (reuse minimal fields)
        // For brevity, create task via the TaskController using REST

        // create task via REST
        // register already created user token in header

        // create a task first
        com.hedi.todo.backend.dto.TaskRequestDTO taskReq = com.hedi.todo.backend.dto.TaskRequestDTO.builder()
                .title("RemTask")
                .description("for reminder")
                .priority(com.hedi.todo.backend.entity.TaskPriority.MEDIUM)
                .status(com.hedi.todo.backend.entity.TaskStatus.TODO)
                .categoryId(saved.getId())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<com.hedi.todo.backend.dto.TaskRequestDTO> taskEntity = new HttpEntity<>(taskReq, headers);

        ResponseEntity<com.hedi.todo.backend.dto.TaskResponseDTO> taskResp = rest.exchange(base + "/api/tasks", HttpMethod.POST, taskEntity, com.hedi.todo.backend.dto.TaskResponseDTO.class);
        assertThat(taskResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long taskId = taskResp.getBody().getId();

        ReminderRequestDTO rreq = ReminderRequestDTO.builder()
                .reminderAt(LocalDateTime.now().plusHours(1))
                .note("don't forget")
            .taskId(taskId)
            .status(com.hedi.todo.backend.entity.ReminderStatus.PENDING)
                .build();

        HttpEntity<ReminderRequestDTO> remEntity = new HttpEntity<>(rreq, headers);
        ResponseEntity<ReminderResponseDTO> remResp = rest.exchange(base + "/api/reminders", HttpMethod.POST, remEntity, ReminderResponseDTO.class);
        assertThat(remResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        ReminderResponseDTO created = remResp.getBody();
        assertThat(created.getNote()).isEqualTo("don't forget");

        ResponseEntity<ReminderResponseDTO[]> listResp = rest.exchange(base + "/api/reminders", HttpMethod.GET, new HttpEntity<>(headers), ReminderResponseDTO[].class);
        assertThat(listResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResp.getBody()).extracting(ReminderResponseDTO::getNote).contains("don't forget");
    }
}
