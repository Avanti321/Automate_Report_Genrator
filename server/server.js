const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); 

const authRoutes = require("./routes/authRoutes"); 
const reportRoutes = require("./routes/reportRoutes");

const app = express(); 

app.use(cors()); 
app.use(express.json()); 
app.use("/uploads", express.static("uploads")); 

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected")); 
app.use("/api/auth", authRoutes); 
app.use("/api/reports", reportRoutes); 

app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT));
