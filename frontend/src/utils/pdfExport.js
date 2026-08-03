/**
 * PhiCor.ai Comprehensive PDF Export Utility
 * Generates detailed PDF reports with ALL analysis data
 */

import jsPDF from 'jspdf';

// PhiCor Brand Colors
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#1F2937',
  light: '#F9FAFB',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
};

// Helper to add a new page if needed
const checkPageBreak = (doc, y, requiredSpace = 40) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 25; // Return new Y position
  }
  return y;
};

// Draw PhiCor Logo - Large and prominent
const drawLogo = (doc, x, y, size = 50) => {
  // Blue circle background
  doc.setFillColor(COLORS.primary);
  doc.circle(x + size/2, y + size/2, size/2, 'F');
  
  // Phi symbol in white
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(size * 0.5);
  doc.setFont('helvetica', 'bold');
  doc.text('φ', x + size/2 - size*0.12, y + size/2 + size*0.15);
  
  // "PhiCor" text
  doc.setTextColor(COLORS.text);
  doc.setFontSize(size * 0.45);
  doc.setFont('helvetica', 'bold');
  doc.text('PhiCor', x + size + 8, y + size/2);
  
  // Tagline
  doc.setFontSize(size * 0.22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  doc.text('Mathematical Health Intelligence', x + size + 8, y + size/2 + size*0.25);
};

// Draw section header with colored bar
const drawSectionHeader = (doc, title, y, pageWidth, color = COLORS.primary) => {
  const margin = 15;
  doc.setFillColor(color);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), margin + 4, y + 5.5);
  return y + 12;
};

// Draw a metric card
const drawMetricCard = (doc, x, y, width, height, label, value, unit = '', color = COLORS.primary) => {
  // Card background
  doc.setFillColor('#F8FAFC');
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  
  // Value
  doc.setTextColor(color);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const valueText = `${value}${unit}`;
  doc.text(valueText, x + width/2, y + height/2 - 1, { align: 'center' });
  
  // Label
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + width/2, y + height/2 + 7, { align: 'center' });
};

// Draw a data row
const drawDataRow = (doc, x, y, width, label, value, bgColor = '#F8FAFC') => {
  doc.setFillColor(bgColor);
  doc.rect(x, y, width, 10, 'F');
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + 3, y + 6.5);
  
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  const valueStr = String(value || 'N/A');
  doc.text(valueStr.substring(0, 60), x + width - 3, y + 6.5, { align: 'right' });
  
  return y + 11;
};

