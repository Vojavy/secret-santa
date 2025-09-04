package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * User entity that implements Spring Security UserDetails interface.
 * Stores user authentication and profile information in MongoDB.
 */
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("username")  // Соответствует гайду
    private String username;

    @Indexed(unique = true)
    @Field("email")
    private String email;

    @Field("password")  // Соответствует гайду
    private String password;

    @Field("role")
    private Role role = Role.REGULAR;

    @Field("enabled")  // Соответствует гайду
    private boolean enabled = false;

    @Field("isOnline")  // Добавляем поле из MongoDB схемы
    private boolean online = false;

    @Field("verificationCode")
    private String verificationCode;

    @Field("verificationCodeExpiresAt")
    private LocalDateTime verificationCodeExpiresAt;

    @Field("oauthProvider")  // Добавляем согласно гайду
    private String oauthProvider;

    @Field("oauthId")  // Добавляем согласно гайду
    private String oauthId;

    // OAuth providers как в MongoDB схеме
    @Field("authProviders")
    private List<AuthProvider> authProviders = new ArrayList<>();

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Field("avatarUrl")
    private String avatarUrl;

    // Constructors
    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Use email as username for authentication
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsernameField() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
        this.updatedAt = LocalDateTime.now();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        this.updatedAt = LocalDateTime.now();
    }

    public void setPassword(String password) {
        this.password = password;
        this.updatedAt = LocalDateTime.now();
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
        this.updatedAt = LocalDateTime.now();
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        this.updatedAt = LocalDateTime.now();
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getVerificationCodeExpiresAt() {
        return verificationCodeExpiresAt;
    }

    public void setVerificationCodeExpiresAt(LocalDateTime verificationCodeExpiresAt) {
        this.verificationCodeExpiresAt = verificationCodeExpiresAt;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
        this.updatedAt = LocalDateTime.now();
    }

    public List<AuthProvider> getAuthProviders() {
        return authProviders;
    }

    public void setAuthProviders(List<AuthProvider> authProviders) {
        this.authProviders = authProviders;
        this.updatedAt = LocalDateTime.now();
    }

    public void addAuthProvider(String provider, String providerId) {
        if (this.authProviders == null) {
            this.authProviders = new ArrayList<>();
        }
        this.authProviders.add(new AuthProvider(provider, providerId));
        this.updatedAt = LocalDateTime.now();
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public String getOauthProvider() {
        return oauthProvider;
    }

    public void setOauthProvider(String oauthProvider) {
        this.oauthProvider = oauthProvider;
        this.updatedAt = LocalDateTime.now();
    }

    public String getOauthId() {
        return oauthId;
    }

    public void setOauthId(String oauthId) {
        this.oauthId = oauthId;
        this.updatedAt = LocalDateTime.now();
    }

    // Enums and Inner Classes
    public enum Role {
        ADMIN, REGULAR
    }

    /**
     * Represents an OAuth authentication provider.
     * Matches the authProviders array structure in MongoDB schema.
     */
    public static class AuthProvider {
        @Field("provider")
        private String provider;

        @Field("providerId")
        private String providerId;

        @Field("email")
        private String email;

        @Field("name")
        private String name;

        public AuthProvider() {}

        public AuthProvider(String provider, String providerId) {
            this.provider = provider;
            this.providerId = providerId;
        }

        public AuthProvider(String provider, String providerId, String email, String name) {
            this.provider = provider;
            this.providerId = providerId;
            this.email = email;
            this.name = name;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getProviderId() {
            return providerId;
        }

        public void setProviderId(String providerId) {
            this.providerId = providerId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
