// User schema definition for MongoDB JSON Schema validation
// Generated from /schemas/User.js

var userSchemaDefinition = {
  type: "object",
  required: ["login", "email", "passwordHash"],
  properties: {
    login: { type: "string" },
    email: { type: "string" },
    passwordHash: { type: "string" },
    role: { 
      type: "string",
      enum: ["admin", "regular"],
      default: "regular"
    },
    isActive: { type: "boolean", default: true },
    isOnline: { type: "boolean", default: false },
    authProviders: {
      type: "array",
      items: {
        type: "object",
        required: ["provider", "providerId"],
        properties: {
          provider: { type: "string" },
          providerId: { type: "string" }
        }
      }
    },
    createdAt: { type: "string", format: "date-time" }
  }
};

var userShardKey = { email: 1 };
var userIndexes = [
  { login: 1 },
  { email: 1 },
  { isActive: 1, isOnline: 1 }
];
var userUniqueIndexes = [
  { login: 1 },
  { email: 1 }
];
var userPresplit = {
  splitPoints: [
    { email: "f" },
    { email: "m" },
    { email: "s" }
  ]
};
