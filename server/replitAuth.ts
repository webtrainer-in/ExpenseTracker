import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Helper to extract user info from Clerk session
async function upsertUserFromClerk(clerkUser: any) {
  const userId = clerkUser.userId;
  const existingUser = await storage.getUser(userId);
  
  let role: "admin" | "member" = "member";
  
  if (existingUser) {
    role = existingUser.role as "admin" | "member";
  } else if (clerkUser.publicMetadata?.role === "admin") {
    role = "admin";
  }
  
  await storage.upsertUser({
    id: userId,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    profileImageUrl: clerkUser.imageUrl || null,
    role: role,
  });
  
  return userId;
}

export async function setupAuth(app: Express) {
  // Skip Replit auth setup for local development
  if (process.env.REPL_ID === 'local-dev' || !process.env.REPL_ID) {
    console.log('⚠️  Running in local development mode - authentication is disabled');
    
    // Add mock login/logout routes for local development
    app.get("/api/login", (req, res) => {
      res.redirect("/");
    });
    
    app.get("/api/logout", (req, res) => {
      res.redirect("/");
    });
    
    return;
  }

  // Note: This app now uses Clerk for authentication
  // The Clerk middleware is set up in the main server file
  console.log('✅ Using Clerk authentication');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Bypass authentication for local development
  if (process.env.REPL_ID === 'local-dev' || !process.env.REPL_ID) {
    // Mock a local user for development
    (req as any).user = {
      claims: {
        sub: 'local-dev-user',
        email: 'dev@localhost',
        first_name: 'Local',
        last_name: 'Developer'
      }
    };
    return next();
  }

  // For Clerk authentication, check if user is authenticated
  // Clerk middleware should have already set req.auth
  const auth = (req as any).auth;
  
  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};
