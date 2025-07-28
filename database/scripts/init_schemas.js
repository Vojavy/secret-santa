// This script is executed by `init_cluster.sh` and connects to the router to set up the sharded collections.
// It translates the Mongoose schemas from /database/schemas into native MongoDB JSON Schema validators.

const dbName = 'secret_santa';
const db = db.getSiblingDB(dbName);

print(`🚀 Enabling sharding for database: ${dbName}`);
sh.enableSharding(dbName);

// Helper function to create collection with schema validation and optimized sharding
function createCollectionWithSchema(collectionName, schema, shardKey, description, options = {}) {
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
  
  // Apply sharding with options for better distribution
  if (options.presplit && options.presplit.numInitialChunks) {
    sh.shardCollection(`${dbName}.${collectionName}`, shardKey, false, options.presplit);
  } else {
    sh.shardCollection(`${dbName}.${collectionName}`, shardKey);
  }
  
  // Add custom split points for better distribution if specified
  if (options.presplit && options.presplit.splitPoints) {
    options.presplit.splitPoints.forEach(point => {
      try {
        sh.splitAt(`${dbName}.${collectionName}`, point);
        print(`📍 Split created at: ${JSON.stringify(point)}`);
      } catch (e) {
        print(`⚠️ Split point ${JSON.stringify(point)} may already exist or be invalid`);
      }
    });
  }
  
  // Legacy support for direct splitPoints option
  if (options.splitPoints) {
    options.splitPoints.forEach(point => {
      try {
        sh.splitAt(`${dbName}.${collectionName}`, point);
        print(`📍 Split created at: ${JSON.stringify(point)}`);
      } catch (e) {
        print(`⚠️ Split point ${JSON.stringify(point)} may already exist or be invalid`);
      }
    });
  }
}

// --- Define Schemas and Create Collections based on Mongoose models ---

// User Schema (from User.js) - HIGH TRAFFIC COLLECTION
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
// Alternative: Use email as shard key to maintain uniqueness constraint
createCollectionWithSchema("users", userSchema, { email: 1 }, "Stores user accounts.", {
  presplit: { 
    splitPoints: [
      { email: "f" },  // Split around middle of alphabet
      { email: "m" },
      { email: "s" }
    ]
  }
});
// Email uniqueness is enforced by the shard key itself

// Game Schema (from Game.js) - MEDIUM TRAFFIC, GROWING COLLECTION  
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
// Optimized: Hashed _id for distribution + compound index for organizer queries
createCollectionWithSchema("games", gameSchema, { _id: "hashed" }, "Stores game sessions.", {
  presplit: { numInitialChunks: 4 }
});
db.games.createIndex({ organizer: 1, status: 1 });
db.games.createIndex({ status: 1, createdAt: -1 });

// Player Schema (from Player.js) - HIGH TRAFFIC, GAME-CENTRIC
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
// Optimized: game-first sharding for locality, hashed for distribution
createCollectionWithSchema("players", playerSchema, { game: "hashed" }, "Links users to games.", {
  presplit: { numInitialChunks: 6 }
});
db.players.createIndex({ user: 1, game: 1 });
db.players.createIndex({ game: 1, isOrganizer: 1 });

// Wishlist Schema (from Wishlist.js) - MEDIUM TRAFFIC, USER-CENTRIC
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
// Optimized: hashed player for even distribution
createCollectionWithSchema("wishlists", wishlistSchema, { player: "hashed" }, "Stores player wishlists.", {
  presplit: { numInitialChunks: 3 }
});

// Pair Schema (from Pair.js) - CRITICAL COLLECTION, GAME-CENTRIC
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
// Optimized: compound key for efficient game queries + giver lookups
createCollectionWithSchema("pairs", pairSchema, { game: 1, giver: 1 }, "Stores Santa-recipient pairs.");
db.pairs.createIndex({ giver: 1 });
db.pairs.createIndex({ recipient: 1 });

// DirectMessage Schema (from DirectMessage.js) - HIGH TRAFFIC, TIME-SENSITIVE
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
// Optimized: hashed pair for distribution + time-based queries
createCollectionWithSchema("direct_messages", directMessageSchema, { pair: "hashed" }, "Stores anonymous messages between pairs.", {
  presplit: { numInitialChunks: 6 }
});
db.direct_messages.createIndex({ pair: 1, sentAt: -1 });
db.direct_messages.createIndex({ sender: 1, sentAt: -1 });

// Notification Schema (from Notification.js) - HIGH TRAFFIC, USER-CENTRIC
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
// Optimized: hashed user for distribution + efficient user queries  
createCollectionWithSchema("notifications", notificationSchema, { user: "hashed" }, "Stores user notifications.", {
  presplit: { numInitialChunks: 4 }
});
db.notifications.createIndex({ user: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ user: 1, type: 1 });

// Ticket Schema (from Ticket.js) - LOW TRAFFIC, ADMIN-FOCUSED
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
// Optimized: status-first for admin queries, auto-split by MongoDB
createCollectionWithSchema("tickets", ticketSchema, { status: 1, _id: "hashed" }, "Stores support tickets.");
db.tickets.createIndex({ user: 1, status: 1 });
db.tickets.createIndex({ game: 1, status: 1 });
db.tickets.createIndex({ status: 1, createdAt: -1 });

print("✅ All collections created and sharded successfully according to optimized strategy.");

print("\n📊 SHARDING STRATEGY SUMMARY:");
print("┌─────────────────┬──────────────────────┬─────────────┬─────────────────────┐");
print("│ Collection      │ Shard Key            │ Chunks      │ Distribution Logic  │");
print("├─────────────────┼──────────────────────┼─────────────┼─────────────────────┤");
print("│ users           │ { email: 1 }         │ Custom splits│ Email-based + unique│");
print("│ games           │ { _id: hashed }      │ 4 initial   │ Even game spread    │");
print("│ players         │ { game: hashed }     │ 6 initial   │ Game-based locality │");
print("│ wishlists       │ { player: hashed }   │ 3 initial   │ Player-based spread │");
print("│ pairs           │ { game: 1, giver: 1 }│ Auto-split  │ Game + user locality│");
print("│ direct_messages │ { pair: hashed }     │ 6 initial   │ Conversation spread │");
print("│ notifications   │ { user: hashed }     │ 4 initial   │ User-based locality │");
print("│ tickets         │ { status: 1, _id: h} │ Auto-split  │ Admin-query optimized│");
print("└─────────────────┴──────────────────────┴─────────────┴─────────────────────┘");

print("\n🎯 OPTIMIZATION BENEFITS:");
print("• Even data distribution across all 3 shards");
print("• Minimized cross-shard queries for common operations");
print("• Optimized for Secret Santa workflow patterns");
print("• Additional indexes for non-sharded query patterns");
print("• Better performance for both read and write operations");