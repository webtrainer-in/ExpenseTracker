# Deploy ExpenseTracker to Render

This guide will help you deploy your ExpenseTracker application to Render.

## Prerequisites

- [x] GitHub account
- [x] Render account (sign up at https://render.com)
- [x] Clerk account with API keys
- [x] Neon PostgreSQL database
- [x] Your code pushed to GitHub

## Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create a Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Create a New Web Service

1. Click **"New +"** button → Select **"Web Service"**
2. Connect your GitHub repository: `webtrainer-in/ExpenseTracker`
3. Configure the service:

### Basic Settings:
- **Name**: `expense-tracker` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `ExpenseTracker_v2` (or your main branch)
- **Root Directory**: (leave empty)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Instance Type:
- Select **Free** tier to start (can upgrade later)

## Step 4: Add Environment Variables

In the "Environment" section, add these variables:

### Required Variables:

```env
NODE_ENV=production

# Database (from your Neon dashboard)
DATABASE_URL=postgresql://neondb_owner:npg_zXF5gGxnMb8d@ep-weathered-sun-a1t3i7v6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication (from your Clerk dashboard)
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- Use your **production** Clerk keys (pk_live_ and sk_live_) not test keys
- The `VITE_CLERK_PUBLISHABLE_KEY` must be the SAME as `CLERK_PUBLISHABLE_KEY`
- Copy your actual DATABASE_URL from Neon

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Start the server
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 6: Configure Clerk for Production

1. Go to your Clerk Dashboard
2. Navigate to **Domains** section
3. Add your Render domain (e.g., `expense-tracker.onrender.com`)
4. Update **Allowed redirect URLs**:
   - `https://your-app.onrender.com`
   - `https://your-app.onrender.com/`

## Step 7: Test Your Deployment

1. Visit your Render URL: `https://your-app.onrender.com`
2. Try signing in with Clerk
3. Create a test expense
4. Verify everything works

## Step 8: Custom Domain (Optional)

To use your own domain:

1. In Render dashboard, go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `expenses.yourdomain.com`)
3. Update your DNS records with the CNAME provided by Render
4. Update Clerk dashboard with your custom domain

## Deployment Updates

Every time you push to your GitHub branch, Render will automatically redeploy.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Monitoring & Logs

- **Logs**: View real-time logs in Render dashboard → Logs tab
- **Metrics**: Monitor CPU, Memory usage in Metrics tab
- **Health**: Render automatically health checks your app

## Troubleshooting

### Build Failed
- Check Render logs for specific error
- Verify all dependencies are in `package.json`
- Ensure build command is correct

### App Crashes on Start
- Check environment variables are set correctly
- Verify DATABASE_URL is correct
- Check Start Command logs

### Authentication Not Working
- Verify Clerk keys are production keys (pk_live_, sk_live_)
- Check Clerk dashboard has correct domain configured
- Ensure both `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` are set

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP whitelist in Neon includes Render IPs (usually not needed)

### Environment Variables Not Loading
- Double-check spelling of variable names
- Ensure no extra spaces in values
- Redeploy after adding new variables

## Scaling

### Free Tier:
- Good for testing and small projects
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds

### Paid Tier ($7/month):
- Always running (no spin-down)
- Better performance
- More memory and CPU

## Security Best Practices

1. ✅ Use production Clerk keys
2. ✅ Enable HTTPS only (Render does this automatically)
3. ✅ Keep dependencies updated
4. ✅ Rotate secrets periodically
5. ✅ Monitor logs for suspicious activity

## Cost Estimate

- **Render Free Tier**: $0/month (perfect for getting started)
- **Render Starter**: $7/month (recommended for production)
- **Neon Free Tier**: $0/month (sufficient for most use cases)
- **Clerk Free Tier**: $0/month (up to 10,000 MAU)

**Total Free**: $0/month  
**Total Production**: $7/month (if you upgrade Render)

## Support

- **Render Docs**: https://render.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Neon Docs**: https://neon.tech/docs

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created and connected to GitHub repo
- [ ] Environment variables added (DATABASE_URL, CLERK keys)
- [ ] Deployment successful
- [ ] Clerk domain configured
- [ ] Application tested
- [ ] Custom domain added (optional)

🎉 **Your ExpenseTracker is now live!**
