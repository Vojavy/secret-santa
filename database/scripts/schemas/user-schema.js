// Auto-generated schema for User collection
// Source: /schemas/User.js

var userSchema = {
  type: "object",
  required: ["login", "email", "password"],
  properties: {
    login: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
    avatar: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    isActive: { type: "boolean", default: true },
    isOnline: { type: "boolean", default: false },
    createdAt: { type: "date", default: new Date() }
  }
};

var userIndexes = [
  { key: { login: 1 }, unique: false },
  { key: { email: 1 }, unique: false },
  { key: { isActive: 1, isOnline: 1 }, unique: false }
];

var userUniqueIndexes = [
  { key: { login: 1 }, unique: true },
  { key: { email: 1 }, unique: true }
];

var userShardKey = { email: 1 };
var userSplitPoints = [
  { email: "f" },
  { email: "m" }, 
  { email: "s" }
];
