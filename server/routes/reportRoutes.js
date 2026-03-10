require("dotenv").config();
const router      = require("express").Router();
const multer      = require("multer");
const Report      = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");
const nodemailer  = require("nodemailer");
const QRCode      = require("qrcode");  // npm install qrcode
const sharp       = require("sharp");   // npm install sharp

//FILE UPLOAD

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only images allowed"));
  },
});

//  HELPERS

async function makeQR(url) {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 160,
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}


//  PDF GENERATOR

async function generatePDF(report) {
  const outPath = path.join("uploads", `report-${report._id}.pdf`);

  return new Promise(async (resolve, reject) => {
    try {
      //  Page setup 
      const M  = 40;   // margin
      const doc = new PDFDocument({
        size: "A4",
        margin: M,
        autoFirstPage: true,
        bufferPages: false,
      });

      const PW   = doc.page.width;    // 595
      const PH   = doc.page.height;   // 842
      const CW   = PW - M * 2;       // 515  usable width
      
      const SAFE = PH - M - 10;

      const stream = fs.createWriteStream(outPath);
      doc.pipe(stream);

  
      const INDIGO = "#3730a3";
      const BLUE   = "#1d4ed8";
      const GRAY   = "#6b7280";
      const BLACK  = "#1f2937";
      const BGBLUE = "#eef2ff";
      const LINERULE = "#c7d2fe";

      // horizontal rule
      function hr(color, weight) {
        doc
          .moveTo(M, doc.y)
          .lineTo(PW - M, doc.y)
          .lineWidth(weight || 0.5)
          .strokeColor(color || LINERULE)
          .stroke();
        doc.y += 6;
      }

      // section heading 
    
      function heading(text) {
        if (doc.y > SAFE - 50) {
          doc.addPage();
          doc.y = M;
        }
        doc
          .fontSize(10.5)
          .font("Helvetica-Bold")
          .fillColor(INDIGO)
          .text(text.toUpperCase(), { characterSpacing: 0.6 });
        doc.y += 2;
        hr(LINERULE, 0.4);
        doc.fillColor(BLACK).font("Helvetica").fontSize(10);
      }

      // label + value row
      function row(label, value) {
        if (!value) return;
        doc
          .font("Helvetica-Bold").fillColor(BLACK)
          .text(`${label}:  `, { continued: true })
          .font("Helvetica")
          .text(value);
      }

      // ── Utility: place image with uniform size, page-break if needed ─────
      // imgW and imgH are FIXED — every image renders at exactly this size.
      function placeImg(imgPath, imgW, imgH, contHeading) {
        if (!fs.existsSync(imgPath)) return;
        if (doc.y + imgH > SAFE) {
          doc.addPage();
          doc.y = M;
          if (contHeading) heading(contHeading);
          doc.y += 4;
        }
        const x = M + (CW - imgW) / 2;
        const y = doc.y;
        doc.image(imgPath, x, y, { width: imgW, height: imgH, cover: [imgW, imgH] });
        doc.y = y + imgH + 8;
      }

      
      //  SECTION 1 — College Header

      const logoPath = path.join(__dirname, "../assets/college-logo.png");
      const LOGO_SIZE = 54;   // width & height of logo in points
      if (fs.existsSync(logoPath)) {
        const logoX = (PW - LOGO_SIZE) / 2;   // horizontally centered
        doc.image(logoPath, logoX, doc.y, {
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          fit: [LOGO_SIZE, LOGO_SIZE],
          align: "center",
          valign: "center",
        });
        doc.y += LOGO_SIZE + 6;   // move cursor below logo with small gap
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
        .text("Ganeshkhind, Pune – 411016", { align: "center" });
      doc.y += 5;

      // Bold indigo rule under header
      doc.moveTo(M, doc.y).lineTo(PW - M, doc.y).lineWidth(1.8).strokeColor(INDIGO).stroke();
      doc.y += 8;

      //  Title
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

      
      //  SECTION 2 — Event Details
   
      heading("Event Details");
      row("Date",         report.date);
      row("Duration",     report.duration);
      row("Organized By", report.organizedBy);
      row("Speaker",      report.speakerName);
      row("Designation",  report.speakerDesignation);
      row("Who Can Attend", (report.targetClass && report.targetClass.length > 0)
        ? report.targetClass.join(", ")
        : "—");
      doc.y += 7;


      //  SECTION 3 — Session Conducted By
     
      if (report.sessionRoles) {
        heading("Session Conducted By");
        row("HOD",            report.sessionRoles.hod);
        row("Coordinator",    report.sessionRoles.coordinator);
        row("Anchor",         report.sessionRoles.anchor);
        row("Vote of Thanks", report.sessionRoles.voteOfThanks);
        doc.y += 7;
      }

    
      //  SECTION 4 — objective

      heading("Objective");
      doc
        .fontSize(10).font("Helvetica").fillColor(BLACK)
        .text(report.objective || "—", { width: CW, align: "justify", lineGap: 1.5 });
      doc.y += 7;

      
      //  SECTION 5 — Summary
  
      heading("Summary");
      doc
        .fontSize(10).font("Helvetica").fillColor(BLACK)
        .text(report.summary || "—", { width: CW, align: "justify", lineGap: 1.5 });
      doc.y += 7;

    
      //  SECTION 6 — Notice / Circular Photos
    
      if (report.noticeFile && report.noticeFile.length > 0) {
        doc.addPage();
        doc.y = M;
        heading("Notice / Circular");
        doc.y += 4;

        const NOTICE_GAP = 16;   // gap between notice photos
        for (const fname of report.noticeFile) {
          placeImg(path.join("uploads", fname), CW, 235, "Notice / Circular (continued)");
          doc.y += NOTICE_GAP;   // 0.5cm space after each photo
        }
      }

      
      //  SECTION 7 — Event Photos 
     
      if (report.photos && report.photos.length > 0) {
        doc.addPage();
        doc.y = M;
        heading("Event Photos");
        doc.y += 4;

        // 2 photos per row, horizontal layout
        // 0.5cm (14pt) gap between the two columns AND between rows
        const H_GAP = 14;              // horizontal gap between left and right photo
        const V_GAP = 14;              // vertical gap (0.5cm) between rows
        const EW    = (CW - H_GAP) / 2;  // width of each photo cell
        const EH    = 185;               // fixed height — all photos same size

        let col  = 0;
        let rowY = doc.y;

        for (let i = 0; i < report.photos.length; i++) {
          const imgPath = path.join("uploads", report.photos[i]);
          if (!fs.existsSync(imgPath)) continue;

          // Check page space only at start of a new row (left column)
          if (col === 0 && rowY + EH > SAFE) {
            doc.addPage();
            doc.y = M;
            heading("Event Photos (continued)");
            doc.y += 4;
            rowY = doc.y;
          }

          // X position: left col = M, right col = M + EW + H_GAP
          const x = M + col * (EW + H_GAP);
          doc.image(imgPath, x, rowY, {
            width: EW, height: EH, fit: [EW, EH],
            align: "center", valign: "center",
          });

          if (col === 0) {
            col = 1;  // place next photo on the right
          } else {
            col  = 0;
            rowY += EH + V_GAP;  // move down to next row with 0.5cm gap
          }
        }
        // Advance doc.y past the last row
        doc.y = rowY + (col === 1 ? EH : 0) + V_GAP;
      }

     
      //  SECTION 8 QR + Signatures
      
      doc.addPage();
      doc.y = M;

      //  QR Registration 
      if (report.registrationLink) {
        heading("Event Registration");
        doc.y += 4;
        doc
          .fontSize(10).font("Helvetica").fillColor(GRAY)
          .text("Scan the QR code below to register for this event:", { width: CW });
        doc.y += 10;

        try {
          const qrBuf = await makeQR(report.registrationLink);
          const QR_SZ = 105;
          const qrX   = (PW - QR_SZ) / 2;
          const qrY   = doc.y;

          // Light card behind QR
          doc.save()
             .roundedRect(qrX - 10, qrY - 8, QR_SZ + 20, QR_SZ + 18, 6)
             .fill("#f0f4ff")
             .restore();

          doc.image(qrBuf, qrX, qrY, { width: QR_SZ, height: QR_SZ });
          doc.y = qrY + QR_SZ + 8;

          doc
            .fontSize(7.5).fillColor(BLUE)
            .text(report.registrationLink, M, doc.y, {
              width: CW, align: "center", link: report.registrationLink,
            });
          doc.fillColor(BLACK);
          doc.y += 16;
        } catch (e) {
          console.error("QR error:", e);
          doc.text(`Registration: ${report.registrationLink}`, { width: CW });
          doc.y += 10;
        }
      }

      // Signatures
     
      heading("Signatures");
      doc.y += 38;

      // Divide CW into 3 equal columns. Each slot uses 70% of column as line.
      const COL_W   = Math.floor(CW / 3);        // ~171 pt each column
      const LINE_W  = Math.floor(COL_W * 0.72);  // ~123 pt line inside column
      const LINE_OFF = Math.floor((COL_W - LINE_W) / 2); // centre line in column

      const sig1X = M + LINE_OFF;
      const sig2X = M + COL_W + LINE_OFF;
      const sig3X = M + COL_W * 2 + LINE_OFF;
      const sigY  = doc.y;

      function sigSlot(x, label, name) {
        // Signature line
        doc
          .moveTo(x, sigY).lineTo(x + LINE_W, sigY)
          .lineWidth(0.8).strokeColor(BLACK).stroke();
        // Role label
        doc
          .fontSize(9).font("Helvetica-Bold").fillColor(INDIGO)
          .text(label, x, sigY + 5, { width: LINE_W, align: "center" });
        // Name in brackets below
        if (name) {
          doc
            .fontSize(8).font("Helvetica").fillColor(GRAY)
            .text("(" + name + ")", x, sigY + 17, { width: LINE_W, align: "center" });
        }
      }
      sigSlot(sig3X, "Principal",      "");
      sigSlot(sig2X, "Vice Principal", "");
      sigSlot(sig1X, "HOD",           report.sessionRoles?.hod || "");
      doc.y = sigY + 48;

      //Generation stamp
      doc.y += 12;
      hr(LINERULE, 0.4);
      doc
        .fontSize(8).font("Helvetica").fillColor(GRAY)
        .text(
          `Report generated on ${new Date().toLocaleDateString("en-IN")} | Activity Report System`,
          M, doc.y, { width: CW, align: "center" }
        );

      //  Done
      doc.end();
      stream.on("finish", () => resolve(outPath));
      stream.on("error",  reject);

    } catch (err) {
      reject(err);
    }
  });
}


//  ROUTES


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
      if (req.files["noticeFile"])
        data.noticeFile = req.files["noticeFile"].map((f) => f.filename);
      if (req.files["photos"])
        data.photos = req.files["photos"].map((f) => f.filename);
      const report = new Report(data);
      await report.save();
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
    const fp = await generatePDF(report);
    res.download(fp, `${report.title || "report"}.pdf`);
  } catch (err) {
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// EMAIL
router.post("/email/:id", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Email required" });
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
