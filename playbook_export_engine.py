#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur Dynamique de Livrables Officiels Playbook A.G.E.N.T. (Harvard Executive)
Produit en direct :
1. Document Exécutif Word (.docx) personnalisé avec l'état réel du document
2. Présentation Exécutive PowerPoint 16:9 (.pptx) personnalisée
"""

import os
import sys
import json
import argparse
from bs4 import BeautifulSoup

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from pptx import Presentation
from pptx.util import Inches as PptInches, Pt as PptPt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor as PptRGBColor
from pptx.enum.shapes import MSO_SHAPE

# Couleurs Institutionnelles SAAQ (Cadre A.G.E.N.T.)
COLOR_NAVY = RGBColor(0, 32, 96)       # #002060
COLOR_STEEL = RGBColor(44, 77, 117)    # #2C4D75
COLOR_GOLD = RGBColor(184, 134, 11)    # #B8860B
COLOR_TEXT = RGBColor(30, 41, 59)      # #1E293B

HEX_NAVY = "002060"
HEX_STEEL = "2C4D75"
HEX_GOLD = "B8860B"
HEX_ZEBRA = "F8FAFC"
HEX_BOX_BG = "F1F5F9"
HEX_INPUT = "EFF6FF"

PPT_NAVY = PptRGBColor(0x00, 0x20, 0x60)
PPT_STEEL = PptRGBColor(0x2C, 0x4D, 0x75)
PPT_GOLD = PptRGBColor(0xB8, 0x86, 0x0B)
PPT_CYAN = PptRGBColor(0x02, 0x84, 0xC7)
PPT_TEXT_DARK = PptRGBColor(0x1E, 0x29, 0x3B)
PPT_WHITE = PptRGBColor(0xFF, 0xFF, 0xFF)
PPT_BOX_BG = PptRGBColor(0xF1, 0xF5, 0xF9)
PPT_BLUE_BOX = PptRGBColor(0xEF, 0xF6, 0xFF)

import re

def clean_html_text(html_content):
    """Convertit du HTML brut en texte propre formaté."""
    if not html_content:
        return ""
    try:
        if BeautifulSoup:
            soup = BeautifulSoup(html_content, 'html.parser')
            for br in soup.find_all("br"):
                br.replace_with("\n")
            return soup.get_text().strip()
    except Exception:
        pass
    # Fallback regex universel
    text = re.sub(r'<br\s*/?>', '\n', html_content, flags=re.IGNORECASE)
    text = re.sub(r'</p>|</div>|</li>|</tr>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()


def extract_table_data(html_content):
    """Extrait les lignes et cellules d'une table HTML si présente."""
    if not html_content or "<table" not in html_content:
        return None
    try:
        if BeautifulSoup:
            soup = BeautifulSoup(html_content, 'html.parser')
            table = soup.find('table')
            if table:
                rows = []
                for tr in table.find_all('tr'):
                    cells = []
                    for th_td in tr.find_all(['th', 'td']):
                        cells.append(th_td.get_text().strip())
                    if cells:
                        rows.append(cells)
                if rows:
                    return rows
    except Exception:
        pass
    # Fallback regex universel
    rows = []
    tr_matches = re.findall(r'<tr[^>]*>(.*?)</tr>', html_content, flags=re.DOTALL | re.IGNORECASE)
    for tr in tr_matches:
        cells = re.findall(r'<(?:th|td)[^>]*>(.*?)</(?:th|td)>', tr, flags=re.DOTALL | re.IGNORECASE)
        clean_cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
        if clean_cells:
            rows.append(clean_cells)
    return rows if rows else None


def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def add_header_styled(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Segoe UI"
    run.bold = True
    if level == 1:
        run.font.size = Pt(14.5)
        run.font.color.rgb = COLOR_NAVY
    elif level == 2:
        run.font.size = Pt(12)
        run.font.color.rgb = COLOR_STEEL
    elif level == 3:
        run.font.size = Pt(10.5)
        run.font.color.rgb = COLOR_GOLD
    return p


def add_callout_box(doc, title, text_content, bg_hex=HEX_BOX_BG, border_color=HEX_NAVY):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)

    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:top w:val="none"/>'
        f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>'
        f'  <w:bottom w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    run_t = p.add_run(f"📌 {title}")
    run_t.font.name = "Segoe UI"
    run_t.font.size = Pt(10.5)
    run_t.font.color.rgb = COLOR_NAVY
    run_t.bold = True

    lines = clean_html_text(text_content).split("\n")
    for line in lines:
        if not line.strip():
            continue
        p2 = cell.add_paragraph()
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(2)
        p2.paragraph_format.line_spacing = 1.12
        run = p2.add_run(line)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)


