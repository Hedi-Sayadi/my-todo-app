package com.hedi.todo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.LoginRequestDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);
    private final AuthController controller = new AuthController(authService);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
        void register_returnsCreatedAndBody() throws Exception {
        RegisterRequestDTO req = RegisterRequestDTO.builder()
            .firstName("Alice")
            .lastName("L")
            .email("a@x.com")
            .password("password1")
            .confirmPassword("password1")
            .build();

        AuthResponseDTO resp = AuthResponseDTO.builder().token("tok").build();
        given(authService.register(any(RegisterRequestDTO.class))).willReturn(resp);

        mvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token").value("tok"));
        }

    @Test
    void login_returnsOkAndBody() throws Exception {
        LoginRequestDTO req = LoginRequestDTO.builder().email("a@x.com").password("pass").build();
        AuthResponseDTO resp = AuthResponseDTO.builder().token("t").build();
        given(authService.login(any(LoginRequestDTO.class))).willReturn(resp);

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("t"));
    }
}
