const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { generateInvoice } = require("../controllers/main");
const { HostingPlans } = require("../models");
const { Op, where } = require("sequelize");
const { title } = require("process");

const DATA_FILE = path.join(__dirname, "../data/purchases.json");
const invoicesFile = path.join(__dirname, "../data/payments.json");

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

// Route for the homepage
router.get("/", async (req, res) => {
  try {
    const hostingPlans = await HostingPlans.findAll();
    console.log("Fetched hosting plans:", hostingPlans);
    res.render("index", {
      hostingPlans: hostingPlans,
      title: "Hosting Plans",
      message: "Manage your hosting plans here",
    });
  } catch (error) {
    console.error("Error fetching hosting plans:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
router.get("/admin", (req, res) => {
  res.render("admin");
});
router.get("/admin/purchases", (req, res) => {
  const purchases = readData();
  res.render("newplans", { purchases });
});
router.get("/admin/purchases/:invoiceId", (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.query.invoiceId;
    const orders = readData();
    const order = orders.find((o) => o.invoiceId === invoiceId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Render success page
    res.render("purchasedetails", { order });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/payments", (req, res) => {
  const payments = readInvoiceData();
  console.log(payments);
  res.render("payments", { payments });
});
router.get("/admin/payments/:invoiceId", (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.query.invoiceId;
    const orders = readInvoiceData();
    const order = orders.find((o) => o.invoiceId === invoiceId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Render success page
    res.render("payments", { order });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/payment-sucess/:invoiceId", (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.query.invoiceId;
    const orders = readData();
    const order = orders.find((o) => o.invoiceId === invoiceId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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

    generateInvoice(invoiceData);

    if (order.status === "completed") {
      return res.json({
        success: true,
        status: "completed",
        message: "Payment successful",
        data: order,
      });
    }

    // Render success page
    res.render("payment-sucess");
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/payment-sucess/:invoiceId", (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.query.invoiceId;
    const orders = readData();
    const order = orders.find((o) => o.invoiceId === invoiceId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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

    // Generate and send invoice via email
    generateInvoice(invoiceData);

    // Assuming `payment` comes from a payment provider like Stripe or PayPal
    // const payment = { status: "completed" }; // You need to replace this with real payment data

    if (order.status === "completed") {
      return res.json({
        success: true,
        status: "completed",
        message: "Payment successful",
        data: order,
      });
    }

    // Render success page
    res.render("payment-sucess");
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/purchase/:id", async (req, res) => {
  try {
    const packageid = req.params.id || req.query.id;
    console.log("Received request for invoiceId:", packageid);
    if (!packageid) {
      console.log("Missing invoice ID");
      return res.status(400).json({ error: "Missing invoice ID" });
    }
    const selectedPackage = await HostingPlans.findOne({
      where: { id: req.params.id },
    });
    if (!selectedPackage) {
      return res.status(404).send("Package not found");
    }
    res.render("purchase", { package: selectedPackage });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/order-summary/:invoiceId", (req, res) => {
  try {
    const invoiceId = req.params.invoiceId || req.query.invoiceId;
    console.log("Received request for invoiceId:", invoiceId);

    if (!invoiceId) {
      console.log("Missing invoice ID");
      return res.status(400).json({ error: "Missing invoice ID" });
    }

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        return res.status(500).json({ error: "Error reading data file" });
      }

      console.log("Raw JSON data:", data);

      let purchases = [];
      try {
        purchases = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return res.status(500).json({ error: "Invalid JSON format" });
      }

      console.log("Parsed purchases:", purchases);

      if (!Array.isArray(purchases)) {
        console.error("Invalid purchases data format");
        return res.status(500).json({ error: "Invalid purchases data" });
      }

      const order = purchases.find((p) => p.invoiceId === invoiceId);
      console.log("Found order:", order);

      if (!order) {
        console.log("Order not found for invoiceId:", invoiceId);
        return res.status(404).json({ error: "Order not found" });
      }
      console.log("Rendering order summary:", order);

      res.render("ordersummary", { order });
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/hostingplans", async (req, res) => {
  try {
    const hostingPlans = await HostingPlans.findAll();
    console.log("Fetched hosting plans:", hostingPlans);
    res.render("hostingplans", {
      hostingPlans: hostingPlans,
      title: "Hosting Plans",
      message: "Manage your hosting plans here",
    });
  } catch (error) {
    console.error("Error fetching hosting plans:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/admin/hostingplan/:id", async (req, res) => {
  try {
    const hostingPlanId = req.params.id;
    const { name, description, price, currency, per } = req.body;
    const hostingPlan = await HostingPlans.findOne({
      where: { id: hostingPlanId },
    });

    if (!hostingPlan) {
      return res.status(404).send("Hosting plan not found");
    }
    // update plan
    await hostingPlan.update(
      {
        name,
        description,
        price,
        currency,
        per,
      },
      { where: { id: hostingPlanId } }
    );
    res.redirect("/admin/hostingplans");
  } catch (error) {
    console.error("Error fetching hosting plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/admin/hostingplan/delete/:id", async (req, res) => {
  try {
    const hostingPlanId = req.params.id;
    const hostingPlan = await HostingPlans.findOne({
      where: { id: hostingPlanId },
    });

    if (!hostingPlan) {
      return res.status(404).send("Hosting plan not found");
    }
    // delete plan
    await hostingPlan.destroy();
    res.redirect("/admin/hostingplans");
  } catch (error) {
    console.error("Error fetching hosting plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
