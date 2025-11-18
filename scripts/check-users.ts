import "dotenv/config";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function migrateUsers() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log("🔍 Checking existing users...\n");

    // Get all users
    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      ORDER BY created_at
    `);

    console.log("Existing users:");
    usersResult.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} - ID: ${user.id} - Role: ${user.role}`);
    });

    // Count expenses per user
    const expensesResult = await pool.query(`
      SELECT u.email, u.id as user_id, COUNT(e.id) as expense_count
      FROM users u
      LEFT JOIN expenses e ON e.user_id = u.id
      GROUP BY u.id, u.email
      ORDER BY expense_count DESC
    `);

    console.log("\n📊 Expenses per user:");
    expensesResult.rows.forEach((row) => {
      console.log(`${row.email}: ${row.expense_count} expenses`);
    });

    console.log("\n✅ Migration check complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

migrateUsers();