// Draw parameter effect with visual indicator
const drawParameterEffect = (doc, x, y, width, param) => {
  const change = param.quantified_change;
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  // Determine color based on direction and context
  let valueColor = COLORS.textLight;
  if (param.direction === 'increase') {
    valueColor = COLORS.warning;
  } else if (param.direction === 'decrease') {
    valueColor = COLORS.secondary;
  }
  
  // Background
  doc.setFillColor('#FAFAFA');
  doc.setDrawColor('#E5E7EB');
  doc.roundedRect(x, y, width, 22, 2, 2, 'FD');
  
  // Parameter name
  doc.setTextColor(COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const paramName = param.parameter_name || param.parameter || 'Unknown';
  doc.text(paramName.substring(0, 35), x + 4, y + 7);
  
  // Mechanism (if exists)
  if (param.mechanism) {
    doc.setTextColor(COLORS.textLight);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const mechanism = param.mechanism.substring(0, 55) + (param.mechanism.length > 55 ? '...' : '');
    doc.text(mechanism, x + 4, y + 13);
  }
  
  // Source nutrient/ingredient
  if (param.from_nutrient || param.from_ingredients) {
    doc.setTextColor(COLORS.primary);
    doc.setFontSize(6);
    const source = param.from_ingredients?.join(', ') || param.from_nutrient || '';
    doc.text(`via: ${source.substring(0, 40)}`, x + 4, y + 18);
  }
  
  // Quantified change
  if (change !== null && change !== undefined) {
    const sign = isPositive ? '+' : '';
    const changeText = `${sign}${change} ${param.change_unit || ''}`;
    doc.setTextColor(valueColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(changeText, x + width - 4, y + 12, { align: 'right' });
  }
  
  // Reference range (if exists)
  if (param.reference?.normal_range) {
    doc.setTextColor(COLORS.textLight);
    doc.setFontSize(6);
    doc.text(`Normal: ${param.reference.normal_range}`, x + width - 4, y + 18, { align: 'right' });
  }
  
  return y + 24;
};

// Draw ingredient row
const drawIngredientRow = (doc, x, y, width, ing, index) => {
  const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
  doc.setFillColor(bgColor);
  doc.rect(x, y, width, 12, 'F');
  
  // Primary indicator
  if (ing.is_primary) {
    doc.setFillColor(COLORS.primary);
    doc.circle(x + 5, y + 6, 2, 'F');
  } else {
    doc.setDrawColor(COLORS.border);
    doc.circle(x + 5, y + 6, 2, 'S');
  }
  
  // Ingredient name
  doc.setTextColor(COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(ing.ingredient_name || 'Unknown', x + 12, y + 7);
  
  // DB match indicator
  if (ing.found_in_db) {
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(6);
    doc.text('✓ Matched', x + width - 35, y + 7);
  }
  
  // Amount
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(7);
  doc.text(`${ing.amount_g}g`, x + width - 5, y + 7, { align: 'right' });
  
  return y + 13;
};

// Draw footer
const drawFooter = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor(COLORS.dark);
  doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
  
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PhiCor.ai - Mathematical Health Intelligence Platform', pageWidth/2, pageHeight - 11, { align: 'center' });
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is for informational purposes only and should not replace professional medical advice.', pageWidth/2, pageHeight - 6, { align: 'center' });
  
  // Page number
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 15, pageHeight - 6);
};

/**
 * Generate Comprehensive Food Analysis PDF
 * Includes ALL tabs: Overview, Nutritional Profile, Organ Systems, Interactions
 */
export const generateFoodAnalysisPDF = (analysisData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  
  // ===== PAGE 1: HEADER & OVERVIEW =====
  
  // Large Logo
  drawLogo(doc, margin, y, 40);
  
  // Report Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Food Analysis Report', pageWidth - margin, y + 20, { align: 'right' });
  
  // Date
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  }), pageWidth - margin, y + 28, { align: 'right' });
  
  y += 50;
  
  // Food Name Banner
  doc.setFillColor(COLORS.primary);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(analysisData.product_name || 'Food Analysis', pageWidth/2, y + 11, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const servingInfo = `${analysisData.serving_size || '1 serving'} | ${analysisData.category || 'Food'}`;
  doc.text(servingInfo, pageWidth/2, y + 20, { align: 'center' });
  
  y += 35;
  
  // Health Score
  const healthScore = analysisData.clinical_summary?.healthfulness_score || 70;
  const scoreColor = healthScore >= 70 ? COLORS.secondary : healthScore >= 50 ? COLORS.warning : COLORS.danger;
  
  doc.setFillColor('#F8FAFC');
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, 'FD');
  
  doc.setTextColor(COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Score:', margin + 5, y + 13);
  
  doc.setTextColor(scoreColor);
  doc.setFontSize(16);
  doc.text(`${healthScore}/100`, margin + 45, y + 13);
  
  // Score bar
  const barWidth = pageWidth - margin * 2 - 90;
  const barX = margin + 75;
  doc.setFillColor('#E5E7EB');
  doc.roundedRect(barX, y + 8, barWidth, 6, 2, 2, 'F');
  doc.setFillColor(scoreColor);
  doc.roundedRect(barX, y + 8, barWidth * (healthScore / 100), 6, 2, 2, 'F');
  
  y += 30;
  
  // Patient Profile (if provided)
  if (patientProfile && (patientProfile.height || patientProfile.weight || patientProfile.age)) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth, COLORS.accent);
    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    
    if (patientProfile.age) drawMetricCard(doc, margin, y, cardWidth, 25, 'Age', patientProfile.age, ' yrs');
    if (patientProfile.height) drawMetricCard(doc, margin + cardWidth + 5, y, cardWidth, 25, 'Height', patientProfile.height, ' cm');
    if (patientProfile.weight) drawMetricCard(doc, margin + (cardWidth + 5) * 2, y, cardWidth, 25, 'Weight', patientProfile.weight, ' kg');
    if (patientProfile.bmi) drawMetricCard(doc, margin + (cardWidth + 5) * 3, y, cardWidth, 25, 'BMI', patientProfile.bmi.toFixed(1), '', 
      patientProfile.bmi < 18.5 || patientProfile.bmi > 25 ? COLORS.warning : COLORS.secondary);
    y += 32;
  }
  
  // ===== COMPLETE NUTRITIONAL PROFILE =====
  y = drawSectionHeader(doc, 'Complete Nutritional Profile', y, pageWidth, COLORS.secondary);
  
  const macros = analysisData.complete_nutritional_profile?.macronutrients || {};
  const electrolytes = analysisData.complete_nutritional_profile?.electrolytes || {};
  
  // Macronutrients - 4 columns
  const cardW = (pageWidth - margin * 2 - 15) / 4;
  drawMetricCard(doc, margin, y, cardW, 28, 'Calories', Math.round(macros.energy_kcal || 0), ' kcal', COLORS.warning);
  drawMetricCard(doc, margin + cardW + 5, y, cardW, 28, 'Protein', (macros.protein_g || 0).toFixed(1), 'g', COLORS.secondary);
  drawMetricCard(doc, margin + (cardW + 5) * 2, y, cardW, 28, 'Carbohydrates', (macros.carbohydrates_g || 0).toFixed(1), 'g', COLORS.primary);
  drawMetricCard(doc, margin + (cardW + 5) * 3, y, cardW, 28, 'Total Fat', (macros.fat_total_g || 0).toFixed(1), 'g', COLORS.accent);
  y += 32;
  
  // Second row - more nutrients
  drawMetricCard(doc, margin, y, cardW, 25, 'Fiber', (macros.fiber_g || 0).toFixed(1), 'g');
  drawMetricCard(doc, margin + cardW + 5, y, cardW, 25, 'Sugars', (macros.sugars_g || 0).toFixed(1), 'g');
  drawMetricCard(doc, margin + (cardW + 5) * 2, y, cardW, 25, 'Sat. Fat', (macros.fat_saturated_g || 0).toFixed(1), 'g');
  drawMetricCard(doc, margin + (cardW + 5) * 3, y, cardW, 25, 'Cholesterol', Math.round(macros.cholesterol_mg || 0), 'mg');
  y += 30;
  
  // Electrolytes
  if (Object.keys(electrolytes).length > 0) {
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Electrolytes & Minerals', margin, y + 3);
    y += 8;
    
    drawMetricCard(doc, margin, y, cardW, 25, 'Sodium', Math.round(electrolytes.sodium_mg || 0), 'mg', 
      electrolytes.sodium_mg > 500 ? COLORS.warning : COLORS.textLight);
    drawMetricCard(doc, margin + cardW + 5, y, cardW, 25, 'Potassium', Math.round(electrolytes.potassium_mg || 0), 'mg');
    drawMetricCard(doc, margin + (cardW + 5) * 2, y, cardW, 25, 'Calcium', Math.round(electrolytes.calcium_mg || 0), 'mg');
    drawMetricCard(doc, margin + (cardW + 5) * 3, y, cardW, 25, 'Magnesium', Math.round(electrolytes.magnesium_mg || 0), 'mg');
    y += 30;
  }
  
  // ===== INGREDIENT BREAKDOWN (if recipe) =====
  if (analysisData.is_recipe && analysisData.ingredient_breakdown) {
    y = checkPageBreak(doc, y, 60);
    y = drawSectionHeader(doc, `Ingredient Breakdown (${analysisData.ingredient_breakdown.total_ingredients} items)`, y, pageWidth, COLORS.primary);
    
    // Primary ingredients
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Primary Ingredients:', margin, y + 3);
    y += 7;
    
    const primaryIngs = analysisData.ingredient_breakdown.primary_ingredients || [];
    primaryIngs.forEach((ing, i) => {
      y = checkPageBreak(doc, y, 15);
      y = drawIngredientRow(doc, margin, y, pageWidth - margin * 2, ing, i);
    });
    
    // Secondary ingredients
    const secondaryIngs = analysisData.ingredient_breakdown.secondary_ingredients || [];
    if (secondaryIngs.length > 0) {
      y += 3;
      doc.setTextColor(COLORS.textLight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Secondary Ingredients:', margin, y + 3);
      y += 7;
      
      secondaryIngs.forEach((ing, i) => {
        y = checkPageBreak(doc, y, 15);
        y = drawIngredientRow(doc, margin, y, pageWidth - margin * 2, ing, i);
      });
    }
    
    // Spices
    const spices = analysisData.ingredient_breakdown.spices_seasonings || [];
    if (spices.length > 0) {
      y += 3;
      doc.setTextColor(COLORS.warning);
      doc.setFontSize(7);
      doc.text(`Spices & Seasonings: ${spices.join(', ')}`, margin, y + 3);
      y += 8;
    }
  }
  
  // ===== CLINICAL SUMMARY =====
  y = checkPageBreak(doc, y, 50);
  y = drawSectionHeader(doc, 'Clinical Summary', y, pageWidth, COLORS.secondary);
  
  const benefits = analysisData.clinical_summary?.key_benefits || [];
  const concerns = analysisData.clinical_summary?.key_concerns || [];
  
  // Benefits
  if (benefits.length > 0) {
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Benefits:', margin, y + 3);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    benefits.forEach(b => {
      y = checkPageBreak(doc, y, 8);
      doc.text(`• ${b}`, margin + 3, y + 3);
      y += 5;
    });
    y += 3;
  }
  
  // Concerns
  if (concerns.length > 0) {
    doc.setTextColor(COLORS.warning);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Concerns:', margin, y + 3);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    concerns.forEach(c => {
      y = checkPageBreak(doc, y, 8);
      doc.text(`• ${c}`, margin + 3, y + 3);
      y += 5;
    });
    y += 3;
  }
  
  // ===== ORGAN SYSTEM PARAMETER EFFECTS - ALL SYSTEMS =====
  const organEffects = analysisData.organ_system_parameter_effects || {};
  const organSystems = Object.keys(organEffects);
  
  if (organSystems.length > 0) {
    // New page for organ systems
    doc.addPage();
    y = 15;
    
    // Section header
    doc.setFillColor(COLORS.primary);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ORGAN SYSTEM PARAMETER EFFECTS', pageWidth/2, y + 8, { align: 'center' });
    y += 18;
    
    // Iterate through ALL organ systems
    organSystems.forEach(system => {
      const data = organEffects[system];
      const params = data.parameters_affected || [];
      
      if (params.length > 0) {
        y = checkPageBreak(doc, y, 40);
        
        // System header with effect indicator
        const effect = data.overall_effect || 'neutral';
        const effectColor = effect === 'beneficial' ? COLORS.secondary : 
                          effect === 'caution' ? COLORS.warning : COLORS.textLight;
        
        doc.setFillColor(effectColor);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, 'F');
        doc.setTextColor('#FFFFFF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        const systemName = system.replace(/_/g, ' ').toUpperCase();
        doc.text(`${systemName} (${params.length} parameters)`, margin + 4, y + 7);
        
        doc.setFontSize(8);
        doc.text(effect.toUpperCase(), pageWidth - margin - 4, y + 7, { align: 'right' });
        y += 14;
        
        // ALL parameters in this system
        params.forEach(param => {
          y = checkPageBreak(doc, y, 26);
          y = drawParameterEffect(doc, margin, y, pageWidth - margin * 2, param);
        });
        
        y += 5;
      }
    });
  }
  
  // ===== DISEASE INTERACTIONS =====
  const diseaseInt = analysisData.disease_interactions || {};
  const hasInteractions = diseaseInt.beneficial?.length > 0 || diseaseInt.caution?.length > 0 || diseaseInt.contraindicated?.length > 0;
  
  if (hasInteractions) {
    y = checkPageBreak(doc, y, 60);
    y = drawSectionHeader(doc, 'Disease Interactions', y, pageWidth, COLORS.accent);
    
    // Beneficial
    if (diseaseInt.beneficial?.length > 0) {
      doc.setTextColor(COLORS.secondary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Beneficial for:', margin, y + 3);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text);
      diseaseInt.beneficial.slice(0, 5).forEach(int => {
        y = checkPageBreak(doc, y, 6);
        doc.text(`• ${int.condition || int.disease || 'Unknown'}`, margin + 3, y + 3);
        y += 5;
      });
      y += 3;
    }
    
    // Caution
    if (diseaseInt.caution?.length > 0) {
      doc.setTextColor(COLORS.warning);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Use with caution:', margin, y + 3);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text);
      diseaseInt.caution.slice(0, 5).forEach(int => {
        y = checkPageBreak(doc, y, 6);
        doc.text(`• ${int.condition || int.disease || 'Unknown'}`, margin + 3, y + 3);
        y += 5;
      });
      y += 3;
    }
    
    // Contraindicated
    if (diseaseInt.contraindicated?.length > 0) {
      doc.setTextColor(COLORS.danger);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Contraindicated:', margin, y + 3);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text);
      diseaseInt.contraindicated.slice(0, 5).forEach(int => {
        y = checkPageBreak(doc, y, 6);
        doc.text(`• ${int.condition || int.disease || 'Unknown'}`, margin + 3, y + 3);
        y += 5;
      });
    }
  }
  
  // ===== DRUG INTERACTIONS =====
  const drugInt = analysisData.drug_interactions || [];
  if (drugInt.length > 0) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Drug Interactions', y, pageWidth, COLORS.danger);
    
    drugInt.slice(0, 8).forEach(int => {
      y = checkPageBreak(doc, y, 12);
      doc.setFillColor('#FEF2F2');
      doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
      
      doc.setTextColor(COLORS.danger);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(int.drug || int.name || 'Unknown drug', margin + 3, y + 6);
      
      if (int.interaction) {
        doc.setTextColor(COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(int.interaction.substring(0, 50), pageWidth - margin - 3, y + 6, { align: 'right' });
      }
      y += 12;
    });
  }
  
  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }
  
  return doc;
};

