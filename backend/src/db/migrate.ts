import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, closePool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🔄 Running database migration...\n');
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    
    await query(sql);
    
    console.log('✅ Database migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
