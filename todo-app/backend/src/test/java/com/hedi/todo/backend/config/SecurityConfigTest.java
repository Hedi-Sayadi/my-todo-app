package com.hedi.todo.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.util.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;

public class SecurityConfigTest {

  private final JwtService jwtService = org.mockito.Mockito.mock(JwtService.class);
  private final SecurityConfig cfg = new SecurityConfig(jwtService);

  @Test
  void corsConfiguration_hasExpectedOrigins() {
    var source = cfg.corsConfigurationSource();
    org.springframework.mock.web.MockHttpServletRequest req =
        new org.springframework.mock.web.MockHttpServletRequest("GET", "/api/x");
    CorsConfiguration c = source.getCorsConfiguration(req);
    assertThat(c).isNotNull();
    assertThat(c.getAllowedOrigins()).contains("http://localhost:3000");
  }

  @Test
  void passwordEncoder_isBCrypt() {
    var encoder = cfg.passwordEncoder();
    assertThat(encoder).isNotNull();
    assertThat(encoder.matches("p", "$2a$10$abcdefghijklmnopqrstuv")).isFalse();
  }
}
