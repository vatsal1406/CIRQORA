import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { supplierService } from '../../services/supplierService';

const SupplierForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    materials: ['Aluminium'],
    cost: '',
    capacity: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const availableMaterials = ['Aluminium', 'Copper', 'Steel', 'Polymer', 'Packaging', 'Other'];

  const toggleMaterial = (mat) => {
    if (formData.materials.includes(mat)) {
      setFormData({
        ...formData,
        materials: formData.materials.filter((m) => m !== mat),
      });
    } else {
      setFormData({
        ...formData,
        materials: [...formData.materials, mat],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        materials: formData.materials,
        cost: formData.cost ? Number(formData.cost) : 0,
        capacity: formData.capacity ? Number(formData.capacity) : 0,
      };

      const res = await supplierService.createSupplier(payload);

      if (res.success) {
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      console.error('[SupplierForm] Error creating supplier:', err);
      setError(err.message || 'Failed to create supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-mono text-text-muted uppercase mb-1">
          Supplier Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. HindMet Aluminium Works"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-mono text-text-muted uppercase mb-1">
          Location / Region
        </label>
        <input
          type="text"
          placeholder="e.g. Duisburg, Germany"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Materials Checkboxes */}
      <div>
        <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">
          Supplied Materials
        </label>
        <div className="flex flex-wrap gap-2">
          {availableMaterials.map((mat) => {
            const isSelected = formData.materials.includes(mat);
            return (
              <button
                type="button"
                key={mat}
                onClick={() => toggleMaterial(mat)}
                className={`px-3 py-1 rounded-btn text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-secondary/20 text-secondary border-secondary/50 font-semibold'
                    : 'bg-carbon-surface text-text-secondary border-carbon-border hover:bg-carbon-hover'
                }`}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost & Capacity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Unit Cost ($/unit)
          </label>
          <input
            type="number"
            placeholder="e.g. 1200"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted uppercase mb-1">
            Capacity (tonnes/yr)
          </label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-carbon-border">
        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={submitting}>
          Create Supplier
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
