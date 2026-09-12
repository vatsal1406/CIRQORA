import express from 'express';
import { analyzeCompanyEmissions } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', analyzeCompanyEmissions);

export default router;
