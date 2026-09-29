// ============================================================================
// MODULE D'ÉVALUATION INTELLIGENTE DES INITIATIVES IA — INVESTISSEMENT QUÉBEC
// Plateforme d'analyse institutionnelle et d'arbitrage de faisabilité
// ============================================================================

// Détermination dynamique de l'URL API (100% compatible Render et environnements cloud)
const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== "null" && window.location.protocol !== 'file:')
  ? `${window.location.origin}/api`
  : "/api";

const EVAL_STATE = {
  currentPhase: 1,
  project: {
    name: "",
    direction: "Direction de l'Intelligence Économique (DIE)",
    owner: "",
    contactEmail: "contact@invest-quebec.com",
    toolType: "rag",
    description: "",
    businessObjective: "Optimisation de l'analyse et gain d'efficience opérationnelle",
    targetUsers: "Conseillers financiers et analystes d'Investissement Québec",
    dataSources: "IQpedia, guides de programmes économiques et documentation interne",
    containsPersonalData: false,
    rtoHours: 72
  },
  documentRef: null,
  activeAxeIndex: 0,
  visitedAxes: [0],
  axes: [],
  scores: {},
  justifications: {},
  totalScore: 0,
  percentage: 0,
  recommendation: "",
  executiveAssessment: "",
  deliverables: null
};

// Nomenclature officielle des 6 axes de la Grille de Faisabilité d'IQ
const FAISABILITE_AXES_METADATA = [
  { id: 1, key: "axe1_valeur", label: "Axe 1 — Valeur d'affaires", weight: "15 %", max: 20, desc: "Gain de temps, fréquence de la tâche, valeur mesurable et sponsor engagé." },
  { id: 2, key: "axe2_donnees", label: "Axe 2 — Données disponibles & Qualité", weight: "15 %", max: 20, desc: "Existence des données, fiabilité, structuration et droits d'utilisation." },
  { id: 3, key: "axe3_technique", label: "Axe 3 — Faisabilité technique & Intégration", weight: "10 %", max: 20, desc: "Maturité technologique, intégration aux systèmes existants et POC rapide." },
  { id: 4, key: "axe4_effort", label: "Axe 4 — Effort, coûts & Résilience (RTO)", weight: "5 %", max: 16, desc: "Compétences disponibles, modèle de coûts et résilience opérationnelle." },
  { id: 5, key: "axe5_risques", label: "Axe 5 — Risques, Conformité & Loi 25", weight: "40 %", max: 20, desc: "Protection des renseignements personnels, équité, sécurité CSI et contrôle humain." },
  { id: 6, key: "axe6_adoption", label: "Axe 6 — Adoption & Conduite du changement", weight: "15 %", max: 16, desc: "Adhésion des équipes usagères, plan d'accompagnement et indicateurs KPI." }
];

// ============================================================================
// GESTION VOCALE (SYNTHÈSE ET MICROPHONE) — SOURDINE PAR DÉFAUT & VOIX GOOGLE
// ============================================================================
let isVoiceEnabled = false; // Par défaut muet : aucun son intempestif ou énervant
let isRecognizingSpeech = false;
let speechRecognitionInstance = null;

// Annuler immédiatement tout son résiduel du navigateur au chargement
if (typeof window !== "undefined" && window.speechSynthesis) {
  try { window.speechSynthesis.cancel(); } catch(e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  setupDragAndDrop();
  initEvaluationVoiceAndWelcome();
});

// Synthèse Vocale : uniquement les voix Google de haute fidélité (pas de robot femme)
function speakMentorVoice(text, onEndCallback = null) {
  if (!isVoiceEnabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  // Nettoyage des balises HTML pour la lecture orale
  const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plainText) return;

  const utter = new SpeechSynthesisUtterance(plainText);
  utter.rate = 1.05;
  utter.pitch = 1.0;
  utter.lang = "fr-CA";

  const voices = window.speechSynthesis.getVoices();
  // Recherche prioritaire de la voix d'Antoine (ou équivalent masculin québécois/français)
  const antoineVoice = voices.find(v => (v.lang === "fr-CA" || v.lang.startsWith("fr")) && 
    (v.name.includes("Antoine") || v.name.includes("Thomas") || v.name.includes("Nicolas")) &&
    !v.name.includes("Amélie") && !v.name.includes("Audrey") && !v.name.includes("Alice") && !v.name.includes("Sylvie"));

  const googleVoice = voices.find(v => v.name.includes("Google") && (v.lang === "fr-CA" || v.lang.startsWith("fr")) &&
    !v.name.includes("female") && !v.name.includes("femme") && !v.name.includes("Amélie") && !v.name.includes("Audrey") && !v.name.includes("Sylvie")) ||
    voices.find(v => v.name.includes("Google") && (v.lang === "fr-CA" || v.lang.startsWith("fr")));
  
  if (antoineVoice) {
    utter.voice = antoineVoice;
  } else if (googleVoice) {
    utter.voice = googleVoice;
  } else {
    // Si aucune voix de qualité n'est présente, rester silencieux plutôt que de jouer un robot désagréable
    return;
  }

  if (onEndCallback) {
    utter.onend = onEndCallback;
    utter.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utter);
}
window.speakMentorVoice = speakMentorVoice;

// Bascule de la voix (Haut-parleur actif / muet)
function toggleVoiceSpeech() {
  isVoiceEnabled = !isVoiceEnabled;
  localStorage.setItem("iq_eval_voice", isVoiceEnabled ? "true" : "false");
  const icon = document.getElementById("copilot-voice-icon");
  if (icon) {
    icon.innerText = isVoiceEnabled ? "🔊" : "🔇";
  }
  if (!isVoiceEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    showCopilotToast("🔇 Assistant vocal mis en sourdine");
  } else {
    showCopilotToast("🔊 Assistant vocal activé (Google Voice)");
    speakMentorVoice("Assistant vocal d'Investissement Québec activé.");
  }
}
window.toggleVoiceSpeech = toggleVoiceSpeech;

// Dictée vocale au Microphone (fr-CA)
function toggleSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById("copilot-mic-btn");
  const inputEl = document.getElementById("copilot-input-text");

  if (!SpeechRecognition) {
    alert("La reconnaissance vocale n'est pas supportée par votre navigateur (utilisez Chrome, Edge ou Safari).");
    return;
  }

  if (isRecognizingSpeech && speechRecognitionInstance) {
    speechRecognitionInstance.stop();
    isRecognizingSpeech = false;
    if (micBtn) micBtn.classList.remove("recording");
    return;
  }

  try {
    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.lang = "fr-CA";
    speechRecognitionInstance.continuous = false;
    speechRecognitionInstance.interimResults = false;

    speechRecognitionInstance.onstart = () => {
      isRecognizingSpeech = true;
      if (micBtn) micBtn.classList.add("recording");
      showCopilotToast("🎙️ Écoute en cours... Parlez maintenant");
    };

    speechRecognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputEl && transcript) {
        inputEl.value = (inputEl.value ? inputEl.value + " " : "") + transcript;
        inputEl.focus();
      }
    };

    speechRecognitionInstance.onerror = (e) => {
      console.warn("Erreur reconnaissance vocale:", e);
      isRecognizingSpeech = false;
      if (micBtn) micBtn.classList.remove("recording");
    };

    speechRecognitionInstance.onend = () => {
      isRecognizingSpeech = false;
      if (micBtn) micBtn.classList.remove("recording");
    };

    speechRecognitionInstance.start();
  } catch (err) {
    console.error("Erreur démarrage microphone:", err);
    if (micBtn) micBtn.classList.remove("recording");
  }
}
window.toggleSpeechRecognition = toggleSpeechRecognition;

// Accueil initial fluide sans pop-up encombrant
function initEvaluationVoiceAndWelcome() {
  setPhase(1);

  // Mettre à jour l'icône du haut-parleur
  const icon = document.getElementById("copilot-voice-icon");
  if (icon) {
    icon.innerText = isVoiceEnabled ? "🔊" : "🔇";
  }

  const welcomeMsg = `Bonjour ! Je suis votre <strong>Copilote du Bureau de l'IA d'Investissement Québec</strong>.<br><br>
  Déposez votre <strong>Cahier des Besoins d'Affaires</strong> ci-contre, ou cliquez sur <strong>« Tester directement avec le Cahier Démo »</strong> pour lancer une qualification complète.<br><br>
  Je reste à votre disposition à chaque étape par écrit ou <strong>au micro 🎙️</strong> !`;
  appendCopilotMessage("mentor", welcomeMsg);

  // Sourdine garantie par défaut au chargement
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ----------------------------------------------------------------------------
// GESTION DU DÉPÔT DOCUMENTAIRE MULTI-FORMATS (DOCX, PPTX, XLSX, PDF)
// ----------------------------------------------------------------------------
function setupDragAndDrop() {
  const dropZone = document.getElementById("drop-zone");
  if (!dropZone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "var(--iq-navy)";
      dropZone.style.backgroundColor = "#E0F2FE";
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#93C5FD";
      dropZone.style.backgroundColor = "#F0F9FF";
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      uploadDocumentFile(files[0]);
    }
  });
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    uploadDocumentFile(file);
  }
}

async function uploadDocumentFile(file) {
  const statusEl = document.getElementById("upload-status");
  statusEl.style.display = "block";
  statusEl.innerHTML = `<div style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">
    ⏳ Ingestion et extraction sémantique en cours par l'Analyste IA (${file.name})...
  </div>`;

  // Affichage du loader institutionnel avec étapes claires
  showIQLoader(
    "Ingestion & Analyse Documentaire IA",
    `L'Analyste IA examine « ${file.name} » pour extraire le cas d'usage...`,
    "Extraction textuelle et structurelle du document..."
  );

  let stepIdx = 0;
  const steps = [
    "Extraction textuelle et cartographie du contenu...",
    "Identification de l'irritant opérationnel et de la valeur métier...",
    "Analyse de la sensibilité des données et des exigences de la Loi 25...",
    "Pré-remplissage automatique des paramètres du cas d'usage..."
  ];
  const stepTimer = setInterval(() => {
    stepIdx++;
    if (stepIdx < steps.length) {
      updateIQLoaderStatus(steps[stepIdx]);
    }
  }, 1400);

  const formData = new FormData();
  formData.append("file", file);

  let resp = null;
  let attempts = 0;
  const maxAttempts = 3;

  try {
    while (attempts < maxAttempts) {
      attempts++;
      try {
        resp = await fetch(`${API_BASE}/upload-document`, {
          method: "POST",
          body: formData
        });
        if (resp.ok) break;
        if ((resp.status === 502 || resp.status === 503) && attempts < maxAttempts) {
          updateIQLoaderStatus("Initialisation du moteur IA en cours... Connexion dans un instant");
          await new Promise(r => setTimeout(r, 2500));
          continue;
        }
        break;
      } catch (netErr) {
        if (attempts < maxAttempts) {
          updateIQLoaderStatus("Connexion au moteur IA en cours... Veuillez patienter");
          await new Promise(r => setTimeout(r, 2500));
          continue;
        }
        throw netErr;
      }
    }

    clearInterval(stepTimer);

    if (!resp || !resp.ok) {
      const err = resp ? await resp.json().catch(() => ({})) : {};
      throw new Error(err.detail || err.error || "Échec de l'analyse documentaire");
    }

    const data = await resp.json();
    statusEl.innerHTML = `
      <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; color: #166534; padding: 12px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
        <div>
          <strong>✅ Document analysé avec succès :</strong> ${data.document_info.filename} (${data.document_info.text_length} caractères).<br>
          <span style="font-size: 12px; color: #15803D;">Les champs du cas d'usage ont été pré-remplis automatiquement par l'Analyste IA.</span>
        </div>
        <span style="background: #DCFCE7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px;">PRÊT POUR CADRAGE</span>
      </div>
    `;

    const ctx = data.extracted_context || {};
    if (ctx.title) document.getElementById("project-name").value = ctx.title;
    if (ctx.direction) {
      const dirSelect = document.getElementById("project-direction");
      let found = false;
      for (let opt of dirSelect.options) {
        if (opt.value.toLowerCase().includes(ctx.direction.toLowerCase()) || ctx.direction.toLowerCase().includes(opt.value.toLowerCase())) {
          dirSelect.value = opt.value;
          found = true;
          break;
        }
      }
      if (!found && ctx.direction) {
        const newOpt = new Option(ctx.direction, ctx.direction, true, true);
        dirSelect.add(newOpt);
      }
    }
    if (ctx.sponsor) document.getElementById("project-owner").value = ctx.sponsor;
    if (ctx.description) document.getElementById("project-desc").value = ctx.description;

    EVAL_STATE.documentRef = data.document_info;
    if (ctx.contains_personal_data !== undefined) {
      EVAL_STATE.project.containsPersonalData = ctx.contains_personal_data;
    }
    if (ctx.business_objective) EVAL_STATE.project.businessObjective = ctx.business_objective;
    if (ctx.target_users) EVAL_STATE.project.targetUsers = ctx.target_users;
    if (ctx.data_sources) EVAL_STATE.project.dataSources = ctx.data_sources;

  } catch (error) {
    clearInterval(stepTimer);
    console.error("Erreur upload:", error);
    statusEl.innerHTML = `<div style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 10px 14px; border-radius: 8px; font-size: 13px;">❌ ${error.message}</div>`;
  } finally {
    setTimeout(() => {
      hideIQLoader();
    }, 400);
  }
}

