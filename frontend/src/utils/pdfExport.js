/**
 * PhiCor.ai PDF Export Utility
 * Generates beautifully styled PDF reports maintaining the brand design
 */

import jsPDF from 'jspdf';

// PhiCor Brand Colors
const COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  accent: '#8B5CF6',       // Purple
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  dark: '#1F2937',         // Dark gray
  light: '#F9FAFB',        // Light gray
  text: '#111827',         // Text
  textLight: '#6B7280',    // Light text
  border: '#E5E7EB',       // Border
};

// Helper to draw rounded rectangles
const drawRoundedRect = (doc, x, y, width, height, radius, fillColor, strokeColor = null) => {
  doc.setFillColor(fillColor);
  if (strokeColor) {
    doc.setDrawColor(strokeColor);
    doc.roundedRect(x, y, width, height, radius, radius, 'FD');
  } else {
    doc.roundedRect(x, y, width, height, radius, radius, 'F');
  }
};

// Draw PhiCor Logo
const drawLogo = (doc, x, y, size = 40) => {
  // Draw the phi symbol circle
  doc.setFillColor(COLORS.primary);
  doc.circle(x + size/2, y + size/2, size/2, 'F');
  
  // Draw inner design (simplified phi symbol)
  doc.setFillColor('#FFFFFF');
  doc.setFontSize(size * 0.6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#FFFFFF');
  doc.text('φ', x + size/2 - size*0.15, y + size/2 + size*0.2);
  
  // Draw "PhiCor.ai" text
  doc.setTextColor(COLORS.text);
  doc.setFontSize(size * 0.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PhiCor', x + size + 5, y + size/2 - 2);
  doc.setFontSize(size * 0.35);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  doc.text('Mathematical Health Intelligence', x + size + 5, y + size/2 + 8);
};

// Draw a section header
const drawSectionHeader = (doc, title, y, pageWidth) => {
  const margin = 20;
  doc.setFillColor(COLORS.primary);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), margin + 5, y + 5.5);
  return y + 12;
};

