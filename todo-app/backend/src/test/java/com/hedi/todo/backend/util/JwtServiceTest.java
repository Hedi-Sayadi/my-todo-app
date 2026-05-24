package com.hedi.todo.backend.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.hedi.todo.backend.entity.User;
import com.hedi.todo.backend.entity.UserRole;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET = "test-secret-key-for-jwt-service-32b";
  private static final long EXPIRATION_MS = 3_600_000L;

  private JwtService jwtService;

  @BeforeEach
  void setUp() {
    jwtService = new JwtService(SECRET, EXPIRATION_MS);
  }

  @Test
  void generateTokenShouldEncodeExpectedClaims() {
    User user =
        User.builder()
            .id(15L)
            .firstName("Ada")
            .lastName("Lovelace")
            .email("Ada@Example.COM")
            .role(UserRole.ADMIN)
            .build();

    String token = jwtService.generateToken(user);

    assertThat(jwtService.getEmailFromToken(token)).isEqualTo("ada@example.com");
    assertThat(jwtService.getUserIdFromToken(token)).isEqualTo(15L);
    assertThat(jwtService.validateToken(token).get("role", String.class)).isEqualTo("ADMIN");
    assertThat(jwtService.validateToken(token).get("name", String.class)).isEqualTo("Ada Lovelace");
    assertThat(jwtService.getExpirationMs()).isEqualTo(EXPIRATION_MS);
  }

  @Test
  void validateTokenShouldRejectInvalidToken() {
    assertThatThrownBy(() -> jwtService.validateToken("not-a-real-token"))
        .isInstanceOf(JwtException.class)
        .hasMessage("Invalid token");
  }

  @Test
  void validateTokenShouldRejectExpiredToken() {
    String expiredToken =
        Jwts.builder()
            .setSubject("expired@example.com")
            .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
            .setExpiration(new Date(System.currentTimeMillis() - 1_000))
            .signWith(
                new javax.crypto.spec.SecretKeySpec(
                    SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    SignatureAlgorithm.HS256.getJcaName()),
                SignatureAlgorithm.HS256)
            .compact();

    assertThatThrownBy(() -> jwtService.validateToken(expiredToken))
        .isInstanceOf(JwtException.class)
        .hasMessage("Token has expired");
  }

  @Test
  void getUserIdFromTokenShouldReturnClaimAsLong() {
    String token =
        Jwts.builder()
            .setSubject("user@example.com")
            .claim("userId", 99L)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
            .signWith(
                new javax.crypto.spec.SecretKeySpec(
                    SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    SignatureAlgorithm.HS256.getJcaName()),
                SignatureAlgorithm.HS256)
            .compact();

    assertThat(jwtService.getUserIdFromToken(token)).isEqualTo(99L);
  }
}
