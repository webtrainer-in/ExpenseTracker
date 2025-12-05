import {
  users,
  expenses,
  categories,
  settings,
  type User,
  type UpsertUser,
  type Expense,
  type InsertExpense,
  type Category,
  type InsertCategory,
  type Settings,
  type UpdateSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settingsData: UpdateSettings): Promise<Settings>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  seedDefaultCategories(): Promise<void>;

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
  updateExpenseCategories(oldCategory: string, newCategory: string): Promise<void>;

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

  async getSettings(): Promise<Settings> {
    const [result] = await db.select().from(settings).where(eq(settings.id, "default"));
    if (!result) {
      const [newSettings] = await db
        .insert(settings)
        .values({ id: "default", currency: "USD" })
        .returning();
      return newSettings;
    }
    return result;
  }

  async updateSettings(settingsData: UpdateSettings): Promise<Settings> {
    const [result] = await db
      .update(settings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(settings.id, "default"))
      .returning();
    return result;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async seedDefaultCategories(): Promise<void> {
    const existingCategories = await this.getAllCategories();
    if (existingCategories.length > 0) {
      return;
    }

    const defaultCategories = [
      { name: "Groceries", icon: "shopping-cart" },
      { name: "Utilities", icon: "zap" },
      { name: "Transportation", icon: "car" },
      { name: "Entertainment", icon: "film" },
      { name: "Dining", icon: "utensils" },
      { name: "Healthcare", icon: "heart" },
      { name: "Education", icon: "graduation-cap" },
      { name: "Travel", icon: "plane" },
      { name: "Bills", icon: "home" },
      { name: "Other", icon: "more-horizontal" },
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
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
        paymentMethod: expenseData.paymentMethod,
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

  async updateExpenseCategories(oldCategory: string, newCategory: string): Promise<void> {
    await db
      .update(expenses)
      .set({ category: newCategory.toLowerCase() })
      .where(eq(expenses.category, oldCategory.toLowerCase()));
  }

  async getUserStats(userId: string): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

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
    lastMonth: number;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [totalResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses);

    const [thisMonthResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(gte(expenses.date, firstDayThisMonth));

    const [lastMonthResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
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
}

export const storage = new DatabaseStorage();
