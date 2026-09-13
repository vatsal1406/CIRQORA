import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle, Leaf } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { companyService } from '../services/companyService';
import { useCompany } from '../hooks/useCompany';

const Setup = () => {
  const navigate = useNavigate();
  const { addCompany } = useCompany();

  const [formData, setFormData] = useState({
    name: '',
    industry: 'General Manufacturing',
    location: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await companyService.createCompany(formData);

      if (res.success && res.data) {
        addCompany(res.data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[Setup] Error creating company:', err);
      setError(err.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-card bg-primary/10 border border-primary/30 text-primary shadow-glow mb-2">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Company Carbon Profile Setup
          </h1>
          <p className="text-xs text-text-secondary">
            Register your organization to start tracking supply chain carbon emissions and circular opportunities.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-btn bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Company Name */}
            <div>
              <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Industrial Systems"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-btn bg-carbon-surface border border-carbon-border text-sm text-text-primary focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-btn bg-carbon-surface border border-carbon-border text-sm text-text-primary focus:outline-none focus:border-primary font-medium"
              >
                <option value="General Manufacturing">General Manufacturing</option>
                <option value="Automotive & Mobility">Automotive & Mobility</option>
                <option value="Electronics & Hardware">Electronics & Hardware</option>
                <option value="Aerospace & Defense">Aerospace & Defense</option>
                <option value="Packaging & Logistics">Packaging & Logistics</option>
                <option value="Construction & Materials">Construction & Materials</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                Headquarters / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Frankfurt, Germany"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-btn bg-carbon-surface border border-carbon-border text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-carbon-border">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Skip / Go to Dashboard
              </button>
              <Button type="submit" variant="primary" icon={ArrowRight} loading={submitting}>
                Save & Continue
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
