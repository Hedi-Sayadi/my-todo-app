package com.hedi.todo.backend.util;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT Authentication Filter that validates tokens on every request to protected endpoints.
 *
 * <p>This filter: - Allows /api/auth/** endpoints without a token - Requires a valid Bearer token
 * for all other endpoints - Extracts user information from the token and sets it in the security
 * context - Returns 401 Unauthorized if the token is missing, invalid, or expired
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String path = request.getRequestURI();

    // Allow auth endpoints without a token
    if (path.startsWith("/api/auth/")) {
      filterChain.doFilter(request, response);
      return;
    }

    // Extract Authorization header
    String header = request.getHeader("Authorization");
    if (header == null || !header.startsWith("Bearer ")) {
      respondWithUnauthorized(response, "Missing or invalid Authorization header");
      return;
    }

    // Extract token from "Bearer <token>"
    String token = header.substring(7);

    try {
      // Validate token and extract claims
      String email = jwtService.getEmailFromToken(token);
      Long userId = jwtService.getUserIdFromToken(token);

      // Create authentication token and set in security context
      Authentication authentication = new UsernamePasswordAuthenticationToken(email, token, null);

      SecurityContextHolder.getContext().setAuthentication(authentication);
      filterChain.doFilter(request, response);

    } catch (JwtException e) {
      respondWithUnauthorized(response, "Invalid or expired token");
    }
  }

  /** Writes a 401 Unauthorized response with error details as JSON. */
  private void respondWithUnauthorized(HttpServletResponse response, String message)
      throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");

    String jsonResponse =
        String.format(
            "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\",\"timestamp\":%d}",
            message, System.currentTimeMillis());

    response.getWriter().write(jsonResponse);
  }
}
