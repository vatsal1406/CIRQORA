import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Company from './models/Company.js';
import Supplier from './models/Supplier.js';
import Activity from './models/Activity.js';
import EmissionFactor from './models/EmissionFactor.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CIRQORA';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Company.deleteMany({});
    await Supplier.deleteMany({});
    await Activity.deleteMany({});
    await EmissionFactor.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Seed Emission Factors
    const factors = await EmissionFactor.insertMany([
      { activityType: 'diesel_consumption', material: 'Diesel', unit: 'litre', factor: 2.68, factorUnit: 'kgCO2e/litre', source: 'DEFRA 2024' },
      { activityType: 'natural_gas', material: 'Natural Gas', unit: 'm3', factor: 2.02, factorUnit: 'kgCO2e/m3', source: 'DEFRA 2024' },
      { activityType: 'purchased_electricity', material: 'Grid Power', unit: 'kWh', factor: 0.70, factorUnit: 'kgCO2e/kWh', source: 'IEA 2024' },
      { activityType: 'purchased_material', material: 'Aluminium', unit: 'kg', factor: 1.44, factorUnit: 'kgCO2e/kg', source: 'IAI 2024' },
      { activityType: 'purchased_material', material: 'Plastic', unit: 'kg', factor: 2.50, factorUnit: 'kgCO2e/kg', source: 'PlasticsEurope' },
      { activityType: 'purchased_material', material: 'Copper', unit: 'kg', factor: 3.81, factorUnit: 'kgCO2e/kg', source: 'ICA 2024' },
      { activityType: 'freight_transport', material: 'Truck Freight', unit: 'tkm', factor: 0.15, factorUnit: 'kgCO2e/tkm', source: 'GLEC Framework' },
      { activityType: 'waste', material: 'General Waste', unit: 'kg', factor: 0.45, factorUnit: 'kgCO2e/kg', source: 'EPA WARM' },
    ]);
    console.log(`Seeded ${factors.length} Emission Factors.`);

    // 2. Seed Sample Company
    const company = await Company.create({
      name: 'Atul Manufacturing Corp',
      industry: 'Electrical & Industrial Equipment',
      location: 'Mumbai, India',
    });
    console.log(`Seeded Company: ${company.name} (${company._id})`);

    // 3. Seed Sample Suppliers (including multiple suppliers for Aluminium)
    const supplierA = await Supplier.create({
      companyId: company._id,
      name: 'Hindalco Aluminium Ltd',
      location: 'Renukoot, India',
      materials: ['Aluminium'],
      cost: 2500,
      capacity: 50000,
    });

    const supplierB = await Supplier.create({
      companyId: company._id,
      name: 'NALCO EcoAluminium',
      location: 'Angul, India',
      materials: ['Aluminium', 'Plastic'],
      cost: 2650,
      capacity: 35000,
    });

    const supplierC = await Supplier.create({
      companyId: company._id,
      name: 'Supreme Plastics Co',
      location: 'Pune, India',
      materials: ['Plastic'],
      cost: 1200,
      capacity: 20000,
    });
    console.log('Seeded 3 Suppliers.');

    // 4. Seed Activities (Scope 1, Scope 2, Scope 3)
    const activities = await Activity.insertMany([
      {
        companyId: company._id,
        supplierId: null,
        activityType: 'diesel_consumption',
        scope: 1,
        scope3Category: null,
        material: 'Diesel',
        quantity: 20000,
        unit: 'litre',
        emissionFactor: 2.68,
        emissions: 53.6, // 20000 * 2.68 / 1000
        date: new Date('2026-08-01'),
      },
      {
        companyId: company._id,
        supplierId: null,
        activityType: 'purchased_electricity',
        scope: 2,
        scope3Category: null,
        material: 'Grid Power',
        quantity: 100000,
        unit: 'kWh',
        emissionFactor: 0.70,
        emissions: 70.0, // 100000 * 0.7 / 1000
        date: new Date('2026-08-05'),
      },
      {
        companyId: company._id,
        supplierId: supplierA._id,
        activityType: 'purchased_material',
        scope: 3,
        scope3Category: 1,
        material: 'Aluminium',
        quantity: 5000,
        unit: 'kg',
        emissionFactor: 1.44,
        emissions: 7.2, // 5000 * 1.44 / 1000
        date: new Date('2026-08-10'),
      },
      {
        companyId: company._id,
        supplierId: supplierB._id,
        activityType: 'purchased_material',
        scope: 3,
        scope3Category: 1,
        material: 'Aluminium',
        quantity: 3000,
        unit: 'kg',
        emissionFactor: 1.26, // lower carbon footprint
        emissions: 3.78,
        date: new Date('2026-08-12'),
      },
      {
        companyId: company._id,
        supplierId: supplierC._id,
        activityType: 'purchased_material',
        scope: 3,
        scope3Category: 1,
        material: 'Plastic',
        quantity: 4000,
        unit: 'kg',
        emissionFactor: 2.50,
        emissions: 10.0,
        date: new Date('2026-08-15'),
      },
    ]);
    console.log(`Seeded ${activities.length} Activities.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
