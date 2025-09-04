package com.chinazes.secretsanta.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO for user registration request.
 */
@Getter
@Setter
public class RegisterUserDto {
    private String email;
    private String password;
    private String username;
}
