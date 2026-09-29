/**
 * SUITE DE TESTS UNITAIRES & D'INTÉGRATION — PLAYBOOK A.G.E.N.T.
 * Validation complète du moteur de transition, de la non-régression anti-boucle (Phase T),
 * des 6 étapes A.G.E.N.T. et de la complétude du livrable officiel.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Chargement des modules du serveur
const {
  getLocalPlaybookCoachReply,
  normalizePlaybookKeys,
  cleanCoachInstitutionalReply
} = require('./server.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✅ [SUCCÈS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [ÉCHEC] ${description}`);
    console.error(`     Erreur: ${err.message}`);
    failedTests++;
  }
}

async function itAsync(description, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`  ✅ [SUCCÈS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [ÉCHEC] ${description}`);
    console.error(`     Erreur: ${err.message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('🧪 SUITE DE TESTS UNITAIRES : CYCLE COMPLET DU PLAYBOOK A.G.E.N.T.');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1 : Normalisation des clés & Sanitisation Institutionnelle
// -----------------------------------------------------------------------------
console.log('--- 1. Tests Unitaires : Fonctions Utilitaires & Vocabulaire Institutionnel ---');

it('Normalisation des raccourcis de clés vers les IDs HTML officiels', () => {
  const rawUpdates = {
    pilot: 'Semaine 1 calibration',
    kpis: '<table>KPIs</table>',
    veto: 'Droit de veto',
    change: 'Conduite du changement',
    flow: 'Flux cible',
    'lens-1': 'Parallélisation',
    trigger: 'Réception du dossier',
    steps: '<table>Étapes</table>',
    direction: 'Direction du Financement',
    workflow: 'Octroi de crédit'
  };

  const normalized = normalizePlaybookKeys(rawUpdates);

  assert.strictEqual(normalized['input-track-pilot'], 'Semaine 1 calibration');
  assert.strictEqual(normalized['input-track-kpis'], '<table>KPIs</table>');
  assert.strictEqual(normalized['input-nav-veto'], 'Droit de veto');
  assert.strictEqual(normalized['input-nav-change'], 'Conduite du changement');
  assert.strictEqual(normalized['input-engineer-target-flow'], 'Flux cible');
  assert.strictEqual(normalized['input-lens-1'], 'Parallélisation');
  assert.strictEqual(normalized['input-audit-trigger'], 'Réception du dossier');
  assert.strictEqual(normalized['input-audit-steps'], '<table>Étapes</table>');
  assert.strictEqual(normalized['meta-direction'], 'Direction du Financement');
  assert.strictEqual(normalized['meta-workflow'], 'Octroi de crédit');
});

it('Sanitisation institutionnelle : exclusion des mentions de Harvard', () => {
  const textWithHarvard = "Comme nous l'enseignons à Harvard Business School, le cadre A.G.E.N.T. permet d'accélérer.";
  const sanitized = cleanCoachInstitutionalReply(textWithHarvard, "Jean", true);

  assert(!sanitized.toLowerCase().includes('harvard'), 'Le texte ne doit pas contenir "harvard"');
  assert(sanitized.includes('cadre A.G.E.N.T.'), 'Le texte doit préserver le cadre A.G.E.N.T.');
});

it('Sanitisation anti-fuite de prompt : exclusion formelle de "sans rien inventer", métalangage et consignes système', () => {
  const textWithLeak = "Nous allons compléter la phase d'audit sans rien inventer afin de respecter la règle zéro hallucination.";
  const sanitized = cleanCoachInstitutionalReply(textWithLeak, "Jean", true);

  assert(!sanitized.toLowerCase().includes('sans rien inventer'), 'Le texte ne doit pas contenir "sans rien inventer"');
  assert(!sanitized.toLowerCase().includes('zéro hallucination'), 'Le texte ne doit pas contenir "zéro hallucination"');
  assert(sanitized.includes("phase d'audit"), 'Le sens métier doit être préservé');

  const textWithLeak2 = "Pour que ce Playbook reflète votre vraie réalité terrain sans rien inventer ni présumer : quel est votre déclencheur ?";
  const sanitized2 = cleanCoachInstitutionalReply(textWithLeak2, "Jean", true);
  assert(!sanitized2.toLowerCase().includes('sans rien inventer'), 'Le texte ne doit pas contenir "sans rien inventer"');
  assert(!sanitized2.toLowerCase().includes('présumer'), 'Le texte ne doit pas contenir "présumer"');
});

// -----------------------------------------------------------------------------
// SECTION 2 : Déroulement Séquentiel Pas à Pas du Moteur de Coconception
// -----------------------------------------------------------------------------
console.log('\n--- 2. Tests Unitaires : Transition des 6 Étapes du Playbook ---');

let sharedState = {};
let pendingProposalStep1 = null;
let pendingProposalStep3 = null;
let pendingProposalStep4 = null;
let pendingProposalStep5 = null;
let pendingProposalStep6 = null;

it('Étape 1 (Cadrage Initial) : Réception de la Direction & formulation Phase A', () => {
  const userMsg = "Je suis de la Direction du Financement et Crédit aux Entreprises, flux d'octroi de prêt aux PME.";
  const res = getLocalPlaybookCoachReply(userMsg, [], 1, sharedState, null, "Marc");

  assert.strictEqual(res.nextStep, 2, 'L\'étape suivante doit être 2 (Phase A)');
  assert.strictEqual(res.phaseKey, 'A', 'La clé de phase doit être A');
  assert(res.isWaitingValidation === true, 'Doit être en attente de validation');
  assert(res.docUpdates !== null, 'docUpdates doit être alimenté pour le cadrage');
  assert.strictEqual(res.docUpdates['meta-direction'], 'Direction du Financement et Crédit aux Entreprises');
  assert(res.proposedUpdates !== null, 'proposedUpdates doit contenir la proposition Phase A');
  assert(res.proposedUpdates['input-audit-trigger'], 'Doit proposer input-audit-trigger');
  assert(res.proposedUpdates['input-audit-steps'], 'Doit proposer input-audit-steps');

  // Mise à jour de l'état partagé
  Object.assign(sharedState, res.docUpdates);
  pendingProposalStep1 = { updates: res.proposedUpdates, nextStep: 2, phaseTitle: res.phaseTitle };
});

it('Étape 2 (Validation Phase A) : Insertion sans précipitation vers Phase G', () => {
  const userMsg = "valider et insérer dans le playbook";
  const res = getLocalPlaybookCoachReply(userMsg, [], 2, sharedState, pendingProposalStep1, "Marc");

  assert.strictEqual(res.nextStep, 3, 'nextStep doit pointer vers 3 (Phase G)');
  assert.strictEqual(res.phaseKey, 'G', 'La phase active devient G');
  assert(res.docUpdates !== null, 'docUpdates doit consigner la Phase A');
  assert(res.docUpdates['input-audit-trigger'], 'input-audit-trigger doit être consigné');
  assert.strictEqual(res.proposedUpdates, null, 'proposedUpdates doit être NULL pour laisser le temps de relire');
  assert.strictEqual(res.isWaitingValidation, false, 'isWaitingValidation doit être false après validation');

  Object.assign(sharedState, res.docUpdates);
});

it('Étape 3 (Proposition Phase G) : Formulation Output vs Outcome et JTBD', () => {
  const userMsg = "Passons à la Phase G (Gauge : Du livrable brut au résultat stratégique)";
  const res = getLocalPlaybookCoachReply(userMsg, [], 3, sharedState, null, "Marc");

  assert.strictEqual(res.nextStep, 3, 'Reste à l\'étape 3 pendant la proposition de Phase G');
  assert.strictEqual(res.phaseKey, 'G', 'PhaseKey est G');
  assert(res.proposedUpdates !== null, 'proposedUpdates doit être fourni pour Phase G');
  assert(res.proposedUpdates['input-gauge-output'], 'input-gauge-output proposé');
  assert(res.proposedUpdates['input-gauge-outcome'], 'input-gauge-outcome proposé');
  assert(res.proposedUpdates['input-gauge-jtbd'], 'input-gauge-jtbd proposé');
  assert(res.isWaitingValidation === true, 'En attente de validation de Phase G');

  pendingProposalStep3 = { updates: res.proposedUpdates, nextStep: 4, phaseTitle: res.phaseTitle };
});

it('Étape 3 (Validation Phase G) : Enregistrement et préparation de Phase E', () => {
  const userMsg = "Oui, je valide cette Phase G";
  const res = getLocalPlaybookCoachReply(userMsg, [], 3, sharedState, pendingProposalStep3, "Marc");

  assert.strictEqual(res.nextStep, 4, 'Passe à l\'étape 4 (Phase E)');
  assert.strictEqual(res.phaseKey, 'E', 'PhaseKey devient E');
  assert(res.docUpdates !== null, 'docUpdates doit enregistrer Phase G');
  assert(res.docUpdates['input-gauge-output'], 'input-gauge-output consigné');
  assert.strictEqual(res.proposedUpdates, null, 'proposedUpdates doit être null');
  assert.strictEqual(res.isWaitingValidation, false);

  Object.assign(sharedState, res.docUpdates);
});

it('Étape 4 (Phase E - Engineer) : Proposition puis Validation des 5 Lentilles', () => {
  // 1. Demande de proposition
  const resProp = getLocalPlaybookCoachReply("Passons à la Phase E", [], 4, sharedState, null, "Marc");
  assert.strictEqual(resProp.nextStep, 4);
  assert(resProp.proposedUpdates !== null);
  assert(resProp.proposedUpdates['input-lens-1']);
  assert(resProp.proposedUpdates['input-lens-4']);
  assert(resProp.proposedUpdates['input-lens-5']);
  assert(resProp.proposedUpdates['input-engineer-target-flow']);
  assert.strictEqual(resProp.isWaitingValidation, true);

  pendingProposalStep4 = { updates: resProp.proposedUpdates, nextStep: 5, phaseTitle: resProp.phaseTitle };

  // 2. Validation
  const resVal = getLocalPlaybookCoachReply("valider", [], 4, sharedState, pendingProposalStep4, "Marc");
  assert.strictEqual(resVal.nextStep, 5, 'Passe à l\'étape 5 (Phase N)');
  assert.strictEqual(resVal.phaseKey, 'N');
  assert(resVal.docUpdates['input-lens-4'], 'Lentille 4 consignée');
  assert.strictEqual(resVal.proposedUpdates, null);
  assert.strictEqual(resVal.isWaitingValidation, false);

  Object.assign(sharedState, resVal.docUpdates);
});

it('Étape 5 (Phase N - Navigate) : Proposition puis Validation du Droit de Veto', () => {
  // 1. Demande de proposition
  const resProp = getLocalPlaybookCoachReply("Passons à la Phase N", [], 5, sharedState, null, "Marc");
  assert.strictEqual(resProp.nextStep, 5);
  assert(resProp.proposedUpdates !== null);
  assert(resProp.proposedUpdates['input-nav-veto']);
  assert(resProp.proposedUpdates['input-nav-change']);
  assert.strictEqual(resProp.isWaitingValidation, true);

  pendingProposalStep5 = { updates: resProp.proposedUpdates, nextStep: 6, phaseTitle: resProp.phaseTitle };

  // 2. Validation
  const resVal = getLocalPlaybookCoachReply("valider et insérer", [], 5, sharedState, pendingProposalStep5, "Marc");
  assert.strictEqual(resVal.nextStep, 6, 'Passe à l\'étape 6 (Phase T)');
  assert.strictEqual(resVal.phaseKey, 'T');
  assert(resVal.docUpdates['input-nav-veto']);
  assert.strictEqual(resVal.proposedUpdates, null);
  assert.strictEqual(resVal.isWaitingValidation, false);

  Object.assign(sharedState, resVal.docUpdates);
});

// -----------------------------------------------------------------------------
// SECTION 3 : Étape 6 (Phase T) & Résolution Définitive de la Boucle Infinie
// -----------------------------------------------------------------------------
console.log('\n--- 3. Tests Critiques : Phase T & Fin Définitive du Playbook (Anti-Boucle) ---');

it('Étape 6 (Phase T - Track) : La proposition doit OBLIGATOIREMENT pointer vers nextStep: 7', () => {
  const userMsg = "Passons à la Phase T (Track : Métriques d'impact et sprint pilote de 3 semaines)";
  const res = getLocalPlaybookCoachReply(userMsg, [], 6, sharedState, null, "Marc");

  // VÉRIFICATION CARDINALE : Si nextStep était 6, l'interface tournait en rond !
  assert.strictEqual(res.nextStep, 7, 'nextStep DOIT valoir 7 pour clôturer le Playbook');
  assert.strictEqual(res.phaseKey, 'T');
  assert(res.proposedUpdates !== null, 'proposedUpdates doit contenir la Phase T');
  assert(res.proposedUpdates['input-track-pilot'], 'input-track-pilot doit être proposé');
  assert(res.proposedUpdates['input-track-kpis'], 'input-track-kpis doit être proposé');
  assert.strictEqual(res.isWaitingValidation, true);

  pendingProposalStep6 = { updates: res.proposedUpdates, nextStep: 7, phaseTitle: res.phaseTitle };
});

it('Étape 6 (Validation Phase T) : Clôture à 100 %, phaseKey: COMPLETE, AUCUNE nouvelle proposition', () => {
  const userMsg = "valider et insérer dans le playbook";
  const res = getLocalPlaybookCoachReply(userMsg, [], 6, sharedState, pendingProposalStep6, "Marc");

  assert.strictEqual(res.nextStep, 7, 'nextStep doit être 7 (Terminé)');
  assert.strictEqual(res.phaseKey, 'COMPLETE', 'phaseKey doit être COMPLETE');
  assert(res.docUpdates !== null, 'docUpdates doit être présent pour consigner la Phase T');
  assert(res.docUpdates['input-track-pilot'], 'input-track-pilot consigné');
  assert(res.docUpdates['input-track-kpis'], 'input-track-kpis consigné');
  assert.strictEqual(res.proposedUpdates, null, 'proposedUpdates DOIT être null pour ne jamais reproposer une étape !');
  assert.strictEqual(res.isWaitingValidation, false, 'isWaitingValidation doit être false');
  assert(res.reply.includes('Félicitations'), 'La réponse doit féliciter pour la complétion intégrale');
  assert(res.reply.includes('Bye bye'), 'La réponse doit impérativement dire Bye bye');

  Object.assign(sharedState, res.docUpdates);
});

it('Étape 6 (Formulation exacte utilisateur "j\'ai validé l\'ajout") : Finalisation directe avec "Bye bye"', () => {
  const userMsg = "j'ai validé l'ajout";
  const res = getLocalPlaybookCoachReply(userMsg, [], 6, sharedState, pendingProposalStep6, "Marc");

  assert.strictEqual(res.nextStep, 7, 'nextStep doit être 7 (Terminé)');
  assert.strictEqual(res.phaseKey, 'COMPLETE', 'phaseKey doit être COMPLETE');
  assert(res.docUpdates !== null, 'docUpdates doit être présent');
  assert.strictEqual(res.proposedUpdates, null, 'proposedUpdates doit être strictement null');
  assert(res.reply.includes('Bye bye'), 'La réponse doit saluer avec "Bye bye"');
});

it('Étape 6 avec mots-clés d\'achèvement ("terminé", "cloture", "fini") : Finalisation directe', () => {
  const testPhrases = ["C'est terminé", "On clôture le document", "C'est fini parfait"];
  for (const phrase of testPhrases) {
    const res = getLocalPlaybookCoachReply(phrase, [], 6, sharedState, null, "Marc");
    assert.strictEqual(res.nextStep, 7, `Pour "${phrase}", nextStep doit valoir 7`);
    assert.strictEqual(res.phaseKey, 'COMPLETE');
    assert.strictEqual(res.proposedUpdates, null);
    assert(res.reply.includes('Bye bye'), 'Doit contenir le salut Bye bye');
  }
});

it('Étape 7 (État Terminal) : Toute interaction ultérieure reste à l\'étape 7 sans boucle et dit Bye bye', () => {
  const res = getLocalPlaybookCoachReply("Peut-on encore ajouter quelque chose ?", [], 7, sharedState, null, "Marc");
  assert.strictEqual(res.nextStep, 7, 'Reste verrouillé à l\'étape 7');
  assert.strictEqual(res.phaseKey, 'COMPLETE');
  assert.strictEqual(res.proposedUpdates, null, 'Aucune nouvelle proposition');
  assert.strictEqual(res.docUpdates, null);
  assert(res.reply.includes('100 % finalisé'), 'Confirme la finalisation à 100 %');
  assert(res.reply.includes('Bye bye'), 'Confirme le salut Bye bye');
});

// -----------------------------------------------------------------------------
// SECTION 4 : Vérification du Contrat Frontend (JSDOM)
// -----------------------------------------------------------------------------
console.log('\n--- 4. Tests Contrat Frontend & Intégrité DOM (coach_playbook_agent.html) ---');

const htmlPath = path.join(__dirname, 'coach_playbook_agent.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

it('Vérification de la présence de tous les champs éditables requis dans le document', () => {
  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // Cadrage
  assert(document.getElementById('meta-direction'), 'meta-direction doit exister');
  assert(document.getElementById('meta-workflow'), 'meta-workflow doit exister');
  assert(document.getElementById('meta-owners'), 'meta-owners doit exister');
  assert(document.getElementById('meta-horizon'), 'meta-horizon doit exister');

  // Phase A
  assert(document.getElementById('section-phase-a'), 'section-phase-a doit exister');
  assert(document.getElementById('input-audit-trigger'), 'input-audit-trigger doit exister');
  assert(document.getElementById('input-audit-steps'), 'input-audit-steps doit exister');

  // Phase G
  assert(document.getElementById('section-phase-g'), 'section-phase-g doit exister');
  assert(document.getElementById('input-gauge-output'), 'input-gauge-output doit exister');
  assert(document.getElementById('input-gauge-outcome'), 'input-gauge-outcome doit exister');
  assert(document.getElementById('input-gauge-jtbd'), 'input-gauge-jtbd doit exister');

  // Phase E
  assert(document.getElementById('section-phase-e'), 'section-phase-e doit exister');
  assert(document.getElementById('input-lens-1'), 'input-lens-1 doit exister');
  assert(document.getElementById('input-lens-2'), 'input-lens-2 doit exister');
  assert(document.getElementById('input-lens-3'), 'input-lens-3 doit exister');
  assert(document.getElementById('input-lens-4'), 'input-lens-4 doit exister');
  assert(document.getElementById('input-lens-5'), 'input-lens-5 doit exister');
  assert(document.getElementById('input-engineer-target-flow'), 'input-engineer-target-flow doit exister');

  // Phase N
  assert(document.getElementById('section-phase-n'), 'section-phase-n doit exister');
  assert(document.getElementById('input-nav-veto'), 'input-nav-veto doit exister');
  assert(document.getElementById('input-nav-change'), 'input-nav-change doit exister');

  // Phase T
  assert(document.getElementById('section-phase-t'), 'section-phase-t doit exister');
  assert(document.getElementById('input-track-pilot'), 'input-track-pilot doit exister');
  assert(document.getElementById('input-track-kpis'), 'input-track-kpis doit exister');

  // Stepper
  for (let s = 1; s <= 6; s++) {
    assert(document.getElementById(`step-pill-${s}`), `step-pill-${s} doit exister dans le stepper`);
  }
});

it('Vérification des styles et composants de complétion finale dans le code source', () => {
  assert(htmlContent.includes('.chat-final-completion-card'), 'Le CSS doit contenir .chat-final-completion-card');
  assert(htmlContent.includes('.btn-final-export-word'), 'Le CSS doit contenir .btn-final-export-word');
  assert(htmlContent.includes('.btn-final-export-pptx'), 'Le CSS doit contenir .btn-final-export-pptx');
  assert(htmlContent.includes('.btn-final-print'), 'Le CSS doit contenir .btn-final-print');
  assert(htmlContent.includes('isFinalPhase'), 'Le script JS doit gérer isFinalPhase');
  assert(htmlContent.includes('advanceToStep(7'), 'Le script JS doit faire avancer vers l\'étape 7');
});

it('Vérification que confirmAndApplyProposal gère la phase finale sans bouton "suivant"', () => {
  // Analyse statique de confirmAndApplyProposal
  const fnStartIndex = htmlContent.indexOf('function confirmAndApplyProposal');
  assert(fnStartIndex !== -1, 'function confirmAndApplyProposal doit exister');
  const fnBody = htmlContent.substring(fnStartIndex, fnStartIndex + 6000);

  assert(fnBody.includes('isFinalPhase'), 'confirmAndApplyProposal doit vérifier isFinalPhase');
  assert(fnBody.includes('chat-final-completion-card'), 'confirmAndApplyProposal doit afficher chat-final-completion-card sur la phase finale');
  assert(fnBody.includes('triggerDynamicExport(\'docx\')'), 'La carte finale doit permettre le téléchargement Word');
  assert(fnBody.includes('triggerDynamicExport(\'pptx\')'), 'La carte finale doit permettre le téléchargement PowerPoint');
  assert(fnBody.includes('PENDING_PROPOSAL = null;'), 'PENDING_PROPOSAL doit être réinitialisé');
});

// -----------------------------------------------------------------------------
// SECTION 5 : Tests d'Intégration HTTP End-to-End (/api/playbook-coach)
// -----------------------------------------------------------------------------
console.log('\n--- 5. Tests d\'Intégration API HTTP (/api/playbook-coach) ---');

const http = require('http');
const { app } = require('./server.js');

async function runHttpTests() {
  return new Promise((resolve) => {
    const testServer = http.createServer(app);
    testServer.listen(0, async () => {
      const port = testServer.address().port;

      function postJson(payload) {
        return new Promise((resHttp, rejHttp) => {
          const dataStr = JSON.stringify(payload);
          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path: '/api/playbook-coach',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(dataStr)
            }
          }, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
              try {
                resHttp({ status: res.statusCode, data: JSON.parse(body) });
              } catch (e) {
                resHttp({ status: res.statusCode, raw: body });
              }
            });
          });
          req.on('error', rejHttp);
          req.write(dataStr);
          req.end();
        });
      }

      // Test 5.1 : Validation d'un message vide
      await itAsync('HTTP 400 sur requête /api/playbook-coach sans message', async () => {
        const res = await postJson({});
        assert.strictEqual(res.status, 400, 'Doit retourner 400 Bad Request');
        assert(res.data.error, 'Doit contenir un champ error');
      });

      // Test 5.2 : Cadrage initial via HTTP
      await itAsync('HTTP 200 sur étape 1 (Cadrage Initial)', async () => {
        const res = await postJson({
          message: "Direction du Financement, flux d'octroi de prêt aux PME",
          currentStep: 1,
          history: []
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.nextStep, 2);
        assert.strictEqual(res.data.phaseKey, 'A');
        assert(res.data.docUpdates['meta-direction']);
        assert(res.data.proposedUpdates['input-audit-trigger']);
      });

      // Test 5.3 : Validation Phase T (Fin définitive via HTTP)
      await itAsync('HTTP 200 sur validation Phase T : nextStep 7, phaseKey COMPLETE, zéro boucle', async () => {
        const res = await postJson({
          message: "valider et insérer dans le document officiel",
          currentStep: 6,
          pendingProposal: {
            updates: {
              'input-track-pilot': 'Semaine 1 calibration, Semaine 2 shadowing',
              'input-track-kpis': '<table>Indicateurs</table>'
            }
          }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.nextStep, 7, 'nextStep doit être 7');
        assert.strictEqual(res.data.phaseKey.toUpperCase(), 'COMPLETE');
        assert.strictEqual(res.data.proposedUpdates, null, 'proposedUpdates doit être strictement null');
        assert(res.data.docUpdates['input-track-pilot']);
        assert(res.data.docUpdates['input-track-kpis']);
        assert(res.data.reply.includes('Bye bye'), 'La réponse HTTP de validation Phase T doit inclure Bye bye');
      });

      // Test 5.4 : Validation par saisie texte exacte "j'ai validé l'ajout" via HTTP
      await itAsync('HTTP 200 sur "j\'ai validé l\'ajout" : nextStep 7, phaseKey COMPLETE et Bye bye', async () => {
        const res = await postJson({
          message: "j'ai validé l'ajout",
          currentStep: 6,
          pendingProposal: {
            updates: {
              'input-track-pilot': 'Pilote cadré',
              'input-track-kpis': '<table>Indicateurs</table>'
            }
          }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.nextStep, 7, 'nextStep doit être 7');
        assert.strictEqual(res.data.phaseKey.toUpperCase(), 'COMPLETE');
        assert.strictEqual(res.data.proposedUpdates, null);
        assert(res.data.reply.includes('Bye bye'), 'Doit saluer avec Bye bye');
      });

      // Test 5.5 : État terminal sur étape 7 via HTTP
      await itAsync('HTTP 200 sur étape 7 : reste verrouillé à l\'étape 7', async () => {
        const res = await postJson({
          message: "Je souhaite télécharger mon document",
          currentStep: 7
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.nextStep, 7);
        assert.strictEqual(res.data.phaseKey, 'COMPLETE');
        assert.strictEqual(res.data.proposedUpdates, null);
        assert(res.data.reply.includes('Bye bye'), 'L\'étape 7 doit également saluer poliment avec Bye bye');
      });

      // -----------------------------------------------------------------------
      // SECTION 6 : Nouveaux Tests Multi-Processus, Maïeutique et Configurabilité
      // -----------------------------------------------------------------------
      console.log('\n--- 6. Tests Multi-Processus (TI, Finances, RH, Juridique, Opérations) & Maïeutique ---');

      it('Moteur Local : Processus TI (Incidents, Télémétrie et MTTR)', () => {
        const res = getLocalPlaybookCoachReply(
          "Je veux modéliser le triage des incidents de production TI et les alertes serveurs",
          [], 1, {}, null, "Alex",
          { orgName: "Société des Transports", compliance: "ISO 27001" }
        );
        assert.strictEqual(res.nextStep, 2);
        assert(res.docUpdates['meta-direction'].includes('Technologies'));
        assert(res.docUpdates['meta-owners'].includes('Société des Transports'));
        assert(res.proposedUpdates['input-audit-trigger'].includes('télémétrie'));
        assert(Array.isArray(res.suggestions));
        assert(res.suggestions.length >= 3);
      });

      it('Moteur Local : Processus Finances (Factures fournisseurs & Rapprochement)', () => {
        const res = getLocalPlaybookCoachReply(
          "Nous gérons les factures fournisseurs et le rapprochement comptable",
          [], 1, {}, null, "Sophie",
          { orgName: "Groupe Industriel ABC", compliance: "Loi 25" }
        );
        assert.strictEqual(res.nextStep, 2);
        assert(res.docUpdates['meta-direction'].includes('Finances'));
        assert(res.proposedUpdates['input-audit-trigger'].includes('factures'));
        assert(Array.isArray(res.suggestions));
      });

      it('Moteur Local : Processus RH (Recrutement, Candidatures et Onboarding)', () => {
        const res = getLocalPlaybookCoachReply(
          "Je souhaite réorganiser le recrutement RH et le triage des candidatures CV",
          [], 1, {}, null, "Marc",
          { orgName: "Santé Québec", compliance: "Loi 25" }
        );
        assert.strictEqual(res.nextStep, 2);
        assert(res.docUpdates['meta-direction'].includes('Ressources Humaines'));
        assert(res.proposedUpdates['input-audit-trigger'].includes('candidatures'));
        assert(Array.isArray(res.suggestions));
      });

      it('Moteur Local : Processus Juridique (Revue des contrats & Clauses à risque)', () => {
        const res = getLocalPlaybookCoachReply(
          "Nous révisons les contrats de service, conventions et clauses de responsabilité",
          [], 1, {}, null, "Élise",
          { orgName: "Cabinet Juridique XYZ", compliance: "RGPD" }
        );
        assert.strictEqual(res.nextStep, 2);
        assert(res.docUpdates['meta-direction'].includes('Juridiques'));
        assert(res.proposedUpdates['input-audit-trigger'].includes('contrat'));
        assert(Array.isArray(res.suggestions));
      });

      it('Moteur Local : Écoute Maïeutique quand l\'utilisateur dit "je ne sais pas"', () => {
        const res = getLocalPlaybookCoachReply(
          "je ne sais pas par quoi commencer, aide-moi à choisir un processus",
          [], 1, {}, null, "Marc",
          { orgName: "Entreprise Innovante" }
        );
        assert.strictEqual(res.nextStep, 1, 'Reste à l\'étape 1 pour guider le choix');
        assert(res.reply.includes('Sur quel domaine souhaitez-vous concentrer notre atelier'));
        assert(Array.isArray(res.suggestions));
        assert(res.suggestions.some(s => s.label.includes('TI') || s.label.includes('Factures') || s.label.includes('RH')));
      });

      it('Moteur Local : Mot-clé court "kyc" -> Cadrage maïeutique sans hallucination ni proposition d\'étapes prématurée', () => {
        const res = getLocalPlaybookCoachReply("kyc", [], 1, {}, null, "Mustapha", { orgName: "Investissement Québec" });
        assert.strictEqual(res.nextStep, 1, 'Doit rester à l\'étape 1 pour poser la question d\'ancrage');
        assert.strictEqual(res.proposedUpdates, null, 'Ne doit PAS proposer d\'étapes prématurées');
        assert(res.docUpdates && res.docUpdates['meta-workflow'].includes('KYC'), 'Le titre du flux doit être cadré avec KYC');
        assert(res.reply.includes('Dans quelle direction ou équipe'), 'Doit poser la question de direction et déclencheur');
        assert(Array.isArray(res.suggestions) && res.suggestions.length >= 3, 'Doit fournir des suggestions d\'accompagnement');
      });

      it('Moteur Local : Personnalisation dynamique du nom d\'organisation', () => {
        const res = getLocalPlaybookCoachReply(
          "terminé",
          [], 6, {}, null, "Marc",
          { orgName: "Hydro-Québec", compliance: "Loi 25" }
        );
        assert.strictEqual(res.nextStep, 7);
        assert.strictEqual(res.phaseKey.toUpperCase(), 'COMPLETE');
        assert(res.reply.includes('Hydro-Québec'), 'La salutation finale doit mentionner Hydro-Québec au lieu d\'Investissement Québec');
      });

      await itAsync('HTTP 200 API : Prise en charge de orgConfig et retour de suggestions', async () => {
        const res = await postJson({
          message: "Je souhaite modéliser le traitement des factures fournisseurs",
          currentStep: 1,
          orgConfig: {
            orgName: "Acme Corporation",
            deptName: "Finances & Comptabilité",
            sector: "Technologie",
            compliance: "Loi 25"
          }
        });
        assert.strictEqual(res.status, 200);
        assert([1, 2].includes(res.data.nextStep), `nextStep doit être 1 ou 2, reçu: ${res.data.nextStep}`);
        assert(res.data.docUpdates && typeof res.data.docUpdates === 'object');
        assert(res.data.reply && typeof res.data.reply === 'string');
        assert(Array.isArray(res.data.suggestions) || res.data.suggestions === null);
      });

      testServer.close(resolve);
    });
  });
}

(async () => {
  await runHttpTests();

  // -----------------------------------------------------------------------------
  // RAPPORT FINAL DES TESTS
  // -----------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RÉSULTAT DU CONTRÔLE QUALITÉ & DES TESTS UNITAIRES`);
  console.log(`   Total des tests exécutés : ${totalTests}`);
  console.log(`   Tests réussis            : ${passedTests}`);
  console.log(`   Tests échoués            : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error(`💥 ÉCHEC : ${failedTests} test(s) ont échoué !`);
    process.exit(1);
  } else {
    console.log('🎉 TOUS LES TESTS UNITAIRES ET D\'INTÉGRATION ONT RÉUSSI AVEC SUCCÈS !');
    console.log('   Le cycle A.G.E.N.T. est fluide, la Phase T se termine sans boucle et les livrables sont prêts.');
    process.exit(0);
  }
})();

