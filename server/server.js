const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 

 
const authRoutes = require("./routes/authRoutes"); 
const reportRoutes = require("./routes/reportRoutes");

const app = express(); 

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://automate-report-genrator.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json()); 
app.use("/uploads", express.static("uploads")); 

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected")); 
app.use("/api/auth", authRoutes); 
// app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Server running on port " + PORT));