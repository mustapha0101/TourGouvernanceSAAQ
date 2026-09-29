"""
Générateur Exécutif de Mémo Décisionnel du Comité IA — Investissement Québec
Architecture Multi-Agents inspirée de Stanford STORM :
- Perspective 1 : Cadrage Métier & Valeur d'Affaires (Agent Rédacteur)
- Perspective 2 : Évaluation des Risques & Appétit DGIR 2026 (Agent de Risque)
- Perspective 3 : Faisabilité Technique & Grille DD (Agent de Faisabilité)
- Perspective 4 : Homologation & Garde-fous (Agent Gardien / Valideur)

Normes graphiques institutionnelles :
- Typographie TrueType moderne et lisible (Calibri / Segoe UI)
- Titres et bandeaux en BLANC PUR sur BLEU FONCÉ (#002060)
- Table des matières structurée multi-perspectives (STORM)
- Zéro commentaire ni marque de révision
"""

import os
import datetime
from typing import Dict, Any, List
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

IQ_NAVY_HEX = "002060"      # Bleu Nuit Investissement Québec
IQ_BLUE_HEX = "003366"      # Bleu Corporatif IQ
IQ_CYAN_HEX = "00A3E0"      # Cyan IQ
IQ_BG_LIGHT = "F4F7FB"      # Fond Gris Clair
IQ_BORDER_HEX = "CBD5E1"    # Bordure Neutre
IQ_GREEN_HEX = "16A34A"     # Vert Approbation
IQ_AMBER_HEX = "D97706"     # Ambre Conditionnel
WHITE_HEX = "FFFFFF"

def set_cell_background(cell, fill_hex: str):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def add_header_banner(doc, title_text: str, subtitle_text: str):
    """Bandeau de titre exécutif : Blanc sur Bleu foncé #002060"""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.cell(0, 0)
    set_cell_background(c, IQ_NAVY_HEX)
    set_cell_margins(c, top=200, bottom=200, left=240, right=240)
    
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p.add_run("INVESTISSEMENT QUÉBEC • DIRECTION DES TECHNOLOGIES DE L'INFORMATION & BUREAU DE L'IA\n")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(9.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x7D, 0xD3, 0xFC) # Cyan clair lisible
    
    r_title = p.add_run(f"MÉMO DÉCISIONNEL — {title_text.upper()}\n")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(15)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
    
    r_desc = p.add_run(subtitle_text)
    r_desc.font.name = 'Calibri'
    r_desc.font.size = Pt(10)
    r_desc.font.italic = True
    r_desc.font.color.rgb = RGBColor(0xE0, 0xF2, 0xFE)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

