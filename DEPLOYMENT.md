# Deployment Guide

This guide walks through deploying the School Facility Portal to production using free-tier services.

## 1. MongoDB Atlas (Database)

1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new free (M0) cluster.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — or Render's specific IPs for tighter security.
5. Click **Connect > Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Append your database name before the `?`, e.g. `.../school_facility_portal?retryWrites=true`

## 2. Cloudinary (Image Storage)

1. Create a free account at https://cloudinary.com
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.

## 3. Backend Deployment (Render)

1. Push the `backend/` folder to a GitHub repository.
2. Go to https://render.com and create a **New Web Service**.
3. Connect your GitHub repo, set the root directory to `backend`.
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add the following Environment Variables (from `.env.example`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` (your deployed frontend URL, e.g. `https://your-app.vercel.app`)
   - `NODE_ENV=production`
6. Deploy. Render will give you a URL like `https://school-facility-portal-api.onrender.com`.
7. Verify by visiting `https://<your-render-url>/api/health` — you should see a success JSON response.

### Seeding production data (optional)
From your local machine, temporarily point `MONGO_URI` in your local `.env` to the Atlas connection string, then run:
```
cd backend
npm run seed
```

## 4. Frontend Deployment (Vercel)

1. Push the `frontend/` folder to the same or a separate GitHub repository.
2. Go to https://vercel.com and import the project, setting root directory to `frontend`.
3. Framework preset: **Vite**.
4. Add the environment variable:
   - `VITE_API_URL=https://<your-render-backend-url>/api`
5. Deploy. Vercel will give you a URL like `https://school-facility-portal.vercel.app`.
6. Go back to Render and update `CLIENT_URL` to this Vercel URL, then redeploy the backend so CORS allows requests from it.

## 5. Post-Deployment Checklist

- [ ] Visit the frontend URL and confirm the Home page loads.
- [ ] Register a test account and confirm login works.
- [ ] Report a test issue with an image and confirm it appears in Cloudinary.
- [ ] Log in as the seeded admin account and confirm the Admin Dashboard loads analytics.
- [ ] Confirm notifications appear when an issue is assigned/resolved.
- [ ] Check the Render logs and Atlas metrics for errors.

## 6. Local Development

**Backend:**
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run seed            # optional: creates sample accounts + 20 issues
npm run dev              # starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # starts on http://localhost:5173
```
