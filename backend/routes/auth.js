const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

// Fallback in-memory users for demo (if MongoDB not available)
const fallbackUsers = [
  {
    id: 1,
    email: "deshmukhsanika278@gmail.com",
    password: "Sanu029@",
    name: "Admin"
  },
  {
    id: 2,
    email: "admin@resume-shortlister.com",
    password: "admin123",
    name: "Demo Admin"
  },
  {
    id: 3,
    email: "manager@resume-shortlister.com",
    password: "Manager@2026!",
    name: "Team Manager"
  }
];

// Create JWT token
const createToken = (user) => {
  const token = jwt.sign(
    { id: user._id || user.id, email: user.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );
  return token;
};

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    let user = null;

    // Try to find user in MongoDB
    try {
      user = await AdminUser.findOne({ email, active: true });

      if (user && (await user.comparePassword(password))) {
        const token = createToken(user);
        return res.json({
          token,
          name: user.name,
          email: user.email,
          message: "Login successful",
        });
      }
    } catch (dbErr) {
      console.log("Database lookup failed, using fallback", dbErr.message);
    }

    // Fallback to in-memory users
    const fallbackUser = fallbackUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (fallbackUser) {
      const token = createToken(fallbackUser);
      return res.json({
        token,
        name: fallbackUser.name,
        email: fallbackUser.email,
        message: "Login successful (demo mode)",
      });
    }

    // Invalid credentials
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Register new admin endpoint
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Check if admin already exists
    try {
      const existingAdmin = await AdminUser.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return res.status(409).json({ 
          message: "Admin with this email already exists" 
        });
      }
    } catch (dbErr) {
      console.log("Database check failed, proceeding...", dbErr.message);
    }

    // Create new admin
    const newAdmin = new AdminUser({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
      active: true
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Failed to create admin account" });
  }
});

module.exports = router;

