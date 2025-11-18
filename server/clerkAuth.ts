import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Helper to extract user info from Clerk session
async function upsertUserFromClerk(auth: any) {
  const userId = auth.userId;
  
  if (!userId) {
    return null;
  }
  
  const existingUser = await storage.getUser(userId);
  
  let role: "admin" | "member" = "member";
  
  if (existingUser) {
    role = existingUser.role as "admin" | "member";
  }
  
  // We'll get user details from Clerk's user object if available
  // For now, we'll create a basic user entry
  if (!existingUser) {
    await storage.upsertUser({
      id: userId,
      email: auth.sessionClaims?.email || "",
      firstName: auth.sessionClaims?.firstName || "",
      lastName: auth.sessionClaims?.lastName || "",
      profileImageUrl: auth.sessionClaims?.imageUrl || null,
      role: role,
    });
  }
  
  return userId;
}

export async function setupAuth(app: Express) {
  // No additional setup needed for Clerk
  // Clerk middleware is applied per-route
  console.log('✅ Clerk authentication configured');
}

// Middleware to require authentication
export const isAuthenticated: RequestHandler = ClerkExpressRequireAuth({
  onError: (error: any) => {
    console.error('Clerk auth error:', error);
  }
}) as RequestHandler;

// Middleware to optionally check authentication and sync user
export const withAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const clerkMiddleware = ClerkExpressWithAuth({
    onError: (error: any) => {
      console.error('Clerk auth error:', error);
      return next();
    }
  });
  
  clerkMiddleware(req, res, async () => {
    try {
      const auth = (req as any).auth;
      if (auth?.userId) {
        await upsertUserFromClerk(auth);
        // Attach user info to request for backward compatibility
        (req as any).user = {
          claims: {
            sub: auth.userId,
            email: auth.sessionClaims?.email,
            first_name: auth.sessionClaims?.firstName,
            last_name: auth.sessionClaims?.lastName,
          }
        };
      }
      next();
    } catch (error) {
      console.error('Error in withAuth middleware:', error);
      next(error);
    }
  });
};
