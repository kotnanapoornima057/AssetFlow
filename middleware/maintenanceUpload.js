import multer from "multer";
import path from "path";
import fs from "fs";

const maintenanceDir = "uploads/assets";

if (!fs.existsSync(maintenanceDir)) {
  fs.mkdirSync(maintenanceDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, maintenanceDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName = `maintenance-${Date.now()}${ext}`;

    cb(null, fileName);
  },
});

const maintenanceUpload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|gif|webp/;

    const extensionValid = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimeValid = allowed.test(file.mimetype);

    if (extensionValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default maintenanceUpload;