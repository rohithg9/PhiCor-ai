#!/usr/bin/env python3
"""
PhiCor.ai Documentation PDF Generator
Generates a comprehensive PDF with screenshots and explanations
"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib import colors
from datetime import datetime
import os

# Colors
PRIMARY_COLOR = HexColor('#6366f1')
SECONDARY_COLOR = HexColor('#8b5cf6')
SUCCESS_COLOR = HexColor('#22c55e')
WARNING_COLOR = HexColor('#f59e0b')
DARK_BG = HexColor('#1a1a2e')

def create_phicor_pdf():
    """Generate the PhiCor.ai documentation PDF"""
    
    # Setup document
    pdf_path = "/app/PhiCor_Documentation.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=1*cm,
        leftMargin=1*cm,
        topMargin=1*cm,
        bottomMargin=1*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        spaceAfter=20,
        textColor=PRIMARY_COLOR,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        spaceAfter=30,
        textColor=colors.gray,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=18,
        spaceBefore=20,
        spaceAfter=10,
        textColor=PRIMARY_COLOR
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Heading3'],
        fontSize=14,
        spaceBefore=15,
        spaceAfter=8,
        textColor=SECONDARY_COLOR
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=10,
        alignment=TA_JUSTIFY
    )
    
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=10,
        leftIndent=20,
        spaceAfter=5
    )
    
    # Build content
    content = []
    
    # ===== COVER PAGE =====
    content.append(Spacer(1, 2*inch))
    content.append(Paragraph("PhiCor.ai", title_style))
    content.append(Paragraph("The Mathematical Human Body", subtitle_style))
    content.append(Spacer(1, 0.5*inch))
    content.append(Paragraph("Comprehensive Feature Documentation", heading_style))
    content.append(Spacer(1, 0.3*inch))
    
    # Cover stats
    stats_data = [
        ['1,977', '336+', '18', '10'],
        ['Disease Models', 'Drug Profiles', 'Organ Systems', 'Biological Scales']
    ]
    stats_table = Table(stats_data, colWidths=[3.5*cm]*4)
    stats_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, 0), 24),
        ('FONTSIZE', (0, 1), (-1, 1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 1), (-1, 1), colors.gray),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
    ]))
    content.append(stats_table)
    
    content.append(Spacer(1, 1*inch))
    content.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", subtitle_style))
    content.append(PageBreak())
    
    # ===== TABLE OF CONTENTS =====
    content.append(Paragraph("Table of Contents", heading_style))
    content.append(Spacer(1, 0.2*inch))
    
    toc_items = [
        "1. Overview",
        "2. Main Clinical Dashboard",
        "3. Disease Models with Examples",
        "4. Drug Engine",
        "5. Differential Diagnosis",
        "6. Expert Curation Portal",
        "7. Knowledge Bank",
        "8. User Management",
        "9. API Reference"
    ]
    for item in toc_items:
        content.append(Paragraph(item, body_style))
    content.append(PageBreak())
    
    # ===== SECTION 1: OVERVIEW =====
    content.append(Paragraph("1. Overview", heading_style))
    content.append(Paragraph(
        "PhiCor.ai is a comprehensive digital twin platform that mathematically models the human body "
        "across multiple biological scales. It provides clinicians, researchers, and medical experts "
        "with an interactive tool to explore physiological parameters, disease modifications, drug effects, "
        "and differential diagnoses.",
        body_style
    ))
    
    content.append(Paragraph("Key Features:", subheading_style))
    features = [
        "• <b>1,977 Disease Models</b> - AI-enhanced parameter modifications",
        "• <b>336+ Drug Profiles</b> - Complete physiological effects modeling",
        "• <b>18 Organ Systems</b> - Heart, Brain, Lungs, Liver, Kidneys, and more",
        "• <b>10 Biological Scales</b> - Geometry, Pressures, ECG, Cellular, Lab Tests, etc.",
        "• <b>Expert Curation System</b> - Medical accuracy validation by specialists",
        "• <b>Knowledge Bank</b> - AI-powered continuous updates from medical literature"
    ]
    for f in features:
        content.append(Paragraph(f, bullet_style))
    
    content.append(Paragraph("Technology Stack:", subheading_style))
    tech = [
        "• <b>Frontend:</b> React.js with Tailwind CSS & shadcn/ui",
        "• <b>Backend:</b> FastAPI (Python)",
        "• <b>Database:</b> MongoDB",
        "• <b>AI:</b> OpenAI GPT-4o via Emergent LLM Key"
    ]
    for t in tech:
        content.append(Paragraph(t, bullet_style))
    content.append(PageBreak())
    
    # ===== SECTION 2: MAIN CLINICAL DASHBOARD =====
    content.append(Paragraph("2. Main Clinical Dashboard", heading_style))
    content.append(Paragraph(
        "The main dashboard provides an interactive interface for exploring physiological parameters "
        "across all organ systems. Users can select organs from the body map, view parameters by scale, "
        "and apply disease modifications to see how values change.",
        body_style
    ))
    
    # Add dashboard screenshot if exists
    if os.path.exists('/tmp/pdf_2_dashboard.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_2_dashboard.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 2.1: Main Clinical Dashboard with organ selection and parameter display</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("Dashboard Components:", subheading_style))
    components = [
        "• <b>Body Map (Left):</b> Interactive visualization of 18 organ systems",
        "• <b>Parameter Grid (Center):</b> Multi-scale parameter display with values and ranges",
        "• <b>Disease Search (Top):</b> Search and apply disease modifications",
        "• <b>Feature Panels (Right):</b> Quick access to Drugs (ρ), Differentials (Δ), Calculator (λ), Timeline (Ω)"
    ]
    for c in components:
        content.append(Paragraph(c, bullet_style))
    content.append(PageBreak())
    
    # ===== SECTION 3: DISEASE MODELS =====
    content.append(Paragraph("3. Disease Models with Examples", heading_style))
    content.append(Paragraph(
        "PhiCor contains 1,977 disease models with AI-enhanced parameter modifications. Each disease "
        "includes detailed parameter changes across relevant organ systems and scales.",
        body_style
    ))
    
    # Add disease screenshot if exists
    if os.path.exists('/tmp/pdf_3_afib.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_3_afib.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 3.1: Atrial Fibrillation search results showing disease-specific parameters</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("Example: Atrial Fibrillation", subheading_style))
    content.append(Paragraph("When Atrial Fibrillation is applied, the following parameter modifications occur:", body_style))
    
    afib_mods = [
        ["Parameter", "Normal", "Modified", "Change"],
        ["PR Interval", "160 ms", "ABSENT", "No P waves"],
        ["Heart Rate", "72 bpm", "100-180 bpm", "Irregular"],
        ["QTc Interval", "420 ms", "480 ms", "+14.3%"],
        ["Cardiac Output", "5 L/min", "4.25 L/min", "-15%"],
        ["P Wave", "Present", "Absent", "Fibrillatory waves"]
    ]
    afib_table = Table(afib_mods, colWidths=[4*cm, 3*cm, 3.5*cm, 3*cm])
    afib_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
    ]))
    content.append(afib_table)
    content.append(PageBreak())
    
    # ===== SECTION 4: DRUG ENGINE =====
    content.append(Paragraph("4. Drug Engine", heading_style))
    content.append(Paragraph(
        "The Drug Engine contains 336+ drug profiles with detailed physiological effects. "
        "Drugs are categorized by therapeutic class and show how they modify body parameters.",
        body_style
    ))
    
    # Add drug screenshot if exists
    if os.path.exists('/tmp/pdf_4_drugs.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_4_drugs.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 4.1: Drug Engine showing 336 drugs across 12 categories</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("Drug Categories:", subheading_style))
    drug_cats = [
        "• <b>Cardiovascular:</b> ACE inhibitors, Beta-blockers, Antiarrhythmics, Diuretics",
        "• <b>Respiratory:</b> Bronchodilators, Corticosteroids, Antihistamines",
        "• <b>CNS:</b> Antidepressants, Antipsychotics, Anxiolytics, Anticonvulsants",
        "• <b>Antimicrobial:</b> Antibiotics, Antivirals, Antifungals",
        "• <b>Oncology:</b> Chemotherapeutics, Targeted therapies, Immunotherapies",
        "• <b>And more...</b> Endocrine, GI, Hematological, Analgesics, Psychiatric"
    ]
    for d in drug_cats:
        content.append(Paragraph(d, bullet_style))
    content.append(PageBreak())
    
    # ===== SECTION 5: DIFFERENTIAL DIAGNOSIS =====
    content.append(Paragraph("5. Differential Diagnosis", heading_style))
    content.append(Paragraph(
        "The AI-powered differential diagnosis panel analyzes abnormal parameters and generates "
        "a ranked list of possible diagnoses with probability scores and key distinguishing features.",
        body_style
    ))
    
    # Add differential screenshot if exists
    if os.path.exists('/tmp/pdf_5_differential.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_5_differential.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 5.1: Differential Diagnosis panel with organ-based analysis</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("How It Works:", subheading_style))
    diff_steps = [
        "1. Select an organ system with abnormal parameters",
        "2. AI analyzes the parameter pattern",
        "3. Generates ranked differential diagnoses",
        "4. Each diagnosis shows: probability score, supporting findings, differentiating features"
    ]
    for s in diff_steps:
        content.append(Paragraph(s, bullet_style))
    content.append(PageBreak())
    
    # ===== SECTION 6: EXPERT CURATION PORTAL =====
    content.append(Paragraph("6. Expert Curation Portal", heading_style))
    content.append(Paragraph(
        "The Expert Curation Portal allows medical specialists to review, verify, and update "
        "the platform's data. Experts can suggest changes to parameters, which are then reviewed "
        "and approved by administrators.",
        body_style
    ))
    
    # Add expert baselines screenshot if exists
    if os.path.exists('/tmp/pdf_6_expert_baselines.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_6_expert_baselines.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 6.1: Expert Dashboard - Baselines tab showing ECG parameters</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("Portal Tabs:", subheading_style))
    tabs = [
        "• <b>Baselines:</b> Review normal/standard parameters by organ and scale",
        "• <b>Diseases:</b> Review disease-specific parameter modifications (1,581 diseases)",
        "• <b>References:</b> Lab tests, guidelines, and protocols (396 items)",
        "• <b>Changes:</b> Pending change requests for approval",
        "• <b>Guidelines:</b> AI-detected guideline updates",
        "• <b>Lab:</b> Experiment sandbox for testing",
        "• <b>Knowledge:</b> Upload documents for AI analysis (Admin only)",
        "• <b>Users:</b> User management (Admin only)"
    ]
    for t in tabs:
        content.append(Paragraph(t, bullet_style))
    
    # Add diseases screenshot if exists
    if os.path.exists('/tmp/pdf_7_expert_diseases.png'):
        content.append(PageBreak())
        content.append(Paragraph("Disease Review:", subheading_style))
        img = Image('/tmp/pdf_7_expert_diseases.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 6.2: Diseases tab showing Heart Failure search with 1,581 total diseases</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    content.append(PageBreak())
    
    # ===== SECTION 7: KNOWLEDGE BANK =====
    content.append(Paragraph("7. Knowledge Bank", heading_style))
    content.append(Paragraph(
        "The Knowledge Bank allows administrators to upload medical documents, URLs, and text "
        "for AI analysis. The system automatically extracts parameter updates, guideline changes, "
        "and clinical modifications, creating suggestions for admin approval.",
        body_style
    ))
    
    # Add knowledge screenshot if exists
    if os.path.exists('/tmp/pdf_8_knowledge.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_8_knowledge.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 7.1: Knowledge Bank with AI-analyzed sources and pending suggestions</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("Features:", subheading_style))
    kb_features = [
        "• <b>Upload Sources:</b> URLs, PDFs, Documents, or direct text input",
        "• <b>AI Analysis:</b> GPT-4o extracts medical updates automatically",
        "• <b>Suggestions:</b> Review proposed changes with evidence levels and confidence scores",
        "• <b>Approval Workflow:</b> Approve or reject each suggestion",
        "• <b>Auto-Search:</b> Scheduled AI search for new guidelines (configurable 7-90 days)"
    ]
    for f in kb_features:
        content.append(Paragraph(f, bullet_style))
    content.append(PageBreak())
    
    # ===== SECTION 8: USER MANAGEMENT =====
    content.append(Paragraph("8. User Management", heading_style))
    content.append(Paragraph(
        "The User Management system allows Super Admins to create, edit, and manage user accounts. "
        "Users are assigned roles with different permission levels.",
        body_style
    ))
    
    # Add users screenshot if exists
    if os.path.exists('/tmp/pdf_9_users.png'):
        content.append(Spacer(1, 0.2*inch))
        img = Image('/tmp/pdf_9_users.png', width=16*cm, height=10*cm)
        content.append(img)
        content.append(Paragraph("<i>Figure 8.1: User Management showing 8 users with roles and specialties</i>", 
                                ParagraphStyle('Caption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.gray)))
    
    content.append(Paragraph("User Roles:", subheading_style))
    roles_data = [
        ["Role", "Permissions"],
        ["Expert", "View parameters, suggest changes, run experiments"],
        ["Admin", "All Expert + approve changes, view audit logs"],
        ["Super Admin", "All Admin + manage users, system settings"]
    ]
    roles_table = Table(roles_data, colWidths=[4*cm, 10*cm])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
    ]))
    content.append(roles_table)
    content.append(PageBreak())
    
    # ===== SECTION 9: API REFERENCE =====
    content.append(Paragraph("9. API Reference", heading_style))
    content.append(Paragraph(
        "PhiCor.ai provides a comprehensive REST API for integration with external systems. "
        "All protected endpoints require JWT authentication.",
        body_style
    ))
    
    content.append(Paragraph("Core Endpoints:", subheading_style))
    api_data = [
        ["Endpoint", "Method", "Description"],
        ["/api/experts/login", "POST", "Authenticate and get JWT token"],
        ["/api/experts/diseases-to-review", "GET", "Get all diseases with modifications"],
        ["/api/disease/{id}/parameters", "GET", "Get parameters for specific disease"],
        ["/api/change-requests", "POST", "Submit parameter change request"],
        ["/api/admin/knowledge/upload", "POST", "Upload knowledge source"],
        ["/api/admin/knowledge/suggestions", "GET", "Get pending AI suggestions"],
        ["/api/admin/experts", "GET/POST", "List/Create experts"],
        ["/api/admin/settings", "GET/PUT", "System settings"]
    ]
    api_table = Table(api_data, colWidths=[5.5*cm, 2*cm, 6.5*cm])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
    ]))
    content.append(api_table)
    
    content.append(Spacer(1, 0.5*inch))
    content.append(Paragraph("Authentication:", subheading_style))
    content.append(Paragraph(
        "All protected endpoints require the Authorization header: <b>Authorization: Bearer {token}</b>",
        body_style
    ))
    
    # Build PDF
    doc.build(content)
    print(f"✅ PDF generated: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    create_phicor_pdf()
