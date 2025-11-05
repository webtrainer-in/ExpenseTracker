import {
  users,
  expenses,
  type User,
  type UpsertUser,
  type Expense,
  type InsertExpense,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpense(id: string): Promise<Expense | undefined>;
  getUserExpenses(userId: string, options?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Expense[]>;
  getAllExpenses(options?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<Expense & { user: User }>>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Analytics operations
  getUserStats(userId: string): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
  }>;
  getAllUsersStats(): Promise<{
    total: number;
    thisMonth: number;
    byUser: Array<{ user: User; total: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        userId: expenseData.userId,
        amount: expenseData.amount.toString(),
        category: expenseData.category,
        description: expenseData.description,
        date: new Date(expenseData.date),
      })
      .returning();
    return expense;
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async getUserExpenses(
    userId: string,
    options?: { category?: string; startDate?: Date; endDate?: Date }
  ): Promise<Expense[]> {
    const conditions = [eq(expenses.userId, userId)];

    if (options?.category) {
      conditions.push(eq(expenses.category, options.category));
    }
    if (options?.startDate) {
      conditions.push(gte(expenses.date, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(expenses.date, options.endDate));
    }

    return await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date));
  }

  async getAllExpenses(options?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<Expense & { user: User }>> {
    const conditions = [];

    if (options?.category) {
      conditions.push(eq(expenses.category, options.category));
    }
    if (options?.startDate) {
      conditions.push(gte(expenses.date, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(expenses.date, options.endDate));
    }

    const result = await db
      .select()
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.date));

    return result.map((row) => ({
      ...row.expenses,
      user: row.users!,
    }));
  }

  async updateExpense(id: string, expenseData: Partial<InsertExpense>): Promise<Expense> {
    const updateData: any = { ...expenseData, updatedAt: new Date() };
    if (expenseData.date) {
      updateData.date = new Date(expenseData.date);
    }

    const [expense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getUserStats(userId: string): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(eq(expenses.userId, userId));

    const [thisMonthResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), gte(expenses.date, firstDayThisMonth)));

    const [lastMonthResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, firstDayLastMonth),
          lte(expenses.date, lastDayLastMonth)
        )
      );

    return {
      total: parseFloat(totalResult.sum) || 0,
      thisMonth: parseFloat(thisMonthResult.sum) || 0,
      lastMonth: parseFloat(lastMonthResult.sum) || 0,
    };
  }

  async getAllUsersStats(): Promise<{
    total: number;
    thisMonth: number;
    byUser: Array<{ user: User; total: number }>;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses);

    const [thisMonthResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(gte(expenses.date, firstDayThisMonth));

    const byUserResult = await db
      .select({
        user: users,
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(users)
      .leftJoin(expenses, eq(users.id, expenses.userId))
      .groupBy(users.id);

    return {
      total: parseFloat(totalResult.sum) || 0,
      thisMonth: parseFloat(thisMonthResult.sum) || 0,
      byUser: byUserResult.map((row) => ({
        user: row.user,
        total: parseFloat(row.total) || 0,
      })),
    };
  }
}

export const storage = new DatabaseStorage();
