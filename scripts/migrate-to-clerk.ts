import "dotenv/config";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
const OLD_USER_ID = "49399593"; // Your old Replit Auth ID
const NEW_USER_ID = "user_35dgCEfAUyQsYyTEOQKfLMz642X"; // Your Clerk ID

async function migrateToClerk() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log("🔄 Starting migration from Replit Auth to Clerk...\n");

    // Step 1: Update the old user record with the new Clerk ID
    console.log(`1️⃣ Updating user record: ${OLD_USER_ID} -> ${NEW_USER_ID}`);
    
    // First, delete the duplicate Clerk user entry (empty one)
    await pool.query(`DELETE FROM users WHERE id = $1 AND email = ''`, [NEW_USER_ID]);
    console.log("   ✅ Removed empty Clerk user entry");
    
    // Update the old user ID to the new Clerk ID
    await pool.query(`
      UPDATE users 
      SET id = $1 
      WHERE id = $2
    `, [NEW_USER_ID, OLD_USER_ID]);
    console.log("   ✅ Updated user ID");

    // Step 2: Update all expenses to use the new user ID
    console.log("\n2️⃣ Migrating expenses...");
    const expensesResult = await pool.query(`
      UPDATE expenses 
      SET user_id = $1 
      WHERE user_id = $2
      RETURNING id
    `, [NEW_USER_ID, OLD_USER_ID]);
    console.log(`   ✅ Migrated ${expensesResult.rowCount} expenses`);

    // Step 3: Verify the migration
    console.log("\n3️⃣ Verifying migration...");
    const verifyResult = await pool.query(`
      SELECT u.email, u.id, u.role, COUNT(e.id) as expense_count
      FROM users u
      LEFT JOIN expenses e ON e.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.role
    `, [NEW_USER_ID]);

    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log(`   ✅ User: ${user.email}`);
      console.log(`   ✅ ID: ${user.id}`);
      console.log(`   ✅ Role: ${user.role}`);
      console.log(`   ✅ Expenses: ${user.expense_count}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("   Please refresh your browser to see your expenses.");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.log("\n⚠️  If you see a foreign key constraint error, run this SQL manually in Neon:");
    console.log(`
-- Temporarily disable foreign key constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_users_id_fk;

-- Update user ID
UPDATE users SET id = '${NEW_USER_ID}' WHERE id = '${OLD_USER_ID}';

-- Update expenses
UPDATE expenses SET user_id = '${NEW_USER_ID}' WHERE user_id = '${OLD_USER_ID}';

-- Re-add foreign key constraint
ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_users_id_fk 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
  } finally {
    await pool.end();
  }
}

migrateToClerk();
