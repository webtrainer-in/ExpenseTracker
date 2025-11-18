# Clerk Authentication Setup Guide

Your ExpenseTracker application has been successfully migrated from Replit Auth to Clerk!

## 🎉 What Changed

- ✅ Replaced Replit Auth with Clerk
- ✅ Updated server middleware to use Clerk SDK
- ✅ Updated client to use Clerk React components
- ✅ Simplified authentication flow with pre-built UI

## 📋 Setup Steps

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### Step 2: Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update Environment Variables

Update your `.env` file with your Clerk keys:

```env
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important:** 
- Use the SAME publishable key for both `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
- Never commit your `.env` file to Git!

### Step 4: Configure Clerk Dashboard

In your Clerk dashboard:

1. **Email/Password**: Enable in **User & Authentication → Email, Phone, Username**
2. **Social Logins** (Optional): Enable Google, GitHub, etc.
3. **User Profile**: Customize the fields you want to collect

### Step 5: Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:5000` and test the authentication!

## 🚀 Deployment

When deploying to production:

1. **Vercel/Railway/Render**: Add environment variables in the dashboard
2. **Clerk Dashboard**: Update your domain in **Domains** section
3. Use production keys (starts with `pk_live_` and `sk_live_`)

## 🔐 Features Included

- ✅ Sign up / Sign in
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management
- ✅ Session management
- ✅ Protected routes

## 📱 Authentication Flow

1. **Unauthenticated users** → See Landing page
2. **Click "Log In" or "Get Started"** → Clerk sign-in modal appears
3. **After sign-in** → Automatically redirected to Dashboard
4. **User profile** → Click avatar in header to manage account

## 🎨 Customization

To customize the Clerk UI appearance, update the `appearance` prop in:
- `client/src/App.tsx` (ClerkProvider)
- `client/src/components/UserHeader.tsx` (UserButton)

Example:
```tsx
<ClerkProvider 
  publishableKey={clerkPubKey}
  appearance={{
    variables: {
      colorPrimary: "#your-color"
    }
  }}
>
```

## 🔧 Troubleshooting

### "Missing Clerk Publishable Key" error
- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env`
- Restart the dev server after adding environment variables

### Authentication not working
- Check that both server and client have the correct keys
- Verify in Clerk dashboard that your domain is whitelisted
- Check browser console for errors

### Users not being created in database
- The first time a user signs in, they're automatically added to the database
- Check the `/api/auth/user` endpoint is working

## 📚 Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Node.js SDK](https://clerk.com/docs/references/nodejs/overview)

---

**Need Help?** Check the Clerk documentation or reach out to their support team!
