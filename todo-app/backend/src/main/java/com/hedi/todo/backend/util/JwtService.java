package com.hedi.todo.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Locale;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.hedi.todo.backend.entity.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

	private final String secret;
	private final long expirationMs;

	public JwtService(
		@Value("${app.jwt.secret}") String secret,
		@Value("${app.jwt.expiration-ms}") long expirationMs
	) {
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

	private Key getSigningKey() {
		return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS256.getJcaName());
	}
}