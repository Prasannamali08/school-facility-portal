# Testing Guide

## 1. API Testing with Postman

1. Import `School_Facility_Portal.postman_collection.json` into Postman.
2. Set the `baseUrl` collection variable to `http://localhost:5000/api` (or your deployed Render URL).
3. Run **Auth > Login** with a seeded account (e.g. `admin@school.edu` / `Admin@123`).
4. Copy the `token` field from the response into the collection's `token` variable.
5. Run through the **Issues**, **Notifications**, **Users**, and **Analytics** folders in order — most require the `token` variable to be set, and some (`issueId`, `userId`) need IDs copied from earlier responses.

### Suggested manual test flow
1. Register a parent account → confirm a JWT is returned.
2. Login as that parent → report an issue with 2 images.
3. Login as admin → confirm the issue appears in `GET /issues` and a notification was created for the admin.
4. Assign the issue to a teacher → confirm the parent receives an "assigned" notification.
5. Update the issue status to `Resolved` → confirm the parent receives a "resolved" notification and `resolvedAt` is set.
6. Add a comment as the parent → confirm it appears when fetching the issue.
7. Try accessing `GET /issues` (all issues) as a non-admin → confirm you get a 403.
8. Try updating another user's issue → confirm you get a 403.

## 2. Backend Testing Checklist

- **Auth**
  - [ ] Registering with an existing email returns 400
  - [ ] Registering with a short password (<6 chars) returns 400
  - [ ] Logging in with wrong password returns 401
  - [ ] Accessing `/auth/profile` without a token returns 401
  - [ ] Accessing `/auth/profile` with an expired/invalid token returns 401
- **Issues**
  - [ ] Creating an issue without required fields returns 400
  - [ ] Uploading a non-image file is rejected
  - [ ] Uploading more than 5 images is rejected
  - [ ] Non-admins cannot access `GET /issues` (all issues)
  - [ ] Non-owners cannot edit/delete another user's issue
  - [ ] Status update creates a `RepairHistory` entry and a notification
- **Users**
  - [ ] Only admins can list/update/delete users
  - [ ] Admin cannot delete their own account
- **Security**
  - [ ] Rate limiter kicks in after repeated failed logins
  - [ ] MongoDB injection payloads (e.g. `{"$gt": ""}`) in login body are sanitized

You can automate these with a tool like Jest + Supertest by pointing at a local MongoDB instance (or `mongodb-memory-server`) — this scaffold ships without a test suite so you can choose the framework that fits your evaluation criteria.

## 3. Frontend Testing Checklist

- [ ] Registering shows validation errors for empty/invalid fields
- [ ] Login redirects admins to `/admin` and other roles to `/dashboard`
- [ ] Reporting an issue with an unsupported file type shows a toast error
- [ ] Track Issues page filters correctly by category/status/priority and search text
- [ ] Issue Details page shows the timeline in reverse chronological order
- [ ] Non-admins cannot navigate to `/admin` or `/admin/users` (redirected to `/dashboard`)
- [ ] Notifications page correctly marks items as read/deletes them
- [ ] Profile page updates name/phone and avatar successfully
- [ ] Responsive layout: sidebar collapses into a drawer on mobile widths (<768px)

## 4. Sample Accounts (after running `npm run seed`)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@school.edu    | Admin@123   |
| Teacher | teacher@school.edu  | Teacher@123 |
| Parent  | parent@school.edu   | Parent@123  |
