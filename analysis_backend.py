"""
Serveur API FastAPI pour le Module d'Analyse et d'Évaluation d'Initiatives IA d'Investissement Québec.
Exécute les agents d'extraction, l'entrevue adaptative avec le mentor,
la notation des 28 critères et la génération des livrables Excel / Word.
"""

import os
import shutil
import tempfile
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import document_parser
import db_client
import iq_evaluation_engine
import deliverable_generator

app = FastAPI(
    title="Investissement Québec — API d'Analyse des Initiatives IA",
    description="Backend d'évaluation intelligente de cas d'usage avec PostgreSQL, LangChain/Gemini et génération Excel/Word",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class InterviewAnswer(BaseModel):
    key: str
    question: str
    rationale: Optional[str] = ""
    category: Optional[str] = "Général"
    response: str

class EvaluationPayload(BaseModel):
    title: str
    direction: str
    sponsor: str
    contact_email: Optional[str] = ""
    pathway: Optional[str] = "Parcours 3 : Cas d'usage & Métier"
    tool_type: Optional[str] = "RAG / Assistant IA"
    description: str
    business_objective: str
    target_users: Optional[str] = "Équipes internes"
    data_sources: Optional[str] = "Documents internes"
    contains_personal_data: Optional[bool] = False
    rto_hours: Optional[int] = 72
    evaluator_name: Optional[str] = "Bureau de l'IA — Investissement Québec"
    interview_qa: Optional[List[InterviewAnswer]] = []
    document_ref: Optional[Dict[str, Any]] = None
    custom_scores: Optional[Dict[str, float]] = None
    custom_justifications: Optional[Dict[str, str]] = None

class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}
    history: Optional[List[Dict[str, str]]] = []

