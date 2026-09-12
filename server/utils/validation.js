import mongoose from 'mongoose';

export const validateCompany = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Company name is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSupplier = (data) => {
  const errors = [];
  if (!data.companyId || !mongoose.Types.ObjectId.isValid(data.companyId)) {
    errors.push('Valid companyId is required');
  }
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Supplier name is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateActivity = (data) => {
  const errors = [];
  if (!data.companyId || !mongoose.Types.ObjectId.isValid(data.companyId)) {
    errors.push('Valid companyId is required');
  }
  if (data.supplierId && !mongoose.Types.ObjectId.isValid(data.supplierId)) {
    errors.push('supplierId must be a valid ObjectId if provided');
  }
  if (!data.activityType || typeof data.activityType !== 'string' || !data.activityType.trim()) {
    errors.push('activityType is required');
  }
  if (data.quantity === undefined || data.quantity === null || typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.push('quantity must be a positive number');
  }
  if (!data.unit || typeof data.unit !== 'string' || !data.unit.trim()) {
    errors.push('unit is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