/**
 * Generate Comprehensive Drug Analysis PDF
 */
export const generateDrugAnalysisPDF = (drugData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  
  // Header with logo
  drawLogo(doc, margin, y, 40);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Drug Analysis Report', pageWidth - margin, y + 20, { align: 'right' });
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, y + 28, { align: 'right' });
  
  y += 50;
  
  // Drug name banner
  doc.setFillColor(COLORS.accent);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(drugData.name || 'Drug', pageWidth/2, y + 12, { align: 'center' });
  
  if (drugData.generic_name || drugData.brand_names) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const subText = drugData.generic_name || drugData.brand_names?.join(', ') || '';
    doc.text(subText.substring(0, 60), pageWidth/2, y + 22, { align: 'center' });
  }
  
  y += 40;
  
  // Drug class badges
  if (drugData.drug_class || drugData.category) {
    doc.setFillColor('#EDE9FE');
    doc.roundedRect(margin, y, 50, 8, 2, 2, 'F');
    doc.setTextColor(COLORS.accent);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(drugData.drug_class || drugData.category || '', margin + 25, y + 5.5, { align: 'center' });
    y += 15;
  }
  
  // Patient profile
  if (patientProfile) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth, COLORS.accent);
    const cardW = (pageWidth - margin * 2 - 10) / 4;
    if (patientProfile.age) drawMetricCard(doc, margin, y, cardW, 25, 'Age', patientProfile.age, ' yrs');
    if (patientProfile.weight) drawMetricCard(doc, margin + cardW + 3, y, cardW, 25, 'Weight', patientProfile.weight, ' kg');
    if (patientProfile.height) drawMetricCard(doc, margin + (cardW + 3) * 2, y, cardW, 25, 'Height', patientProfile.height, ' cm');
    y += 32;
  }
  
  // Drug Information
  y = drawSectionHeader(doc, 'Drug Information', y, pageWidth, COLORS.primary);
  
  y = drawDataRow(doc, margin, y, pageWidth - margin * 2, 'Drug Class', drugData.drug_class || 'N/A');
  y = drawDataRow(doc, margin, y, pageWidth - margin * 2, 'Category', drugData.category || 'N/A', '#FFFFFF');
  
  // Mechanism of Action
  if (drugData.mechanism_of_action) {
    y += 3;
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Mechanism of Action:', margin, y + 3);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const lines = doc.splitTextToSize(drugData.mechanism_of_action, pageWidth - margin * 2 - 5);
    doc.text(lines.slice(0, 4), margin + 2, y + 3);
    y += lines.slice(0, 4).length * 4 + 5;
  }
  
  // Indications
  if (drugData.indications) {
    y = drawSectionHeader(doc, 'Indications', y, pageWidth, COLORS.secondary);
    const indications = Array.isArray(drugData.indications) ? drugData.indications : [drugData.indications];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    indications.slice(0, 8).forEach(ind => {
      y = checkPageBreak(doc, y, 6);
      doc.text(`• ${ind}`, margin + 3, y + 3);
      y += 5;
    });
    y += 3;
  }
  
  // Contraindications
  if (drugData.contraindications) {
    y = checkPageBreak(doc, y, 40);
    y = drawSectionHeader(doc, 'Contraindications', y, pageWidth, COLORS.danger);
    const contras = Array.isArray(drugData.contraindications) ? drugData.contraindications : [drugData.contraindications];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    contras.slice(0, 8).forEach(c => {
      y = checkPageBreak(doc, y, 6);
      doc.text(`• ${c}`, margin + 3, y + 3);
      y += 5;
    });
    y += 3;
  }
  
  // Parameter Effects
  if (drugData.parameter_effects || drugData.organ_system_effects) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Parameter Effects', y, pageWidth, COLORS.primary);
    
    const effects = drugData.parameter_effects || drugData.organ_system_effects || {};
    Object.entries(effects).slice(0, 6).forEach(([system, data]) => {
      y = checkPageBreak(doc, y, 30);
      
      doc.setTextColor(COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(system.replace(/_/g, ' ').toUpperCase(), margin, y + 3);
      y += 6;
      
      const params = Array.isArray(data) ? data : (data.parameters_affected || []);
      params.slice(0, 4).forEach(param => {
        y = checkPageBreak(doc, y, 26);
        y = drawParameterEffect(doc, margin, y, pageWidth - margin * 2, param);
      });
      y += 3;
    });
  }
  
  // Side Effects
  if (drugData.side_effects) {
    y = checkPageBreak(doc, y, 40);
    y = drawSectionHeader(doc, 'Common Side Effects', y, pageWidth, COLORS.warning);
    const sideEffects = Array.isArray(drugData.side_effects) ? drugData.side_effects : [drugData.side_effects];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    sideEffects.slice(0, 10).forEach(se => {
      y = checkPageBreak(doc, y, 6);
      doc.text(`• ${se}`, margin + 3, y + 3);
      y += 5;
    });
  }
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }
  
  return doc;
};

