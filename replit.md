# ExpenseTracker - Family Expense Management SaaS

## Overview

ExpenseTracker is a family expense management SaaS application that enables household members to collaboratively track, analyze, and manage shared expenses. The application provides role-based access control (admin and member roles), expense categorization, filtering capabilities, and analytics dashboards with visual charts. Built as a modern web application, it emphasizes data clarity, efficient workflows, and minimal-click interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- Single-page application (SPA) using Wouter for client-side routing
- Vite as the build tool and development server
- Component-based architecture with shared UI components

**UI Component System**: shadcn/ui (Radix UI primitives)
- Comprehensive component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system inspired by Linear, Notion, and Expensify
- Typography: Inter for body/headers, JetBrains Mono for currency/dates
- Consistent spacing primitives (2, 4, 6, 8, 12, 16, 24)

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks
- Query client configured with infinite stale time and disabled refetch behaviors

**Design Principles**:
- Data clarity over decoration
- Utility-focused with efficient workflows
- Monospace fonts for currency amounts and dates
- Responsive grid layouts (12-column dashboard, 3-column stats)

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API architecture
- Session-based authentication using express-session
- Middleware for JSON parsing with raw body preservation
- Request/response logging for API routes

**Database Layer**: 
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL (via @neondatabase/serverless)
- Connection pooling for efficient database access
- Schema-first approach with migrations

**Authentication Strategy**: Replit Auth (OpenID Connect)
- Passport.js strategy for OIDC integration
- PostgreSQL-backed session storage (connect-pg-simple)
- Token management with access and refresh tokens
- Session TTL: 7 days

**API Structure**:
- `/api/auth/*` - Authentication endpoints (user info, login/logout)
- `/api/expenses` - CRUD operations for expenses with filtering
  - GET: Admins see all expenses with user info, members see only their own
  - POST: Create new expense
  - PATCH: Update expense (admins can edit any expense, members only their own)
  - DELETE: Delete expense (admins can delete any expense, members only their own)
- `/api/categories` - Category management (admin-only mutations)
  - GET: List all categories (authenticated users)
  - POST: Create category (admin only)
  - PATCH: Update category (admin only)
  - DELETE: Delete category (admin only)
- `/api/stats` - Expense statistics (admins see all users, members see only their own)

### Data Storage

**Database Schema** (PostgreSQL via Drizzle):

1. **sessions** - Session storage for authentication
   - Primary key: sid (varchar)
   - sess (jsonb), expire (timestamp)

2. **users** - User accounts with role-based access
   - Primary key: id (UUID, auto-generated)
   - Fields: email (unique), firstName, lastName, profileImageUrl
   - role: "admin" | "member" (default: "member")
   - Timestamps: createdAt, updatedAt

3. **expenses** - Expense records
   - Primary key: id (UUID, auto-generated)
   - Foreign key: userId (references users, cascade delete)
   - Fields: amount (decimal 10,2), category (varchar 50, lowercase), description (text), date (timestamp)
   - Timestamps: createdAt, updatedAt
   - Note: Categories stored in lowercase for consistency

4. **categories** - Expense categories (admin-managed)
   - Primary key: id (UUID, auto-generated)
   - Fields: name (varchar 50, proper casing), icon (varchar 50, Lucide icon name)
   - Timestamps: createdAt, updatedAt
   - Default categories seeded on app startup if table is empty

**Data Access Patterns**:
- Storage abstraction layer (IStorage interface) for all database operations
- Query filtering: by category, date range
- Aggregation queries for statistics (total, monthly, by-user)
- Join queries for admin view (expenses with user information)
- Category normalization: expenses store lowercase categories, lookup via case-insensitive comparison

**Admin Features**:
- **Category Management**: Admins can create, rename, and delete expense categories
  - Categories support custom Lucide React icons
  - Default categories seeded on startup: Groceries, Utilities, Transportation, Entertainment, Dining, Healthcare, Education, Travel, Bills, Other
  - Category changes reflected immediately across all expense forms and filters
- **Expense Editing**: Admins can edit expenses submitted by any family member
  - User ownership preserved (only expense data is modified)
  - EditExpenseDialog normalizes categories to lowercase for consistency
  - Cache invalidation uses predicate-based approach to refresh all filtered views
- **Full Visibility**: Admins see all family expenses with user attribution in expense tables

### External Dependencies

**Authentication & Identity**:
- Replit Auth via OpenID Connect (ISSUER_URL configuration)
- Session management with PostgreSQL storage

**Database**:
- Neon serverless PostgreSQL (DATABASE_URL environment variable)
- Connection via WebSocket (using 'ws' package)

**UI & Design**:
- Google Fonts: Inter (body/headers), JetBrains Mono (monospace data)
- Radix UI primitives (20+ component primitives)
- Recharts for data visualization (bar charts, pie charts)

**Development Tools**:
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- TypeScript for type safety across frontend and backend

**Key Third-Party Packages**:
- date-fns for date manipulation
- zod for schema validation (with drizzle-zod integration)
- React Hook Form with @hookform/resolvers for form management
- class-variance-authority and clsx for dynamic styling
- nanoid for ID generation

**Environment Requirements**:
- DATABASE_URL (Neon PostgreSQL connection string)
- SESSION_SECRET (for session encryption)
- REPL_ID (Replit environment identifier)
- ISSUER_URL (OIDC provider URL, defaults to Replit)