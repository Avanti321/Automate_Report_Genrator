require("dotenv").config();
const router      = require("express").Router();
const multer      = require("multer");
const Report      = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");
const nodemailer  = require("nodemailer");
const QRCode      = require("qrcode");
const sharp       = require("sharp");

// ─────────────────────────────────────────────
//  FILE UPLOAD
// ─────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only images allowed"));
  },
});

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

// Generate QR code buffer from a URL
async function makeQR(url) {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 160,
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}

// ─────────────────────────────────────────────
//  PDF GENERATOR
// ─────────────────────────────────────────────
async function generatePDF(report) {
  const outPath = path.join("uploads", `report-${report._id}.pdf`);

  return new Promise(async (resolve, reject) => {
    try {
      const M  = 40;
      const doc = new PDFDocument({
        size: "A4",
        margin: M,
        autoFirstPage: true,
        bufferPages: false,
      });

      const PW   = doc.page.width;   // 595
      const PH   = doc.page.height;  // 842
      const CW   = PW - M * 2;      // 515
      const SAFE = PH - M - 10;

      const stream = fs.createWriteStream(outPath);
      doc.pipe(stream);

      // ── Colour palette ──────────────────────────────────────────────
      const INDIGO  = "#3730a3";
      const GRAY    = "#6b7280";
      const BLACK   = "#1f2937";
      const BGBLUE  = "#eef2ff";
      const LINERULE = "#c7d2fe";

      // ── Utility: horizontal rule ─────────────────────────────────────
      function hr(color, weight) {
        doc
          .moveTo(M, doc.y)
          .lineTo(PW - M, doc.y)
          .lineWidth(weight || 0.5)
          .strokeColor(color || LINERULE)
          .stroke();
        doc.y += 6;
      }

      // ── Utility: section heading ─────────────────────────────────────
      function heading(text) {
        if (doc.y > SAFE - 50) { doc.addPage(); doc.y = M; }
        doc
          .fontSize(10.5).font("Helvetica-Bold").fillColor(INDIGO)
          .text(text.toUpperCase(), { characterSpacing: 0.6 });
        doc.y += 2;
        hr(LINERULE, 0.4);
        doc.fillColor(BLACK).font("Helvetica").fontSize(10);
      }

      // ── Utility: label + value row ───────────────────────────────────
      function row(label, value) {
        if (!value) return;
        doc
          .font("Helvetica-Bold").fillColor(BLACK)
          .text(`${label}:  `, { continued: true })
          .font("Helvetica")
          .text(value);
      }

      // ── Utility: place image with page-break guard ───────────────────
      async function placeImg(imgPath, imgW, imgH, contHeading) {
        if (!fs.existsSync(imgPath)) return;
        if (doc.y + imgH > SAFE) {
          doc.addPage(); doc.y = M;
          if (contHeading) heading(contHeading);
          doc.y += 4;
        }
        const x = M + (CW - imgW) / 2;
        const y = doc.y;
        try {
          const imgBuf = await sharp(imgPath)
            .resize(Math.round(imgW * 2), Math.round(imgH * 2), {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .jpeg({ quality: 92 })
            .toBuffer();
          doc.image(imgBuf, x, y, { width: imgW, height: imgH });
        } catch (imgErr) {
          console.error("Image render error:", imgPath, imgErr.message);
          try { doc.image(imgPath, x, y, { width: imgW, height: imgH }); } catch (_) {}
        }
        doc.y = y + imgH + 8;
      }

      // ── Utility: draw one QR section ─────────────────────────────────
      // FIX: extracted into a reusable function so all 3 QRs are identical
      async function drawQRSection(sectionTitle, scanLabel, link, errorFallbackLabel) {
        // Guard: enough vertical space for heading + label + QR card (~200pt)
        if (doc.y + 200 > SAFE) { doc.addPage(); doc.y = M; }

        heading(sectionTitle);
        doc.y += 4;
        doc
          .fontSize(10).font("Helvetica").fillColor(GRAY)
          .text(scanLabel, { width: CW });
        doc.y += 10;

        try {
          const qrBuf = await makeQR(link);
          const QR_SZ = 105;
          const qrX   = (PW - QR_SZ) / 2;
          const qrY   = doc.y;

          doc.save()
             .roundedRect(qrX - 10, qrY - 8, QR_SZ + 20, QR_SZ + 18, 6)
             .fill("#f0f4ff")
             .restore();

          doc.image(qrBuf, qrX, qrY, { width: QR_SZ, height: QR_SZ });
          doc.y = qrY + QR_SZ + 20;   // consistent spacing after every QR
          doc.fillColor(BLACK);
        } catch (e) {
          console.error(`${sectionTitle} QR error:`, e);
          // FIX: each fallback now correctly labels its own link
          doc.text(`${errorFallbackLabel}: ${link}`, { width: CW });
          doc.y += 10;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 1 — College Header
      // ══════════════════════════════════════════════════════════════════
      const LOGO_SIZE = 50;
      const logoCandidates = [
        path.join(__dirname, "../client/src/assets/logo.png"),
        path.join(__dirname, "../../client/src/assets/logo.png"),
        path.join(__dirname, "../public/logo.png"),
        path.join(__dirname, "../../public/logo.png"),
        path.join(process.cwd(), "client/src/assets/logo.png"),
        path.join(process.cwd(), "public/logo.png"),
        path.join(process.cwd(), "logo.png"),
      ];
      const logoPath = logoCandidates.find(p => fs.existsSync(p)) || null;
      if (!logoPath) console.warn("⚠️  Logo not found. Tried: " + logoCandidates.join(", "));

      if (logoPath) {
        const logoX = (PW - LOGO_SIZE) / 2;
        const logoY = doc.y;
        try {
          const logoBuf = await sharp(logoPath)
            .resize(LOGO_SIZE * 2, LOGO_SIZE * 2, {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toBuffer();
          doc.image(logoBuf, logoX, logoY, { width: LOGO_SIZE, height: LOGO_SIZE });
        } catch (_) {
          try { doc.image(logoPath, logoX, logoY, { width: LOGO_SIZE, height: LOGO_SIZE }); } catch (__) {}
        }
        doc.y = logoY + LOGO_SIZE + 8;
      }

      doc
        .fontSize(13).font("Helvetica-Bold").fillColor(INDIGO)
        .text("Progressive Education Society's", { align: "center" });
      doc.y += 1;
      doc
        .fontSize(10.5).font("Helvetica-Bold").fillColor(BLACK)
        .text("Modern College of Arts, Science and Commerce (Autonomous)", { align: "center" });
      doc.y += 1;
      doc
        .fontSize(9).font("Helvetica").fillColor(GRAY)
        .text("Ganeshkhind, Pune - 411016", { align: "center" });
      doc.y += 5;

      doc.moveTo(M, doc.y).lineTo(PW - M, doc.y).lineWidth(1.8).strokeColor(INDIGO).stroke();
      doc.y += 8;

      // Title banner
      const BANNER_H = 28;
      doc.save().rect(M, doc.y, CW, BANNER_H).fill(BGBLUE).restore();
      doc
        .fontSize(12).font("Helvetica-Bold").fillColor(INDIGO)
        .text(
          (report.title || "ACTIVITY REPORT").toUpperCase(),
          M, doc.y + (BANNER_H - 12) / 2,
          { width: CW, align: "center", characterSpacing: 0.7 }
        );
      doc.y += BANNER_H + 10;

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 2 — Event Details
      // ══════════════════════════════════════════════════════════════════
      heading("Event Details");
      row("Date",         report.date);
      row("Duration",     report.duration);
      row("Organized By", report.organizedBy);
      row("Speaker",      report.speakerName);
      row("Designation",  report.speakerDesignation);

      // Who Can Attend
      let attend = "—";
      let tc = report.whocanattend || [];
      if (!Array.isArray(tc)) tc = [tc];
      tc = tc.filter(v => v && v.trim());

      if (tc.includes("All")) {
        attend = "All members can attend the workshop/event.";
      } else if (tc.length === 1) {
        const map1 = {
          "Students":       "Students can attend the session.",
          "Faculty Members":"Faculty members can attend the session.",
          "Researchers":    "Researchers can attend the session.",
        };
        attend = map1[tc[0]] || tc[0];
      } else if (tc.length > 1) {
        const map = {
          "Students":       "Students",
          "Faculty Members":"Faculty members",
          "Researchers":    "Researchers",
        };
        const words = tc.map(v => map[v]).filter(Boolean);
        const last  = words.pop();
        attend = `${words.join(", ")} and ${last} can attend the session.`;
      }
      row("Who Can Attend", attend);
      doc.y += 7;

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 3 — Session Conducted By
      // ══════════════════════════════════════════════════════════════════
      if (report.sessionRoles) {
        heading("Session Conducted By");
        row("HOD",            report.sessionRoles.hod);
        row("Coordinator",    report.sessionRoles.coordinator);
        row("Anchor",         report.sessionRoles.anchor);
        row("Vote of Thanks", report.sessionRoles.voteOfThanks);
        doc.y += 7;
      }

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 4 — Objective
      // ══════════════════════════════════════════════════════════════════
      heading("Objective");
      doc
        .fontSize(10).font("Helvetica").fillColor(BLACK)
        .text(report.objective || "—", { width: CW, align: "justify", lineGap: 1.5 });
      doc.y += 7;

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 5 — Summary
      // ══════════════════════════════════════════════════════════════════
      heading("Summary");
      doc
        .fontSize(10).font("Helvetica").fillColor(BLACK)
        .text(report.summary || "—", { width: CW, align: "justify", lineGap: 1.5 });
      doc.y += 7;

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 6 — Notice / Circular Photos
      // ══════════════════════════════════════════════════════════════════
      if (report.noticeFile && report.noticeFile.length > 0) {
        doc.addPage(); doc.y = M;
        heading("Notice / Circular");
        doc.y += 4;
        for (const fname of report.noticeFile) {
          await placeImg(path.join("uploads", fname), CW, 235, "Notice / Circular (continued)");
          doc.y += 16;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 7 — Event Photos (2-per-row grid)
      // ══════════════════════════════════════════════════════════════════
      if (report.photos && report.photos.length > 0) {
        doc.addPage(); doc.y = M;
        heading("Event Photos");
        doc.y += 4;

        const H_GAP = 14;
        const V_GAP = 14;
        const EW    = (CW - H_GAP) / 2;
        const EH    = 185;

        let col  = 0;
        let rowY = doc.y;

        for (let i = 0; i < report.photos.length; i++) {
          const imgPath = path.join("uploads", report.photos[i]);
          if (!fs.existsSync(imgPath)) continue;

          if (col === 0 && rowY + EH > SAFE) {
            doc.addPage(); doc.y = M;
            heading("Event Photos (continued)");
            doc.y += 4;
            rowY = doc.y;
          }

          const x = M + col * (EW + H_GAP);
          doc.image(imgPath, x, rowY, {
            width: EW, height: EH, fit: [EW, EH],
            align: "center", valign: "center",
          });

          if (col === 0) {
            col = 1;
          } else {
            col  = 0;
            rowY += EH + V_GAP;
          }
        }
        doc.y = rowY + (col === 1 ? EH : 0) + V_GAP;
      }

      // ══════════════════════════════════════════════════════════════════
      //  SECTION 8 — QR Codes + Signatures  (always on a fresh page)
      // ══════════════════════════════════════════════════════════════════
      doc.addPage(); doc.y = M;

      // FIX: use the unified drawQRSection() helper for all three QRs
      // so spacing, page-break guard, and fallback labels are all correct.

      if (report.registrationLink) {
        await drawQRSection(
          "Event Registration",
          "Scan the QR code below to register for this event:",
          report.registrationLink,
          "Registration"
        );
      }

      if (report.attendanceLink) {
        await drawQRSection(
          "Event Attendance",
          "Scan the QR code below to mark your attendance:",
          report.attendanceLink,
          "Attendance"
        );
      }

      // FIX: feedbackformLink was rendering correctly in logic but could be
      // cut off when all 3 QRs appeared on the same page.
      // drawQRSection() now adds a new page automatically if space < 200pt.
      if (report.feedbackformLink) {
        await drawQRSection(
          "Event Feedback",
          "Scan the QR code below to fill in the feedback form:",
          report.feedbackformLink,
          "Feedback"   // FIX: was incorrectly labelled "Attendance" before
        );
      }

      // ── Signatures ───────────────────────────────────────────────────
      // Guard: signatures need ~120pt
      if (doc.y + 120 > SAFE) { doc.addPage(); doc.y = M; }

      heading("Signatures");
      doc.y += 38;

      const COL_W    = Math.floor(CW / 3);
      const LINE_W   = Math.floor(COL_W * 0.72);
      const LINE_OFF = Math.floor((COL_W - LINE_W) / 2);

      const sig1X = M + LINE_OFF;
      const sig2X = M + COL_W + LINE_OFF;
      const sig3X = M + COL_W * 2 + LINE_OFF;
      const sigY  = doc.y;

      function sigSlot(x, label, name) {
        doc
          .moveTo(x, sigY).lineTo(x + LINE_W, sigY)
          .lineWidth(0.8).strokeColor(BLACK).stroke();
        doc
          .fontSize(9).font("Helvetica-Bold").fillColor(INDIGO)
          .text(label, x, sigY + 5, { width: LINE_W, align: "center" });
        if (name) {
          doc
            .fontSize(8).font("Helvetica").fillColor(GRAY)
            .text("(" + name + ")", x, sigY + 17, { width: LINE_W, align: "center" });
        }
      }

      sigSlot(sig3X, "Principal",      "");
      sigSlot(sig2X, "Vice Principal", "");
      sigSlot(sig1X, "HOD",            "");
      doc.y = sigY + 48;

      // ── Generation stamp ─────────────────────────────────────────────
      doc.y += 12;
      hr(LINERULE, 0.4);
      doc
        .fontSize(8).font("Helvetica").fillColor(GRAY)
        .text(
          `Report generated on ${new Date().toLocaleDateString("en-IN")} | Activity Report System`,
          M, doc.y, { width: CW, align: "center" }
        );

      doc.end();
      stream.on("finish", () => resolve(outPath));
      stream.on("error",  reject);

    } catch (err) {
      reject(err);
    }
  });
}

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

// CREATE
router.post(
  "/",
  upload.fields([
    { name: "noticeFile", maxCount: 10 },
    { name: "photos",     maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.data);

      // FIX: make sure feedbackformLink (and all link fields) are
      // included in `data` — they come from req.body.data (JSON), NOT
      // from req.files, so they must be set by the frontend before posting.
      if (req.files["noticeFile"])
        data.noticeFile = req.files["noticeFile"].map((f) => f.filename);
      if (req.files["photos"])
        data.photos = req.files["photos"].map((f) => f.filename);

      const report = new Report(data);
      await report.save();

      // Debug log — remove after confirming feedbackformLink saves correctly
      console.log("Saved report feedbackformLink:", report.feedbackformLink);

      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET ALL
router.get("/", async (req, res) => {
  try {
    res.json(await Report.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DOWNLOAD PDF
router.get("/pdf/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Not found" });

    // Debug log — remove after confirming QR appears in PDF
    console.log("Generating PDF for:", report.title);
    console.log("  registrationLink :", report.registrationLink);
    console.log("  attendanceLink   :", report.attendanceLink);
    console.log("  feedbackformLink :", report.feedbackformLink);

    const fp = await generatePDF(report);
    res.download(fp, `${report.title || "report"}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed: " + err.message });
  }
});

// EMAIL
router.post("/email/:id", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Email required" });

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Not found" });

    const fp = await generatePDF(report);
    const t  = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await t.sendMail({
      from: `"Activity Report System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Activity Report – ${report.title}`,
      html: `<div style="font-family:sans-serif">
               <h2 style="color:#3730a3">Activity Report – ${report.title}</h2>
               <p>Date: ${report.date || "N/A"} | Organized by: ${report.organizedBy || "N/A"}</p>
               ${report.registrationLink
                 ? `<a href="${report.registrationLink}"
                       style="background:#3730a3;color:#fff;padding:8px 16px;
                              border-radius:5px;text-decoration:none">
                    Register →</a>` : ""}
             </div>`,
      attachments: [{ filename: `${report.title}.pdf`, path: fp }],
    });

    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ error: "Email failed: " + err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const r = await Report.findByIdAndDelete(req.params.id);
    if (r) {
      [...(r.noticeFile || []), ...(r.photos || [])].forEach((f) => {
        const p = path.join("uploads", f);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      const p = path.join("uploads", `report-${r._id}.pdf`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;