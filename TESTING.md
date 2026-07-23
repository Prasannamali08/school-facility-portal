# Testing Guide

## 1. API Testing with Postman

1. Import `School_Facility_Portal.postman_collection.json` into Postman.
2. Set the `baseUrl` collection variable to:

```
https://school-facility-portal-ldoq.onrender.com/api
```

3. Run **Auth > Login** with a seeded account:

- **Admin:** `admin@school.edu` / `Admin@123`
- **Teacher:** `teacher@school.edu` / `Teacher@123`
- **Parent:** `parent@school.edu` / `Parent@123`

4. Copy the `token` field from the response into the collection's `token` variable.

5. Run the **Issues**, **Notifications**, **Users**, and **Analytics** collections.

---

## Suggested Manual Test Flow

1. Register a parent account and confirm a JWT is returned.
2. Login as the parent and report an issue with images.
3. Login as the admin and confirm the issue appears in the dashboard.
4. Assign the issue to a teacher.
5. Confirm the parent receives an **Assigned** notification.
6. Change the issue status to **Resolved**.
7. Confirm the parent receives a **Resolved** notification.
8. Add a comment as the parent.
9. Confirm the comment appears in Issue Details.
10. Try accessing Admin APIs as a non-admin and confirm a **403 Forbidden** response.

---

# Backend Testing Checklist

## Authentication

- [ ] Register with an existing email returns **400**
- [ ] Password shorter than 6 characters returns **400**
- [ ] Wrong password returns **401**
- [ ] Access `/auth/profile` without token returns **401**
- [ ] Expired JWT returns **401**

## Issues

- [ ] Create issue without required fields returns **400**
- [ ] Upload invalid file type is rejected
- [ ] Upload more than 5 images is rejected
- [ ] Non-admin cannot access all issues
- [ ] Non-owner cannot edit another user's issue
- [ ] Status update creates Repair History
- [ ] Notifications are created

## Users

- [ ] Only admin can manage users
- [ ] Admin cannot delete own account

## Security

- [ ] Rate Limiter works
- [ ] MongoDB Injection is blocked

---

# Frontend Testing Checklist

- [ ] Registration works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Report Issue works
- [ ] Image upload works
- [ ] Issue Details page works
- [ ] Admin Dashboard works
- [ ] Notifications work
- [ ] Profile updates successfully
- [ ] Responsive design works

---

# Sample Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | Admin@123 |
| Teacher | teacher@school.edu | Teacher@123 |
| Parent | parent@school.edu | Parent@123 |

---

# Local Development Testing

Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend URL

```
http://localhost:5000/api
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# Production Testing

Application

```
https://school-facility-portal-ldoq.onrender.com
```

API

```
https://school-facility-portal-ldoq.onrender.com/api
```