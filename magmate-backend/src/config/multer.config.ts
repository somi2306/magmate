// src/config/multer.config.ts
import { memoryStorage } from 'multer';

// On change diskStorage pour memoryStorage
export const multerOptions = {
  storage: memoryStorage(), 
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};