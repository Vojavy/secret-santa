package com.chinazes.secretsanta.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO for user verification request.
 */
@Getter
@Setter
public class VerifyUserDto {
    private String email;
    private String verificationCode;
}
