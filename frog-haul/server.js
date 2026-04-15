const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, styles.css, app.js)
app.use(express.static(path.join(__dirname)));

// ---------- Email endpoint ----------
app.post("/api/submit", async (req, res) => {
  // Debug: log the incoming payload
  console.log("[/api/submit] Received body:", JSON.stringify(req.body, null, 2));

  const {
    fullName,
    phone,
    email,
    dorm,
    houseName,
    roomNumber,
    requestedDate,
    items,
    specialTasks,
    specialInstructions,
  } = req.body;

  // Validate required fields
  const errors = [];
  if (!fullName || !fullName.trim()) errors.push("fullName is required.");
  if (!phone || !phone.trim()) errors.push("phone is required.");
  if (!dorm || !dorm.trim()) errors.push("dorm is required.");
  if (!requestedDate || !requestedDate.trim()) errors.push("requestedDate is required.");

  if (errors.length > 0) {
    console.log("[/api/submit] Validation failed:", errors);
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  // Build email body
  const lines = [
    `Full Name: ${fullName}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Dorm / Building: ${dorm}`,
  ];

  if (dorm === "Greek Life Housing" && houseName) {
    lines.push(`House Name: ${houseName}`);
  }

  lines.push(
    `Room Number: ${roomNumber || "Not provided"}`,
    `Requested Date: ${requestedDate}`,
    `Items to Move: ${items || "None selected"}`,
    `Special Tasks: ${specialTasks || "None"}`,
    `Special Instructions: ${specialInstructions || "None"}`
  );

  const emailBody = lines.join("\n");

  // HTML version for nicer formatting
  const htmlBody = `
    <h2 style="color:#4D1979;margin-bottom:16px;">New Frog Haul Quote Request</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px;font-family:Arial,sans-serif;">
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:40%;">Full Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${fullName}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${phone}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${email || "Not provided"}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Dorm / Building</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${dorm}</td></tr>
      ${dorm === "Greek Life Housing" && houseName ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">House Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${houseName}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Room Number</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${roomNumber || "Not provided"}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Requested Date</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${requestedDate}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Items to Move</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${items || "None selected"}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">Special Tasks</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${specialTasks || "None"}</td></tr>
      <tr><td style="padding:8px 12px;color:#666;">Special Instructions</td><td style="padding:8px 12px;">${specialInstructions || "None"}</td></tr>
    </table>
  `;

  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Frog Haul" <${process.env.EMAIL_USER}>`,
      to: process.env.QUOTE_TO || "frogshaul@gmail.com",
      replyTo: email || undefined,
      subject: "New Frog Haul Quote Request",
      text: emailBody,
      html: htmlBody,
    });

    console.log("[/api/submit] Email sent successfully.");
    return res.json({ success: true, message: "Request submitted successfully." });
  } catch (err) {
    console.error("[/api/submit] Email send error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong sending your request. Please text us instead.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Frog Haul server running at http://localhost:${PORT}`);
  console.log(`[env] EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER : "NOT SET"}`);
  console.log(`[env] EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET (" + process.env.EMAIL_PASS.length + " chars)" : "NOT SET"}`);
  console.log(`[env] QUOTE_TO:   ${process.env.QUOTE_TO || "NOT SET (will default to frogshaul@gmail.com)"}`);
});
