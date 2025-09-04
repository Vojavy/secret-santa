package com.chinazes.secretsanta.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Log entity for system activity logging.
 * Matches the MongoDB Log schema structure.
 */
@Document(collection = "logs")
public class Log {

    @Id
    private String id;

    @Field("timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    @Field("logType")
    private LogType logType;

    @Field("actorId")
    private String actorId;

    @Field("payload")
    private LogPayload payload;

    // Enums
    public enum LogType {
        GAME("GAME"),
        CHAT("CHAT"),
        SYSTEM("SYSTEM");

        private final String value;

        LogType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static LogType fromValue(String value) {
            for (LogType type : LogType.values()) {
                if (type.getValue().equals(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown log type: " + value);
        }
    }

    public enum Action {
        CREATE_GAME("CREATE_GAME"),
        JOIN_GAME("JOIN_GAME"),
        SEND_MESSAGE("SEND_MESSAGE"),
        UPDATED_GAME("UPDATED_GAME"),
        PAIR_CREATED("PAIR_CREATED"),
        DIRECT_MESSAGE_SENT("DIRECT_MESSAGE_SENT"),
        PLAYER_GIFTED("PLAYER_GIFTED"),
        PLAYER_REMOVED("PLAYER_REMOVED"),
        GAME_ENDED("GAME_ENDED");

        private final String value;

        Action(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static Action fromValue(String value) {
            for (Action action : Action.values()) {
                if (action.getValue().equals(value)) {
                    return action;
                }
            }
            throw new IllegalArgumentException("Unknown action: " + value);
        }
    }

    // Inner class for log payload
    public static class LogPayload {
        private Action action;
        private Map<String, Object> details;

        public LogPayload() {}

        public LogPayload(Action action) {
            this.action = action;
        }

        public LogPayload(Action action, Map<String, Object> details) {
            this.action = action;
            this.details = details;
        }

        // Getters and Setters
        public Action getAction() {
            return action;
        }

        public void setAction(Action action) {
            this.action = action;
        }

        public Map<String, Object> getDetails() {
            return details;
        }

        public void setDetails(Map<String, Object> details) {
            this.details = details;
        }
    }

    // Constructors
    public Log() {}

    public Log(LogType logType, Action action) {
        this.timestamp = LocalDateTime.now();
        this.logType = logType;
        this.payload = new LogPayload(action);
    }

    public Log(LogType logType, String actorId, Action action) {
        this.timestamp = LocalDateTime.now();
        this.logType = logType;
        this.actorId = actorId;
        this.payload = new LogPayload(action);
    }

    public Log(LogType logType, String actorId, Action action, Map<String, Object> details) {
        this.timestamp = LocalDateTime.now();
        this.logType = logType;
        this.actorId = actorId;
        this.payload = new LogPayload(action, details);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public LogType getLogType() {
        return logType;
    }

    public void setLogType(LogType logType) {
        this.logType = logType;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public LogPayload getPayload() {
        return payload;
    }

    public void setPayload(LogPayload payload) {
        this.payload = payload;
    }

    // Helper methods
    public void setAction(Action action) {
        if (this.payload == null) {
            this.payload = new LogPayload();
        }
        this.payload.setAction(action);
    }

    public void setActionDetails(Map<String, Object> details) {
        if (this.payload == null) {
            this.payload = new LogPayload();
        }
        this.payload.setDetails(details);
    }

    public Action getAction() {
        return this.payload != null ? this.payload.getAction() : null;
    }

    public Map<String, Object> getActionDetails() {
        return this.payload != null ? this.payload.getDetails() : null;
    }

    // Static factory methods for common log types
    public static Log gameLog(String actorId, Action action) {
        return new Log(LogType.GAME, actorId, action);
    }

    public static Log gameLog(String actorId, Action action, Map<String, Object> details) {
        return new Log(LogType.GAME, actorId, action, details);
    }

    public static Log chatLog(String actorId, Action action) {
        return new Log(LogType.CHAT, actorId, action);
    }

    public static Log chatLog(String actorId, Action action, Map<String, Object> details) {
        return new Log(LogType.CHAT, actorId, action, details);
    }

    public static Log systemLog(Action action) {
        return new Log(LogType.SYSTEM, action);
    }

    public static Log systemLog(Action action, Map<String, Object> details) {
        return new Log(LogType.SYSTEM, null, action, details);
    }
}
