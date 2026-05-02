const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

// Connect to MySQL (non-blocking)
const { connectDB } = require("./config/db");
connectDB().catch(err => console.error("DB error:", err.message));

const app = express();

// Fix CORS - allow frontend to talk to backend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  process.env.FRONTEND_URL || ""
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
const suggestionsRouter = require("./routes/suggestions");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

app.use("/api/suggestions", suggestionsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Resume shortlister backend is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});