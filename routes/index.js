const express = require("express");
const router = express.Router();
// const Product = require("../schemas/product");

// Route for the homepage
router.get("/", (req, res) => {
  res.render("index");
});
router.get("/about", (req, res) => {
  res.render("about");
});
router.get("/comparison", (req, res) => {
  res.render("comparison");
});
router.get("/domain", (req, res) => {
  res.render("domain");
});
router.get("/contact", (req, res) => {
  res.render("contact");
});
router.get("/hosting", (req, res) => {
  res.render("hosting");
});
router.get("/team", (req, res) => {
  res.render("team");
});
router.get("/testimonial", (req, res) => {
  res.render("testimonial");
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
