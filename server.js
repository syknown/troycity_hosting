const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");
const pagesRoutes = require("./routes/index");
const path = require("path");
const winston = require("winston");
const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();
const app = express();
// Configure Winston Logger
const logger = winston.createLogger({
  level: "info", // Levels: error, warn, info, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log" }), // Log to a file
    new winston.transports.Console(), // Log to console
  ],
});
// Middleware
const { sequelize } = require("./models");
// sequelize.sync().then(() => console.log("✅ DB Synced"));
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ DB Synced with Alter"));
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ DB Connected");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error: ", err);
  });

app.use(cors());
app.use(express.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));

// Routes
app.use("/", pagesRoutes);
app.use("/api", apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
