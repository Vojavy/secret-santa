// Utility to convert Mongoose schemas to MongoDB JSON Schema validators
const mongoose = require('mongoose');

/**
 * Converts Mongoose schema to MongoDB JSON Schema
 */
function mongooseToJsonSchema(mongooseSchema) {
  const jsonSchema = {
    bsonType: "object",
    required: [],
    properties: {}
  };

  // Extract required fields
  Object.keys(mongooseSchema.paths).forEach(path => {
    if (path === '__v' || path === '_id') return;
    
    const schemaPath = mongooseSchema.paths[path];
    if (schemaPath.isRequired) {
      jsonSchema.required.push(path);
    }
  });

  // Convert each field
  Object.keys(mongooseSchema.paths).forEach(path => {
    if (path === '__v') return; // Skip version key
    
    const schemaPath = mongooseSchema.paths[path];
    jsonSchema.properties[path] = convertSchemaPath(schemaPath);
  });

  // Add _id if not explicitly excluded
  if (!jsonSchema.properties._id) {
    jsonSchema.properties._id = { bsonType: "objectId" };
  }

  return jsonSchema;
}

function convertSchemaPath(schemaPath) {
  const instance = schemaPath.instance;
  const options = schemaPath.options;
  
  let property = {};

  switch (instance) {
    case 'String':
      property.bsonType = "string";
      if (options.enum) {
        property.enum = options.enum;
      }
      break;
    case 'Number':
      property.bsonType = "number";
      break;
    case 'Date':
      property.bsonType = "date";
      break;
    case 'Boolean':
      property.bsonType = "bool";
      break;
    case 'ObjectID':
      property.bsonType = "objectId";
      break;
    case 'Array':
      property.bsonType = "array";
      if (schemaPath.schema) {
        // Nested schema
        property.items = mongooseToJsonSchema(schemaPath.schema);
      } else if (schemaPath.caster) {
        // Array of primitives
        property.items = convertSchemaPath(schemaPath.caster);
      }
      break;
    case 'Embedded':
      property = mongooseToJsonSchema(schemaPath.schema);
      break;
    default:
      property.bsonType = "string"; // fallback
  }

  return property;
}

module.exports = { mongooseToJsonSchema };
