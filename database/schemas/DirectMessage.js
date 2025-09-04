// MongoDB JSON Schema for mongosh
var directMessageSchema = {
  bsonType: "object",
  required: ["gameId", "senderId", "receiverId", "messageEncrypted"],
  properties: {
    _id: { bsonType: "objectId" },
    gameId: { bsonType: "objectId" },
    senderId: { bsonType: "objectId" },
    receiverId: { bsonType: "objectId" },
    messageEncrypted: { bsonType: "string" },
    createdAt: { bsonType: "date" }
  }
};
