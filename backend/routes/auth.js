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

module.exports = router;

