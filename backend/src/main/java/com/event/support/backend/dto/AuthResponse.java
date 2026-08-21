package com.event.support.backend.dto;

import com.event.support.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String message;
}
