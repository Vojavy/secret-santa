// MongoDB JSON Schema for mongosh
var pairSchema = {
  bsonType: "object",
  required: ["gameId", "gifterId", "receiverId"],
  properties: {
    _id: { bsonType: "objectId" },
    gameId: { bsonType: "objectId" },
    gifterId: { bsonType: "objectId" },
    receiverId: { bsonType: "objectId" },
    createdAt: { bsonType: "date" }
  }
};
