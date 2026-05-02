const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "resume_shortlister",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "production" ? false : console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully!");
    
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced successfully!");
    
    return sequelize;
  } catch (error) {
    console.error("❌ MySQL connection error:", error.message);
    console.log("⚠️  Running without database - using in-memory storage");
    return null;
  }
};

module.exports = { sequelize, connectDB };