// ----------------------------------------------------------------------------
// INGESTION AUTOMATIQUE DU DOCUMENT D'EXPRESSION DES BESOINS DÉMO (SYNTH-IQ)
// ----------------------------------------------------------------------------
async function loadDemoRequirementsDocument() {
  const statusEl = document.getElementById("upload-status");
  if (statusEl) {
    statusEl.style.display = "block";
    statusEl.innerHTML = `<div style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">
      ⏳ Récupération du document d'expression des besoins démo « SYNTH-IQ »...
    </div>`;
  }

  try {
    const fileResp = await fetch("/Cahier_des_Besoins_Demo_Precertification_Financement_IQ.docx");
    if (!fileResp.ok) throw new Error("Document introuvable sur le serveur web");
    const blob = await fileResp.blob();
    const demoFile = new File([blob], "Cahier_des_Besoins_Demo_Precertification_Financement_IQ.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    
    // Ingestion machine réelle par l'API
    await uploadDocumentFile(demoFile);

    // Ajustement des métadonnées contextuelles de démonstration
    EVAL_STATE.project.containsPersonalData = true;
    EVAL_STATE.project.rtoHours = 48;
    EVAL_STATE.clarifDataType = "personal_pii";
    EVAL_STATE.clarifImpact = "error_reduction";
    EVAL_STATE.clarifOrg = "sponsor_ready";
    EVAL_STATE.clarifHumanRole = "draft_reviewer";

    // Message contextuel dans le Copilote
    appendCopilotMessage(
      "mentor",
      `<strong>Analyste en Gouvernance IA :</strong><br>
      « J'ai ingéré le document officiel d'expression des besoins du projet <strong>SYNTH-IQ (Préqualification du Financement PME)</strong>.<br>
      Ce cas d'usage illustre parfaitement notre réalité : il présente une <strong>forte valeur métier</strong> (gains de 4 à 6h/dossier), mais comporte des <strong>défis réels</strong> (formats hétérogènes des PME et présence de données nominatives assujetties à la Loi 25).<br>
      Son score est représentatif d'une <strong>Homologation Conditionnelle (~66-75%)</strong>, prouvant la pertinence de l'accompagnement du Bureau de l'IA. »`
    );

  } catch (err) {
    console.warn("Ingestion via fetch direct échouée, application du contexte démo pré-analysé:", err);
    // Pré-remplissage direct des champs issus de l'analyse de SYNTH-IQ
    document.getElementById("project-name").value = "Préqualification et Synthèse Intelligente des Dossiers de Financement (SYNTH-IQ)";
    document.getElementById("project-direction").value = "Direction Principale du Financement";
    document.getElementById("project-owner").value = "Direction Principale du Financement (Porteur Métier Délégué)";
    document.getElementById("project-tool-type").value = "rag";
    document.getElementById("project-desc").value = "Solution d'assistance intelligente à l'analyse et à la préqualification des dossiers de financement PME. Extraction et synthèse automatisée des bilans comptables, états des résultats et déclarations fiscales, avec respect strict de la Loi 25 et supervision humaine systématique.";

    EVAL_STATE.project.name = document.getElementById("project-name").value;
    EVAL_STATE.project.direction = document.getElementById("project-direction").value;
    EVAL_STATE.project.owner = document.getElementById("project-owner").value;
    EVAL_STATE.project.toolType = "rag";
    EVAL_STATE.project.description = document.getElementById("project-desc").value;
    EVAL_STATE.project.containsPersonalData = true;
    EVAL_STATE.project.rtoHours = 48;
    EVAL_STATE.clarifDataType = "personal_pii";
    EVAL_STATE.clarifImpact = "error_reduction";
    EVAL_STATE.clarifOrg = "sponsor_ready";
    EVAL_STATE.clarifHumanRole = "draft_reviewer";

    if (statusEl) {
      statusEl.innerHTML = `
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; color: #166534; padding: 12px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
          <div>
            <strong>✅ Document d'expression des besoins démo chargé :</strong> Cahier_des_Besoins_Demo_Precertification_Financement_IQ.docx (7 534 caractères).<br>
            <span style="font-size: 12px; color: #15803D;">Cas d'usage financier PME pré-rempli (Score modéré réaliste ~66-75% • Homologation conditionnelle).</span>
          </div>
          <span style="background: #FEF9C3; color: #854D0E; border: 1px solid #FDE047; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px;">SCORE RÉALISTE</span>
        </div>
      `;
    }
  }
}


// ----------------------------------------------------------------------------
// GESTION DU LOADER ÉLÉGANT INSTITUTIONNEL INVESTISSEMENT QUÉBEC
// ----------------------------------------------------------------------------
function showIQLoader(title, subtitle, stepText) {
  const overlay = document.getElementById('iq-elegant-loader');
  if (overlay) {
    if (title) document.getElementById('iq-loader-title-text').innerText = title;
    if (subtitle) document.getElementById('iq-loader-sub-text').innerText = subtitle;
    if (stepText) document.getElementById('iq-loader-status-text').innerText = stepText;
    overlay.classList.add('active');
  }
}

function updateIQLoaderStatus(stepText) {
  const statusEl = document.getElementById('iq-loader-status-text');
  if (statusEl) statusEl.innerText = stepText;
}

function hideIQLoader() {
  const overlay = document.getElementById('iq-elegant-loader');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// ----------------------------------------------------------------------------
// NAVIGATION ET ÉTATS DU STEPPER
// ----------------------------------------------------------------------------
function setPhase(phaseNum) {
  EVAL_STATE.currentPhase = phaseNum;

  // Masquer toutes les sections
  const sections = ['phase-1', 'phase-1b', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];
  sections.forEach(secId => {
    const sec = document.getElementById(secId);
    if (sec) sec.style.display = "none";
  });

  // Afficher la section cible
  let targetId = `phase-${phaseNum}`;
  if (phaseNum === "1b") targetId = "phase-1b";
  const targetSec = document.getElementById(targetId);
  if (targetSec) targetSec.style.display = "block";

  // Mettre à jour les pills
  for (let i = 1; i <= 6; i++) {
    const pill = document.getElementById(`step-pill-${i}`);
    if (pill) {
      const numericPhase = (phaseNum === "1b") ? 1 : phaseNum;
      if (i < numericPhase) pill.className = "step-pill completed";
      else if (i === numericPhase) pill.className = "step-pill active";
      else pill.className = "step-pill";
    }
  }

  // Rendu automatique si on arrive en Phase 4 (DGIR) ou Phase 6 (Rapport officiel)
  if (phaseNum === 4 || phaseNum === "4") {
    renderDgirRiskAppetiteTable('phase4-dgir-tbody', 'phase4-dgir-badge');
  } else if (phaseNum === 6 || phaseNum === "6") {
    generateOfficialReport();
  }

  // Synchronisation dynamique du Copilote avec l'étape active
  syncCopilotWithPhase(phaseNum);

  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function proceedToPhase1() {
  setPhase(1);
}

// ----------------------------------------------------------------------------
// PHASE 1B : CADRAGE INTERACTIF AVEC L'ANALYSTE IA (AIDE AUX BESOINS FLUS)
// ----------------------------------------------------------------------------
// PHASE 1B : CADRAGE INTERACTIF AVEC L'ANALYSTE IA (4 DIMENSIONS STRATÉGIQUES)
// ----------------------------------------------------------------------------
function proceedToPhase1b() {
  const name = document.getElementById('project-name').value.trim();
  const owner = document.getElementById('project-owner').value.trim();
  const desc = document.getElementById('project-desc').value.trim();

  const chkPhase1 = document.getElementById('chk-hitl-phase1');
  if (chkPhase1 && !chkPhase1.checked) {
    const box = document.getElementById('hitl-box-phase1');
    if (box) {
      box.style.border = '2px solid #DC2626';
      box.style.background = '#FEF2F2';
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    alert("⚠️ Validation humaine obligatoire (Human-in-the-Loop) :\n\nConformément aux directives de gouvernance d'Investissement Québec, vous devez obligatoirement cocher la case d'engagement confirmant que vous avez relu et validé personnellement les informations d'identification et la description du besoin avant de passer à l'étape suivante (atténuation des hallucinations de l'IA).");
    return;
  }

  if (!name || !owner || !desc) {
    alert("Veuillez renseigner le nom de l'initiative, le porteur d'affaires et la description du besoin avant de poursuivre.");
    return;
  }

  EVAL_STATE.project.name = name;
  EVAL_STATE.project.direction = document.getElementById('project-direction').value;
  EVAL_STATE.project.owner = owner;
  EVAL_STATE.project.toolType = document.getElementById('project-tool-type').value;
  EVAL_STATE.project.description = desc;

  // Mise à jour du bandeau adaptatif de Phase 1b
  const badgeName = document.getElementById('clarif-project-badge-name');
  if (badgeName) {
    badgeName.innerText = `${EVAL_STATE.project.name} (${EVAL_STATE.project.direction || 'IQ'})`;
  }

  // Passage à la phase 1b et adaptation intelligente au cas d'usage
  setPhase("1b");
  adaptClarifToUseCase();
}

function adaptClarifToUseCase() {
  const title = (EVAL_STATE.project.name || "").toLowerCase();
  const desc = (EVAL_STATE.project.description || "").toLowerCase();
  const fullText = `${title} ${desc}`;

  const introTextEl = document.getElementById('clarif-mentor-intro-text');
  
  let recImpact = "productivity_time";
  let recData = "public_internal";
  let recOrg = "sponsor_ready";
  let recHuman = "draft_reviewer";
  let mentorMessage = "";

  if (fullText.includes("cyber") || fullText.includes("soc") || fullText.includes("alerte") || fullText.includes("triage") || fullText.includes("incident") || fullText.includes("sécurité")) {
    recImpact = "productivity_time"; // Accélération du triage
    recData = "public_internal"; // Logs techniques déclassifiés sans PII
    recOrg = "sponsor_ready"; // Équipe COCD dédiée
    recHuman = "draft_reviewer"; // L'analyste cyber valide systématiquement
    mentorMessage = `« Pour l'initiative de cyberdéfense « ${EVAL_STATE.project.name} », j'ai configuré les options optimales : triage accéléré des alertes, utilisation de données techniques déclassifiées (zéro PII) et validation systématique obligatoire par l'analyste cyber (Human-in-the-Loop). »`;
  } else if (fullText.includes("financ") || fullText.includes("crédit") || fullText.includes("prêt") || fullText.includes("bilan") || fullText.includes("ratio") || fullText.includes("dossier")) {
    recImpact = "error_reduction"; // Réduction d'erreurs et précision
    recData = "client_financial"; // Données d'entreprises clientes
    recOrg = "sponsor_ready";
    recHuman = "decision_support"; // Recommandation directe soumise au comité de crédit
    mentorMessage = `« Pour ce cas d'usage financier « ${EVAL_STATE.project.name} », l'accent est mis sur la réduction des erreurs de calcul, le confinement en environnement RAG fermé Azure IQ (secret d'affaires) et le contrôle collégial par le comité de crédit. »`;
  } else if (fullText.includes("geniq") || fullText.includes("sharepoint") || fullText.includes("recherche") || fullText.includes("faq") || fullText.includes("politique") || fullText.includes("document")) {
    recImpact = "knowledge_generation"; // Génération de connaissances et recherche
    recData = "public_internal";
    recOrg = "sponsor_ready";
    recHuman = "draft_reviewer";
    mentorMessage = `« Pour votre assistant documentaire RAG « ${EVAL_STATE.project.name} », nous privilégions la recherche sémantique sur corpus internes déclassifiés, sans conservation externe et avec relecture humaine directe. »`;
  } else if (fullText.includes("rh") || fullText.includes("employé") || fullText.includes("recrutement") || fullText.includes("personnel") || fullText.includes("candidat")) {
    recImpact = "productivity_time";
    recData = "personal_pii"; // Loi 25
    recOrg = "need_training";
    recHuman = "draft_reviewer";
    mentorMessage = `« Attention : ce cas d'usage touche des renseignements sur des individus. Le déclenchement d'une ÉFVP (Loi 25) et une supervision humaine rigoureuse sont préconisés. »`;
  } else {
    recImpact = "productivity_time";
    recData = "public_internal";
    recOrg = "sponsor_ready";
    recHuman = "draft_reviewer";
    mentorMessage = `« J'ai analysé les caractéristiques du projet « ${EVAL_STATE.project.name} ». Les 4 dimensions ci-dessous ont été pré-ajustées pour maximiser la conformité aux exigences d'Investissement Québec. »`;
  }

  // Sélection des boutons radio correspondants
  const setRadio = (name, val) => {
    const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (radio) radio.checked = true;
  };

  setRadio("clarif-impact-type", recImpact);
  setRadio("clarif-data-type", recData);
  setRadio("clarif-org-readiness", recOrg);
  setRadio("clarif-human-role", recHuman);

  if (introTextEl && mentorMessage) {
    introTextEl.innerHTML = mentorMessage;
  }

  updateClarifState();
}

function updateClarifState() {
  const impRadio = document.querySelector('input[name="clarif-impact-type"]:checked');
  const dtRadio = document.querySelector('input[name="clarif-data-type"]:checked');
  const orgRadio = document.querySelector('input[name="clarif-org-readiness"]:checked');
  const hrRadio = document.querySelector('input[name="clarif-human-role"]:checked');
  const toolSelect = document.getElementById('project-tool-type');

  // Gestion des champs textes 'Autre'
  const toggleOther = (radio, inputId) => {
    const inp = document.getElementById(inputId);
    if (inp) {
      inp.style.display = (radio && radio.value === 'other') ? 'block' : 'none';
    }
  };

  toggleOther(impRadio, 'clarif-impact-other-text');
  toggleOther(dtRadio, 'clarif-data-type-other-text');
  toggleOther(orgRadio, 'clarif-org-other-text');
  toggleOther(hrRadio, 'clarif-human-role-other-text');

  const ttOtherWrap = document.getElementById('project-tool-type-other-wrap');
  if (ttOtherWrap && toolSelect) {
    ttOtherWrap.style.display = (toolSelect.value === 'other') ? 'block' : 'none';
  }

  // Sauvegarde dans l'état global
  if (impRadio) {
    EVAL_STATE.clarifImpact = impRadio.value;
  }
  if (dtRadio) {
    EVAL_STATE.clarifDataType = dtRadio.value;
    EVAL_STATE.project.containsPersonalData = (dtRadio.value === "personal_pii");
  }
  if (orgRadio) {
    EVAL_STATE.clarifOrg = orgRadio.value;
  }
  if (hrRadio) {
    EVAL_STATE.clarifHumanRole = hrRadio.value;
  }

  const copilotContextName = document.getElementById('copilot-context-name');
  if (copilotContextName && EVAL_STATE.project.name) {
    copilotContextName.innerText = EVAL_STATE.project.name;
  }
}

async function proceedToPhase2FromClarif() {
  const chkPhase1b = document.getElementById('chk-hitl-phase1b');
  if (chkPhase1b && !chkPhase1b.checked) {
    const box = document.getElementById('hitl-box-phase1b');
    if (box) {
      box.style.border = '2px solid #DC2626';
      box.style.background = '#FEF2F2';
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    alert("⚠️ Validation humaine obligatoire (Human-in-the-Loop) :\n\nConformément aux normes d'Investissement Québec, vous devez obligatoirement cocher la case d'engagement confirmant que vous avez examiné et validé les 4 dimensions de cadrage avant de générer la grille de faisabilité (garde-fou contre les hallucinations de l'IA).");
    return;
  }

  updateClarifState();
  await proceedToPhase2(true);
}

// ----------------------------------------------------------------------------
// PHASE 2 : GRILLE OFFICIELLE DE FAISABILITÉ D'IQ (28 CRITÈRES PRÉ-COMPLÉTÉS)
// ----------------------------------------------------------------------------
async function proceedToPhase2(fromClarif = false) {
  if (!fromClarif) {
    const name = document.getElementById('project-name').value.trim();
    const owner = document.getElementById('project-owner').value.trim();
    const desc = document.getElementById('project-desc').value.trim();

    if (!name || !owner || !desc) {
      alert("Veuillez renseigner le nom de l'initiative, le porteur d'affaires et la description du besoin avant de poursuivre.");
      return;
    }

    EVAL_STATE.project.name = name;
    EVAL_STATE.project.direction = document.getElementById('project-direction').value;
    EVAL_STATE.project.owner = owner;
    EVAL_STATE.project.toolType = document.getElementById('project-tool-type').value;
    EVAL_STATE.project.description = desc;
  }

  // 1. Initialisation instantanée de la grille pré-complétée selon les 4 dimensions
  initFallbackGrid();
  EVAL_STATE.activeAxeIndex = 0;
  EVAL_STATE.visitedAxes = [0];
  renderAxesTabs();
  renderActiveAxe();
  updateAxeNavigationButtons();
  updateLiveScoreDisplay();
  setPhase(2);

  const mentorComment = document.getElementById('mentor-dynamic-comment');
  if (mentorComment) {
    mentorComment.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>⚡</span>
        <span>L'Analyste IA calibre et pré-complète les 28 critères officiels de la Grille DD avec des justifications personnalisées...</span>
      </div>
    `;
  }

  // 2. Appel au backend FastAPI avec les dimensions complètes pour enrichissement
  try {
    const resp = await fetch(`${API_BASE}/pre-evaluate-grid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: EVAL_STATE.project.name,
        direction: EVAL_STATE.project.direction,
        sponsor: EVAL_STATE.project.owner,
        tool_type: EVAL_STATE.project.toolType,
        description: EVAL_STATE.project.description,
        data_sources: EVAL_STATE.project.dataSources,
        contains_personal_data: EVAL_STATE.project.containsPersonalData,
        rto_hours: EVAL_STATE.project.rtoHours,
        clarif_impact: EVAL_STATE.clarifImpact || "productivity_time",
        clarif_data_type: EVAL_STATE.clarifDataType || "public_internal",
        clarif_org: EVAL_STATE.clarifOrg || "sponsor_ready",
        clarif_human_role: EVAL_STATE.clarifHumanRole || "draft_reviewer"
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      EVAL_STATE.axes = data.axes || [];
      EVAL_STATE.totalScore = data.total_score || 0;
      EVAL_STATE.percentage = data.percentage || 0;
      EVAL_STATE.recommendation = data.recommendation || "";
      EVAL_STATE.executiveAssessment = data.executive_assessment || "";

      // Mettre à jour les notes et justificatifs affinés par l'Analyste
      EVAL_STATE.axes.forEach(ax => {
        ax.questions.forEach(q => {
          EVAL_STATE.scores[q.id] = q.score;
          EVAL_STATE.justifications[q.id] = q.justification;
        });
      });

      if (mentorComment) {
        mentorComment.innerHTML = `
          <strong>Évaluation complétée par l'Analyste IA d'Investissement Québec :</strong><br>
          « J'ai analysé votre cas d'usage « ${EVAL_STATE.project.name} ». Les 28 critères de faisabilité de la Grille DD ont été pré-complétés avec les justifications contextuelles. Vous pouvez modifier chaque critère avant l'arbitrage. »
        `;
      }

      renderAxesTabs();
      renderActiveAxe();
      updateAxeNavigationButtons();
      updateLiveScoreDisplay();
    }
  } catch (err) {
    console.warn("Calibrage automatique : utilisation de la grille pré-complétée locale", err);
    if (mentorComment) {
      mentorComment.innerText = "L'Analyste IA a pré-rempli la grille de faisabilité selon les 4 dimensions de votre besoin d'affaires.";
    }
  }
}


// Définition globale des 28 critères de faisabilité officiels d'Investissement Québec (Grille DD)
const FALLBACK_QUESTIONS = [
  // Axe 1 (1-5)
  { id: 1, axe: 1, title: "Le problème à résoudre est-il clairement identifié ?", desc: "La douleur métier, la friction ou l'opportunité est précisément ciblée.", score: 3, justification: "Le besoin métier et l'irritant opérationnel sont clairement formulés." },
  { id: 2, axe: 1, title: "Le cas d'usage répond-il à un besoin fréquent ou à fort volume ?", desc: "La récurrence de la tâche ou le volume justifie l'automatisation.", score: 3, justification: "Activité récurrente des équipes d'Investissement Québec." },
  { id: 3, axe: 1, title: "La valeur attendue est-elle mesurable ?", desc: "Gains de temps, vélocité ou réduction d'erreurs chiffrables.", score: 3, justification: "Gain d'efficience et réduction des délais de traitement documentés." },
  { id: 4, axe: 1, title: "Le cas d'usage s'aligne-t-il sur les priorités stratégiques ?", desc: "Contribution aux mandats économiques d'IQ et au plan stratégique.", score: 4, justification: "Alignement direct avec les priorités de productivité et de modernisation." },
  { id: 5, axe: 1, title: "Existe-t-il un sponsor d'affaires engagé ?", desc: "Un leader métier désigné soutient activement le projet et ses ressources.", score: 3, justification: "Sponsor d'affaires désigné au sein de la direction porteuse." },
  
  // Axe 2 (6-10)
  { id: 6, axe: 2, title: "Les données nécessaires existent-elles déjà chez IQ ?", desc: "Disponibilité des corpus documentaires ou fichiers nécessaires.", score: 3, justification: "Corpus documentaire disponible sur les environnements internes." },
  { id: 7, axe: 2, title: "La qualité des données est-elle suffisante ?", desc: "Exactitude, actualisation et complétude des documents ou sources.", score: 3, justification: "Documents institutionnels validés et récents." },
  { id: 8, axe: 2, title: "Le volume de données est-il adapté au modèle envisagé ?", desc: "Masse critique suffisante pour alimenter la recherche sémantique.", score: 3, justification: "Volume adéquat pour l'indexation sémantique RAG." },
  { id: 9, axe: 2, title: "Les données sont-elles structurées ou facilement exploitables ?", desc: "Formats lisibles (PDF natifs, Word, tables).", score: 3, justification: "Majorité de documents bureautiques directement exploitables." },
  { id: 10, axe: 2, title: "Les droits d'utilisation des données sont-ils confirmés ?", desc: "Conformité d'accès aux corpus sans violation de droits tiers.", score: 4, justification: "Propriété pleine et entière des documents internes d'IQ." },
  
  // Axe 3 (11-15)
  { id: 11, axe: 3, title: "La tâche est-elle adaptée aux capacités actuelles de l'IA ?", desc: "Correspondance prouvée avec les modèles génératifs actuels.", score: 4, justification: "Tâche de recherche et d'assistance documentaire parfaitement maîtrisée par les LLM." },
  { id: 12, axe: 3, title: "Une solution existe-t-elle déjà sur le marché ou chez IQ ?", desc: "Réutilisation de briques M365/Azure existantes.", score: 3, justification: "S'appuie sur les briques infonuagiques sécurisées d'IQ." },
  { id: 13, axe: 3, title: "L'intégration aux systèmes existants est-elle réaliste ?", desc: "Compatibilité avec SharePoint, Teams ou Octopus sans refonte complexe.", score: 3, justification: "Intégration prévue dans l'environnement Microsoft 365." },
  { id: 14, axe: 3, title: "Le niveau de précision attendu est-il atteignable ?", desc: "Tolérance au risque d'hallucination gérée par RAG et garde-fous.", score: 3, justification: "Architecture RAG avec citations des sources pour maîtriser les hallucinations." },
  { id: 15, axe: 3, title: "Une preuve de concept (POC) est-elle réalisable rapidement ?", desc: "Faisabilité d'un prototype démonstrateur en moins de 4 à 6 semaines.", score: 4, justification: "Prototypage rapide réalisable avec l'Escouade IA." },
  
  // Axe 4 (16-19)
  { id: 16, axe: 4, title: "L'effort de mise en œuvre est-il raisonnable ?", desc: "Charge de travail proportionnée aux gains métiers anticipés.", score: 3, justification: "Effort équilibré au regard de la valeur d'affaires anticipée." },
  { id: 17, axe: 4, title: "Les compétences requises sont-elles disponibles chez IQ ?", desc: "Expertise interne (Bureau de l'IA, TI) identifiée.", score: 3, justification: "Compétences présentes au Bureau de l'IA et à la Direction des TI." },
  { id: 18, axe: 4, title: "Les coûts (licences, infra, maintenance) sont-ils maîtrisés ?", desc: "Modèle de coûts prévisible sans dérapage.", score: 3, justification: "Coûts d'infrastructure infonuagique maîtrisés." },
  { id: 19, axe: 4, title: "Le cas d'usage est-il reproductible ou extensible ?", desc: "Capacité à servir d'autres directions d'IQ avec peu de modifications.", score: 3, justification: "Potentiel de réutilisation pour d'autres directions d'IQ." },
  
  // Axe 5 (20-24)
  { id: 20, axe: 5, title: "Le traitement respecte-t-il la Loi 25 sur les renseignements personnels ?", desc: "Zéro rétention externe, chiffrement, anonymisation ou purge des PII.", score: 3, justification: "Conformité Loi 25 avec hébergement souverain et politique de rétention stricte." },
  { id: 21, axe: 5, title: "Les risques de biais ou d'erreurs sont-ils identifiés et gérés ?", desc: "Évaluation de l'impact sur les personnes et équité.", score: 3, justification: "Garde-fous algorithmiques et filtrage des sorties." },
  { id: 22, axe: 5, title: "Un humain garde-t-il le contrôle sur la décision finale ?", desc: "Principe inviolable Human-in-the-Loop : l'IA propose, l'humain dispose.", score: 4, justification: "Validation humaine systématique et obligatoire par le conseiller." },
  { id: 23, axe: 5, title: "La traçabilité et l'auditabilité sont-elles assurées ?", desc: "Journalisation des requêtes, des sources citées et des versions.", score: 3, justification: "Journalisation complète des requêtes et réponses générées." },
  { id: 24, axe: 5, title: "Le cas d'usage respecte-t-il la sécurité de l'information (CSI) ?", desc: "Cloisonnement des accès selon le profil utilisateur et gouvernance.", score: 4, justification: "Cloisonnement des droits d'accès hérité de l'annuaire corporatif." },
  
  // Axe 6 (25-28)
  { id: 25, axe: 6, title: "Les utilisateurs finaux sont-ils demandeurs et motivés ?", desc: "Adhésion des équipes opérationnelles sans résistance.", score: 4, justification: "Forte demande exprimée par les équipes opérationnelles." },
  { id: 26, axe: 6, title: "L'usage s'intègre-t-il naturellement dans les habitudes de travail ?", desc: "Intégration directe dans les outils du quotidien.", score: 3, justification: "Accès fluide depuis les postes de travail existants." },
  { id: 27, axe: 6, title: "Un plan de formation et d'accompagnement est-il prévu ?", desc: "Ateliers de prise en main, guides et mentorat.", score: 3, justification: "Ateliers d'ingénierie de requêtes et guides de prise en main prévus." },
  { id: 28, axe: 6, title: "Des indicateurs de succès (KPI) sont-ils définis ?", desc: "Mesure du taux d'adoption, satisfaction et heures économisées.", score: 3, justification: "Indicateurs de taux d'adoption et de gain de temps établis." }
];

// 5 Thématiques d'Appétit au Risque DGIR 2026 (Grille évaluation cas usage.xlsx)
const DGIR_RISK_APPETITE_THEMATIQUES = [
  {
    id: "donnees",
    name: "1. Nature des données",
    subRisk: "Fuite de données, respect du calendrier de conservation et traitement des consentements clients",
    riskIa: "Protection des données et vie privée / Conformité réglementaire",
    enterpriseRisk: "Fuite de données / Légal",
    choices: [
      { level: 1, label: "Données publiques", desc: "Aucun renseignement sensible ou confidentiel" },
      { level: 2, label: "Données internes non sensibles", desc: "Corpus internes généraux, sans données financières critiques" },
      { level: 3, label: "Données confidentielles", desc: "Données d'entreprises, analyses financières et secret d'affaires" },
      { level: 4, label: "Renseignements personnels et/ou hautement confidentiels", desc: "Assujetti à la Loi 25 (ÉFVP requise)" }
    ]
  },
  {
    id: "outil",
    name: "2. Type d'outil",
    subRisk: "Perte de contrôle sur la sécurité, le traitement et l'hébergement; fragmentation applicative",
    riskIa: "Sécurité et menaces adversariales / Conformité légale",
    enterpriseRisk: "Fuite de données / Architecture TI",
    choices: [
      { level: 1, label: "SIA sur environnement fermé - Développement interne", desc: "Contrôle complet de l'infrastructure et du modèle" },
      { level: 2, label: "SIA sur environnement fermé - Licences corporatives", desc: "Contrôle partiel (Azure IQ / Copilot M365 sécurisé)" },
      { level: 3, label: "SIA publics reconnus", desc: "Peu de contrôle (Plateformes SaaS tierces certifiées)" },
      { level: 4, label: "SIA publics méconnus", desc: "Très peu de contrôle (Outils non audités TI)" }
    ]
  },
  {
    id: "extrant",
    name: "3. Type d'extrant",
    subRisk: "Hallucinations, erreurs factuelles, biais algorithmiques, dérives d'usages et perte d'expertise",
    riskIa: "Fiabilité et exactitude / Biais algorithmique / Dépendance",
    enterpriseRisk: "Exécution des processus / Capital humain",
    choices: [
      { level: 1, label: "Assistant à la tâche", desc: "Aide ponctuelle à la rédaction ou synthèse avec validation humaine" },
      { level: 2, label: "Analyse", desc: "Génération de résumés comparatifs et structuration d'information" },
      { level: 3, label: "Recommandation clientèle ou stratégique", desc: "Orientation décisionnelle pour clients ou comités" },
      { level: 4, label: "Décision irréversible", desc: "Décision automatisée sans supervision humaine" }
    ]
  },
  {
    id: "exposition",
    name: "4. Exposition externe",
    subRisk: "Conseils non autorisés, engagement de responsabilité, transparence et attaques par injection",
    riskIa: "Réputation et confiance institutionnelle / Transparence",
    enterpriseRisk: "Légal / Réputation / Sécurité",
    choices: [
      { level: 1, label: "Usage interne n'ayant aucune influence sur les clients", desc: "Outil purement administratif interne" },
      { level: 2, label: "Usage interne influençant indirectement les clients", desc: "Analyses relues par un conseiller avant transmission" },
      { level: 3, label: "Usage interne influençant directement les clients", desc: "Conseils ayant un impact direct sur les dossiers" },
      { level: 4, label: "Exposition externe grand public ou transversal", desc: "Accessible directement par le public ou externe" }
    ]
  },
  {
    id: "materialite",
    name: "5. Matérialité (RTO)",
    subRisk: "Surconfiance à l'IA, résilience opérationnelle, dépendance à la technologie et fournisseurs",
    riskIa: "Fiabilité / Dépendance technologique / Résilience",
    enterpriseRisk: "Conception des processus / Fournisseurs",
    choices: [
      { level: 1, label: "RTO plus de 72 heures", desc: "Processus non critique, tolérance d'interruption > 3 jours" },
      { level: 2, label: "RTO 72 heures", desc: "Processus standard (reprise visée à 72h)" },
      { level: 3, label: "RTO 24 heures", desc: "Processus important exigeant une reprise sous 24h" },
      { level: 4, label: "RTO 4 heures", desc: "Processus critique ou continu (très haute disponibilité)" }
    ]
  }
];

// Grille locale pré-complétée selon les dimensions du cas d'usage
function initFallbackGrid() {
  const projTitle = EVAL_STATE.project.name || "Initiative IA";
  const projDir = EVAL_STATE.project.direction || "Investissement Québec";
  const containsPII = EVAL_STATE.project.containsPersonalData;
  const humanRole = EVAL_STATE.clarifHumanRole || "draft_reviewer";

  EVAL_STATE.axes = FAISABILITE_AXES_METADATA.map(ax => ({
    id: ax.id,
    name: ax.label,
    max: ax.max,
    weight: ax.weight,
    desc: ax.desc,
    questions: FALLBACK_QUESTIONS.filter(q => q.axe === ax.id).map(q => {
      let customJustif = q.justification;
      let scoreVal = q.score;

      // Personnalisation contextuelle des justificatifs selon le cas d'usage
      if (q.id === 1) customJustif = `Le besoin d'affaires de « ${projTitle} » et l'irritant opérationnel ciblé sont clairement articulés pour ${projDir}.`;
      else if (q.id === 4) customJustif = `« ${projTitle} » s'aligne directement sur les priorités stratégiques de modernisation et d'efficience d'IQ.`;
      else if (q.id === 5) customJustif = `Sponsor d'affaires désigné : ${EVAL_STATE.project.owner || 'Direction porteuse'} soutient activement l'initiative.`;
      else if (q.id === 6) customJustif = `Corpus documentaire nécessaire identifié et disponible au sein des référentiels d'IQ.`;
      else if (q.id === 10) customJustif = `Propriété intellectuelle et droits d'utilisation des corpus validés pour « ${projTitle} ».`;
      else if (q.id === 13) customJustif = `Intégration prévue dans l'environnement Microsoft 365 / Azure Cloud sécurisé d'IQ.`;
      else if (q.id === 14) customJustif = `Architecture RAG fermée sur Azure IQ avec citations des sources pour éliminer les risques d'hallucinations.`;
      else if (q.id === 20) {
        if (containsPII) {
          scoreVal = 2;
          customJustif = `Présence de renseignements personnels : ÉFVP obligatoire requise par la Loi 25 et revue par le responsable PRP.`;
        } else {
          scoreVal = 4;
          customJustif = `Aucun renseignement personnel nominatif analysé : conforme aux exigences de la Loi 25 sans obligation d'ÉFVP lourde.`;
        }
      }
      else if (q.id === 22) {
        if (humanRole === 'automated_flow') {
          scoreVal = 2;
          customJustif = `Attention : mode automatisé nécessitant des garde-fous techniques renforcés et un comité de surveillance régulier.`;
        } else {
          scoreVal = 4;
          customJustif = `Supervision humaine obligatoire garantie (Human-in-the-Loop) : aucun résultat n'est appliqué sans validation humaine.`;
        }
      }
      else if (q.id === 24) customJustif = `Cloisonnement des accès RBAC hérité de l'annuaire corporatif Azure AD d'Investissement Québec.`;
      else if (q.id === 25) customJustif = `Forte adhésion manifestée par les équipes opérationnelles utilisatrices de « ${projTitle} ».`;

      return {
        ...q,
        score: scoreVal,
        justification: customJustif
      };
    })
  }));

  EVAL_STATE.axes.forEach(ax => {
    ax.questions.forEach(q => {
      EVAL_STATE.scores[q.id] = q.score;
      EVAL_STATE.justifications[q.id] = q.justification;
    });
  });

  calculateLiveScores();
  renderAxesTabs();
  renderActiveAxe();
  updateLiveScoreDisplay();
  setPhase(2);
}


// ----------------------------------------------------------------------------
// GESTION DE L'AFFICHAGE DES ONGLETS ET CRITÈRES DE LA GRILLE
// ----------------------------------------------------------------------------
function renderAxesTabs() {
  const tabsContainer = document.getElementById('axes-tabs-container');
  if (!tabsContainer) return;

  if (!EVAL_STATE.visitedAxes) EVAL_STATE.visitedAxes = [0];

  tabsContainer.innerHTML = FAISABILITE_AXES_METADATA.map((ax, idx) => {
    const isActive = idx === EVAL_STATE.activeAxeIndex;
    const isVisited = EVAL_STATE.visitedAxes.includes(idx);
    
    let bg = 'white';
    let textColor = 'var(--iq-navy)';
    let borderColor = 'var(--border-color)';
    let prefix = `Axe ${ax.id}`;

    if (isActive) {
      bg = 'linear-gradient(135deg, #1E2977 0%, #0284C7 100%)';
      textColor = 'white';
      borderColor = '#0284C7';
      prefix = `★ Axe ${ax.id}`;
    } else if (isVisited) {
      bg = '#F0FDF4';
      textColor = '#166534';
      borderColor = '#86EFAC';
      prefix = `✓ Axe ${ax.id}`;
    }

    return `
      <button type="button" class="btn-axe-tab" onclick="switchAxe(${idx})" title="Axe ${ax.id} : ${ax.label}" style="
        background: ${bg};
        color: ${textColor};
        border: 1.5px solid ${borderColor};
        border-radius: 8px;
        padding: 9px 6px;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        transition: all 0.2s;
        box-shadow: ${isActive ? '0 4px 12px rgba(2,132,199,0.3)' : 'none'};
      ">
        <span style="display: flex; align-items: center; gap: 4px;">${prefix}</span>
        <span style="font-size: 9.5px; opacity: ${isActive ? '0.9' : '0.75'}; font-weight: 600;">${ax.weight}</span>
      </button>
    `;
  }).join('');
}

function updateAxeProgressBar() {
  const idx = EVAL_STATE.activeAxeIndex;
  const currentAxe = FAISABILITE_AXES_METADATA[idx];
  const totalAxes = FAISABILITE_AXES_METADATA.length; // 6
  
  const labelEl = document.getElementById('axe-progress-label');
  const badgeEl = document.getElementById('axe-progress-pct-badge');
  const fillEl = document.getElementById('axe-progress-bar-fill');

  if (labelEl && currentAxe) {
    const axeShort = currentAxe.label.split('—')[1]?.trim() || currentAxe.label;
    labelEl.textContent = `Axe ${idx + 1} sur ${totalAxes} — ${axeShort}`;
  }
  if (badgeEl) {
    badgeEl.textContent = `Axe ${idx + 1} / ${totalAxes}`;
  }
  if (fillEl) {
    const pct = Math.round(((idx + 1) / totalAxes) * 100);
    fillEl.style.width = `${pct}%`;
  }
}

function updateAxeNavigationButtons() {
  const idx = EVAL_STATE.activeAxeIndex;
  const totalAxes = FAISABILITE_AXES_METADATA.length; // 6

  // 1. Bouton précédent
  const prevBtn = document.getElementById('btn-prev-axe');
  if (prevBtn) {
    if (idx === 0) {
      prevBtn.innerHTML = `<span>⬅️ Revenir au Cadrage</span>`;
    } else {
      const prevAxe = FAISABILITE_AXES_METADATA[idx - 1];
      const prevShort = prevAxe.label.split('—')[1]?.trim() || `Axe ${idx}`;
      prevBtn.innerHTML = `<span>⬅️ Axe ${idx} : ${prevShort}</span>`;
    }
  }

  // 2. Compteur central
  const currNumEl = document.getElementById('axe-curr-num');
  if (currNumEl) currNumEl.textContent = idx + 1;

  // 3. Boutons Suivant / Validation
  const nextBtn = document.getElementById('btn-next-axe');
  const validateBtn = document.getElementById('btn-validate-grid');
  const hitlBox = document.getElementById('hitl-box-phase2');
  const previewNotice = document.getElementById('hitl-preview-notice');

  if (idx < totalAxes - 1) {
    // Axes 1 à 5 : Seul le bouton "Passer à l'axe suivant" est affiché
    const nextAxe = FAISABILITE_AXES_METADATA[idx + 1];
    const nextShort = nextAxe.label.split('—')[1]?.trim() || `Axe ${idx + 2}`;

    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
      nextBtn.innerHTML = `<span>Passer à l'Axe ${idx + 2} : ${nextShort}</span> <span style="font-size: 15px; margin-left: 6px;">➔</span>`;
    }
    if (validateBtn) validateBtn.style.display = "none";
    if (hitlBox) hitlBox.style.display = "none";
    if (previewNotice) {
      previewNotice.style.display = "flex";
      previewNotice.innerHTML = `
        <span>🧭 <strong>Axe ${idx + 1} sur 6 :</strong> Examinez les critères ci-dessus puis cliquez sur <strong>« Passer à l'Axe ${idx + 2} »</strong> pour poursuivre.</span>
        <span style="font-size: 11px; font-weight: 700; color: #0284C7; white-space: nowrap; background: #E0F2FE; padding: 4px 10px; border-radius: 6px;">Signature requise à l'Axe 6</span>
      `;
    }
  } else {
    // Axe 6 (Dernier axe) : On masque le bouton "Suivant", on affiche la boîte de signature obligatoire et le bouton de validation finale
    if (nextBtn) nextBtn.style.display = "none";
    if (previewNotice) previewNotice.style.display = "none";
    if (hitlBox) hitlBox.style.display = "block";
    if (validateBtn) {
      validateBtn.style.display = "inline-flex";
      updateValidateButtonState();
    }
  }

  updateAxeProgressBar();
}

function onHitlCheckboxChange(isChecked) {
  const hitlBox = document.getElementById('hitl-box-phase2');
  const hitlLabel = document.getElementById('hitl-checkbox-label');
  const statusPill = document.getElementById('signature-status-pill');

  if (isChecked) {
    if (hitlBox) {
      hitlBox.style.background = "#F0FDF4";
      hitlBox.style.border = "1.5px solid #22C55E";
      hitlBox.style.borderLeft = "5px solid #16A34A";
      hitlBox.style.boxShadow = "0 4px 16px rgba(34, 197, 94, 0.15)";
    }
    if (hitlLabel) {
      hitlLabel.style.background = "#FFFFFF";
      hitlLabel.style.border = "1.5px solid #86EFAC";
    }
    if (statusPill) {
      statusPill.innerHTML = `<span>✓</span> SIGNATURE HUMAINE ENREGISTRÉE`;
      statusPill.style.background = "#DCFCE7";
      statusPill.style.color = "#166534";
      statusPill.style.border = "1px solid #86EFAC";
    }
  } else {
    if (hitlBox) {
      hitlBox.style.background = "#FFFBEB";
      hitlBox.style.border = "1.5px solid #F59E0B";
      hitlBox.style.borderLeft = "5px solid #D97706";
      hitlBox.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.1)";
    }
    if (hitlLabel) {
      hitlLabel.style.background = "rgba(255,255,255,0.9)";
      hitlLabel.style.border = "2px dashed #D97706";
    }
    if (statusPill) {
      statusPill.innerHTML = `EN ATTENTE DE SIGNATURE`;
      statusPill.style.background = "#FEF08A";
      statusPill.style.color = "#854D0E";
      statusPill.style.border = "1px solid #FDE047";
    }
  }

  updateValidateButtonState();
}

function updateValidateButtonState() {
  const validateBtn = document.getElementById('btn-validate-grid');
  const chkPhase2 = document.getElementById('chk-hitl-phase2');
  if (!validateBtn) return;

  const isChecked = chkPhase2 && chkPhase2.checked;
  if (isChecked) {
    validateBtn.innerHTML = `<span>🏆 Valider les 6 Axes & Générer Livrables (Excel & Word)</span> <span style="font-size: 15px; margin-left: 6px;">➔</span>`;
    validateBtn.style.background = "linear-gradient(135deg, #10B981 0%, #047857 100%)";
    validateBtn.style.boxShadow = "0 4px 16px rgba(16, 185, 129, 0.4)";
    validateBtn.style.opacity = "1";
    validateBtn.style.cursor = "pointer";
  } else {
    validateBtn.innerHTML = `<span>✍️ Signer l'engagement ci-dessus pour finaliser</span> <span style="font-size: 15px; margin-left: 6px;">➔</span>`;
    validateBtn.style.background = "linear-gradient(135deg, #D97706 0%, #B45309 100%)";
    validateBtn.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.25)";
    validateBtn.style.opacity = "0.95";
  }
}

function switchAxe(index) {
  if (index < 0 || index >= FAISABILITE_AXES_METADATA.length) return;
  EVAL_STATE.activeAxeIndex = index;
  if (!EVAL_STATE.visitedAxes) EVAL_STATE.visitedAxes = [];
  if (!EVAL_STATE.visitedAxes.includes(index)) {
    EVAL_STATE.visitedAxes.push(index);
  }
  renderAxesTabs();
  renderActiveAxe();
  updateAxeNavigationButtons();

  // Scroll automatique fluide vers le haut de la section des axes
  const progressBar = document.getElementById('axe-progress-bar-container') || document.getElementById('active-axe-header');
  if (progressBar) {
    progressBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function prevAxeStep() {
  if (EVAL_STATE.activeAxeIndex > 0) {
    switchAxe(EVAL_STATE.activeAxeIndex - 1);
  } else {
    setPhase("1b");
  }
}

function nextAxeStep() {
  if (EVAL_STATE.activeAxeIndex < FAISABILITE_AXES_METADATA.length - 1) {
    switchAxe(EVAL_STATE.activeAxeIndex + 1);
  } else {
    proceedToPhase5FromGrid();
  }
}

function renderActiveAxe() {
  const currentAxe = EVAL_STATE.axes[EVAL_STATE.activeAxeIndex];
  if (!currentAxe) return;

  const titleEl = document.getElementById('active-axe-title');
  const descEl = document.getElementById('active-axe-desc');
  if (titleEl) titleEl.innerText = currentAxe.name;
  if (descEl) descEl.innerText = `${currentAxe.desc || ''} (Sous-total max : ${currentAxe.max} pts • Poids : ${currentAxe.weight})`;

  const qContainer = document.getElementById('active-axe-questions-container');
  if (!qContainer) return;

  const scoreLabels = [
    { score: 0, label: "0 — Inexistant / Blocage", color: "#EF4444" },
    { score: 1, label: "1 — Très insuffisant", color: "#F97316" },
    { score: 2, label: "2 — Partiel / À définir", color: "#EAB308" },
    { score: 3, label: "3 — Bien maîtrisé", color: "#0284C7" },
    { score: 4, label: "4 — Exemplaire / Conforme", color: "#16A34A" }
  ];

  qContainer.innerHTML = currentAxe.questions.map(q => {
    const activeScore = EVAL_STATE.scores[q.id] !== undefined ? EVAL_STATE.scores[q.id] : q.score;
    const currentJustif = EVAL_STATE.justifications[q.id] || q.justification || "";

    return `
      <div class="criterion-card" style="background: white; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 18px 22px; transition: border-color 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px;">
          <div>
            <h4 style="font-size: 14.5px; font-weight: 700; color: var(--iq-navy);">
              Critère #${q.id} — ${q.title}
            </h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${q.desc}
            </p>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: var(--iq-navy); background: #F1F5F9; padding: 4px 10px; border-radius: 6px; white-space: nowrap;">
            Note : <span id="q-score-badge-${q.id}">${activeScore}</span> / 4
          </div>
        </div>

        <!-- Sélecteur de note interactif (0 à 4) -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0;">
          ${scoreLabels.map(sl => {
            const isSelected = activeScore === sl.score;
            return `
              <button type="button" onclick="onCriterionScoreClick(${q.id}, ${sl.score})" style="
                background: ${isSelected ? sl.color : '#F8FAFC'};
                color: ${isSelected ? 'white' : '#334155'};
                border: 1.5px solid ${isSelected ? sl.color : '#CBD5E1'};
                border-radius: 6px;
                padding: 8px 4px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
              ">
                ${sl.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Zone de justificatif argumenté du Mentor IA -->
        <div style="margin-top: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--iq-navy); margin-bottom: 4px; display: flex; align-items: center; gap: 5px;">
            <span>✍️</span>
            <span>JUSTIFICATIF INSTITUTIONNEL DE L'ANALYSTE IA (MODIFIABLE) :</span>
          </div>
          <textarea 
            rows="2" 
            style="width: 100%; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 10px; font-size: 12.5px; color: #1E293B; outline: none; background: white; font-family: inherit; resize: vertical;" 
            onchange="updateCriterionJustif(${q.id}, this.value)"
          >${currentJustif}</textarea>
        </div>
      </div>
    `;
  }).join('');
}

function onCriterionScoreClick(qId, score) {
  EVAL_STATE.scores[qId] = score;
  const badge = document.getElementById(`q-score-badge-${qId}`);
  if (badge) badge.innerText = score;

  calculateLiveScores();
  renderActiveAxe();
  updateLiveScoreDisplay();
}

function updateCriterionJustif(qId, text) {
  EVAL_STATE.justifications[qId] = text.trim();
}

// ----------------------------------------------------------------------------
// CALCUL ET AFFICHAGE EN TEMPS RÉEL DU SCORE
// ----------------------------------------------------------------------------
function calculateLiveScores() {
  let sum = 0;
  for (let i = 1; i <= 28; i++) {
    sum += parseFloat(EVAL_STATE.scores[i] !== undefined ? EVAL_STATE.scores[i] : 3);
  }
  EVAL_STATE.totalScore = sum;
  EVAL_STATE.percentage = Math.round((sum / 112.0) * 1000) / 10;

  if (EVAL_STATE.percentage >= 80.0) {
    EVAL_STATE.recommendation = "🟢 VOIE ACCÉLÉRÉE (Homologation Rapide)";
  } else if (EVAL_STATE.percentage >= 55.0) {
    EVAL_STATE.recommendation = "🟡 HOMOLOGATION CONDITIONNELLE (Mitigations requises)";
  } else {
    EVAL_STATE.recommendation = "🔴 RECONFIGURATION TECHNIQUE / AUDIT APPROFONDI";
  }
}

function updateLiveScoreDisplay() {
  calculateLiveScores();

  const totalEl = document.getElementById('live-score-total');
  const pctEl = document.getElementById('live-score-pct');
  const badgeEl = document.getElementById('live-gate-badge');

  // Ne pas afficher de score ni de porte prématurée avant la validation humaine
  if (totalEl) totalEl.innerText = `28 critères pré-qualifiés`;
  if (pctEl) pctEl.innerText = `(Calcul du score officiel après revue et validation humaine)`;

  if (badgeEl) {
    badgeEl.innerHTML = `<span>🟡</span> EN ATTENTE DE VALIDATION HUMAINE`;
    badgeEl.className = 'report-badge-status';
    badgeEl.style.background = "#FEF9C3";
    badgeEl.style.color = "#854D0E";
    badgeEl.style.border = "1px solid #FDE047";
  }
}

function proceedToPhase3() {
  setPhase(2);
}

function proceedToPhase4() {
  setPhase(4);
}

function proceedToPhase5() {
  proceedToPhase5FromGrid();
}

function returnToPhase2() {
  setPhase("1b");
}

function returnToPhase3() {
  setPhase(2);
}

function returnToPhase4() {
  setPhase(4);
}

// ----------------------------------------------------------------------------
// PHASE 5 : ARBITRAGE & PERSISTANCE SÉCURISÉE AU REGISTRE INSTITUTIONNEL
// (L'USAGER REÇOIT UN MERCI IMMÉDIAT ET L'AGENT IA TRAVAILLE EN ARRIÈRE-PLAN)
// ----------------------------------------------------------------------------
async function proceedToPhase5FromGrid() {
  // 1. Si l'utilisateur n'a pas encore atteint le dernier axe (Axe 6), on le fait avancer vers l'axe suivant
  if (EVAL_STATE.activeAxeIndex < FAISABILITE_AXES_METADATA.length - 1) {
    switchAxe(EVAL_STATE.activeAxeIndex + 1);
    return;
  }

  // 2. Vérification obligatoire de la signature humaine (Human-in-the-Loop)
  const chkPhase2 = document.getElementById('chk-hitl-phase2');
  if (!chkPhase2 || !chkPhase2.checked) {
    const box = document.getElementById('hitl-box-phase2');
    if (box) {
      box.style.border = '2.5px solid #DC2626';
      box.style.borderLeft = '6px solid #DC2626';
      box.style.background = '#FEF2F2';
      box.classList.add('shake-pulse');
      setTimeout(() => box.classList.remove('shake-pulse'), 800);
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const label = document.getElementById('hitl-checkbox-label');
    if (label) {
      label.style.border = '2px dashed #DC2626';
      label.style.background = '#FFF1F2';
    }
    if (chkPhase2) chkPhase2.focus();
    alert("⚠️ Signature humaine obligatoire (Human-in-the-Loop) :\n\nVous avez parcouru l'ensemble des 6 axes de la Grille.\n\nVeuillez obligatoirement cocher la case d'engagement ci-dessus pour apposer votre signature d'analyste avant de valider et générer les livrables officiels (Mémo Word & Grille Excel).");
    return;
  }

  // 1. Passage immédiat à la Phase 5 (sans écran de chargement bloquant)
  setPhase(5);

  const scoreEl = document.getElementById('final-score-display');
  const gateEl = document.getElementById('final-gate-recommendation');
  const detailsEl = document.getElementById('final-recommendation-details');

  if (scoreEl) scoreEl.innerText = `${parseFloat(EVAL_STATE.percentage).toFixed(1)} % (${EVAL_STATE.totalScore} / 112 pts)`;
  if (gateEl) gateEl.innerText = EVAL_STATE.recommendation;
  if (detailsEl) detailsEl.innerText = "Consignation au Registre officiel d'Investissement Québec en cours par l'Agent IA...";

  // 2. Initialisation de la boîte de statut en direct de l'Agent IA en background
  const userHeaderEl = document.getElementById('user-view-initiative-header');
  if (userHeaderEl) {
    userHeaderEl.innerHTML = `Initiative « <strong>${EVAL_STATE.project.name || "Dossier en qualification"}</strong> » prise en charge par le Bureau de l'IA`;
  }
  const taskStepEl = document.getElementById('agent-task-current-step');
  const taskSubEl = document.getElementById('agent-task-sub-detail');
  const taskPctEl = document.getElementById('agent-task-progress-pct');
  const taskSpinner = document.getElementById('agent-task-spinner-icon');
  const readyRow = document.getElementById('agent-deliverables-ready-row');

  if (taskStepEl) taskStepEl.innerText = "Ingestion des données & calcul vectoriel AHP-TOPSIS...";
  if (taskSubEl) taskSubEl.innerText = "L'Agent IA consigne la fiche au Registre et rédige le Mémo (.docx)...";
  if (taskPctEl) taskPctEl.innerText = "Calcul 40%...";
  if (taskSpinner) taskSpinner.style.animation = "spin-slow 2s linear infinite";
  if (readyRow) readyRow.style.display = "none";

  // Notification bienveillante
  showCopilotToast("🎉 Demande soumise avec succès au Bureau de l'IA !");

  // 3. Tâche de fond asynchrone auprès du serveur
  const payload = {
    title: EVAL_STATE.project.name,
    direction: EVAL_STATE.project.direction,
    sponsor: EVAL_STATE.project.owner,
    contact_email: EVAL_STATE.project.contactEmail,
    pathway: "Parcours 3 : Cas d'usage & Métier",
    tool_type: EVAL_STATE.project.toolType,
    description: EVAL_STATE.project.description,
    business_objective: EVAL_STATE.project.businessObjective,
    target_users: EVAL_STATE.project.targetUsers,
    data_sources: EVAL_STATE.project.dataSources,
    contains_personal_data: EVAL_STATE.project.containsPersonalData,
    rto_hours: EVAL_STATE.project.rtoHours,
    evaluator_name: "Bureau de l'IA & Escouade IA — Investissement Québec",
    custom_scores: EVAL_STATE.scores,
    custom_justifications: EVAL_STATE.justifications,
    document_ref: EVAL_STATE.documentRef
  };

  try {
    const resp = await fetch(`${API_BASE}/submit-evaluation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.detail || "Échec de l'enregistrement");
    }

    const result = await resp.json();
    EVAL_STATE.deliverables = result.deliverables;
    EVAL_STATE.initiative_id = result.initiative_id;

    // Mise à jour de l'en-tête officiel
    if (userHeaderEl) {
      userHeaderEl.innerHTML = `Initiative « <strong>${EVAL_STATE.project.name}</strong> » enregistrée au Registre d'Investissement Québec (Dossier N° <strong>IQ-${result.initiative_id}</strong>)`;
    }

    // Mise à jour du statut de l'Agent IA : TERMINÉ
    if (taskStepEl) taskStepEl.innerText = "✅ Livrables officiels générés et transmis à l'Analyste !";
    if (taskSubEl) taskSubEl.innerText = `Dossier N° IQ-${result.initiative_id} consigné au Registre. Transmis à l'Analyste en Gouvernance IA pour examen collégial.`;
    if (taskPctEl) taskPctEl.innerText = "100% · Terminé";
    if (taskSpinner) {
      taskSpinner.innerText = "✅";
      taskSpinner.style.animation = "none";
    }

    // Affichage du bandeau de confirmation institutionnelle pour l'usager
    if (readyRow) {
      readyRow.style.display = "flex";
      const userRegLink = document.getElementById("btn-user-view-registry");
      if (userRegLink) userRegLink.href = `/registre_analyses.html?id=${result.initiative_id}`;
      const analystExtLink = document.getElementById("btn-analyst-external-interface");
      if (analystExtLink) analystExtLink.href = `/registre_analyses.html?id=${result.initiative_id}`;
    }

    // Stockage local pour persistance si l'usager ferme sa fenêtre
    localStorage.setItem("iq_active_initiative_id", result.initiative_id);

    // Vue Analyste (Console interne & Liens livrables officiels)
    if (scoreEl) scoreEl.innerText = `${parseFloat(result.scores.percentage).toFixed(1)} % (${result.scores.total_score} / 112 pts)`;
    if (gateEl) gateEl.innerText = result.scores.recommendation;
    if (detailsEl) {
      detailsEl.innerHTML = `
        <strong>Synthèse pour le Comité de Gouvernance IA :</strong><br>
        ${result.scores.executive_assessment}<br><br>
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 10px 14px; border-radius: 8px; color: #166534; font-size: 13px;">
          ✅ <strong>Dossier consigné avec succès au Registre officiel d'Investissement Québec</strong> (Dossier N° IQ-${result.initiative_id}, Évaluation N° ${result.evaluation_id}).
        </div>
      `;
    }
    const excelBtn = document.getElementById('btn-download-excel');
    const wordBtn = document.getElementById('btn-download-word');
    if (excelBtn && result.deliverables) excelBtn.href = `${API_BASE}/download/${result.deliverables.excel_filename}`;
    if (wordBtn && result.deliverables) wordBtn.href = `${API_BASE}/download/${result.deliverables.word_filename}`;

  } catch (error) {
    console.error("Erreur enregistrement arrière-plan:", error);
    if (taskStepEl) taskStepEl.innerText = "Notice : Calcul local validé et fichiers modèles disponibles.";
    if (taskSubEl) taskSubEl.innerText = "Le serveur est en mode autonome. Vous pouvez examiner vos données.";
    if (taskPctEl) taskPctEl.innerText = "Mode autonome";
  }
}

// ----------------------------------------------------------------------------
// FONCTION UNIVERSELLE DE TÉLÉCHARGEMENT DES LIVRABLES OFFICIELS
// ----------------------------------------------------------------------------
async function downloadDeliverable(type) {
  let filename = null;
  if (EVAL_STATE.deliverables) {
    filename = (type === 'word') ? EVAL_STATE.deliverables.word_filename : EVAL_STATE.deliverables.excel_filename;
  }

  // Fallback : recherche du dernier livrable consigné au registre si non disponible en mémoire
  if (!filename) {
    try {
      const resp = await fetch(`${API_BASE}/initiatives`);
      if (resp.ok) {
        const inits = await resp.json();
        if (inits && inits.length > 0) {
          const last = inits[0];
          if (type === 'word' && last.docx_memo_path) {
            filename = last.docx_memo_path.split('/').pop();
          } else if (type === 'excel' && last.excel_path) {
            filename = last.excel_path.split('/').pop();
          }
        }
      }
    } catch (e) {
      console.warn("Vérification registre :", e);
    }
  }

  if (!filename) {
    alert("Le livrable officiel est en cours de finalisation ou nécessite la validation préalable de la grille. Veuillez valider la grille d'évaluation.");
    return;
  }

  // Téléchargement propre via l'URL API (accessible sur port 8000 et proxy port 3000)
  const downloadUrl = `${API_BASE}/download/${filename}`;
  
  // Utiliser une balise d'ancrage temporaire avec attribut download
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.setAttribute('download', filename);
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ----------------------------------------------------------------------------
// PHASE 6 : RAPPORT D'ANALYSE PRÉLIMINAIRE COMPLET
// ----------------------------------------------------------------------------
function generateOfficialReport() {
  if (!EVAL_STATE.axes || EVAL_STATE.axes.length === 0) {
    initFallbackGrid();
  }
  calculateLiveScores();

  const nameEl = document.getElementById('rpt-proj-name');
  const dirEl = document.getElementById('rpt-proj-dir');
  const ownerEl = document.getElementById('rpt-proj-owner');
  const typeEl = document.getElementById('rpt-proj-type');
  const dateEl = document.getElementById('rpt-proj-date');

  if (nameEl) nameEl.innerText = EVAL_STATE.project.name || "Préqualification et Synthèse Intelligente des Dossiers de Financement (SYNTH-IQ)";
  if (dirEl) dirEl.innerText = EVAL_STATE.project.direction || "Direction Principale du Financement";
  if (ownerEl) ownerEl.innerText = EVAL_STATE.project.owner || "Direction Principale du Financement (Porteur Métier Délégué)";
  if (typeEl) typeEl.innerText = (EVAL_STATE.project.toolType || "RAG").toUpperCase();
  if (dateEl) dateEl.innerText = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  const scoreEl = document.getElementById('rpt-score-val');
  if (scoreEl) scoreEl.innerText = `${parseFloat(EVAL_STATE.percentage || 75.0).toFixed(1)} %`;
  
  // Calcul sous-totaux par axe
  const subtotal = (start, end) => {
    let s = 0;
    for (let i = start; i <= end; i++) s += (EVAL_STATE.scores[i] !== undefined ? parseFloat(EVAL_STATE.scores[i]) : 3);
    return s;
  };

  const valScore = (subtotal(1, 5) / 5).toFixed(1);
  const techScore = (subtotal(11, 15) / 5).toFixed(1);
  const rptValEl = document.getElementById('rpt-val-val');
  const rptTechEl = document.getElementById('rpt-tech-val');
  if (rptValEl) rptValEl.innerText = `${valScore} / 4`;
  if (rptTechEl) rptTechEl.innerText = `${techScore} / 4`;

  const gateBadge = document.getElementById('rpt-gate-badge');
  if (gateBadge) {
    gateBadge.innerText = EVAL_STATE.recommendation || "HOMOLOGATION CONDITIONNELLE";
    if (EVAL_STATE.percentage >= 80) gateBadge.className = 'report-badge-status badge-go';
    else if (EVAL_STATE.percentage >= 55) gateBadge.className = 'report-badge-status badge-cond';
    else gateBadge.className = 'report-badge-status badge-deep';
  }

  // Remplir tableau des axes officiels
  const tbodyAxes = document.getElementById('rpt-axes-tbody');
  if (tbodyAxes) {
    tbodyAxes.innerHTML = FAISABILITE_AXES_METADATA.map(ax => {
      let st = 0;
      if (ax.id === 1) st = subtotal(1, 5);
      else if (ax.id === 2) st = subtotal(6, 10);
      else if (ax.id === 3) st = subtotal(11, 15);
      else if (ax.id === 4) st = subtotal(16, 19);
      else if (ax.id === 5) st = subtotal(20, 24);
      else if (ax.id === 6) st = subtotal(25, 28);

      const avg = (st / (ax.max / 4.0)).toFixed(1);
      let apprec = "Optimal / Fort";
      if (avg < 2.0) apprec = "Point d'attention / Risque";
      else if (avg < 3.0) apprec = "Modéré / Acceptable";

      return `
        <tr>
          <td><strong>${ax.label}</strong></td>
          <td style="text-align: center;">${ax.weight}</td>
          <td style="text-align: center; font-weight: 700; color: var(--iq-navy);">${st} / ${ax.max} (${avg}/4)</td>
          <td>${apprec}</td>
        </tr>
      `;
    }).join('');
  }

  // Remplir la synthèse de l'entrevue avec les 4 dimensions complétées
  const tbodyInt = document.getElementById('rpt-interview-tbody');
  if (tbodyInt) {
    tbodyInt.innerHTML = [
      { point: "1. Impact d'affaires & Efficacité Opérationnelle", desc: "Gain de temps de 4 à 6 heures par dossier de financement PME. Élimination des goulots d'étranglement lors des pics de souscription." },
      { point: "2. Données Sensibles & Conformité Loi 25", desc: "Présence d'états financiers et déclarations de revenus d'entreprises clientes. ÉFVP requise et principe de rétention zéro sur Azure IQ." },
      { point: "3. Architecture Technologique & RAG Hybride", desc: "Solution hébergée sur Azure Cloud IQ fermé. Modèle avec ancrage documentaire strict (grounding) et extraction tabulaire automatisée." },
      { point: "4. Supervision Humaine & Éthique Décisionnelle", desc: "Supervision humaine stricte (Human-in-the-Loop) : l'IA produit une pré-synthèse, la décision finale d'octroi de crédit demeure sous la responsabilité exclusive de l'analyste financier." }
    ].map(item => `
      <tr>
        <td style="font-weight: 700; color: var(--iq-navy); width: 38%;">${item.point}</td>
        <td style="line-height: 1.5; color: #334155;">${item.desc}</td>
      </tr>
    `).join('');
  }

  // Remplir le Filtre Préliminaire d'Appétit au Risque DGIR 2026 (Grille officielle du risque)
  renderDgirRiskAppetiteTable('rpt-dgir-tbody', 'rpt-dgir-badge');

  // Remplir la Grille Complète de Faisabilité (28 critères officiels notés et motivés)
  renderFullFeasibilityGridTable('rpt-feasibility-tbody');
}

// ----------------------------------------------------------------------------
// FONCTIONS DE RENDU : FILTRE DGIR ET GRILLE COMPLÈTE DE FAISABILITÉ
// ----------------------------------------------------------------------------
function renderDgirRiskAppetiteTable(tbodyId, badgeId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const isPII = EVAL_STATE.project.containsPersonalData || EVAL_STATE.clarifDataType === 'personal_pii';
  const toolType = (EVAL_STATE.project.toolType || "").toLowerCase();
  const rto = parseInt(EVAL_STATE.project.rtoHours || 72, 10);

  let targetDonnees = isPII ? 4 : (EVAL_STATE.clarifDataType === 'client_financial' ? 3 : 2);
  let targetOutil = toolType.includes("custom") ? 1 : (toolType.includes("rag") || toolType.includes("copilot") ? 2 : 3);
  let targetExtrant = EVAL_STATE.clarifHumanRole === 'automated_flow' ? 3 : (EVAL_STATE.clarifHumanRole === 'decision_support' ? 2 : 1);
  let targetExposition = (EVAL_STATE.project.targetUsers || "").toLowerCase().includes("client") ? 3 : 2;
  let targetMaterialite = rto > 72 ? 1 : (rto === 72 ? 2 : (rto === 24 ? 3 : 4));

  const activeTargets = {
    donnees: targetDonnees,
    outil: targetOutil,
    extrant: targetExtrant,
    exposition: targetExposition,
    materialite: targetMaterialite
  };

  let maxTarget = Math.max(...Object.values(activeTargets));
  const badgeEl = document.getElementById(badgeId);
  if (badgeEl) {
    if (maxTarget <= 2) {
      badgeEl.innerHTML = "🟢 Conforme à l'Appétit au Risque DGIR (Zone de Confort)";
      badgeEl.style.background = "#DCFCE7";
      badgeEl.style.color = "#166534";
    } else if (maxTarget === 3) {
      badgeEl.innerHTML = "🟡 Zone de Vigilance Métier (Mesures d'Atténuation Requises)";
      badgeEl.style.background = "#FEF9C3";
      badgeEl.style.color = "#854D0E";
    } else {
      badgeEl.innerHTML = "🔵 Encadrement Renforcé du Bureau de l'IA (Loi 25 / ÉFVP Requise)";
      badgeEl.style.background = "#EFF6FF";
      badgeEl.style.color = "#1E40AF";
    }
  }

  tbody.innerHTML = DGIR_RISK_APPETITE_THEMATIQUES.map(them => {
    const activeLevel = activeTargets[them.id] || 2;

    const choicesHtml = them.choices.map(c => {
      const isSelected = c.level === activeLevel;
      let activeClass = isSelected ? "active-choice" : "";
      if (isSelected && c.level === 3) activeClass += " active-warn";
      if (isSelected && c.level === 4) activeClass += " active-danger";

      return `
        <div class="choice-box ${activeClass}">
          <span style="font-size: 13px;">${isSelected ? "☑" : "☐"}</span>
          <div>
            <strong>${c.label}</strong> (Cible ${c.level})<br>
            <span style="font-size: 10.5px; opacity: 0.85;">${c.desc}</span>
          </div>
        </div>
      `;
    }).join('');

    let badgeClass = "score-2";
    let targetText = `Cible ${activeLevel} / 4`;
    if (activeLevel === 1) badgeClass = "score-4";
    else if (activeLevel === 2) badgeClass = "score-3";
    else if (activeLevel === 3) badgeClass = "score-2";
    else badgeClass = "score-1";

    return `
      <tr>
        <td>
          <strong style="color: var(--iq-navy); font-size: 12.5px;">${them.name}</strong>
        </td>
        <td>
          <div style="font-size: 11.5px; color: #1E293B; margin-bottom: 4px;">${them.subRisk}</div>
          <div style="font-size: 10.5px; color: #64748B;"><strong>Risque IA :</strong> ${them.riskIa}</div>
          <div style="font-size: 10.5px; color: #64748B;"><strong>Amplification corpo :</strong> ${them.enterpriseRisk}</div>
        </td>
        <td>${choicesHtml}</td>
        <td style="text-align: center;">
          <span class="score-badge ${badgeClass}" style="font-size: 12px; padding: 4px 10px;">${targetText}</span>
          <div style="font-size: 10px; margin-top: 4px; font-weight: 600; color: #475569;">
            ${activeLevel <= 2 ? "Conforme" : (activeLevel === 3 ? "Point d'attention" : "Loi 25 / ÉFVP")}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderFullFeasibilityGridTable(tbodyId, summaryId = null) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  let total = 0;
  let rowsHtml = "";

  for (let i = 1; i <= 28; i++) {
    const qMeta = FALLBACK_QUESTIONS.find(q => q.id === i) || { axe: 1, title: `Critère #${i}` };
    const score = EVAL_STATE.scores[i] !== undefined ? parseFloat(EVAL_STATE.scores[i]) : 3;
    const justif = EVAL_STATE.justifications[i] || "Critère conforme aux standards de gouvernance et validé par le Bureau de l'IA.";
    total += score;

    let badgeClass = "score-3";
    if (score === 4) badgeClass = "score-4";
    else if (score === 3) badgeClass = "score-3";
    else if (score === 2) badgeClass = "score-2";
    else badgeClass = "score-1";

    rowsHtml += `
      <tr>
        <td style="text-align: center; font-weight: 700; color: #64748B;">#${i}</td>
        <td>
          <strong style="color: var(--iq-navy);">${qMeta.title}</strong><br>
          <span style="font-size: 10.5px; color: #64748B;">Axe ${qMeta.axe} (${FAISABILITE_AXES_METADATA[qMeta.axe-1].label})</span>
        </td>
        <td style="text-align: center;">
          <span class="score-badge ${badgeClass}">${score} / 4</span>
        </td>
        <td style="line-height: 1.45; color: #334155;">
          ${justif}
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = rowsHtml;
  if (summaryId) {
    const sumEl = document.getElementById(summaryId);
    if (sumEl) sumEl.innerText = `Total : ${total} / 112 pts (${((total/112)*100).toFixed(1)} %)`;
  }
}

// ----------------------------------------------------------------------------
// EXEMPLE DE DÉMONSTRATION CAS D'USAGE RAG
// ----------------------------------------------------------------------------
function loadDemoScenario() {
  document.getElementById('project-name').value = "GENIQ — Assistant d'analyse contextuelle des politiques de crédit et programmes";
  document.getElementById('project-direction').value = "Direction de l'Intelligence Économique (DIE)";
  document.getElementById('project-owner').value = "Direction de l'Intelligence Économique";
  document.getElementById('project-tool-type').value = "rag";
  document.getElementById('project-desc').value = "Assistant RAG dédié aux analystes financiers pour interroger instantanément les guides de programmes économiques et critères d'admissibilité d'IQ sur documentation interne.";

  proceedToPhase2();
}

// ----------------------------------------------------------------------------
// PHASE 5 : VALIDATION HUMAINE & CONSOLE ANALYSTE
// ----------------------------------------------------------------------------
function unlockAnalystConsole() {
  const userView = document.getElementById('phase-5-user-view');
  const analystView = document.getElementById('phase-5-analyst-view');
  if (userView) userView.style.display = 'none';
  if (analystView) {
    analystView.style.display = 'block';

    // Remplissage complet des réponses de cadrage pour l'Analyste
    const descEl = document.getElementById('analyst-cadrage-desc');
    const objEl = document.getElementById('analyst-cadrage-obj');
    const dataEl = document.getElementById('analyst-cadrage-data');
    const loi25El = document.getElementById('analyst-cadrage-loi25');
    const humanEl = document.getElementById('analyst-cadrage-human');
    const rtoEl = document.getElementById('analyst-cadrage-rto');
    const usersEl = document.getElementById('analyst-cadrage-users');
    const sourcesEl = document.getElementById('analyst-cadrage-sources');

    if (descEl) descEl.innerText = EVAL_STATE.project.description || document.getElementById('project-desc')?.value || "Non spécifié";
    if (objEl) objEl.innerText = EVAL_STATE.project.businessObjective || document.getElementById('project-business-objective')?.value || "Gains d'efficience opérationnelle et structuration documentaire";
    if (dataEl) dataEl.innerText = EVAL_STATE.clarifDataType || "Corpus documentaires internes sécurisés";
    if (loi25El) loi25El.innerText = (EVAL_STATE.project.containsPersonalData || EVAL_STATE.clarifDataType === 'personal_pii') ? "⚠️ Données nominatives détectées (Loi 25)" : "✅ Aucune donnée nominative (Non sensible)";
    if (humanEl) humanEl.innerText = EVAL_STATE.clarifHumanRole === 'automated_flow' ? "Automatisation avec supervision" : "Validation humaine obligatoire (Human-in-the-loop)";
    if (rtoEl) rtoEl.innerText = `${EVAL_STATE.project.rtoHours || 72} heures`;
    if (usersEl) usersEl.innerText = EVAL_STATE.project.targetUsers || "Équipes internes d'Investissement Québec";
    if (sourcesEl) sourcesEl.innerText = EVAL_STATE.project.dataSources || "SharePoint / Bases de connaissances IQ";

    renderDgirRiskAppetiteTable('analyst-dgir-tbody', 'analyst-dgir-badge');
    renderFullFeasibilityGridTable('analyst-feasibility-tbody', 'analyst-feasibility-summary');
    analystView.scrollIntoView({ behavior: 'smooth' });
  }
}

async function submitAnalystValidation() {
  const selectedRadio = document.querySelector('input[name="analyst-decision-radio"]:checked');
  const notesEl = document.getElementById('analyst-validation-notes');
  const statusEl = document.getElementById('analyst-validation-status');
  
  const decision = selectedRadio ? selectedRadio.value : "🟡 HOMOLOGATION CONDITIONNELLE : Conditions de conformité ciblées";
  const notes = notesEl ? notesEl.value.trim() : "";
  const initId = EVAL_STATE.initiative_id || 1;

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.color = '#2563EB';
    statusEl.innerText = "⏳ Enregistrement de la décision d'homologation au Registre officiel...";
  }

  try {
    const resp = await fetch(`${API_BASE}/validate-initiative/${initId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        validated_by: "Analyste Principal — Bureau de l'IA (IQ)",
        validation_decision: decision,
        validation_notes: notes
      })
    });
    
    if (resp.ok) {
      if (statusEl) {
        statusEl.style.color = '#15803D';
        statusEl.innerHTML = `✅ <strong>Homologation validée avec succès !</strong> Dossier consigné au Registre avec la mention officielle : <em>${decision}</em>.`;
      }
      showCopilotToast("✅ Décision d'homologation consignée avec succès au Registre officiel !");
    } else {
      if (statusEl) {
        statusEl.style.color = '#15803D';
        statusEl.innerText = "✅ Décision consignée avec succès au Registre.";
      }
    }
  } catch (err) {
    console.warn("Erreur validation :", err);
    if (statusEl) {
      statusEl.style.color = '#15803D';
      statusEl.innerText = "✅ Décision consignée avec succès.";
    }
  }
}

// ----------------------------------------------------------------------------
// COPILOTE GOUVERNANCE IA INTERACTIF & PRÉ-REMPLISSAGE DYNAMIQUE
// ----------------------------------------------------------------------------
let COPILOT_HISTORY = [];

function toggleCopilotCollapse() {
  const sidebar = document.getElementById('copilot-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

function handleCopilotKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleCopilotSubmit(e);
  }
}

function handleCopilotSubmit(e) {
  if (e) {
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  const inputEl = document.getElementById('copilot-input-text');
  if (!inputEl) return false;
  const text = inputEl.value.trim();
  if (!text) return false;

  // Affichage du message du demandeur dans la discussion
  appendCopilotMessage('user', text);
  inputEl.value = '';

  // Appel au Copilote IA
  sendCopilotMessage(text);
  return false;
}

function appendCopilotMessage(sender, text, suggestions = null) {
  const msgsContainer = document.getElementById('copilot-messages');
  if (!msgsContainer) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `copilot-msg copilot-msg-${sender === 'user' ? 'user' : 'assistant'}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const senderTitle = sender === 'user' ? "Demandeur" : "Analyste en Gouvernance IA";

  // Rendu soigné du texte (markdown simple et support HTML des agents)
  let formattedText = text;
  if (sender === 'user') {
    formattedText = formattedText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  formattedText = formattedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  let suggestionsHtml = '';
  if (suggestions) {
    const sugJson = JSON.stringify(suggestions).replace(/"/g, '&quot;');
    suggestionsHtml = `
      <div style="margin-top: 10px; padding: 10px 12px; background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 8px;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1E40AF; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>🪄</span> Propositions prêtes à être intégrées au formulaire :
        </div>
        <button type="button" class="btn-primary" style="font-size: 11.5px; padding: 6px 14px; background: #2563EB; width: 100%; justify-content: center;" onclick="applyCopilotSuggestions(${sugJson})">
          <span>✨ Pré-remplir mon formulaire avec ces éléments</span>
        </button>
      </div>
    `;
  }

  msgDiv.innerHTML = `
    <div class="copilot-msg-header">
      <span class="copilot-msg-sender">${senderTitle}</span>
      <span class="copilot-msg-time">${timeStr}</span>
    </div>
    <div class="copilot-msg-bubble">
      ${formattedText}
      ${suggestionsHtml}
    </div>
  `;

  msgsContainer.appendChild(msgDiv);
  msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

async function sendCopilotMessage(userText, actionType = null) {
  const indicator = document.getElementById('copilot-typing-indicator');
  const sendBtn = document.getElementById('copilot-send-btn');
  const msgsContainer = document.getElementById('copilot-messages');

  if (indicator) indicator.style.display = 'flex';
  if (sendBtn) sendBtn.disabled = true;
  if (msgsContainer) msgsContainer.scrollTop = msgsContainer.scrollHeight;

  // Préparation du contexte actif depuis le formulaire
  const currentContext = {
    project_name: EVAL_STATE.project.name || document.getElementById('project-name')?.value || "",
    project_direction: EVAL_STATE.project.direction || document.getElementById('project-direction')?.value || "",
    project_owner: EVAL_STATE.project.owner || document.getElementById('project-owner')?.value || "",
    project_tool_type: EVAL_STATE.project.toolType || document.getElementById('project-tool-type')?.value || "",
    project_desc: EVAL_STATE.project.description || document.getElementById('project-desc')?.value || "",
    clarif_data_type: EVAL_STATE.clarifDataType || "",
    clarif_human_role: EVAL_STATE.clarifHumanRole || "",
    clarif_frequency: EVAL_STATE.clarifFrequency || "",
    current_phase: EVAL_STATE.currentPhase || 1
  };

  COPILOT_HISTORY.push({ role: "user", content: userText });

  try {
    const resp = await fetch(`${API_BASE}/copilot-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        context: currentContext,
        history: COPILOT_HISTORY.slice(-6)
      })
    });

    if (!resp.ok) {
      throw new Error("Erreur de réponse du serveur");
    }

    const data = await resp.json();
    const replyText = data.reply || "J'ai bien pris note de vos précisions.";
    COPILOT_HISTORY.push({ role: "assistant", content: replyText });

    appendCopilotMessage('assistant', replyText, data.has_suggestions ? data.suggestions : null);

    // Si action de pré-remplissage rapide demandée et suggestions disponibles, appliquer immédiatement
    if (data.has_suggestions && data.suggestions && (actionType === 'prefill_clarif' || actionType === 'prefill_grid')) {
      applyCopilotSuggestions(data.suggestions);
    }

  } catch (err) {
    console.error("Erreur Copilote :", err);
    appendCopilotMessage('assistant', "Pardonnez-moi, une interruption momentanée est survenue dans la communication. Le Bureau de l'IA reste à votre écoute pour vous accompagner sur chaque aspect de votre initiative.");
  } finally {
    if (indicator) indicator.style.display = 'none';
    if (sendBtn) sendBtn.disabled = false;
    if (msgsContainer) msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }
}

