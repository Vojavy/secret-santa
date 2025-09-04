package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Wishlist entity for user's desired gifts.
 * Matches the MongoDB Wishlist schema structure.
 */
@Document(collection = "wishlists")
public class Wishlist {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("items")
    private List<WishlistItem> items = new ArrayList<>();

    // Constructors
    public Wishlist() {}

    public Wishlist(String userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
    }

    // Inner class for wishlist items
    public static class WishlistItem {
        private String name;
        private String url;
        private String note;
        private LocalDateTime createdAt = LocalDateTime.now();

        public WishlistItem() {}

        public WishlistItem(String name) {
            this.name = name;
            this.createdAt = LocalDateTime.now();
        }

        public WishlistItem(String name, String url, String note) {
            this.name = name;
            this.url = url;
            this.note = note;
            this.createdAt = LocalDateTime.now();
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<WishlistItem> getItems() {
        return items;
    }

    public void setItems(List<WishlistItem> items) {
        this.items = items;
    }

    // Helper methods
    public void addItem(WishlistItem item) {
        this.items.add(item);
    }

    public void addItem(String name, String url, String note) {
        this.items.add(new WishlistItem(name, url, note));
    }

    public void removeItem(int index) {
        if (index >= 0 && index < items.size()) {
            this.items.remove(index);
        }
    }
}
