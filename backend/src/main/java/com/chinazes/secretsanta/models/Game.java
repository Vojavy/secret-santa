package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Game entity for Secret Santa games.
 * Matches the MongoDB Game schema structure.
 */
@Document(collection = "games")
public class Game {

    @Id
    private String id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("status")
    private Status status = Status.DRAFT;

    @Field("creatorId")
    private String creatorId;

    @Field("startAt")
    private LocalDateTime startAt;

    @Field("endsAt")
    private LocalDateTime endsAt;

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("settings")
    private GameSettings settings = new GameSettings();

    // Constructors
    public Game() {}

    public Game(String name, String creatorId) {
        this.name = name;
        this.creatorId = creatorId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public GameSettings getSettings() {
        return settings;
    }

    public void setSettings(GameSettings settings) {
        this.settings = settings;
    }

    // Enums and Inner Classes
    public enum Status {
        DRAFT, ACTIVE, ENDED
    }

    /**
     * Game settings embedded document.
     * Matches the settings object in MongoDB schema.
     */
    public static class GameSettings {
        @Field("anonymous")
        private boolean anonymous = false;

        @Field("maxParticipants")
        private int maxParticipants = 50;

        @Field("allowChat")
        private boolean allowChat = true;

        @Field("allowDirectChat")
        private boolean allowDirectChat = false;

        public GameSettings() {}

        // Getters and Setters
        public boolean isAnonymous() {
            return anonymous;
        }

        public void setAnonymous(boolean anonymous) {
            this.anonymous = anonymous;
        }

        public int getMaxParticipants() {
            return maxParticipants;
        }

        public void setMaxParticipants(int maxParticipants) {
            this.maxParticipants = maxParticipants;
        }

        public boolean isAllowChat() {
            return allowChat;
        }

        public void setAllowChat(boolean allowChat) {
            this.allowChat = allowChat;
        }

        public boolean isAllowDirectChat() {
            return allowDirectChat;
        }

        public void setAllowDirectChat(boolean allowDirectChat) {
            this.allowDirectChat = allowDirectChat;
        }
    }
}
