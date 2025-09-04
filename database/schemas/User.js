// MongoDB JSON Schema for User collection
// Used directly in mongosh for database initialization

var userSchema = {
  bsonType: "object",
  required: ["username", "email", "password"],
  properties: {
    _id: { bsonType: "objectId" },
    username: { bsonType: "string" },
    email: { bsonType: "string" },
    password: { bsonType: "string" },
    role: { enum: ["admin", "regular"] },
    enabled: { bsonType: "bool" },
    isOnline: { bsonType: "bool" },
    
    // JWT/OAuth2 authentication fields
    verificationCode: { bsonType: "string" },
    verificationCodeExpiresAt: { bsonType: "date" },
    oauthProvider: { bsonType: "string" },
    oauthId: { bsonType: "string" },
    avatarUrl: { bsonType: "string" },
    
    // OAuth providers support
    authProviders: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["provider", "providerId"],
        properties: {
          provider: { bsonType: "string" },
          providerId: { bsonType: "string" },
          email: { bsonType: "string" },
          name: { bsonType: "string" }
        }
      }
    },
    
    // Timestamps
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" }
  }
};
