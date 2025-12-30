import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, Syringe, Play, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Input } from './ui/input';

const DrugBuilder = ({ drugs, onSimulate }) => {
  const [selectedDrug, setSelectedDrug] = useState('');
  const [dosage, setDosage] = useState(500);
  const [frequency, setFrequency] = useState('once');
  const [duration, setDuration] = useState(24);
  const [route, setRoute] = useState('oral');
  const [loading, setLoading] = useState(false);

  const frequencyOptions = [
    { value: 'once', label: 'Single dose' },
    { value: 'every_6h', label: 'Every 6 hours' },
    { value: 'every_8h', label: 'Every 8 hours' },
    { value: 'every_12h', label: 'Every 12 hours' },
    { value: 'daily', label: 'Once daily' }
  ];

  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'iv', label: 'Intravenous (IV)' },
    { value: 'im', label: 'Intramuscular (IM)' },
    { value: 'sc', label: 'Subcutaneous (SC)' }
  ];

  const handleSimulate = async () => {
    if (!selectedDrug) return;
    
    setLoading(true);
    await onSimulate({
      drug_name: selectedDrug,
      dosage: dosage,
      frequency: frequency,
      duration_hours: duration,
      route: route
    });
    setLoading(false);
  };

  const handleReset = () => {
    setSelectedDrug('');
    setDosage(500);
    setFrequency('once');
    setDuration(24);
    setRoute('oral');
  };

  const selectedDrugInfo = drugs?.find(d => d.id === selectedDrug);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-manrope font-semibold flex items-center gap-2">
          <Pill className="w-4 h-4 text-chart-4" />
          Influence Builder
        </h3>
        {selectedDrug && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Drug Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Drug</Label>
        <Select value={selectedDrug} onValueChange={setSelectedDrug}>
          <SelectTrigger data-testid="drug-select">
            <SelectValue placeholder="Select drug..." />
          </SelectTrigger>
          <SelectContent>
            {drugs?.map((drug) => (
              <SelectItem key={drug.id} value={drug.id}>
                {drug.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDrug && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Drug Info */}
          {selectedDrugInfo && (
            <div className="p-3 rounded-lg bg-white/5 text-xs">
              <p className="text-muted-foreground">
                {selectedDrugInfo.mechanisms_count} mechanisms • 
                Max {selectedDrugInfo.max_daily_dose_mg}mg/day
              </p>
            </div>
          )}

          {/* Dosage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Dosage</Label>
              <span className="text-sm font-mono">{dosage} mg</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={dosage}
                onChange={(e) => setDosage(Number(e.target.value))}
                className="w-24"
                min={0}
                max={selectedDrugInfo?.max_daily_dose_mg || 4000}
                data-testid="dosage-input"
              />
              <Slider
                value={[dosage]}
                onValueChange={([v]) => setDosage(v)}
                max={selectedDrugInfo?.max_daily_dose_mg || 2000}
                step={50}
                className="flex-1"
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger data-testid="frequency-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Route */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Syringe className="w-3 h-3" />
              Route
            </Label>
            <Select value={route} onValueChange={setRoute}>
              <SelectTrigger data-testid="route-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <span className="text-sm font-mono">{duration}h</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([v]) => setDuration(v)}
              max={72}
              min={1}
              step={1}
              className="w-full"
              data-testid="duration-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>24h</span>
              <span>72h</span>
            </div>
          </div>

          {/* Simulate Button */}
          <Button
            onClick={handleSimulate}
            disabled={loading || !selectedDrug}
            className="w-full glow-primary"
            data-testid="simulate-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Simulating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Apply Influence
              </span>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default DrugBuilder;
