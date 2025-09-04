package com.chinazes.secretsanta.responses;

import lombok.Getter;
import lombok.Setter;

/**
 * Response DTO for successful login.
 */

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expiresIn;

    public LoginResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }
}


