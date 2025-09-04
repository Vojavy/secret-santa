package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Notification entity for user notifications.
 * Matches the MongoDB Notification schema structure.
 */
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("notifications")
    private List<NotificationItem> notifications = new ArrayList<>();

    // Enums
    public enum NotificationType {
        INVITE("invite"),
        REMINDER("reminder"),
        GIFT_RECEIVED("gift_received"),
        SERVICE("service");

        private final String value;

        NotificationType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static NotificationType fromValue(String value) {
            for (NotificationType type : NotificationType.values()) {
                if (type.getValue().equals(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown notification type: " + value);
        }
    }

    // Constructors
    public Notification() {}

    public Notification(String userId) {
        this.userId = userId;
        this.notifications = new ArrayList<>();
    }

    // Inner class for notification items
    public static class NotificationItem {
        private NotificationType type;
        private String title;
        private Map<String, Object> data;
        private boolean read = false;
        private LocalDateTime createdAt = LocalDateTime.now();

        public NotificationItem() {}

        public NotificationItem(NotificationType type, String title) {
            this.type = type;
            this.title = title;
            this.read = false;
            this.createdAt = LocalDateTime.now();
        }

        public NotificationItem(NotificationType type, String title, Map<String, Object> data) {
            this.type = type;
            this.title = title;
            this.data = data;
            this.read = false;
            this.createdAt = LocalDateTime.now();
        }

        // Getters and Setters
        public NotificationType getType() {
            return type;
        }

        public void setType(NotificationType type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Map<String, Object> getData() {
            return data;
        }

        public void setData(Map<String, Object> data) {
            this.data = data;
        }

        public boolean isRead() {
            return read;
        }

        public void setRead(boolean read) {
            this.read = read;
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

    public List<NotificationItem> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationItem> notifications) {
        this.notifications = notifications;
    }

    // Helper methods
    public void addNotification(NotificationItem notification) {
        this.notifications.add(notification);
    }

    public void addNotification(NotificationType type, String title) {
        this.notifications.add(new NotificationItem(type, title));
    }

    public void addNotification(NotificationType type, String title, Map<String, Object> data) {
        this.notifications.add(new NotificationItem(type, title, data));
    }

    public void markAllAsRead() {
        this.notifications.forEach(notification -> notification.setRead(true));
    }

    public long getUnreadCount() {
        return this.notifications.stream().filter(notification -> !notification.isRead()).count();
    }
}
