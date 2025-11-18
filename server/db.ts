import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as PgPool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Use standard PostgreSQL driver for local development, Neon for production
const isLocalDb = process.env.DATABASE_URL.includes('localhost') || 
                  process.env.DATABASE_URL.includes('127.0.0.1');

let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isLocalDb) {
  // Use standard PostgreSQL driver for local database
  console.log('📦 Using standard PostgreSQL driver for local database');
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg({ client: pool, schema });
} else {
  // Use Neon serverless driver for cloud database
  console.log('☁️  Using Neon serverless driver for cloud database');
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
  
  // Set search_path to public schema for each query
  // This is a workaround for Neon pooler schema issues
  pool.on('connect', async (client) => {
    try {
      await client.query('SET search_path TO public');
    } catch (err) {
      console.error('Error setting search_path:', err);
    }
  });
}

export { pool, db };