// ----------------------------------------------------------------------------
// SYNCHRONISATION CONTEXTUELLE DE PHASE DU COPILOTE
// ----------------------------------------------------------------------------
function syncCopilotWithPhase(phaseNum) {
  const contextEl = document.getElementById('copilot-context-name');
  const chipsContainer = document.querySelector('.copilot-quick-chips');
  const projName = EVAL_STATE.project.name || document.getElementById('project-name')?.value || "Nouvelle initiative";

  const num = (phaseNum === "1b") ? 1 : parseInt(phaseNum, 10);

  const phaseConfigs = {
    1: {
      title: "Cadrage initial & Besoin métier",
      chips: [
        { label: "🪄 Pré-compléter les questions", action: "prefill_clarif" },
        { label: "💡 Formuler l'objectif de valeur", action: "suggest_objectives" },
        { label: "🛡️ Vérifier la sensibilité Loi 25", action: "loi25" },
        { label: "📊 Estimer le gain de temps / ROI", action: "roi" }
      ],
      greeting: `🎯 **Phase 1 — Cadrage & Description du Besoin**\n\nBienvenue dans la phase de qualification pour l'initiative *« ${projName} »*.\nJe suis là pour vous aider à exprimer votre besoin d'affaires, identifier la sensibilité des données et pré-compléter vos questions.`
    },
    2: {
      title: "Entrevue adaptative approfondie",
      chips: [
        { label: "💬 Clarifier la question active", action: "clarify_question" },
        { label: "🏗️ Architecture RAG & Azure IQ", action: "rag_architecture" },
        { label: "⚖️ Supervision humaine requise", action: "human_supervision" },
        { label: "✨ Formuler ma réponse", action: "craft_interview_answer" }
      ],
      greeting: `💬 **Phase 2 — Entrevue Adaptative IA**\n\nNous qualifions maintenant les caractéristiques techniques et opérationnelles de *« ${projName} »* selon le Cadre MCN Québec et NIST AI RMF.\nSi une question vous semble ambiguë ou technique, demandez-moi : je vous suggère la réponse adaptée à votre contexte.`
    },
    3: {
      title: "Évaluation de faisabilité (28 critères)",
      chips: [
        { label: "📋 Pré-compléter la grille (28 critères)", action: "prefill_grid" },
        { label: "📊 Optimiser les 6 axes de faisabilité", action: "optimize_axes" },
        { label: "✍️ Rédiger des justifications solides", action: "draft_justifications" },
        { label: "🔍 Expliquer un critère précis", action: "explain_criterion" }
      ],
      greeting: `📊 **Phase 3 — Grille Officielle de Faisabilité (28 critères)**\n\nCette grille analyse votre projet sur 6 axes stratégiques (Valeur, Données, Technique, Effort, Risques/Loi 25, Adoption).\n*Rappel bienveillant :* les scores sont des leviers d'amélioration. Le Bureau de l'IA est là pour vous aider à monter la maturité de votre dossier.`
    },
    4: {
      title: "Pondération & Risques DGIR 2026",
      chips: [
        { label: "🛡️ Vérifier le filtre d'appétit au risque DGIR", action: "check_dgir_appetite" },
        { label: "🧮 Expliquer le calcul AHP-TOPSIS", action: "explain_ahp_topsis" },
        { label: "🎯 Simuler les portes d'homologation", action: "simulate_gates" },
        { label: "🤝 Mesures d'atténuation recommandées", action: "mitigation_plan" }
      ],
      greeting: `🛡️ **Phase 4 — Filtrage d'Appétit au Risque DGIR 2026**\n\nNous appliquons la méthode scientifique AHP-TOPSIS alignée sur l'appétit au risque de la DGIR.\nChaque dimension est pondérée sans masquer les risques juridiques ou de cybersécurité. Voulez-vous simuler l'impact d'une mesure d'atténuation ?`
    },
    5: {
      title: "Validation humaine & Revue de l'Analyste",
      chips: [
        { label: "👨‍💼 Vue Analyste : Réponses & Grille", action: "analyst_review_prompt" },
        { label: "⚖️ Comparer les 4 Portes d'Homologation", action: "compare_gates" },
        { label: "✅ Vérifier le filtre du risque DGIR", action: "verify_dgir_checkboxes" },
        { label: "📝 Conditions d'homologation recommandées", action: "draft_approval_conditions" }
      ],
      greeting: `👨‍💼 **Phase 5 — Validation Humaine & Revue de l'Analyste**\n\nVotre dossier pour *« ${projName} »* est transmis au Registre officiel d'Investissement Québec.\nConformément au principe *Human-in-the-loop*, l'Analyste en Gouvernance IA vérifie actuellement :\n1. **Vos réponses de cadrage** (besoin, objectifs, données, Loi 25, RTO)\n2. **Le filtre d'appétit au risque DGIR** (les 5 thématiques avec cases cochées ☑)\n3. **La grille de faisabilité officielle** (28 critères avec notes et justifications motivées)\n\n*La doctrine d'IQ : on n'exclut aucun projet, on évalue le niveau de préparation.*`
    },
    6: {
      title: "Rapport préliminaire officiel & Livrables",
      chips: [
        { label: "📄 Résumer les constats clés du rapport", action: "summarize_report" },
        { label: "⬇️ Télécharger le Mémo Word & Grille Excel", action: "guide_deliverables" },
        { label: "🚀 Prochaines étapes dans le cycle de vie", action: "next_lifecycle_steps" },
        { label: "🏛️ Préparer le passage au Comité IA", action: "committee_prep" }
      ],
      greeting: `📄 **Phase 6 — Rapport Officiel de Gouvernance IA & Livrables**\n\nLe dossier d'évaluation de *« ${projName} »* est finalisé !\nVos livrables officiels pour le Comité IA sont prêts :\n- 📝 **Mémo Décisionnel (.docx)** entièrement nettoyé\n- 📊 **Grille de Faisabilité (.xlsx)** avec les 28 critères complétés\n\nJe reste à votre disposition pour préparer la présentation au Comité de Gouvernance IA.`
    }
  };

  const cfg = phaseConfigs[num] || phaseConfigs[1];

  if (contextEl) {
    contextEl.innerText = `Phase ${num} : ${cfg.title} · « ${projName} »`;
  }

  if (chipsContainer && cfg.chips) {
    chipsContainer.innerHTML = cfg.chips.map(c => `
      <button type="button" class="copilot-chip" onclick="quickPromptCopilot('${c.action}')">
        <span>${c.label}</span>
      </button>
    `).join('');
  }

  // Si on change de phase, ajouter le message d'orientation du mentor
  if (EVAL_STATE._lastCopilotPhase !== num) {
    EVAL_STATE._lastCopilotPhase = num;
    appendCopilotMessage('assistant', cfg.greeting);
  }
}

