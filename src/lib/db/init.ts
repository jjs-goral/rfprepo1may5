import { D1Database } from '@cloudflare/workers-types';

// Helper function to get the D1 database instance
export function getDb(context: any): D1Database {
  return context.env.DB;
}

// Helper function to initialize the database context
export async function initDb(context: any) {
  const db = getDb(context);
  
  // Check if the database is initialized
  try {
    const result = await db.prepare('SELECT 1 FROM users LIMIT 1').all();
    return db;
  } catch (error) {
    // If the tables don't exist, run the migration
    console.log('Initializing database...');
    
    // Read the SQL from the migrations file
    // In a production environment, you would use a proper migration system
    // This is a simplified approach for this project
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', '0001_initial.sql'), 'utf8');
    
    // Execute the SQL
    await db.exec(sql);
    return db;
  }
}
