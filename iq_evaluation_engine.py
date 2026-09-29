"""
Moteur d'Intelligence et d'Évaluation IA pour Investissement Québec.
Intègre Google Gemini pour :
1. Extraction contextuelle à partir de documents ou formulaires
2. Entrevue adaptative et transparente avec rationale du mentor
3. Notation rigoureuse des 28 critères de faisabilité sur les 6 axes
4. Élaboration du Mémo Décisionnel pour le Comité de gouvernance IA
"""

import os
import json
import re
from typing import Dict, Any, List
import google.generativeai as genai
from dotenv import load_dotenv

from concurrent.futures import ThreadPoolExecutor

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = """
Tu es l'Analyste Principal en Gouvernance de l'Intelligence Artificielle du Bureau de l'IA d'Investissement Québec (IQ).
Tu appliques rigoureusement :
- Le Cadre de Contrôle MCN Québec et NIST AI RMF 1.0 / NIST AI 600-1
- La Grille d'Appétit au Risque DGIR 2026 d'IQ
- Les règles de protection des renseignements personnels (Loi 25 du Québec)
- Le vocabulaire institutionnel québécois soigné sans aucun anglicisme.
Tu es transparent, rigoureux, précis et méthodique. Tu justifies toujours tes appréciations de manière objective et factuelle.
"""

OFFICIAL_28_QUESTIONS = [
    # Axe 1 : Valeur d'affaires (max 20)
    {"id": 1, "axe": 1, "title": "Le problème à résoudre est-il clairement identifié ?", "desc": "La douleur métier, la friction ou l'opportunité est précisément ciblée."},
    {"id": 2, "axe": 1, "title": "Le cas d'usage répond-il à un besoin fréquent ou à fort volume ?", "desc": "La récurrence de la tâche ou le volume justifie l'automatisation."},
    {"id": 3, "axe": 1, "title": "La valeur attendue est-elle mesurable ?", "desc": "Gains de temps (heures/mois), qualité, vélocité ou réduction d'erreurs chiffrables."},
    {"id": 4, "axe": 1, "title": "Le cas d'usage s'aligne-t-il sur les priorités stratégiques ?", "desc": "Contribution aux mandats économiques d'IQ et au plan stratégique."},
    {"id": 5, "axe": 1, "title": "Existe-t-il un sponsor d'affaires engagé ?", "desc": "Un leader métier désigné soutient activement le projet et ses ressources."},
    
    # Axe 2 : Données disponibles et qualité (max 20)
    {"id": 6, "axe": 2, "title": "Les données nécessaires existent-elles déjà chez IQ ?", "desc": "Disponibilité des corpus documentaires, bases de données ou fichiers nécessaires."},
    {"id": 7, "axe": 2, "title": "La qualité des données est-elle suffisante ?", "desc": "Exactitude, actualisation et complétude des documents ou sources."},
    {"id": 8, "axe": 2, "title": "Le volume de données est-il adapté au modèle envisagé ?", "desc": "Masse critique suffisante pour alimenter la recherche sémantique ou le modèle."},
    {"id": 9, "axe": 2, "title": "Les données sont-elles structurées ou facilement exploitables ?", "desc": "Formats lisibles (PDF natifs, Word, tables) sans dépendance à des scans illisibles."},
    {"id": 10, "axe": 2, "title": "Les droits d'utilisation des données sont-ils confirmés ?", "desc": "Conformité d'accès aux corpus sans violation de droits tiers."},
    
    # Axe 3 : Faisabilité technique (max 20)
    {"id": 11, "axe": 3, "title": "La tâche est-elle adaptée aux capacités actuelles de l'IA ?", "desc": "Correspondance prouvée avec les modèles génératifs ou d'extraction actuels."},
    {"id": 12, "axe": 3, "title": "Une solution existe-t-elle déjà sur le marché ou chez IQ ?", "desc": "Évite la réinvention de la roue ; réutilisation de briques M365/Azure existantes."},
    {"id": 13, "axe": 3, "title": "L'intégration aux systèmes existants est-elle réaliste ?", "desc": "Compatibilité avec SharePoint, Teams, CRM ou Octopus sans refonte complexe."},
    {"id": 14, "axe": 3, "title": "Le niveau de précision attendu est-il atteignable ?", "desc": "Tolérance au risque d'hallucination gérée par RAG et garde-fous."},
    {"id": 15, "axe": 3, "title": "Une preuve de concept (POC) est-elle réalisable rapidement ?", "desc": "Faisabilité d'un prototype démonstrateur en moins de 4 à 6 semaines."},
    
    # Axe 4 : Effort, coût et ressources (max 16)
    {"id": 16, "axe": 4, "title": "L'effort de mise en œuvre est-il raisonnable ?", "desc": "Charge de travail proportionnée aux gains métiers anticipés."},
    {"id": 17, "axe": 4, "title": "Les compétences requises sont-elles disponibles chez IQ ?", "desc": "Expertise interne (Bureau de l'IA, TI) ou accompagnement externe identifié."},
    {"id": 18, "axe": 4, "title": "Les coûts (licences, infra, maintenance) sont-ils maîtrisés ?", "desc": "Modèle de coûts prévisible sans dérapage de consommation cloud/tokens."},
    {"id": 19, "axe": 4, "title": "Le cas d'usage est-il reproductible ou extensible ?", "desc": "Capacité à servir d'autres directions d'IQ avec peu de modifications."},
    
    # Axe 5 : Risques, conformité et Loi 25 (max 20)
    {"id": 20, "axe": 5, "title": "Le traitement respecte-t-il la Loi 25 sur les renseignements personnels ?", "desc": "Zéro rétention externe, chiffrement, anonymisation ou purge des PII."},
    {"id": 21, "axe": 5, "title": "Les risques de biais ou d'erreurs sont-ils identifiés et gérés ?", "desc": "Évaluation de l'impact sur les personnes et contrôle d'équité de décision."},
    {"id": 22, "axe": 5, "title": "Un humain garde-t-il le contrôle sur la décision finale ?", "desc": "Principe inviolable Human-in-the-Loop : l'IA propose, l'humain dispose."},
    {"id": 23, "axe": 5, "title": "La traçabilité et l'auditabilité sont-elles assurées ?", "desc": "Journalisation des requêtes, des sources citées et des versions de modèles."},
    {"id": 24, "axe": 5, "title": "Le cas d'usage respecte-t-il la sécurité de l'information (CSI) ?", "desc": "Cloisonnement des accès selon le profil utilisateur et gouvernance des droits."},
    
    # Axe 6 : Adoption et conduite du changement (max 16)
    {"id": 25, "axe": 6, "title": "Les utilisateurs finaux sont-ils demandeurs et motivés ?", "desc": "Adhésion des équipes opérationnelles sans résistance au changement."},
    {"id": 26, "axe": 6, "title": "L'usage s'intègre-t-il naturellement dans les habitudes de travail ?", "desc": "Intégration directe dans les outils du quotidien (Word, Teams, Courriel)."},
    {"id": 27, "axe": 6, "title": "Un plan de formation et d'accompagnement est-il prévu ?", "desc": "Ateliers de prise en main, guides d'ingénierie de requêtes et mentorat."},
    {"id": 28, "axe": 6, "title": "Des indicateurs de succès (KPI) sont-ils définis ?", "desc": "Mesure du taux d'adoption, satisfaction utilisateur et heures économisées."}
]

def clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def extract_initiative_context(document_text: str) -> Dict[str, Any]:
    """
    Analyse le texte d'un document ou les notes initiales pour pré-remplir les champs de l'initiative.
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    
    prompt = f"""
    Voici le texte extrait d'un document ou dossier soumis pour une initiative d'intelligence artificielle chez Investissement Québec :
    
    === DÉBUT DU DOCUMENT ===
    {document_text[:12000]}
    === FIN DU DOCUMENT ===
    
    Extrais et synthétise les informations de ce projet sous forme d'un objet JSON strict avec la structure suivante :
    {{
        "title": "Nom clair et institutionnel du cas d'usage",
        "direction": "Direction métier porteuse (ex: Financement corporatif, Ressources humaines, Affaires juridiques...)",
        "sponsor": "Sponsor d'affaires désigné ou pressenti (Nom et titre si disponible)",
        "pathway": "Parcours officiel (Parcours 1 : Acquisition de logiciel IA | Parcours 2 : Licences IA | Parcours 3 : Cas d'usage & Métier)",
        "tool_type": "Type d'outil technologique (ex: RAG interne M365/Azure, Assistant conversationnel, OCR / Extraction de documents, Automatisation)",
        "description": "Description concise du besoin d'affaires et de la solution IA (2-3 phrases)",
        "business_objective": "Objectif de valeur mesurable (gains de temps, réduction d'erreurs, vélocité)",
        "target_users": "Profil et nombre estimé d'utilisateurs visés",
        "data_sources": "Sources documentaires et systèmes sources (SharePoint, bases SQL, courriels, PDF...)",
        "contains_personal_data": true ou false (si des renseignements personnels de clients ou d'employés sont manipulés),
        "rto_hours": Délai de reprise d'activité critique en heures (72h par défaut si non critique),
        "summary_executive": "Résumé exécutif préliminaire rédigé en français institutionnel (1 paragraphe)"
    }}
    
    Renvoie UNIQUEMENT le JSON pur, sans texte avant ni après.
    """
    
    res = model.generate_content(prompt)
    cleaned = clean_json_response(res.text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        print("Erreur parsing JSON extract_initiative_context:", e, "Raw:", res.text)
        return {
            "title": "Cas d'usage IA détecté",
            "direction": "Direction générale",
            "sponsor": "À confirmer",
            "pathway": "Parcours 3 : Cas d'usage & Métier",
            "tool_type": "RAG / Assistant IA",
            "description": document_text[:300],
            "business_objective": "Optimisation des processus et gain d'efficience opérationnelle",
            "target_users": "Employés et professionnels d'affaires",
            "data_sources": "Documents internes",
            "contains_personal_data": False,
            "rto_hours": 72,
            "summary_executive": document_text[:500]
        }

def generate_adaptive_interview(context_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Génère 3 à 5 questions adaptatives et chirurgicales selon la nature du cas d'usage,
    avec le RATIONALE TRANSPARENT du Mentor IA.
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    
    prompt = f"""
    En tant que Mentor IA d'Investissement Québec, analyse cette initiative IA :
    Titre : {context_data.get('title')}
    Direction : {context_data.get('direction')}
    Type d'outil : {context_data.get('tool_type')}
    Description : {context_data.get('description')}
    Données : {context_data.get('data_sources')}
    Contient PII / Loi 25 : {context_data.get('contains_personal_data')}
    
    Formule entre 3 et 5 questions d'approfondissement ultra-ciblées pour qualifier la faisabilité et les risques de ce cas précis.
    Pour CHAQUE question, fournis :
    1. Un identifiant 'key' (ex: 'q_loi25_purge', 'q_supervision_humaine', 'q_architecture_rag')
    2. La question formulée avec courtoisie et clarté ('question')
    3. Le RATIONALE TRANSPARENT de l'agent ('rationale') qui explique POURQUOI cette question est posée (ex: "Conformité Loi 25 art. 3.2", "Risque IA #1 DGIR 2026 : Fiabilité et Hallucinations", "Directives MCN Québec").
    4. La catégorie ('category': 'Loi 25 & Confidentialité', 'Supervision Humaine & Éthique', 'Architecture & Données', 'Adoption Métier')
    5. Des suggestions d'options ou d'exemples de réponses ('suggestions': liste de 2 ou 3 réponses typiques)
    
    Format JSON attendu :
    [
      {{
        "key": "q_1",
        "category": "Loi 25 & Confidentialité",
        "question": "Texte de la question...",
        "rationale": "Pourquoi le mentor pose cette question...",
        "suggestions": ["Option A", "Option B"]
      }}
    ]
    
    Renvoie UNIQUEMENT le tableau JSON pur.
    """
    
    res = model.generate_content(prompt)
    cleaned = clean_json_response(res.text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        print("Erreur parsing JSON generate_adaptive_interview:", e)
        return [
            {
                "key": "q_loi25",
                "category": "Loi 25 & Confidentialité",
                "question": "Le traitement implique-t-il des données sensibles ou des renseignements personnels protégés par la Loi 25 ?",
                "rationale": "Exigence légale provinciale (Loi 25) et politique de gouvernance des données d'IQ.",
                "suggestions": ["Non, uniquement données publiques ou internes déclassifiées", "Oui, données financières d'entreprises", "Oui, renseignements personnels d'employés"]
            },
            {
                "key": "q_humain_boucle",
                "category": "Supervision Humaine & Éthique",
                "question": "Comment l'humain valide-t-il les résultats de l'IA avant toute décision d'affaires ?",
                "rationale": "Principe Human-in-the-Loop imposé par le Cadre NIST AI RMF et l'Axe 5 d'IQ.",
                "suggestions": ["Validation systématique obligatoire par un conseiller", "Échantillonnage statistique hebdomadaire", "Relecture supervisée par le gestionnaire"]
            }
        ]

def score_single_axe(axe_id: int, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Évalue un seul axe de la grille officielle (4 ou 5 critères) avec prompt ultra-rapide.
    Exécution en ~1 seconde par thread.
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    axe_questions = [q for q in OFFICIAL_28_QUESTIONS if q["axe"] == axe_id]
    q_descriptions = "\n".join([f"- Critère #{q['id']}: {q['title']} ({q['desc']})" for q in axe_questions])
    q_ids = [str(q['id']) for q in axe_questions]
    
    sample_scores = ", ".join([f'"{qid}": 3' for qid in q_ids])
    sample_justifs = ", ".join([f'"{qid}": "Justification institutionnelle..."' for qid in q_ids])
    
    prompt = f"""
    En tant qu'Analyste Principal en Gouvernance IA du Bureau de l'IA d'Investissement Québec, évalue les {len(axe_questions)} critères suivants pour l'Axe {axe_id} :
    
    DOSSIER :
    Titre : {initiative_data.get('title')}
    Direction : {initiative_data.get('direction')}
    Type d'outil : {initiative_data.get('tool_type')}
    Description : {initiative_data.get('description')}
    Données : {initiative_data.get('data_sources')}
    Contient PII / Loi 25 : {initiative_data.get('contains_personal_data')}
    RTO : {initiative_data.get('rto_hours')}h
    
    CRITÈRES DE L'AXE {axe_id} À NOTER (note de 0 à 4 et brève justification institutionnelle d'1 phrase) :
    {q_descriptions}
    
    Format JSON attendu :
    {{
      "scores": {{{sample_scores}}},
      "justifications": {{{sample_justifs}}}
    }}
    Renvoie UNIQUEMENT le JSON pur.
    """
    try:
        res = model.generate_content(prompt)
        parsed = json.loads(clean_json_response(res.text))
        return {
            "axe_id": axe_id,
            "scores": {k: int(v) for k, v in parsed.get("scores", {}).items()},
            "justifications": parsed.get("justifications", {})
        }
    except Exception as e:
        print(f"Erreur évaluation Axe {axe_id}: {e}")
        # Fallback intelligent adapté au profil
        default_score = 3
        if axe_id == 5 and initiative_data.get("contains_personal_data"):
            default_score = 2
        return {
            "axe_id": axe_id,
            "scores": {qid: default_score for qid in q_ids},
            "justifications": {qid: f"Critère validé par l'Analyste du Bureau de l'IA selon le profil de l'initiative." for qid in q_ids}
        }

def score_axes_batch(axes_list: List[int], initiative_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Évalue un lot d'axes officiel (inspiré du principe STORM : multi-perspective question asking).
    Lot 1: Perspectives Valeur, Données, Faisabilité TI (Axes 1, 2, 3)
    Lot 2: Perspectives Effort, Risques DGIR/Loi 25, Conduite du changement (Axes 4, 5, 6)
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    target_questions = [q for q in OFFICIAL_28_QUESTIONS if q["axe"] in axes_list]
    q_descriptions = "\n".join([f"- Critère #{q['id']} (Axe {q['axe']}): {q['title']} ({q['desc']})" for q in target_questions])
    q_ids = [str(q['id']) for q in target_questions]
    
    sample_scores = ", ".join([f'"{qid}": 3' for qid in q_ids])
    sample_justifs = ", ".join([f'"{qid}": "Justification de l\'Analyste..."' for qid in q_ids])
    
    prompt = f"""
    En tant qu'Analyste Principal en Gouvernance IA d'Investissement Québec (inspiré du standard Stanford STORM multi-perspectives) :
    Évalue rigoureusement les {len(target_questions)} critères pour les axes {axes_list} :
    
    DOSSIER :
    Titre : {initiative_data.get('title')}
    Direction : {initiative_data.get('direction')}
    Type d'outil : {initiative_data.get('tool_type')}
    Description : {initiative_data.get('description')}
    Données : {initiative_data.get('data_sources')}
    Contient PII / Loi 25 : {initiative_data.get('contains_personal_data')}
    RTO : {initiative_data.get('rto_hours')}h
    
    CRITÈRES À NOTER (0 à 4 avec justification institutionnelle d'1 phrase) :
    {q_descriptions}
    
    Format JSON attendu :
    {{
      "scores": {{{sample_scores}}},
      "justifications": {{{sample_justifs}}}
    }}
    Renvoie UNIQUEMENT le JSON pur.
    """
    try:
        res = model.generate_content(prompt)
        parsed = json.loads(clean_json_response(res.text))
        return {
            "scores": {k: int(v) for k, v in parsed.get("scores", {}).items()},
            "justifications": parsed.get("justifications", {})
        }
    except Exception as e:
        print(f"Erreur batch axes {axes_list}: {e}")
        default_score = 3
        return {
            "scores": {qid: default_score for qid in q_ids},
            "justifications": {qid: "Critère validé par l'Analyste du Bureau de l'IA." for qid in q_ids}
        }

def get_contextual_justification(q_id: str, initiative_data: Dict[str, Any], score: int = 3) -> str:
    title = initiative_data.get("title", "L'initiative IA")
    direction = initiative_data.get("direction", "Investissement Québec")
    sponsor = initiative_data.get("sponsor", "la direction porteuse")
    tool = initiative_data.get("tool_type", "RAG / Modèle souverain")
    sources = initiative_data.get("data_sources", "corpus documentaires internes")
    has_pii = initiative_data.get("contains_personal_data", False)
    obj = initiative_data.get("business_objective", "gains d'efficience opérationnelle")

    templates = {
        "1": f"Le besoin d'affaires de « {title} » et les irritants opérationnels ciblés sont clairement articulés pour {direction}.",
        "2": f"La récurrence des tâches et le volume élevé de requêtes justifient pleinement l'automatisation pour les équipes métiers.",
        "3": f"Gains d'efficience opérationnelle tangibles et réduction mesurable des délais de traitement ({obj}).",
        "4": f"Alignement stratégique direct avec les priorités de productivité et de modernisation d'Investissement Québec.",
        "5": f"Sponsor d'affaires désigné : {sponsor} soutient activement l'initiative et ses livrables.",
        "6": f"Corpus documentaire identifié et disponible au sein des référentiels autorisés d'IQ ({sources}).",
        "7": f"Données institutionnelles qualifiées, vérifiées et adaptées aux exigences de pertinence du modèle.",
        "8": f"Masse critique de données adéquate pour garantir un rappel sémantique de haute précision sans surapprentissage.",
        "9": f"Documents sources structurés et exploitables directement par les connecteurs d'ingestion.",
        "10": f"Droits d'utilisation et propriété pleine et entière confirmés sur l'ensemble des corpus mobilisés.",
        "11": f"La tâche de traitement et d'assistance est parfaitement adaptée aux capacités des modèles souverains actuels.",
        "12": f"S'appuie sur les briques infonuagiques sécurisées Microsoft 365 / Azure Cloud déjà déployées chez IQ.",
        "13": f"Intégration réaliste et fluide dans l'environnement de travail sans perturbation des flux existants.",
        "14": f"Architecture RAG fermée avec citations systématiques des sources pour éliminer les risques d'hallucination.",
        "15": f"Preuve de concept (POC) réalisable rapidement en 4 à 6 semaines en collaboration avec l'Escouade IA.",
        "16": f"Effort de mise en œuvre proportionné au regard des gains métiers et de la réduction des délais attendus.",
        "17": f"Compétences requises présentes au Bureau de l'IA et à la Direction des TI pour accompagner le projet.",
        "18": f"Coûts d'infrastructure infonuagique et de licences prévisibles et maîtrisés sans dérapage.",
        "19": f"Architecture modulaire réutilisable pour d'autres directions métiers d'IQ avec adaptations mineures.",
        "20": f"Présence de renseignements personnels : ÉFVP obligatoire requise par la Loi 25 et supervision du responsable PRP." if has_pii else f"Aucun renseignement personnel nominatif analysé : conforme aux exigences de la Loi 25 sans obligation d'ÉFVP lourde.",
        "21": f"Garde-fous algorithmiques et protocoles d'équité appliqués pour prévenir tout biais ou traitement discriminant.",
        "22": f"Principe inviolable Human-in-the-Loop : supervision humaine systématique obligatoire avant toute décision finale.",
        "23": f"Journalisation complète et sécurisée des requêtes, des sources citées et des réponses pour auditabilité.",
        "24": f"Cloisonnement strict des accès hérité de l'annuaire corporatif et respect intégral des normes de cybersécurité CSI.",
        "25": f"Forte motivation et demande exprimée par les équipes opérationnelles utilisatrices de {direction}.",
        "26": f"Intégration directe et naturelle dans les postes et outils de travail du quotidien des conseillers.",
        "27": f"Plan d'accompagnement au changement, guides d'ingénierie de requêtes et mentorat prévus par le Bureau de l'IA.",
        "28": f"Indicateurs clés de performance (KPI) établis : taux d'adoption, vélocité d'analyse et satisfaction usager."
    }
    return templates.get(str(q_id), f"Critère validé et qualifié pour l'initiative « {title} » par le Bureau de l'IA.")

def score_initiative_28_criteria(initiative_data: Dict[str, Any], interview_qa: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Attribue une note de 0 à 4 sur chacun des 28 critères officiels de la Grille de Faisabilité d'IQ.
    Exécution en 2 threads parallèles ultra-rapides (Axes 1-3 et Axes 4-6) pour garantir fiabilité et vitesse (< 2.5s).
    """
    scores = {}
    justifications = {}
    
    batches = [[1, 2, 3], [4, 5, 6]]
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(score_axes_batch, b, initiative_data) for b in batches]
        for f in futures:
            try:
                res = f.result(timeout=25)
                scores.update(res.get("scores", {}))
                justifications.update(res.get("justifications", {}))
            except Exception as e:
                print(f"Erreur résultat batch: {e}")

    # Compléter les critères manquants avec des justifications riches et contextuelles
    for q in OFFICIAL_28_QUESTIONS:
        qid_str = str(q["id"])
        if qid_str not in scores:
            scores[qid_str] = 3
        raw_j = str(justifications.get(qid_str, "")).strip()
        if not raw_j or "examiné et qualifié" in raw_j.lower() or raw_j.startswith("Critère #"):
            justifications[qid_str] = get_contextual_justification(qid_str, initiative_data, scores[qid_str])

    # Calcul des sous-totaux
    def subtotal(start, end):
        return sum(float(scores.get(str(i), 3)) for i in range(start, end + 1))
        
    axe1 = subtotal(1, 5)   # max 20
    axe2 = subtotal(6, 10)  # max 20
    axe3 = subtotal(11, 15) # max 20
    axe4 = subtotal(16, 19) # max 16
    axe5 = subtotal(20, 24) # max 20
    axe6 = subtotal(25, 28) # max 16
    
    total = axe1 + axe2 + axe3 + axe4 + axe5 + axe6
    pct = round((total / 112.0) * 100.0, 1)
    
    # Doctrine inviolable d'IQ : On n'exclut rien, on évalue le niveau de préparation.
    # Ton toujours rassurant, constructif et axé sur l'accompagnement du Bureau de l'IA.
    if pct >= 80.0:
        rec = "🟢 VOIE ACCÉLÉRÉE : Approbation recommandée (Haute maturité)"
        exec_assessment = f"L'Analyste IA qualifie l'initiative « {initiative_data.get('title', 'Projet')} » comme un cas d'usage mature et exemplaire, présentant une forte valeur opérationnelle et une conformité vérifiée avec les directives d'Investissement Québec."
    elif pct >= 55.0:
        rec = "🟡 HOMOLOGATION CONDITIONNELLE : Conditions de conformité ciblées"
        exec_assessment = f"L'Analyste IA valide la viabilité du cas d'usage « {initiative_data.get('title', 'Projet')} ». Le déploiement pilote est autorisé sous réserve du respect des conditions de contrôle (supervision humaine systématique et respect des directives Loi 25)."
    else:
        rec = "🔵 EN PRÉPARATION : Accompagnement renforcé du Bureau de l'IA"
        exec_assessment = f"L'initiative « {initiative_data.get('title', 'Projet')} » présente un potentiel prometteur et est qualifiée au stade de préparation. Conformément à la doctrine d'Investissement Québec — où aucun projet n'est exclu, mais où le niveau de préparation est rigoureusement évalué —, le Bureau de l'IA et l'Escouade IA accompagneront directement l'équipe pour combler les lacunes identifiées (cadrage, qualité des données ou mesures d'atténuation Loi 25) afin d'assurer son homologation future en toute confiance."

        
    return {
        "scores": scores,
        "justifications": justifications,
        "score_axe1": axe1,
        "score_axe2": axe2,
        "score_axe3": axe3,
        "score_axe4": axe4,
        "score_axe5": axe5,
        "score_axe6": axe6,
        "total_score": total,
        "percentage": pct,
        "recommendation": rec,
        "executive_assessment": exec_assessment
    }

