// MongoDB JSON Schema for Game collection
// Used directly in mongosh for database initialization

// MongoDB JSON Schema for mongosh
var gameSchema = {
  bsonType: "object",
  required: ["name", "creatorId"],
  properties: {
    _id: { bsonType: "objectId" },
    name: { bsonType: "string" },
    description: { bsonType: "string" },
    status: { enum: ["draft", "active", "ended"] },
    creatorId: { bsonType: "objectId" },
    startAt: { bsonType: "date" },
    endsAt: { bsonType: "date" },
    createdAt: { bsonType: "date" },
    settings: {
      bsonType: "object",
      properties: {
        anonymous: { bsonType: "bool" },
        maxParticipants: { bsonType: "number" },
        allowChat: { bsonType: "bool" },
        allowDirectChat: { bsonType: "bool" }
      }
    }
  }
};
