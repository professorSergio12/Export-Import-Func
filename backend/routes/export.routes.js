import express from 'express';
const router = express.Router();

import { exportFile } from '../controller/export.controller.js';

router.get('/excel', exportFile);

export default router;  