const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Connect Database
connectDB();

const app = express();

// ==========================
// Security Middleware
// ==========================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://placehold.co",
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          process.env.CLIENT_URL,
          "https://res.cloudinary.com",
        ],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// ==========================
// CORS
// ==========================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ==========================
// Body Parser
// ==========================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Prevent NoSQL Injection
app.use(mongoSanitize());

// ==========================
// Rate Limiter
// ==========================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ==========================
// Health Check
// ==========================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// API Routes
// ==========================

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// ==========================
// Serve React Frontend
// ==========================

// ==========================
// Serve React Frontend
// ==========================

const fs = require("fs");

const distPath = path.join(__dirname, "../frontend/dist");

console.log("Dist Path:", distPath);
console.log("Dist Exists:", fs.existsSync(distPath));
console.log(
  "Index Exists:",
  fs.existsSync(path.join(distPath, "index.html"))
);

app.use(express.static(distPath));

app.get("*", (req, res) => {
  const indexFile = path.join(distPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    return res.status(500).json({
      success: false,
      message: "index.html not found",
      path: indexFile,
    });
  }

  res.sendFile(indexFile);
});

// ==========================
// Error Handling
// ==========================

app.use(notFound);
app.use(errorHandler);

// ==========================
// Start Server
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

module.exports = app;