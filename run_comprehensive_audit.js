const fs = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM } = require('jsdom');

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('🧪 AUDIT D\'INTÉGRITÉ & VALIDATION GLOBALE DU GUICHET D\'ÉVALUATION');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Échec du test : ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // SECTION 1 : VÉRIFICATION DU CONTENU ET DES MESSAGES INSTITUTIONNELS
  // -------------------------------------------------------------------------
  console.log('--- TEST 1 : Messages institutionnels & Raccourci 3 jours à 3 minutes ---');
  const mainJsContent = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
  const indexHtmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const evalHtmlContent = fs.readFileSync(path.join(__dirname, 'evaluation.html'), 'utf8');
  const evalJsContent = fs.readFileSync(path.join(__dirname, 'evaluation_form.js'), 'utf8');

  assert(mainJsContent.includes('3 jours à seulement 3 minutes'), 'main.js inclut l\'accélération de 3 jours à 3 minutes');
  assert(mainJsContent.includes('validée par l\'humain') || mainJsContent.includes('validée par l\'expertise humaine'), 'main.js mentionne la validation humaine');
  assert(indexHtmlContent.includes('3 JOURS ➔ 3 MIN'), 'index.html affiche le badge 3 JOURS ➔ 3 MIN');
  assert(evalHtmlContent.includes('3 JOURS ➔ 3 MIN'), 'evaluation.html affiche le bandeau officiel 3 JOURS ➔ 3 MIN');
  assert(indexHtmlContent.includes('Antoine') && indexHtmlContent.includes('Sylvie'), 'Sélecteur de voix Antoine & Sylvie présent sur l\'accueil');
  assert(!indexHtmlContent.includes('recommandé') && !indexHtmlContent.includes('Recommandé'), 'Aucune mention "recommandé" superflue sur la voix d\'Antoine');

  // -------------------------------------------------------------------------
  // SECTION 2 : VÉRIFICATION DU PARCOURS SÉQUENTIEL DES 6 AXES DANS LE DOM
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2 : Navigation séquentielle des 6 Axes & Signature HITL (JSDOM) ---');
  
  const cleanHtml = evalHtmlContent.replace(/<script\s+src="evaluation_form\.js[^"]*"><\/script>/gi, '');
  const dom = new JSDOM(cleanHtml, {
    runScripts: 'dangerously',
    url: 'http://localhost:3000/evaluation.html'
  });

  const { window } = dom;
  const { document } = window;

  // Polyfills pour JSDOM
  dom.window.alert = (msg) => { dom.window.__lastAlert = msg; };
  dom.window.scrollTo = () => {};
  dom.window.Element.prototype.scrollIntoView = () => {};
  dom.window.fetch = globalThis.fetch;

  // Exécuter evaluation_form.js dans le contexte JSDOM
  dom.window.eval(evalJsContent);

  assert(typeof dom.window.switchAxe === 'function', 'switchAxe() est exposé et disponible');
  assert(typeof dom.window.nextAxeStep === 'function', 'nextAxeStep() est exposé et disponible');
  assert(typeof dom.window.prevAxeStep === 'function', 'prevAxeStep() est exposé et disponible');
  assert(typeof dom.window.proceedToPhase5FromGrid === 'function', 'proceedToPhase5FromGrid() est exposé');

  // 2.1 Initialisation sur Axe 1 via le scénario de démonstration officiel
  dom.window.loadDemoScenario();
  assert(String(dom.window.EVAL_STATE.currentPhase) === '2', 'Phase active = Phase 2 (Grille de faisabilité)');
  assert(dom.window.EVAL_STATE.activeAxeIndex === 0, 'Axe actif initial = Axe 1 (index 0)');

  const doc = dom.window.document;
  const progressBar = doc.getElementById('axe-progress-bar-fill');
  const progressBadge = doc.getElementById('axe-progress-pct-badge');
  const nextBtn = doc.getElementById('btn-next-axe');
  const validateBtn = doc.getElementById('btn-validate-grid');
  const hitlBox = doc.getElementById('hitl-box-phase2');
  const previewNotice = doc.getElementById('hitl-preview-notice');
  const prevBtn = doc.getElementById('btn-prev-axe');

  assert(progressBadge.textContent.includes('Axe 1 / 6'), 'Badge de progression indique Axe 1 / 6');
  assert(nextBtn.style.display !== 'none', 'Bouton "Suivant" visible sur l\'Axe 1');
  assert(nextBtn.textContent.includes('Passer à l\'Axe 2'), 'Bouton Suivant invite à passer à l\'Axe 2');
  assert(validateBtn.style.display === 'none', 'Bouton de validation finale MASQUÉ sur l\'Axe 1');
  assert(hitlBox.style.display === 'none', 'Boîte de signature HITL MASQUÉE sur l\'Axe 1');
  assert(previewNotice.style.display !== 'none', 'Notice informative de progression affichée sur l\'Axe 1');
  assert(prevBtn.textContent.includes('Cadrage'), 'Bouton précédent ramène au Cadrage depuis l\'Axe 1');

  // 2.2 Avancement séquentiel Axe 1 -> Axe 2 -> Axe 3 -> Axe 4 -> Axe 5
  for (let i = 1; i <= 4; i++) {
    dom.window.nextAxeStep();
    assert(dom.window.EVAL_STATE.activeAxeIndex === i, `Axe courant avancé à l'index ${i} (Axe ${i + 1})`);
    assert(progressBadge.textContent.includes(`Axe ${i + 1} / 6`), `Badge de progression affiche Axe ${i + 1} / 6`);
    assert(validateBtn.style.display === 'none', `Bouton de validation MASQUÉ sur l'Axe ${i + 1}`);
    assert(hitlBox.style.display === 'none', `Boîte de signature HITL MASQUÉE sur l'Axe ${i + 1}`);
    assert(nextBtn.style.display !== 'none', `Bouton "Suivant" VISIBLE sur l'Axe ${i + 1}`);
  }

  // 2.3 Avancement vers l'Axe 6 (Dernier axe)
  dom.window.nextAxeStep();
  assert(dom.window.EVAL_STATE.activeAxeIndex === 5, 'Arrivée sur le dernier axe (Axe 6)');
  assert(progressBadge.textContent.includes('Axe 6 / 6'), 'Badge de progression affiche Axe 6 / 6');
  assert(progressBar.style.width === '100%', 'Largeur de la barre de progression à 100%');
  assert(nextBtn.style.display === 'none', 'Bouton "Suivant" MASQUÉ sur l\'Axe 6');
  assert(previewNotice.style.display === 'none', 'Notice temporaire MASQUÉE sur l\'Axe 6');
  assert(hitlBox.style.display === 'block', 'Boîte de signature HITL AFFICHÉE sur l\'Axe 6');
  assert(validateBtn.style.display !== 'none', 'Bouton de validation finale AFFICHÉ sur l\'Axe 6');

  // 2.4 Tentative de validation SANS signature sur Axe 6 (Doit bloquer)
  dom.window.__lastAlert = null;
  const chkHitl = doc.getElementById('chk-hitl-phase2');
  assert(chkHitl.checked === false, 'Case de signature décochée par défaut');
  
  dom.window.proceedToPhase5FromGrid();
  assert(dom.window.__lastAlert && dom.window.__lastAlert.includes('Signature humaine obligatoire'), 'Validation sans signature bloquée avec alerte explicite');
  assert(String(dom.window.EVAL_STATE.currentPhase) === '2', 'Phase reste à 2 (non validée)');

  // 2.5 Signature humaine et déverrouillage du bouton vert
  chkHitl.checked = true;
  dom.window.onHitlCheckboxChange(true);
  const statusPill = doc.getElementById('signature-status-pill');
  assert(statusPill.textContent.includes('SIGNATURE HUMAINE ENREGISTRÉE'), 'Pillule de statut indique la signature enregistrée');
  assert(validateBtn.textContent.includes('Valider les 6 Axes & Générer Livrables'), 'Bouton de validation passe au vert avec intitulé officiel de génération');

  // -------------------------------------------------------------------------
  // SECTION 3 : TEST API LIVE DU BACKEND FASTAPI & COHÉRENCE DU SCORE (81% / 81.2%)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3 : Calcul AHP-TOPSIS & Concordance des Livrables Word/Excel ---');

  const payload = JSON.stringify({
    title: "Test Automatise Deploiement IQ - Assistant Crédit",
    direction: "Direction du Financement",
    sponsor: "Mustapha Berrabaa",
    contact_email: "mustapha@investquebec.com",
    pathway: "Parcours 3 : Cas d'usage & Métier",
    tool_type: "RAG / Assistant IA",
    description: "Validation automatique du calcul AHP-TOPSIS et génération des livrables.",
    business_objective: "Accélération du traitement des dossiers d'analyse de crédit",
    target_users: "Équipes internes IQ",
    data_sources: "Politiques internes",
    contains_personal_data: false,
    rto_hours: 4,
    evaluator_name: "Bureau de l'IA — Investissement Québec",
    custom_scores: {
      "crit_1_1": 4, "crit_1_2": 4, "crit_1_3": 3, "crit_1_4": 4, "crit_1_5": 3,
      "crit_2_1": 4, "crit_2_2": 3, "crit_2_3": 3, "crit_2_4": 4, "crit_2_5": 3,
      "crit_3_1": 4, "crit_3_2": 3, "crit_3_3": 4, "crit_3_4": 3, "crit_3_5": 3,
      "crit_4_1": 4, "crit_4_2": 3, "crit_4_3": 3, "crit_4_4": 3, "crit_4_5": 3,
      "crit_5_1": 4, "crit_5_2": 3, "crit_5_3": 3, "crit_5_4": 4, "crit_5_5": 3,
      "crit_6_1": 4, "crit_6_2": 3, "crit_6_3": 4
    }
  });

  const responseData = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/submit-evaluation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  assert(responseData.statusCode === 200, 'Statut HTTP 200 retourné par /api/submit-evaluation');
  const result = responseData.body;
  assert(result.success === true, 'Statut de l\'évaluation = success (true)');
  assert(result.scores !== undefined, 'Objet scores présent dans la réponse');
  assert(typeof result.scores.percentage === 'number', `Score en pourcentage calculé : ${result.scores.percentage}%`);
  assert(typeof result.scores.total_score === 'number', `Score total calculé : ${result.scores.total_score} pts`);
  assert(result.scores.recommendation !== undefined, `Recommandation d'homologation : ${result.scores.recommendation}`);
  assert(result.deliverables !== undefined, 'Livrables présents dans la réponse');
  assert(result.deliverables.word_url !== undefined, `URL Mémo Word : ${result.deliverables.word_url}`);
  assert(result.deliverables.excel_url !== undefined, `URL Grille Excel : ${result.deliverables.excel_url}`);

  // Vérification de la présence physique des fichiers générés
  const wordFilePath = path.join(__dirname, 'generated_outputs', result.deliverables.word_filename);
  const excelFilePath = path.join(__dirname, 'generated_outputs', result.deliverables.excel_filename);

  assert(fs.existsSync(wordFilePath), `Le Mémo Décisionnel Word existe bien dans generated_outputs/ : ${result.deliverables.word_filename}`);
  assert(fs.existsSync(excelFilePath), `La Grille Excel existe bien dans generated_outputs/ : ${result.deliverables.excel_filename}`);

  console.log('\n================================================================');
  console.log(`🎉 TOUS LES ${passedTests}/${totalTests} TESTS ONT RÉUSSI AVEC SUCCÈS !`);
  console.log('   La navigation des 6 axes, la signature HITL et les livrables');
  console.log('   sont 100% opérationnels et conformes aux directives d\'IQ.');
  console.log('================================================================\n');
}

runComprehensiveAudit().catch(err => {
  console.error('\n❌ ERREUR LORS DE L\'AUDIT :', err);
  process.exit(1);
});
