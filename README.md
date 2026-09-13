# CIRQORA 🌱

## Circular Carbon Ecosystem

CIRQORA is a Carbon-Aware Supply Chain Dashboard designed to help companies understand, trace, compare, and reduce their supply-chain carbon footprint.

The platform combines company activity data, supplier relationships, emission factors, carbon calculations, D3 visualizations, supplier comparison, and AI-assisted insights.

---

## Table of Contents

- Overview
- Problem Statement
- Key Features
- Technology Stack
- System Architecture
- Project Structure
- Data Model
- Company-Supplier Relationship
- Activity Types
- Carbon Accounting
- Purchased Materials and Transportation
- Supplier Comparison
- Dashboard
- AI Insights
- API
- Environment Variables
- Installation
- Running the Project
- Development Principles
- Security
- Future Enhancements

---

## Overview

CIRQORA provides a centralized carbon-intelligence system for companies that need visibility into Scope 1, Scope 2, and Scope 3 emissions.

The core workflow is:

```text
Capture activity data
        ↓
Associate suppliers where applicable
        ↓
Look up verified emission factors
        ↓
Calculate emissions in the backend
        ↓
Aggregate carbon data
        ↓
Identify hotspots
        ↓
Compare suppliers
        ↓
Generate insights
```

---

## Problem Statement

Supply-chain emissions are difficult to track because information is distributed across suppliers, purchased materials, transportation, waste, business travel, employee commuting, and other operational activities.

CIRQORA addresses this by providing:

- Company-specific carbon tracking
- Supplier carbon visibility
- Material-level emission analysis
- Transportation impact
- Scope and Scope 3 category breakdowns
- Supplier comparison
- Carbon hotspot identification
- AI-assisted sustainability insights

---

## Key Features

### Company Management

Users can select an active company. Dashboard, activities, suppliers, comparisons, and other company-specific information are scoped to that company.

### Activity Tracking

The platform supports:

- Diesel Consumption
- Natural Gas Consumption
- Purchased Electricity
- Purchased Material
- Upstream Transportation
- Downstream Transport
- Waste
- Business Travel
- Employee Commuting

The Activity form is dynamic and shows only fields relevant to the selected activity.

### Supplier Management

Suppliers are independent database entities containing:

- Name
- Materials
- Cost
- Capacity

A supplier is associated with a company through Activities rather than through a `companyId` on the Supplier document.

### Company-Specific Supplier Network

The Suppliers page does not display every supplier in MongoDB.

For the selected company:

```text
Company
  ↓
Company Activities
  ↓
Unique supplierIds
  ↓
Suppliers collection
  ↓
Suppliers actually used by that company
```

### Supplier Comparison

Supplier comparison can consider:

- Supplier
- Material
- Quantity
- Material emissions
- Transportation emissions
- Total supply-chain impact
- Cost
- Capacity
- Activity information

### Carbon Dashboard

The dashboard provides:

- Total emissions
- Scope 1
- Scope 2
- Scope 3
- Scope breakdown
- Scope 3 category breakdown
- Supplier footprint ranking
- Material emissions
- Carbon hotspots
- Recent activities
- Actionable insights

### AI Insights

Gemini is used through the backend for AI-assisted analysis. It does not replace the backend's carbon calculations.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- D3.js
- Axios
- React Router
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API

### AI

- Gemini API

### Visualization

- D3.js

---

## System Architecture

```text
┌──────────────────────────┐
│        React UI          │
│                          │
│ Dashboard                │
│ Activities               │
│ Suppliers                │
│ Comparison               │
│ Insights                 │
└────────────┬─────────────┘
             │ Axios
             ▼
┌──────────────────────────┐
│      Express API         │
│                          │
│ Routes                   │
│ Controllers              │
│ Services                 │
│ Validation               │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌────────────┐ ┌────────────┐
│  MongoDB   │ │ Gemini API │
│            │ │            │
│ Companies  │ │ AI         │
│ Suppliers  │ │ Analysis   │
│ Activities │ └────────────┘
│ Factors    │
└────────────┘
```

### Core principle

The frontend is responsible for presentation and user input.

The backend is responsible for business logic, emission-factor lookup, scope classification, and carbon calculations.

---

## Project Structure

The project uses the existing `client/` directory for the frontend.

```text
CIRQORA/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── activities/
│   │   │   └── suppliers/
│   │   │
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.*
│   │
│   ├── package.json
│   └── .env
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── middleware/
│   └── config/
│
└── README.md
```

Exact filenames may differ in the current implementation.

---

## Data Model

CIRQORA's primary MongoDB collections are:

```text
companies
suppliers
activities
emissionFactors
```

### Companies

Represents organizations using the platform.

### Suppliers

Suppliers remain independent from companies.

Conceptually:

```js
{
  name,
  materials,
  cost,
  capacity,
  createdAt,
  updatedAt
}
```

