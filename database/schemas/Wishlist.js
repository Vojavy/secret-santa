// MongoDB JSON Schema for mongosh
var wishlistSchema = {
  bsonType: "object",
  required: ["userId"],
  properties: {
    _id: { bsonType: "objectId" },
    userId: { bsonType: "objectId" },
    items: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["name"],
        properties: {
          name: { bsonType: "string" },
          url: { bsonType: "string" },
          note: { bsonType: "string" },
          createdAt: { bsonType: "date" }
        }
      }
    }
  }
};