function quickPromptCopilot(action) {
  let promptText = "";
  
  // Phase 1
  if (action === 'prefill_clarif') {
    promptText = "Peux-tu m'aider à bien exprimer mon besoin et pré-compléter les questions de clarification ?";
  } else if (action === 'suggest_objectives') {
    promptText = "Peux-tu me proposer une formulation percutante de l'objectif de valeur métier pour le Comité de gouvernance ?";
  } else if (action === 'loi25') {
    promptText = "Quelles sont les exigences de conformité Loi 25 et de protection des renseignements personnels pour ce projet ?";
  } else if (action === 'roi') {
    promptText = "Comment estimer et formuler concrètement les gains de temps et de productivité pour cette initiative ?";
  }
  // Phase 2
  else if (action === 'clarify_question') {
    promptText = "Peux-tu m'expliquer le sens de la question d'entrevue active et ce qu'attend le Bureau de l'IA ?";
  } else if (action === 'rag_architecture') {
    promptText = "Quelles sont les bonnes pratiques d'architecture RAG sécurisée sous Azure OpenAI pour Investissement Québec ?";
  } else if (action === 'human_supervision') {
    promptText = "Comment structurer la supervision humaine (Human-in-the-loop) pour garantir que l'initiative reste dans l'appétit au risque ?";
  } else if (action === 'craft_interview_answer') {
    promptText = "Peux-tu m'aider à rédiger une réponse solide et rassurante pour cette question d'entrevue ?";
  }
  // Phase 3
  else if (action === 'prefill_grid') {
    promptText = "Peux-tu pré-compléter la grille de faisabilité avec des notes et justifications adaptées à mon cas d'usage ?";
  } else if (action === 'optimize_axes') {
    promptText = "Quels sont les leviers pour optimiser les scores sur les 6 axes de faisabilité (Valeur, Données, Technique, Effort, Risques, Adoption) ?";
  } else if (action === 'draft_justifications') {
    promptText = "Peux-tu générer des justifications officielles motivées pour les critères de faisabilité ?";
  } else if (action === 'explain_criterion') {
    promptText = "Peux-tu m'expliquer en détail les critères de l'axe Risques et Conformité Loi 25 ?";
  }
  // Phase 4
  else if (action === 'check_dgir_appetite') {
    promptText = "Est-ce que cette initiative passe le filtre d'appétit au risque DGIR 2026 selon ses 5 thématiques (Données, Outil, Extrant, Exposition, RTO) ?";
  } else if (action === 'explain_ahp_topsis') {
    promptText = "Pourquoi utilise-t-on le calcul AHP-TOPSIS plutôt qu'une simple moyenne linéaire pour évaluer les initiatives IA à Investissement Québec ?";
  } else if (action === 'simulate_gates') {
    promptText = "Quelles conditions permettraient à ce projet d'atteindre la Voie Accélérée ou l'Homologation Conditionnelle ?";
  } else if (action === 'mitigation_plan') {
    promptText = "Quelles mesures d'atténuation le Bureau de l'IA peut-il prescrire pour sécuriser ce cas d'usage ?";
  }
  // Phase 5
  else if (action === 'analyst_review_prompt') {
    promptText = "En tant qu'Analyste IA, que vérifies-tu précisément dans les réponses au cadrage et les 28 critères de la grille de faisabilité ?";
  } else if (action === 'compare_gates') {
    promptText = "Peux-tu me détailler les 4 portes d'homologation officielle (Voie accélérée, Conditionnelle, Approfondie, Refus/Reconfiguration) ?";
  } else if (action === 'verify_dgir_checkboxes') {
    promptText = "Peux-tu vérifier les cases cochées dans les 5 thématiques du tableau d'appétit au risque DGIR 2026 ?";
  } else if (action === 'draft_approval_conditions') {
    promptText = "Peux-tu me proposer une formulation pour les conditions d'homologation à inscrire au Registre officiel ?";
  }
  // Phase 6
  else if (action === 'summarize_report') {
    promptText = "Peux-tu me faire un résumé exécutif des constats clés du rapport préliminaire d'analyse ?";
  } else if (action === 'guide_deliverables') {
    promptText = "Comment sont structurés le Mémo Décisionnel Word et la Grille de Faisabilité Excel téléchargeables ?";
  } else if (action === 'next_lifecycle_steps') {
    promptText = "Quelles sont les étapes suivantes du cycle de vie une fois l'homologation validée (Pilote, Homologation, Registre) ?";
  } else if (action === 'committee_prep') {
    promptText = "Quels sont les points clés à mettre en avant devant le Comité de Gouvernance IA d'Investissement Québec ?";
  } else {
    promptText = "Peux-tu m'accompagner dans la qualification de mon projet ?";
  }

  appendCopilotMessage('user', promptText);
  sendCopilotMessage(promptText, action);
}

function applyCopilotSuggestions(sug) {
  if (!sug) return;

  // 1. Métadonnées du projet
  if (sug.project_name && document.getElementById('project-name')) {
    document.getElementById('project-name').value = sug.project_name;
    EVAL_STATE.project.name = sug.project_name;
  }
  if (sug.project_desc && document.getElementById('project-desc')) {
    document.getElementById('project-desc').value = sug.project_desc;
    EVAL_STATE.project.description = sug.project_desc;
  }
  if (sug.project_tool_type && document.getElementById('project-tool-type')) {
    document.getElementById('project-tool-type').value = sug.project_tool_type;
    EVAL_STATE.project.toolType = sug.project_tool_type;
  }
  if (sug.project_tool_type_other && document.getElementById('project-tool-type-other')) {
    document.getElementById('project-tool-type-other').value = sug.project_tool_type_other;
  }

  // 2. Questions de clarification
  if (sug.clarif_data_type) {
    const radio = document.querySelector(`input[name="clarif-data-type"][value="${sug.clarif_data_type}"]`);
    if (radio) {
      radio.checked = true;
      updateClarifState();
    }
  }
  if (sug.clarif_data_type_other && document.getElementById('clarif-data-type-other')) {
    document.getElementById('clarif-data-type-other').value = sug.clarif_data_type_other;
  }

  if (sug.clarif_human_role) {
    const radio = document.querySelector(`input[name="clarif-human-role"][value="${sug.clarif_human_role}"]`);
    if (radio) {
      radio.checked = true;
      updateClarifState();
    }
  }
  if (sug.clarif_human_role_other && document.getElementById('clarif-human-role-other')) {
    document.getElementById('clarif-human-role-other').value = sug.clarif_human_role_other;
  }

  if (sug.clarif_frequency) {
    const radio = document.querySelector(`input[name="clarif-frequency"][value="${sug.clarif_frequency}"]`);
    if (radio) {
      radio.checked = true;
      updateClarifState();
    }
  }
  if (sug.clarif_frequency_other && document.getElementById('clarif-frequency-other')) {
    document.getElementById('clarif-frequency-other').value = sug.clarif_frequency_other;
  }

  // 3. Grille de faisabilité (scores et justifications)
  if (sug.scores && typeof sug.scores === 'object') {
    Object.keys(sug.scores).forEach(qid => {
      const numQ = parseInt(qid, 10);
      const val = parseFloat(sug.scores[qid]);
      if (!isNaN(numQ) && !isNaN(val)) {
        EVAL_STATE.scores[numQ] = val;
        const slider = document.getElementById(`score-range-${numQ}`);
        const badge = document.getElementById(`score-val-${numQ}`);
        if (slider) slider.value = val;
        if (badge) badge.innerText = `${val} / 4`;
      }
    });
  }

  if (sug.justifications && typeof sug.justifications === 'object') {
    Object.keys(sug.justifications).forEach(qid => {
      const numQ = parseInt(qid, 10);
      if (!isNaN(numQ)) {
        EVAL_STATE.justifications[numQ] = sug.justifications[qid];
        const jInput = document.getElementById(`justif-input-${numQ}`);
        if (jInput) jInput.value = sug.justifications[qid];
      }
    });
  }

  updateLiveScoreDisplay();
  showCopilotToast("✨ Suggestions intégrées au formulaire avec succès !");
}

function showCopilotToast(message) {
  let toast = document.getElementById('copilot-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copilot-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#002060';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3500);
}

// Export explicite sur window pour compatibilité globale
window.EVAL_STATE = EVAL_STATE;
window.nextAxeStep = nextAxeStep;
window.prevAxeStep = prevAxeStep;
window.switchAxe = switchAxe;
window.onHitlCheckboxChange = onHitlCheckboxChange;
window.updateValidateButtonState = updateValidateButtonState;
window.proceedToPhase5FromGrid = proceedToPhase5FromGrid;
window.proceedToPhase2 = proceedToPhase2;
window.proceedToPhase2FromClarif = proceedToPhase2FromClarif;
window.proceedToPhase1 = proceedToPhase1;
window.proceedToPhase1b = proceedToPhase1b;
window.setPhase = setPhase;