There is intentionally no `companyId` in the Supplier model.

### Activities

Activities connect companies, suppliers, operational data, and carbon calculations.

Important fields include:

```js
{
  companyId,
  supplierId,
  activityType,
  scope,
  scope3Category,
  material,
  quantity,
  unit,
  emissionFactor,
  emissions,
  date,
  distance
}
```

### Emission Factors

Emission factors are stored centrally and are used by the backend for carbon calculations.

The exact schema follows the existing server implementation.

---

## Company-Supplier Relationship

The relationship is intentionally:

```text
companies
    │
    │ companyId
    ▼
activities
    │
    │ supplierId
    ▼
suppliers
```

Example:

```text
Company A
  ├── Activity → Supplier 1
  ├── Activity → Supplier 1
  └── Activity → Supplier 2
```

Company A's Suppliers page therefore shows Supplier 1 and Supplier 2.

If Company B uses Supplier 1:

```text
Company B
  └── Activity → Supplier 1
```

Supplier 1 can appear for both companies without duplicating the supplier document.

---

## Activity Types

### Purchased Material

Materials:

```text
Aluminium
Copper
Steel
Stainless Steel
Plastic
Glass
Paper
Cardboard
Cement
Concrete
Rubber
Textile
Wood
```

Fields:

```text
Activity Type
Material
Supplier
Quantity
Unit
Distance
Date
```

Purchased Material is Scope 3, Category 1.

Distance represents transportation from the supplier to the company.

### Waste

Waste types:

```text
General Waste
Plastic Waste
Paper Waste
Cardboard Waste
Metal Waste
Glass Waste
Wood Waste
```

Unit:

```text
kg
```

Waste is Scope 3, Category 5.

### Business Travel

Travel modes:

```text
Car
Taxi
Bus
Train
Domestic Flight
International Flight
```

Unit:

```text
passenger-km
```

Business Travel is Scope 3, Category 6.

### Employee Commuting

Commute modes:

```text
Car
Motorcycle
Bus
Train
```

Unit:

```text
passenger-km
```

Employee Commuting is Scope 3, Category 7.

### Diesel Consumption

Operational fuel activity. Scope and emission factor are determined by the backend.

### Natural Gas Consumption

Operational fuel activity. Scope and emission factor are determined by the backend.

### Purchased Electricity

Purchased-energy activity. Scope and emission factor are determined by the backend.

### Upstream Transportation

Transportation associated with incoming goods/materials. It remains analytically separate from Purchased Material.

### Downstream Transport

Transportation of products after they leave the company toward downstream destinations. It is maintained separately from upstream transportation and purchased materials.

---

## Carbon Accounting

The system tracks:

```text
Scope 1
Scope 2
Scope 3
```

Scope 3 is further divided into relevant categories.

The backend determines:

- Scope
- Scope 3 category
- Emission factor
- Emissions

The frontend does not calculate carbon emissions.

### Known Scope 3 Categories

```text
Purchased Material → Category 1
Waste              → Category 5
Business Travel    → Category 6
Employee Commuting → Category 7
```

Transportation categories remain separate from Purchased Material.

---

## Purchased Materials and Transportation

A Purchased Material activity can contain:

```text
Material
Supplier
Quantity
Distance
```

Example:

```text
Material: Aluminium
Supplier: Supplier A
Quantity: 1000 kg
Distance: 450 km
```

The material component belongs to:

```text
Scope 3 → Category 1
```

The associated upstream transportation component belongs to:

```text
Scope 3 → Category 4
```

The user enters the distance as part of the Purchased Material workflow. There is no need for a separate user-facing freight activity just to capture this distance.

When a verified transportation factor is available, transportation emissions can be calculated from the appropriate quantity, distance, and factor.

### Important

Never invent an emission factor.

If a required factor is not present in the database, the backend must indicate that it is unavailable rather than fabricate a value.

---

## Supplier Comparison

The comparison endpoint is company-specific:

```http
GET /api/suppliers/compare?companyId=<COMPANY_ID>&material=<MATERIAL>
```

The backend should:

1. Find Activities belonging to the selected company.
2. Identify suppliers through `supplierId`.
3. Filter relevant activities for the selected material.
4. Aggregate material emissions.
5. Aggregate transportation emissions where available.
6. Return comparison metrics.

Conceptual response:

```js
{
  supplierId,
  supplierName,
  material,
  cost,
  capacity,
  activityCount,
  totalQuantity,
  materialEmissions,
  transportationEmissions,
  totalSupplyChainImpact,
  averageEmissionFactor
}
```

Raw total emissions should be interpreted alongside quantity. Where appropriate, normalized metrics should be calculated by the backend.

---

## Dashboard

The dashboard answers three questions:

### How much carbon?

- Total emissions
- Scope 1
- Scope 2
- Scope 3

### Where does it come from?

