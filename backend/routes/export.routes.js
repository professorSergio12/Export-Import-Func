import express from 'express';
const router = express.Router();

import { exportExcel, exportPdf, generateDocx } from '../controller/export.controller.js';

router.get('/excel', exportExcel);
router.post('/pdf', exportPdf);
router.post('/docx', generateDocx);

export default router;  