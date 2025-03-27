// models/Customer.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  lastLogin: {
    type: DataTypes.DATE,
  },
  signupDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lastDeviceInfo: {
    type: DataTypes.STRING,
  },
  confirmationCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Hash the password before saving it to the database
Customer.beforeCreate(async (user) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  if (user.password) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  }
});

// Compare a plain text password with the hashed password in the database
Customer.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = Customer;
