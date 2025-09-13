// import multer from "multer"

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../public/temp")
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     // cb(null, file.fieldname + '-' + uniqueSuffix)
//     cb(null,file.originalname)
//   }
// })

// export const upload = multer({ storage: storage })

import multer from "multer";
import path from "path";
import fs from "fs";

// Define temp folder using absolute path
const tempDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });
