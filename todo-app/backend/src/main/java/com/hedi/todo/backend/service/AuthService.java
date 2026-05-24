package com.hedi.todo.backend.service;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.LoginRequestDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.dto.UserResponseDTO;
import com.hedi.todo.backend.entity.User;
import com.hedi.todo.backend.entity.UserRole;
import com.hedi.todo.backend.exception.InvalidCredentialsException;
import com.hedi.todo.backend.exception.PasswordMismatchException;
import com.hedi.todo.backend.exception.UserAlreadyExistsException;
import com.hedi.todo.backend.repository.UserRepository;
import com.hedi.todo.backend.util.JwtService;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthResponseDTO register(RegisterRequestDTO request) {
    String email = normalizeEmail(request.getEmail());

    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new UserAlreadyExistsException(email);
    }

    if (!request.getPassword().equals(request.getConfirmPassword())) {
      throw new PasswordMismatchException();
    }

    User user =
        User.builder()
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName().trim())
            .email(email)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(UserRole.USER)
            .enabled(true)
            .build();

    User savedUser = userRepository.save(user);
    return buildAuthResponse(savedUser);
  }

  @Transactional(readOnly = true)
  public AuthResponseDTO login(LoginRequestDTO request) {
    String email = normalizeEmail(request.getEmail());
    User user =
        userRepository.findByEmailIgnoreCase(email).orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new InvalidCredentialsException();
    }

    return buildAuthResponse(user);
  }

  private AuthResponseDTO buildAuthResponse(User user) {
    return AuthResponseDTO.builder()
        .token(jwtService.generateToken(user))
        .expiresInMillis(jwtService.getExpirationMs())
        .user(
            UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build())
        .build();
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }
}
