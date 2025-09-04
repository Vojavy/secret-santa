package com.chinazes.secretsanta.config;

import com.chinazes.secretsanta.models.User;
import com.chinazes.secretsanta.repositories.UserRepository;
import com.chinazes.secretsanta.services.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // github, google, etc.
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = (String) oauth2User.getAttributes().getOrDefault("email", oauth2User.getName());
        String name = (String) oauth2User.getAttributes().getOrDefault("name", email);
        String picture = (String) oauth2User.getAttributes().getOrDefault("avatar_url", oauth2User.getAttributes().getOrDefault("picture", null));

        Optional<User> existing = userRepository.findByEmail(email);
        User user = existing.orElseGet(() -> {
            User u = new User(name, email, "");
            u.setEnabled(true);
            u.setOauthProvider(registrationId);
            u.setOauthId(oauth2User.getName());
            if (picture != null) {
                u.setAvatarUrl(picture);
            }
            return u;
        });

        // Обновление провайдеров если надо
        if (user.getOauthProvider() == null) {
            user.setOauthProvider(registrationId);
            user.setOauthId(oauth2User.getName());
        }

        userRepository.save(user);

        String jwt = jwtService.generateToken(user);
        long expiresInMs = jwtService.getExpirationTime();

        Map<String, Object> body = new HashMap<>();
        body.put("token", jwt);
        body.put("tokenType", "Bearer");
        body.put("expiresAt", Instant.now().plusMillis(expiresInMs).toString());
        body.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getUsernameField(),
                "avatarUrl", user.getAvatarUrl()
        ));

        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), body);
    }
}