/**
 * Generate Comprehensive Differential Diagnosis PDF
 */
export const generateDiagnosisPDF = (diagnosisData, patientInput = '', patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  
  // Header
  drawLogo(doc, margin, y, 40);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Differential Diagnosis Report', pageWidth - margin, y + 20, { align: 'right' });
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, y + 28, { align: 'right' });
  
  y += 50;
  
  // Patient Profile
  if (patientProfile && Object.values(patientProfile).some(v => v)) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth, COLORS.accent);
    const cardW = (pageWidth - margin * 2 - 15) / 5;
    if (patientProfile.age) drawMetricCard(doc, margin, y, cardW, 25, 'Age', patientProfile.age, ' yrs');
    if (patientProfile.gender) drawMetricCard(doc, margin + cardW + 3, y, cardW, 25, 'Gender', patientProfile.gender, '');
    if (patientProfile.height) drawMetricCard(doc, margin + (cardW + 3) * 2, y, cardW, 25, 'Height', patientProfile.height, ' cm');
    if (patientProfile.weight) drawMetricCard(doc, margin + (cardW + 3) * 3, y, cardW, 25, 'Weight', patientProfile.weight, ' kg');
    y += 32;
  }
  
  // Clinical Input
  if (patientInput) {
    y = drawSectionHeader(doc, 'Clinical Presentation', y, pageWidth, COLORS.primary);
    doc.setFillColor('#F8FAFC');
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'FD');
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(patientInput, pageWidth - margin * 2 - 10);
    doc.text(lines.slice(0, 5), margin + 5, y + 7);
    y += 35;
  }
  
  // Differential Diagnoses - ALL of them
  const diagnoses = diagnosisData.differentials || diagnosisData.diagnoses || [];
  
  if (diagnoses.length > 0) {
    y = drawSectionHeader(doc, `Differential Diagnoses (${diagnoses.length} conditions)`, y, pageWidth, COLORS.danger);
    
    diagnoses.forEach((dx, i) => {
      y = checkPageBreak(doc, y, 35);
      
      const probability = dx.probability || dx.probabilityScore || dx.confidence || dx.matchScore || 0;
      const probPercent = probability > 1 ? probability : probability * 100;
      const probColor = probPercent >= 70 ? COLORS.danger : probPercent >= 40 ? COLORS.warning : COLORS.secondary;
      
      // Diagnosis card
      doc.setFillColor('#F8FAFC');
      doc.setDrawColor(COLORS.border);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'FD');
      
      // Rank circle
      doc.setFillColor(COLORS.primary);
      doc.circle(margin + 8, y + 10, 6, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}`, margin + 8, y + 12, { align: 'center' });
      
      // Diagnosis name
      doc.setTextColor(COLORS.text);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const dxName = dx.name || dx.disease || dx.diseaseName || dx.condition || 'Unknown';
      doc.text(dxName.substring(0, 45), margin + 20, y + 10);
      
      // Supporting findings
      const findings = dx.supporting_findings || dx.matchedFindings || dx.evidence || [];
      if (findings.length > 0 || dx.reasoning) {
        doc.setTextColor(COLORS.textLight);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const findingsText = Array.isArray(findings) ? findings.slice(0, 3).join(', ') : (dx.reasoning || '');
        doc.text(findingsText.substring(0, 70), margin + 20, y + 17);
      }
      
      // Key discriminating features
      if (dx.key_features || dx.discriminating_features) {
        doc.setTextColor(COLORS.primary);
        doc.setFontSize(6);
        const features = dx.key_features || dx.discriminating_features || [];
        const featText = Array.isArray(features) ? features.slice(0, 2).join(', ') : features;
        doc.text(`Key: ${featText.substring(0, 50)}`, margin + 20, y + 23);
      }
      
      // Probability
      doc.setTextColor(probColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${Math.round(probPercent)}%`, pageWidth - margin - 5, y + 14, { align: 'right' });
      
      y += 32;
    });
  }
  
  // Recommended Workup
  const workup = diagnosisData.recommended_workup || diagnosisData.suggested_tests || diagnosisData.synthesis?.discriminating_tests || [];
  if (workup.length > 0) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Recommended Diagnostic Workup', y, pageWidth, COLORS.secondary);
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    workup.slice(0, 12).forEach((test, i) => {
      y = checkPageBreak(doc, y, 8);
      const testName = typeof test === 'object' ? (test.name || test.test) : test;
      doc.text(`${i + 1}. ${testName}`, margin + 3, y + 3);
      y += 6;
    });
  }
  
  // Synthesis/Summary
  if (diagnosisData.synthesis) {
    y = checkPageBreak(doc, y, 40);
    y = drawSectionHeader(doc, 'Clinical Synthesis', y, pageWidth, COLORS.accent);
    
    if (diagnosisData.synthesis.primary_impression) {
      doc.setTextColor(COLORS.text);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Primary Impression:', margin, y + 3);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(diagnosisData.synthesis.primary_impression, pageWidth - margin * 2 - 5);
      doc.text(lines.slice(0, 3), margin + 2, y + 8);
      y += 8 + lines.slice(0, 3).length * 4;
    }
  }
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }
  
  return doc;
};

