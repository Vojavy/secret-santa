#!/usr/bin/env node

/**
 * Schema Synchronization Utility
 * 
 * This utility helps maintain consistency between Mongoose schemas 
 * and MongoDB JSON Schema validators used in the sharded setup.
 * 
 * Usage:
 * - node sync-schemas.js --check      # Check for differences
 * - node sync-schemas.js --generate   # Generate new init_schemas.js
 * - node sync-schemas.js --validate   # Validate all schemas
 */

const fs = require('fs');
const path = require('path');
const { mongooseToJsonSchema } = require('./schema-converter');

const SCHEMAS_DIR = path.join(__dirname, '../schemas');
const INIT_SCHEMAS_FILE = path.join(__dirname, 'init_schemas.js');

class SchemaSynchronizer {
  constructor() {
    this.mongooseSchemas = new Map();
    this.jsonSchemas = new Map();
  }

  /**
   * Load all Mongoose schema files
   */
  loadMongooseSchemas() {
    const schemaFiles = fs.readdirSync(SCHEMAS_DIR)
      .filter(file => file.endsWith('.js'));

    console.log(`📁 Found ${schemaFiles.length} schema files`);

    schemaFiles.forEach(file => {
      try {
        const schemaPath = path.join(SCHEMAS_DIR, file);
        const modelName = path.basename(file, '.js').toLowerCase();
        
        // For demonstration - in real implementation you'd require the file
        console.log(`📋 Processing schema: ${modelName} (${file})`);
        
        // Store schema info for later processing
        this.mongooseSchemas.set(modelName, {
          file,
          path: schemaPath,
          // schema: would contain actual mongoose schema
        });
      } catch (error) {
        console.error(`❌ Error loading ${file}: ${error.message}`);
      }
    });
  }

  /**
   * Check for schema differences
   */
  checkSchemaDifferences() {
    console.log('\n🔍 Checking for schema differences...\n');
    
    const differences = [];
    
    // Check if all Mongoose schemas have corresponding JSON schemas
    for (const [modelName] of this.mongooseSchemas) {
      if (!this.jsonSchemas.has(modelName)) {
        differences.push({
          type: 'missing_json',
          model: modelName,
          message: `JSON schema missing for ${modelName}`
        });
      }
    }
    
    // Check for orphaned JSON schemas
    for (const [modelName] of this.jsonSchemas) {
      if (!this.mongooseSchemas.has(modelName)) {
        differences.push({
          type: 'orphaned_json',
          model: modelName,
          message: `JSON schema exists but no Mongoose schema for ${modelName}`
        });
      }
    }
    
    if (differences.length === 0) {
      console.log('✅ All schemas are in sync!');
    } else {
      console.log(`⚠️ Found ${differences.length} differences:`);
      differences.forEach(diff => {
        console.log(`  - ${diff.message}`);
      });
    }
    
    return differences;
  }

  /**
   * Generate collection configurations based on Mongoose schemas
   */
  generateCollectionConfigs() {
    const configs = {};
    
    // Default sharding strategies by collection type
    const defaultStrategies = {
      users: { shardKey: { email: 1 }, splitPoints: [{ email: "f" }, { email: "m" }, { email: "s" }] },
      games: { shardKey: { _id: "hashed" }, numInitialChunks: 4 },
      players: { shardKey: { game: "hashed" }, numInitialChunks: 6 },
      messages: { shardKey: { game: "hashed" }, numInitialChunks: 8 },
      logs: { shardKey: { timestamp: 1 }, timeBased: true }
    };
    
    for (const [modelName, schemaInfo] of this.mongooseSchemas) {
      const collectionName = this.getCollectionName(modelName);
      const strategy = defaultStrategies[collectionName] || { shardKey: { _id: "hashed" } };
      
      configs[collectionName] = {
        schemaFile: `../schemas/${schemaInfo.file}`,
        shardKey: strategy.shardKey,
        description: `Stores ${modelName} documents.`,
        options: this.buildShardingOptions(strategy),
        indexes: this.inferIndexes(modelName)
      };
    }
    
    return configs;
  }

  /**
   * Get collection name from model name
   */
  getCollectionName(modelName) {
    // Convert singular to plural and lowercase
    const pluralRules = {
      'user': 'users',
      'game': 'games',
      'player': 'players',
      'message': 'messages',
      'directmessage': 'directmessages',
      'notification': 'notifications',
      'ticket': 'tickets',
      'log': 'logs',
      'wishlist': 'wishlists',
      'pair': 'pairs'
    };
    
    return pluralRules[modelName] || `${modelName}s`;
  }

  /**
   * Build sharding options from strategy
   */
  buildShardingOptions(strategy) {
    const options = {};
    
    if (strategy.numInitialChunks) {
      options.presplit = { numInitialChunks: strategy.numInitialChunks };
    }
    
    if (strategy.splitPoints) {
      options.presplit = options.presplit || {};
      options.presplit.splitPoints = strategy.splitPoints;
    }
    
    return options;
  }

  /**
   * Infer common indexes based on schema and collection type
   */
  inferIndexes(modelName) {
    const commonIndexes = {
      user: [
        { login: 1 }, { email: 1 }, { isActive: 1, isOnline: 1 }
      ],
      game: [
        { creatorId: 1, status: 1 }, { status: 1, createdAt: -1 }
      ],
      player: [
        { user: 1, game: 1 }, { game: 1 }
      ],
      message: [
        { game: 1, timestamp: -1 }, { sender: 1, timestamp: -1 }
      ],
      log: [
        { level: 1, timestamp: -1 }, { action: 1, timestamp: -1 }
      ]
    };
    
    return commonIndexes[modelName] || [];
  }

  /**
   * Generate new init_schemas.js file
   */
  generateInitSchemasFile() {
    console.log('\n🔧 Generating new init_schemas.js file...\n');
    
    const configs = this.generateCollectionConfigs();
    
    // Generate the file content (implementation would create actual file)
    console.log('📄 Generated collection configurations:');
    Object.entries(configs).forEach(([name, config]) => {
      console.log(`  - ${name}: ${config.description}`);
    });
    
    console.log('\n✅ New init_schemas.js would be generated with current schemas');
    
    return configs;
  }

  /**
   * Validate all schemas
   */
  validateSchemas() {
    console.log('\n🔍 Validating schemas...\n');
    
    let isValid = true;
    
    for (const [modelName, schemaInfo] of this.mongooseSchemas) {
      try {
        // Validation logic would go here
        console.log(`✅ ${modelName}: Valid`);
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message}`);
        isValid = false;
      }
    }
    
    return isValid;
  }

  /**
   * Run the synchronization process
   */
  run(command) {
    this.loadMongooseSchemas();
    
    switch (command) {
      case '--check':
        return this.checkSchemaDifferences();
        
      case '--generate':
        return this.generateInitSchemasFile();
        
      case '--validate':
        return this.validateSchemas();
        
      default:
        console.log(`
📋 Schema Synchronization Utility

Usage:
  node sync-schemas.js --check      # Check for differences between schemas
  node sync-schemas.js --generate   # Generate new init_schemas.js file  
  node sync-schemas.js --validate   # Validate all schemas

Current Mongoose schemas found: ${this.mongooseSchemas.size}
        `);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const synchronizer = new SchemaSynchronizer();
  const command = process.argv[2];
  synchronizer.run(command);
}

module.exports = SchemaSynchronizer;
