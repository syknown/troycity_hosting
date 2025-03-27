const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const filePath = path.join(__dirname, "../data/hostingPlans.json");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { generateInvoice } = require("../controllers/main");
const { newMpesa } = require("../controllers/payment");

require("dotenv").config();

const GODADDY_API_KEY = process.env.GODADDY_API_KEY;
const GODADDY_SECRET = process.env.GODADDY_SECRET;
const BASE_URL = "https://api.godaddy.com/v1";

const DATA_FILE = path.join(__dirname, "../data/purchases.json");
const invoicesFile = path.join(__dirname, "../data/payments.json");

// Function to read existing data
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return data ? JSON.parse(data) : [];
};
const readInvoiceData = () => {
  if (!fs.existsSync(invoicesFile)) return [];
  const data = fs.readFileSync(invoicesFile, "utf8");
  return data ? JSON.parse(data) : [];
};

// Function to save data
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

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
router.post("/newhosting", (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    address,
    city,
    country,
    selected_package,
    domainName,
    primaryNameserver,
    secondaryNameserver,
    tertiaryNameserver,
    package_cost,
  } = req.body;
  // console.log(req.body);

  // Generate unique invoice ID
  const invoiceId = "INV-" + uuidv4().slice(0, 8).toUpperCase();
  const newOrder = {
    invoiceId,
    name,
    email,
    phone,
    company: company || "N/A",
    address,
    city,
    country,
    selected_package,
    package_cost,
    domainName,
    primaryNameserver: primaryNameserver || "N/A",
    secondaryNameserver: secondaryNameserver || "N/A",
    tertiaryNameserver: tertiaryNameserver || "N/A",
    date: new Date().toISOString(),
  };

  // Read existing data and append the new order
  const orders = readData();
  orders.push(newOrder);
  saveData(orders);

  const invoiceData = {
    invoiceId: newOrder.invoiceId,
    invoiceDate: newOrder.date,
    dueDate: newOrder.date,
    status: "UNPAID",
    name: newOrder.name,
    customerEmail: newOrder.email,
    customerLocation: newOrder.address,
    items: [
      { description: newOrder.selected_package, amount: newOrder.package_cost },
      { description: `Domain free ${newOrder.domainName}`, amount: 0 },
    ],
    total: newOrder.package_cost,
    balance: newOrder.package_cost,
    transactions: [],
  };

  // send invoice via mail
  generateInvoice(invoiceData);

  // Send response to frontend
  res.json({ success: true, message: "Order placed successfully!", invoiceId });
});

router.post("/payment", async (req, res) => {
  try {
    const { invoiceId, amount, phone } = req.body;
    const orders = readData();
    const order = orders.find((o) => o.invoiceId === invoiceId);

    // console.log("Received payment for invoice:", invoiceId, amount);
    // console.log("Order details:", order);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // call the mpesa function
    // console.log("Order phone:", phone);
    const mpesa = await newMpesa(
      amount,
      invoiceId,
      phone,
      order.selected_package
    );

    if (mpesa.success) {
      return res.json({
        success: true,
        message: "Payment Initiated Successfully!",
        transactionId: mpesa.transactionId,
        MerchantRequestID: mpesa.MerchantRequestID,
        CheckoutRequestID: mpesa.CheckoutRequestID,
      });
    } else {
      return res.json({ success: false, message: "Payment Failed!" });
    }
  } catch (error) {
    console.log(error);
  }
});

// Route to check payment status
router.get("/check-payment/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const payments = readInvoiceData();

  // Find the payment by invoice ID
  const payment = payments.find((p) => p.invoice_id === invoiceId);

  if (!payment) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  // Check if payment is successful
  if (payment.status === "completed") {
    return res.json({
      success: true,
      status: "completed",
      message: "Payment successful",
      data: payment,
    });
  }

  // If payment is still pending
  return res.json({
    success: false,
    status: "pending",
    message: "Payment still pending",
    data: payment,
  });
});
router.get("/update-invoice/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const orders = readData();
  const order = orders.find((o) => o.invoiceId === invoiceId);

  if (!order) {
    return res.status(404).json({ error: "order not found" });
  }

  const invoiceData = {
    invoiceId: order.invoiceId,
    invoiceDate: order.date,
    dueDate: order.date,
    status: "PAID",
    name: order.name,
    customerEmail: order.email,
    customerLocation: order.address,
    items: [
      { description: order.selected_package, amount: order.package_cost },
      { description: `Domain free ${order.domainName}`, amount: 0 },
    ],
    total: order.package_cost,
    balance: 0,
    transactions: [],
    message: "Payment successful",
  };
  // send invoice via mail
  generateInvoice(invoiceData);

  // Check if payment is successful
  if (payment.status === "completed") {
    return res.json({
      success: true,
      status: "completed",
      message: "Payment successful",
      data: payment,
    });
  }

  // If payment is still pending
  return res.json({
    success: false,
    status: "pending",
    message: "Payment still pending",
    data: payment,
  });
});

router.post("/callback", (req, res) => {
  console.log("Callback received:", req.body);
  res.json({ success: true });
});

router.get("/download-invoice/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const pdfPath = path.join(
    __dirname,
    `../data/invoices/invoice_${invoiceId}.pdf`
  );

  console.log("Checking for invoice:", pdfPath);

  // Check if file exists before sending
  if (!fs.existsSync(pdfPath)) {
    console.error("Invoice not found:", pdfPath);
    return res
      .status(404)
      .json({ success: false, message: "Invoice not found!" });
  }

  // Send the invoice for download
  res.download(pdfPath, `invoice_${invoiceId}.pdf`);
});

router.get("/payment/:invoiceId", (req, res) => {
  const invoiceId = req.params.invoiceId;

  fs.readFile(invoicesFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Failed to load invoices");
    }

    const invoices = JSON.parse(data);
    const invoice = invoices.find((inv) => inv.id == invoiceId);

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    res.render("payment", { invoice });
  });
});

module.exports = router;