/**
 * Generate Comprehensive Disease Analysis PDF
 */
export const generateDiseaseAnalysisPDF = (diseaseData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  
  // Header
  drawLogo(doc, margin, y, 40);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Disease Analysis Report', pageWidth - margin, y + 20, { align: 'right' });
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, y + 28, { align: 'right' });
  
  y += 50;
  
  // Disease name banner
  doc.setFillColor(COLORS.danger);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(diseaseData.name || 'Disease', pageWidth/2, y + 11, { align: 'center' });
  
  if (diseaseData.icd_code || diseaseData.category) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const subText = [diseaseData.icd_code ? `ICD: ${diseaseData.icd_code}` : '', diseaseData.category].filter(Boolean).join(' | ');
    doc.text(subText, pageWidth/2, y + 20, { align: 'center' });
  }
  
  y += 38;
  
  // Patient Profile
  if (patientProfile) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth, COLORS.accent);
    const cardW = (pageWidth - margin * 2 - 10) / 4;
    if (patientProfile.age) drawMetricCard(doc, margin, y, cardW, 25, 'Age', patientProfile.age, ' yrs');
    if (patientProfile.gender) drawMetricCard(doc, margin + cardW + 3, y, cardW, 25, 'Gender', patientProfile.gender, '');
    if (patientProfile.height) drawMetricCard(doc, margin + (cardW + 3) * 2, y, cardW, 25, 'Height', patientProfile.height, ' cm');
    if (patientProfile.weight) drawMetricCard(doc, margin + (cardW + 3) * 3, y, cardW, 25, 'Weight', patientProfile.weight, ' kg');
    y += 32;
  }
  
  // Disease Description
  if (diseaseData.description) {
    y = drawSectionHeader(doc, 'Overview', y, pageWidth, COLORS.primary);
    doc.setFillColor('#F8FAFC');
    doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(diseaseData.description, pageWidth - margin * 2 - 10);
    doc.text(lines.slice(0, 5), margin + 5, y + 7);
    y += 30;
  }
  
  // Affected Parameters - ALL
  if (diseaseData.affected_parameters || diseaseData.parameter_effects || diseaseData.parameter_modifications) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Affected Clinical Parameters', y, pageWidth, COLORS.warning);
    
    const params = diseaseData.affected_parameters || diseaseData.parameter_effects || [];
    const paramList = Array.isArray(params) ? params : Object.entries(params).map(([k, v]) => ({ parameter: k, ...v }));
    
    paramList.forEach(param => {
      y = checkPageBreak(doc, y, 26);
      y = drawParameterEffect(doc, margin, y, pageWidth - margin * 2, param);
    });
    y += 5;
  }
  
  // Symptoms
  if (diseaseData.symptoms) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Common Symptoms', y, pageWidth, COLORS.secondary);
    
    const symptoms = Array.isArray(diseaseData.symptoms) ? diseaseData.symptoms : [diseaseData.symptoms];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    symptoms.slice(0, 15).forEach(s => {
      y = checkPageBreak(doc, y, 6);
      const symptomText = typeof s === 'object' ? (s.name || s.symptom) : s;
      doc.text(`• ${symptomText}`, margin + 3, y + 3);
      y += 5;
    });
    y += 3;
  }
  
  // Treatment Options
  if (diseaseData.treatments || diseaseData.management) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, 'Treatment Options', y, pageWidth, COLORS.accent);
    
    const treatments = diseaseData.treatments || diseaseData.management || [];
    const treatList = Array.isArray(treatments) ? treatments : [treatments];
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    treatList.slice(0, 10).forEach(t => {
      y = checkPageBreak(doc, y, 6);
      const treatText = typeof t === 'object' ? (t.name || t.treatment) : t;
      doc.text(`• ${treatText}`, margin + 3, y + 3);
      y += 5;
    });
  }
  
  // Affected Organs
  if (diseaseData.affectedOrgans) {
    y = checkPageBreak(doc, y, 30);
    y = drawSectionHeader(doc, 'Affected Organ Systems', y, pageWidth, COLORS.danger);
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    diseaseData.affectedOrgans.forEach(org => {
      doc.text(`• ${org}`, margin + 3, y + 3);
      y += 5;
    });
  }
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }
  
  return doc;
};

/**
 * Download PDF
 */
export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};

/**
 * Get PDF as blob
 */
export const getPDFBlob = (doc) => {
  return doc.output('blob');
};

/**
 * Share PDF
 */
export const sharePDF = async (doc, filename, title = 'PhiCor Analysis Report') => {
  const blob = getPDFBlob(doc);
  const file = new File([blob], filename, { type: 'application/pdf' });
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: title,
        text: 'Check out this health analysis from PhiCor.ai',
        files: [file]
      });
      return { success: true };
    } catch (error) {
      if (error.name !== 'AbortError') {
        return { success: false, error: error.message };
      }
      return { success: false, cancelled: true };
    }
  } else {
    downloadPDF(doc, filename);
    return { success: true, fallback: 'download' };
  }
};
