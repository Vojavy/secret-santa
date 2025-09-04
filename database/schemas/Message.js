// MongoDB JSON Schema for mongosh
var messageSchema = {
  bsonType: "object",
  required: ["gameId", "userId", "messageEncrypted"],
  properties: {
    _id: { bsonType: "objectId" },
    gameId: { bsonType: "objectId" },
    userId: { bsonType: "objectId" },
    messageEncrypted: { bsonType: "string" },
    createdAt: { bsonType: "date" }
  }
};
