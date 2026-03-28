import express from 'express';
const router = express.Router();

import { importFile } from '../controller/import.controller.js';
import upload from '../config/multer.js';

router.post('/excel', upload.single('excelFile'), importFile);

export default router;