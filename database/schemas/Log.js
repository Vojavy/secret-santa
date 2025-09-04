// MongoDB JSON Schema for mongosh
var logSchema = {
  bsonType: "object",
  required: ["logType"],
  properties: {
    _id: { bsonType: "objectId" },
    timestamp: { bsonType: "date" },
    logType: { enum: ["GAME", "CHAT", "SYSTEM"] },
    actorId: { bsonType: "objectId" },
    payload: {
      bsonType: "object",
      required: ["action"],
      properties: {
        action: { enum: ["CREATE_GAME", "JOIN_GAME", "SEND_MESSAGE", "UPDATED_GAME", "PAIR_CREATED", "DIRECT_MESSAGE_SENT", "PLAYER_GIFTED", "PLAYER_REMOVED", "GAME_ENDED"] },
        details: { bsonType: "object" }
      }
    }
  }
};
