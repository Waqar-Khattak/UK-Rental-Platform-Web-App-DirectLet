const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2,8)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// POST /api/uploads - accepts multiple files under field name 'images'
router.post('/', upload.array('images', 10), (req, res) => {
  const files = (req.files || []).map(f => ({ filename: f.filename, url: `/uploads/${f.filename}` }));
  res.json({ files });
});

module.exports = router;
