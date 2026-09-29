-- ============================================================================
-- SCHÉMA DE BASE DE DONNÉES — GOUVERNANCE & ANALYSE D'INITIATIVES IA (IQ)
-- Investissement Québec • Direction des Technologies & Bureau de l'IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS initiatives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    direction VARCHAR(255) NOT NULL,
    sponsor VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    contact_email VARCHAR(255),
    pathway VARCHAR(100),
    tool_type VARCHAR(100) NOT NULL,
    description TEXT,
    business_objective TEXT,
    target_users TEXT,
    data_sources TEXT,
    contains_personal_data BOOLEAN DEFAULT FALSE,
    rto_hours INTEGER DEFAULT 72,
    status VARCHAR(100) DEFAULT 'En cours',
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_documents (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT,
    content_text TEXT,
    extracted_text TEXT,
    metadata JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_interviews (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    agent_rationale TEXT,
    category VARCHAR(100),
    response_text TEXT,
    selected_option_value VARCHAR(100),
    selected_option_label TEXT,
    reasoning_justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS initiative_evaluations (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
    evaluator_name VARCHAR(255),
    score_axe1 NUMERIC(5, 2),
    score_axe2 NUMERIC(5, 2),
    score_axe3 NUMERIC(5, 2),
    score_axe4 NUMERIC(5, 2),
    score_axe5 NUMERIC(5, 2),
    score_axe6 NUMERIC(5, 2),
    total_score NUMERIC(5, 2),
    percentage NUMERIC(5, 2),
    recommendation VARCHAR(255),
    axe1_valeur NUMERIC(3, 2),
    axe2_donnees NUMERIC(3, 2),
    axe3_technique NUMERIC(3, 2),
    axe4_effort NUMERIC(3, 2),
    axe5_risques NUMERIC(3, 2),
    axe6_adoption NUMERIC(3, 2),
    topsis_score NUMERIC(5, 2),
    recommended_gate VARCHAR(100),
    justification_text TEXT,
    detailed_scores JSONB,
    ai_justifications JSONB,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_deliverables (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
    excel_path VARCHAR(500),
    docx_memo_path VARCHAR(500),
    word_memo_path VARCHAR(500),
    summary_report_json JSONB,
    metadata JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
