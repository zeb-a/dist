/**
 * Script to migrate local PocketBase collections to remote instance
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REMOTE_BASE_URL = 'https://pocketbase-production-edf2.up.railway.app';
const LOCAL_SCHEMA_FILE = './pb_schema.json';

// Credentials - these would need to be provided securely in practice
const EMAIL = 'mikemu81@icloud.com';
const PASSWORD = 'bisxo2-vibsoK-fugtuk';

// Global variables to store auth token
let authToken = null;

// Login function to get auth token
async function login() {
  try {
    console.log('Logging in to remote PocketBase...');
    
    const response = await fetch(`${REMOTE_BASE_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: EMAIL,
        password: PASSWORD
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Login failed: ${error.message}`);
    }

    const data = await response.json();
    authToken = data.token;
    console.log('Login successful!');
    return data;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

// Function to create/update a collection
async function upsertCollection(collection) {
  try {
    console.log(`Upserting collection: ${collection.name}...`);
    
    // First, try to get existing collection by name
    let existingCollection = null;
    try {
      const existingResponse = await fetch(`${REMOTE_BASE_URL}/api/collections/${collection.name}`, {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (existingResponse.ok) {
        existingCollection = await existingResponse.json();
      }
    } catch (error) {
      console.log(`Collection ${collection.name} does not exist, will create new.`);
    }
    
    let result;
    if (existingCollection) {
      // Update existing collection
      console.log(`Updating existing collection: ${collection.name}`);
      const response = await fetch(`${REMOTE_BASE_URL}/api/collections/${existingCollection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: collection.name,
          type: collection.type,
          system: collection.system,
          listRule: collection.listRule,
          viewRule: collection.viewRule,
          createRule: collection.createRule,
          updateRule: collection.updateRule,
          deleteRule: collection.deleteRule,
          options: collection.options || {},
          schema: collection.schema
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update collection ${collection.name}: ${error.message}`);
      }
      
      result = await response.json();
      console.log(`Updated collection: ${collection.name}`);
    } else {
      // Create new collection
      console.log(`Creating new collection: ${collection.name}`);
      const response = await fetch(`${REMOTE_BASE_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: collection.name,
          type: collection.type,
          system: collection.system,
          listRule: collection.listRule,
          viewRule: collection.viewRule,
          createRule: collection.createRule,
          updateRule: collection.updateRule,
          deleteRule: collection.deleteRule,
          options: collection.options || {},
          schema: collection.schema
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create collection ${collection.name}: ${error.message}`);
      }
      
      result = await response.json();
      console.log(`Created collection: ${collection.name}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error upserting collection ${collection.name}:`, error.message);
    throw error;
  }
}

// Main migration function
async function migrateCollections() {
  try {
    console.log('Starting PocketBase collection migration...');
    
    // Read local schema
    if (!fs.existsSync(LOCAL_SCHEMA_FILE)) {
      throw new Error(`Schema file not found: ${LOCAL_SCHEMA_FILE}`);
    }
    
    const localSchema = JSON.parse(fs.readFileSync(LOCAL_SCHEMA_FILE, 'utf8'));
    console.log(`Found ${localSchema.length} collections in local schema`);
    
    // Login to remote instance
    await login();
    
    // Migrate each collection
    for (const collection of localSchema) {
      await upsertCollection(collection);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateCollections();

module.exports = {
  login,
  upsertCollection,
  migrateCollections
};