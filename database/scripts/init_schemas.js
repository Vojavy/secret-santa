// This script is executed by `init_cluster.sh` and connects to the router to set up the sharded collections.
// It translates the Mongoose schemas from /database/schemas into native MongoDB JSON Schema validators.

const dbName = 'secret_santa';
const db = db.getSiblingDB(dbName);

print(`🚀 Enabling sharding for database: ${dbName}`);
sh.enableSharding(dbName);

// Helper function to create collection with schema validation
function createCollectionWithSchema(collectionName, schema, shardKey, description) {
  print(`✨ Creating collection: ${collectionName}. ${description || ''}`);
  
  if (db.getCollectionNames().includes(collectionName)) {
    print(`Collection ${collectionName} already exists. Dropping it.`);
    db.getCollection(collectionName).drop();
  }

  db.createCollection(collectionName, {
    validator: {
      $jsonSchema: schema
    }
  });

  print(`🔑 Creating index and sharding for: ${collectionName}`);
  db.getCollection(collectionName).createIndex(shardKey);
  sh.shardCollection(`${dbName}.${collectionName}`, shardKey);
}

// --- Define Schemas and Create Collections based on Mongoose models ---

// User Schema (from User.js)
const userSchema = {
  bsonType: "object",
  required: ["login", "email", "passwordHash"],
  properties: {
    _id: { bsonType: "objectId" },
    login: { bsonType: "string" },
    email: { bsonType: "string" },
    passwordHash: { bsonType: "string" },
    role: { enum: ['admin', 'regular'] },
    isActive: { bsonType: "bool" },
    isOnline: { bsonType: "bool" },
    authProviders: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["provider", "providerId"],
        properties: {
          provider: { bsonType: "string" },
          providerId: { bsonType: "string" }
        }
      }
    },
    createdAt: { bsonType: "date" }
  }
};
// Shard Key: { email: 1 } - Unique and good for user lookups.
createCollectionWithSchema("users", userSchema, { email: 1 }, "Stores user accounts.");

// Game Schema (from Game.js)
const gameSchema = {
  bsonType: "object",
  required: ["name", "organizer"],
  properties: {
    _id: { bsonType: "objectId" },
    name: { bsonType: "string" },
    organizer: { bsonType: "objectId" },
    participants: { 
        bsonType: "array",
        items: { bsonType: "objectId" }
    },
    status: { enum: ["pending", "active", "finished"] },
    budget: { 
        bsonType: "object",
        properties: {
            amount: { bsonType: "number" },
            currency: { bsonType: "string" }
        }
     },
    createdAt: { bsonType: "date" }
  }
};
// Shard Key: { _id: "hashed" } - Good for even distribution.
createCollectionWithSchema("games", gameSchema, { _id: "hashed" }, "Stores game sessions.");

// Player Schema (from Player.js)
const playerSchema = {
  bsonType: "object",
  required: ["user", "game"],
  properties: {
    _id: { bsonType: "objectId" },
    user: { bsonType: "objectId" },
    game: { bsonType: "objectId" },
    isOrganizer: { bsonType: "bool" },
    assignedRecipient: { bsonType: "objectId" }
  }
};
// Shard Key: { game: 1, user: 1 } - Compound key for game/player lookups.
createCollectionWithSchema("players", playerSchema, { game: 1, user: 1 }, "Links users to games.");

// Wishlist Schema (from Wishlist.js)
const wishlistSchema = {
  bsonType: "object",
  required: ["player"],
  properties: {
    _id: { bsonType: "objectId" },
    player: { bsonType: "objectId" },
    items: {
        bsonType: "array",
        items: {
            bsonType: "object",
            required: ["name"],
            properties: {
                name: { bsonType: "string" },
                description: { bsonType: "string" },
                link: { bsonType: "string" }
            }
        }
    }
  }
};
// Shard Key: { player: 1 } - Efficient for fetching a player's wishlist.
createCollectionWithSchema("wishlists", wishlistSchema, { player: 1 }, "Stores player wishlists.");

// Pair Schema (from Pair.js)
const pairSchema = {
  bsonType: "object",
  required: ["game", "giver", "recipient"],
  properties: {
    _id: { bsonType: "objectId" },
    game: { bsonType: "objectId" },
    giver: { bsonType: "objectId" },
    recipient: { bsonType: "objectId" }
  }
};
// Shard Key: { game: 1 } - Groups pairs by game.
createCollectionWithSchema("pairs", pairSchema, { game: 1 }, "Stores Santa-recipient pairs.");

// DirectMessage Schema (from DirectMessage.js)
const directMessageSchema = {
    bsonType: "object",
    required: ["pair", "sender", "content"],
    properties: {
        _id: { bsonType: "objectId" },
        pair: { bsonType: "objectId" },
        sender: { bsonType: "objectId" },
        content: { bsonType: "string" },
        sentAt: { bsonType: "date" }
    }
};
// Shard Key: { pair: 1 } - Groups messages by pair.
createCollectionWithSchema("direct_messages", directMessageSchema, { pair: 1 }, "Stores anonymous messages between pairs.");

// Notification Schema (from Notification.js)
const notificationSchema = {
    bsonType: "object",
    required: ["user", "type", "message"],
    properties: {
        _id: { bsonType: "objectId" },
        user: { bsonType: "objectId" },
        type: { enum: ["game_invite", "game_start", "new_message", "system_alert"] },
        message: { bsonType: "string" },
        isRead: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
    }
};
// Shard Key: { user: 1 } - Groups notifications by user.
createCollectionWithSchema("notifications", notificationSchema, { user: 1 }, "Stores user notifications.");

// Ticket Schema (from Ticket.js)
const ticketSchema = {
    bsonType: "object",
    required: ["user", "game", "subject", "description"],
    properties: {
        _id: { bsonType: "objectId" },
        user: { bsonType: "objectId" },
        game: { bsonType: "objectId" },
        subject: { bsonType: "string" },
        description: { bsonType: "string" },
        status: { enum: ["open", "in_progress", "closed"] },
        createdAt: { bsonType: "date" }
    }
};
// Shard Key: { game: 1, status: 1 } - For querying tickets by game and status.
createCollectionWithSchema("tickets", ticketSchema, { game: 1, status: 1 }, "Stores support tickets.");

print("✅ All collections created and sharded successfully according to Mongoose schemas.");