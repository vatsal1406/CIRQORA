import express from 'express';
import {
  getSimulationOptions,
  calculateCarbonReduction,
} from '../controllers/simulationController.js';

const router = express.Router();

router.get('/options', getSimulationOptions);
router.post('/carbon-reduction', calculateCarbonReduction);

export default router;
