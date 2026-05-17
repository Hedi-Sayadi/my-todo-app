package com.hedi.todo.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hedi.todo.backend.dto.AuthResponseDTO;
import com.hedi.todo.backend.dto.LoginRequestDTO;
import com.hedi.todo.backend.dto.RegisterRequestDTO;
import com.hedi.todo.backend.entity.User;
import com.hedi.todo.backend.entity.UserRole;
import com.hedi.todo.backend.exception.InvalidCredentialsException;
import com.hedi.todo.backend.exception.PasswordMismatchException;
import com.hedi.todo.backend.exception.UserAlreadyExistsException;
import com.hedi.todo.backend.repository.UserRepository;
import com.hedi.todo.backend.util.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtService jwtService;

	@InjectMocks
	private AuthService authService;

	@Captor
	private ArgumentCaptor<User> userCaptor;

	@Test
	void registerShouldCreateNormalizedUserAndReturnAuthResponse() {
		RegisterRequestDTO request = RegisterRequestDTO.builder()
			.firstName("  Ada  ")
			.lastName("  Lovelace  ")
			.email("Ada@Example.COM")
			.password("Secret123!")
			.confirmPassword("Secret123!")
			.build();

		when(userRepository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(false);
		when(passwordEncoder.encode("Secret123!")).thenReturn("encoded-secret");
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0, User.class);
			user.setId(42L);
			user.setCreatedAt(LocalDateTime.of(2026, 5, 17, 10, 0));
			user.setUpdatedAt(LocalDateTime.of(2026, 5, 17, 10, 0));
			return user;
		});
		when(jwtService.getExpirationMs()).thenReturn(3_600_000L);
		when(jwtService.generateToken(any(User.class))).thenReturn("token-123");

		AuthResponseDTO response = authService.register(request);

		verify(userRepository).save(userCaptor.capture());
		User savedUser = userCaptor.getValue();
		assertThat(savedUser.getFirstName()).isEqualTo("Ada");
		assertThat(savedUser.getLastName()).isEqualTo("Lovelace");
		assertThat(savedUser.getEmail()).isEqualTo("ada@example.com");
		assertThat(savedUser.getPasswordHash()).isEqualTo("encoded-secret");
		assertThat(savedUser.getRole()).isEqualTo(UserRole.USER);
		assertThat(savedUser.isEnabled()).isTrue();

		assertThat(response.getToken()).isEqualTo("token-123");
		assertThat(response.getExpiresInMillis()).isEqualTo(3_600_000L);
		assertThat(response.getUser().getId()).isEqualTo(42L);
		assertThat(response.getUser().getEmail()).isEqualTo("ada@example.com");
		assertThat(response.getUser().getFirstName()).isEqualTo("Ada");
		assertThat(response.getUser().getLastName()).isEqualTo("Lovelace");
	}

	@Test
	void registerShouldRejectExistingEmail() {
		RegisterRequestDTO request = RegisterRequestDTO.builder()
			.firstName("Ada")
			.lastName("Lovelace")
			.email("Ada@Example.COM")
			.password("Secret123!")
			.confirmPassword("Secret123!")
			.build();

		when(userRepository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(true);

		assertThatThrownBy(() -> authService.register(request))
			.isInstanceOf(UserAlreadyExistsException.class)
			.hasMessage("A user with this email already exists: ada@example.com");

		verify(userRepository, never()).save(any());
	}

	@Test
	void registerShouldRejectPasswordMismatch() {
		RegisterRequestDTO request = RegisterRequestDTO.builder()
			.firstName("Ada")
			.lastName("Lovelace")
			.email("Ada@Example.COM")
			.password("Secret123!")
			.confirmPassword("Different123!")
			.build();

		when(userRepository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(false);

		assertThatThrownBy(() -> authService.register(request))
			.isInstanceOf(PasswordMismatchException.class)
			.hasMessage("Passwords do not match");

		verify(userRepository, never()).save(any());
	}

	@Test
	void loginShouldReturnAuthResponseForValidCredentials() {
		LoginRequestDTO request = LoginRequestDTO.builder()
			.email("Ada@Example.COM")
			.password("Secret123!")
			.build();

		User user = User.builder()
			.id(7L)
			.firstName("Ada")
			.lastName("Lovelace")
			.email("ada@example.com")
			.passwordHash("encoded-secret")
			.role(UserRole.USER)
			.enabled(true)
			.createdAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.updatedAt(LocalDateTime.of(2026, 5, 17, 10, 0))
			.build();

		when(userRepository.findByEmailIgnoreCase("ada@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("Secret123!", "encoded-secret")).thenReturn(true);
		when(jwtService.getExpirationMs()).thenReturn(3_600_000L);
		when(jwtService.generateToken(user)).thenReturn("token-456");

		AuthResponseDTO response = authService.login(request);

		assertThat(response.getToken()).isEqualTo("token-456");
		assertThat(response.getExpiresInMillis()).isEqualTo(3_600_000L);
		assertThat(response.getUser().getId()).isEqualTo(7L);
		assertThat(response.getUser().getEmail()).isEqualTo("ada@example.com");
		assertThat(response.getUser().getFirstName()).isEqualTo("Ada");
		assertThat(response.getUser().getLastName()).isEqualTo("Lovelace");
	}

	@Test
	void loginShouldRejectUnknownEmail() {
		LoginRequestDTO request = LoginRequestDTO.builder()
			.email("missing@example.com")
			.password("Secret123!")
			.build();

		when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.login(request))
			.isInstanceOf(InvalidCredentialsException.class)
			.hasMessage("Invalid email or password");

		verify(passwordEncoder, never()).matches(any(), any());
	}

	@Test
	void loginShouldRejectWrongPassword() {
		LoginRequestDTO request = LoginRequestDTO.builder()
			.email("Ada@Example.COM")
			.password("WrongPassword")
			.build();

		User user = User.builder()
			.id(7L)
			.firstName("Ada")
			.lastName("Lovelace")
			.email("ada@example.com")
			.passwordHash("encoded-secret")
			.role(UserRole.USER)
			.enabled(true)
			.build();

		when(userRepository.findByEmailIgnoreCase("ada@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("WrongPassword", "encoded-secret")).thenReturn(false);

		assertThatThrownBy(() -> authService.login(request))
			.isInstanceOf(InvalidCredentialsException.class)
			.hasMessage("Invalid email or password");
	}
}