// Draw a stat card
const drawStatCard = (doc, x, y, width, height, label, value, unit = '', color = COLORS.primary) => {
  drawRoundedRect(doc, x, y, width, height, 3, '#F8FAFC', COLORS.border);
  
  doc.setTextColor(color);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${value}${unit}`, x + width/2, y + height/2 - 2, { align: 'center' });
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + width/2, y + height/2 + 8, { align: 'center' });
};

// Draw a parameter effect row
const drawParameterRow = (doc, x, y, width, param) => {
  const change = param.quantified_change;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const color = isNegative ? COLORS.secondary : isPositive ? COLORS.warning : COLORS.textLight;
  
  // Background
  drawRoundedRect(doc, x, y, width, 18, 2, '#F8FAFC');
  
  // Parameter name
  doc.setTextColor(COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(param.parameter_name || param.parameter, x + 5, y + 7);
  
  // Mechanism (truncated)
  if (param.mechanism) {
    doc.setTextColor(COLORS.textLight);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const mechanism = param.mechanism.length > 50 ? param.mechanism.substring(0, 47) + '...' : param.mechanism;
    doc.text(mechanism, x + 5, y + 14);
  }
  
  // Quantified change
  if (change !== null && change !== undefined) {
    const changeText = `${isPositive ? '+' : ''}${change} ${param.change_unit || ''}`;
    doc.setTextColor(color);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(changeText, x + width - 5, y + 10, { align: 'right' });
  }
  
  return y + 20;
};

// Draw an ingredient row
const drawIngredientRow = (doc, x, y, width, ingredient, index) => {
  const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
  drawRoundedRect(doc, x, y, width, 14, 2, bgColor);
  
  // Ingredient name
  doc.setTextColor(COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(ingredient.ingredient_name, x + 5, y + 9);
  
  // DB Match indicator
  if (ingredient.found_in_db) {
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(7);
    doc.text('✓ DB Match', x + width - 30, y + 9);
  }
  
  // Amount
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(8);
  doc.text(`${ingredient.amount_g}g`, x + width - 5, y + 9, { align: 'right' });
  
  return y + 16;
};

/**
 * Generate Food Analysis PDF
 */
export const generateFoodAnalysisPDF = (analysisData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;
  
  // Header with logo
  drawLogo(doc, margin, y, 30);
  
  // Report title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Food Analysis Report', pageWidth - margin, y + 15, { align: 'right' });
  
  // Date
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  }), pageWidth - margin, y + 22, { align: 'right' });
  
  y += 45;
  
  // Food name card
  drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 25, 4, COLORS.primary);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(analysisData.product_name || 'Food Analysis', pageWidth/2, y + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysisData.serving_size || '1 serving'} | ${analysisData.category || 'Food'}`, pageWidth/2, y + 18, { align: 'center' });
  
  y += 35;
  
  // Patient Profile (if provided)
  if (patientProfile && (patientProfile.height || patientProfile.weight || patientProfile.age)) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth);
    const cardWidth = (pageWidth - margin * 2 - 10) / 4;
    
    if (patientProfile.height) {
      drawStatCard(doc, margin, y, cardWidth, 25, 'Height', patientProfile.height, 'cm');
    }
    if (patientProfile.weight) {
      drawStatCard(doc, margin + cardWidth + 3, y, cardWidth, 25, 'Weight', patientProfile.weight, 'kg');
    }
    if (patientProfile.age) {
      drawStatCard(doc, margin + (cardWidth + 3) * 2, y, cardWidth, 25, 'Age', patientProfile.age, 'yrs');
    }
    if (patientProfile.bmi) {
      drawStatCard(doc, margin + (cardWidth + 3) * 3, y, cardWidth, 25, 'BMI', patientProfile.bmi.toFixed(1), '');
    }
    y += 32;
  }
  
  // Nutritional Summary
  y = drawSectionHeader(doc, 'Nutritional Profile', y, pageWidth);
  const macros = analysisData.complete_nutritional_profile?.macronutrients || {};
  const cardWidth = (pageWidth - margin * 2 - 15) / 4;
  
  drawStatCard(doc, margin, y, cardWidth, 30, 'Calories', Math.round(macros.energy_kcal || 0), 'kcal', COLORS.warning);
  drawStatCard(doc, margin + cardWidth + 5, y, cardWidth, 30, 'Protein', (macros.protein_g || 0).toFixed(1), 'g', COLORS.secondary);
  drawStatCard(doc, margin + (cardWidth + 5) * 2, y, cardWidth, 30, 'Carbs', (macros.carbohydrates_g || 0).toFixed(1), 'g', COLORS.primary);
  drawStatCard(doc, margin + (cardWidth + 5) * 3, y, cardWidth, 30, 'Fat', (macros.fat_total_g || 0).toFixed(1), 'g', COLORS.accent);
  
  y += 38;
  
  // Health Score
  const healthScore = analysisData.clinical_summary?.healthfulness_score || 70;
  const scoreColor = healthScore >= 70 ? COLORS.secondary : healthScore >= 50 ? COLORS.warning : COLORS.danger;
  
  drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 20, 3, '#F8FAFC', COLORS.border);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Score:', margin + 5, y + 12);
  doc.setTextColor(scoreColor);
  doc.setFontSize(14);
  doc.text(`${healthScore}/100`, margin + 45, y + 12);
  
  // Score bar
  const barWidth = pageWidth - margin * 2 - 80;
  const barX = margin + 70;
  doc.setFillColor(COLORS.border);
  doc.roundedRect(barX, y + 7, barWidth, 6, 2, 2, 'F');
  doc.setFillColor(scoreColor);
  doc.roundedRect(barX, y + 7, barWidth * (healthScore / 100), 6, 2, 2, 'F');
  
  y += 28;
  
  // Ingredient Breakdown (if recipe)
  if (analysisData.is_recipe && analysisData.ingredient_breakdown) {
    y = drawSectionHeader(doc, `Ingredient Breakdown (${analysisData.ingredient_breakdown.total_ingredients} items)`, y, pageWidth);
    
    const allIngredients = [
      ...(analysisData.ingredient_breakdown.primary_ingredients || []),
      ...(analysisData.ingredient_breakdown.secondary_ingredients || [])
    ].slice(0, 8);
    
    allIngredients.forEach((ing, i) => {
      y = drawIngredientRow(doc, margin, y, pageWidth - margin * 2, ing, i);
    });
    
    if (analysisData.ingredient_breakdown.spices_seasonings?.length > 0) {
      doc.setTextColor(COLORS.textLight);
      doc.setFontSize(8);
      doc.text(`Spices: ${analysisData.ingredient_breakdown.spices_seasonings.join(', ')}`, margin, y + 5);
      y += 10;
    }
    
    y += 5;
  }
  
  // Check if we need a new page
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }
  
  // Organ System Effects
  const organEffects = analysisData.organ_system_parameter_effects || {};
  const organSystems = Object.keys(organEffects).slice(0, 4);
  
  if (organSystems.length > 0) {
    y = drawSectionHeader(doc, 'Parameter Effects by Organ System', y, pageWidth);
    
    organSystems.forEach(system => {
      const data = organEffects[system];
      const params = (data.parameters_affected || []).slice(0, 3);
      
      if (params.length > 0) {
        // System header
        doc.setTextColor(COLORS.primary);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(system.replace(/_/g, ' ').toUpperCase(), margin, y + 5);
        y += 8;
        
        params.forEach(param => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          y = drawParameterRow(doc, margin, y, pageWidth - margin * 2, param);
        });
        
        y += 5;
      }
    });
  }
  
  // Clinical Summary
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }
  
  y = drawSectionHeader(doc, 'Clinical Summary', y, pageWidth);
  
  const benefits = analysisData.clinical_summary?.key_benefits || [];
  const concerns = analysisData.clinical_summary?.key_concerns || [];
  
  if (benefits.length > 0) {
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Benefits:', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    benefits.slice(0, 3).forEach((b, i) => {
      doc.text(`• ${b}`, margin + 5, y + 12 + i * 5);
    });
    y += 12 + benefits.slice(0, 3).length * 5;
  }
  
  if (concerns.length > 0) {
    doc.setTextColor(COLORS.warning);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Concerns:', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    concerns.slice(0, 3).forEach((c, i) => {
      doc.text(`• ${c}`, margin + 5, y + 12 + i * 5);
    });
  }
  
  // Footer
  doc.setFillColor(COLORS.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.text('Generated by PhiCor.ai - Mathematical Health Intelligence Platform', pageWidth/2, pageHeight - 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('This report is for informational purposes only and should not replace professional medical advice.', pageWidth/2, pageHeight - 3, { align: 'center' });
  
  return doc;
};

/**
 * Generate Drug Analysis PDF
 */
export const generateDrugAnalysisPDF = (drugData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;
  
  // Header
  drawLogo(doc, margin, y, 30);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Drug Analysis Report', pageWidth - margin, y + 15, { align: 'right' });
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), pageWidth - margin, y + 22, { align: 'right' });
  
  y += 45;
  
  // Drug name card
  drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 30, 4, COLORS.accent);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(drugData.name || 'Drug Analysis', pageWidth/2, y + 12, { align: 'center' });
  if (drugData.generic_name) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generic: ${drugData.generic_name}`, pageWidth/2, y + 22, { align: 'center' });
  }
  
  y += 40;
  
  // Patient Profile
  if (patientProfile) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth);
    const cardWidth = (pageWidth - margin * 2 - 10) / 4;
    if (patientProfile.height) drawStatCard(doc, margin, y, cardWidth, 25, 'Height', patientProfile.height, 'cm');
    if (patientProfile.weight) drawStatCard(doc, margin + cardWidth + 3, y, cardWidth, 25, 'Weight', patientProfile.weight, 'kg');
    if (patientProfile.age) drawStatCard(doc, margin + (cardWidth + 3) * 2, y, cardWidth, 25, 'Age', patientProfile.age, 'yrs');
    y += 32;
  }
  
  // Drug Information
  y = drawSectionHeader(doc, 'Drug Information', y, pageWidth);
  
  const infoItems = [
    { label: 'Drug Class', value: drugData.drug_class || drugData.category || 'N/A' },
    { label: 'Mechanism', value: drugData.mechanism_of_action || 'N/A' },
    { label: 'Indications', value: Array.isArray(drugData.indications) ? drugData.indications.slice(0, 3).join(', ') : (drugData.indications || 'N/A') },
  ];
  
  infoItems.forEach(item => {
    drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 15, 2, '#F8FAFC');
    doc.setTextColor(COLORS.textLight);
    doc.setFontSize(8);
    doc.text(item.label, margin + 5, y + 6);
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const valueText = item.value.length > 80 ? item.value.substring(0, 77) + '...' : item.value;
    doc.text(valueText, margin + 5, y + 12);
    y += 17;
  });
  
  y += 5;
  
  // Parameter Effects
  if (drugData.parameter_effects || drugData.organ_system_effects) {
    y = drawSectionHeader(doc, 'Parameter Effects', y, pageWidth);
    const effects = drugData.parameter_effects || drugData.organ_system_effects || {};
    
    Object.entries(effects).slice(0, 4).forEach(([system, data]) => {
      doc.setTextColor(COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(system.replace(/_/g, ' ').toUpperCase(), margin, y + 5);
      y += 8;
      
      const params = Array.isArray(data) ? data : (data.parameters_affected || []);
      params.slice(0, 2).forEach(param => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }
        y = drawParameterRow(doc, margin, y, pageWidth - margin * 2, param);
      });
      y += 3;
    });
  }
  
  // Side Effects & Warnings
  if (drugData.side_effects || drugData.warnings) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    
    y = drawSectionHeader(doc, 'Safety Information', y, pageWidth);
    
    if (drugData.side_effects) {
      doc.setTextColor(COLORS.warning);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Common Side Effects:', margin, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text);
      const sideEffects = Array.isArray(drugData.side_effects) ? drugData.side_effects : [drugData.side_effects];
      sideEffects.slice(0, 4).forEach((se, i) => {
        doc.text(`• ${se}`, margin + 5, y + 12 + i * 5);
      });
      y += 15 + sideEffects.slice(0, 4).length * 5;
    }
  }
  
  // Footer
  doc.setFillColor(COLORS.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.text('Generated by PhiCor.ai - Mathematical Health Intelligence Platform', pageWidth/2, pageHeight - 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('This report is for informational purposes only. Always consult healthcare professionals.', pageWidth/2, pageHeight - 3, { align: 'center' });
  
  return doc;
};

/**
 * Generate Differential Diagnosis PDF
 */
export const generateDiagnosisPDF = (diagnosisData, patientInput = '', patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;
  
  // Header
  drawLogo(doc, margin, y, 30);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Differential Diagnosis Report', pageWidth - margin, y + 15, { align: 'right' });
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), pageWidth - margin, y + 22, { align: 'right' });
  
  y += 45;
  
  // Patient Profile
  if (patientProfile) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth);
    const cardWidth = (pageWidth - margin * 2 - 15) / 5;
    if (patientProfile.age) drawStatCard(doc, margin, y, cardWidth, 25, 'Age', patientProfile.age, 'yrs');
    if (patientProfile.gender) drawStatCard(doc, margin + cardWidth + 3, y, cardWidth, 25, 'Gender', patientProfile.gender, '');
    if (patientProfile.height) drawStatCard(doc, margin + (cardWidth + 3) * 2, y, cardWidth, 25, 'Height', patientProfile.height, 'cm');
    if (patientProfile.weight) drawStatCard(doc, margin + (cardWidth + 3) * 3, y, cardWidth, 25, 'Weight', patientProfile.weight, 'kg');
    y += 32;
  }
  
  // Clinical Input
  if (patientInput) {
    y = drawSectionHeader(doc, 'Clinical Presentation', y, pageWidth);
    drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 30, 3, '#F8FAFC', COLORS.border);
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(patientInput, pageWidth - margin * 2 - 10);
    doc.text(lines.slice(0, 4), margin + 5, y + 8);
    y += 35;
  }
  
  // Differential Diagnoses
  y = drawSectionHeader(doc, 'Differential Diagnoses', y, pageWidth);
  
  const diagnoses = diagnosisData.differentials || diagnosisData.diagnoses || [];
  diagnoses.slice(0, 6).forEach((dx, i) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    
    const probability = dx.probability || dx.confidence || dx.likelihood || 0;
    const probColor = probability >= 70 ? COLORS.danger : probability >= 40 ? COLORS.warning : COLORS.secondary;
    
    drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 22, 3, '#F8FAFC', COLORS.border);
    
    // Rank number
    doc.setFillColor(COLORS.primary);
    doc.circle(margin + 8, y + 11, 6, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}`, margin + 8, y + 13, { align: 'center' });
    
    // Diagnosis name
    doc.setTextColor(COLORS.text);
    doc.setFontSize(11);
    doc.text(dx.name || dx.disease || dx.condition || 'Unknown', margin + 20, y + 10);
    
    // Supporting evidence
    if (dx.supporting_findings || dx.evidence) {
      doc.setTextColor(COLORS.textLight);
      doc.setFontSize(8);
      const evidence = dx.supporting_findings || dx.evidence;
      const evidenceText = Array.isArray(evidence) ? evidence.slice(0, 2).join(', ') : evidence;
      doc.text(evidenceText.substring(0, 60) + (evidenceText.length > 60 ? '...' : ''), margin + 20, y + 17);
    }
    
    // Probability
    doc.setTextColor(probColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${Math.round(probability)}%`, pageWidth - margin - 5, y + 12, { align: 'right' });
    
    y += 26;
  });
  
  // Recommended Workup
  if (diagnosisData.recommended_workup || diagnosisData.suggested_tests) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    
    y = drawSectionHeader(doc, 'Recommended Workup', y, pageWidth);
    const tests = diagnosisData.recommended_workup || diagnosisData.suggested_tests || [];
    const testList = Array.isArray(tests) ? tests : [tests];
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    testList.slice(0, 6).forEach((test, i) => {
      doc.text(`• ${typeof test === 'object' ? test.name || test.test : test}`, margin + 5, y + 5 + i * 5);
    });
  }
  
  // Footer
  doc.setFillColor(COLORS.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.text('Generated by PhiCor.ai - Mathematical Health Intelligence Platform', pageWidth/2, pageHeight - 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('This is a clinical decision support tool. Always confirm with appropriate diagnostic testing.', pageWidth/2, pageHeight - 3, { align: 'center' });
  
  return doc;
};

/**
 * Generate Disease Analysis PDF
 */
export const generateDiseaseAnalysisPDF = (diseaseData, patientProfile = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;
  
  // Header
  drawLogo(doc, margin, y, 30);
  doc.setTextColor(COLORS.text);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Disease Analysis Report', pageWidth - margin, y + 15, { align: 'right' });
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), pageWidth - margin, y + 22, { align: 'right' });
  
  y += 45;
  
  // Disease name card
  drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 25, 4, COLORS.danger);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(diseaseData.name || 'Disease Analysis', pageWidth/2, y + 10, { align: 'center' });
  if (diseaseData.icd_code || diseaseData.category) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${diseaseData.icd_code ? 'ICD: ' + diseaseData.icd_code : ''} ${diseaseData.category ? '| ' + diseaseData.category : ''}`, pageWidth/2, y + 18, { align: 'center' });
  }
  
  y += 35;
  
  // Patient Profile
  if (patientProfile) {
    y = drawSectionHeader(doc, 'Patient Profile', y, pageWidth);
    const cardWidth = (pageWidth - margin * 2 - 10) / 4;
    if (patientProfile.age) drawStatCard(doc, margin, y, cardWidth, 25, 'Age', patientProfile.age, 'yrs');
    if (patientProfile.gender) drawStatCard(doc, margin + cardWidth + 3, y, cardWidth, 25, 'Gender', patientProfile.gender, '');
    if (patientProfile.height) drawStatCard(doc, margin + (cardWidth + 3) * 2, y, cardWidth, 25, 'Height', patientProfile.height, 'cm');
    if (patientProfile.weight) drawStatCard(doc, margin + (cardWidth + 3) * 3, y, cardWidth, 25, 'Weight', patientProfile.weight, 'kg');
    y += 32;
  }
  
  // Disease Description
  if (diseaseData.description) {
    y = drawSectionHeader(doc, 'Overview', y, pageWidth);
    drawRoundedRect(doc, margin, y, pageWidth - margin * 2, 25, 3, '#F8FAFC');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(diseaseData.description, pageWidth - margin * 2 - 10);
    doc.text(lines.slice(0, 4), margin + 5, y + 8);
    y += 30;
  }
  
  // Affected Parameters
  if (diseaseData.affected_parameters || diseaseData.parameter_effects) {
    y = drawSectionHeader(doc, 'Affected Clinical Parameters', y, pageWidth);
    const params = diseaseData.affected_parameters || diseaseData.parameter_effects || [];
    const paramList = Array.isArray(params) ? params : Object.entries(params).map(([k, v]) => ({ parameter: k, ...v }));
    
    paramList.slice(0, 6).forEach(param => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }
      y = drawParameterRow(doc, margin, y, pageWidth - margin * 2, param);
    });
    y += 5;
  }
  
  // Symptoms
  if (diseaseData.symptoms) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    
    y = drawSectionHeader(doc, 'Common Symptoms', y, pageWidth);
    const symptoms = Array.isArray(diseaseData.symptoms) ? diseaseData.symptoms : [diseaseData.symptoms];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    symptoms.slice(0, 6).forEach((s, i) => {
      doc.text(`• ${typeof s === 'object' ? s.name || s.symptom : s}`, margin + 5, y + 5 + i * 5);
    });
    y += 10 + symptoms.slice(0, 6).length * 5;
  }
  
  // Treatment Options
  if (diseaseData.treatments || diseaseData.management) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    
    y = drawSectionHeader(doc, 'Treatment Options', y, pageWidth);
    const treatments = diseaseData.treatments || diseaseData.management || [];
    const treatList = Array.isArray(treatments) ? treatments : [treatments];
    doc.setTextColor(COLORS.text);
    doc.setFontSize(9);
    treatList.slice(0, 5).forEach((t, i) => {
      doc.text(`• ${typeof t === 'object' ? t.name || t.treatment : t}`, margin + 5, y + 5 + i * 5);
    });
  }
  
  // Footer
  doc.setFillColor(COLORS.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(8);
  doc.text('Generated by PhiCor.ai - Mathematical Health Intelligence Platform', pageWidth/2, pageHeight - 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('This report is for informational purposes only. Consult healthcare professionals for diagnosis and treatment.', pageWidth/2, pageHeight - 3, { align: 'center' });
  
  return doc;
};

/**
 * Download PDF
 */
export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};

/**
 * Get PDF as blob for sharing
 */
export const getPDFBlob = (doc) => {
  return doc.output('blob');
};

/**
 * Share PDF via Web Share API
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
        console.error('Share failed:', error);
        return { success: false, error: error.message };
      }
      return { success: false, cancelled: true };
    }
  } else {
    // Fallback to download
    downloadPDF(doc, filename);
    return { success: true, fallback: 'download' };
  }
};
