package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * DirectMessage entity for private messages between users.
 * Matches the MongoDB DirectMessage schema structure.
 */
@Document(collection = "directmessages")
public class DirectMessage {

    @Id
    private String id;

    @Field("gameId")
    private String gameId;

    @Field("senderId")
    private String senderId;

    @Field("receiverId")
    private String receiverId;

    @Field("messageEncrypted")
    private String messageEncrypted;

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public DirectMessage() {}

    public DirectMessage(String gameId, String senderId, String receiverId, String messageEncrypted) {
        this.gameId = gameId;
        this.senderId = senderId;
        this.receiverId = receiverId;
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

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
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
