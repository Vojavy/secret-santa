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

        // 1. Email (GitHub может вернуть null)
        String email = (String) oauth2User.getAttributes().get("email");
        if (email == null) {
            Object loginAttr = oauth2User.getAttributes().get("login");
            if (loginAttr != null) {
                email = loginAttr.toString() + "@" + registrationId + ".local";
            } else {
                email = oauth2User.getName() + "@" + registrationId + ".local";
            }
        }

        // 2. Name fallback
        String name = (String) oauth2User.getAttributes().get("name");
        if (name == null || name.isBlank()) {
            Object loginAttr = oauth2User.getAttributes().get("login");
            name = loginAttr != null ? loginAttr.toString() : email.split("@")[0];
        }

        // 3. Avatar (GitHub: avatar_url, Google: picture)
        String picture = null;
        Object ghAvatar = oauth2User.getAttributes().get("avatar_url");
        if (ghAvatar != null) picture = ghAvatar.toString();
        Object googlePic = oauth2User.getAttributes().get("picture");
        if (picture == null && googlePic != null) picture = googlePic.toString();

        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = picture;
        final String finalRegistrationId = registrationId;
        final OAuth2User finalOauth2User = oauth2User;

        // 1. Сначала ищем по OAuth провайдеру и ID (самый надежный способ)
        Optional<User> existingByOAuth = Optional.empty();
        try {
            System.out.println("Searching for user with provider: " + registrationId + " and providerId: " + oauth2User.getName());
            existingByOAuth = userRepository.findByAuthProvidersProviderAndAuthProvidersProviderId(registrationId, oauth2User.getName());
            if (existingByOAuth.isPresent()) {
                System.out.println("Found existing user by OAuth: " + existingByOAuth.get().getId());
            } else {
                System.out.println("No user found by OAuth provider and ID");
            }
        } catch (Exception e) {
            // Если метод не найден или есть проблема с базой, игнорируем
            System.err.println("Warning: Could not search by OAuth provider and ID: " + e.getMessage());
            e.printStackTrace();
        }

        // 2. Если не найден по OAuth, ищем по email
        Optional<User> existingByEmail = Optional.empty();
        if (existingByOAuth.isEmpty()) {
            System.out.println("Searching for user by email: " + finalEmail);
            existingByEmail = userRepository.findByEmail(finalEmail);
            if (existingByEmail.isPresent()) {
                System.out.println("Found existing user by email: " + existingByEmail.get().getId());
            } else {
                System.out.println("No user found by email");
            }
        }

        // 3. Берем найденного пользователя или создаем нового
        User user = existingByOAuth.orElse(existingByEmail.orElseGet(() -> {
            User u = new User(finalName, finalEmail, "");
            u.setEnabled(true);
            // Используем новый метод для добавления OAuth провайдера
            u.addAuthProvider(finalRegistrationId, finalOauth2User.getName());
            if (finalPicture != null) {
                u.setAvatarUrl(finalPicture);
            }
            return u;
        }));

        // Обновляем OAuth данные, если их нет
        if (!user.hasAuthProvider(registrationId, oauth2User.getName())) {
            user.addAuthProvider(registrationId, oauth2User.getName());
        }

        // Обновляем email, если он отсутствует
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            user.setEmail(email);
        }

        // Обновляем аватар, если он отсутствует или пустой
        if (picture != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
            user.setAvatarUrl(picture);
        }

        userRepository.save(user);

        String jwt = jwtService.generateToken(user);
        long expiresInMs = jwtService.getExpirationTime();

        Map<String, Object> body = new HashMap<>();
        body.put("token", jwt);
        body.put("tokenType", "Bearer");
        body.put("expiresAt", Instant.now().plusMillis(expiresInMs).toString());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getUsernameField());
        if (user.getAvatarUrl() != null) {
            userMap.put("avatarUrl", user.getAvatarUrl());
        }
        body.put("user", userMap);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), body);
    }
}