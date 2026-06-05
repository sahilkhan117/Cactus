import multer from 'multer';
import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';

// Configure multer memory storage
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit 5MB
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Stream the file upload to Cloudinary using upload_stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'cactus_media',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
          return;
        }
        res.status(200).json({ url: result?.secure_url });
      }
    );

    stream.end(req.file.buffer);
  } catch (err: any) {
    console.error('Upload controller error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