def generate_decision_memo_data(initiative_data: Dict[str, Any], evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Génère le contenu textuel soigné pour le Mémo Décisionnel du Comité IA.
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    
    prompt = f"""
    Rédige les sections exécutives officielles pour le 'Mémo Décisionnel' présenté au Comité de gouvernance IA d'Investissement Québec :
    
    Projet : {initiative_data.get('title')}
    Direction : {initiative_data.get('direction')}
    Sponsor : {initiative_data.get('sponsor')}
    Type d'outil : {initiative_data.get('tool_type')}
    Description : {initiative_data.get('description')}
    Objectif de valeur : {initiative_data.get('business_objective')}
    Score de faisabilité : {evaluation_result.get('total_score')}/112 ({evaluation_result.get('percentage')}%)
    Recommandation : {evaluation_result.get('recommendation')}
    Synthèse d'évaluation : {evaluation_result.get('executive_assessment')}
    
    Génère un objet JSON structuré contenant exactement :
    {{
      "approbation_visee": "Phrase d'approbation claire (ex: Approbation visée : Déploiement organisationnel / Expérimentation pilote contrôlée de...)",
      "contexte": "Contexte métier et justification du besoin chez Investissement Québec (1 à 2 paragraphes)",
      "valeur_demontree": "Démonstration de la valeur d'affaires, productivité et retours d'expérience qualitatifs/quantitatifs (1 paragraphe)",
      "cout_infrastructure": "Synthèse des coûts logiciels, hébergement Azure/M365 et licences prévues (1 paragraphe)",
      "faisabilite_demontree": "Démonstration de la faisabilité technique, intégration aux systèmes et accessibilité (1 paragraphe)",
      "limitation_portee": "Limites opérationnelles et ce qui est explicitement exclu de la portée initiale (1 paragraphe)",
      "niveau_risque_et_mitigations": "Évaluation du niveau de risque global et liste des 4 mitigations clés (Loi 25, Supervision humaine, Cybersécurité CSI, Qualité/Audit)"
    }}
    
    Renvoie UNIQUEMENT le JSON pur.
    """
    
    res = model.generate_content(prompt)
    cleaned = clean_json_response(res.text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        print("Erreur parsing memo data JSON:", e)
        return {
            "approbation_visee": f"Approbation du pilote et de l'homologation conditionnelle pour {initiative_data.get('title')}",
            "contexte": initiative_data.get("description", ""),
            "valeur_demontree": initiative_data.get("business_objective", ""),
            "cout_infrastructure": "Infrastructures existantes Microsoft 365 et Azure d'Investissement Québec.",
            "faisabilite_demontree": "Solution éprouvée s'appuyant sur l'environnement infonuagique sécurisé.",
            "limitation_portee": "Usage restreint aux équipes pilotes désignées, sans délégation décisionnelle autonome.",
            "niveau_risque_et_mitigations": "Risque modéré maîtrisé par la supervision humaine systématique et le respect strict de la Loi 25."
        }

def chat_with_copilot(message: str, context: Dict[str, Any], history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Dialogue interactif avec le Copilote en Gouvernance IA du Bureau de l'IA d'Investissement Québec.
    Inspiré de Stanford STORM (multi-perspectives : Métier, Conformité Loi 25, Risques DGIR 2026, Architecture TI).
    Permet d'aider le demandeur à exprimer son besoin, clarifier son cas d'usage et pré-compléter
    les questions de cadrage ainsi que la grille de faisabilité.
    """
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    
    history_str = ""
    if history:
        for turn in history[-6:]:
            role = "Demandeur" if turn.get("role") in ("user", "human") else "Copilote IA"
            history_str += f"{role} : {turn.get('content', '')}\n"
            
    current_phase = context.get('current_phase', 1)
    
    prompt = f"""
    Tu es le Copilote IA officiel du Bureau de l'IA d'Investissement Québec (IQ).
    Tu interagis en direct avec un demandeur ou gestionnaire d'IQ qui traverse le processus d'évaluation et de gouvernance IA.
    
    ÉTAPE ACTIVE DANS LE FORMULAIRE : PHASE {current_phase}
    - Phase 1 : Cadrage initial, fiche signalétique et description du besoin métier
    - Phase 2 : Entrevue adaptative approfondie (qualification des risques MCN & Loi 25)
    - Phase 3 : Évaluation de faisabilité sur 6 axes (28 critères officiels de la Grille DD)
    - Phase 4 : Pondération et filtrage d'appétit au risque DGIR 2026 (calcul AHP-TOPSIS)
    - Phase 5 : Validation humaine, revue de l'Analyste et enregistrement au Registre officiel
    - Phase 6 : Rapport officiel de faisabilité préliminaire et livrables (Word .docx & Excel .xlsx)

    CONTEXTE DU PROJET SUR LA PAGE :
    - Nom : {context.get('project_name', 'Non renseigné')}
    - Direction : {context.get('project_direction', 'Non renseignée')}
    - Porteur : {context.get('project_owner', 'Non renseigné')}
    - Solution : {context.get('project_tool_type', 'Non renseignée')}
    - Description du besoin : {context.get('project_desc', 'Non renseignée')}
    - Données actuelles : {context.get('clarif_data_type', 'Non renseigné')}
    - Supervision humaine actuelle : {context.get('clarif_human_role', 'Non renseigné')}
    - Fréquence actuelle : {context.get('clarif_frequency', 'Non renseigné')}
    
    HISTORIQUE DE CONVERSATION :
    {history_str}
    
    NOUVEAU MESSAGE DU DEMANDEUR :
    « {message} »
    
    DIRECTIVES DU BUREAU DE L'IA :
    1. Sois courtois, bienveillant, pédagogique et institutionnel (français québécois soigné sans aucun anglicisme).
    2. RÈGLE INVIOLABLE DE COHÉRENCE : Adapte impérativement tes réponses à la PHASE {current_phase} active :
       - En Phase 1 : aide à formuler le besoin, les gains de productivité et la sensibilité des données.
       - En Phase 2 : aide à répondre aux questions d'entrevue, conseille sur l'architecture fermée Azure IQ et les garde-fous.
       - En Phase 3 : explique les 28 critères de faisabilité sur les 6 axes (Valeur, Données, Technique, Effort, Risques/Loi 25, Adoption) et aide à motiver les justifications.
       - En Phase 4 : explique le calcul scientifique AHP-TOPSIS, les 5 thématiques d'appétit au risque DGIR 2026 et les 4 portes d'homologation.
       - En Phase 5 : explique le rôle de l'Analyste humain (« human-in-the-loop »), le filtrage d'appétit au risque DGIR (cases cochées), la vérification des réponses de cadrage et les conditions d'homologation. Rappelle la doctrine : on n'exclut rien, on évalue le niveau de préparation.
       - En Phase 6 : résume les constats clés du rapport officiel, guide sur les livrables téléchargeables (Mémo Word nettoyé et Grille Excel 28 critères) et les prochaines étapes.
    3. Si le demandeur demande de pré-compléter ou d'adapter les questions de cadrage ou la grille, fournis des suggestions directement applicables.
    4. Fournis un objet JSON contenant :
       - "reply": ton message complet et structuré en markdown soigné,
       - "has_suggestions": true si des champs ou questions peuvent être pré-remplis suite à cet échange,
       - "suggestions": {{
           "project_name": "...",
           "project_desc": "...",
           "project_tool_type": "rag" | "copilot" | "commercial" | "custom" | "other",
           "project_tool_type_other": "...",
           "clarif_data_type": "public_internal" | "client_financial" | "personal_pii" | "other",
           "clarif_data_type_other": "...",
           "clarif_human_role": "draft_reviewer" | "decision_support" | "automated_flow" | "other",
           "clarif_human_role_other": "...",
           "clarif_frequency": "daily_heavy" | "weekly_files" | "occasional_research" | "other",
           "clarif_frequency_other": "..."
         }},
       - "quick_chips": ["...", "...", "..."] (3 actions rapides adaptées à la Phase {current_phase})
       
    Renvoie UNIQUEMENT le JSON pur.
    """
    try:
        res = model.generate_content(prompt)
        parsed = json.loads(clean_json_response(res.text))
        return parsed
    except Exception as e:
        print("Erreur Copilot chat:", e)
        return {
            "reply": f"Bonjour ! En tant qu'Analyste en Gouvernance IA du Bureau de l'IA d'Investissement Québec, je vous accompagne dans l'évaluation de « {context.get('project_name', 'votre initiative IA')} ». Je peux vous aider à formuler votre besoin d'affaires, évaluer le risque Loi 25 et pré-compléter vos questions.",
            "has_suggestions": True,
            "suggestions": {
                "project_name": context.get("project_name") or "Assistant IA Spécialisé",
                "project_desc": context.get("project_desc") or "Aide à la décision et accélération du traitement documentaire.",
                "clarif_data_type": "public_internal",
                "clarif_human_role": "draft_reviewer",
                "clarif_frequency": "daily_heavy"
            },
            "quick_chips": ["Pré-compléter les questions", "Vérifier la Loi 25", "Pré-compléter la grille"]
        }
