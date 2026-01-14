/**
 * Script to export local PocketBase data to JSON format for manual import
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

// Read the local SQLite database to extract records
console.log('Exporting local PocketBase data...');

try {
  // Attempt to read the SQLite database file
  const dbPath = './pb_data/data.db';
  
  if (!fs.existsSync(dbPath)) {
    console.log('Local database not found at ./pb_data/data.db');
    console.log('Attempting to extract collection information from schema and migration files instead...');
    
    // Read schema file
    const schemaPath = './pb_schema.json';
    if (fs.existsSync(schemaPath)) {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      console.log(`Found schema with ${schema.length} collections:`);
      schema.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) with ${col.schema.length} fields`);
      });
      
      // Create export directory
      const exportDir = './exports';
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      // Write schema to export file
      fs.writeFileSync(path.join(exportDir, 'schema.json'), JSON.stringify(schema, null, 2));
      console.log(`Schema exported to ${exportDir}/schema.json`);
      
      // List migration files
      const migrationDir = './pb_migrations';
      if (fs.existsSync(migrationDir)) {
        const migrationFiles = fs.readdirSync(migrationDir).filter(f => f.endsWith('.js'));
        console.log(`Found ${migrationFiles.length} migration files in ${migrationDir}`);
        
        // Copy migration files to exports
        migrationFiles.forEach(file => {
          const srcPath = path.join(migrationDir, file);
          const destPath = path.join(exportDir, file);
          fs.copyFileSync(srcPath, destPath);
        });
        console.log(`${migrationFiles.length} migration files copied to ${exportDir}/`);
      }
    }
    
    console.log('\nNote: To migrate data, you will need to:');
    console.log('1. Recreate the collections on the remote instance using the schema');
    console.log('2. Manually enter any important data via the web interface, or');
    console.log('3. Use the PocketBase API to programmatically add records after collections are created');
    console.log('\nThe migration instructions are documented in MIGRATION_INSTRUCTIONS.md');
  } else {
    console.log('Found local database, but direct SQLite reading requires additional dependencies.');
    console.log('For security reasons, it\'s better to export via PocketBase admin interface or API.');
  }
} catch (error) {
  console.error('Error during export:', error.message);
}