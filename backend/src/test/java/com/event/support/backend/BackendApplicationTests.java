package com.event.support.backend;

import com.event.support.backend.controller.GlobalExceptionHandler;
import com.event.support.backend.dto.RegisterRequest;
import com.event.support.backend.enums.Role;
import com.event.support.backend.repository.UserRepository;
import com.event.support.backend.service.AuthService;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private AuthService authService;

	@Autowired
	private UserRepository userRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void malformedRequestBodyReturnsBadRequest() {
		var response = new GlobalExceptionHandler().handleUnreadableMessage(
				new HttpMessageNotReadableException("Invalid request body",
						(HttpInputMessage) null));

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals("Request contains invalid or malformed data",
				response.getBody().get("message"));
	}

	@Test
	void registrationPersistsNewUser() {
		String email = "registration-regression-" + UUID.randomUUID() + "@example.com";
		RegisterRequest request = new RegisterRequest();
		request.setFullName("Registration Regression");
		request.setEmail(email);
		request.setPassword("DiagnosticPassword2026!");
		request.setRole(Role.STAFF);
		request.setDepartment("Diagnostics");

		try {
			authService.register(request);
			assertTrue(userRepository.findByEmail(email).isPresent());
		} finally {
			userRepository.findByEmail(email).ifPresent(userRepository::delete);
		}
	}

}
