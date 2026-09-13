import express from 'express';
import { analyzeCompanyEmissions, getStoredAnalysis } from '../controllers/aiController.js';

const router = express.Router();

router.get('/analysis', getStoredAnalysis);
router.post('/analyze', analyzeCompanyEmissions);

export default router;
