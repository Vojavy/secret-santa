// This script is executed by `init_cluster.sh` and connects to the router to set up the sharded collections.
// Schema definitions are loaded directly from /schemas/ files using load()

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
}

// Collection configuration with sharding strategies and schema files
const collectionConfigs = {
  users: {
    schemaFile: '/schemas/User.js',
    schemaVar: 'userSchema',
    shardKey: { email: 1 },
    description: "Stores user accounts",
    options: {
      presplit: { 
        splitPoints: [
          { email: "f" },
          { email: "m" },
          { email: "s" }
        ]
      }
    },
    indexes: [
      { isActive: 1, isOnline: 1 }
    ],
    uniqueIndexes: [
      { login: 1 },
      { email: 1 }
    ]
  },
  
  games: {
    schemaFile: '/schemas/Game.js',
    schemaVar: 'gameSchema',
    shardKey: { _id: "hashed" },
    description: "Stores game sessions",
    options: {
      presplit: { numInitialChunks: 6 }
    },
    indexes: [
      { creatorId: 1, status: 1 },
      { status: 1, createdAt: -1 },
      { status: 1, startAt: 1 }
    ]
  },
  
  players: {
    schemaFile: '/schemas/Player.js',
    schemaVar: 'playerSchema',
    shardKey: { _id: "hashed" },
    description: "Links users to games",
    options: {
      presplit: { numInitialChunks: 6 }
    },
    indexes: [
      { userId: 1, gameId: 1 },
      { gameId: 1 }
    ]
  },
  
  wishlists: {
    schemaFile: '/schemas/Wishlist.js',
    schemaVar: 'wishlistSchema',
    shardKey: { userId: "hashed" },
    description: "Stores player wishlists",
    options: {
      presplit: { numInitialChunks: 4 }
    },
    indexes: [
      { userId: 1 }
    ]
  },
  
  pairs: {
    schemaFile: '/schemas/Pair.js',
    schemaVar: 'pairSchema',
    shardKey: { gameId: "hashed" },
    description: "Stores Secret Santa assignments",
    options: {
      presplit: { numInitialChunks: 6 }
    },
    indexes: [
      { gameId: 1 },
      { gifterId: 1, gameId: 1 },
      { receiverId: 1, gameId: 1 }
    ]
  },
  
  messages: {
    schemaFile: '/schemas/Message.js',
    schemaVar: 'messageSchema',
    shardKey: { gameId: "hashed" },
    description: "Stores game chat messages",
    options: {
      presplit: { numInitialChunks: 6 }
    },
    indexes: [
      { gameId: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 }
    ]
  },
  
  directmessages: {
    schemaFile: '/schemas/DirectMessage.js',
    schemaVar: 'directMessageSchema',
    shardKey: { _id: "hashed" },
    description: "Stores private messages between users",
    options: {
      presplit: { numInitialChunks: 6 }
    },
    indexes: [
      { senderId: 1, receiverId: 1, createdAt: -1 },
      { receiverId: 1, createdAt: -1 }
    ]
  },
  
  notifications: {
    schemaFile: '/schemas/Notification.js',
    schemaVar: 'notificationSchema',
    shardKey: { userId: "hashed" },
    description: "Stores user notifications",
    options: {
      presplit: { numInitialChunks: 4 }
    },
    indexes: [
      { userId: 1 }
    ]
  },
  
  tickets: {
    schemaFile: '/schemas/Ticket.js',
    schemaVar: 'ticketSchema',
    shardKey: { _id: "hashed" },
    description: "Stores support tickets",
    options: {
      presplit: { numInitialChunks: 4 }
    },
    indexes: [
      { userId: 1, status: 1, createdAt: -1 },
      { status: 1, priority: 1, createdAt: -1 }
    ]
  },
  
  logs: {
    schemaFile: '/schemas/Log.js',
    schemaVar: 'logSchema',
    shardKey: { timestamp: 1 },
    description: "Stores system logs",
    options: {
      presplit: { 
        splitPoints: [
          { timestamp: new Date("2024-01-01") },
          { timestamp: new Date("2024-07-01") },
          { timestamp: new Date("2025-01-01") }
        ]
      }
    },
    indexes: [
      { logType: 1, timestamp: -1 },
      { actorId: 1, timestamp: -1 },
      { "payload.action": 1, timestamp: -1 }
    ]
  }
};

