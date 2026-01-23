import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).notNull().default("tag"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default("default"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable(
  "expenses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("UPI"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_expenses_user_id").on(table.userId),
    index("idx_expenses_date").on(table.date),
    index("idx_expenses_category").on(table.category),
  ]
);

// Wallet balances table
export const walletBalances = pgTable(
  "wallet_balances",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_wallet_balances_user_id").on(table.userId),
  ]
);

// Wallet transactions table
export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(), // 'deposit' or 'withdrawal'
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    relatedExpenseId: varchar("related_expense_id").references(() => expenses.id, { onDelete: "set null" }),
    balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_wallet_transactions_user_id").on(table.userId),
    index("idx_wallet_transactions_date").on(table.date),
    index("idx_wallet_transactions_type").on(table.type),
  ]
);

// Reserve wallet table (singleton)
export const reserveWallet = pgTable("reserve_wallet", {
  id: varchar("id").primaryKey().default("reserve"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reserve transactions table
export const reserveTransactions = pgTable(
  "reserve_transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(), // 'deposit' or 'withdrawal'
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    performedByUserId: varchar("performed_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    relatedWalletTransactionId: varchar("related_wallet_transaction_id").references(() => walletTransactions.id, { onDelete: "set null" }),
    balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_reserve_transactions_date").on(table.date),
    index("idx_reserve_transactions_type").on(table.type),
    index("idx_reserve_transactions_user").on(table.performedByUserId),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  walletBalance: many(walletBalances),
  walletTransactions: many(walletTransactions),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  expenses: many(expenses),
}));

export const walletBalancesRelations = relations(walletBalances, ({ one }) => ({
  user: one(users, {
    fields: [walletBalances.userId],
    references: [users.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  relatedExpense: one(expenses, {
    fields: [walletTransactions.relatedExpenseId],
    references: [expenses.id],
  }),
}));


// Zod schemas for validation
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.number().positive(),
  date: z.string().or(z.date()),
  paymentMethod: z.enum(["UPI", "CASH", "CARD"]).default("UPI"),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = insertCategorySchema.partial();

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const updateSettingsSchema = insertSettingsSchema.partial();

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
  balanceAfter: true, // Calculated by backend
  userId: true, // Set by backend from auth
  relatedExpenseId: true, // Optional, set by backend for expense-related transactions
  type: true, // Set by backend based on endpoint (deposit/withdrawal)
}).extend({
  amount: z.number().positive(),
  date: z.string().or(z.date()),
});

export const insertWalletBalanceSchema = createInsertSchema(walletBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReserveTransactionSchema = createInsertSchema(reserveTransactions).omit({
  id: true,
  createdAt: true,
  balanceAfter: true, // Calculated by backend
  performedByUserId: true, // Set by backend from auth
  relatedWalletTransactionId: true, // Set by backend for linked transactions
  type: true, // Set by backend based on endpoint
}).extend({
  amount: z.number().positive(),
  date: z.string().or(z.date()),
});

// TypeScript types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Settings = typeof settings.$inferSelect;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type WalletBalance = typeof walletBalances.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type ReserveWallet = typeof reserveWallet.$inferSelect;
export type ReserveTransaction = typeof reserveTransactions.$inferSelect;
export type InsertReserveTransaction = z.infer<typeof insertReserveTransactionSchema>;
