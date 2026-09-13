import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Plus, Info, Truck, Zap, Flame, Trash2, Package, Navigation, Briefcase, Car } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { activityService } from '../../services/activityService';
import { useCompany } from '../../hooks/useCompany';
import { formatEmissions, formatDate } from '../../utils/formatters';

const ActivityForm = ({ suppliers = [], onSuccess }) => {
  const { companyId, activeCompany } = useCompany();

  const [formData, setFormData] = useState({
    supplierId: '',
    activityType: 'purchased_material',
    material: 'Aluminium',
    transportMode: 'Road Freight Truck',
    travelMode: 'Train',
    commuteMode: 'Car',
    distance: '',
    wasteType: 'General Waste',
    quantity: '',
    unit: 'kg',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  // Dynamic default unit switcher when activity type changes
  const handleActivityTypeChange = (type) => {
    let defaultUnit = 'kg';
    let defaultMaterial = 'Aluminium';

    if (type === 'electricity') {
      defaultUnit = 'kWh';
      defaultMaterial = 'Grid Power';
    } else if (type === 'diesel_combustion') {
      defaultUnit = 'liters';
      defaultMaterial = 'Diesel';
    } else if (type === 'natural_gas') {
      defaultUnit = 'm3';
      defaultMaterial = 'Natural Gas';
    } else if (type === 'freight_transport') {
      defaultUnit = 'ton-km';
      defaultMaterial = 'Road Freight Truck';
    } else if (type === 'downstream_transport') {
      defaultUnit = 'ton-km';
      defaultMaterial = 'Road Freight Truck';
    } else if (type === 'waste_disposal') {
      defaultUnit = 'kg';
      defaultMaterial = 'General Waste';
    } else if (type === 'business_travel') {
      defaultUnit = 'passenger-km';
      defaultMaterial = 'Train';
    } else if (type === 'employee_commuting') {
      defaultUnit = 'passenger-km';
      defaultMaterial = 'Car';
    }

    setFormData((prev) => ({
      ...prev,
      activityType: type,
      unit: defaultUnit,
      material: defaultMaterial,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError('Please select or create an active company first.');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Determine material/mode payload based on activity type
      let selectedMaterial = formData.material;
      let desc = formData.description;

      if (formData.activityType === 'business_travel') {
        selectedMaterial = formData.travelMode;
        desc = `[Travel Mode: ${formData.travelMode}] ${formData.description}`.trim();
      } else if (formData.activityType === 'employee_commuting') {
        selectedMaterial = formData.commuteMode;
        desc = `[Commute Mode: ${formData.commuteMode}] ${formData.description}`.trim();
      } else if (formData.activityType === 'waste_disposal') {
        selectedMaterial = formData.wasteType;
        desc = `[Waste Category: ${formData.wasteType}] ${formData.description}`.trim();
      } else if (formData.activityType === 'freight_transport' || formData.activityType === 'downstream_transport') {
        selectedMaterial = formData.transportMode;
        desc = `[Transport Mode: ${formData.transportMode}, Distance: ${formData.distance || 0} km] ${formData.description}`.trim();
      }

      const payload = {
        companyId,
        supplierId: formData.supplierId || null,
        activityType: formData.activityType,
        material: selectedMaterial || null,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        distance: formData.distance !== undefined && formData.distance !== null && formData.distance !== '' ? Number(formData.distance) : null,
        description: desc,
        date: formData.date,
      };

      const response = await activityService.createActivity(payload);

      if (response.success) {
        setReceipt({
          activity: response.data,
          meta: response.meta,
        });
        if (onSuccess) onSuccess(response.data);
      }
    } catch (err) {
      console.error('[ActivityForm] Submission error:', err);
      setError(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setReceipt(null);
    setFormData({
      supplierId: '',
      activityType: 'purchased_material',
      material: 'Aluminium',
      transportMode: 'Road Freight Truck',
      travelMode: 'Train',
      commuteMode: 'Car',
      distance: '',
      wasteType: 'General Waste',
      quantity: '',
      unit: 'kg',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  if (receipt) {
    const act = receipt.activity;
    const meta = receipt.meta;

    return (
      <div className="p-6 rounded-card border border-primary/40 bg-carbon-card space-y-6 shadow-glow animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/20 text-primary border border-primary/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Activity Calculation Receipt</h3>
            <p className="text-xs text-text-secondary">
              Backend carbon engine deterministically resolved Scope classification and emissions
            </p>
          </div>
        </div>

        {/* Calculation Result Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-card bg-carbon-surface border border-carbon-border">
          <div>
            <p className="text-xs font-mono text-text-muted uppercase">Scope Determination</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge scope={act.scope} size="md">
                Scope {act.scope}
              </Badge>
              {act.scope === 3 && act.scope3Category && (
                <span className="text-xs text-text-secondary font-mono font-semibold">
                  Category {act.scope3Category}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-text-muted uppercase">Calculated Emissions</p>
            <p className="text-2xl font-extrabold font-mono text-primary mt-0.5">
              {formatEmissions(act.emissions)}
            </p>
          </div>

          <div>
            <p className="text-xs font-mono text-text-muted uppercase">Emission Factor Used</p>
            <p className="text-sm font-semibold font-mono text-text-primary mt-1">
              {act.emissionFactor} {meta?.factorUnit || 'kgCO2e/unit'}
            </p>
            {meta?.factorSource && (
              <p className="text-[10px] text-text-muted mt-0.5">Source: {meta.factorSource}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-mono text-text-muted uppercase">Activity & Material / Mode</p>
            <p className="text-sm font-semibold text-text-primary capitalize mt-1">
              {act.activityType?.replace(/_/g, ' ')} {act.material ? `• ${act.material}` : ''}
            </p>
            <p className="text-xs text-text-muted">
              {act.quantity} {act.unit} ({formatDate(act.date)})
            </p>
          </div>
        </div>

        {meta?.classificationReason && (
          <div className="p-3 rounded-btn bg-carbon-surface border border-carbon-border flex items-start gap-2 text-xs text-text-secondary">
            <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span>AI Classification Note: {meta.classificationReason}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={resetForm} variant="primary" icon={Plus}>
            Add Another Activity
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-card border border-carbon-border bg-carbon-card space-y-6">
      <div>
        <h3 className="text-lg font-bold text-text-primary">Record Raw Activity Parameters</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Select activity type to reveal dynamic required fields. The backend computes Scope, Emission Factors, and total emissions.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Activity Type Selector Grid */}
      <div>
        <label className="block text-xs font-mono text-text-muted uppercase mb-2">
          1. Select Activity Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'purchased_material', label: 'Purchased Material', icon: Package },
            { id: 'freight_transport', label: 'Upstream Freight', icon: Truck },
            { id: 'downstream_transport', label: 'Downstream Transport', icon: Navigation },
            { id: 'electricity', label: 'Grid Electricity', icon: Zap },
            { id: 'diesel_combustion', label: 'Diesel Fuel', icon: Flame },
            { id: 'natural_gas', label: 'Natural Gas', icon: Flame },
            { id: 'waste_disposal', label: 'Waste Disposal', icon: Trash2 },
            { id: 'business_travel', label: 'Business Travel', icon: Briefcase },
            { id: 'employee_commuting', label: 'Employee Commuting', icon: Car },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = formData.activityType === type.id;
            return (
              <button
                type="button"
                key={type.id}
                onClick={() => handleActivityTypeChange(type.id)}
                className={`p-3 rounded-btn border text-left flex flex-col items-start gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary font-semibold shadow-glow'
                    : 'bg-carbon-surface border-carbon-border text-text-secondary hover:bg-carbon-hover'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                <span className="text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-carbon-border">
        {/* Active Company */}
        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Active Organization
          </label>
          <input
            type="text"
            disabled
            value={activeCompany?.name || 'Selected Company'}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface/60 border border-carbon-border text-xs text-text-muted cursor-not-allowed font-medium"
          />
        </div>

        {/* Supplier Selector (For Purchased Material & Upstream Freight) */}
        {['purchased_material', 'freight_transport'].includes(formData.activityType) && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Supplier (Optional)
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">No Supplier (Direct / Facility Activity)</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.materials?.join(', ') || 'General'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Material Selection (For Purchased Material) */}
        {formData.activityType === 'purchased_material' && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Material *
            </label>
            <select
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
            >
              <option value="Aluminium">Aluminium</option>
              <option value="Copper">Copper</option>
              <option value="Steel">Steel</option>
              <option value="Stainless Steel">Stainless Steel</option>
              <option value="Plastic">Plastic</option>
              <option value="Glass">Glass</option>
              <option value="Paper">Paper</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Cement">Cement</option>
              <option value="Concrete">Concrete</option>
              <option value="Rubber">Rubber</option>
              <option value="Textile">Textile</option>
              <option value="Wood">Wood</option>
            </select>
          </div>
        )}

        {/* Travel Mode (For Business Travel) */}
        {formData.activityType === 'business_travel' && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Travel Mode *
            </label>
            <select
              value={formData.travelMode}
              onChange={(e) => setFormData({ ...formData, travelMode: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
            >
              <option value="Car">Car</option>
              <option value="Taxi">Taxi</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Domestic Flight">Domestic Flight</option>
              <option value="International Flight">International Flight</option>
            </select>
          </div>
        )}

        {/* Commute Mode (For Employee Commuting) */}
        {formData.activityType === 'employee_commuting' && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Commute Mode *
            </label>
            <select
              value={formData.commuteMode}
              onChange={(e) => setFormData({ ...formData, commuteMode: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
            >
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
            </select>
          </div>
        )}

        {/* Waste Stream (For Waste Disposal) */}
        {formData.activityType === 'waste_disposal' && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Waste Material *
            </label>
            <select
              value={formData.wasteType}
              onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
            >
              <option value="General Waste">General Waste</option>
              <option value="Plastic Waste">Plastic Waste</option>
              <option value="Paper Waste">Paper Waste</option>
              <option value="Cardboard Waste">Cardboard Waste</option>
              <option value="Metal Waste">Metal Waste</option>
              <option value="Glass Waste">Glass Waste</option>
              <option value="Wood Waste">Wood Waste</option>
            </select>
          </div>
        )}

        {/* Transport Mode (For Upstream Freight & Downstream Transport) */}
        {['freight_transport', 'downstream_transport'].includes(formData.activityType) && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Transport Mode
            </label>
            <select
              value={formData.transportMode}
              onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
            >
              <option value="Road Freight Truck">Road Freight Truck</option>
              <option value="Rail Freight">Rail Freight</option>
              <option value="Air Freight Cargo">Air Freight Cargo</option>
              <option value="Ocean Cargo Container Vessel">Ocean Cargo Container Vessel</option>
            </select>
          </div>
        )}

        {/* Transport Distance (For Purchased Material, Upstream Freight & Downstream Transport) */}
        {['purchased_material', 'freight_transport', 'downstream_transport'].includes(formData.activityType) && (
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
              Transport Distance (km) {formData.activityType === 'purchased_material' ? '*' : ''}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 450"
              required={formData.activityType === 'purchased_material'}
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono font-medium"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Quantity *
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 5000"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Unit Selector */}
        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
          >
            {['business_travel', 'employee_commuting'].includes(formData.activityType) ? (
              <option value="passenger-km">passenger-km</option>
            ) : formData.activityType === 'waste_disposal' ? (
              <>
                <option value="kg">kg (kilograms)</option>
                <option value="tonne">tonne (metric tons)</option>
              </>
            ) : ['freight_transport', 'downstream_transport'].includes(formData.activityType) ? (
              <>
                <option value="ton-km">ton-km</option>
                <option value="km">km</option>
              </>
            ) : (
              <>
                <option value="kg">kg (kilograms)</option>
                <option value="tonne">tonne (metric tons)</option>
                <option value="kWh">kWh (kilowatt hours)</option>
                <option value="liters">liters</option>
                <option value="m3">m3 (cubic meters)</option>
              </>
            )}
          </select>
        </div>

        {/* Activity Date */}
        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Activity Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          Calculate & Record Emissions
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
