# DropShop Cloud Deployment Guide

This guide walks you through deploying the DropShop e-commerce site to production cloud platforms. We will be using **MongoDB Atlas** for the database, **Render** (or **Railway**) for the Node/Express backend API, and **Vercel** (or **Netlify**) for the React/Vite frontend.

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and build a **Free Shared Cluster** (M0 Sandbox).
3. Under **Database Access**, create a user with a secure password and note it down. Select **Read and write to any database** permissions.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Render/Railway can connect.
5. In the **Database** tab, click **Connect** -> **Connect your application** -> **Drivers**.
6. Copy the connection string (URI). It will look like:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with the credentials of the user you created in step 3, and add a database name (e.g. `products` or `dropshop`) before the `?` character:
   `mongodb+srv://dbUser:SecurePass123@cluster0.xxxx.mongodb.net/dropshop?retryWrites=true&w=majority`

---

## Step 2: Deploy the Backend API (Render / Railway)

We recommend using **Render** or **Railway** as they easily host persistent Express.js processes.

### Deploying to Render:
1. Push your repository to your GitHub account.
2. Sign in to [Render](https://render.com) and click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Root Directory**: `backend` (important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Scroll down to **Environment Variables** and add the following keys:
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI from Step 1*
   - `PORT`: `3000`
   - `FRONTEND_URL`: *The URL of your deployed frontend (e.g. `https://dropshop.vercel.app` - you can update this later)*
   - `RAZORPAY_KEY_ID`: *Your Razorpay Test Key ID*
   - `RAZORPAY_KEY_SECRET`: *Your Razorpay Test Key Secret*
   - `GOOGLE_CLIENT_ID`: *Your Google Client ID*
   - `GOOGLE_CLIENT_SECRET`: *Your Google Client Secret*
   - `EMAIL_USER`: `rahulkumar99rah@gmail.com`
   - `EMAIL_PASS`: `bubicsidgxahhfkq`
   - `SEED_ADMIN_PHONE`: `6299400242`
   - `SEED_ADMIN_PASSWORD`: `admin123`
   - `SEED_ADMIN_EMAIL`: `demo.admin@dropshop.com`
   - `SEED_ADMIN_NAME`: `Demo Admin`
6. Click **Deploy Web Service**. Once the build finishes, copy the Render service URL (e.g., `https://dropshop-backend.onrender.com`).

---

## Step 3: Deploy the Frontend (Vercel / Netlify)

We recommend using **Vercel** or **Netlify** for hosting Vite single page apps.

### Deploying to Vercel:
1. Sign in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the following project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - Key: `VITE_API_URL`
   - Value: *Your Render Backend URL followed by `/api`* (e.g. `https://dropshop-backend.onrender.com/api`)
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g. `https://dropshop.vercel.app`).

### Step 4: Link Deployed Frontend in Backend Env
1. Return to your backend dashboard on **Render**.
2. Under **Environment**, update the `FRONTEND_URL` variable to point to your live Vercel URL (e.g. `https://dropshop.vercel.app`).
3. Save changes. Render will automatically redeploy the backend with the correct CORS rules configured.

---

## Verifying the Deployment

1. Open your deployed Vercel frontend URL.
2. Register a new user account or log in with the seeded admin credentials.
3. Check if product categories load properly (proving database connectivity).
4. Perform an "Add to Cart" and checkout to confirm Razorpay and email flows work correctly.
