const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const filePath = path.join(__dirname, "../data/hostingPlans.json");
const axios = require("axios");

require("dotenv").config();

const GODADDY_API_KEY = process.env.GODADDY_API_KEY;
const GODADDY_SECRET = process.env.GODADDY_SECRET;
const BASE_URL = "https://api.godaddy.com/v1";

// Route to fetch hosting plans
router.get("/hosting", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load hosting plans" });
    }
    res.json(JSON.parse(data));
  });
});

router.get("/check-domain/:domain", async (req, res) => {
  const domain = req.params.domain;
  // console.log(req);
  console.log(GODADDY_API_KEY);
  console.log(GODADDY_SECRET);
  try {
    console.log(`Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_SECRET}`);

    const response = await axios.get(
      `${BASE_URL}/domains/available?domain=${domain}`,
      {
        headers: {
          Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_SECRET}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
