import express from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
} from '../controllers/activityController.js';

const router = express.Router();

router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);

export default router;
