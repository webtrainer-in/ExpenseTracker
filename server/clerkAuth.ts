import { ClerkExpressRequireAuth, ClerkExpressWithAuth, clerkClient } from "@clerk/clerk-sdk-node";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Helper to extract user info from Clerk session
async function upsertUserFromClerk(auth: any) {
  const userId = auth.userId;
  
  if (!userId) {
    return null;
  }
  
  try {
    // Fetch full user details from Clerk API
    const clerkUser = await clerkClient.users.getUser(userId);
    
    const existingUser = await storage.getUser(userId);
    
    let role: "admin" | "member" = "member";
    
    if (existingUser) {
      role = existingUser.role as "admin" | "member";
    }
    
    // Get primary email address
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || "";
    
    // Upsert user with full details from Clerk
    await storage.upsertUser({
      id: userId,
      email: primaryEmail,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      profileImageUrl: clerkUser.imageUrl || null,
      role: role,
    });
    
    return userId;
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    return userId;
  }
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
        
        // Fetch user from database to get updated details
        const dbUser = await storage.getUser(auth.userId);
        
        // Attach user info to request for backward compatibility
        (req as any).user = {
          claims: {
            sub: auth.userId,
            email: dbUser?.email || "",
            first_name: dbUser?.firstName || "",
            last_name: dbUser?.lastName || "",
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
