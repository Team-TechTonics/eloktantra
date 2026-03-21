const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 📋 Multer Config for Aadhaar Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 📥 Endpoint: Upload Aadhaar
app.post("/upload-aadhaar", upload.single("aadhaar"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

  res.json({
    success: true,
    file: req.file.filename,
    userId: "u-" + Math.random().toString(36).substring(7)
  });
});

// 📸 Endpoint: Verify Face & Match
app.post("/verify-face", (req, res) => {
  const { image, userId } = req.body;
  console.log(`[AUTH] Received face verification request for: ${userId}`);
  if (!image) {
    console.error("[AUTH] No image provided");
    return res.status(400).json({ success: false, error: "No image captured" });
  }

  console.log(`[AUTH] Image payload size: ${(image.length / 1024).toFixed(2)} KB`);
  res.json({
    success: true,
    confidence: 0.98,
    match: true
  });
});

// 🔐 Endpoint: Generate Voting Token
app.post("/generate-token", (req, res) => {
  const { userId } = req.body;
  console.log(`[AUTH] Generating token for: ${userId}`);
  if (!userId) return res.status(400).json({ success: false, error: "Missing identity" });

  const token = crypto
    .createHash("sha256")
    .update(userId + Date.now().toString())
    .digest("hex")
    .toUpperCase();

  res.json({
    success: true,
    token: `VOTE-TOKEN-${token.substring(0, 16)}`
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Mock Auth Backend running on http://localhost:${PORT}`);
});