// --- Create collections with loaded schemas ---

print(`📋 Processing ${Object.keys(collectionConfigs).length} collections...`);

Object.entries(collectionConfigs).forEach(([collectionName, config]) => {
  print(`\n🔄 Processing collection: ${collectionName}`);
  
  // Load schema from file using load()
  let schema = null;
  
  try {
    print(`🔍 Loading schema: ${config.schemaFile}`);
    load(config.schemaFile);
    
    // Get the schema variable from the loaded file
    if (config.schemaVar === 'userSchema' && typeof userSchema !== 'undefined') schema = userSchema;
    else if (config.schemaVar === 'gameSchema' && typeof gameSchema !== 'undefined') schema = gameSchema;
    else if (config.schemaVar === 'playerSchema' && typeof playerSchema !== 'undefined') schema = playerSchema;
    else if (config.schemaVar === 'wishlistSchema' && typeof wishlistSchema !== 'undefined') schema = wishlistSchema;
    else if (config.schemaVar === 'pairSchema' && typeof pairSchema !== 'undefined') schema = pairSchema;
    else if (config.schemaVar === 'messageSchema' && typeof messageSchema !== 'undefined') schema = messageSchema;
    else if (config.schemaVar === 'directMessageSchema' && typeof directMessageSchema !== 'undefined') schema = directMessageSchema;
    else if (config.schemaVar === 'notificationSchema' && typeof notificationSchema !== 'undefined') schema = notificationSchema;
    else if (config.schemaVar === 'ticketSchema' && typeof ticketSchema !== 'undefined') schema = ticketSchema;
    else if (config.schemaVar === 'logSchema' && typeof logSchema !== 'undefined') schema = logSchema;
    
    if (schema) {
      print(`✅ Successfully loaded schema for ${collectionName} from ${config.schemaFile}`);
    } else {
      print(`❌ Schema variable ${config.schemaVar} not found in ${config.schemaFile}`);
    }
  } catch (error) {
    print(`⚠️ Error loading schema file ${config.schemaFile}: ${error}`);
  }
  
  if (!schema) {
    print(`❌ No schema available for ${collectionName}, skipping...`);
    return;
  }
  
  // Create collection with schema validation and sharding
  createCollectionWithSchema(
    collectionName,
    schema,
    config.shardKey,
    config.description,
    config.options
  );
  
  // Create additional indexes
  if (config.indexes && config.indexes.length > 0) {
    print(`📊 Creating ${config.indexes.length} indexes for ${collectionName}...`);
    config.indexes.forEach(indexSpec => {
      try {
        db.getCollection(collectionName).createIndex(indexSpec);
        print(`  ✅ Index ${JSON.stringify(indexSpec)} created`);
      } catch (e) {
        print(`  ⚠️ Index creation failed: ${e}`);
      }
    });
  }
  
  // Create unique indexes
  if (config.uniqueIndexes && config.uniqueIndexes.length > 0) {
    print(`🔐 Creating ${config.uniqueIndexes.length} unique indexes for ${collectionName}...`);
    config.uniqueIndexes.forEach((indexSpec, index) => {
      try {
        // Generate unique index name to avoid conflicts
        const indexName = `${collectionName}_unique_${index}`;
        db.getCollection(collectionName).createIndex(indexSpec, { unique: true, name: indexName });
        print(`  ✅ Unique index ${JSON.stringify(indexSpec)} created with name: ${indexName}`);
      } catch (e) {
        print(`  ⚠️ Unique index creation failed: ${e}`);
      }
    });
  }
});

print(`\n🎉 Schema initialization completed!`);
print(`📊 Created ${Object.keys(collectionConfigs).length} sharded collections with validation`);
print(`🔍 All schemas are loaded from /database/schemas/`);
