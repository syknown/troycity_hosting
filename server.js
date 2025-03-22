const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");
// const apiRoutes = require("./routes/apiRoutes");
const pagesRoutes = require("./routes/index");
const app = express();
const path = require("path");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Views folder

// Serve static files
app.use(express.static("public"));
// Routes
app.use("/", pagesRoutes);
app.use("/api", apiRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
