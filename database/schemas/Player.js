// MongoDB JSON Schema for mongosh
var playerSchema = {
  bsonType: "object",
  required: ["gameId", "userId"],
  properties: {
    _id: { bsonType: "objectId" },
    gameId: { bsonType: "objectId" },
    userId: { bsonType: "objectId" },
    joinedAt: { bsonType: "date" },
    isGifted: { bsonType: "bool" }
  }
};
