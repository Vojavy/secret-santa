package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Player entity that links users to games.
 * Matches the MongoDB Player schema structure.
 */
@Document(collection = "players")
public class Player {

    @Id
    private String id;

    @Field("gameId")
    private String gameId;

    @Field("userId")
    private String userId;

    @Field("joinedAt")
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Field("isGifted")
    private boolean isGifted = false;

    // Constructors
    public Player() {}

    public Player(String gameId, String userId) {
        this.gameId = gameId;
        this.userId = userId;
        this.joinedAt = LocalDateTime.now();
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

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public boolean isGifted() {
        return isGifted;
    }

    public void setIsGifted(boolean isGifted) {
        this.isGifted = isGifted;
    }
}
