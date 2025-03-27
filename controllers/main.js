const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();
const { chromium } = require("playwright");

transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // tls: {
  //   rejectUnauthorized: false, // Bypass certificate validation (not recommended for production)
  // },
});

async function generateInvoice(invoiceData) {
  try {
    // Load EJS template
    // console.log("Generating invoice for:", invoiceData);
    // console.log("Generating invoice for:", invoiceData.name);
    console.log("Invoice Message", invoiceData.message);

    const templatePath = path.join(__dirname, "../views", "invoice.ejs");

    if (!fs.existsSync(templatePath)) {
      console.error("EJS template not found at:", templatePath);
      return;
    }
    const htmlContent = await ejs
      .renderFile(templatePath, invoiceData)
      .catch((err) => {
        console.error("Error rendering EJS template:", err);
      });

    // console.log("HTML content:", htmlContent);

    // Launch Puppeteer and generate PDF
    // console.log("Generating invoice PDF...");
    // try {
    //   console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    // console.log("Puppeteer launched successfully!");
    // } catch (error) {
    //   console.error("Error launching Puppeteer:", error);
    // }

    // console.log("Browser launched successfully!");
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    console.log("Page content set successfully!");
    console.log("Invoice data:", invoiceData);

    // Define PDF path
    const pdfPath = path.join(
      __dirname,
      `../data/invoices/invoice_${invoiceData.invoiceId}.pdf`
    );
    // console.log("Invoice PDF path:", pdfPath);

    await page.pdf({ path: pdfPath, format: "A4" });
    await browser.close();

    // Send the invoice via email
    await sendInvoiceEmail(invoiceData.customerEmail, pdfPath);

    console.log("Invoice generated and sent successfully!");

    // Delete PDF after sending email
    // setTimeout(() => fs.unlinkSync(pdfPath), 5000);
  } catch (error) {
    console.error("Error generating invoice:", error);
  }
}

async function sendInvoiceEmail(email, pdfPath) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Invoice",
    text: "Please find attached your invoice.",
    attachments: [{ filename: "invoice.pdf", path: pdfPath }],
  };

  const sending = await transporter.sendMail(mailOptions);
  console.log("Email sent successfully:", sending);

  console.log("Invoice email sent to:", email);
}

module.exports = { generateInvoice };
