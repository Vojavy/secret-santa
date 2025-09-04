package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ticket entity for user support tickets.
 * Matches the MongoDB Ticket schema structure.
 */
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("category")
    private Category category;

    @Field("subject")
    private String subject;

    @Field("message")
    private String message;

    @Field("attachments")
    private List<Attachment> attachments = new ArrayList<>();

    @Field("status")
    private Status status = Status.OPEN;

    @Field("priority")
    private Priority priority = Priority.MEDIUM;

    @Field("isArchived")
    private boolean isArchived = false;

    @Field("seenByAdmin")
    private boolean seenByAdmin = false;

    @Field("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Enums
    public enum Category {
        BUG("bug"),
        IDEA("idea"),
        QUESTION("question"),
        OTHER("other");

        private final String value;

        Category(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static Category fromValue(String value) {
            for (Category category : Category.values()) {
                if (category.getValue().equals(value)) {
                    return category;
                }
            }
            throw new IllegalArgumentException("Unknown category: " + value);
        }
    }

    public enum Status {
        OPEN("open"),
        IN_PROGRESS("in_progress"),
        RESOLVED("resolved"),
        CLOSED("closed");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static Status fromValue(String value) {
            for (Status status : Status.values()) {
                if (status.getValue().equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown status: " + value);
        }
    }

    public enum Priority {
        LOW("low"),
        MEDIUM("medium"),
        HIGH("high"),
        CRITICAL("critical");

        private final String value;

        Priority(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static Priority fromValue(String value) {
            for (Priority priority : Priority.values()) {
                if (priority.getValue().equals(value)) {
                    return priority;
                }
            }
            throw new IllegalArgumentException("Unknown priority: " + value);
        }
    }

    // Inner class for attachments
    public static class Attachment {
        private String filename;
        private String url;
        private String base64File;

        public Attachment() {}

        public Attachment(String filename, String url) {
            this.filename = filename;
            this.url = url;
        }

        public Attachment(String filename, String base64File, boolean isBase64) {
            this.filename = filename;
            this.base64File = base64File;
        }

        // Getters and Setters
        public String getFilename() {
            return filename;
        }

        public void setFilename(String filename) {
            this.filename = filename;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getBase64File() {
            return base64File;
        }

        public void setBase64File(String base64File) {
            this.base64File = base64File;
        }
    }

    // Constructors
    public Ticket() {}

    public Ticket(Category category, String subject, String message) {
        this.category = category;
        this.subject = subject;
        this.message = message;
        this.status = Status.OPEN;
        this.priority = Priority.MEDIUM;
        this.isArchived = false;
        this.seenByAdmin = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Ticket(String userId, Category category, String subject, String message) {
        this.userId = userId;
        this.category = category;
        this.subject = subject;
        this.message = message;
        this.status = Status.OPEN;
        this.priority = Priority.MEDIUM;
        this.isArchived = false;
        this.seenByAdmin = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
        this.updatedAt = LocalDateTime.now();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
        this.updatedAt = LocalDateTime.now();
    }

    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
        this.updatedAt = LocalDateTime.now();
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isArchived() {
        return isArchived;
    }

    public void setArchived(boolean archived) {
        isArchived = archived;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isSeenByAdmin() {
        return seenByAdmin;
    }

    public void setSeenByAdmin(boolean seenByAdmin) {
        this.seenByAdmin = seenByAdmin;
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

    // Helper methods
    public void addAttachment(Attachment attachment) {
        this.attachments.add(attachment);
        this.updatedAt = LocalDateTime.now();
    }

    public void addAttachment(String filename, String url) {
        this.attachments.add(new Attachment(filename, url));
        this.updatedAt = LocalDateTime.now();
    }

    public void removeAttachment(int index) {
        if (index >= 0 && index < attachments.size()) {
            this.attachments.remove(index);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void markAsSeenByAdmin() {
        this.seenByAdmin = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void archive() {
        this.isArchived = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void unarchive() {
        this.isArchived = false;
        this.updatedAt = LocalDateTime.now();
    }
}
