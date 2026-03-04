const router = require("express").Router();
const multer = require("multer");
const Report = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

//FILE UPLOAD 

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

//PDF GENERATOR

function generatePDF(report) {
  return new Promise((resolve, reject) => {
    const filePath = path.join("uploads", `report-${report._id}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // HEADER
    doc.fontSize(16).text("Progressive Education Society's", { align: "center" });
    doc.fontSize(14).text(
      "Modern College of Arts, Science and Commerce (Autonomous)",
      { align: "center" }
    );
    doc.fontSize(12).text("Ganeshkhind, Pune - 411016", { align: "center" });
    doc.moveDown(1);

    //  TITLE 
    doc.fontSize(18).font("Helvetica-Bold").text(report.title || "ACTIVITY REPORT", {
      align: "center",
    });

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Date: ${report.date || "N/A"}`);
    doc.text(`Duration: ${report.duration || "N/A"}`);
    doc.text(`Organized By: ${report.organizedBy || "N/A"}`);

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // SPEAKER 
    doc.fontSize(14).font("Helvetica-Bold").text("Speaker Details:");
    doc.fontSize(12).font("Helvetica");
    doc.text(`Name: ${report.speakerName || "N/A"}`);
    doc.text(`Designation: ${report.speakerDesignation || "N/A"}`);
    doc.moveDown(1);

    // SESSION
    doc.fontSize(14).font("Helvetica-Bold").text("Session Conducted By:");
    doc.fontSize(12).font("Helvetica");

    if (report.sessionRoles) {
      doc.text(`HOD: ${report.sessionRoles.hod || "N/A"}`);
      doc.text(`Coordinator: ${report.sessionRoles.coordinator || "N/A"}`);
      doc.text(`Anchor: ${report.sessionRoles.anchor || "N/A"}`);
      doc.text(`Vote of Thanks: ${report.sessionRoles.voteOfThanks || "N/A"}`);
    }
    doc.moveDown(1);

    // AGENDA
    doc.fontSize(14).font("Helvetica-Bold").text("Agenda:");
    doc.fontSize(12).font("Helvetica").text(report.agenda || "N/A");
    doc.moveDown(1);

    // SUMMARY
    doc.fontSize(14).font("Helvetica-Bold").text("Summary:");
    doc.fontSize(12).font("Helvetica").text(report.summary || "N/A", {
      align: "justify",
    });
    doc.moveDown(1);

    // NOTICE PHOTOS
    if (report.noticeFile && report.noticeFile.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Report / Notice Photos:");
      doc.moveDown(2);

      report.noticeFile.forEach((img) => {
        const imgPath = path.join("uploads", img);
        if (fs.existsSync(imgPath)) {
          doc.image(imgPath, {
            fit: [450, 300],
            align: "center",
          });
          doc.moveDown(2);
        }
      });
    }

    // EVENT PHOTOS
    if (report.photos && report.photos.length > 0) {
      doc.moveDown(2);
      doc.fontSize(14).font("Helvetica-Bold").text("Event Photos:");
      doc.moveDown(2);

      report.photos.forEach((img) => {
        const imgPath = path.join("uploads", img);
        if (fs.existsSync(imgPath)) {
          doc.image(imgPath, {
            fit: [450, 300],
            align: "center",
          });
          doc.moveDown(2);
        }
      });
    }

    // SIGNATURES
    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("_________________________", 50);
    doc.text("HOD Signature", 75);

    doc.text("_________________________", 350, doc.y - 25);
    doc.text("Principal Signature", 375);

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

//CREATE REPORT

router.post("/", upload.fields([
  { name: 'noticeFile', maxCount: 5 }, 
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    const reportData = JSON.parse(req.body.data);
    if (req.files['noticeFile']) {
      reportData.noticeFile = req.files['noticeFile'].map(file => file.filename);
    }
    if (req.files['photos']) {
      reportData.photos = req.files['photos'].map(file => file.filename);
    }

    const newReport = new Report(reportData);
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL REPORTS

router.get("/", async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

// DOWNLOAD PDF 

router.get("/pdf/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const filePath = await generatePDF(report);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

//  EMAIL REPORT 

router.post("/email/:id", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Email required" });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const filePath = await generatePDF(report);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Activity Report - ${report.title}`,
      text: "Please find attached report.",
      attachments: [
        {
          filename: `${report.title}-report.pdf`,
          path: filePath,
        },
      ],
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email failed" });
  }
});

// DELETE REPORT

router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
