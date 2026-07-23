# Deployment Guide

This guide walks through deploying the School Facility Portal to production using Render, MongoDB Atlas, and Cloudinary.

## 1. MongoDB Atlas (Database)

1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a new free (M0) cluster.
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect > Drivers** and copy the MongoDB connection string.
6. Append your database name before the `?`, for example:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/school_facility_portal?retryWrites=true&w=majority
```

---

## 2. Cloudinary (Image Storage)

1. Create a free account at https://cloudinary.com
2. Copy your:
   - Cloud Name
   - API Key
   - API Secret

---

## 3. Deploy Full Stack Application on Render

1. Push the complete project to GitHub.

2. Go to https://render.com

3. Create a **New Web Service**.

4. Connect your GitHub repository.

5. Leave the **Root Directory** empty (project root).

6. Configure the service:

**Environment**

```
Node
```

**Build Command**

```bash
npm run build
```

**Start Command**

```bash
npm start
```

7. Add the following Environment Variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

CLIENT_URL=https://school-facility-portal-ldoq.onrender.com
```

8. Click **Deploy**.

Render will provide a URL similar to:

```
https://school-facility-portal-ldoq.onrender.com
```

9. Verify the API by visiting:

```
https://school-facility-portal-ldoq.onrender.com/api/health
```

You should receive a success JSON response.

---

## 4. Seed Database (Optional)

After deployment, run:

```bash
npm run seed
```

or from your local machine:

```bash
cd backend
npm run seed
```

This creates:

- Admin Account
- Teacher Account
- Parent Account
- Sample Issues
- Notifications

---

## 5. Post Deployment Checklist

- [ ] Home page loads successfully.
- [ ] User registration works.
- [ ] Login works.
- [ ] Issue reporting works.
- [ ] Image upload works using Cloudinary.
- [ ] Admin Dashboard loads correctly.
- [ ] Staff assignment works.
- [ ] Notifications work.
- [ ] Analytics page loads.
- [ ] MongoDB Atlas is connected.
- [ ] Render logs show no errors.

---

## 6. Local Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at:

```
https://school-facility-portal-ldoq.onrender.com/api
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
```

---

## Production URL

```
https://school-facility-portal-ldoq.onrender.com
```

Backend API

```
https://school-facility-portal-ldoq.onrender.com/api
```