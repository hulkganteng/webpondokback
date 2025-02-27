// upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Gunakan variabel environment UPLOAD_DIR atau default ke folder "uploads"
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

// Pastikan folder upload ada, jika belum maka buat folder tersebut
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Menghasilkan nama file unik dengan timestamp dan random number
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Hanya terima file dengan MIME type image/*
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
