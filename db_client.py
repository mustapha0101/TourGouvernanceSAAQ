"""
Client de base de données unifié pour les Initiatives IA d'Investissement Québec.
Prend en charge :
1. PostgreSQL managé Render (via DATABASE_URL)
2. PostgreSQL Docker local (port 5433)
3. SQLite local autonome (iq_initiatives.db) en cas d'absence de serveur PostgreSQL
"""

import os
import json
import sqlite3
from typing import Dict, Any, List, Optional

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

DB_HOST = os.getenv("PGHOST", "localhost")
DB_PORT = int(os.getenv("PGPORT", "5433"))
DB_NAME = os.getenv("PGDATABASE", "iq_initiatives_db")
DB_USER = os.getenv("PGUSER", "iquser")
DB_PASSWORD = os.getenv("PGPASSWORD", "iqpassword2026!")

SQLITE_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "iq_initiatives.db"))
CURRENT_DB_TYPE = "postgres"
_postgres_initialized = False

def init_postgres_schema(conn):
    global _postgres_initialized
    if _postgres_initialized:
        return
    schema_path = os.path.join(os.path.dirname(__file__), "init_db.sql")
    if os.path.exists(schema_path):
        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                sql = f.read()
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
            _postgres_initialized = True
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            print(f"[DB] Note schéma PostgreSQL : {e}")