def add_rendered_table_or_text(doc, html_content, fallback_text=""):
    table_data = extract_table_data(html_content)
    if table_data and len(table_data) > 1:
        num_rows = len(table_data)
        num_cols = max(len(r) for r in table_data)
        tbl = doc.add_table(rows=num_rows, cols=num_cols)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        for r_idx, row in enumerate(table_data):
            for c_idx, val in enumerate(row):
                if c_idx >= num_cols:
                    continue
                cell = tbl.cell(r_idx, c_idx)
                set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                run = p.add_run(val)
                run.font.name = "Calibri"

                if r_idx == 0:
                    set_cell_background(cell, HEX_NAVY)
                    run.bold = True
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(255, 255, 255)
                else:
                    run.font.size = Pt(9)
                    if r_idx % 2 == 1:
                        set_cell_background(cell, HEX_ZEBRA)
                    else:
                        set_cell_background(cell, "FFFFFF")
        doc.add_paragraph()
    else:
        text = clean_html_text(html_content) or fallback_text
        if text:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(text)
            run.font.name = "Calibri"
            run.font.size = Pt(10)


def generate_custom_playbook_docx(data, output_path):
    """Génère le document Word complet enrichi des données du participant."""
    doc = docx.Document()

    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)

    # Entête institutionnelle
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(2)
    run_meta = p_meta.add_run("SOCIÉTÉ DE L'ASSURANCE AUTOMOBILE DU QUÉBEC (SAAQ) • CENTRE D'EXPERTISE EN INTELLIGENCE ARTIFICIELLE")
    run_meta.font.name = "Segoe UI"
    run_meta.font.size = Pt(9.5)
    run_meta.font.bold = True
    run_meta.font.color.rgb = COLOR_STEEL

    # Sous-titre officiel
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(8)
    run_sub = p_sub.add_run("Basé sur le cadre méthodologique A.G.E.N.T.")
    run_sub.font.name = "Segoe UI"
    run_sub.font.size = Pt(10)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_GOLD

    # Titre Principal
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(12)
    run_t = p_title.add_run("Playbook A.G.E.N.T. : Reconception des Processus Métiers")
    run_t.font.name = "Segoe UI"
    run_t.font.size = Pt(22)
    run_t.font.bold = True
    run_t.font.color.rgb = COLOR_NAVY

    # Tableau Métadonnées du Projet
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    col_w = [Inches(2.2), Inches(4.3)]
    for r in tbl_meta.rows:
        for idx, w in enumerate(col_w):
            r.cells[idx].width = w

    meta_items = [
        ("Direction d'Affaires", data.get("meta-direction", "Direction du Financement aux Entreprises")),
        ("Copropriétaires (Métier & TI)", data.get("meta-owners", "Responsables Métier & Partenaire TI")),
        ("Flux de Travail Sélectionné", data.get("meta-workflow", "Instruction des dossiers de financement")),
        ("Horizon Temporel & Pilote", data.get("meta-horizon", "Pilote de 3 Semaines (Sprint de Validation)"))
    ]

    for idx, (label, val) in enumerate(meta_items):
        c0, c1 = tbl_meta.rows[idx].cells
        set_cell_margins(c0, 60, 60, 80, 80)
        set_cell_margins(c1, 60, 60, 80, 80)
        set_cell_background(c0, HEX_NAVY)
        set_cell_background(c1, HEX_INPUT)

        p0 = c0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.name = "Segoe UI"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = RGBColor(255, 255, 255)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(10)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_TEXT

    doc.add_paragraph()

    # PHASE A : AUDIT
    add_header_styled(doc, "1. Phase A — AUDIT du flux de travail actuel", level=1)
    add_callout_box(doc, "1.1 Événement Déclencheur & Périmètre Opérationnel (Trigger)", data.get("input-audit-trigger", "Réception du formulaire d'admissibilité avec pièces justificatives."))
    if data.get("input-audit-systems"):
        add_callout_box(doc, "1.2 Systèmes Informatiques, Données Sources & Sensibilité Loi 25 (Faisabilité)", data.get("input-audit-systems"))
    if data.get("input-audit-volume"):
        add_callout_box(doc, "1.3 Volumétrie Actuelle & Temps Consacré (Baseline pour Calcul de la Valeur)", data.get("input-audit-volume"))
    
    add_header_styled(doc, "1.4 Décomposition Séquentielle des Étapes Actuelles & Goulots d'Étranglement", level=2)
    add_rendered_table_or_text(doc, data.get("input-audit-steps", ""))

    # PHASE G : GAUGE
    add_header_styled(doc, "2. Phase G — GAUGE : Du Livrable Brut au Résultat Stratégique", level=1)
    add_callout_box(doc, "2.1 Livrable Matériel Brut (Output)", data.get("input-gauge-output", "Fiche de synthèse d'admissibilité standardisée."))
    add_callout_box(doc, "2.2 Résultat Stratégique Visé (Outcome)", data.get("input-gauge-outcome", "Réduction de 70% du temps de cycle et libération de 15h/semaine pour le conseil direct."))
    
    add_header_styled(doc, "2.3 Matrice des Tâches Fondamentales (JTBD) & Opportunités Agentiques", level=2)
    add_rendered_table_or_text(doc, data.get("input-gauge-jtbd", ""))

    # PHASE E : ENGINEER
    add_header_styled(doc, "3. Phase E — ENGINEER : Les Cinq Lentilles de Reconception Agentique", level=1)
    lenses = [
        ("Lentille 1 : Décomposition & Parallélisation", data.get("input-lens-1", "Lancement simultané de l'extraction et du contrôle de conformité.")),
        ("Lentille 2 : Génération de Scénarios & Stress-tests", data.get("input-lens-2", "Simulation instantanée de scénarios financiers alternatifs.")),
        ("Lentille 3 : Triage Intelligent & Routage d'Exceptions", data.get("input-lens-3", "Orientation accélérée des dossiers simples et acheminement vers les experts seniors.")),
        ("Lentille 4 : Chaînage Autonome & Point d'Arrêt Humain", data.get("input-lens-4", "Autonomie de l'ingestion au mémo décisionnel avec arrêt obligatoire avant décision finale.")),
        ("Lentille 5 : Mémoire Persistante & Jurisprudence Métier", data.get("input-lens-5", "Conservation de la jurisprudence d'octroi et de l'appétit au risque DGIR."))
    ]
    for title, val in lenses:
        add_callout_box(doc, title, val, bg_hex="FFFFFF", border_color=HEX_STEEL)

    add_header_styled(doc, "3.6 Architecture du Flux Cible Réinventé", level=2)
    add_rendered_table_or_text(doc, data.get("input-engineer-target-flow", ""))

    # PHASE N : NAVIGATE
    add_header_styled(doc, "4. Phase N — NAVIGATE : Humain aux Commandes & Droit de Veto", level=1)
    add_callout_box(doc, "4.1 Doctrine de Supervision & Droit de Veto", data.get("input-nav-veto", "Droit de veto inconditionnel en un clic pour l'humain et pause automatique si certitude < 85%."))
    add_callout_box(doc, "4.2 Accompagnement & Conduite du Changement", data.get("input-nav-change", "Valorisation des équipes réallouées vers l'accompagnement d'affaires à haute valeur."))

    # PHASE T : TRACK
    add_header_styled(doc, "5. Phase T — TRACK : Métriques d'Impact & Sprint Pilote de 3 Semaines", level=1)
    add_callout_box(doc, "5.1 Calendrier Déploiement Pilote de 3 Semaines", data.get("input-track-pilot", "Semaine 1 Calibration, Semaine 2 Shadowing en double aveugle, Semaine 3 Validation."))
    add_header_styled(doc, "5.2 Indicateurs Clés d'Impact (KPIs Baseline vs Cible)", level=2)
    add_rendered_table_or_text(doc, data.get("input-track-kpis", ""))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    return output_path


