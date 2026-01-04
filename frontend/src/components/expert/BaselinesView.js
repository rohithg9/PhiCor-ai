import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { HeartPulse, Search, ChevronRight, Eye, Calculator } from 'lucide-react';

const SCALE_LEVELS = [
  { id: 'geometry', name: 'Geometry', fullName: 'Geometric / Anatomical', icon: '📐' },
  { id: 'pressures', name: 'Pressures', fullName: 'Pressures / Hemodynamics', icon: '💨' },
  { id: 'structure', name: 'Structure', fullName: 'Structural / Tissue', icon: '🧱' },
  { id: 'physiology', name: 'Physiology', fullName: 'Physiological Functions', icon: '⚡' },
  { id: 'cellular', name: 'Cellular', fullName: 'Cellular / Molecular', icon: '🔬' },
  { id: 'labTests', name: 'Lab Tests', fullName: 'Laboratory Values', icon: '🧪' },
  { id: 'imaging', name: 'Imaging', fullName: 'Imaging Findings', icon: '📷' },
  { id: 'ecg', name: 'ECG', fullName: 'ECG / Electrocardiogram', icon: '📈' },
  { id: 'vitals', name: 'Vitals', fullName: 'Vital Signs', icon: '❤️' },
  { id: 'physical', name: 'Physical', fullName: 'Physical Exam Findings', icon: '👁️' }
];

const BaselinesView = ({
  ORGAN_MODELS,
  ORGAN_ICONS,
  baselinesOrgan,
  setBaselinesOrgan,
  baselinesScale,
  setBaselinesScale,
  baselinesSearch,
  setBaselinesSearch,
  filteredBaselinesParams,
  onParameterClick
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-green-500" />
                Normal Baseline Parameters
              </CardTitle>
              <CardDescription>Review and verify standard parameter values for healthy individuals</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">
                {Object.keys(ORGAN_MODELS).length}
              </p>
              <p className="text-xs text-muted-foreground">Organ Systems</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Organ Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Organs</CardTitle>
            <CardDescription>Select an organ system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search parameters..."
                value={baselinesSearch}
                onChange={(e) => setBaselinesSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {Object.entries(ORGAN_MODELS).map(([organId, organ]) => {
                  const Icon = ORGAN_ICONS[organId] || ORGAN_ICONS.default;
                  const paramCount = SCALE_LEVELS.reduce((total, scale) => {
                    return total + (organ[scale.id]?.parameters?.length || 0);
                  }, 0);
                  
                  return (
                    <Button
                      key={organId}
                      variant={baselinesOrgan === organId ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto py-2 px-2"
                      onClick={() => { setBaselinesOrgan(organId); setBaselinesScale(null); }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{organ.name}</div>
                        <div className="text-xs text-muted-foreground">{paramCount} parameters</div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Parameters View */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {ORGAN_MODELS[baselinesOrgan]?.name || 'Select Organ'}
                  <Badge variant="outline" className="text-xs">{baselinesOrgan}</Badge>
                </CardTitle>
                <CardDescription>Standard physiological values</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Scale Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
              {SCALE_LEVELS.map((scale) => {
                const hasData = ORGAN_MODELS[baselinesOrgan]?.[scale.id];
                if (!hasData) return null;
                
                const paramCount = hasData.parameters?.length || 0;
                
                return (
                  <Button
                    key={scale.id}
                    variant={baselinesScale === scale.id ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBaselinesScale(baselinesScale === scale.id ? null : scale.id)}
                  >
                    <span className="mr-1">{scale.icon}</span>
                    {scale.name}
                    <Badge variant="outline" className="ml-1 text-[10px]">{paramCount}</Badge>
                  </Button>
                );
              })}
            </div>

            {/* Parameters Grid */}
            <ScrollArea className="h-[500px]">
              {!baselinesScale ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a scale to view parameters</p>
                  <p className="text-sm mt-2">Choose from Geometry, Pressures, ECG, etc.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <span>{SCALE_LEVELS.find(s => s.id === baselinesScale)?.icon}</span>
                      {SCALE_LEVELS.find(s => s.id === baselinesScale)?.fullName}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {filteredBaselinesParams.length} parameters
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredBaselinesParams.map(param => (
                      <div
                        key={param.id}
                        className="p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 relative group"
                        onClick={() => onParameterClick(param)}
                      >
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to suggest change
                        </div>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500" />
                        <span className="text-sm font-medium text-foreground mb-2 block">{param.name}</span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-2xl font-bold text-green-500">
                            {typeof param.value === 'number' ? param.value.toFixed(param.value % 1 === 0 ? 0 : 1) : param.value}
                          </span>
                          <span className="text-sm text-muted-foreground">{param.unit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Range: {param.range?.[0]} - {param.range?.[1]} {param.unit}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-600">
                            {param.evidence || 'Established'}
                          </Badge>
                          {param.source && (
                            <Badge variant="outline" className="text-[10px]">
                              {param.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Equations section */}
                  {ORGAN_MODELS[baselinesOrgan]?.[baselinesScale]?.equations?.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Mathematical Equations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ORGAN_MODELS[baselinesOrgan][baselinesScale].equations.map(eq => (
                          <div key={eq.id} className="p-3 bg-muted/30 rounded-lg border">
                            <p className="font-medium text-sm">{eq.name}</p>
                            <div className="font-mono text-xs bg-background p-2 rounded mt-2 overflow-x-auto">
                              {eq.latex}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{eq.description}</p>
                            <Badge variant={eq.evidence === 'established' ? 'default' : 'secondary'} className="text-[10px] mt-2">
                              {eq.evidence} • {eq.source}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BaselinesView;
