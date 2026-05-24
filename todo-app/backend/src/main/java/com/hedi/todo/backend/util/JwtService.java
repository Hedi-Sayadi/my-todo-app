package com.hedi.todo.backend.util;

import com.hedi.todo.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Locale;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final String secret;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs) {
    this.secret = secret;
    this.expirationMs = expirationMs;
  }

  public String generateToken(User user) {
    Date now = new Date();
    Date expiration = new Date(now.getTime() + expirationMs);

    return Jwts.builder()
        .setSubject(user.getEmail().toLowerCase(Locale.ROOT))
        .claim("userId", user.getId())
        .claim("role", user.getRole().name())
        .claim("name", user.getFirstName() + " " + user.getLastName())
        .setIssuedAt(now)
        .setExpiration(expiration)
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public long getExpirationMs() {
    return expirationMs;
  }

  public Claims validateToken(String token) throws JwtException {
    try {
      return Jwts.parserBuilder()
          .setSigningKey(getSigningKey())
          .build()
          .parseClaimsJws(token)
          .getBody();
    } catch (ExpiredJwtException e) {
      throw new JwtException("Token has expired", e);
    } catch (JwtException e) {
      throw new JwtException("Invalid token", e);
    }
  }

  public String getEmailFromToken(String token) throws JwtException {
    return validateToken(token).getSubject();
  }

  public Long getUserIdFromToken(String token) throws JwtException {
    return validateToken(token).get("userId", Long.class);
  }

  private Key getSigningKey() {
    return new SecretKeySpec(
        secret.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS256.getJcaName());
  }
}
