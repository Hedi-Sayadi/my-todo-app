package com.hedi.todo.backend.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

class JwtAuthenticationFilterTest {

  private final JwtService jwtService = mock(JwtService.class);
  private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService);
  private final FilterChain filterChain = mock(FilterChain.class);

  @AfterEach
  void cleanup() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void authEndpoint_bypassesTokenValidation() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/login");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilter(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
  }

  @Test
  void missingAuthorizationHeader_returnsUnauthorized() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tasks");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilter(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(401);
    assertThat(response.getContentAsString()).contains("Missing or invalid Authorization header");
    verify(filterChain, never()).doFilter(request, response);
  }

  @Test
  void invalidToken_returnsUnauthorized() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tasks");
    request.addHeader("Authorization", "Bearer bad-token");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(jwtService.getEmailFromToken("bad-token")).thenThrow(new JwtException("bad token"));

    filter.doFilter(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(401);
    assertThat(response.getContentAsString()).contains("Invalid or expired token");
    verify(filterChain, never()).doFilter(request, response);
  }

  @Test
  void validToken_setsAuthenticationAndContinues() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tasks");
    request.addHeader("Authorization", "Bearer valid-token");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(jwtService.getEmailFromToken("valid-token")).thenReturn("user@example.com");
    when(jwtService.getUserIdFromToken("valid-token")).thenReturn(42L);

    filter.doFilter(request, response, filterChain);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    assertThat(auth).isNotNull();
    assertThat(auth.getPrincipal()).isEqualTo("user@example.com");
    verify(filterChain).doFilter(request, response);
  }
}
