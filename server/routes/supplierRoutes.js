import express from 'express';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  compareSuppliers,
} from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', createSupplier);
router.get('/', getSuppliers);
router.get('/compare', compareSuppliers);
router.get('/:id', getSupplierById);

export default router;