- Scope breakdown
- Scope 3 category breakdown
- Material emissions

### Which suppliers/materials are hotspots?

- Supplier Footprint Ranking
- Emissions by Material
- Supplier carbon hotspots
- Material carbon hotspots

D3 visualizations should remain responsive and handle long supplier/material labels without overlap or clipping.

---

## AI Insights

The AI architecture is:

```text
React
  ↓
POST /api/ai/analyze
  ↓
Express Backend
  ↓
Gemini API
  ↓
Backend response
  ↓
React
```

The Gemini API key remains on the backend.

AI-generated insights should be based on authoritative application data.

AI does not independently replace the application's emission calculations.

---

## API

### Health

```http
GET /api/health
```

### Companies

```http
POST /api/companies
GET /api/companies
GET /api/companies/:id
```

### Suppliers

```http
POST /api/suppliers
GET /api/suppliers?companyId=<COMPANY_ID>
GET /api/suppliers/:id
GET /api/suppliers/compare?companyId=<COMPANY_ID>&material=<MATERIAL>
```

### Activities

```http
POST /api/activities
GET /api/activities
GET /api/activities/:id
```

### Dashboard

```http
GET /api/dashboard?companyId=<COMPANY_ID>
```

### AI

```http
POST /api/ai/analyze
```

The exact response structures follow the current server implementation.

---

## Environment Variables

### Frontend

The frontend should contain only frontend-safe configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

Never place database credentials or AI secrets in the frontend.

### Backend

Typical backend configuration includes:

```env
MONGO_URI=...
GEMINI_API_KEY=...
PORT=5000
```

Use the actual variable names required by the current server.

Never commit secrets.

---

## Installation

### Prerequisites

- Node.js
- npm
- MongoDB or MongoDB deployment access
- Git

### Clone

```bash
git clone <repository-url>
cd CIRQORA
```

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

## Running the Project

Start the backend using the script defined in the server `package.json`, commonly:

```bash
npm run dev
```

Then start the frontend from the existing client directory:

```bash
cd client
npm run dev
```

The frontend development API is normally:

```text
http://localhost:5000/api
```

Use the actual scripts/configuration present in the project if they differ.

---

## Development Principles

### Backend is the Source of Truth

The frontend must not independently calculate:

- Emission factors
- Emissions
- Scope
- Scope 3 categories
- Supplier carbon rankings
- Carbon hotspots

### No Hardcoded Business Data

Do not hardcode:

- Supplier names
- Company IDs
- Material emission factors
- Dashboard carbon values
- Database business records

Business data must come from MongoDB through the backend API.

### Dynamic Activity Forms

The form should display only fields relevant to the selected activity.

### Supplier Independence

Do not add `companyId` to Supplier.

Use:

```text
Activity.companyId
Activity.supplierId
```

to establish the company-supplier relationship.

### Company Isolation

Company-specific data must be filtered in the backend.

Never fall back to returning global supplier data when a company-specific endpoint requires a company ID.

---

## Error Handling

The application should handle:

- Missing required fields
- Invalid ObjectIds
- Invalid activity/material combinations
- Invalid units
- Negative quantities
- Invalid distances
- Missing emission factors
- Missing company IDs
- Missing suppliers
- MongoDB errors
- API/network errors

Errors should be surfaced clearly to the user.

---

## Security

- Keep MongoDB credentials on the backend.
- Keep Gemini API keys on the backend.
- Never expose secrets through Vite environment variables.
- Never commit `.env` files containing secrets.
- Validate incoming data on the backend.
- Validate MongoDB ObjectIds.
- Enforce company-specific filtering in backend queries.
- Do not trust frontend filtering for data isolation.
- Do not commit `node_modules`.

Recommended `.gitignore` entries:

```text
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
coverage/
*.log
.DS_Store
```

---

## Future Enhancements

Potential extensions include:

- Multi-tier supplier mapping
- Supplier-specific emission factors
- More verified transportation factors
- Supplier sustainability scoring
- Carbon reduction targets
- Scenario modelling
- Circular sourcing recommendations
- Supplier risk analysis
- Automated ESG reports
- Historical emissions trends
- Carbon reduction simulations
- Advanced AI recommendations
- Expanded Scope 3 category coverage

---

## CIRQORA Workflow

```text
                     COMPANY
                        │
                        ▼
                    ACTIVITIES
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
       MATERIAL       SUPPLIER    TRANSPORT
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                 EMISSION FACTORS
                        │
                        ▼
                 CARBON CALCULATION
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        DASHBOARD            SUPPLIER COMPARISON
             │                     │
             └──────────┬──────────┘
                        ▼
                   AI INSIGHTS
```

---

## CIRQORA in One Sentence

> **CIRQORA transforms company activity and supplier data into an auditable, visual, and actionable carbon-intelligence system for building a more circular supply chain.**

---

## License

Add the project's chosen license here when finalized.
