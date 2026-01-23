import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, withAuth } from "./clerkAuth";
import { insertExpenseSchema, insertCategorySchema, updateCategorySchema, updateSettingsSchema, insertWalletTransactionSchema, insertReserveTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (from Replit Auth blueprint)
  await setupAuth(app);

  // Seed default categories if none exist (ignore errors if table doesn't exist yet)
  try {
    await storage.seedDefaultCategories();
  } catch (error) {
    console.log("Categories table not yet available, skipping seeding");
  }

  // Auth routes
  app.get("/api/auth/user", withAuth, async (req: any, res) => {
    try {
      const auth = req.auth;
      if (!auth?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = auth.userId;
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: auth.sessionClaims?.email || "",
          firstName: auth.sessionClaims?.firstName || "",
          lastName: auth.sessionClaims?.lastName || "",
          profileImageUrl: auth.sessionClaims?.imageUrl || null,
          role: 'member',
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Users route (for admin to fetch all users)
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const currentUser = await storage.getUser(userId);

      // Only admin can fetch all users
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Settings routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = updateSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const validatedData = updateCategorySchema.parse(req.body);
      
      // Update the category first to ensure it succeeds
      const updatedCategory = await storage.updateCategory(id, validatedData);
      
      // Only after successful category update, cascade the change to expenses
      if (validatedData.name && validatedData.name !== category.name) {
        await storage.updateExpenseCategories(category.name, validatedData.name);
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Expense routes
  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { category, startDate, endDate } = req.query;

      // Admin can see all expenses with user info, members see only their own
      if (user.role === "admin") {
        const allExpenses = await storage.getAllExpenses({
          category: category as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });
        res.json(allExpenses);
      } else {
        const userExpenses = await storage.getUserExpenses(userId, {
          category: category as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });
        // For members, return expenses without user field (matches ExpenseWithUser interface)
        res.json(userExpenses.map(exp => ({ ...exp, user })));
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        userId,
      });

      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const { id } = req.params;

      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow users to edit their own expenses, or admins to edit any
      if (expense.userId !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(id, validatedData);
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const { id } = req.params;

      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow users to delete their own expenses, or admins to delete any
      if (expense.userId !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteExpense(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Admin gets all users stats, members get only their own
      const stats = user.role === "admin"
        ? await storage.getAllUsersStats()
        : await storage.getUserStats(userId);

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Wallet routes
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res) => {
    try {
      const authUserId = req.auth.userId;
      const requestedUserId = req.query.userId as string | undefined;
      
      // Determine which user's balance to fetch
      let targetUserId = authUserId;
      
      // If requesting another user's balance, verify admin access
      if (requestedUserId && requestedUserId !== authUserId) {
        const authUser = await storage.getUser(authUserId);
        if (!authUser || authUser.role !== "admin") {
          return res.status(403).json({ message: "Admin access required to view other users' balances" });
        }
        targetUserId = requestedUserId;
      }
      
      let balance = await storage.getWalletBalance(targetUserId);
      
      // Initialize wallet if doesn't exist
      if (!balance) {
        balance = await storage.initializeWalletBalance(targetUserId, 0);
      }
      
      res.json(balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  app.post("/api/wallet/deposit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      
      // Validate only the request body (amount, description, date)
      const validatedData = insertWalletTransactionSchema.parse(req.body);

      // Check if source is "Added from Reserve"
      const isFromReserve = req.body.description?.startsWith("Added from Reserve");

      if (isFromReserve) {
        // Check reserve balance
        const reserve = await storage.getReserveBalance();
        const reserveBalance = reserve ? parseFloat(reserve.currentBalance) : 0;

        if (reserveBalance < validatedData.amount) {
          return res.status(400).json({ 
            message: "Insufficient reserve balance",
            required: validatedData.amount,
            available: reserveBalance
          });
        }
      }

      // Create wallet deposit transaction
      const transaction = await storage.createWalletTransaction({
        userId,
        type: "deposit",
        amount: validatedData.amount,
        description: validatedData.description,
        date: new Date(validatedData.date),
      });

      // If from reserve, create reserve withdrawal transaction
      if (isFromReserve) {
        await storage.createReserveTransaction({
          type: "withdrawal",
          amount: validatedData.amount,
          description: `Transferred to user wallet: ${validatedData.description}`,
          performedByUserId: userId,
          relatedWalletTransactionId: transaction.id,
          date: new Date(validatedData.date),
        });
      }

      const newBalance = await storage.getWalletBalance(userId);
      
      res.status(201).json({ 
        transaction, 
        newBalance: newBalance?.currentBalance || "0" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deposit data", errors: error.errors });
      }
      console.error("Error creating deposit:", error);
      res.status(500).json({ message: "Failed to add money to wallet" });
    }
  });

  app.get("/api/wallet/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const { type, startDate, endDate } = req.query;

      const transactions = await storage.getWalletTransactions(userId, {
        type: type as 'deposit' | 'withdrawal' | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  app.get("/api/wallet/transactions/all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { startDate, endDate } = req.query;

      const transactions = await storage.getAllWalletTransactions({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Reserve wallet routes (admin only)
  app.get("/api/reserve/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      let reserve = await storage.getReserveBalance();
      if (!reserve) {
        reserve = await storage.initializeReserveWallet();
      }

      res.json(reserve);
    } catch (error) {
      console.error("Error fetching reserve balance:", error);
      res.status(500).json({ message: "Failed to fetch reserve balance" });
    }
  });

  app.post("/api/reserve/deposit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertReserveTransactionSchema.parse(req.body);
      const source = req.body.source; // ATM Withdrawal, Added from Wallet, Others
      const selectedUserId = req.body.selectedUserId; // Optional: which user's wallet to deduct from

      // If source is "Added from Wallet", deduct from specified user's wallet (or admin's if not specified)
      if (source === "Added from Wallet") {
        // Determine which user's wallet to deduct from
        const targetUserId = selectedUserId || userId;
        
        const targetWallet = await storage.getWalletBalance(targetUserId);
        const targetBalance = targetWallet ? parseFloat(targetWallet.currentBalance) : 0;

        if (targetBalance < validatedData.amount) {
          return res.status(400).json({ 
            message: "Insufficient wallet balance",
            required: validatedData.amount,
            available: targetBalance
          });
        }

        // Create wallet withdrawal for the target user
        await storage.createWalletTransaction({
          userId: targetUserId,
          type: "withdrawal",
          amount: validatedData.amount,
          description: validatedData.description, // Already formatted as "Added from [User]'s wallet by admin"
          date: new Date(validatedData.date),
        });
      }

      // Create reserve deposit transaction
      const transaction = await storage.createReserveTransaction({
        type: "deposit",
        amount: validatedData.amount,
        description: validatedData.description,
        performedByUserId: userId,
        date: new Date(validatedData.date),
      });

      const newBalance = await storage.getReserveBalance();

      res.status(201).json({ 
        transaction, 
        newBalance: newBalance?.currentBalance || "0" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deposit data", errors: error.errors });
      }
      console.error("Error creating reserve deposit:", error);
      res.status(500).json({ message: "Failed to add money to reserve" });
    }
  });

  app.get("/api/reserve/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { type, startDate, endDate } = req.query;

      const transactions = await storage.getReserveTransactions({
        type: type as 'deposit' | 'withdrawal' | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching reserve transactions:", error);
      res.status(500).json({ message: "Failed to fetch reserve transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