def init_sqlite_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS initiatives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            name TEXT,
            direction TEXT NOT NULL,
            sponsor TEXT NOT NULL,
            owner_name TEXT,
            contact_email TEXT,
            pathway TEXT,
            tool_type TEXT NOT NULL,
            description TEXT,
            business_objective TEXT,
            target_users TEXT,
            data_sources TEXT,
            contains_personal_data INTEGER DEFAULT 0,
            rto_hours INTEGER DEFAULT 72,
            status TEXT DEFAULT 'En cours',
            raw_payload TEXT,
            validated_by TEXT,
            validation_notes TEXT,
            validated_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS initiative_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size_bytes INTEGER,
            content_text TEXT,
            extracted_text TEXT,
            metadata TEXT,
            uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS initiative_interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
            question_key TEXT NOT NULL,
            question_text TEXT NOT NULL,
            agent_rationale TEXT,
            category TEXT,
            response_text TEXT,
            selected_option_value TEXT,
            selected_option_label TEXT,
            reasoning_justification TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS initiative_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
            evaluator_name TEXT,
            score_axe1 REAL,
            score_axe2 REAL,
            score_axe3 REAL,
            score_axe4 REAL,
            score_axe5 REAL,
            score_axe6 REAL,
            total_score REAL,
            percentage REAL,
            recommendation TEXT,
            axe1_valeur REAL,
            axe2_donnees REAL,
            axe3_technique REAL,
            axe4_effort REAL,
            axe5_risques REAL,
            axe6_adoption REAL,
            topsis_score REAL,
            recommended_gate TEXT,
            justification_text TEXT,
            detailed_scores TEXT,
            ai_justifications TEXT,
            evaluated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS generated_deliverables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
            excel_path TEXT,
            docx_memo_path TEXT,
            word_memo_path TEXT,
            summary_report_json TEXT,
            metadata TEXT,
            generated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """)

def get_connection():
    global CURRENT_DB_TYPE
    if PSYCOPG2_AVAILABLE:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            try:
                # Render utilise parfois le schéma legacy postgres://
                if db_url.startswith("postgres://"):
                    db_url = db_url.replace("postgres://", "postgresql://", 1)
                conn = psycopg2.connect(db_url, connect_timeout=3)
                init_postgres_schema(conn)
                CURRENT_DB_TYPE = "postgres"
                return conn
            except Exception as e:
                print(f"[Avertissement] Connexion DATABASE_URL échouée ({e}), repli...")

        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                connect_timeout=2
            )
            init_postgres_schema(conn)
            CURRENT_DB_TYPE = "postgres"
            return conn
        except Exception:
            pass

    # Bascule transparente sur SQLite
    CURRENT_DB_TYPE = "sqlite"
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    init_sqlite_schema(conn)
    return conn

def execute_insert_returning_id(conn, sql: str, params: tuple) -> int:
    is_sqlite = isinstance(conn, sqlite3.Connection)
    if is_sqlite:
        clean_sql = sql.replace("RETURNING id;", "").replace("RETURNING id", "").strip()
        clean_sql = clean_sql.replace("%s", "?")
        cur = conn.cursor()
        cur.execute(clean_sql, params)
        conn.commit()
        return cur.lastrowid
    else:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            new_id = cur.fetchone()[0]
            conn.commit()
            return new_id

def create_initiative(
    title: str,
    direction: str,
    sponsor: str,
    contact_email: Optional[str] = None,
    pathway: str = "Parcours 3 : Cas d'usage & Métier",
    tool_type: Optional[str] = None,
    description: Optional[str] = None,
    business_objective: Optional[str] = None,
    target_users: Optional[str] = None,
    data_sources: Optional[str] = None,
    contains_personal_data: bool = False,
    rto_hours: Optional[int] = 72,
    raw_payload: Optional[Dict] = None
) -> int:
    conn = get_connection()
    try:
        sql = """
            INSERT INTO initiatives (
                title, direction, sponsor, contact_email, pathway,
                tool_type, description, business_objective, target_users,
                data_sources, contains_personal_data, rto_hours, raw_payload
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            ) RETURNING id;
        """
        params = (
            title, direction, sponsor, contact_email, pathway,
            tool_type or "RAG / Assistant IA", description, business_objective, target_users,
            data_sources, bool(contains_personal_data), rto_hours,
            json.dumps(raw_payload or {})
        )
        return execute_insert_returning_id(conn, sql, params)
    finally:
        conn.close()

def save_document(initiative_id: int, file_name: str, file_type: str, file_size: int, content_text: str, metadata: Dict) -> int:
    conn = get_connection()
    try:
        clean_text = (content_text or "").replace("\x00", "")
        sql = """
            INSERT INTO initiative_documents (
                initiative_id, file_name, file_type, file_size_bytes, content_text, metadata
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        params = (initiative_id, file_name, file_type, file_size, clean_text, json.dumps(metadata or {}))
        return execute_insert_returning_id(conn, sql, params)
    finally:
        conn.close()

def save_interview(initiative_id: int, question_key: str, question_text: str, agent_rationale: str, category: str, response_text: str) -> int:
    conn = get_connection()
    try:
        sql = """
            INSERT INTO initiative_interviews (
                initiative_id, question_key, question_text, agent_rationale, category, response_text
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        params = (initiative_id, question_key, question_text, agent_rationale, category, response_text)
        return execute_insert_returning_id(conn, sql, params)
    finally:
        conn.close()

def save_evaluation(
    initiative_id: int,
    evaluator_name: str,
    score_axe1: float,
    score_axe2: float,
    score_axe3: float,
    score_axe4: float,
    score_axe5: float,
    score_axe6: float,
    total_score: float,
    percentage: float,
    recommendation: str,
    detailed_scores: Dict,
    ai_justifications: Dict
) -> int:
    conn = get_connection()
    try:
        sql = """
            INSERT INTO initiative_evaluations (
                initiative_id, evaluator_name, score_axe1, score_axe2, score_axe3,
                score_axe4, score_axe5, score_axe6, total_score, percentage,
                recommendation, detailed_scores, ai_justifications
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s
            ) RETURNING id;
        """
        params = (
            initiative_id, evaluator_name, score_axe1, score_axe2, score_axe3,
            score_axe4, score_axe5, score_axe6, total_score, percentage,
            recommendation, json.dumps(detailed_scores or {}), json.dumps(ai_justifications or {})
        )
        eval_id = execute_insert_returning_id(conn, sql, params)
        
        # Mettre à jour le statut dans initiatives
        update_sql = "UPDATE initiatives SET status = %s WHERE id = %s;"
        if isinstance(conn, sqlite3.Connection):
            update_sql = update_sql.replace("%s", "?")
            cur = conn.cursor()
            cur.execute(update_sql, (recommendation, initiative_id))
            conn.commit()
        else:
            with conn.cursor() as cur:
                cur.execute(update_sql, (recommendation, initiative_id))
                conn.commit()

        return eval_id
    finally:
        conn.close()

def save_deliverables(
    initiative_id: int,
    excel_path: Optional[str] = None,
    docx_memo_path: Optional[str] = None,
    metadata: Optional[Dict] = None
) -> int:
    conn = get_connection()
    try:
        sql = """
            INSERT INTO generated_deliverables (
                initiative_id, excel_path, docx_memo_path, metadata
            ) VALUES (%s, %s, %s, %s)
            RETURNING id;
        """
        params = (initiative_id, excel_path, docx_memo_path, json.dumps(metadata or {}))
        return execute_insert_returning_id(conn, sql, params)
    finally:
        conn.close()

def list_initiatives() -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        sql = """
            SELECT i.*, 
                   e.total_score, e.percentage, e.recommendation, e.evaluator_name, e.evaluated_at,
                   d.excel_path, d.docx_memo_path
            FROM initiatives i
            LEFT JOIN initiative_evaluations e ON e.initiative_id = i.id
            LEFT JOIN generated_deliverables d ON d.initiative_id = i.id
            ORDER BY i.created_at DESC;
        """
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute(sql)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        else:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql)
                return cur.fetchall()
    finally:
        conn.close()

def get_initiative_by_id(init_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        sql = """
            SELECT i.*, 
                   e.score_axe1, e.score_axe2, e.score_axe3, e.score_axe4, e.score_axe5, e.score_axe6,
                   e.total_score, e.percentage, e.recommendation, e.detailed_scores, e.ai_justifications,
                   d.excel_path, d.docx_memo_path
            FROM initiatives i
            LEFT JOIN initiative_evaluations e ON e.initiative_id = i.id
            LEFT JOIN generated_deliverables d ON d.initiative_id = i.id
            WHERE i.id = %s;
        """
        if isinstance(conn, sqlite3.Connection):
            sql = sql.replace("%s", "?")
            cur = conn.cursor()
            cur.execute(sql, (init_id,))
            row = cur.fetchone()
            return dict(row) if row else None
        else:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (init_id,))
                return cur.fetchone()
    finally:
        conn.close()

def validate_initiative(initiative_id: int, validator_name: str, final_decision: str, validation_notes: str) -> bool:
    """
    Consigne la décision officielle de validation humaine prise par l'Analyste ou Admin.
    """
    conn = get_connection()
    try:
        sql = """
            UPDATE initiatives 
            SET status = %s,
                validated_by = %s,
                validation_notes = %s,
                validated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """
        if isinstance(conn, sqlite3.Connection):
            sql = sql.replace("%s", "?")
            cur = conn.cursor()
            cur.execute(sql, (final_decision, validator_name, validation_notes, initiative_id))
            conn.commit()
        else:
            with conn.cursor() as cur:
                cur.execute(sql, (final_decision, validator_name, validation_notes, initiative_id))
                conn.commit()
        return True
    except Exception as e:
        print("Erreur validation initiative:", e)
        return False
    finally:
        conn.close()