@app.get("/api/health")
def health():
    db_ok = False
    try:
        conn = db_client.get_connection()
        conn.close()
        db_ok = True
    except Exception as e:
        db_error = str(e)

    return {
        "status": "healthy",
        "database_connected": db_ok,
        "database_port": db_client.DB_PORT,
        "ai_model": iq_evaluation_engine.MODEL_NAME
    }

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """
    Téléverse et extrait le contenu textuel d'un document (Word, PowerPoint, Excel, PDF).
    Effectue une analyse contextuelle automatique via l'agent Gemini.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".docx", ".pptx", ".xlsx", ".xls", ".pdf", ".txt", ".md"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Format '{ext}' non supporté. Veuillez soumettre un fichier .docx, .pptx, .xlsx ou .pdf."
        )

    temp_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed_doc = document_parser.extract_document_content(temp_path)
        extracted_context = iq_evaluation_engine.extract_initiative_context(parsed_doc["text"])

        return {
            "success": True,
            "document_info": {
                "filename": file.filename,
                "file_type": parsed_doc.get("file_type"),
                "text_length": parsed_doc.get("length"),
                "file_path": temp_path
            },
            "extracted_context": extracted_context,
            "raw_text_preview": parsed_doc["text"][:1500]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse du document : {str(e)}")

@app.post("/api/pre-evaluate-grid")
def pre_evaluate_grid(context: Dict[str, Any]):
    """
    Entrevue officielle du Mentor IA basée sur la Grille de Faisabilité (28 critères sur 6 axes).
    Analyse le cas d'usage et pré-complète chaque critère avec une note (0-4) et un justificatif argumenté.
    """
    try:
        scoring_res = iq_evaluation_engine.score_initiative_28_criteria(context, [])
        
        # Structuration par axe selon la nomenclature officielle d'IQ
        axes_data = [
            {"id": 1, "name": "Axe 1 — Valeur d'affaires", "max": 20, "weight": "15 %", "questions": []},
            {"id": 2, "name": "Axe 2 — Données disponibles & Qualité", "max": 20, "weight": "15 %", "questions": []},
            {"id": 3, "name": "Axe 3 — Faisabilité technique & Intégration", "max": 20, "weight": "10 %", "questions": []},
            {"id": 4, "name": "Axe 4 — Effort, coûts & Résilience (RTO)", "max": 16, "weight": "5 %", "questions": []},
            {"id": 5, "name": "Axe 5 — Risques, Conformité & Loi 25", "max": 20, "weight": "40 %", "questions": []},
            {"id": 6, "name": "Axe 6 — Adoption & Conduite du changement", "max": 16, "weight": "15 %", "questions": []}
        ]
        
        axes_map = {a["id"]: a for a in axes_data}
        
        for q in iq_evaluation_engine.OFFICIAL_28_QUESTIONS:
            qid_str = str(q["id"])
            score_val = scoring_res["scores"].get(qid_str, 3)
            justif_val = scoring_res["justifications"].get(qid_str, "Critère évalué et validé pour le projet.")
            q_obj = {
                "id": q["id"],
                "axe_id": q["axe"],
                "title": q["title"],
                "desc": q["desc"],
                "score": score_val,
                "justification": justif_val
            }
            axes_map[q["axe"]]["questions"].append(q_obj)
            
        return {
            "success": True,
            "mentor_greeting": f"Bonjour ! En tant que Mentor IA d'Investissement Québec, j'ai analysé votre dossier « {context.get('title', 'Initiative')} ». Conformément à notre Grille de Faisabilité officielle, voici l'évaluation critère par critère avec les notes et justificatifs argumentés. Vous pouvez ajuster chaque critère avant l'arbitrage final.",
            "total_score": scoring_res["total_score"],
            "percentage": scoring_res["percentage"],
            "recommendation": scoring_res["recommendation"],
            "executive_assessment": scoring_res["executive_assessment"],
            "axes": axes_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'entrevue officielle sur grille : {str(e)}")

@app.post("/api/generate-interview")
def generate_interview(context: Dict[str, Any]):
    """
    Génère 3 à 5 questions adaptatives personnalisées avec le RATIONALE transparent du Mentor IA.
    """
    try:
        questions = iq_evaluation_engine.generate_adaptive_interview(context)
        return {
            "success": True,
            "mentor_greeting": "Bonjour ! En tant que Mentor IA d'Investissement Québec, j'ai préparé ces questions ciblées afin de garantir la conformité et la faisabilité optimale de votre projet.",
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de génération d'entrevue : {str(e)}")

@app.post("/api/copilot-chat")
def copilot_chat(payload: CopilotChatRequest):
    """
    Dialogue interactif avec le Copilote en Gouvernance IA du Bureau de l'IA d'Investissement Québec.
    Accompagne le demandeur, répond à ses questions et pré-complète dynamiquement le formulaire.
    """
    try:
        response = iq_evaluation_engine.chat_with_copilot(
            message=payload.message,
            context=payload.context or {},
            history=payload.history or []
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du copilote IA : {str(e)}")

@app.post("/api/submit-evaluation")
def submit_evaluation(payload: EvaluationPayload):
    """
    Orchestre le cycle d'évaluation complet :
    1. Notation des 28 critères de faisabilité sur 6 axes via Gemini
    2. Persistance dans PostgreSQL (initiatives, documents, entrevues, évaluations)
    3. Génération de la Grille Excel de Faisabilité complétée (.xlsx)
    4. Rédaction et génération du Mémo Décisionnel du Comité IA (.docx)
    5. Sauvegarde des livrables et renvoi des URLs de téléchargement.
    """
    initiative_data = {
        "title": payload.title,
        "direction": payload.direction,
        "sponsor": payload.sponsor,
        "contact_email": payload.contact_email,
        "pathway": payload.pathway,
        "tool_type": payload.tool_type,
        "description": payload.description,
        "business_objective": payload.business_objective,
        "target_users": payload.target_users,
        "data_sources": payload.data_sources,
        "contains_personal_data": payload.contains_personal_data,
        "rto_hours": payload.rto_hours,
        "evaluator_name": payload.evaluator_name or "Bureau de l'IA — Investissement Québec"
    }

    interview_qa_list = [qa.dict() for qa in (payload.interview_qa or [])]

    # 1. Notation des 28 critères
    # Si l'utilisateur ou le formulaire fournit les notes des 28 critères
    if payload.custom_scores:
        scores = {str(k): float(v) for k, v in payload.custom_scores.items()}
        justifications = payload.custom_justifications or {}
        for i in range(1, 29):
            k = str(i)
            if k not in justifications or not justifications[k]:
                justifications[k] = iq_evaluation_engine.get_contextual_justification(k, initiative_data, int(scores.get(k, 3)))
        
        def subtotal(start, end):
            return sum(float(scores.get(str(i), 3)) for i in range(start, end + 1))
            
        axe1 = subtotal(1, 5)
        axe2 = subtotal(6, 10)
        axe3 = subtotal(11, 15)
        axe4 = subtotal(16, 19)
        axe5 = subtotal(20, 24)
        axe6 = subtotal(25, 28)
        total = axe1 + axe2 + axe3 + axe4 + axe5 + axe6
        pct = round((total / 112.0) * 100.0, 1)
        if pct >= 80.0:
            rec = "🟢 VOIE ACCÉLÉRÉE : Approbation recommandée (Haute maturité)"
        elif pct >= 55.0:
            rec = "🟡 HOMOLOGATION CONDITIONNELLE : Conditions de conformité ciblées"
        else:
            rec = "🔵 EN PRÉPARATION : Accompagnement renforcé du Bureau de l'IA"
            
        scoring_result = {
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
            "executive_assessment": f"Évaluation rigoureuse sur 28 critères de gouvernance IA selon le Cadre DGIR 2026. L'initiative obtient {total}/112 points ({pct}%), positionnée en {rec}."
        }
    else:
        # Notation initiale des 28 critères via le moteur IA
        scoring_result = iq_evaluation_engine.score_initiative_28_criteria(initiative_data, interview_qa_list)

    # 2. Persistance dans PostgreSQL
    init_id = db_client.create_initiative(
        title=payload.title,
        direction=payload.direction,
        sponsor=payload.sponsor,
        contact_email=payload.contact_email,
        pathway=payload.pathway,
        tool_type=payload.tool_type,
        description=payload.description,
        business_objective=payload.business_objective,
        target_users=payload.target_users,
        data_sources=payload.data_sources,
        contains_personal_data=payload.contains_personal_data,
        rto_hours=payload.rto_hours,
        raw_payload=payload.dict()
    )

    # Sauvegarde des entrevues
    for qa in interview_qa_list:
        db_client.save_interview(
            initiative_id=init_id,
            question_key=qa.get("key", "q"),
            question_text=qa.get("question", ""),
            agent_rationale=qa.get("rationale", ""),
            category=qa.get("category", "Général"),
            response_text=qa.get("response", "")
        )

    # Sauvegarde du document source si présent
    if payload.document_ref:
        try:
            doc_path = payload.document_ref.get("file_path")
            if doc_path and os.path.exists(doc_path):
                file_size = os.path.getsize(doc_path)
                try:
                    parsed = document_parser.extract_document_content(doc_path)
                    doc_text = (parsed.get("text", "") or "")[:50000].replace("\x00", "")
                except Exception:
                    doc_text = f"Document analysé: {payload.document_ref.get('filename')}"
                
                db_client.save_document(
                    initiative_id=init_id,
                    file_name=payload.document_ref.get("filename", "document_source"),
                    file_type=payload.document_ref.get("file_type", "docx"),
                    file_size=file_size,
                    content_text=doc_text,
                    metadata=payload.document_ref
                )
        except Exception as e:
            print(f"[Avertissement] Impossible d'archiver la copie brute du document: {e}")

    # Sauvegarde de l'évaluation
    eval_id = db_client.save_evaluation(
        initiative_id=init_id,
        evaluator_name=initiative_data["evaluator_name"],
        score_axe1=scoring_result["score_axe1"],
        score_axe2=scoring_result["score_axe2"],
        score_axe3=scoring_result["score_axe3"],
        score_axe4=scoring_result["score_axe4"],
        score_axe5=scoring_result["score_axe5"],
        score_axe6=scoring_result["score_axe6"],
        total_score=scoring_result["total_score"],
        percentage=scoring_result["percentage"],
        recommendation=scoring_result["recommendation"],
        detailed_scores=scoring_result["scores"],
        ai_justifications=scoring_result["justifications"]
    )

    # 3. Rédaction du Mémo Décisionnel
    memo_data = iq_evaluation_engine.generate_decision_memo_data(initiative_data, scoring_result)

    # 4. Génération des fichiers officiels
    excel_path = deliverable_generator.generate_excel_feasibility(
        initiative_data=initiative_data,
        evaluation_result=scoring_result,
        file_prefix=f"IQ_Faisabilite_{init_id}"
    )

    word_path = deliverable_generator.generate_word_memo(
        initiative_data=initiative_data,
        evaluation_result=scoring_result,
        memo_data=memo_data,
        file_prefix=f"IQ_Memo_Comite_{init_id}"
    )

    # 5. Enregistrement des livrables en base
    deliv_id = db_client.save_deliverables(
        initiative_id=init_id,
        excel_path=excel_path,
        docx_memo_path=word_path,
        metadata={"generated_at": str(os.path.getmtime(excel_path))}
    )

    return {
        "success": True,
        "initiative_id": init_id,
        "evaluation_id": eval_id,
        "deliverables": {
            "excel_filename": os.path.basename(excel_path),
            "excel_url": f"/api/download/{os.path.basename(excel_path)}",
            "word_filename": os.path.basename(word_path),
            "word_url": f"/api/download/{os.path.basename(word_path)}"
        },
        "scores": scoring_result,
        "memo_summary": memo_data
    }

@app.api_route("/api/download/{filename}", methods=["GET", "HEAD"])
def download_file(filename: str):
    file_path = os.path.join(deliverable_generator.OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable.")
    
    media_type = "application/octet-stream"
    if filename.endswith(".docx"):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.endswith(".xlsx"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.endswith(".pdf"):
        media_type = "application/pdf"
        
    return FileResponse(
        file_path, 
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

class ValidationPayload(BaseModel):
    decision: Optional[str] = None
    validation_decision: Optional[str] = None
    notes: Optional[str] = ""
    validation_notes: Optional[str] = ""
    validator_name: Optional[str] = None
    validated_by: Optional[str] = None

@app.post("/api/validate-initiative/{init_id}")
def validate_initiative_endpoint(init_id: int, payload: ValidationPayload):
    """
    Validation humaine officielle d'une initiative par un Analyste en Gouvernance IA ou Admin.
    """
    dec = payload.decision or payload.validation_decision or "🟡 HOMOLOGATION CONDITIONNELLE : Conditions de conformité ciblées"
    v_notes = payload.notes or payload.validation_notes or ""
    v_name = payload.validator_name or payload.validated_by or "Analyste en Gouvernance IA — Bureau de l'IA"
    
    ok = db_client.validate_initiative(
        initiative_id=init_id,
        validator_name=v_name,
        final_decision=dec,
        validation_notes=v_notes
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Échec de l'enregistrement de la validation.")
    return {
        "success": True,
        "message": f"Initiative #{init_id} validée avec succès avec la mention : {payload.decision}",
        "decision": payload.decision,
        "validator_name": payload.validator_name
    }

@app.get("/api/initiatives")
def get_initiatives():
    return db_client.list_initiatives()

@app.get("/api/initiatives/{init_id}")
def get_initiative(init_id: int):
    init = db_client.get_initiative_by_id(init_id)
    if not init:
        raise HTTPException(status_code=404, detail="Initiative introuvable.")
    return init

# =============================================================================
# ARCHITECTURE MULTI-AGENTS STORM : GESTION DES 4 AGENTS ET RÈGLES D'ANALYSE
# =============================================================================
AGENTS_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "storm_agents_config.json")

DEFAULT_STORM_AGENTS = {
    "agent_risk": {
        "id": "agent_risk",
        "name": "Agent de Risque & Conformité DGIR",
        "icon": "🛡️",
        "badge": "RISQUE & CONFORMITÉ",
        "status": "Actif",
        "model": "Gemini 2.5 Flash / Cadre DGIR 2026",
        "description": "Responsable du filtrage d'appétit au risque (5 thématiques DGIR), de l'évaluation de la sensibilité Loi 25 PII et du calcul vectoriel AHP-TOPSIS.",
        "rules": [
            {
                "id": "regle_grille_appetit",
                "name": "Grille d'évaluation cas d'usage DGIR 2026",
                "source": "Grille évaluation cas usage.xlsx",
                "desc": "Filtrage obligatoire sur 5 thématiques (Nature des données, Type d'outil, Extrant crédit, Exposition externe, Matérialité RTO).",
                "enabled": True,
                "threshold": "Intolérance PII non encadrée"
            },
            {
                "id": "regle_loi_25_pii",
                "name": "Protection des Renseignements Personnels (Loi 25)",
                "source": "Loi 25 Québec & Cadre MCN",
                "desc": "Déclenchement systématique de l'Évaluation des Facteurs relatifs à la Vie Privée (ÉFVP) dès détection de données nominatives.",
                "enabled": True,
                "threshold": "Obligatoire si PII = Oui"
            },
            {
                "id": "regle_ahp_topsis",
                "name": "Calcul Vectoriel AHP-TOPSIS de Risque",
                "source": "Matrice AHP DGIR 2026",
                "desc": "Pondération prépondérante de l'Axe Risques & Loi 25 (40 %) pour éliminer les faux positifs de compensation linéaire.",
                "enabled": True,
                "threshold": "Seuil d'homologation C* >= 55 %"
            },
            {
                "id": "regle_audit_csi",
                "name": "Audit de Cybersécurité CSI",
                "source": "Politique de Sécurité TI d'IQ",
                "desc": "Obligation d'audit de sécurité des accès et de revue des flux pour toute solution connectée.",
                "enabled": True,
                "threshold": "Revue trimestrielle"
            }
        ]
    },
    "agent_feasibility": {
        "id": "agent_feasibility",
        "name": "Agent de Faisabilité & Architecture TI",
        "icon": "🧠",
        "badge": "FAISABILITÉ & ARCHITECTURE",
        "status": "Actif",
        "model": "Gemini 2.5 Flash / Grille DD 28 critères",
        "description": "Responsable de la notation des 28 critères de la Grille DD sur 6 axes, de la validation d'intégration infonuagique Azure IQ et de la résilience opérationnelle.",
        "rules": [
            {
                "id": "regle_grille_dd_28",
                "name": "Grille Officielle de Faisabilité (28 critères)",
                "source": "Grille_faisabilite_cas_usage_IA.xlsx (Feuille Grille DD)",
                "desc": "Notation multicritère de 0 à 4 sur les 6 axes institutionnels avec génération de justifications écrites complètes.",
                "enabled": True,
                "threshold": "Score de passage >= 70 / 112 pts"
            },
            {
                "id": "regle_rag_fermee",
                "name": "Architecture RAG Fermée & Zéro Rétention (ZDR)",
                "source": "Standards Architecture d'Entreprise IQ",
                "desc": "Exigence d'indexation vectorielle sur tenants sécurisés Azure IQ sans réentraînement externe du LLM.",
                "enabled": True,
                "threshold": "Conformité 100 % Azure Cloud"
            },
            {
                "id": "regle_qualite_donnees",
                "name": "Contrôle de Qualité et Fraîcheur des Données",
                "source": "Modèle OUT_evaluation_occasions_IA_VT (Dimension Technologie)",
                "desc": "Vérification de l'exhaustivité, absence de doublons, conformité des formats et actualité des corpus documentaires.",
                "enabled": True,
                "threshold": "Note minimale de 3/4"
            },
            {
                "id": "regle_rto_resilience",
                "name": "Résilience et Matérialité RTO (> 72h)",
                "source": "Plan de Continuité des Affaires IQ",
                "desc": "Les pannes du modèle ne doivent pas paralyser les opérations critiques de crédit ou de décaissement.",
                "enabled": True,
                "threshold": "RTO toléré > 72 heures"
            }
        ]
    },
    "agent_writer": {
        "id": "agent_writer",
        "name": "Agent Rédacteur & Synthèse Métier",
        "icon": "✍️",
        "badge": "RÉDACTION EXÉCUTIVE",
        "status": "Actif",
        "model": "Gemini 2.5 Flash / Gabarit STORM",
        "description": "Responsable de la synthèse exécutive, de la rédaction du Mémo Décisionnel du Comité IA (Word .docx), des retours sur investissement et du respect linguistique.",
        "rules": [
            {
                "id": "regle_format_storm",
                "name": "Structure Multi-Perspectives Stanford STORM",
                "source": "Cadre de Synthèse Exécutive d'IQ",
                "desc": "Table des matières hiérarchique croisant Cadrage Métier, Risques DGIR, Faisabilité DD et Recommandation Gardien.",
                "enabled": True,
                "threshold": "TOC Exécutive Complète"
            },
            {
                "id": "regle_titres_blanc_bleu",
                "name": "Charte Graphique : Titres Blanc sur Bleu Nuit",
                "source": "Gabarit Officiel Word IQ (storm_memo_generator)",
                "desc": "Bandeaux et en-têtes avec texte BLANC PUR (#FFFFFF) sur fond BLEU NUIT (#002060). Zéro bleu sur bleu.",
                "enabled": True,
                "threshold": "Contraste AAA"
            },
            {
                "id": "regle_francais_soigne",
                "name": "Règles Linguistiques Institutionnelles du Québec",
                "source": "Charte AGENTS.md d'Investissement Québec",
                "desc": "Français institutionnel soigné sans anglicismes (ex: 'Prise en charge des demandes', 'Voie accélérée', 'Supervision humaine').",
                "enabled": True,
                "threshold": "Zéro anglicisme"
            },
            {
                "id": "regle_roi_productivite",
                "name": "Quantification de la Valeur et Gains de Temps",
                "source": "Dimension Impact OUT_evaluation_occasions_IA_VT",
                "desc": "Chiffrage des gains hebdomadaires par utilisateur, accélération des processus et réduction du taux d'erreurs.",
                "enabled": True,
                "threshold": "Gains > 4h/semaine"
            }
        ]
    },
    "agent_gatekeeper": {
        "id": "agent_gatekeeper",
        "name": "Agent Valideur / Gardien d'Homologation",
        "icon": "⚖️",
        "badge": "GARDIEN D'HOMOLOGATION",
        "status": "Actif",
        "model": "Moteur Décisionnel AHP-TOPSIS / Portes d'Homologation",
        "description": "Responsable de l'arbitrage des 4 portes d'homologation selon la doctrine « on n'exclut rien, on évalue le niveau de préparation » et de la table des signatures.",
        "rules": [
            {
                "id": "regle_doctrine_inclusive",
                "name": "Doctrine Inclusive (« On n'exclut rien »)",
                "source": "Directive de Présidence du Bureau de l'IA",
                "desc": "Tout projet est accompagné pour identifier ses lacunes et le porter à maturité. Le statut d'homologation mesure le niveau de préparation.",
                "enabled": True,
                "threshold": "Accompagnement Garanti"
            },
            {
                "id": "regle_4_portes",
                "name": "Arbitrage des 4 Portes d'Homologation",
                "source": "Cadre Unifié DGIR 2026",
                "desc": "Porte 1: Voie accélérée (> 80%), Porte 2: Homologation conditionnelle (55-80%), Porte 3: Évaluation approfondie (30-54%), Porte 4: Reconfiguration (< 30%).",
                "enabled": True,
                "threshold": "Porte 2 par défaut (> 55 %)"
            },
            {
                "id": "regle_supervision_humaine",
                "name": "Supervision Humaine Obligatoire (Human-in-the-Loop)",
                "source": "NIST AI RMF 1.0 & MCN Québec",
                "desc": "Interdiction formelle de toute décision automatisée autonome sans relecture et signature humaine.",
                "enabled": True,
                "threshold": "Validation humaine requise"
            },
            {
                "id": "regle_signatures_quadripartites",
                "name": "Table des Signatures Multi-Instances",
                "source": "Mémo Décisionnel Section 6",
                "desc": "Validation formelle requérant les 4 instances : Requérant Métier, Bureau de l'IA, TI et Gestion des Risques (DGIR).",
                "enabled": True,
                "threshold": "4 Signatures"
            }
        ]
    }
}

def load_agents_config() -> Dict[str, Any]:
    if os.path.exists(AGENTS_CONFIG_FILE):
        try:
            with open(AGENTS_CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Erreur de lecture de storm_agents_config.json:", e)
    return DEFAULT_STORM_AGENTS

def save_agents_config(config: Dict[str, Any]):
    with open(AGENTS_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

@app.get("/api/governance-agents/config")
def get_governance_agents_config():
    """
    Retourne la configuration active des 4 Agents de Gouvernance STORM et leurs règles d'analyse.
    """
    return {
        "success": True,
        "agents": load_agents_config()
    }

@app.post("/api/governance-agents/config")
def update_governance_agents_config(payload: Dict[str, Any]):
    """
    Met à jour les règles d'analyse, seuils et activations des agents STORM depuis la console d'administration.
    """
    try:
        current_config = load_agents_config()
        if "agents" in payload and isinstance(payload["agents"], dict):
            current_config = payload["agents"]
        else:
            current_config.update(payload)
        save_agents_config(current_config)
        return {
            "success": True,
            "message": "Configuration des 4 agents STORM et règles d'analyse enregistrée avec succès.",
            "agents": current_config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'enregistrement de la configuration des agents : {str(e)}")

@app.post("/api/governance-agents/reset")
def reset_governance_agents_config():
    """
    Rétablit les règles et seuils d'analyse par défaut des 4 agents STORM.
    """
    save_agents_config(DEFAULT_STORM_AGENTS)
    return {
        "success": True,
        "message": "Configuration par défaut des 4 agents STORM rétablie avec succès.",
        "agents": DEFAULT_STORM_AGENTS
    }


if __name__ == "__main__":
    import uvicorn
    is_prod = bool(os.getenv("RENDER") or os.getenv("NODE_ENV") == "production")
    uvicorn.run("analysis_backend:app", host="0.0.0.0", port=8000, reload=not is_prod)
