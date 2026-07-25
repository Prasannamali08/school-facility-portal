# 🏫 School Facility Condition Reporting & Repair Tracking Portal

A full-stack MERN application that lets parents and teachers report school facility issues (broken furniture,
electrical faults, water supply problems, safety hazards, etc.) and lets administrators triage, assign, and
resolve them — with full audit history and notifications at every step.

Built as a production-style internship evaluation project.

---

## Features

- **Role-based authentication** (Parent, Teacher, Admin) with JWT + bcrypt
- **Issue reporting** with category, priority, location, description, and up to 5 image uploads (Cloudinary)
- **Issue tracking** with search, filters (category/status/priority), and pagination
- **Full repair history timeline** and threaded comments per issue
- **Admin dashboard** with charts (status/priority breakdown), average resolution time, and issue management table
- **User management** for admins (promote/demote roles, activate/deactivate, delete)
- **Notification system** triggered on issue creation, assignment, status change, and comments
- **Security hardening**: Helmet, rate limiting, Mongo sanitization, CORS, input validation
- **Responsive UI** built with React + Tailwind CSS, light/dark-friendly components

## Tech Stack

| Layer      | Technology                                             |
|------------|---------------------------------------------------------|
| Frontend   | React (Vite), React Router, Tailwind CSS, Axios, React Hook Form, Chart.js, React Toastify |
| Backend    | Node.js, Express.js (MVC architecture)                 |
| Database   | MongoDB + Mongoose                                      |
| Auth       | JWT, bcrypt                                             |
| Storage    | Cloudinary (image uploads via Multer)                   |
| Deployment | Render, MongoDB Atlas, Cloudinary |

## Folder Structure

```
school-facility-portal/
│
├── backend/
│   ├── config/                 # Database and Cloudinary configuration
│   ├── controllers/            # Business logic and route handlers
│   ├── middleware/             # Authentication, error handling, file upload
│   ├── models/                 # Mongoose models (User, Issue, Notification, RepairHistory)
│   ├── routes/                 # Express API routes
│   ├── seed/                   # Database seed scripts
│   ├── utils/                  # JWT token and helper functions
│   └── server.js               # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context (Authentication)
│   │   ├── layouts/            # Dashboard layout (Navbar + Sidebar)
│   │   ├── pages/              # Application pages
│   │   ├── services/           # Axios API service
│   │   ├── App.jsx             # Application routes
│   │   └── main.jsx            # React application entry point
│   └── index.html
│
├── DEPLOYMENT.md               # Deployment guide
├── TESTING.md                  # Testing documentation
├── School_Facility_Portal.postman_collection.json
│                                # API testing collection
├── package.json
├── package-lock.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (or local MongoDB instance)
- A Cloudinary account

### Backend
```bash
cd backend
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, Cloudinary keys, etc.
npm install
npm run seed               # optional: creates admin/teacher/parent accounts + 20 sample issues
npm run dev                 # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # runs on http://localhost:5173
```

## Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/school_facility_portal
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://school-facility-portal-ldoq.onrender.com
```

**frontend/.env**
```
VITE_API_URL=https://school-facility-portal-ldoq.onrender.com/api
```

## Sample Accounts (after `npm run seed`)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@school.edu    | Admin@123   |
| Teacher | teacher@school.edu  | Teacher@123 |
| Parent  | parent@school.edu   | Parent@123  |

## API Overview

| Method | Endpoint                        | Description                       | Access        |
|--------|----------------------------------|-----------------------------------|---------------|
| POST   | /api/auth/register                | Register a parent/teacher account | Public        |
| POST   | /api/auth/login                   | Login                             | Public        |
| GET    | /api/auth/profile                 | Get logged-in profile             | Private       |
| PUT    | /api/auth/profile                 | Update profile / avatar           | Private       |
| PUT    | /api/auth/change-password          | Change password                   | Private       |
| POST   | /api/auth/forgot-password           | Request password reset            | Public        |
| PUT    | /api/auth/reset-password/:token      | Reset password                    | Public        |
| POST   | /api/issues                       | Create an issue (with images)     | Private       |
| GET    | /api/issues                       | Get all issues (search/filter)    | Admin         |
| GET    | /api/issues/my                    | Get logged-in user's issues       | Private       |
| GET    | /api/issues/:id                   | Get single issue                  | Private       |
| PUT    | /api/issues/:id                   | Update issue                      | Owner/Admin   |
| DELETE | /api/issues/:id                   | Delete issue                      | Owner/Admin   |
| PUT    | /api/issues/:id/assign             | Assign to staff                   | Admin         |
| PUT    | /api/issues/:id/status              | Update status + repair note       | Admin         |
| POST   | /api/issues/:id/comments             | Add a comment                     | Private       |
| GET    | /api/notifications                  | List notifications                | Private       |
| PUT    | /api/notifications/read-all           | Mark all as read                  | Private       |
| PUT    | /api/notifications/:id/read            | Mark one as read                  | Private       |
| DELETE | /api/notifications/:id               | Delete a notification             | Private       |
| GET    | /api/users                        | List users                        | Admin         |
| GET    | /api/users/staff                    | List assignable staff             | Admin         |
| PUT    | /api/users/:id                     | Update role/active status         | Admin         |
| DELETE | /api/users/:id                     | Delete a user                     | Admin         |
| GET    | /api/analytics/summary               | Dashboard summary stats           | Private       |
| GET    | /api/analytics/charts                | Chart data (status/category/priority) | Private   |
| GET    | /api/analytics/recent-activity          | Recent activity feed              | Private       |

Full request/response examples are in `School_Facility_Portal.postman_collection.json`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions covering MongoDB Atlas, Cloudinary, and Render deployment.

## Testing

See [TESTING.md](./TESTING.md) for the backend/frontend testing checklist and Postman walkthrough.

## Screenshots

_Add screenshots of the Home page, Dashboard, Report Issue form, and Admin analytics here once deployed._

## Scope Notes & Future Enhancements

This scaffold prioritizes a correct, working core over exhaustive feature coverage. The following were intentionally
left as extension points rather than half-implemented:

- **Dark mode toggle** — Tailwind is configured with `darkMode: 'class'` and dark variants are already used
  throughout; wiring up a toggle button + persisted preference is a small addition.
- **PDF / Excel export** — recommended libraries: `pdfkit` or `puppeteer` (backend) and `exceljs` (backend), or
  `jspdf` / `sheetjs` (frontend) for client-side export of the issues table.
- **Real-time updates** — currently notifications poll every 30s; swapping in Socket.IO would give instant push updates.
- **Automated test suite** — see TESTING.md for a manual checklist; Jest + Supertest (backend) and
  React Testing Library (frontend) are natural next additions.
- **Email delivery** — password reset currently returns a token directly in the API response for demo purposes;
  wire up `nodemailer` (already listed as a dependency) with real SMTP credentials to email it instead.
  
-**Production URL section**
## Live Demo
Application:
https://school-facility-portal-ldoq.onrender.com
API:
https://school-facility-portal-ldoq.onrender.com/api