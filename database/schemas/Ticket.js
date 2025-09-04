// MongoDB JSON Schema for mongosh
var ticketSchema = {
  bsonType: "object",
  required: ["category", "subject", "message"],
  properties: {
    _id: { bsonType: "objectId" },
    userId: { bsonType: "objectId" },
    category: { enum: ["bug", "idea", "question", "other"] },
    subject: { bsonType: "string" },
    message: { bsonType: "string" },
    attachments: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          filename: { bsonType: "string" },
          url: { bsonType: "string" },
          base64_file: { bsonType: "string" }
        }
      }
    },
    status: { enum: ["open", "in_progress", "resolved", "closed"] },
    priority: { enum: ["low", "medium", "high", "critical"] },
    isArchived: { bsonType: "bool" },
    seenByAdmin: { bsonType: "bool" },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" }
  }
};
