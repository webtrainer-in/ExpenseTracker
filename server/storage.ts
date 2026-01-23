import {
  users,
  expenses,
  categories,
  settings,
  walletBalances,
  walletTransactions,
  type User,
  type UpsertUser,
  type Expense,
  type InsertExpense,
  type Category,
  type InsertCategory,
  type Settings,
  type UpdateSettings,
  type WalletBalance,
  type WalletTransaction,
  type InsertWalletTransaction,
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

  // Wallet operations
  getWalletBalance(userId: string): Promise<WalletBalance | undefined>;
  initializeWalletBalance(userId: string, initialBalance?: number): Promise<WalletBalance>;
  createWalletTransaction(data: {
    userId: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    description: string;
    relatedExpenseId?: string;
    date: Date;
  }): Promise<WalletTransaction>;
  getWalletTransactions(userId: string, options?: {
    type?: 'deposit' | 'withdrawal';
    startDate?: Date;
    endDate?: Date;
  }): Promise<WalletTransaction[]>;
  getAllWalletTransactions(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<WalletTransaction & { user: User }>>;
  reverseWalletTransaction(expenseId: string): Promise<void>;
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
    
    // If payment method is CASH, deduct from wallet
    if (expenseData.paymentMethod === 'CASH') {
      await this.createWalletTransaction({
        userId: expenseData.userId,
        type: 'withdrawal',
        amount: expenseData.amount,
        description: `Expense: ${expenseData.description}`,
        relatedExpenseId: expense.id,
        date: new Date(expenseData.date),
      });
    }
    
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
    // Get the original expense to check payment method changes
    const original = await this.getExpense(id);
    if (!original) {
      throw new Error('Expense not found');
    }

    const updateData: any = { ...expenseData, updatedAt: new Date() };
    if (expenseData.date) {
      updateData.date = new Date(expenseData.date);
    }

    const [expense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    
    // Handle wallet transaction changes
    const oldPaymentMethod = original.paymentMethod;
    const newPaymentMethod = expenseData.paymentMethod || oldPaymentMethod;
    const oldAmount = parseFloat(original.amount);
    const newAmount = expenseData.amount || oldAmount;

    // If payment method changed FROM cash TO something else, reverse the withdrawal
    if (oldPaymentMethod === 'CASH' && newPaymentMethod !== 'CASH') {
      await this.reverseWalletTransaction(id);
    }
    // If payment method changed FROM something else TO cash, create withdrawal
    else if (oldPaymentMethod !== 'CASH' && newPaymentMethod === 'CASH') {
      await this.createWalletTransaction({
        userId: original.userId,
        type: 'withdrawal',
        amount: newAmount,
        description: `Expense: ${expenseData.description || original.description}`,
        relatedExpenseId: id,
        date: new Date(expenseData.date || original.date),
      });
    }
    // If payment method is still CASH but amount changed, adjust the difference
    else if (oldPaymentMethod === 'CASH' && newPaymentMethod === 'CASH' && oldAmount !== newAmount) {
      const difference = newAmount - oldAmount;
      if (difference !== 0) {
        await this.createWalletTransaction({
          userId: original.userId,
          type: difference > 0 ? 'withdrawal' : 'deposit',
          amount: Math.abs(difference),
          description: `Expense adjustment: ${expenseData.description || original.description}`,
          relatedExpenseId: id,
          date: new Date(),
        });
      }
    }
    
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    // Get the expense to check if it was a cash payment
    const expense = await this.getExpense(id);
    
    // If it was a cash expense, reverse the wallet transaction
    if (expense && expense.paymentMethod === 'CASH') {
      await this.reverseWalletTransaction(id);
    }
    
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
    averageMonthly: number;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const firstDayLast12Months = new Date(now.getFullYear(), now.getMonth() - 12, 1);

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

    // Get expenses for last 12 months (excluding current month)
    const [last12MonthsResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, firstDayLast12Months),
          lte(expenses.date, lastDayLastMonth)
        )
      );

    // Get the earliest expense date for this user
    const [earliestExpense] = await db
      .select({ date: expenses.date })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(expenses.date)
      .limit(1);

    // Calculate number of completed months (excluding current month)
    let completedMonths = 0;
    let startDateForAverage = firstDayLast12Months;
    
    if (earliestExpense) {
      const earliestDate = new Date(earliestExpense.date);
      const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + 
                        (now.getMonth() - earliestDate.getMonth());
      completedMonths = Math.min(monthsDiff, 12);
      
      // Use the later of: earliest expense date or 12 months ago
      startDateForAverage = earliestDate > firstDayLast12Months ? earliestDate : firstDayLast12Months;
    }

    // Get expenses for the calculated period (excluding current month)
    const [averagePeriodResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDateForAverage),
          lte(expenses.date, lastDayLastMonth)
        )
      );

    const averagePeriodTotal = parseFloat(averagePeriodResult.sum) || 0;
    const averageMonthly = completedMonths > 0 ? averagePeriodTotal / completedMonths : 0;

    return {
      total: parseFloat(totalResult.sum) || 0,
      thisMonth: parseFloat(thisMonthResult.sum) || 0,
      lastMonth: parseFloat(lastMonthResult.sum) || 0,
      averageMonthly,
    };
  }


  async getAllUsersStats(): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    averageMonthly: number;
    byUser: Array<{ user: User; total: number }>;
  }> {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Calculate date range for last 12 months (excluding current month)
    const firstDayLast12Months = new Date(now.getFullYear(), now.getMonth() - 12, 1);

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

    // Get the earliest expense date to calculate number of completed months
    const [earliestExpense] = await db
      .select({ date: expenses.date })
      .from(expenses)
      .orderBy(expenses.date)
      .limit(1);

    // Calculate number of completed months (excluding current month)
    let completedMonths = 0;
    let startDateForAverage = firstDayLast12Months;
    
    if (earliestExpense) {
      const earliestDate = new Date(earliestExpense.date);
      const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + 
                        (now.getMonth() - earliestDate.getMonth());
      // Don't count current month, and cap at 12
      completedMonths = Math.min(monthsDiff, 12);
      
      // Use the later of: earliest expense date or 12 months ago
      // This ensures we don't query for dates before expenses exist
      startDateForAverage = earliestDate > firstDayLast12Months ? earliestDate : firstDayLast12Months;
    }

    // Get expenses for the calculated period (excluding current month)
    const [averagePeriodResult] = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, startDateForAverage),
          lte(expenses.date, lastDayLastMonth)
        )
      );

    // Calculate average monthly spending
    const averagePeriodTotal = parseFloat(averagePeriodResult.sum) || 0;
    const averageMonthly = completedMonths > 0 ? averagePeriodTotal / completedMonths : 0;

    // Get expenses grouped by user
    const userStats = await db
      .select({
        userId: expenses.userId,
        sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .groupBy(expenses.userId);

    // Fetch user details for each user with expenses
    const byUser = await Promise.all(
      userStats.map(async (stat) => {
        const user = await this.getUser(stat.userId);
        return {
          user: user!,
          total: parseFloat(stat.sum) || 0,
        };
      })
    );

    return {
      total: parseFloat(totalResult.sum) || 0,
      thisMonth: parseFloat(thisMonthResult.sum) || 0,
      lastMonth: parseFloat(lastMonthResult.sum) || 0,
      averageMonthly,
      byUser,
    };
  }

  // Wallet operations
  async getWalletBalance(userId: string): Promise<WalletBalance | undefined> {
    const [balance] = await db
      .select()
      .from(walletBalances)
      .where(eq(walletBalances.userId, userId));
    return balance;
  }

  async initializeWalletBalance(userId: string, initialBalance: number = 0): Promise<WalletBalance> {
    // Try to get existing balance first
    const existing = await this.getWalletBalance(userId);
    if (existing) {
      return existing;
    }

    // Create new wallet balance
    const [balance] = await db
      .insert(walletBalances)
      .values({
        userId,
        currentBalance: initialBalance.toString(),
      })
      .returning();
    return balance;
  }

  async createWalletTransaction(data: {
    userId: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    description: string;
    relatedExpenseId?: string;
    date: Date;
  }): Promise<WalletTransaction> {
    // Get or initialize wallet balance
    let balance = await this.getWalletBalance(data.userId);
    if (!balance) {
      balance = await this.initializeWalletBalance(data.userId, 0);
    }

    const currentBalance = parseFloat(balance.currentBalance);
    const newBalance = data.type === 'deposit' 
      ? currentBalance + data.amount 
      : currentBalance - data.amount;

    // Create transaction
    const [transaction] = await db
      .insert(walletTransactions)
      .values({
        userId: data.userId,
        type: data.type,
        amount: data.amount.toString(),
        description: data.description,
        relatedExpenseId: data.relatedExpenseId,
        balanceAfter: newBalance.toString(),
        date: data.date,
      })
      .returning();

    // Update wallet balance
    await db
      .update(walletBalances)
      .set({ 
        currentBalance: newBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(walletBalances.userId, data.userId));

    return transaction;
  }

  async getWalletTransactions(
    userId: string,
    options?: {
      type?: 'deposit' | 'withdrawal';
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<WalletTransaction[]> {
    const conditions = [eq(walletTransactions.userId, userId)];

    if (options?.type) {
      conditions.push(eq(walletTransactions.type, options.type));
    }
    if (options?.startDate) {
      conditions.push(gte(walletTransactions.date, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(walletTransactions.date, options.endDate));
    }

    return await db
      .select()
      .from(walletTransactions)
      .where(and(...conditions))
      .orderBy(desc(walletTransactions.date));
  }

  async getAllWalletTransactions(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<WalletTransaction & { user: User }>> {
    const conditions = [];

    if (options?.startDate) {
      conditions.push(gte(walletTransactions.date, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(walletTransactions.date, options.endDate));
    }

    const result = await db
      .select()
      .from(walletTransactions)
      .leftJoin(users, eq(walletTransactions.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(walletTransactions.date));

    return result.map((row) => ({
      ...row.wallet_transactions,
      user: row.users!,
    }));
  }

  async reverseWalletTransaction(expenseId: string): Promise<void> {
    // Find the wallet transaction related to this expense
    const [transaction] = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.relatedExpenseId, expenseId));

    if (!transaction) {
      return; // No wallet transaction to reverse
    }

    // Create a reverse transaction (opposite type)
    const reverseType = transaction.type === 'withdrawal' ? 'deposit' : 'withdrawal';
    await this.createWalletTransaction({
      userId: transaction.userId,
      type: reverseType,
      amount: parseFloat(transaction.amount),
      description: `Reversed: ${transaction.description}`,
      date: new Date(),
    });
  }
}

export const storage = new DatabaseStorage();
