# Vercel Serverless Deployment Guide

This guide outlines how to deploy the Auth Provider application on Vercel using the modern zero-config serverless setup.

## Prerequisites
1. A **Vercel Account** (Free tier is perfectly fine).
2. The **Vercel CLI** installed (`npm i -g vercel`), or you can link the GitHub repository directly to Vercel.

---

## Option A: Direct Git Deployment (Recommended)
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** ➔ **Project**.
3. Import your GitHub repository `KingOfKings01/auth-provider`.
4. In the **Configure Project** step:
   - Select the branch: `serverless`.
   - Keep the **Framework Preset** as **Other** (it will auto-detect the configuration using `vercel.json` and the `api/` directory).
5. Expand **Environment Variables** and add the following keys from your `.env` file:
   - `JWT_SECRET` (e.g., `super_secret_key_change_this`)
   - `JWT_EXPIRE` (e.g., `24h`)
   - `ADMIN_EMAIL` (e.g., `admin@example.com`)
   - `ADMIN_PASSWORD` (e.g., `admin123`)
   - `MONGO_URI` (e.g., `mongodb+srv://...`)
   - `SENDER_EMAIL` (e.g., `gst.auto.helper@gmail.com`)
   - `SENDER_PASS` (e.g., `tgdnapttvjpvasvx`)
6. Click **Deploy**. Vercel will build the serverless functions and serve the application.

---

## Option B: Command Line Deployment (Vercel CLI)
1. Run the deployment command in the project root:
   ```bash
   vercel
   ```
2. Follow the interactive prompts to link the project:
   - **Set up and deploy?** Yes
   - **Which scope?** (Your personal scope)
   - **Link to existing project?** No
   - **What's your project's name?** `auth-provider`
   - **In which directory is your code located?** `./`
   - **Auto-detected Project Settings:** (Accept defaults)
3. Add your environment variables using the CLI:
   ```bash
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRE
   vercel env add ADMIN_EMAIL
   vercel env add ADMIN_PASSWORD
   vercel env add MONGO_URI
   vercel env add SENDER_EMAIL
   vercel env add SENDER_PASS
   ```
4. Perform the final deployment:
   ```bash
   vercel --prod
   ```

---

## Post-Deployment Verification
Once deployment is complete, Vercel will provide you with a production URL (e.g., `https://auth-provider.vercel.app`).
- **Ping Check**: Visit `https://auth-provider.vercel.app/ping` to verify that the API is online and running.
- **Login Panel**: Visit `https://auth-provider.vercel.app/login` to login to your administration dashboard.