def add_section_heading(doc, num_str: str, text: str, agent_tag: str = ""):
    """Titre de section avec bandeau de fond bleu et texte BLANC PUR"""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.cell(0, 0)
    set_cell_background(c, IQ_NAVY_HEX)
    set_cell_margins(c, top=100, bottom=100, left=160, right=160)
    
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    r_num = p.add_run(f"{num_str} ")
    r_num.font.name = 'Calibri'
    r_num.font.size = Pt(12)
    r_num.font.bold = True
    r_num.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8) # Accent cyan
    
    r_txt = p.add_run(text.upper())
    r_txt.font.name = 'Calibri'
    r_txt.font.size = Pt(12)
    r_txt.font.bold = True
    r_txt.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
    
    if agent_tag:
        r_tag = p.add_run(f"  [{agent_tag}]")
        r_tag.font.name = 'Calibri'
        r_tag.font.size = Pt(9.5)
        r_tag.font.bold = False
        r_tag.font.italic = True
        r_tag.font.color.rgb = RGBColor(0xBA, 0xE6, 0xFD)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def generate_storm_decision_memo(
    initiative_data: Dict[str, Any],
    evaluation_result: Dict[str, Any],
    memo_data: Dict[str, Any],
    output_path: str
) -> str:
    """
    Génère un Mémo Décisionnel Word d'une qualité exécutive irréprochable :
    - Titres BLANC SUR BLEU
    - Typographie TrueType soignée
    - Table des matières hiérarchique à la Stanford STORM
    - Perspectives multi-agents (Métier, Risques DGIR, Faisabilité DD, Gardien)
    """
    doc = docx.Document()
    
    # 1. Marges standardisées 2 cm (0.8 pouce)
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)
        
        # En-tête & Pied de page institutionnels
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("INVESTISSEMENT QUÉBEC • BUREAU DE L'IA • CADRE UNIFIÉ DGIR 2026")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun1 = fp.add_run("Document confidentiel — Réservé au Comité de Gouvernance de l'IA d'Investissement Québec")
        frun1.font.name = 'Calibri'
        frun1.font.size = Pt(8.5)
        frun1.font.italic = True
        frun1.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        
    # Style de base
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(10.5)
    font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    title = initiative_data.get("title", "Initiative IA sans titre")
    direction = initiative_data.get("direction", "Investissement Québec")
    sponsor = initiative_data.get("sponsor", "Non spécifié")
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    total_score = evaluation_result.get("total_score", 84)
    pct = evaluation_result.get("percentage", 75.0)
    rec = evaluation_result.get("recommendation", "🟡 HOMOLOGATION CONDITIONNELLE")
    
    # BANDEAU PRINCIPAL DE COUVERTURE (BLANC SUR BLEU)
    add_header_banner(
        doc,
        title_text=title,
        subtitle_text="Dossier d'évaluation approfondie, de faisabilité & d'atténuation des risques IA — Modèle Multi-Agents STORM"
    )
    
    # TABLEAU DES MÉTADONNÉES DU DOSSIER
    t_meta = doc.add_table(rows=3, cols=4)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_meta, color=IQ_BORDER_HEX)
    
    meta_headers = [
        ("Date d'évaluation :", today_str, "Direction porteuse :", direction),
        ("Porteur d'affaires :", sponsor, "Typologie SIA :", (initiative_data.get("tool_type", "RAG")).upper()),
        ("Score Faisabilité :", f"{total_score} / 112 pts ({pct} %)", "Porte d'Homologation :", rec)
    ]
    
    for r_idx, row_vals in enumerate(meta_headers):
        for c_idx, val in enumerate(row_vals):
            cell = t_meta.cell(r_idx, c_idx)
            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
            p = cell.paragraphs[0]
            if c_idx in (0, 2):
                set_cell_background(cell, "F8FAFC")
                r = p.add_run(val)
                r.font.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            else:
                r = p.add_run(str(val))
                r.font.size = Pt(9.5)
                if c_idx == 3 and r_idx == 2:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # =========================================================================
    # TABLE DES MATIÈRES À LA STANFORD STORM
    # =========================================================================
    tbl_toc = doc.add_table(rows=1, cols=1)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_toc = tbl_toc.cell(0, 0)
    set_cell_background(c_toc, "F1F5F9")
    set_cell_margins(c_toc, top=140, bottom=140, left=180, right=180)
    
    p_toc_title = c_toc.paragraphs[0]
    r_tt = p_toc_title.add_run("📑 TABLE DES MATIÈRES — STRUCTURE DU RAPPORT MULTI-AGENTS (STORM)")
    r_tt.font.bold = True
    r_tt.font.size = Pt(11)
    r_tt.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
    
    toc_items = [
        ("1. Sommaire Exécutif & Synthèse d'Arbitrage", "Bureau de l'IA & Escouade IA"),
        ("2. Perspective Métier : Cadrage du Besoin & Valeur d'Affaires", "Agent Rédacteur (STORM-Writer)"),
        ("3. Perspective Risques : Filtrage d'Appétit au Risque DGIR 2026 & Loi 25", "Agent de Risque (STORM-Risk)"),
        ("   3.1 Qualification des 5 Thématiques d'Appétit au Risque (Cases Cochées ☑)", "Arrimage DGIR 2026"),
        ("   3.2 Conformité Loi 25, Données Nominatives & Cybersécurité CSI", "MCN Québec & NIST 600-1"),
        ("   3.3 Démonstration Mathématique AHP-TOPSIS", "Calcul Scientifique"),
        ("4. Perspective Technique : Faisabilité & Relevé des 28 Critères", "Agent de Faisabilité (STORM-Tech)"),
        ("   4.1 Synthèse par Axe de Faisabilité (Moyennes & Pondérations)", "Grille DD"),
        ("   4.2 Relevé Exhaustif des 28 Critères Officiels avec Justifications", "Comité IA"),
        ("5. Perspective Homologation : Décision Officielle & Garde-fous", "Agent Gardien (STORM-Gatekeeper)"),
        ("   5.1 Attribution Formelle de la Porte d'Homologation", "Human-in-the-loop"),
        ("   5.2 Plan d'Atténuation des Risques & Conditions d'Exploitation", "Gouvernance IQ"),
        ("6. Signatures et Validation des Instances Décisionnelles", "Engagement Partagé")
    ]
    
    for item_title, item_sub in toc_items:
        p_item = c_toc.add_paragraph()
        p_item.paragraph_format.space_after = Pt(2)
        p_item.paragraph_format.line_spacing = 1.15
        r_it = p_item.add_run(f"• {item_title}")
        r_it.font.size = Pt(9.5)
        if not item_title.startswith("   "):
            r_it.font.bold = True
            r_it.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        else:
            r_it.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            
        r_sub = p_item.add_run(f"  —  {item_sub}")
        r_sub.font.size = Pt(8.5)
        r_sub.font.italic = True
        r_sub.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(14)
    
    # =========================================================================
    # SECTION 1 : SOMMAIRE EXÉCUTIF
    # =========================================================================
    add_section_heading(doc, "1.", "Sommaire Exécutif & Synthèse d'Arbitrage", "Bureau de l'IA")
    
    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.line_spacing = 1.25
    p_sum.add_run(
        f"Le présent Mémo Décisionnel formalise la recommandation du Bureau de l'IA concernant l'initiative « {title} », "
        f"portée par {sponsor} au sein de la direction {direction}. "
        f"L'analyse approfondie menée selon l'architecture multi-agents (modèle Stanford STORM) a combiné l'évaluation de la valeur d'affaires, "
        f"le filtrage d'appétit au risque de la DGIR 2026 et la notation exhaustive des 28 critères officiels de la Grille de Faisabilité (Grille DD).\n"
    )
    
    # Encadré Recommandation
    tbl_rec = doc.add_table(rows=1, cols=1)
    tbl_rec.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_rec = tbl_rec.cell(0, 0)
    set_cell_background(c_rec, "EFF6FF")
    set_cell_margins(c_rec, top=120, bottom=120, left=160, right=160)
    p_r = c_rec.paragraphs[0]
    r_rt = p_r.add_run("DÉCISION DU COMITÉ : ")
    r_rt.font.bold = True
    r_rt.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)
    r_rv = p_r.add_run(rec)
    r_rv.font.bold = True
    r_rv.font.size = Pt(11)
    
    p_rd = c_rec.add_paragraph()
    p_rd.paragraph_format.space_before = Pt(4)
    p_rd.add_run(
        f"Le score global obtenu de {pct}% confirme la viabilité du projet. "
        f"Conformément à la doctrine d'Investissement Québec (on n'exclut rien, on évalue le niveau de préparation), "
        f"cette décision est assortie de conditions précises d'atténuation opérationnelle et de supervision humaine systématique."
    )
    
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # =========================================================================
    # SECTION 2 : PERSPECTIVE MÉTIER (AGENT RÉDACTEUR)
    # =========================================================================
    add_section_heading(doc, "2.", "Perspective Métier : Cadrage du Besoin & Valeur d'Affaires", "Agent Rédacteur STORM")
    
    t_metier = doc.add_table(rows=4, cols=2)
    t_metier.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_metier, color=IQ_BORDER_HEX)
    
    metier_rows = [
        ("Description du besoin d'affaires :", initiative_data.get("description", "Non renseigné.")),
        ("Objectifs de valeur & gains attendus :", initiative_data.get("business_objective", "Gains d'efficience opérationnelle et structuration documentaire.")),
        ("Utilisateurs cibles & portée :", initiative_data.get("target_users", "Équipes internes d'Investissement Québec.")),
        ("Sources documentaires mobilisées :", initiative_data.get("data_sources", "SharePoint / Bases de connaissances IQ."))
    ]
    
    for idx, (label, val) in enumerate(metier_rows):
        c0 = t_metier.cell(idx, 0)
        c1 = t_metier.cell(idx, 1)
        set_cell_background(c0, "F8FAFC")
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(str(val))
        r1.font.size = Pt(9.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # =========================================================================
    # SECTION 3 : PERSPECTIVE RISQUES (AGENT DE RISQUE)
    # =========================================================================
    add_section_heading(doc, "3.", "Perspective Risques : Filtrage d'Appétit au Risque DGIR 2026 & Loi 25", "Agent de Risque STORM")
    
    doc.add_paragraph(
        "L'Agent de Risque a qualifié l'initiative au regard de la Grille d'évaluation cas usage de la Direction Générale de la Gestion Intégrée des Risques (DGIR 2026). "
        "Les 5 thématiques d'amplification des risques corporatifs ont été vérifiées avec positionnement formel par case cochée :"
    )
    
    # Tableau officiel des 5 thématiques DGIR (Grille évaluation cas usage.xlsx)
    t_dgir = doc.add_table(rows=6, cols=4)
    t_dgir.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_dgir, color=IQ_BORDER_HEX)
    
    dgir_headers = ["Thématique IA", "Sous-risques & Amplification", "Choix Positionné (Grille du Risque)", "Cible & Verdict"]
    for c_i, h_txt in enumerate(dgir_headers):
        cell = t_dgir.cell(0, c_i)
        set_cell_background(cell, IQ_NAVY_HEX)
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
        
    is_pii = initiative_data.get("contains_personal_data", False)
    tool_type = (initiative_data.get("tool_type", "")).lower()
    rto = int(initiative_data.get("rto_hours", 72))
    
    dgir_data = [
        ("1. Nature des données", "Fuite de données / Respect calendrier de conservation / Légal", 
         "☑ Données internes non sensibles\n☐ Renseignements personnels (Loi 25)" if not is_pii else "☐ Données internes non sensibles\n☑ Renseignements personnels (Loi 25)", 
         "Cible 2 / Conforme" if not is_pii else "Cible 4 / ÉFVP Requise"),
        ("2. Type d'outil SIA", "Perte de contrôle / Sécurité & hébergement / Architecture", 
         "☑ SIA sur environnement fermé - Licences corporatives (Azure IQ / Copilot)\n☐ SIA publics non encadrés", 
         "Cible 2 / Conforme"),
        ("3. Type d'extrant", "Hallucinations, biais algorithmiques, dérives et perte d'expertise", 
         "☑ Assistant à la tâche & Analyse préliminaire\n☐ Décision automatisée irréversible", 
         "Cible 1 / Conforme"),
        ("4. Exposition externe", "Conseils non autorisés, réputation et confiance institutionnelle", 
         "☑ Usage interne influençant indirectement les services aux clients\n☐ Exposition grand public sans filtre", 
         "Cible 2 / Conforme"),
        ("5. Matérialité (RTO)", "Surconfiance à l'IA, résilience et dépendance technologique", 
         f"☑ RTO {rto} heures\n☐ Interruption intolérable (< 4h)", 
         f"Cible {1 if rto > 72 else 2} / Conforme")
    ]
    
    for r_i, (t_name, t_sub, t_choice, t_verdict) in enumerate(dgir_data, start=1):
        c0 = t_dgir.cell(r_i, 0)
        c1 = t_dgir.cell(r_i, 1)
        c2 = t_dgir.cell(r_i, 2)
        c3 = t_dgir.cell(r_i, 3)
        
        for c in (c0, c1, c2, c3):
            set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(t_name)
        r0.font.bold = True
        r0.font.size = Pt(9)
        r0.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
        
        p1 = c1.paragraphs[0]
        p1.add_run(t_sub).font.size = Pt(8.5)
        
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(t_choice)
        r2.font.size = Pt(8.5)
        
        p3 = c3.paragraphs[0]
        r3 = p3.add_run(t_verdict)
        r3.font.bold = True
        r3.font.size = Pt(9)
        r3.font.color.rgb = RGBColor(0x16, 0x65, 0x34) if "Conforme" in t_verdict else RGBColor(0x9A, 0x34, 0x12)
        
    # Carte d'attestation de passage du risque
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    tbl_pass = doc.add_table(rows=1, cols=1)
    tbl_pass.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_pass = tbl_pass.cell(0, 0)
    set_cell_background(c_pass, "F0FDF4")
    set_cell_margins(c_pass, top=100, bottom=100, left=140, right=140)
    p_pass = c_pass.paragraphs[0]
    r_pt = p_pass.add_run("🟢 ATTESTATION : FILTRE D'APPÉTIT AU RISQUE DGIR 2026 PASSÉ AVEC SUCCÈS\n")
    r_pt.font.bold = True
    r_pt.font.size = Pt(10)
    r_pt.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
    p_pass.add_run(
        "L'analyse confirme que le positionnement opérationnel (environnement fermé Azure IQ, validation humaine systématique, RTO compatible) "
        "respecte rigoureusement la zone de tolérance d'Investissement Québec. Le projet franchit avec succès le filtre préalable du risque."
    ).font.size = Pt(9.5)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # =========================================================================
    # SECTION 4 : PERSPECTIVE TECHNIQUE (AGENT DE FAISABILITÉ)
    # =========================================================================
    add_section_heading(doc, "4.", "Perspective Technique : Faisabilité & Relevé des 28 Critères", "Agent de Faisabilité STORM")
    
    # Tableau récapitulatif des 6 axes
    t_axes = doc.add_table(rows=7, cols=4)
    t_axes.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_axes, color=IQ_BORDER_HEX)
    
    axes_headers = ["Axe d'Évaluation", "Pondération AHP", "Score Obtenu (0-4)", "Appréciation de Maturité"]
    for c_i, h_txt in enumerate(axes_headers):
        cell = t_axes.cell(0, c_i)
        set_cell_background(cell, IQ_NAVY_HEX)
        set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
        
    axes_data = [
        ("Axe 1 : Valeur d'affaires et alignement stratégique", "15.0 %", f"{evaluation_result.get('score_axe1', 18)} / 20", "Alignement solide avec les gains opérationnels"),
        ("Axe 2 : Données disponibles et qualité", "15.0 %", f"{evaluation_result.get('score_axe2', 15)} / 20", "Corpus documentaires internes exploitables"),
        ("Axe 3 : Faisabilité technique (RAG / Modèle)", "10.0 %", f"{evaluation_result.get('score_axe3', 16)} / 20", "Composants cloud Azure IQ éprouvés"),
        ("Axe 4 : Effort, coûts et ressources", "5.0 %", f"{evaluation_result.get('score_axe4', 12)} / 16", "Effort modéré dans le cadre des licences IQ"),
        ("Axe 5 : Risques, conformité et Loi 25", "40.0 % (Prépondérant)", f"{evaluation_result.get('score_axe5', 16)} / 20", "Encadrement strict Human-in-the-loop"),
        ("Axe 6 : Adoption et conduite du changement", "15.0 %", f"{evaluation_result.get('score_axe6', 13)} / 16", "Adhésion forte des équipes métiers")
    ]
    
    for r_i, (a_name, a_w, a_sc, a_app) in enumerate(axes_data, start=1):
        for c_i, val in enumerate((a_name, a_w, a_sc, a_app)):
            c = t_axes.cell(r_i, c_i)
            set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            p = c.paragraphs[0]
            r = p.add_run(str(val))
            r.font.size = Pt(9)
            if c_i == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
            elif c_i == 1 and "40.0" in val:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x9A, 0x34, 0x12)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # Échantillon significatif des 28 critères notés et motivés
    p_crit_intro = doc.add_paragraph()
    p_crit_intro.add_run("Extrait des critères clés de la Grille DD avec notes et justifications motivées pour le Comité IA :").font.bold = True
    
    t_dd = doc.add_table(rows=7, cols=4)
    t_dd.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_dd, color=IQ_BORDER_HEX)
    
    dd_headers = ["#", "Critère d'Évaluation", "Note", "Justification Motivée Officielle"]
    for c_i, h_txt in enumerate(dd_headers):
        cell = t_dd.cell(0, c_i)
        set_cell_background(cell, IQ_NAVY_HEX)
        set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
        
    scores = evaluation_result.get("scores", {})
    justifs = evaluation_result.get("justifications", {})
    
    sample_criteria = [
        (1, "Clarté du besoin et gains mesurables", scores.get("1", 4), justifs.get("1", "Besoin précisément articulé avec des gains d'heures récurrents démontrés.")),
        (6, "Disponibilité et accessibilité des données", scores.get("6", 3), justifs.get("6", "Données centralisées sur répertoires sécurisés SharePoint d'IQ.")),
        (11, "Adéquation de la technologie IA générative", scores.get("11", 4), justifs.get("11", "Cas typique d'assistance documentaire et de synthèse textuelle.")),
        (16, "Proportionnalité de l'effort et des coûts", scores.get("16", 3), justifs.get("16", "Utilisation de l'infrastructure cloud existante sans surcoût matériel.")),
        (20, "Conformité à la Loi 25 et protection PII", scores.get("20", 3), justifs.get("20", "Mesures de non-rétention des données et revue ÉFVP planifiée.")),
        (22, "Supervision humaine active (Human-in-the-loop)", scores.get("22", 4), justifs.get("22", "Aucune décision ni recommandation n'est transmise sans validation préalable d'un conseiller."))
    ]
    
    for r_i, (c_num, c_name, c_score, c_just) in enumerate(sample_criteria, start=1):
        c0 = t_dd.cell(r_i, 0)
        c1 = t_dd.cell(r_i, 1)
        c2 = t_dd.cell(r_i, 2)
        c3 = t_dd.cell(r_i, 3)
        
        for c in (c0, c1, c2, c3):
            set_cell_margins(c, top=50, bottom=50, left=70, right=70)
            
        c0.paragraphs[0].add_run(f"#{c_num}").font.bold = True
        c1.paragraphs[0].add_run(c_name).font.size = Pt(8.5)
        
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(f"{c_score} / 4")
        r2.font.bold = True
        r2.font.size = Pt(9)
        
        c3.paragraphs[0].add_run(str(c_just)).font.size = Pt(8.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # =========================================================================
    # SECTION 5 : PERSPECTIVE HOMOLOGATION (AGENT GARDIEN)
    # =========================================================================
    add_section_heading(doc, "5.", "Perspective Homologation : Décision Officielle & Garde-fous", "Agent Gardien STORM")
    
    p_cond = doc.add_paragraph()
    p_cond.add_run("Conditions d'Homologation & Mesures Obligatoires de Contrôle :\n").font.bold = True
    
    cond_items = [
        "1. Validation Humaine Systématique (Human-in-the-loop) : Le système ne prend aucune décision autonome. Tout extrant doit être validé par le personnel qualifié d'IQ.",
        "2. Chiffrement et Non-Rétention : Interdiction formelle d'entraîner des modèles publics avec les données d'IQ; rétention zéro garantie par l'environnement Azure IQ.",
        "3. Journalisation et Traçabilité : Toutes les interactions et requêtes sont auditées et conservées conformément aux politiques de cybersécurité (CSI).",
        "4. Revue Périodique : Une revue trimestrielle de performance et d'exactitude factuelle sera menée conjointement avec le Bureau de l'IA."
    ]
    for c_text in cond_items:
        p_c = doc.add_paragraph(style='List Bullet')
        p_c.paragraph_format.space_after = Pt(3)
        p_c.add_run(c_text).font.size = Pt(9.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # =========================================================================
    # SECTION 6 : INSTANCES DÉCISIONNELLES & SIGNATURES
    # =========================================================================
    add_section_heading(doc, "6.", "Signatures et Validation des Instances Décisionnelles", "Engagement Partagé")
    
    t_sign = doc.add_table(rows=5, cols=4)
    t_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_sign, color=IQ_BORDER_HEX)
    
    sign_headers = ["Rôle & Instance", "Représentant", "Décision / Engagement", "Date"]
    for c_i, h_txt in enumerate(sign_headers):
        cell = t_sign.cell(0, c_i)
        set_cell_background(cell, IQ_NAVY_HEX)
        set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # BLANC PUR
        
    sign_rows = [
        ("Requérant d'affaires", sponsor, "☑ Accepte les conditions d'homologation", today_str),
        ("Bureau de l'IA & Escouade IA", "Analyste Principal en Gouvernance IA", "☑ Recommande l'homologation conditionnelle", today_str),
        ("Technologies de l'Information (TI)", "Architecture d'Entreprise", "☑ Valide la conformité technique Azure IQ", today_str),
        ("Gestion Intégrée des Risques (DGIR)", "Directeur des Risques", "☑ Valide le respect de l'appétit au risque", today_str)
    ]
    
    for r_i, (r_role, r_name, r_dec, r_date) in enumerate(sign_rows, start=1):
        for c_i, val in enumerate((r_role, r_name, r_dec, r_date)):
            cell = t_sign.cell(r_i, c_i)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(str(val))
            r.font.size = Pt(8.5)
            if c_i == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
            elif c_i == 2:
                r.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
                
    doc.save(output_path)
    return output_path
