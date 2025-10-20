import multer, { Multer, StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';


// Configure storage
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, 'uploads/');
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export { upload };
