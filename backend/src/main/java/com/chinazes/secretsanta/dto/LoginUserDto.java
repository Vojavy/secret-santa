package com.chinazes.secretsanta.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO for user login request.
 */
@Getter
@Setter
public class LoginUserDto {
    private String email;
    private String password;
}