def generate_custom_playbook_pptx(data, output_path):
    """Génère la présentation PowerPoint 16:9 enrichie des données du participant."""
    prs = Presentation()
    prs.slide_width = PptInches(13.333)
    prs.slide_height = PptInches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_header(slide, title_text, category_text="SAAQ • CENTRE D'EXPERTISE EN INTELLIGENCE ARTIFICIELLE"):
        hdr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, PptInches(13.333), PptInches(1.15))
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = PPT_NAVY
        hdr.line.color.rgb = PPT_NAVY

        tf = hdr.text_frame
        tf.margin_left = PptInches(0.6)
        tf.margin_top = PptInches(0.14)
        
        p0 = tf.paragraphs[0]
        p0.text = category_text.upper()
        p0.font.name = "Segoe UI"
        p0.font.size = PptPt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = PPT_GOLD

        p1 = tf.add_paragraph()
        p1.text = title_text
        p1.font.name = "Segoe UI"
        p1.font.size = PptPt(18)
        p1.font.bold = True
        p1.font.color.rgb = PPT_WHITE

    def add_card(slide, left, top, width, height, title, text_content, bg_color=PPT_BOX_BG, border_color=PPT_CYAN):
        box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        box.fill.solid()
        box.fill.fore_color.rgb = bg_color
        box.line.color.rgb = border_color
        box.line.width = PptPt(1.5)

        tf = box.text_frame
        tf.margin_left = PptInches(0.2)
        tf.margin_right = PptInches(0.2)
        tf.margin_top = PptInches(0.2)
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = "Segoe UI"
        p0.font.size = PptPt(12)
        p0.font.bold = True
        p0.font.color.rgb = PPT_NAVY
        p0.space_after = PptPt(6)

        clean_lines = [l for l in clean_html_text(text_content).split("\n") if l.strip()]
        for line in clean_lines[:6]:
            p = tf.add_paragraph()
            p.text = line
            p.font.name = "Calibri"
            p.font.size = PptPt(10)
            p.font.color.rgb = PPT_TEXT_DARK
            p.space_after = PptPt(3)

    # SLIDE 1 : COUVERTURE
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, PptInches(13.333), PptInches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = PPT_NAVY
    bg1.line.color.rgb = PPT_NAVY

    tbox1 = s1.shapes.add_textbox(PptInches(1.2), PptInches(1.6), PptInches(11.0), PptInches(4.5))
    tf1 = tbox1.text_frame
    p0 = tf1.paragraphs[0]
    p0.text = "SOCIÉTÉ DE L'ASSURANCE AUTOMOBILE DU QUÉBEC (SAAQ) • CENTRE D'EXPERTISE EN INTELLIGENCE ARTIFICIELLE"
    p0.font.name = "Segoe UI"
    p0.font.size = PptPt(13)
    p0.font.bold = True
    p0.font.color.rgb = PPT_GOLD
    p0.space_after = PptPt(12)

    p1 = tf1.add_paragraph()
    p1.text = "Playbook A.G.E.N.T. : Reconception des Processus Métiers"
    p1.font.name = "Segoe UI"
    p1.font.size = PptPt(26)
    p1.font.bold = True
    p1.font.color.rgb = PPT_WHITE
    p1.space_after = PptPt(12)

    p2 = tf1.add_paragraph()
    p2.text = f"Direction : {data.get('meta-direction', 'Direction Métier IQ')}\nFlux sélectionné : {data.get('meta-workflow', 'Instruction de processus')}\nCopropriétaires : {data.get('meta-owners', 'Responsable Métier & Partenaire TI')}"
    p2.font.name = "Calibri"
    p2.font.size = PptPt(14)
    p2.font.color.rgb = PPT_WHITE

    # SLIDE 2 : PHASE A (AUDIT)
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Phase A — AUDIT du flux de travail actuel (As-Is)")
    audit_left = (data.get("input-audit-trigger", "Réception du formulaire avec pièces justificatives.") + 
                  (("\n\n" + data.get("input-audit-systems", "")) if data.get("input-audit-systems") else "") +
                  (("\n\n" + data.get("input-audit-volume", "")) if data.get("input-audit-volume") else ""))
    add_card(s2, PptInches(0.6), PptInches(1.4), PptInches(6.0), PptInches(5.5), "1.1 Déclencheur, Données Sources & Volumétrie", audit_left)
    add_card(s2, PptInches(6.8), PptInches(1.4), PptInches(5.9), PptInches(5.5), "1.2 Décomposition des Étapes & Goulots", data.get("input-audit-steps", "1. Réception manuelle\n2. Contrôle de conformité\n3. Analyse financière\n4. Arbitrage final"))

    # SLIDE 3 : PHASE G (GAUGE)
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Phase G — GAUGE : Du Livrable Brut au Résultat Stratégique")
    add_card(s3, PptInches(0.6), PptInches(1.4), PptInches(5.9), PptInches(2.6), "Livrable Brut (Output)", data.get("input-gauge-output", "Fiche de synthèse standardisée."))
    add_card(s3, PptInches(6.8), PptInches(1.4), PptInches(5.9), PptInches(2.6), "Résultat Stratégique (Outcome)", data.get("input-gauge-outcome", "Gain de 70% de temps de cycle et 15h libérées."))
    add_card(s3, PptInches(0.6), PptInches(4.2), PptInches(12.1), PptInches(2.8), "Opportunités Agentiques & JTBD", data.get("input-gauge-jtbd", "Agent Collecteur (Extraction) | Agent Gardien (Conformité) | Agent Analyste (Ratios) | Agent Rédacteur (Mémo)"))

    # SLIDE 4 : PHASE E (ENGINEER)
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Phase E — ENGINEER : Les Cinq Lentilles de Reconception Agentique")
    add_card(s4, PptInches(0.6), PptInches(1.4), PptInches(3.8), PptInches(2.6), "1. Parallélisation", data.get("input-lens-1", "Lancement simultané extraction et conformité."))
    add_card(s4, PptInches(4.7), PptInches(1.4), PptInches(3.9), PptInches(2.6), "2. Simulation & Scénarios", data.get("input-lens-2", "Modélisation de 3 scénarios."))
    add_card(s4, PptInches(8.9), PptInches(1.4), PptInches(3.8), PptInches(2.6), "3. Triage Intelligent", data.get("input-lens-3", "Orientation accélérée des dossiers simples."))
    add_card(s4, PptInches(0.6), PptInches(4.2), PptInches(5.9), PptInches(2.7), "4. Chaînage Autonome", data.get("input-lens-4", "Autonomie jusqu'au premier jet."))
    add_card(s4, PptInches(6.8), PptInches(4.2), PptInches(5.9), PptInches(2.7), "5. Mémoire Persistante", data.get("input-lens-5", "Jurisprudence interne et appétit DGIR."))

    # SLIDE 5 : PHASE N (NAVIGATE)
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Phase N — NAVIGATE : Humain aux Commandes & Droit de Veto")
    add_card(s5, PptInches(0.6), PptInches(1.4), PptInches(6.0), PptInches(5.5), "Doctrine de Supervision & Veto", data.get("input-nav-veto", "Droit de veto inconditionnel en 1 clic."))
    add_card(s5, PptInches(6.8), PptInches(1.4), PptInches(5.9), PptInches(5.5), "Conduite du Changement", data.get("input-nav-change", "Valorisation et réallocation du temps gagné."))

    # SLIDE 6 : PHASE T (TRACK)
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Phase T — TRACK : Pilote de 3 Semaines & Indicateurs Clés")
    add_card(s6, PptInches(0.6), PptInches(1.4), PptInches(6.0), PptInches(5.5), "Sprint Pilote de 3 Semaines", data.get("input-track-pilot", "S1 Calibration | S2 Shadowing | S3 Validation"))
    add_card(s6, PptInches(6.8), PptInches(1.4), PptInches(5.9), PptInches(5.5), "Indicateurs Clés (KPIs Cibles)", data.get("input-track-kpis", "Délai de traitement : -75%\nTemps expert : -78%\nConformité Loi 25 : 0 erreur"))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Générateur de livrables Playbook A.G.E.N.T.")
    parser.add_argument("--format", choices=["docx", "pptx"], required=True, help="Format de sortie désiré")
    parser.add_argument("--input", default="-", help="Chemin du fichier JSON d'entrée ou '-' pour stdin")
    parser.add_argument("--output", required=True, help="Chemin du fichier de sortie")

    args = parser.parse_args()

    if args.input == "-":
        payload = sys.stdin.read()
        data = json.loads(payload)
    else:
        with open(args.input, "r", encoding="utf-8") as f:
            data = json.load(f)

    if args.format == "docx":
        res = generate_custom_playbook_docx(data, args.output)
        print(f"SUCCESS: {res}")
    elif args.format == "pptx":
        res = generate_custom_playbook_pptx(data, args.output)
        print(f"SUCCESS: {res}")


if __name__ == "__main__":
    main()
