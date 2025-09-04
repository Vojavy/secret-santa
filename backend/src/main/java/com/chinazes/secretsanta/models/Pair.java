package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Pair entity for Secret Santa assignments.
 * Matches the MongoDB Pair schema structure.
 */
@Document(collection = "pairs")
public class Pair {

    @Id
    private String id;

    @Field("gameId")
    private String gameId;

    @Field("gifterId")
    private String gifterId;

    @Field("receiverId")
    private String receiverId;

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Pair() {}

    public Pair(String gameId, String gifterId, String receiverId) {
        this.gameId = gameId;
        this.gifterId = gifterId;
        this.receiverId = receiverId;
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

    public String getGifterId() {
        return gifterId;
    }

    public void setGifterId(String gifterId) {
        this.gifterId = gifterId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
