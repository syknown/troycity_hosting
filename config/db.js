const { Sequelize } = require("sequelize");
const config = require("./config.json");

// Create a Sequelize instance and set up the connection
const sequelize = new Sequelize(
  config.production.database,
  config.production.username,
  config.production.password,
  {
    host: config.production.host,
    dialect: config.production.dialect,
    logging: false,
  }
);
// Sync models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Connected to Sequelize database");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

module.exports = sequelize; // Export the Sequelize instance
