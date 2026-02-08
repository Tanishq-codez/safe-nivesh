const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const fundRoutes = require("./routes/funds");
const portfolioRoutes = require("./routes/portfolio");
const aiRoutes = require("./routes/ai");

dotenv.config();

// Check for required environment variables
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET === "your_jwt_secret_key_here"
) {
  console.error("ERROR: JWT_SECRET is not properly configured in .env file");
  console.error("Please set a secure JWT_SECRET in your .env file");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/fundlens", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "FundLens API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
