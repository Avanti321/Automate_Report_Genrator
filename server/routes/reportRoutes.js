const router = require("express").Router();
const multer = require("multer");
const Report = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// FILE UPLOAD

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

//PDF HELPER 

function generatePDF(report) {
  return new Promise((resolve, reject) => {
    const filePath = path.join("uploads", `report-${report._id}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("Department Activity Report", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Report details
    doc.fontSize(12);
    doc.text(`Title: ${report.title || "N/A"}`);
    doc.text(`Date: ${report.date || "N/A"}`);
    doc.text(`Duration: ${report.duration || "N/A"}`);
    doc.text(`Organized By: ${report.organizedBy || "N/A"}`);
    doc.text(`Speaker: ${report.speakerName || "N/A"}`);
    doc.text(`Speaker Designation: ${report.speakerDesignation || "N/A"}`);

    if (report.classType && report.classType.length > 0) {
      doc.text(`Class Type: ${report.classType.join(", ")}`);
    }

    doc.moveDown();

    // Session roles
    if (report.sessionRoles) {
      doc.fontSize(14).text("Session Roles:");
      doc.fontSize(12);
      if (report.sessionRoles.hod) doc.text(`  HOD: ${report.sessionRoles.hod}`);
      if (report.sessionRoles.coordinator) doc.text(`  Coordinator: ${report.sessionRoles.coordinator}`);
      if (report.sessionRoles.anchor) doc.text(`  Anchor: ${report.sessionRoles.anchor}`);
      if (report.sessionRoles.voteOfThanks) doc.text(`  Vote of Thanks: ${report.sessionRoles.voteOfThanks}`);
      doc.moveDown();
    }

    // Agenda
    if (report.agenda) {
      doc.fontSize(14).text("Agenda:");
      doc.fontSize(12).text(report.agenda);
      doc.moveDown();
    }

    // Summary
    if (report.summary) {
      doc.fontSize(14).text("Summary:");
      doc.fontSize(12).text(report.summary);
    }

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

// CREATE REPORT 

router.post("/create",
  upload.fields([
    { name: "notice", maxCount: 1 },
    { name: "photos", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      // Parse sessionRoles if sent as JSON string
      let sessionRoles = req.body.sessionRoles;
      if (typeof sessionRoles === "string") {
        sessionRoles = JSON.parse(sessionRoles);
      }

      // Parse classType if sent as JSON string
      let classType = req.body.classType;
      if (typeof classType === "string") {
        classType = JSON.parse(classType);
      }

      const report = new Report({
        ...req.body,
        sessionRoles,
        classType,
        noticeFile: req.files?.notice?.[0]?.filename,
        photos: req.files?.photos?.map(f => f.filename)
      });

      await report.save();
      res.json(report);
    } catch (err) {
      console.error("Create report error:", err);
      res.status(500).json({ error: "Failed to create report" });
    }
  }
);

// GET REPORTS
router.get("/", async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

// PDF DOWNLOAD 

router.get("/pdf/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const filePath = await generatePDF(report);
    res.download(filePath);
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// EMAIL REPORT

router.post("/email/:id", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Recipient email is required" });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Generate PDF first
    const filePath = await generatePDF(report);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Activity Report System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Activity Report: ${report.title}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #4F46E5;">Department Activity Report</h2>
          <p><strong>Title:</strong> ${report.title}</p>
          <p><strong>Date:</strong> ${report.date}</p>
          <p><strong>Duration:</strong> ${report.duration}</p>
          <p>The full report PDF is attached below.</p>
        </div>
      `,
      attachments: [{
        filename: `${report.title}-report.pdf`,
        path: filePath
      }]
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

//DELETE REPORT

router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
