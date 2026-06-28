const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Get MongoDB connection URI from environment or default to local
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/csrms_db";

// Export async function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.log(
      "Server starting without database connection. API routes will fail until DB is connected.",
    );
  }
};

// Export database connection function
module.exports = connectDB;
