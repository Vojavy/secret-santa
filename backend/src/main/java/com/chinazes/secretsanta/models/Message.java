package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Message entity for game chat messages.
 * Matches the MongoDB Message schema structure.
 */
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Field("gameId")
    private String gameId;

    @Field("userId")
    private String userId;

    @Field("messageEncrypted")
    private String messageEncrypted;

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Message() {}

    public Message(String gameId, String userId, String messageEncrypted) {
        this.gameId = gameId;
        this.userId = userId;
        this.messageEncrypted = messageEncrypted;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessageEncrypted() {
        return messageEncrypted;
    }

    public void setMessageEncrypted(String messageEncrypted) {
        this.messageEncrypted = messageEncrypted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
