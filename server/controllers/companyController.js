import Company from '../models/Company.js';
import { validateCompany } from '../utils/validation.js';

// @desc    Create new Company
// @route   POST /api/companies
export const createCompany = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCompany(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const { name, industry, location } = req.body;
    const company = await Company.create({ name, industry, location });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Companies
// @route   GET /api/companies
export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Company by ID
// @route   GET /api/companies/:id
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};
