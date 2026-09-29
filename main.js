/**
 * ============================================================================
 * INVESTISSEMENT QUÉBEC — L'ASCENSEUR DU CYCLE DE VIE DES INITIATIVES IA
 * ============================================================================
 * Reproduction 3D interactive intégrale de la Slide 8 officielle :
 * « Cycle de vie des initiatives IA : De la demande à la mise en production »
 * 
 * L'ascenseur représente physiquement l'initiative IA qui monte d'étage en étage :
 * 0. Dépôt de la demande (Demandeur)
 * 1. Qualification (Bureau IA)
 * 2. Évaluation des risques et priorisation (Bureau IA + expertises)
 * 3. Décision Go / No Go (Bureau IA / Comité de gouvernance IA / CD)
 * 4. Développement encadré - Pilote (Bureau IA + TI + affaires)
 * 5. Déploiement contrôlé (Bureau IA + TI + affaires)
 * 6. Exploitation et surveillance (TI)
 */

const IQ_TOWER = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  clock: new THREE.Clock(),
  floors: [],
  elevatorCabin: null,
  elevatorLight: null,
  characters: [],
  currentStepIndex: 0,
  autoPlayVideo: true
};
window.IQ_TOWER = IQ_TOWER;

// ============================================================================
// LES 7 ÉTAPES DU CYCLE DE VIE — FORMAT EXÉCUTIF POUR GESTIONNAIRES
// Bâtiment 1 : Tour du Bureau de l'IA (0 à 4) | Passerelle d'Homologation | Bâtiment 2 : Building des TI (5 et 6)
// ============================================================================
const SLIDE8_LIFECYCLE = [
  {
    step: 0,
    title: "Dépôt de la demande",
    actor: "Lignes d'Affaires • Demandeur",
    instance: "Direction Métier & Guichet Octopus",
    respType: "bureau",
    respLabel: "Bureau IA",
    color: "#1e3a8a",
    floorName: "Tour Bureau de l'IA • RDC : Lignes d'Affaires & Guichet Octopus",
    building: "bureau_ia",
    xPos: 0,
    yPos: 0,
    camX: 35,
    camY: 10,
    camZ: 42,
    targetX: 0,
    targetY: 8,
    targetZ: 0,
    elevatorX: -23.5,
    elevatorY: 5,
    summary: "Enregistrement officiel du besoin d'affaires sur le guichet Octopus et orientation vers le bon parcours d'IQ.",
    criteria: [
      "Description du besoin opérationnel et gain de temps attendu.",
      "Identification du propriétaire d'affaires responsable.",
      "Aiguillage parmi les 3 parcours officiels d'Investissement Québec."
    ],
    files: [
      { name: "Formulaire_Depot_Demande_IA_Octopus.xlsx", label: "Formulaire de Prise en Charge Octopus IA", type: "excel", path: "documents_phases/Etape_0_Depot/Formulaire_Depot_Demande_IA_Octopus.xlsx" },
      { name: "Gabarit_Expression_Besoin_Affaires.docx", label: "Gabarit d'Expression de Besoin d'Affaires", type: "word", path: "documents_phases/Etape_0_Depot/Gabarit_Expression_Besoin_Affaires.docx" }
    ]
  },
  {
    step: 1,
    title: "Qualification",
    actor: "Bureau de l'IA",
    instance: "Conseillers en Gouvernance & Architecture IA",
    respType: "bureau",
    respLabel: "Bureau IA",
    color: "#1e3a8a",
    floorName: "Tour Bureau de l'IA • 1er Étage : Qualification du Bureau de l'IA",
    building: "bureau_ia",
    xPos: 0,
    yPos: 17,
    camX: 35,
    camY: 26,
    camZ: 42,
    targetX: 0,
    targetY: 24,
    targetZ: 0,
    elevatorX: -23.5,
    elevatorY: 22,
    summary: "Qualification des cas d'usage par le Bureau de l'IA et experts à travers 4 sous-étapes : Valeur (1.1), Accompagnement (1.2), Faisabilité & Risques d'entreprise (1.3) et Sélection de l'outil IA (1.4).",
    criteria: [
      "1.1 Analyse de la valeur : alignement stratégique, bénéfices anticipés et test d'outil autorisé.",
      "1.2 Demande d'accompagnement : prise en charge directe ou réorientation vers l'outil existant.",
      "1.3 Faisabilité et risques d'entreprise : évaluation organisationnelle et impacts IQ (non technique).",
      "1.4 Veille technologique et évaluation de l'outil IA : exploration interne/marché et faisabilité technique."
    ],
    files: [
      { name: "Grille_faisabilite_cas_usage_IA.xlsx", label: "Grille d'Évaluation de la Valeur Métier (1.1)", type: "excel", path: "documents_phases/Etape_1_Qualification/Grille_faisabilite_cas_usage_IA.xlsx" },
      { name: "Cote_risque_cas_uage.xlsx", label: "Grille Cote de Risque & Faisabilité d'Entreprise (1.3)", type: "excel", path: "documents_phases/Etape_1_Qualification/Cote_risque_cas_uage.xlsx" },
      { name: "Fiche_Cadrage_Preliminaire_Cas_Usage.docx", label: "Fiche de Cadrage Préliminaire du Cas d'Usage", type: "word", path: "documents_phases/Etape_1_Qualification/Fiche_Cadrage_Preliminaire_Cas_Usage.docx" }
    ]
  },
  {
    step: 2,
    title: "Évaluation des risques et priorisation",
    actor: "Bureau IA + Experts Matriciels",
    instance: "Cellule Conjointe : Cybersécurité, PRP Loi 25 & Risques DGIR",
    respType: "shared",
    respLabel: "Responsabilité Partagée",
    color: "#0284c7",
    floorName: "Tour Bureau de l'IA • 2e Étage : Cellule d'Expertise Matricielle",
    building: "bureau_ia",
    xPos: 0,
    yPos: 34,
    camX: 35,
    camY: 43,
    camZ: 42,
    targetX: 0,
    targetY: 41,
    targetZ: 0,
    elevatorX: -23.5,
    elevatorY: 39,
    summary: "Audits transversaux approfondis et priorisation objective comparant le projet à une solution prête pour sécuriser l'investissement.",
    criteria: [
      "Audit de cybersécurité (CSI) et évaluation des facteurs relatifs à la vie privée (Loi 25).",
      "Priorisation en mesurant la distance par rapport à une solution idéale prête (qualité des données, sécurité et IA).",
      "Définition des conditions strictes d'usage et supervision humaine continue."
    ],
    files: [
      { name: "Questionnaire_Evaluation_Loi_25_EFVP.xlsx", label: "Évaluation des Facteurs Vie Privée (Loi 25)", type: "excel", path: "documents_phases/Etape_2_Risques_Priorisation/Questionnaire_Evaluation_Loi_25_EFVP.xlsx" },
      { name: "Grille_Appetit_Risque_11_Risques_DGIR_2026.xlsx", label: "Matrice d'Appétit au Risque DGIR 2026", type: "excel", path: "documents_phases/Etape_2_Risques_Priorisation/Grille_Appetit_Risque_11_Risques_DGIR_2026.xlsx" }
    ]
  },
  {
    step: 3,
    title: "Décision Go / No Go",
    actor: "Comités Décisionnels d'IQ",
    instance: "Comité de Gouvernance IA (Tactique) ou Comité de Direction (Stratégique)",
    respType: "shared",
    respLabel: "Comités d'Arbitrage",
    color: "#0284c7",
    floorName: "Tour Bureau de l'IA • 3e Étage : Salon des Comités Décisionnels",
    building: "bureau_ia",
    xPos: 0,
    yPos: 51,
    camX: 35,
    camY: 60,
    camZ: 42,
    targetX: 0,
    targetY: 58,
    targetZ: 0,
    elevatorX: -23.5,
    elevatorY: 56,
    summary: "Arbitrage officiel et autorisation budgétaire / sécuritaire basée sur le Mémo Décisionnel.",
    criteria: [
      "🟢 Risque faible ➔ GO immédiat validé par le Bureau de l'IA.",
      "🟡 Risque modéré ➔ Décision en Comité de Gouvernance IA (8-10x/an).",
      "🔴 Risque élevé ➔ Approbation obligatoire en Comité de Direction (PDG / PVPs, 4x/an)."
    ],
    files: [
      { name: "00_Memo_Decisionnel_Comite_IA.docx", label: "Mémo Décisionnel Comité IA (Gabarit Officiel)", type: "word", path: "documents_phases/Etape_3_Decision_GoNoGo/00_Memo_Decisionnel_Comite_IA.docx" },
      { name: "Registre_Arbitrages_Decisions_Comite.xlsx", label: "Registre des Arbitrages & Décisions", type: "excel", path: "documents_phases/Etape_3_Decision_GoNoGo/Registre_Arbitrages_Decisions_Comite.xlsx" }
    ]
  },
  {
    step: 4,
    title: "Développement encadré (Pilote)",
    actor: "Escouade IA + TI + Métiers",
    instance: "Laboratoire d'Expérimentation & Prototypage",
    respType: "shared",
    respLabel: "Responsabilité Partagée",
    color: "#0284c7",
    floorName: "Tour Bureau de l'IA • 4e Étage : Laboratoire POC (Escouade IA)",
    building: "bureau_ia",
    xPos: 0,
    yPos: 68,
    camX: 35,
    camY: 77,
    camZ: 42,
    targetX: 0,
    targetY: 75,
    targetZ: 0,
    elevatorX: -23.5,
    elevatorY: 73,
    summary: "Preuve de concept (POC) en bac à sable contrôlé pour valider concrètement les gains avant tout déploiement large.",
    criteria: [
      "Développement agile en environnement infonuagique sécurisé et isolé d'IQ.",
      "Bilan réel de la valeur d'affaires et de la précision des modèles.",
      "Règle du Fail Fast : arrêt sans préjudice si les gains ne sont pas au rendez-vous.",
      "Franchissement de la Passerelle Technologique vers le Building des TI si la POC est un succès."
    ],
    files: [
      { name: "Grille_Evaluation_Bilan_Pilote_POC.xlsx", label: "Grille d'Évaluation & Bilan Pilote POC", type: "excel", path: "documents_phases/Etape_4_Pilote_POC/Grille_Evaluation_Bilan_Pilote_POC.xlsx" },
      { name: "Cahier_Charges_Experimentation_Escouade_IA.docx", label: "Cahier des Charges Expérimentation Escouade IA", type: "word", path: "documents_phases/Etape_4_Pilote_POC/Cahier_Charges_Experimentation_Escouade_IA.docx" }
    ]
  },
  {
    step: 5,
    title: "Déploiement contrôlé",
    actor: "Équipe TI + Bureau IA + Affaires",
    instance: "Building des TI • Centre d'Intégration & Homologation Production",
    respType: "shared",
    respLabel: "Responsabilité Partagée (Direction TI)",
    color: "#0284c7",
    floorName: "Building des TI • 5e Étage : Centre d'Intégration & Déploiement Contrôlé",
    building: "ti",
    xPos: 75,
    yPos: 68,
    camX: 110,
    camY: 82,
    camZ: 46,
    targetX: 75,
    targetY: 74,
    targetZ: 0,
    elevatorX: 51.5,
    elevatorY: 73,
    summary: "Passage officiel au Déploiement : Les résultats de l'expérimentation alimentent soit un Dossier d'opportunité pour appel d'offres (solutions marché), soit une architecture qualité production conçue par les architectes TI.",
    criteria: [
      "Voie Appel d'Offres : Résultats du pilote intégrés au Dossier d'opportunité officiel pour acquisition de solution marché.",
      "Voie Industrialisation TI : Architecture de qualité production (sécurité, haute disponibilité, intégration maîtres) conçue par les architectes TI.",
      "Homologation formelle : Signature de l'évaluation des facteurs relatifs à la vie privée (Loi 25) et validation de cybersécurité.",
      "Accompagnement & Adoption : Plan de formation des utilisateurs et gestion du changement pilotés avec les métiers."
    ],
    files: [
      { name: "ARP_Gabarit_Homologation_Securite.xlsx", label: "Gabarit ARP & Homologation de Sécurité", type: "excel", path: "documents_phases/Etape_5_Deploiement_Controle/ARP_Gabarit_Homologation_Securite.xlsx" },
      { name: "Plan_Formation_Accompagnement_Changement.docx", label: "Plan de Formation & Accompagnement au Changement", type: "word", path: "documents_phases/Etape_5_Deploiement_Controle/Plan_Formation_Accompagnement_Changement.docx" }
    ]
  },
  {
    step: 6,
    title: "Exploitation et surveillance",
    actor: "Direction des TI",
    instance: "Building des TI • Tour de Contrôle & Support TI en continu",
    respType: "ti",
    respLabel: "Responsabilité TI (Exploitation en continu)",
    color: "#e11d48",
    floorName: "Building des TI • 6e Étage (Sommet) : Vigie d'Exploitation en continu & Support TI",
    building: "ti",
    xPos: 75,
    yPos: 85,
    camX: 88,
    camY: 82,
    camZ: 110,
    targetX: 38,
    targetY: 55,
    targetZ: 0,
    elevatorX: 51.5,
    elevatorY: 90,
    summary: "Maintien en condition opérationnelle permanent pris en charge par les TI, surveillance continue des risques (KRIs) et gestion des incidents TI.",
    criteria: [
      "Formulaire d'évaluation automatisé : complétez une demande d'analyse assistée par l'IA et validée par l'humain, accélérant le processus de 3 jours à seulement 3 minutes.",
      "Surveillance continue de la disponibilité et de la dérive des modèles IA.",
      "Gestion des incidents et anomalies via le processus standard Octopus.",
      "Mise à jour périodique du Registre des Initiatives IA d'IQ."
    ],
    files: [
      { name: "evaluation.html", label: "⚡ Guichet d'Évaluation Automatisé (3 min)", type: "link", path: "/evaluation.html", desc: "Demande d'analyse assistée par l'IA et validée par l'humain (3 jours à 3 min)" },
      { name: "Registre_Officiel_Initiatives_IA_Actives.xlsx", label: "Registre Officiel des Initiatives IA Actives", type: "excel", path: "documents_phases/Etape_6_Exploitation_Surveillance/Registre_Officiel_Initiatives_IA_Actives.xlsx" },
      { name: "Tableau_Bord_Suivi_KRIs_Derive_Modeles.xlsx", label: "Tableau de Bord KRIs & Suivi Dérive Modèles", type: "excel", path: "documents_phases/Etape_6_Exploitation_Surveillance/Tableau_Bord_Suivi_KRIs_Derive_Modeles.xlsx" }
    ]
  }
];

// ============================================================================
// INITIALISATION DE LA SCÈNE 3D
// ============================================================================
function initTowerSimulation() {
  const container = document.getElementById('webgl-canvas-container');

  IQ_TOWER.scene = new THREE.Scene();
  IQ_TOWER.scene.background = new THREE.Color(0x7ec0ee); // Ciel bleu québécois
  IQ_TOWER.scene.fog = new THREE.FogExp2(0xa3d4f7, 0.0016);

  const aspect = window.innerWidth / window.innerHeight;
  const isMobile = window.innerWidth <= 860;
  IQ_TOWER.camera = new THREE.PerspectiveCamera(aspect < 1 ? 48 : 38, aspect, 1, 1600);
  // Vue initiale cadrant toute la bâtisse de la tour de gouvernance IA
  IQ_TOWER.camera.position.set(isMobile ? 95 : 95, isMobile ? 68 : 70, isMobile ? 122 : 105);

  IQ_TOWER.renderer = new THREE.WebGLRenderer({ antialias: true });
  IQ_TOWER.renderer.setSize(window.innerWidth, window.innerHeight);
  IQ_TOWER.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  IQ_TOWER.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  IQ_TOWER.renderer.toneMappingExposure = 1.25;
  IQ_TOWER.renderer.shadowMap.enabled = true;
  IQ_TOWER.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(IQ_TOWER.renderer.domElement);

  IQ_TOWER.controls = new THREE.OrbitControls(IQ_TOWER.camera, IQ_TOWER.renderer.domElement);
  IQ_TOWER.controls.enableDamping = true;
  IQ_TOWER.controls.dampingFactor = 0.06;
  IQ_TOWER.controls.maxPolarAngle = Math.PI / 2 - 0.04;
  IQ_TOWER.controls.minDistance = 25;
  IQ_TOWER.controls.maxDistance = 250;
  IQ_TOWER.controls.target.set(isMobile ? -6 : 0, isMobile ? 46 : 52, 0);

  setupLighting();
  buildGroundAndSurroundings();
  build7FloorLifecycleTower();
  buildPanoramicElevator();
  buildCampusDynamicTraffic();
  setupUI();

  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  IQ_TOWER.scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x86efac, 0.85);
  IQ_TOWER.scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfffbeb, 2.5);
  sun.position.set(80, 160, 75);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 450;
  const d = 90;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0003;
  IQ_TOWER.scene.add(sun);
}

function buildGroundAndSurroundings() {
  const land = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.85 })
  );
  land.rotation.x = -Math.PI / 2;
  land.position.y = -0.2;
  land.receiveShadow = true;
  IQ_TOWER.scene.add(land);

  // Esplanade centrale élargie pour la Tour et les Pavillons latéraux
  const plaza = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 100),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.02, 0);
  plaza.receiveShadow = true;
  IQ_TOWER.scene.add(plaza);

  // Pavillons satellites pour les Parcours 1 & 2
  buildSidePavilions();
}

// ============================================================================
// ============================================================================
// MODÉLISATION DE LA MÉTROPOLE : 2 BÂTIMENTS & PASSERELLE TECHNOLOGIQUE
// Bâtiment 1 : Tour du Bureau de l'IA (Jalons 0 à 4)
// Passerelle : Skybridge d'Homologation & Pod de Transfert (y: 68)
// Bâtiment 2 : Building des TI & Data Center Cloud (Jalons 5 & 6)
// ============================================================================
function build7FloorLifecycleTower() {
  const floorH = 17;
  const bureauW = 40;
  const bureauD = 28;
  const tiW = 38;
  const tiD = 28;

  // 1. CONSTRUCTION DES ÉTAGES DU CYCLE DE VIE
  SLIDE8_LIFECYCLE.forEach((stepData) => {
    const isTI = (stepData.building === "ti");
    const towerW = isTI ? tiW : bureauW;
    const towerD = isTI ? tiD : bureauD;
    const posX = isTI ? 75 : 0;

    const floorG = new THREE.Group();
    floorG.position.set(posX, stepData.yPos, 0);

    // Plancher de l'étage
    const slabMat = new THREE.MeshStandardMaterial({
      color: isTI ? 0x0f172a : 0xf1f5f9,
      roughness: 0.35,
      metalness: isTI ? 0.3 : 0.05
    });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(towerW, 1.2, towerD), slabMat);
    slab.position.y = 0.6;
    slab.receiveShadow = true; slab.castShadow = true;
    floorG.add(slab);

    // Bandeau frontal coloré selon la responsabilité officielle (Slide 8)
    const frontBand = new THREE.Mesh(
      new THREE.BoxGeometry(towerW, 0.8, 0.4),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(stepData.color) })
    );
    frontBand.position.set(0, 0.6, towerD / 2 + 0.2);
    floorG.add(frontBand);

    // Plafond de l'étage
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(towerW - 2, 0.6, towerD - 2),
      new THREE.MeshStandardMaterial({
        color: isTI ? 0x1e293b : 0xffffff,
        emissive: isTI ? 0x0284c7 : 0xf8fafc,
        emissiveIntensity: isTI ? 0.3 : 0.15
      })
    );
    ceiling.position.y = floorH - 0.3;
    floorG.add(ceiling);

    // Colonnes porteuses
    const colMat = new THREE.MeshStandardMaterial({
      color: isTI ? 0x38bdf8 : 0x94a3b8,
      metalness: isTI ? 0.8 : 0.5,
      roughness: 0.3
    });
    const colGeo = new THREE.CylinderGeometry(0.7, 0.7, floorH, 12);
    [
      { x: -towerW/2 + 2, z: -towerD/2 + 2 },
      { x: towerW/2 - 2, z: -towerD/2 + 2 },
      { x: -towerW/2 + 2, z: towerD/2 - 2 },
      { x: towerW/2 - 2, z: towerD/2 - 2 }
    ].forEach(c => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(c.x, floorH / 2, c.z);
      col.castShadow = true;
      floorG.add(col);
    });

    // Mur du fond
    const backWallMat = new THREE.MeshStandardMaterial({
      color: isTI ? 0x090d16 : 0x1e293b,
      roughness: 0.5
    });
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(towerW - 1, floorH - 1.2, 1),
      backWallMat
    );
    backWall.position.set(0, floorH / 2, -towerD / 2 + 0.5);
    floorG.add(backWall);

    // Façade vitrée panoramique claire
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(towerW, floorH - 1.2, 0.4),
      new THREE.MeshStandardMaterial({
        color: isTI ? 0x38bdf8 : 0xbae6fd,
        transparent: true,
        opacity: isTI ? 0.28 : 0.22,
        roughness: 0.1,
        metalness: 0.8
      })
    );
    glass.position.set(0, floorH / 2, towerD / 2);
    floorG.add(glass);
    floorG.userData.frontGlass = glass;

    // Aménagement spécifique du jalon
    furnishLifecycleFloor(floorG, stepData, towerW, towerD, floorH);

    IQ_TOWER.scene.add(floorG);
    IQ_TOWER.floors.push(floorG);
  });

  // 2. TOIT DE LA TOUR DU BUREAU DE L'IA (y: 85 = 5 étages de 17m)
  buildBureauIATowerRoof(bureauW, bureauD, 5 * floorH);

  // 3. SOCLE DATA CENTER CLOUD & TOIT DU BUILDING DES TI (x: 75)
  buildTIDataCenterBaseAndRoof(tiW, tiD, 75, floorH);

  // 4. PASSERELLE TECHNOLOGIQUE SÉCURISÉE (SKYBRIDGE y: 68 RELIANT LES 2 TOURS)
  buildSkybridge(20, 56, 68);
}

// Toit de la Tour Bureau de l'IA (Incubateur & Gouvernance)
function buildBureauIATowerRoof(w, d, yPos) {
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 2, 2, d + 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  roof.position.set(0, yPos + 1, 0);
  IQ_TOWER.scene.add(roof);

  // Grand enseigne néon lumineuse sur le toit
  createWallScreen(IQ_TOWER.scene, 0, yPos + 7, 0, 32, 4.5, "BUREAU DE L'IA • INCUBATEUR & GOUVERNANCE", "#0284c7");

  // Balise centrale
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 1.2, 18, 12),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
  );
  spire.position.set(0, yPos + 10, -5);
  IQ_TOWER.scene.add(spire);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  beacon.position.set(0, yPos + 19.5, -5);
  IQ_TOWER.scene.add(beacon);
}

// Socle Data Center & Toit du Building des TI
function buildTIDataCenterBaseAndRoof(w, d, posX, floorH) {
  // A. Socle Infonuagique / Centre de données sécurisé d'IQ (de y: 0 à y: 68)
  const baseH = 68;
  const baseGroup = new THREE.Group();
  baseGroup.position.set(posX, 0, 0);

  // Structure principale du Data Center
  const dataCenterMat = new THREE.MeshStandardMaterial({
    color: 0x0b1329,
    roughness: 0.25,
    metalness: 0.7
  });
  const dataCenterBody = new THREE.Mesh(new THREE.BoxGeometry(w, baseH, d), dataCenterMat);
  dataCenterBody.position.y = baseH / 2;
  dataCenterBody.castShadow = true; dataCenterBody.receiveShadow = true;
  baseGroup.add(dataCenterBody);

  // Panneaux vitrés techniques avec baies de serveurs intérieures illuminées
  const serverGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.8
  });
  const serverGlass = new THREE.Mesh(new THREE.BoxGeometry(w - 4, baseH - 8, 0.4), serverGlassMat);
  serverGlass.position.set(0, baseH / 2, d / 2 + 0.1);
  baseGroup.add(serverGlass);

  // Lignes de serveurs avec diodes LED vertes et bleues pulsantes
  for (let lvl = 8; lvl < baseH - 4; lvl += 12) {
    const rackBand = new THREE.Mesh(
      new THREE.BoxGeometry(w - 8, 1.2, 0.8),
      new THREE.MeshBasicMaterial({ color: lvl % 24 === 8 ? 0x10b981 : 0x00f0ff })
    );
    rackBand.position.set(0, lvl, d / 2 - 0.4);
    baseGroup.add(rackBand);
  }

  // Grand bandeau néon sur la façade du Data Center
  createWallScreen(baseGroup, 0, baseH / 2, d / 2 + 0.5, 34, 5, "CENTRE DE DONNÉES SÉCURISÉ IQ", "#38bdf8");

  // Enseigne au niveau du sol
  createWallScreen(baseGroup, 0, 4, d / 2 + 0.5, 32, 3, "DIRECTION DES TECHNOLOGIES DE L'INFORMATION (TI)", "#e11d48");

  IQ_TOWER.scene.add(baseGroup);

  // B. Toit du Building des TI (au-dessus du 6e étage : y = 68 + 2*17 = 102)
  const roofY = 102;
  const tiRoof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 2, 2, d + 2),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 })
  );
  tiRoof.position.set(posX, roofY + 1, 0);
  IQ_TOWER.scene.add(tiRoof);

  // Enseigne officielle Sommet TI
  createWallScreen(IQ_TOWER.scene, posX, roofY + 7, 0, 34, 4.5, "DIRECTION DES TI • EXPLOITATION EN CONTINU", "#e11d48");

  // Parabole Satellite géante d'IQ
  const dishGroup = new THREE.Group();
  dishGroup.position.set(posX, roofY + 10, -4);

  const dishBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.4, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  dishBase.position.y = 2;
  dishGroup.add(dishBase);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(4.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.5),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2, side: THREE.DoubleSide })
  );
  dish.rotation.x = Math.PI / 4;
  dish.position.set(0, 5, 0);
  dishGroup.add(dish);

  // Mât de télécommunication avec gyrophare d'alerte rouge
  const towerMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.8, 18, 8),
    new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.9 })
  );
  towerMast.position.set(posX - 12, roofY + 10, 0);
  IQ_TOWER.scene.add(towerMast);

  const mastLight = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  mastLight.position.set(posX - 12, roofY + 19.5, 0);
  IQ_TOWER.scene.add(mastLight);

  IQ_TOWER.scene.add(dishGroup);
}

// 4. Passerelle Technologique d'Homologation (Skybridge y: 68)
function buildSkybridge(startX, endX, yPos) {
  const bridgeLen = endX - startX;
  const bridgeCenter = (startX + endX) / 2;
  const bridgeW = 6;
  const bridgeH = 5;

  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(bridgeCenter, yPos, 0);

  // Tube vitré de la passerelle
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.85,
    side: THREE.DoubleSide
  });
  const glassTube = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, bridgeH, bridgeW), glassMat);
  glassTube.position.y = bridgeH / 2;
  bridgeGroup.add(glassTube);

  // Plancher métallique et piste lumineuse
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, 0.4, bridgeW), floorMat);
  floorMesh.position.y = 0.2;
  bridgeGroup.add(floorMesh);

  // Bandeau LED cyan au centre du plancher (flux d'homologation)
  const neonStripe = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLen, 0.1, 1.2),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  neonStripe.position.y = 0.42;
  bridgeGroup.add(neonStripe);

  // Arches métalliques de renfort le long de la passerelle
  const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
  const numArches = 5;
  for (let i = 0; i <= numArches; i++) {
    const archX = -bridgeLen / 2 + (bridgeLen / numArches) * i;
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.8, bridgeH + 0.6, bridgeW + 0.6), archMat);
    arch.position.set(archX, bridgeH / 2, 0);
    bridgeGroup.add(arch);

    // Anneau de lumière néon cyan sur chaque arche
    const archNeon = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, bridgeH + 0.8, bridgeW + 0.8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    archNeon.position.set(archX, bridgeH / 2, 0);
    bridgeGroup.add(archNeon);
  }

  // Panneau holographique au-dessus de la passerelle
  createWallScreen(bridgeGroup, 0, bridgeH + 2.2, 0, bridgeLen - 4, 1.8, "PASSERELLE TECHNOLOGIQUE ➔ TRANSFERT AUX TI", "#00f0ff");

  IQ_TOWER.scene.add(bridgeGroup);

  // Navette de données / Capsule pod d'homologation
  const podGroup = new THREE.Group();
  podGroup.position.set(startX + 2, yPos + 1.2, 0);

  const podBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.2, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
  );
  podGroup.add(podBody);

  const podGlow = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 0.4, 3.0),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  podGroup.add(podGlow);

  IQ_TOWER.scene.add(podGroup);
  IQ_TOWER.skybridgePod = podGroup;
}

function furnishLifecycleFloor(group, stepData, w, d, h) {
  if (stepData.step === 1) {
    // 1. Qualification : Salle de Réunion & Bureau du Bureau de l'IA (Slide 9 intégrale)
    buildBureauDeLIASuite(group, w, d, h);
    return;
  }

  // Grand écran mural officiel affichant le jalon
  createWallScreen(group, 0, 7, -d/2 + 1.2, 22, 6.5, `${stepData.step}. ${stepData.title.toUpperCase()}`, stepData.color);

  if (stepData.step === 0) {
    // 0. Dépôt de la demande (Demandeur)
    createDeskStation(group, -8, 0, -4);
    createDeskStation(group, 8, 0, -4);
    createHumanCharacter(group, -8, 0, -2, 0x1e3a8a, "Demandeur");
    createHumanCharacter(group, 8, 0, -2, 0x334155, "Conseiller Métier");
  } else if (stepData.step === 1) {
    // 1. Qualification (Bureau IA)
    createDeskStation(group, -8, 0, 2);
    createDeskStation(group, 8, 0, 2);
    createHumanCharacter(group, -8, 0, 4, 0x1e3a8a, "Analyste IA");
    createHumanCharacter(group, 8, 0, 4, 0x0284c7, "Expert Valeur");
  } else if (stepData.step === 2) {
    // 2. Évaluation des risques et priorisation (Bureau IA + expertises)
    const table = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
    table.position.set(0, 1.25, 0);
    group.add(table);
    createHumanCharacter(group, -5, 0, 6, 0xd97706, "Expert Risques");
    createHumanCharacter(group, 5, 0, 6, 0x7c3aed, "DPRP Loi 25");
  } else if (stepData.step === 3) {
    // 3. Décision Go / No Go (Comités)
    const table = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 2.5, 32), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
    table.position.set(0, 1.25, 0);
    group.add(table);
    [-5, 5].forEach(x => {
      createHumanCharacter(group, x, 0, -4, 0x0f172a, "Comité IA");
      createHumanCharacter(group, x, 0, 4, 0x0f172a, "Comité IA");
    });
  } else if (stepData.step === 4) {
    // 4. Développement encadré (Pilote - Escouade IA)
    createDeskStation(group, -8, 0, 0);
    createDeskStation(group, 8, 0, 0);
    createHumanCharacter(group, -8, 0, 2, 0x0284c7, "Développeur IA");
    createHumanCharacter(group, 8, 0, 2, 0x059669, "Pilote Métier");
  } else if (stepData.step === 5) {
    // 5. Déploiement contrôlé (TI + Bureau IA)
    createDeskStation(group, 0, 0, 0);
    createHumanCharacter(group, -6, 0, 2, 0x059669, "Intégrateur TI");
    createHumanCharacter(group, 6, 0, 2, 0x1e3a8a, "Formateur Bureau IA");
  } else if (stepData.step === 6) {
    // 6. Exploitation et surveillance (TI)
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    [-10, 0, 10].forEach(x => {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(3.5, 9, 2.5), rackMat);
      rack.position.set(x, 4.5, -5);
      group.add(rack);
      const led = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xe11d48 }));
      led.position.set(x, 6.5, -3.7);
      group.add(led);
    });
    createHumanCharacter(group, 0, 0, 2, 0xe11d48, "Support TI en continu");
  }
}

function createDeskStation(parent, x, y, z) {
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(6, 2.2, 3),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
  );
  desk.position.set(x, y + 1.1, z);
  parent.add(desk);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.4, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  screen.position.set(x, y + 2.9, z - 0.6);
  parent.add(screen);
}

function createHumanCharacter(parent, x, y, z, shirtColor, nameTag) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.1, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 })
  );
  body.position.y = 2.4;
  g.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 })
  );
  head.position.y = 4.1;
  g.add(head);

  g.position.set(x, y, z);
  parent.add(g);
  IQ_TOWER.characters.push(g);
}

// ============================================================================
// CIRCULATION DYNAMIQUE & LOGISTIQUE PROFESSIONNELLE DU CAMPUS IQ
// Navettes électriques autonomes & Chariot de transfert serveur sécurisé
// ============================================================================
function buildCampusDynamicTraffic() {
  IQ_TOWER.dynamicVehicles = [];

  // 1. Voie routière asphaltée et sobre à l'avant du campus
  const roadGeo = new THREE.PlaneGeometry(340, 12);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
  const roadFront = new THREE.Mesh(roadGeo, roadMat);
  roadFront.rotation.x = -Math.PI / 2;
  roadFront.position.set(38, 0.04, 44);
  roadFront.receiveShadow = true;
  IQ_TOWER.scene.add(roadFront);

  // Ligne de guidage blanche
  const lineGeo = new THREE.PlaneGeometry(340, 0.4);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const roadLine = new THREE.Mesh(lineGeo, lineMat);
  roadLine.rotation.x = -Math.PI / 2;
  roadLine.position.set(38, 0.05, 44);
  IQ_TOWER.scene.add(roadLine);

  // Fonction de création d'une navette corporative électrique autonome
  const createCampusVehicle = (bodyColor, startX, z, speed, dir) => {
    const veh = new THREE.Group();

    // Carrosserie épurée
    const bodyGeo = new THREE.BoxGeometry(7.2, 2.2, 3.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.6;
    body.castShadow = true;
    veh.add(body);

    // Toit et vitres panoramiques teintées
    const glassGeo = new THREE.BoxGeometry(5.2, 1.3, 3.62);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0.3 * dir, 2.3, 0);
    veh.add(glass);

    // Bande lumineuse LED avant (cyan IQ)
    const ledFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 3.0),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ledFront.position.set(3.61 * dir, 1.4, 0);
    veh.add(ledFront);

    // Feux arrière rouges
    const ledBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 3.0),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    ledBack.position.set(-3.61 * dir, 1.4, 0);
    veh.add(ledBack);

    // 4 Roues carénées
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    [
      [-2.2, 0.7, 1.8],
      [2.2, 0.7, 1.8],
      [-2.2, 0.7, -1.8],
      [2.2, 0.7, -1.8]
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      veh.add(wheel);
    });

    veh.position.set(startX, 0, z);
    veh.userData = { speed: speed, dir: dir, minX: -55, maxX: 135 };
    IQ_TOWER.scene.add(veh);
    IQ_TOWER.dynamicVehicles.push(veh);
  };

  createCampusVehicle(0xffffff, -25, 41.5, 0.22, 1);  // Navette blanche (direction Est)
  createCampusVehicle(0x0284c7, 105, 46.5, 0.18, -1); // Navette bleue IQ (direction Ouest)

  // 2. Chariot de Baie de Serveurs avec Technicien sur la Passerelle Technologique (y: 68)
  const cartGroup = new THREE.Group();
  cartGroup.position.set(22, 68, 1.2);

  // Châssis métallique du chariot
  const cartBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.3, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 })
  );
  cartBase.position.y = 0.5;
  cartGroup.add(cartBase);

  // 4 Roulettes industrielles
  const casterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 10);
  const casterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  [[-1.4, 0.25, 0.8], [1.4, 0.25, 0.8], [-1.4, 0.25, -0.8], [1.4, 0.25, -0.8]].forEach(([cx, cy, cz]) => {
    const w = new THREE.Mesh(casterGeo, casterMat);
    w.position.set(cx, cy, cz);
    cartGroup.add(w);
  });

  // Baie de serveurs sécurisée
  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 3.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
  );
  rack.position.y = 2.2;
  cartGroup.add(rack);

  // Voyants LED d'activité du serveur (vert et cyan)
  const leds = [];
  const ledGeo = new THREE.BoxGeometry(0.12, 0.18, 0.05);
  const matG = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const matC = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  for (let ly = 1.1; ly <= 3.3; ly += 0.45) {
    const lg = new THREE.Mesh(ledGeo, matG);
    lg.position.set(-0.7, ly, 0.82);
    cartGroup.add(lg);
    leds.push(lg);

    const lc = new THREE.Mesh(ledGeo, matC);
    lc.position.set(-0.3, ly, 0.82);
    cartGroup.add(lc);
    leds.push(lc);
  }
  cartGroup.userData = {
    speed: 0.045,
    dir: 1,
    minX: 18,
    maxX: 54,
    leds: leds
  };

  // Technicien TI poussant le chariot
  const tech = new THREE.Group();
  tech.position.set(-2.4, 0, 0);

  const techBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.95, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.6 }) // Blouson bleu officiel TI
  );
  techBody.position.y = 2.2;
  tech.add(techBody);

  const techHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 })
  );
  techHead.position.y = 3.8;
  tech.add(techHead);

  // Badge d'accès officiel IQ
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.35, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  badge.position.set(0.3, 2.5, 0.8);
  tech.add(badge);

  cartGroup.add(tech);

  IQ_TOWER.scene.add(cartGroup);
  IQ_TOWER.serverCartGroup = cartGroup;
}

function createWallScreen(parent, x, y, z, w, h, text, accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 152);

  ctx.font = 'bold 22px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 80);

  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture }));
  mesh.position.set(x, y, z);
  parent.add(mesh);
}

function buildRooftopHeliport(w, d, yPos) {
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 2, 2, d + 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  roof.position.set(0, yPos + 1, 0);
  IQ_TOWER.scene.add(roof);

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 1.2, 22, 12),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
  );
  spire.position.y = yPos + 13;
  IQ_TOWER.scene.add(spire);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  beacon.position.set(0, yPos + 24.5, 0);
  IQ_TOWER.scene.add(beacon);
}

// ============================================================================
// PAVILLONS SATELLITES : ACHATS TI (PARCOURS 1) & SUPPORT LICENCES (PARCOURS 2)
// ============================================================================
function buildSidePavilions() {
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.5
  });

  // 1. Pavillon Achats & Solutions TI (Parcours 1 - Ouest x: -62)
  const pav1 = new THREE.Group();
  pav1.position.set(-62, 0, 0);

  const b1Mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 22), b1Mat);
  b1.position.y = 7;
  b1.castShadow = true; b1.receiveShadow = true;
  pav1.add(b1);

  const g1 = new THREE.Mesh(new THREE.BoxGeometry(24, 11, 0.4), glassMat);
  g1.position.set(0, 7, 11.1);
  pav1.add(g1);

  createWallScreen(pav1, 0, 15.2, 11.2, 22, 2.4, "PARCOURS 1 • ACHAT LOGICIEL TI", "#38bdf8");

  createDeskStation(pav1, -5, 0, 2);
  createDeskStation(pav1, 5, 0, 2);
  createHumanCharacter(pav1, -5, 0, 4, 0x1e3a8a, "Acheteur TI");
  createHumanCharacter(pav1, 5, 0, 4, 0x0284c7, "Expert Sécurité TI");

  IQ_TOWER.scene.add(pav1);

  // 2. Pavillon Support & Licences TI (Parcours 2 - Est x: 62)
  const pav2 = new THREE.Group();
  pav2.position.set(62, 0, 0);

  const b2Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 22), b2Mat);
  b2.position.y = 7;
  b2.castShadow = true; b2.receiveShadow = true;
  pav2.add(b2);

  const g2 = new THREE.Mesh(new THREE.BoxGeometry(24, 11, 0.4), glassMat);
  g2.position.set(0, 7, 11.1);
  pav2.add(g2);

  createWallScreen(pav2, 0, 15.2, 11.2, 22, 2.4, "PARCOURS 2 • SUPPORT TI & LICENCES IA", "#10b981");

  createDeskStation(pav2, -5, 0, 2);
  createDeskStation(pav2, 5, 0, 2);
  createHumanCharacter(pav2, -5, 0, 4, 0x10b981, "Support TI Octopus");
  createHumanCharacter(pav2, 5, 0, 4, 0xf59e0b, "Gestionnaire Licences");

  IQ_TOWER.scene.add(pav2);

  // Passerelles dallées reliant les pavillons à la Tour centrale
  const walkwayMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(36, 6), walkwayMat);
  w1.rotation.x = -Math.PI / 2;
  w1.position.set(-35, 0.03, 0);
  IQ_TOWER.scene.add(w1);

  const w2 = new THREE.Mesh(new THREE.PlaneGeometry(36, 6), walkwayMat);
  w2.rotation.x = -Math.PI / 2;
  w2.position.set(35, 0.03, 0);
  IQ_TOWER.scene.add(w2);
}

// ============================================================================
// ÉTAGE 1 : SALLE DE RÉUNION & BUREAU DU BUREAU DE L'IA (SLIDE 9 INTÉGRALE)
// ============================================================================
function buildBureauDeLIASuite(group, w, d, h) {
  // A. Plafonnier et luminaires suspendus au-dessus de la table de réunion
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
  const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  [-3.5, 3.5].forEach(xPos => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5, 8), lampMat);
    cord.position.set(xPos, 12, -2);
    group.add(cord);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16), lampMat);
    shade.position.set(xPos, 9.5, -2);
    group.add(shade);

    const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 16), lightGlowMat);
    glowDisc.rotation.x = Math.PI / 2;
    glowDisc.position.set(xPos, 9.1, -2);
    group.add(glowDisc);
  });

  // Source lumineuse ponctuelle chaleureuse centrée sur la table
  const roomLight = new THREE.PointLight(0xfff7ed, 2.4, 45);
  roomLight.position.set(0, 10.5, -2);
  roomLight.castShadow = true;
  group.add(roomLight);

  // Éclairage ciblé sur le SmartBoard mural
  const boardSpot = new THREE.SpotLight(0xffffff, 2.5, 40, Math.PI / 3, 0.3);
  boardSpot.position.set(0, 13, 6);
  boardSpot.target.position.set(0, 7.8, -12);
  group.add(boardSpot);
  group.add(boardSpot.target);

  // B. Grande Table de Conférence Exécutive
  const tableGroup = new THREE.Group();
  const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x2b1d0c, roughness: 0.3, metalness: 0.1 });
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 6.8), tableTopMat);
  tableTop.position.set(0, 2.3, -2);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);

  const inlayMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const tableInlay = new THREE.Mesh(new THREE.BoxGeometry(9, 0.02, 1.2), inlayMat);
  tableInlay.position.set(0, 2.49, -2);
  tableGroup.add(tableInlay);

  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
  [-5, 5].forEach(xLeg => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 5.2), legMat);
    leg.position.set(xLeg, 1.1, -2);
    leg.castShadow = true;
    tableGroup.add(leg);
  });

  group.add(tableGroup);

  // C. Chaises de réunion design autour de la table
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
  const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
  
  const chairPositions = [
    { x: -3.5, z: -4.8, rotY: 0 },
    { x: 3.5, z: -4.8, rotY: 0 },
    { x: -3.5, z: 0.8, rotY: Math.PI },
    { x: 3.5, z: 0.8, rotY: Math.PI },
    { x: -7.5, z: -2, rotY: Math.PI / 2 },
    { x: 7.5, z: -2, rotY: -Math.PI / 2 }
  ];

  chairPositions.forEach(cp => {
    const chair = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.5), chairMat);
    seat.position.y = 1.4;
    chair.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 0.2), chairMat);
    back.position.set(0, 2.1, -0.65);
    chair.add(back);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.6, 1.3, 8), chairLegMat);
    base.position.y = 0.65;
    chair.add(base);

    chair.position.set(cp.x, 0, cp.z);
    chair.rotation.y = cp.rotY;
    group.add(chair);
  });

  // D. Équipements de travail sur la table (Laptops allumés, documents, mugs)
  createDetailedLaptop(group, -3.5, 2.5, -3, 0x38bdf8, 0.2);
  createDetailedLaptop(group, 3.5, 2.5, -3, 0x10b981, -0.15);
  createDetailedLaptop(group, 3.5, 2.5, -1, 0x6366f1, Math.PI + 0.1);
  createDetailedDocuments(group, -1, 2.5, -2);
  createDetailedCoffeeMug(group, -4.5, 2.5, -1.8);
  createDetailedCoffeeMug(group, 4.8, 2.5, -2.2);

  // E. LE GRAND SMART BOARD MURAL SLIDE 9 (Fidèle à la diapositive officielle)
  createSlide9SmartBoard(group, 0, 7.8, -d/2 + 1.2, 24, 8.5);

  // F. L'ÉQUIPE DU BUREAU DE L'IA EN PLEIN TRAVAIL (4 PERSONNAGES)
  createHumanCharacter(group, -6.8, 0, -2, 0x1e3a8a, "Responsable Bureau IA");
  createHumanCharacter(group, -3.5, -0.6, -4.2, 0x0284c7, "Conseiller Faisabilité");
  createHumanCharacter(group, 3.5, -0.6, 0.4, 0x059669, "Analyste Valeur Métier");
  createHumanCharacter(group, 6.5, 0, -6.5, 0x2563eb, "Architecte Solutions IA");

  // Plantes vertes et décor de bureau
  createOfficePlant(group, -11, 0, 8);
  createOfficePlant(group, 11, 0, 8);
  createOfficeBookshelf(group, 14, 0, -4);
}

// Reproduction intégrale du Smart Board officiel (Slide 10 : Qualification des cas d'usage)
function createSlide9SmartBoard(parent, x, y, z, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = 1500;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Fond panneau haute technologie
  ctx.fillStyle = '#0b1329';
  ctx.fillRect(0, 0, 1500, 800);

  // Bordure cyan lumineuse
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 1492, 792);

  // 1. En-tête principal de la Slide 10 officielle
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(60, 55, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('1', 60, 55);

  ctx.textAlign = 'left';
  ctx.font = 'bold 32px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Qualification des cas d\'usage', 105, 55);

  // 2. Bandeau turquoise d'acteur responsable : Bureau de l'IA et experts
  const gradActor = ctx.createLinearGradient(20, 95, 1480, 95);
  gradActor.addColorStop(0, '#0284c7');
  gradActor.addColorStop(0.5, '#0ea5e9');
  gradActor.addColorStop(1, '#0284c7');
  ctx.fillStyle = gradActor;
  ctx.fillRect(20, 95, 1460, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bureau de l\'IA et experts', 750, 116);

  // 3. Dessin des 4 Colonnes / Sous-Étapes officielles (1.1, 1.2, 1.3, 1.4)
  const cardW = 340;
  const cardH = 500;
  const startY = 160;
  const gap = 30;
  const startX = 35;

  const stepsData = [
    {
      num: "1.1",
      title: "Analyse de la valeur",
      color: "#0284c7",
      headerBg: "#0369a1",
      tag: "Alignement & Bénéfices",
      items: [
        "• Filtrage initial : Le risque cadre-t-il avec l'appétit au risque d'IQ ? (Sinon : rejet).",
        "• Évaluation valeur d'affaires & bénéfices anticipés.",
        "• Porte : Évaluation concluante ? (Sinon : rejet).",
        "• Test décisif : Un outil autorisé répond-il au besoin ?",
        "  ➔ Si OUI : aiguillage vers 1.2 Accompagnement.",
        "  ➔ Si NON : poursuite vers 1.3 Faisabilité."
      ],
      footer: "➔ Grille_faisabilite_cas_usage_IA.xlsx"
    },
    {
      num: "1.2",
      title: "Demande d'accompagnement",
      color: "#10b981",
      headerBg: "#047857",
      tag: "Outil Homologué & Escouade",
      items: [
        "• Prise en charge des demandes d'accompagnement directes issues de l'étape 0.",
        "• Réception des cas d'usage réorientés depuis 1.1 car un outil autorisé existe déjà.",
        "• Ateliers de cadrage avec l'Escouade IA.",
        "• Formation & prise en main des outils autorisés.",
        "• Évite les développements et achats redondants."
      ],
      footer: "➔ Matrice Outils Homologués"
    },
    {
      num: "1.3",
      title: "Faisabilité & Risques",
      color: "#f59e0b",
      headerBg: "#b45309",
      tag: "Organisation & Risques d'Entreprise",
      items: [
        "• Évaluation faisabilité autre que technique :",
        "  - Processus d'affaires et maturité opérationnelle.",
        "  - Disponibilité des compétences et ressources.",
        "  - Gestion du changement et adoption.",
        "• Évaluation des risques d'entreprise et d'image.",
        "• Porte : Évaluation concluante ? (Sinon : rejet)."
      ],
      footer: "➔ Grille Risques d'Entreprise"
    },
    {
      num: "1.4",
      title: "Sélection de l'outil IA",
      color: "#8b5cf6",
      headerBg: "#6d28d9",
      tag: "Outils Internes/Marché & Fournisseur",
      items: [
        "• Exploration des outils IA répondant au besoin :",
        "  - Outils internes sous gouvernance IQ.",
        "  - Solutions logicielles du marché.",
        "• Évaluation technique, cybersécurité et fournisseur.",
        "• Porte : Trouvé outil répondant au besoin ?",
        "  ➔ Si NON : rejet (retour étape 0).",
        "  ➔ Si OUI : passage au JALON 2 (Risques)."
      ],
      footer: "➔ Vers Jalon 2 : Évaluation Risque"
    }
  ];

  stepsData.forEach((st, idx) => {
    const cx = startX + idx * (cardW + gap);

    // Fond de carte
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx, startY, cardW, cardH);
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, startY, cardW, cardH);

    // En-tête de carte
    ctx.fillStyle = st.headerBg;
    ctx.fillRect(cx, startY, cardW, 58);

    // Cercle numéro
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 32, startY + 29, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = st.headerBg;
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(st.num, cx + 32, startY + 30);

    // Titre carte
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText(st.title, cx + 60, startY + 27);

    ctx.font = '500 11px "Outfit", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(st.tag, cx + 60, startY + 46);

    // Lignes de contenu
    let itemY = startY + 85;
    ctx.font = '500 14.5px "Outfit", sans-serif';
    ctx.fillStyle = '#e2e8f0';

    st.items.forEach(line => {
      if (line.includes('➔')) {
        ctx.fillStyle = st.color;
        ctx.font = 'bold 14.5px "Outfit", sans-serif';
      } else if (line.includes('• Porte') || line.includes('• Test')) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 14.5px "Outfit", sans-serif';
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '500 14px "Outfit", sans-serif';
      }
      ctx.fillText(line, cx + 16, itemY);
      itemY += 34;
    });

    // Pied de carte
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(cx + 8, startY + cardH - 50, cardW - 16, 40);
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 8, startY + cardH - 50, cardW - 16, 40);

    ctx.fillStyle = st.color;
    ctx.font = 'bold 14px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(st.footer, cx + cardW / 2, startY + cardH - 25);
  });

  // 4. Bandeau inférieur de synthèse
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, 680, 1460, 95);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 680, 1460, 95);

  ctx.textAlign = 'center';
  ctx.font = 'bold 17px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('PROCESSUS DE QUALIFICATION IQ : IDÉATION (0) ➔ VALEUR (1.1) ➔ ACCOMPAGNEMENT (1.2) ➔ FAISABILITÉ (1.3) ➔ SÉLECTION OUTIL IA (1.4) ➔ RISQUES (2)', 750, 715);

  ctx.font = '500 14px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Tout cas d\'usage non concluant est rejeté avec retour à l\'étape 0. Seules les initiatives avec outil qualifié accèdent à l\'évaluation approfondie.', 750, 750);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const boardMat = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), boardMat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
}

function createDetailedLaptop(parent, x, y, z, screenColor, rotY = 0) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), baseMat);
  base.position.y = 0.025;
  g.add(base);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.04), baseMat);
  lid.position.set(0, 0.45, -0.48);
  lid.rotation.x = -0.22;
  g.add(lid);

  const screenMat = new THREE.MeshBasicMaterial({ color: screenColor });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), screenMat);
  screen.position.set(0, 0.46, -0.45);
  screen.rotation.x = -0.22;
  g.add(screen);

  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
}

function createDetailedCoffeeMug(parent, x, y, z) {
  const mugMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.35, 12), mugMat);
  mug.position.set(x, y + 0.18, z);
  parent.add(mug);

  const coffeeMat = new THREE.MeshBasicMaterial({ color: 0x3f1d0b });
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), coffeeMat);
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(x, y + 0.34, z);
  parent.add(coffee);
}

function createDetailedDocuments(parent, x, y, z) {
  const docMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
  const doc1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 1.6), docMat);
  doc1.position.set(x, y + 0.01, z);
  doc1.rotation.y = 0.1;
  parent.add(doc1);

  const doc2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 1.6), docMat);
  doc2.position.set(x + 0.2, y + 0.03, z - 0.1);
  doc2.rotation.y = -0.15;
  parent.add(doc2);
}

function createOfficePlant(parent, x, y, z) {
  const potMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.8, 16), potMat);
  pot.position.set(x, y + 0.9, z);
  parent.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), leafMat);
    leaf.scale.set(1.4, 0.2, 0.8);
    leaf.position.set(x + Math.cos(angle) * 0.7, y + 1.8 + (i % 2) * 0.4, z + Math.sin(angle) * 0.7);
    leaf.rotation.y = angle;
    leaf.rotation.z = 0.3;
    parent.add(leaf);
  }
}

function createOfficeBookshelf(parent, x, y, z) {
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 4.2), shelfMat);
  shelf.position.set(x, y + 3.75, z);
  parent.add(shelf);

  const colors = [0x1e3a8a, 0x0284c7, 0x10b981, 0xd97706, 0xe11d48];
  for (let s = 0; s < 3; s++) {
    for (let b = 0; b < 6; b++) {
      const bookMat = new THREE.MeshStandardMaterial({ color: colors[(s + b) % colors.length] });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.25), bookMat);
      book.position.set(x, y + 1.2 + s * 2.2, z - 1.5 + b * 0.55);
      parent.add(book);
    }
  }
}

// ============================================================================
// SOUS-ÉTAPES DE TRAVAIL OFFICIEL DU BUREAU DE L'IA (IMMERSION ÉTAGE 1)
// ============================================================================
const BUREAU_IA_WORK_STEPS = [
  {
    subStep: 1,
    id: "valeur",
    title: "1.1 Analyse de la valeur",
    shortTitle: "Valeur",
    actor: "Bureau de l'IA et experts d'affaires",
    camPos: { x: -6.0, y: 22.5, z: 9.0 },
    camTarget: { x: -2.0, y: 20.5, z: -2.5 },
    speech: "Première sous-étape : l'Analyse de la valeur. Le Bureau de l'IA utilise la Grille officielle de faisabilité et d'évaluation pour noter l'Axe de valeur : le problème est-il clairement documenté, répond-il à un irritant opérationnel concret, engendre-t-il des gains de productivité quantifiables et s'aligne-t-il avec les priorités stratégiques d'Investissement Québec ? Si la note de valeur n'est pas concluante, le cas d'usage est rejeté. Si elle est concluante, nous vérifions si un outil déjà autorisé répond au besoin : si oui, nous l'orientons vers l'accompagnement ; si non, nous passons à l'analyse de faisabilité et des risques d'entreprise.",
    summary: "Évaluation officielle de la valeur d'affaires et de l'alignement stratégique via la Grille de Faisabilité (Axe 1).",
    actions: [
      "Instrument officiel : Grille_faisabilite_cas_usage_IA.xlsx (Axe 1 — Valeur d'affaires et alignement stratégique).",
      "Évaluation des critères : problème documenté, irritant réel, gains de productivité chiffrés, sponsor engagé.",
      "Porte de décision : Évaluation concluante ? (Si NON ➔ Rejet du cas d'usage avec retour à l'étape initiale).",
      "Test décisif : Est-ce qu'un outil autorisé répond au besoin ? (Si OUI ➔ Accompagnement, si NON ➔ Faisabilité et risques d'entreprise)."
    ],
    tool: "Grille_faisabilite_cas_usage_IA.xlsx (Axe 1 Valeur)",
    fileLink: "documents_phases/Etape_1_Qualification/Grille_faisabilite_cas_usage_IA.xlsx"
  },
  {
    subStep: 2,
    id: "accompagnement",
    title: "1.2 Demande d'accompagnement",
    shortTitle: "Accompagnement",
    actor: "Bureau de l'IA (Métier) ou Équipe TI (Technique)",
    camPos: { x: -2.0, y: 22.0, z: 7.5 },
    camTarget: { x: -0.5, y: 21.0, z: -3.0 },
    speech: "Deuxième sous-étape : la Demande d'accompagnement. Elle est accessible dès le début à l'étape zéro ! En intelligence artificielle, notre règle d'or chez Investissement Québec est de mettre le focus sur le cas d'usage en premier. Si votre besoin concerne un problème métier ou une opportunité d'affaires, le Bureau de l'IA et l'Escouade IA vous accompagnent en atelier de cadrage et en formation. Si votre demande est purement technique ou concerne une licence logicielle, l'équipe TI prend le relais.",
    summary: "Parcours d'accompagnement dédié : focus sur le cas d'usage en premier (Bureau de l'IA) ou volet technique/licences (TI).",
    actions: [
      "Point d'entrée accessible DÈS LE DÉBUT (Étape 0) via la question : 'Est-ce une demande d'accompagnement ?'",
      "Option Métier (Bureau de l'IA & Escouade IA) : Cadrage du problème d'affaires, Design Thinking IA, formations.",
      "Option Technique (Équipe TI) : Faisabilité technique de connectivité, architecture logicielle, licences Octopus.",
      "Réorientation immédiate vers les outils autorisés (Copilot M365, Claude Enterprise) pour éviter tout achat superflu."
    ],
    tool: "Guichet d'Accompagnement IA (Métier / TI)",
    fileLink: "documents_phases/Etape_1_Qualification/Arbre_Decision_Outils_Homologues_vs_Nouveaux.xlsx"
  },
  {
    subStep: 3,
    id: "faisabilite_risques",
    title: "1.3 Analyse de la faisabilité et des risques d'entreprise",
    shortTitle: "Faisabilité & Risques",
    actor: "Bureau de l'IA & Risques (DGIR)",
    camPos: { x: 3.5, y: 22.5, z: 8.5 },
    camTarget: { x: 0.5, y: 20.8, z: -2.5 },
    speech: "Troisième sous-étape : l'Analyse de la faisabilité et des risques d'entreprise. Lorsqu'aucun outil autorisé existant ne suffit, nous évaluons la faisabilité autre que technique : la maturité opérationnelle des équipes, la disponibilité des compétences et la capacité de gestion du changement, tout en évaluant les risques d'entreprise du cas d'usage. Si l'évaluation n'est pas concluante, le projet est rejeté. Si elle est concluante, nous passons à la sélection de l'outil et à l'architecture préliminaire.",
    summary: "Évaluation de la faisabilité organisationnelle, opérationnelle et des risques d'entreprise du cas d'usage.",
    actions: [
      "Évaluation de la faisabilité (autre que technique) : processus métiers, compétences, gestion du changement.",
      "Évaluation des risques d'entreprise et impacts organisationnels du cas d'usage.",
      "Porte de décision : Évaluation concluante ? (Si NON ➔ Rejet du cas d'usage, si OUI ➔ Passage à la sélection d'outil et architecture préliminaire)."
    ],
    tool: "Grille d'Évaluation Faisabilité & Risques d'Entreprise",
    fileLink: "documents_phases/Etape_1_Qualification/Grille_evaluation_cas_usage.xlsx"
  },
  {
    subStep: 4,
    id: "veille_selection_outil",
    title: "1.4 Veille, sélection d'outil et architecture préliminaire",
    shortTitle: "Sélection & Architecture",
    actor: "Architectes TI & Bureau de l'IA",
    camPos: { x: 7.0, y: 22.5, z: 9.5 },
    camTarget: { x: 1.5, y: 21.0, z: -2.5 },
    speech: "Quatrième sous-étape : la Veille technologique, la sélection d'outil et l'architecture préliminaire. C'est ici que nos architectes et experts sélectionnent l'outil approprié, qu'il s'agisse d'une solution interne ou d'une technologie externe du marché. Surtout, nous concevons immédiatement une architecture préliminaire de la solution : flux de données, interfaces, connecteurs et modèle d'hébergement. Ce schéma d'architecture est indispensable pour permettre à la cellule de cybersécurité, de la Loi 25 et de la DGIR d'évaluer rigoureusement les risques au deuxième étage !",
    summary: "Sélection de l'outil IA (interne/externe) et conception de l'architecture préliminaire de solution pour l'évaluation des risques.",
    actions: [
      "Sélection et comparaison de l'outil IA (solutions internes vs outils spécialisés du marché).",
      "Élaboration du schéma d'architecture préliminaire : flux de données, connecteurs, hébergement et interfaces.",
      "Transmission du dossier technique complet à la Cellule d'Expertise Matricielle pour l'évaluation des risques au deuxième étage."
    ],
    tool: "Schéma d'Architecture Préliminaire & Évaluation Fournisseur",
    fileLink: "documents_phases/Etape_1_Qualification/Grille_Evaluation_Valeur_Faisabilite_Bureau_IA.xlsx"
  }
];

// ============================================================================
// CONTRÔLES CINÉMATIQUES DU MODE IMMERSION SALLE DU BUREAU DE L'IA
// ============================================================================
IQ_TOWER.roomSubStepIndex = 0;
IQ_TOWER.roomAutoTourActive = false;
IQ_TOWER.roomAutoTourTimer = null;

window.goToRoomSubStep = function(stepIdx) {
  if (stepIdx < 0 || stepIdx >= BUREAU_IA_WORK_STEPS.length) return;
  IQ_TOWER.roomSubStepIndex = stepIdx;
  const sub = BUREAU_IA_WORK_STEPS[stepIdx];

  // 1. Mise à jour des boutons stepper
  for (let i = 0; i < 4; i++) {
    const pill = document.getElementById(`btn-substep-${i + 1}`);
    if (pill) pill.classList.toggle('active', i === stepIdx);
  }

  // 2. Déplacement caméra cinématique GSAP
  if (window.gsap && IQ_TOWER.camera && IQ_TOWER.controls) {
    gsap.killTweensOf(IQ_TOWER.camera.position);
    gsap.killTweensOf(IQ_TOWER.controls.target);
    gsap.to(IQ_TOWER.camera.position, {
      x: sub.camPos.x,
      y: sub.camPos.y,
      z: sub.camPos.z,
      duration: 1.8,
      ease: "power2.inOut"
    });
    gsap.to(IQ_TOWER.controls.target, {
      x: sub.camTarget.x,
      y: sub.camTarget.y,
      z: sub.camTarget.z,
      duration: 1.8,
      ease: "power2.inOut"
    });
  }

  if (IQ_TOWER.soundEnabled) {
    playElevatorChime();
  }

  // 3. Mise à jour du volet narratif avec l'étape active
  updateNarrativePanel(SLIDE8_LIFECYCLE[1]);

  // Notification d'état en temps réel pour le Copilot IA
  if (window.updateCopilotStateBadge) window.updateCopilotStateBadge();

  // 4. Programmation du passage automatique à la sous-étape suivante si auto-tour non-mentor actif
  clearTimeout(IQ_TOWER.roomAutoTourTimer);
  if (IQ_TOWER.roomAutoTourActive && IQ_TOWER.isInsideRoom && !window.MENTOR_GUIDED_TOUR_ACTIVE) {
    IQ_TOWER.roomAutoTourTimer = setTimeout(() => {
      if (IQ_TOWER.isInsideRoom && IQ_TOWER.roomAutoTourActive && !window.MENTOR_GUIDED_TOUR_ACTIVE) {
        const nextIdx = (IQ_TOWER.roomSubStepIndex + 1) % BUREAU_IA_WORK_STEPS.length;
        window.goToRoomSubStep(nextIdx);
      }
    }, 7500);
  }
};

window.toggleRoomTour = function() {
  IQ_TOWER.roomAutoTourActive = !IQ_TOWER.roomAutoTourActive;
  const btn = document.getElementById('btn-room-tour-toggle');
  const icon = document.getElementById('room-tour-icon');
  const text = document.getElementById('room-tour-text');
  
  if (btn) btn.classList.toggle('paused', !IQ_TOWER.roomAutoTourActive);
  if (icon) icon.innerText = IQ_TOWER.roomAutoTourActive ? '⏸' : '▶';
  if (text) text.innerText = IQ_TOWER.roomAutoTourActive ? 'Auto' : 'Pause';

  if (IQ_TOWER.roomAutoTourActive) {
    window.goToRoomSubStep(IQ_TOWER.roomSubStepIndex);
  } else {
    clearTimeout(IQ_TOWER.roomAutoTourTimer);
  }
};

window.enterBureauRoom = function() {
  IQ_TOWER.isInsideRoom = true;
  IQ_TOWER.roomAutoTourActive = false; // Mode manuel par défaut pour ne pas brusquer l'utilisateur

  // Tuer immédiatement tout tween de caméra extérieur concurrent pour éviter les à-coups
  if (window.gsap && IQ_TOWER.camera && IQ_TOWER.controls) {
    gsap.killTweensOf(IQ_TOWER.camera.position);
    gsap.killTweensOf(IQ_TOWER.controls.target);
  }

  // 1. Masquer la façade vitrée de l'étage 1 pour une vision intérieure 100% dégagée
  if (IQ_TOWER.floors[1] && IQ_TOWER.floors[1].userData && IQ_TOWER.floors[1].userData.frontGlass) {
    IQ_TOWER.floors[1].userData.frontGlass.visible = false;
  }

  // 2. Afficher la barre de mode immersion
  const roomBar = document.getElementById('immersion-room-bar');
  if (roomBar) roomBar.classList.remove('hidden');

  const btn = document.getElementById('btn-room-tour-toggle');
  const icon = document.getElementById('room-tour-icon');
  const text = document.getElementById('room-tour-text');
  if (btn) btn.classList.toggle('paused', !IQ_TOWER.roomAutoTourActive);
  if (icon) icon.innerText = IQ_TOWER.roomAutoTourActive ? '⏸' : '▶';
  if (text) text.innerText = IQ_TOWER.roomAutoTourActive ? 'Auto' : 'Guide';

  // 3. Lancer la visite guidée à la sous-étape 0 (1.1 Triage)
  window.goToRoomSubStep(0);
  if (window.updateCopilotStateBadge) window.updateCopilotStateBadge();
};

window.exitBureauRoom = function() {
  IQ_TOWER.isInsideRoom = false;
  IQ_TOWER.roomAutoTourActive = false;
  clearTimeout(IQ_TOWER.roomAutoTourTimer);

  // 1. Rétablir la visibilité normale de la façade vitrée
  if (IQ_TOWER.floors[1] && IQ_TOWER.floors[1].userData && IQ_TOWER.floors[1].userData.frontGlass) {
    IQ_TOWER.floors[1].userData.frontGlass.visible = true;
    IQ_TOWER.floors[1].userData.frontGlass.material.opacity = 0.22;
  }

  // 2. Masquer la barre d'immersion
  const roomBar = document.getElementById('immersion-room-bar');
  if (roomBar) roomBar.classList.add('hidden');

  // 3. Dézoom cinématique vers la vue extérieure de l'étage
  const data = SLIDE8_LIFECYCLE[1];
  if (window.gsap) {
    gsap.to(IQ_TOWER.camera.position, {
      x: 35,
      y: data.camY,
      z: 42,
      duration: 1.8,
      ease: "power2.inOut"
    });
    gsap.to(IQ_TOWER.controls.target, {
      x: 0,
      y: data.camY - 2,
      z: 0,
      duration: 1.8,
      ease: "power2.inOut"
    });
  }

  // 4. Mettre à jour le volet narratif standard
  updateNarrativePanel(SLIDE8_LIFECYCLE[1]);
  if (window.updateCopilotStateBadge) window.updateCopilotStateBadge();
};

// ============================================================================
// AUDIO WEB AUDIO API : EFFETS SONORES RÉALISTES D'ASCENSEUR
// ============================================================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playElevatorChime() {
  if (!IQ_TOWER.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Fréquence 1 (note fondamentale de la cloche d'ascenseur)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // Mi (E5)
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Fréquence 2 (harmonique supérieure pour le "Ding !")
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12); // Do (C6)
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.6);
  } catch (e) {
    console.warn("Audio Context init error:", e);
  }
}

// ============================================================================
// L'ASCENSEUR PANORAMIQUE HAUTE TECHNOLOGIE : L'INITIATIVE IA EN TRANSIT
// ============================================================================
function buildPanoramicElevator() {
  const totalH = 125;
  const colX = -23.5;
  const colZ = 0;

  // 1. Colonne de guidage vitrée panoramique
  const glassShaftMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
    side: THREE.DoubleSide
  });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(5.2, totalH, 5.2), glassShaftMat);
  shaft.position.set(colX, totalH / 2, colZ);
  IQ_TOWER.scene.add(shaft);

  // Montants métalliques d'angle de la colonne
  const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
  [-2.5, 2.5].forEach(dx => {
    [-2.5, 2.5].forEach(dz => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, totalH, 8), postMat);
      post.position.set(colX + dx, totalH / 2, colZ + dz);
      IQ_TOWER.scene.add(post);
    });
  });

  // Anneaux de séparation d'étages sur la colonne
  SLIDE8_LIFECYCLE.forEach(s => {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), postMat);
    ring.position.set(colX, s.yPos + 0.2, colZ);
    IQ_TOWER.scene.add(ring);
  });

  // 2. Cabine d'ascenseur haute précision "Initiative IA"
  const cabinGroup = new THREE.Group();

  // Plancher et Plafond métalliques laqués
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.15 });
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 4.8), frameMat);
  floorMesh.position.y = -3.2;
  cabinGroup.add(floorMesh);

  const ceilingMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), frameMat);
  ceilingMesh.position.y = 3.2;
  cabinGroup.add(ceilingMesh);

  // Parois vitrées de la cabine
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.45,
    side: THREE.DoubleSide
  });
  const glassWalls = new THREE.Mesh(new THREE.BoxGeometry(4.6, 6.0, 4.6), cabinGlassMat);
  cabinGroup.add(glassWalls);

  // Profilés d'angle dorés/cuivrés de prestige
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.9, roughness: 0.2 });
  [-2.3, 2.3].forEach(dx => {
    [-2.3, 2.3].forEach(dz => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.4, 0.18), goldTrimMat);
      trim.position.set(dx, 0, dz);
      cabinGroup.add(trim);
    });
  });

  // Fronton LED digital d'ascenseur (écran 3D)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256;
  screenCanvas.height = 64;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  IQ_TOWER.elevatorScreenTexture = screenTex;
  updateElevatorScreenTexture(0);

  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.8), screenMat);
  screenMesh.position.set(0, 3.4, 2.42);
  cabinGroup.add(screenMesh);

  // 3. LE DOSSIER D'INITIATIVE IA HOLOGRAPHIQUE (AU CENTRE DE LA CABINE)
  const holoGroup = new THREE.Group();
  
  // Socle de projection holographique
  const holoPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 16), frameMat);
  holoPedestal.position.y = -2.6;
  holoGroup.add(holoPedestal);

  // Orbe / Cube de données de l'initiative IA
  const dataCoreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8
  });
  const dataCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), dataCoreMat);
  dataCore.position.y = -1.2;
  holoGroup.add(dataCore);

  // Anneaux gyroscopiques dorés en orbite
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 8, 32), goldTrimMat);
  ring1.position.y = -1.2;
  ring1.rotation.x = Math.PI / 3;
  holoGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.03, 8, 32), goldTrimMat);
  ring2.position.y = -1.2;
  ring2.rotation.y = Math.PI / 4;
  holoGroup.add(ring2);

  holoGroup.userData = { dataCore, ring1, ring2 };
  cabinGroup.add(holoGroup);
  IQ_TOWER.elevatorHoloData = holoGroup;

  // Passagers représentatifs dans la cabine (Demandeur + Analyste IA)
  createHumanCharacter(cabinGroup, -1.2, -1.8, -0.8, 0x1e3a8a, "Demandeur");
  createHumanCharacter(cabinGroup, 1.2, -1.8, -0.8, 0x0284c7, "Bureau IA");

  // Plafonnier lumineux indicateur de statut
  const pLight = new THREE.PointLight(0x38bdf8, 2.8, 14);
  pLight.position.set(0, 2.6, 0);
  cabinGroup.add(pLight);
  IQ_TOWER.elevatorLight = pLight;

  // Position initiale de la cabine au rez-de-chaussée
  cabinGroup.position.set(colX, 5, colZ);
  IQ_TOWER.scene.add(cabinGroup);
  IQ_TOWER.elevatorCabin = cabinGroup;

  // 4. Contrepoids mécanique réaliste (se déplace en sens inverse)
  const counterweight = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 4.0, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
  );
  counterweight.position.set(colX - 3.2, totalH - 5, colZ);
  IQ_TOWER.scene.add(counterweight);
  IQ_TOWER.elevatorCounterweight = counterweight;

  // 5. Câbles de suspension en acier
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, totalH, 8), cableMat);
  cable.position.set(colX, totalH / 2, colZ);
  IQ_TOWER.scene.add(cable);
}

// Mise à jour du canvas de texture de l'écran d'ascenseur 3D
function updateElevatorScreenTexture(stepIndex) {
  if (!IQ_TOWER.elevatorScreenTexture) return;
  const canvas = IQ_TOWER.elevatorScreenTexture.image;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`ETAGE ${stepIndex} ▲`, 12, 38);

  const stepNames = ["DEMANDE OCTOPUS", "QUALIFICATION", "RISQUES & PRP", "ARBITRAGE GO", "PILOTE ESCOUADE", "DEPLOIEMENT TI", "EXPLOITATION CONTINUE"];
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(stepNames[stepIndex] || "INITIATIVE IA", 124, 37);

  IQ_TOWER.elevatorScreenTexture.needsUpdate = true;
}

// ============================================================================
// NAVIGATION DU CYCLE DE VIE DES INITIATIVES IA
// ============================================================================
function goToLifecycleStep(stepIndex, autoOpenVideo = false, skipCameraTween = false) {
  if (stepIndex < 0 || stepIndex >= SLIDE8_LIFECYCLE.length) return;

  if (IQ_TOWER.isInsideRoom && stepIndex !== 1) {
    exitBureauRoom();
  }

  IQ_TOWER.currentStepIndex = stepIndex;
  const data = SLIDE8_LIFECYCLE[stepIndex];

  // 1. Déplacement physique de l'ascenseur (L'Initiative IA qui monte)
  if (IQ_TOWER.elevatorCabin && window.gsap) {
    const targetElevatorX = (data.elevatorX !== undefined) ? data.elevatorX : -23.5;
    gsap.to(IQ_TOWER.elevatorCabin.position, {
      x: targetElevatorX,
      y: data.elevatorY,
      duration: 1.8,
      ease: "power2.inOut",
      onComplete: () => {
        playElevatorChime();
      }
    });

    // Déplacement symétrique du contrepoids
    if (IQ_TOWER.elevatorCounterweight) {
      const totalH = 125;
      gsap.to(IQ_TOWER.elevatorCounterweight.position, {
        y: totalH - data.elevatorY + 5,
        duration: 1.8,
        ease: "power2.inOut"
      });
    }

    // Teinte de la lumière et du cœur holographique selon la responsabilité officielle
    if (IQ_TOWER.elevatorLight) {
      IQ_TOWER.elevatorLight.color.set(data.color);
    }

    if (IQ_TOWER.elevatorHoloData && IQ_TOWER.elevatorHoloData.userData.dataCore) {
      IQ_TOWER.elevatorHoloData.userData.dataCore.material.color.set(data.color);
      IQ_TOWER.elevatorHoloData.userData.dataCore.material.emissive.set(data.color);
    }

    // Mise à jour de l'écran LED 3D de la cabine
    updateElevatorScreenTexture(stepIndex);
  }

  // 1.B. Animation de la Navette d'Homologation sur la Passerelle Technologique
  if (IQ_TOWER.skybridgePod && window.gsap) {
    if (stepIndex >= 5) {
      // Franchissement de la passerelle vers le Building des TI
      gsap.to(IQ_TOWER.skybridgePod.position, {
        x: 54,
        duration: 2.2,
        ease: "power2.inOut"
      });
    } else {
      // En attente du côté Tour Bureau de l'IA
      gsap.to(IQ_TOWER.skybridgePod.position, {
        x: 22,
        duration: 1.8,
        ease: "power2.inOut"
      });
    }
  }

  // 2. Travelling caméra fluide cadrant parfaitement l'étage ET la cabine d'ascenseur (toujours visible sur la gauche)
  if (!skipCameraTween && window.gsap && IQ_TOWER.camera && IQ_TOWER.controls) {
    gsap.killTweensOf(IQ_TOWER.camera.position);
    gsap.killTweensOf(IQ_TOWER.controls.target);
    const isMobile = window.innerWidth <= 860;
    const isTI = (data.step >= 5);
    let targetCamX, targetCamY, targetCamZ, targetLookX, targetLookY, targetLookZ;

    if (isMobile) {
      // Sur mobile portrait : recul Z élargi (z: 82) et décalage du point de mire (x: -10)
      // pour que la cage d'ascenseur à x: -23.5 ET les vitrages soient 100% dans l'écran
      targetCamX = isTI ? 68 : 36;
      targetCamY = isTI ? (data.elevatorY + 6) : (data.camY + 3);
      targetCamZ = isTI ? 75 : 82;
      targetLookX = isTI ? 46 : -10;
      targetLookY = isTI ? data.elevatorY : (data.camY - 1);
      targetLookZ = 0;
    } else {
      // Sur desktop : cadrage panoramique confortable avec l'ascenseur à gauche
      targetCamX = isTI ? 65 : 36;
      targetCamY = isTI ? (data.elevatorY + 5) : data.camY;
      targetCamZ = isTI ? 55 : 54;
      targetLookX = isTI ? 45 : -6;
      targetLookY = isTI ? data.elevatorY : (data.camY - 2);
      targetLookZ = 0;
    }

    gsap.to(IQ_TOWER.camera.position, {
      x: targetCamX,
      y: targetCamY,
      z: targetCamZ,
      duration: 2.2,
      ease: "power2.inOut"
    });

    gsap.to(IQ_TOWER.controls.target, {
      x: targetLookX,
      y: targetLookY,
      z: targetLookZ,
      duration: 2.2,
      ease: "power2.inOut"
    });
  }

  // 3. Mise à jour de l'afficheur LED latéral du pupitre et de la pilule mobile
  const ledFloor = document.getElementById('led-floor-num');
  const ledStep = document.getElementById('led-step-name');
  if (ledFloor) ledFloor.innerText = data.step;
  if (ledStep) {
    const ledTitles = ["DÉPÔT OCTOPUS", "QUALIFICATION", "RISQUES & PRP", "ARBITRAGE GO", "PILOTE ESCOUADE", "DÉPLOIEMENT", "EXPLOITATION TI"];
    ledStep.innerText = ledTitles[data.step] || data.title.toUpperCase();
  }

  const mobileFloorNum = document.getElementById('mobile-floor-num');
  const mobileFloorTitle = document.getElementById('mobile-floor-title');
  if (mobileFloorNum) mobileFloorNum.innerText = data.step;
  if (mobileFloorTitle) mobileFloorTitle.innerText = `${data.step}. ${data.title}`;

  // 4. Mise à jour de la bannière Hero
  updateHeroBanner(data);

  // 5. Mise à jour du panneau narratif officiel Slide 8 (avec Octopus & 3 Parcours au jalon 0)
  updateNarrativePanel(data);

  // 6. Mise à jour des boutons d'ascenseur latéraux
  document.querySelectorAll('.elevator-floor-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.step, 10) === data.step);
  });

  // 7. Mise à jour du tableau de bord exécutif officiel (les 7 colonnes de la Slide 8)
  document.querySelectorAll('.slide8-card-col').forEach(card => {
    const cardStep = parseInt(card.dataset.step, 10);
    const isActive = (cardStep === data.step);
    card.classList.toggle('active', isActive);

    const flag = card.querySelector('.card-status-flag');
    if (flag) {
      if (cardStep < data.step) {
        flag.innerText = "✓ JALON FRANCHI";
        flag.style.color = "#10b981";
      } else if (cardStep === data.step) {
        flag.innerText = "★ EN TRANSIT DANS L'ASCENSEUR";
        flag.style.color = "#0284c7";
      } else {
        flag.innerText = "EN ATTENTE D'ASCENSION";
        flag.style.color = "#94a3b8";
      }
    }
  });

  const activeBadge = document.getElementById('active-step-badge');
  if (activeBadge) {
    activeBadge.innerText = `Jalon Actif : ${data.step} • ${data.title}`;
  }

  // 8. Lancement automatique de la capsule vidéo Synthesia en haut de la page uniquement si explicitement demandé
  if (autoOpenVideo && IQ_TOWER.autoPlayVideo && window.openSynthesiaVideo) {
    window.openSynthesiaVideo(data.step, null, true);
  }

  // 9. Notification temps réel pour le Copilot IA
  if (window.updateCopilotStateBadge) {
    window.updateCopilotStateBadge();
  }

  // 10. Annonces spécifiques du Coach IA lors du transfert vers le Building des TI
  if (stepIndex === 5 && window.showCoachSpeech) {
    const coachMsg = `🚀 <strong>Jalon 5 — Déploiement en Production</strong>.

L'expérimentation en laboratoire est validée. Deux voies s'ouvrent selon la nature du projet.

• <strong>Appel d'offres.</strong> Les résultats alimentent le Dossier d'opportunité officiel pour acquérir une solution sur le marché.
• <strong>Qualité Production TI.</strong> Les architectes des TI conçoivent l'infrastructure cible (haute disponibilité, cybersécurité, intégration aux systèmes maîtres).

L'homologation formelle est rendue avec l'évaluation des facteurs relatifs à la vie privée.`;
    window.showCoachSpeech(coachMsg, [
      { label: "📡 Vigie en continu (Jalon 6)", action: { type: "NAVIGATE_STEP", step: 6 } },
      { label: "🏢 Revoir POC (Jalon 4)", action: { type: "NAVIGATE_STEP", step: 4 } }
    ]);
  } else if (stepIndex === 6 && window.showCoachSpeech) {
    const coachMsg = `📡 <strong>Jalon 6 — Exploitation & Surveillance en continu</strong>.

Nous voici au sommet du Bâtiment des TI. La Direction des TI assure le maintien en condition opérationnelle permanent, la détection des dérives algorithmiques et la tenue du Registre officiel des actifs IA.

⚡ <strong>Formulaire automatisé d'évaluation :</strong>
Vous pouvez dès maintenant compléter une <strong>demande d'analyse d'initiative</strong> supportée par l'intelligence artificielle et validée par l'expertise humaine, ce qui accélère notre processus d'évaluation de <strong>3 jours à seulement 3 minutes</strong> !`;
    window.showCoachSpeech(coachMsg, [
      { label: "📝 Demande d'analyse (3 min)", action: { type: "OPEN_EVALUATION" } },
      { label: "🏢 Vue d'ensemble des 2 Tours", action: { type: "PANORAMA_VIEW" } },
      { label: "💬 Clavardage", action: { type: "OPEN_CHAT" } },
      { label: "🏢 Retour Accueil Bureau IA", action: { type: "NAVIGATE_STEP", step: 0 } }
    ]);
  }
}
window.goToLifecycleStep = goToLifecycleStep;

function updateHeroBanner(data) {
  const numCircle = document.getElementById('hero-num');
  if (numCircle) {
    numCircle.innerText = data.step;
    numCircle.className = `hero-num-circle resp-${data.respType}`;
  }

  const heroTag = document.getElementById('hero-tag');
  if (heroTag) heroTag.innerText = `CYCLE DE VIE IA • JALON ${data.step}`;

  const heroName = document.getElementById('hero-name');
  if (heroName) heroName.innerText = `${data.step}. ${data.title}`;

  const heroRole = document.getElementById('hero-role');
  if (heroRole) heroRole.innerText = `${data.floorName} — ${data.actor}`;
}

function getStepActionDetails(step) {
  switch (step) {
    case 1:
      return "Le Bureau de l'IA analyse l'adéquation stratégique et applique l'arbre de décision officiel : vérification de la valeur métier et de la faisabilité, et contrôle si un outil déjà autorisé à IQ répond au besoin avant de concevoir une nouvelle solution.";
    case 2:
      return "Mobilisation des experts matriciels d'IQ : Cybersécurité, Protection des renseignements personnels (évaluation des facteurs relatifs à la vie privée sous la Loi 25) et respect des 11 risques de gouvernance DGIR 2026. Priorisation objective comparant le projet à une solution idéale prête (données, sécurité et IA) pour éliminer les faux positifs.";
    case 3:
      return "Approbation formelle selon les 3 seuils de risque :<br>• <strong>🟢 Risque faible :</strong> GO immédiat ordonnancé par le Bureau IA.<br>• <strong>🟡 Risque modéré :</strong> Décision au Comité de Gouvernance IA (8-10x/an).<br>• <strong>🔴 Risque élevé :</strong> Approbation au Comité de Direction (PDG et PVPs, 4x/an).";
    case 4:
      return "Développement agile d'une preuve de concept (POC) en environnement infonuagique sécurisé et isolé avec l'Escouade IA. Mesure concrète de la valeur d'affaires, bilan des risques réels et application de la règle du <em>Fail Fast</em>.";
    case 5:
      return "Mise en production sécurisée par les TI. Intégration des réseaux, adoption utilisateurs et plans d'accompagnement pilotés avec les métiers. Deux voies possibles : Appel d'offres officiel ou Architecture Qualité Production TI.";
    case 6:
      return "Exploitation continue et surveillance permanente par les équipes TI. Surveillance des indicateurs clés de performance et de risque (KRIs), maintien en condition opérationnelle, gestion des incidents et veille sur la dérive des modèles IA.";
    default:
      return "";
  }
}

function updateNarrativePanel(data) {
  const panelResp = document.getElementById('panel-resp-tag');
  if (panelResp) panelResp.innerText = `ÉTAPE ${data.step} / 6 • ${data.respLabel.toUpperCase()}`;

  const panelTitle = document.getElementById('panel-title');
  if (panelTitle) panelTitle.innerText = `${data.step}. ${data.title}`;

  const panelSubtitle = document.getElementById('panel-subtitle');
  if (panelSubtitle) panelSubtitle.innerText = `${data.instance} (${data.floorName.split(':')[0]})`;

  // 1. Carte Résumé Exécutif
  let bodyHtml = `
    <div class="panel-step-hero-card">
      <div class="panel-hero-num resp-${data.respType}">${data.step}</div>
      <div class="panel-hero-meta">
        <div class="panel-hero-actor">👤 Responsable : ${data.actor}</div>
        <div class="panel-hero-desc"><strong>Mission :</strong> ${data.summary}</div>
      </div>
    </div>
  `;

  // 2. Critères d'avancement & Décisions pour le gestionnaire
  if (data.criteria && data.criteria.length > 0) {
    bodyHtml += `
      <div class="panel-details-block">
        <div style="font-weight: 800; font-size: 11px; color: #1e3a8a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Points d'Arbitrage & Critères Clés :</div>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.5; font-size: 11px; color: #334155;">
          ${data.criteria.map(c => `<li style="margin-bottom: 4px;">${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Cas particulier Jalon 1 : Immersion dans le Bureau de l'IA & Salle de Réunion (Slide 9)
  if (data.step === 1) {
    if (!IQ_TOWER.isInsideRoom) {
      bodyHtml += `
        <div style="margin: 10px 0;">
          <button class="btn-enter-room-action" onclick="enterBureauRoom('overview')">
            <span>🚪</span>
            <span>Zoom Immersion : Entrer dans la Salle du Bureau de l'IA</span>
          </button>
          <div style="font-size: 10px; color: #64748b; text-align: center; margin-top: 4px;">
            Explorez en 3D la séance d'analyse, l'arbre de décision et le Smart Board Slide 9.
          </div>
        </div>
      `;
    } else {
      const curSubStep = BUREAU_IA_WORK_STEPS[IQ_TOWER.roomSubStepIndex || 0];
      bodyHtml += `
        <div class="substep-narrative-card">
          <div class="substep-card-header">
            <span class="substep-num-badge">SOUS-ÉTAPE ${curSubStep.subStep} / 4</span>
            <span class="substep-actor-label">👤 ${curSubStep.actor}</span>
          </div>
          <div class="substep-card-title">${curSubStep.title}</div>
          <div class="substep-card-desc"><strong>Mission :</strong> ${curSubStep.summary}</div>

          <div style="font-weight: 800; font-size: 10px; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">⚡ Actions concrètes du Bureau de l'IA :</div>
          <ul class="substep-actions-list">
            ${curSubStep.actions.map(a => `<li>${a}</li>`).join('')}
          </ul>

          <div style="font-weight: 800; font-size: 10px; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">📁 Outil & Gabarit Excel Associé :</div>
          <a href="${encodeURI(curSubStep.fileLink)}" target="_blank" class="substep-tool-link-card" title="Ouvrir le fichier dans Excel">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">📊</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${curSubStep.tool}</span>
                <span style="font-size: 9px; color: #0284c7; font-family: monospace;">${curSubStep.fileLink.split('/').pop()}</span>
              </div>
            </div>
            <span style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 3px 7px; border-radius: 4px; font-weight: 800;">OUVRIR .XLSX</span>
          </a>

          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button onclick="goToRoomSubStep(${((IQ_TOWER.roomSubStepIndex || 0) - 1 + 4) % 4})" style="flex: 1; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              ◀ Précédent
            </button>
            <button onclick="goToRoomSubStep(${((IQ_TOWER.roomSubStepIndex || 0) + 1) % 4})" style="flex: 1; background: #0284c7; color: #ffffff; border: none; border-radius: 6px; padding: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              Suivant ▶
            </button>
          </div>

          <button class="btn-enter-room-action" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-color: #f87171; margin-top: 8px;" onclick="exitBureauRoom()">
            <span>⬅️</span>
            <span>Sortir de la Salle (Vue Tour)</span>
          </button>
        </div>
      `;
    }
  }

  // 3. Cas particulier Jalon 0 : Guichet Octopus & Les 3 Parcours
  if (data.step === 0) {
    bodyHtml += `
      <div class="panel-octopus-container">
        <div class="octopus-badge-row">
          <span style="font-size: 11px; font-weight: 800; color: #0f172a;">🛠️ Guichet Octopus d'Investissement Québec</span>
          <span class="octopus-tag-pill">3 PARCOURS</span>
        </div>
        <p style="font-size: 11px; color: #475569; margin-bottom: 8px;">
          Toute demande débute par une <strong>Requête Octopus</strong>. Choisissez le parcours :
        </p>

        <div class="octopus-paths-nav">
          <!-- Parcours 1 -->
          <div class="octopus-path-item ${IQ_TOWER.selectedOctopusPath === 1 ? 'active' : ''}" onclick="selectOctopusPath(1)">
            <div class="path-item-head">
              <span class="path-item-title">🛍️ Parcours 1 : Achat Logiciel TI</span>
              <span class="path-item-badge ti">Équipe TI</span>
            </div>
            <div class="path-item-desc">Acquisition d'un nouvel outil externe avec composante IA (processus d'achat TI).</div>
            <div class="path-item-route">➔ Prise en charge Équipe TI (Octopus)</div>
          </div>

          <!-- Parcours 2 -->
          <div class="octopus-path-item ${IQ_TOWER.selectedOctopusPath === 2 ? 'active' : ''}" onclick="selectOctopusPath(2)">
            <div class="path-item-head">
              <span class="path-item-title">🎫 Parcours 2 : Demandes de Licences IA</span>
              <span class="path-item-badge support">Support TI</span>
            </div>
            <div class="path-item-desc">Attribution d'outils pré-approuvés (Copilot M365, Claude Enterprise, etc.).</div>
            <div class="path-item-route">➔ Billets Support TI</div>
          </div>

          <!-- Parcours 3 -->
          <div class="octopus-path-item ${IQ_TOWER.selectedOctopusPath === 3 ? 'active' : ''}" onclick="selectOctopusPath(3)">
            <div class="path-item-head">
              <span class="path-item-title">💡 Parcours 3 : Cas d'Usage Métier IA</span>
              <span class="path-item-badge bureau">Bureau IA</span>
            </div>
            <div class="path-item-desc">Projet d'innovation, cadrage Escouade IA, POC. <strong>Prend l'ascenseur du cycle de vie dans la Tour (Étapes 0 à 6) !</strong></div>
            <div class="path-item-route active-route">✓ Sélectionné dans l'Ascenseur de la Tour</div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Section Fichiers Word, Excel et Outils Officiels de l'étape (Chargement dynamique)
  let stageFiles = data.files || [];
  if (window.PHASE_DOCUMENTS_MANIFEST && window.PHASE_DOCUMENTS_MANIFEST[data.step]) {
    const manifestPhase = window.PHASE_DOCUMENTS_MANIFEST[data.step];
    if (manifestPhase.files && manifestPhase.files.length > 0) {
      stageFiles = manifestPhase.files;
    }
  }

  if (stageFiles && stageFiles.length > 0) {
    bodyHtml += `
      <div class="panel-files-section">
        <div class="files-section-head">
          <span>📁 Gabarits & Outils Excel/Word Officiels</span>
          <span style="font-size: 9px; color: #0284c7; font-weight: 700;">documents_phases/Etape_${data.step}...</span>
        </div>
        <div class="panel-files-list">
          ${stageFiles.map(f => `
            <a href="${encodeURI(f.path)}" target="_blank" class="file-link-card" title="Ouvrir ${f.name} — ${f.desc || ''}">
              <div class="file-left-meta">
                <span class="file-icon-box ${f.type}">
                  ${f.type === 'word' ? '📄' : f.type === 'excel' ? '📊' : '🌐'}
                </span>
                <div style="display: flex; flex-direction: column;">
                  <span class="file-title-text">${f.label}</span>
                  ${f.desc ? `<span style="font-size: 9.5px; color: #64748b; line-height: 1.2; margin-top: 2px;">${f.desc}</span>` : ''}
                </div>
              </div>
              <span class="file-tag-badge">${f.type === 'word' ? '.DOCX' : f.type === 'excel' ? '.XLSX' : '.HTML'}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 5. Bouton Capsule Vidéo uniquement pour le Jalon 0 (seule capsule officielle disponible pour l'instant)
  if (data.step === 0) {
    bodyHtml += `
      <div style="margin: 10px 0;">
        <button class="btn-synthesia-open" onclick="openSynthesiaVideo(0, null)">
          <span>🎬</span>
          <span>Visionner la Capsule Vidéo Officielle (Rez-de-chaussée)</span>
        </button>
      </div>
    `;
  }

  // 5.2 Bloc spécifique Jalon 6 : Accès direct au Formulaire d'Évaluation Automatisé (3 jours à 3 minutes)
  if (data.step === 6) {
    bodyHtml += `
      <div style="margin: 12px 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1.5px solid #22c55e; border-radius: 10px; padding: 12px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <strong style="font-size: 11.5px; color: #14532d; display: flex; align-items: center; gap: 5px;">
            <span>⚡</span>
            <span>Formulaire d'Évaluation Automatisé</span>
          </strong>
          <span style="font-size: 9.5px; font-weight: 800; background: #16a34a; color: #ffffff; padding: 2px 7px; border-radius: 4px;">3 JOURS ➔ 3 MIN</span>
        </div>
        <p style="font-size: 10.5px; color: #166534; margin-bottom: 9px; line-height: 1.45;">
          Complétez directement votre <strong>demande d'analyse d'initiative</strong> supportée par l'IA et validée par l'expertise humaine, accélérant le processus de 3 jours à seulement 3 minutes !
        </p>
        <a href="/evaluation.html" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #0284c7 0%, #1e2977 100%); color: #ffffff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);">
          <span>📝</span>
          <span>Compléter une Demande d'Analyse (3 min)</span>
          <span>➔</span>
        </a>
      </div>
    `;
  }

  // 6. Point de Contrôle Officiel Slide 8
  bodyHtml += `
    <div style="background: #0f172a; color: #ffffff; border-radius: 8px; padding: 9px 12px; font-size: 10px; line-height: 1.4; border-left: 3px solid #38bdf8;">
      <strong style="color: #38bdf8;">Point de contrôle officiel (Slide 8) :</strong><br>
      Aucun passage en production sans décision documentée, propriétaire d'affaires identifié, conditions d'usage et indicateurs de suivi.
    </div>
  `;

  const panelBody = document.getElementById('panel-body-content');
  if (panelBody) panelBody.innerHTML = bodyHtml;
}

// Fonction de sélection des parcours Octopus avec animation caméra
window.selectOctopusPath = function(pathId) {
  IQ_TOWER.selectedOctopusPath = pathId;

  if (pathId === 1) {
    // Zoom vers Pavillon Achats & Solutions TI
    if (window.gsap) {
      gsap.to(IQ_TOWER.camera.position, { x: -62, y: 18, z: 42, duration: 2.0, ease: "power2.inOut" });
      gsap.to(IQ_TOWER.controls.target, { x: -62, y: 7, z: 0, duration: 2.0, ease: "power2.inOut" });
    }
  } else if (pathId === 2) {
    // Zoom vers Pavillon Support & Licences TI
    if (window.gsap) {
      gsap.to(IQ_TOWER.camera.position, { x: 62, y: 18, z: 42, duration: 2.0, ease: "power2.inOut" });
      gsap.to(IQ_TOWER.controls.target, { x: 62, y: 7, z: 0, duration: 2.0, ease: "power2.inOut" });
    }
  } else {
    // Revenir à la Tour Principale (Parcours 3)
    if (window.gsap) {
      gsap.to(IQ_TOWER.camera.position, { x: 35, y: 10, z: 42, duration: 2.0, ease: "power2.inOut" });
      gsap.to(IQ_TOWER.controls.target, { x: 0, y: 8, z: 0, duration: 2.0, ease: "power2.inOut" });
    }
  }

  updateNarrativePanel(SLIDE8_LIFECYCLE[0]);
};

// ============================================================================
// GESTION DES FENÊTRES FLOTTANTES DÉPLAÇABLES (DRAGGABLE) & DÉSECOMBREMENT
// ============================================================================
let _highestWindowZIndex = 120;

window.bringToFront = function(element) {
  if (!element) return;
  _highestWindowZIndex += 2;
  element.style.zIndex = _highestWindowZIndex;
};

window.makeElementDraggable = function(element, handle) {
  if (!element || !handle) return;

  handle.classList.add('draggable-header');

  // Ajouter l'indicateur visuel discret de poignée si non présent
  if (!handle.querySelector('.drag-grip-indicator')) {
    const grip = document.createElement('span');
    grip.className = 'drag-grip-indicator';
    grip.innerHTML = '⠿ Déplacer';
    grip.title = "Cliquez et glissez pour déplacer cette fenêtre n'importe où";
    handle.prepend(grip);
  }

  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
  let isDragging = false;

  element.addEventListener('mousedown', () => {
    window.bringToFront(element);
  });

  handle.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT' || 
        e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    isDragging = true;
    element.classList.add('is-dragging');
    window.bringToFront(element);

    const rect = element.getBoundingClientRect();
    element.style.transform = 'none';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.left = rect.left + 'px';
    element.style.top = rect.top + 'px';
    element.style.margin = '0';

    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    const onMouseMove = (moveEvent) => {
      if (!isDragging) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxLeft = Math.max(10, window.innerWidth - element.offsetWidth - 10);
      const maxTop = Math.max(10, window.innerHeight - element.offsetHeight - 10);
      newLeft = Math.max(10, Math.min(newLeft, maxLeft));
      newTop = Math.max(50, Math.min(newTop, maxTop));

      element.style.left = newLeft + 'px';
      element.style.top = newTop + 'px';
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
};

// ============================================================================
// ÉCOUTEURS D'ÉVÉNEMENTS & CONFIGURATION UI
// ============================================================================
function setupUI() {
  // Écouteurs de la barre de visite guidée du Bureau de l'IA (4 sous-étapes)
  document.getElementById('btn-substep-prev')?.addEventListener('click', () => {
    const prev = ((IQ_TOWER.roomSubStepIndex || 0) - 1 + BUREAU_IA_WORK_STEPS.length) % BUREAU_IA_WORK_STEPS.length;
    window.goToRoomSubStep(prev);
  });
  document.getElementById('btn-substep-next')?.addEventListener('click', () => {
    const next = ((IQ_TOWER.roomSubStepIndex || 0) + 1) % BUREAU_IA_WORK_STEPS.length;
    window.goToRoomSubStep(next);
  });
  document.getElementById('btn-room-tour-toggle')?.addEventListener('click', () => {
    window.toggleRoomTour();
  });
  document.getElementById('btn-exit-room')?.addEventListener('click', () => window.exitBureauRoom());

  // Clic sur l'ascenseur latéral (Lance l'orchestration vocale + vidéo du Mentor)
  document.querySelectorAll('.elevator-floor-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const step = parseInt(e.currentTarget.dataset.step, 10);
      window.unlockSpeechAudio();
      window.stopAllMedia({ resetTour: true });
      const overlay = document.getElementById('experience-welcome-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
      }
      if (window.runMentorStepLifecycle) {
        window.runMentorStepLifecycle(step);
      } else {
        goToLifecycleStep(step);
      }
    });
  });

  // Clic sur les 7 colonnes officielles de la Slide 8 (Tableau de bord du bas)
  document.querySelectorAll('.slide8-card-col').forEach(card => {
    card.addEventListener('click', e => {
      const step = parseInt(e.currentTarget.dataset.step, 10);
      window.unlockSpeechAudio();
      window.stopAllMedia({ resetTour: true });
      const overlay = document.getElementById('experience-welcome-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
      }
      if (window.runMentorStepLifecycle) {
        window.runMentorStepLifecycle(step);
      } else {
        goToLifecycleStep(step);
      }
    });
  });

  // Bouton Réduire / Agrandir le tableau de bord officiel Slide 8
  const btnToggle = document.getElementById('btn-toggle-dashboard');
  const dashboard = document.getElementById('slide8-dashboard');
  if (btnToggle && dashboard) {
    btnToggle.addEventListener('click', () => {
      dashboard.classList.toggle('collapsed');
      const isCollapsed = dashboard.classList.contains('collapsed');
      document.getElementById('toggle-icon').innerText = isCollapsed ? '▲' : '▼';
      document.getElementById('toggle-label').innerText = isCollapsed ? '📊 Afficher le cycle complet' : 'Réduire la vue';
    });
  }

  // Boutons précédent / suivant du cycle de vie
  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    window.unlockSpeechAudio();
    window.stopAllMedia({ resetTour: true });
    if (window.goToNextOrchestratedStep) {
      window.goToNextOrchestratedStep();
    } else {
      if (IQ_TOWER.currentStepIndex < SLIDE8_LIFECYCLE.length - 1) {
        goToLifecycleStep(IQ_TOWER.currentStepIndex + 1);
      }
    }
  });

  document.getElementById('btn-prev-step')?.addEventListener('click', () => {
    window.unlockSpeechAudio();
    window.stopAllMedia({ resetTour: true });
    const prevIdx = Math.max(0, IQ_TOWER.currentStepIndex - 1);
    if (window.runMentorStepLifecycle) {
      window.runMentorStepLifecycle(prevIdx);
    } else {
      goToLifecycleStep(prevIdx);
    }
  });

  document.getElementById('panel-next-btn')?.addEventListener('click', () => {
    window.unlockSpeechAudio();
    window.stopAllMedia({ resetTour: true });
    if (window.goToNextOrchestratedStep) {
      window.goToNextOrchestratedStep();
    } else {
      if (IQ_TOWER.currentStepIndex < SLIDE8_LIFECYCLE.length - 1) {
        goToLifecycleStep(IQ_TOWER.currentStepIndex + 1);
      }
    }
  });

  document.getElementById('panel-prev-btn')?.addEventListener('click', () => {
    window.unlockSpeechAudio();
    window.stopAllMedia({ resetTour: true });
    const prevIdx = Math.max(0, IQ_TOWER.currentStepIndex - 1);
    if (window.runMentorStepLifecycle) {
      window.runMentorStepLifecycle(prevIdx);
    } else {
      goToLifecycleStep(prevIdx);
    }
  });

  // Bouton Visite Guidée Automatique (Auto-Tour de 0 à 6)
  const btnAutoTour = document.getElementById('btn-auto-tour');
  if (btnAutoTour) {
    btnAutoTour.addEventListener('click', () => {
      IQ_TOWER.autoTourRunning = !IQ_TOWER.autoTourRunning;
      btnAutoTour.classList.toggle('active-tour', IQ_TOWER.autoTourRunning);
      
      const tourIcon = document.getElementById('auto-tour-icon');
      const tourText = document.getElementById('auto-tour-text');
      if (tourIcon) tourIcon.innerText = IQ_TOWER.autoTourRunning ? '⏸' : '▶';
      if (tourText) tourText.innerText = IQ_TOWER.autoTourRunning ? 'Pause Tour' : 'Visite Guidée';

      if (IQ_TOWER.autoTourRunning) {
        window.startMentorOrchestratedExperience();
      } else {
        window.stopAllMedia({ resetTour: true });
      }
    });
  }

  // Bouton Sonnette / Carillon
  const btnSound = document.getElementById('btn-sound-toggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      IQ_TOWER.soundEnabled = !IQ_TOWER.soundEnabled;
      btnSound.style.opacity = IQ_TOWER.soundEnabled ? '1' : '0.5';
      if (IQ_TOWER.soundEnabled) playElevatorChime();
    });
  }

  // Bouton vue d'ensemble de la tour
  document.getElementById('btn-overview')?.addEventListener('click', () => {
    if (window.gsap) {
      gsap.to(IQ_TOWER.camera.position, { x: 95, y: 70, z: 105, duration: 2.2, ease: "power2.inOut" });
      gsap.to(IQ_TOWER.controls.target, { x: 0, y: 52, z: 0, duration: 2.2, ease: "power2.inOut" });
    }
  });

  // Fermeture / Réouverture de la fiche latérale droite
  const narrativePanel = document.getElementById('narrative-panel');
  const panelCloseBtn = document.getElementById('panel-close');
  const panelReopenBtn = document.getElementById('btn-reopen-narrative');

  panelCloseBtn?.addEventListener('click', () => {
    narrativePanel?.classList.add('hidden');
    panelReopenBtn?.classList.remove('hidden');
    document.body.classList.add('narrative-closed');
  });

  panelReopenBtn?.addEventListener('click', () => {
    narrativePanel?.classList.remove('hidden');
    panelReopenBtn?.classList.add('hidden');
    document.body.classList.remove('narrative-closed');
    if (window.bringToFront) window.bringToFront(narrativePanel);
  });

  // Gestion du tiroir d'ascenseur sur smartphone et tablette
  const mobileElevatorBtn = document.getElementById('btn-toggle-mobile-elevator');
  const mobileElevatorClose = document.getElementById('btn-close-mobile-elevator');
  const elevatorBackdrop = document.getElementById('elevator-mobile-backdrop');
  const elevatorSidebar = document.getElementById('elevator-sidebar');

  function openMobileElevator() {
    elevatorSidebar?.classList.add('mobile-open');
    elevatorBackdrop?.classList.remove('hidden');
    document.body.classList.add('mobile-drawer-open');
  }

  function closeMobileElevator() {
    elevatorSidebar?.classList.remove('mobile-open');
    elevatorBackdrop?.classList.add('hidden');
    document.body.classList.remove('mobile-drawer-open');
  }

  mobileElevatorBtn?.addEventListener('click', () => {
    if (elevatorSidebar?.classList.contains('mobile-open')) {
      closeMobileElevator();
    } else {
      openMobileElevator();
    }
  });

  mobileElevatorClose?.addEventListener('click', closeMobileElevator);
  elevatorBackdrop?.addEventListener('click', closeMobileElevator);

  // Fermeture automatique du tiroir mobile lors du clic sur un étage
  document.querySelectorAll('.elevator-floor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        closeMobileElevator();
      }
    });
  });

  // 1. Écouteurs pour le Modal Capsule Vidéo Synthesia
  document.getElementById('synthesia-modal-close')?.addEventListener('click', closeSynthesiaVideo);
  document.getElementById('synthesia-backdrop')?.addEventListener('click', closeSynthesiaVideo);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSynthesiaVideo();
  });

  // 2. Écouteurs pour l'Assistant IA Vocal (RAG)
  const botDrawer = document.getElementById('ai-bot-drawer');
  const btnOpenBot = document.getElementById('btn-open-ai-bot');
  const btnCloseBot = document.getElementById('ai-bot-close');
  const btnVoiceToggle = document.getElementById('btn-voice-toggle');

  window.toggleChatDrawer = function() {
    botDrawer?.classList.toggle('hidden');
    if (!botDrawer?.classList.contains('hidden')) {
      const coachBubble = document.getElementById('coach-speech-bubble');
      if (coachBubble) coachBubble.classList.add('hidden');
      if (narrativePanel && !narrativePanel.classList.contains('hidden')) {
        narrativePanel.classList.add('hidden');
        panelReopenBtn?.classList.remove('hidden');
        document.body.classList.add('narrative-closed');
      }
      if (window.bringToFront) window.bringToFront(botDrawer);
      document.getElementById('bot-user-input')?.focus();
    }
  };

  btnOpenBot?.addEventListener('click', window.toggleChatDrawer);

  btnCloseBot?.addEventListener('click', () => {
    botDrawer?.classList.add('hidden');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });

  btnVoiceToggle?.addEventListener('click', () => {
    IQ_BOT_VOICE_ENABLED = !IQ_BOT_VOICE_ENABLED;
    btnVoiceToggle.classList.toggle('muted', !IQ_BOT_VOICE_ENABLED);
    const icon = document.getElementById('voice-icon');
    const text = document.getElementById('voice-text');
    if (icon) icon.innerText = IQ_BOT_VOICE_ENABLED ? '🔊' : '🔇';
    if (text) text.innerText = IQ_BOT_VOICE_ENABLED ? 'Voix Active' : 'Voix Coupée';
    if (!IQ_BOT_VOICE_ENABLED && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  });

  // Synchronisation dynamique du profil apprenant (Nom et Rôle éditables)
  if (window.updateUserProfileUI) {
    window.updateUserProfileUI();
  }
  const welcomeNameInput = document.getElementById('welcome-name-input');
  const welcomeRoleInput = document.getElementById('welcome-role-input');
  welcomeNameInput?.addEventListener('input', (e) => {
    window.USER_PROFILE.name = e.target.value.trim();
    localStorage.setItem('iq_user_name', window.USER_PROFILE.name);
    window.updateUserProfileUI();
  });
  welcomeRoleInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    window.USER_PROFILE.role = val || "Employé d'Investissement Québec";
    localStorage.setItem('iq_user_role', window.USER_PROFILE.role);
    window.updateUserProfileUI();
  });
}

// ============================================================================
// LOGIQUE DU LECTEUR DE CAPSULE VIDÉO SYNTHESIA HAUTE DÉFINITION (DOCK HAUT DE PAGE)
// ============================================================================
window._videoTimerInterval = null;
window._currentVideoEndCallback = null;

window.openSynthesiaVideo = function(stepIdx, subStepIdx, autoPlay = true, onVideoEndCallback = null) {
  // RÈGLE INVIOLABLE DU COMMISSAIRE : SEULE LA PREMIÈRE CAPSULE (JALON 0 / REZ-DE-CHAUSSÉE) EST DISPONIBLE POUR L'INSTANT
  if (stepIdx !== 0) {
    if (onVideoEndCallback && typeof onVideoEndCallback === 'function') {
      setTimeout(onVideoEndCallback, 50);
    }
    return;
  }

  // Jeton unique d'exécution vidéo pour invalider toute opération concurrente ou fermée
  window._videoSessionToken = (window._videoSessionToken || 0) + 1;
  const currentSession = window._videoSessionToken;

  const modal = document.getElementById('synthesia-video-modal');
  const titleEl = document.getElementById('synthesia-video-title');
  const subEl = document.getElementById('synthesia-video-subtitle');
  const sourceEl = document.getElementById('synthesia-source');
  const playerEl = document.getElementById('synthesia-player');
  const placeholderEl = document.getElementById('synthesia-placeholder');
  const placeholderTitle = document.getElementById('synthesia-placeholder-title');
  const placeholderDesc = document.getElementById('synthesia-placeholder-desc');
  const scriptPreviewEl = document.getElementById('synthesia-script-preview');
  const timerPill = document.getElementById('synthesia-timer-pill');
  const fileEl = document.getElementById('synthesia-footer-file');
  const toolLinkEl = document.getElementById('synthesia-download-tool');
  const statusBadge = document.getElementById('dock-status-badge');
  const progressFill = document.getElementById('dock-video-progress-fill');

  // Enregistrer le callback courant pour permettre l'avancement manuel immédiat
  window._currentVideoEndCallback = onVideoEndCallback;

  // Nettoyer tout décompte vidéo en cours
  if (window._videoTimerInterval) {
    clearInterval(window._videoTimerInterval);
    window._videoTimerInterval = null;
  }

  // Réinitialiser la barre de progression
  if (progressFill) progressFill.style.width = '0%';
  if (statusBadge) statusBadge.innerText = '⏳ Capsule en cours';

  let videoTitle = "";
  let videoSub = "";
  let videoPath = "";
  let toolName = "";
  let toolPath = "";
  let scriptSummary = "";

  if (stepIdx === 1 && subStepIdx !== null && subStepIdx !== undefined) {
    const sub = BUREAU_IA_WORK_STEPS[subStepIdx];
    videoTitle = sub.title;
    videoSub = `Capsule Vidéo Synthesia • Acteur : ${sub.actor}`;
    videoPath = `documents_phases/Etape_1_Qualification/capsule_${sub.id}.mp4`;
    toolName = sub.fileLink.split('/').pop();
    toolPath = sub.fileLink;
    scriptSummary = sub.desc || "Qualification et analyse de la demande par le Bureau de l'IA.";
  } else {
    const stepNumber = (typeof stepIdx === 'number') ? stepIdx : 0;
    const data = SLIDE8_LIFECYCLE[stepNumber] || SLIDE8_LIFECYCLE[0];
    videoTitle = `Jalon ${data.step} : ${data.title}`;
    videoSub = `Capsule Vidéo Synthesia • Responsable : ${data.actor}`;
    const folderMap = {
      0: "Etape_0_Depot",
      1: "Etape_1_Qualification",
      2: "Etape_2_Risques_Priorisation",
      3: "Etape_3_Decision_GoNoGo",
      4: "Etape_4_Pilote_POC",
      5: "Etape_5_Deploiement_Controle",
      6: "Etape_6_Exploitation_Surveillance"
    };
    videoPath = `documents_phases/${folderMap[stepNumber] || ('Etape_' + data.step)}/capsule_etape_${data.step}.mp4`;
    toolName = data.files && data.files[0] ? data.files[0].name : "Gabarit officiel";
    toolPath = data.files && data.files[0] ? data.files[0].path : "#";
    
    if (typeof MENTOR_STEPS_ORCHESTRATION !== 'undefined' && MENTOR_STEPS_ORCHESTRATION[stepNumber]) {
      scriptSummary = MENTOR_STEPS_ORCHESTRATION[stepNumber].scriptSummary;
    } else {
      scriptSummary = `Formation officielle sur le Jalon ${data.step} : ${data.title} (${data.actor}).`;
    }
  }

  if (titleEl) titleEl.innerText = videoTitle;
  if (subEl) subEl.innerText = videoSub;
  if (fileEl) fileEl.innerText = toolName;
  if (toolLinkEl) toolLinkEl.href = encodeURI(toolPath);

  if (placeholderTitle) placeholderTitle.innerText = `Capsule Synthesia — ${videoTitle}`;
  if (placeholderDesc) {
    placeholderDesc.innerHTML = `Formation officielle du Bureau de l'IA (Fichier attendu : <code style="color:#38bdf8; background:#0f172a; padding:1px 5px; border-radius:4px;">${videoPath.split('/').pop()}</code>)`;
  }
  if (scriptPreviewEl) {
    scriptPreviewEl.innerHTML = `<strong>Contenu pédagogique officiel :</strong><br>« ${scriptSummary} »`;
  }

  // Fonction de fin de capsule vidéo pour passer à l'étape suivante
  const finishVideoAndAdvance = () => {
    if (currentSession !== window._videoSessionToken) return;

    if (window._videoTimerInterval) {
      clearInterval(window._videoTimerInterval);
      window._videoTimerInterval = null;
    }
    if (statusBadge) statusBadge.innerText = '✓ Capsule validée';
    if (progressFill) progressFill.style.width = '100%';

    // 1. Récupérer le callback impérativement AVANT la fermeture du lecteur vidéo
    const cb = window._currentVideoEndCallback;
    window._currentVideoEndCallback = null;

    // 2. Fermer le modal vidéo sans annuler la suite du parcours
    window.closeSynthesiaVideo(true);

    // 3. Déclencher sans faute le relais du Mentor
    if (cb && typeof cb === 'function') {
      setTimeout(cb, 300);
    }
  };

  // Lance le compte à rebours visuel simulé si la vidéo MP4 n'est pas présente sur le disque
  const startPlaceholderCountdown = () => {
    if (currentSession !== window._videoSessionToken) return;
    if (!modal || modal.classList.contains('hidden')) return;
    if (window._videoTimerInterval) return;

    if (placeholderEl) {
      placeholderEl.classList.remove('hidden');
      placeholderEl.style.display = 'flex';
    }
    if (playerEl) {
      playerEl.style.display = 'none';
      try { playerEl.pause(); } catch(e) {}
    }
    if (statusBadge) statusBadge.innerText = '⏳ Capsule (8s)...';
    
    let totalMs = 8000;
    let elapsedMs = 0;
    const intervalTick = 100;

    window._videoTimerInterval = setInterval(() => {
      if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
        clearInterval(window._videoTimerInterval);
        window._videoTimerInterval = null;
        return;
      }
      elapsedMs += intervalTick;
      const pct = Math.min(100, (elapsedMs / totalMs) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;

      const remainingSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      if (statusBadge) statusBadge.innerText = `⏳ Capsule (${remainingSec}s)...`;
      if (timerPill) timerPill.innerText = `⏳ Défilement : ${remainingSec}s`;

      if (elapsedMs >= totalMs) {
        finishVideoAndAdvance();
      }
    }, intervalTick);
  };

  // Lecture de la vidéo réelle MP4 présente sur le disque
  const setupAndPlayRealVideo = () => {
    if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
      if (playerEl) {
        try { playerEl.pause(); playerEl.currentTime = 0; } catch(e) {}
      }
      return;
    }

    if (window._videoTimerInterval) {
      clearInterval(window._videoTimerInterval);
      window._videoTimerInterval = null;
    }
    if (placeholderEl) {
      placeholderEl.classList.add('hidden');
      placeholderEl.style.display = 'none';
    }
    if (playerEl) {
      playerEl.style.display = 'block';
    }
    if (statusBadge) statusBadge.innerText = '▶️ Lecture vidéo';

    if (autoPlay && playerEl) {
      playerEl.play().catch(async (err) => {
        if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
          try { playerEl.pause(); } catch(e) {}
          return;
        }
        console.warn('[Synthesia Player] Autoplay sonore restreint par le navigateur, essai en mode muet :', err);
        try {
          playerEl.muted = true;
          await playerEl.play();
          if (statusBadge) statusBadge.innerText = '🔇 Lecture muette (cliquez pour activer le son)';
        } catch (err2) {
          console.warn('[Synthesia Player] Démarrage manuel requis :', err2);
          if (statusBadge) statusBadge.innerText = '▶️ Cliquez pour démarrer la vidéo';
        }
      });
    }
  };

  if (sourceEl && playerEl) {
    // Écouteurs de progression et de fin de vidéo
    playerEl.ontimeupdate = () => {
      if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) return;
      if (playerEl.duration && playerEl.duration > 0) {
        const pct = (playerEl.currentTime / playerEl.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
      }
    };

    playerEl.onended = () => {
      if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) return;
      finishVideoAndAdvance();
    };

    playerEl.oncanplay = () => {
      if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
        try { playerEl.pause(); } catch(e) {}
        return;
      }
      setupAndPlayRealVideo();
    };

    playerEl.onerror = () => {
      if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) return;
      console.warn('[Synthesia Player] Fichier introuvable ou erreur de décodage :', videoPath);
      startPlaceholderCountdown();
    };

    // Détection immédiate si le fichier MP4 existe sur le serveur sans fallback intempestif
    const tryPlayCandidate = (path) => {
      fetch(path, { method: 'HEAD' })
        .then((res) => {
          if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
            return;
          }
          if (res.ok) {
            if (placeholderEl) {
              placeholderEl.classList.add('hidden');
              placeholderEl.style.display = 'none';
            }
            playerEl.style.display = 'block';
            playerEl.src = path;
            sourceEl.src = path;
            playerEl.load();
          } else {
            startPlaceholderCountdown();
          }
        })
        .catch(() => {
          if (currentSession !== window._videoSessionToken || !modal || modal.classList.contains('hidden')) {
            return;
          }
          startPlaceholderCountdown();
        });
    };
    tryPlayCandidate(videoPath);
  } else {
    startPlaceholderCountdown();
  }

  if (modal) modal.classList.remove('hidden');
  document.body.classList.add('has-top-video');
  if (window.updateCopilotStateBadge) window.updateCopilotStateBadge();
};

window.closeSynthesiaVideo = function(isAutoAdvance = false) {
  const pendingCallback = isAutoAdvance ? null : window._currentVideoEndCallback;
  window._currentVideoEndCallback = null;

  // 1. Invalider immédiatement la session vidéo pour éviter toute lecture résiduelle
  window._videoSessionToken = (window._videoSessionToken || 0) + 1;

  // 2. Annuler tout décompte ou timer en arrière-plan
  if (window._videoTimerInterval) {
    clearInterval(window._videoTimerInterval);
    window._videoTimerInterval = null;
  }

  // 3. Stopper et décharger complètement le lecteur vidéo pour garantir zéro lecture sonore masquée
  const modal = document.getElementById('synthesia-video-modal');
  const player = document.getElementById('synthesia-player');
  const source = document.getElementById('synthesia-source');

  if (player) {
    try {
      player.pause();
      player.currentTime = 0;
    } catch(e) {}

    // Supprimer tous les écouteurs pour éviter qu'un événement asynchrone ne relance la lecture
    player.ontimeupdate = null;
    player.onended = null;
    player.oncanplay = null;
    player.onerror = null;

    // Décharger la source média pour libérer le buffer audio
    try {
      player.removeAttribute('src');
      if (source) source.removeAttribute('src');
      player.load();
    } catch(e) {}
  }

  // 4. Masquer le dock vidéo
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('has-top-video');
  if (window.updateCopilotStateBadge) window.updateCopilotStateBadge();

  // 5. Continuité du guidage : si la vidéo est fermée pendant une visite active, le mentor prend le relais
  if (!isAutoAdvance && window.MENTOR_GUIDED_TOUR_ACTIVE && pendingCallback && typeof pendingCallback === 'function') {
    setTimeout(pendingCallback, 300);
  }
};

window.toggleSynthesiaPause = function() {
  const player = document.getElementById('synthesia-player');
  const dockPauseIcon = document.getElementById('dock-pause-icon');
  if (!player) return;
  if (player.paused) {
    player.play().catch(e => console.warn(e));
    if (dockPauseIcon) dockPauseIcon.innerText = "⏸";
  } else {
    player.pause();
    if (dockPauseIcon) dockPauseIcon.innerText = "▶";
  }
};

window.toggleSynthesiaExpand = function() {
  const modal = document.getElementById('synthesia-video-modal');
  const icon = document.getElementById('expand-icon');
  if (modal) {
    const isExp = modal.classList.toggle('expanded');
    if (icon) icon.innerText = isExp ? '🗗' : '🗖';
  }
};

window.toggleVideoAutoPlay = function() {
  IQ_TOWER.autoPlayVideo = !IQ_TOWER.autoPlayVideo;
  const isAuto = IQ_TOWER.autoPlayVideo;

  const topBtn = document.getElementById('btn-top-video-toggle');
  const topText = document.getElementById('top-video-text');
  if (topBtn) topBtn.classList.toggle('active', isAuto);
  if (topText) topText.innerText = isAuto ? 'Vidéo Auto : ON' : 'Vidéo Auto : OFF';

  const sideBtn = document.getElementById('btn-video-autoplay-toggle');
  const sideLabel = document.getElementById('video-autoplay-label');
  if (sideBtn) sideBtn.classList.toggle('active-video', isAuto);
  if (sideLabel) sideLabel.innerText = isAuto ? 'Vidéo Auto : Active' : 'Vidéo Auto : Coupée';

  if (isAuto) {
    window.openSynthesiaVideo(IQ_TOWER.currentStepIndex, IQ_TOWER.isInsideRoom ? IQ_TOWER.roomSubStepIndex : null, true);
  } else {
    window.closeSynthesiaVideo();
  }
};

// ============================================================================
// ASSISTANT IA PÉDAGOGIQUE (RAG DOCUMENTAIRE & SYNTHÈSE VOCALE FRANCOPHONE)
// ============================================================================
let IQ_BOT_VOICE_ENABLED = true;

const IQ_RAG_KNOWLEDGE = [
  {
    topic: "faisabilite",
    keywords: ["faisabilite", "faisabilité", "valeur", "rentabilité", "gain", "roi", "calcul", "grille de faisabilité", "maturité", "cloud"],
    title: "Évaluation de la Faisabilité Technique & Valeur Métier",
    summary: "À la sous-étape 1.3, le Bureau de l'IA utilise la Grille de Faisabilité officielle d'Investissement Québec pour mesurer les gains d'affaires et la faisabilité technologique.",
    details: `
      <p><strong>1. Gains Métier :</strong> Quantification des heures annuelles libérées, de la productivité des équipes et de l'alignement stratégique avec le plan triennal d'IQ.</p>
      <p><strong>2. Faisabilité Technique :</strong> Vérification de la maturité des données sources, de la compatibilité avec l'architecture infonuagique sécurisée d'IQ et du niveau d'effort requis.</p>
      <p><strong>3. Évaluation pondérée :</strong> Cette étape prépare le dossier pour analyser à quel point le projet est proche d'une solution prête afin d'éviter qu'une valeur financière élevée ne masque un risque de sécurité.</p>
    `,
    speech: "À l'étape 1 point 3, le Bureau de l'IA évalue la faisabilité technique et la valeur métier avec la Grille de Faisabilité officielle d'Investissement Québec. On quantifie les heures économisées, l'alignement stratégique et la maturité des données dans l'environnement infonuagique d'IQ avant toute priorisation.",
    tool: "Grille_faisabilite_cas_usage_IA.xlsx",
    toolPath: "documents_phases/Etape_1_Qualification/Grille_faisabilite_cas_usage_IA.xlsx",
    cameraFloor: 1,
    subStep: 2
  },
  {
    topic: "arbre",
    keywords: ["arbre", "decision", "décision", "outil existant", "homologué", "copilot", "doublon", "redondance", "acheter", "outil"],
    title: "Arbre de Décision & Contrôle Anti-Redondance",
    summary: "L'Arbre de Décision vérifie systématiquement si un outil déjà homologué chez Investissement Québec (Copilot M365, Claude Enterprise) répond déjà au besoin.",
    details: `
      <p><strong>• Si OUI :</strong> Réorientation immédiate vers l'attribution d'une licence individuelle via Octopus (Parcours 2 - Support TI). Aucun nouveau développement n'est financé.</p>
      <p><strong>• Si NON :</strong> Orientation vers le cadrage d'un nouveau cas d'usage avec le Bureau de l'IA et l'Escouade IA (Parcours 3).</p>
      <p><strong>Bénéfice :</strong> Zéro redondance budgétaire et sécurisation des actifs TI existants.</p>
    `,
    speech: "L'Arbre de Décision est un filtre obligatoire. Avant d'investir un seul dollar dans un nouveau développement, on vérifie si un outil déjà autorisé chez IQ comme Microsoft Copilot M365 ou Claude Enterprise répond au besoin. Si oui, on attribue simplement une licence.",
    tool: "Arbre_Decision_Outils_Homologues_vs_Nouveaux.xlsx",
    toolPath: "documents_phases/Etape_1_Qualification/Arbre_Decision_Outils_Homologues_vs_Nouveaux.xlsx",
    cameraFloor: 1,
    subStep: 1
  },
  {
    topic: "risques_dgir",
    keywords: ["dgir", "11 risques", "risque", "risques", "gouvernance", "appétit", "appetit", "grille première", "seuil", "matérialité"],
    title: "Les 11 Risques de Gouvernance IA (DGIR 2026)",
    summary: "Le cadre d'appétit au risque de la Direction Générale des Risques (DGIR) 2026 encadre toutes les initiatives selon 11 risques spécifiques.",
    details: `
      <p><strong>• Risque IA #1 :</strong> Fiabilité & Hallucinations (Exactitude des extrants décisionnels).</p>
      <p><strong>• Risque IA #3 :</strong> Confidentialité & Loi 25 (Protection des données sensibles et PII).</p>
      <p><strong>• Risque IA #4 :</strong> Cybersécurité (Injections de prompts, fuites de données).</p>
      <p><strong>• Risque IA #9 :</strong> Dépendance technologique & verrouillage fournisseur.</p>
      <p><strong>• Risque IA #11 :</strong> Impact sur la personne physique (Préjudice aux entrepreneurs ou citoyens, distinct du risque de réputation).</p>
    `,
    speech: "La DGIR 2026 a défini 11 risques de gouvernance majeurs pour l'IA chez Investissement Québec, notamment la fiabilité des extrants, la protection des données Loi 25, la cybersécurité et l'impact préjudiciable sur la personne.",
    tool: "Grille_evaluation_cas_usage.xlsx",
    toolPath: "documents_phases/Etape_1_Qualification/Grille_evaluation_cas_usage.xlsx",
    cameraFloor: 1,
    subStep: 3
  },
  {
    topic: "loi25",
    keywords: ["loi 25", "personnel", "personnels", "renseignement", "renseignements", "vie privée", "dprp", "consentement", "sensible"],
    title: "Protection des Renseignements Personnels (Loi 25)",
    summary: "Toute initiative manipulant des renseignements personnels d'employés, de dirigeants d'entreprises ou de clients exige des contrôles stricts pour protéger les citoyens.",
    details: `
      <p><strong>• Évaluation des Facteurs relatifs à la Vie Privée :</strong> Obligatoire dès que des données personnelles transitent par une IA pour protéger les droits des individus.</p>
      <p><strong>• Principe de Zéro Rétention (Zero Retention) :</strong> Interdiction absolue que les requêtes soient utilisées pour ré-entraîner les modèles publics tiers.</p>
      <p><strong>• Hébergement souverain :</strong> Données conservées dans les centres de données Azure canadiens sous gouvernance exclusive d'IQ.</p>
    `,
    speech: "En vertu de la Loi 25, toute initiative impliquant des renseignements personnels requiert une évaluation des facteurs relatifs à la vie privée signée, l'assurance du zéro rétention par les fournisseurs et un hébergement au Canada.",
    tool: "Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    cameraFloor: 2
  },
  {
    topic: "portes",
    keywords: ["porte", "portes", "homologation", "score", "voie accélérée", "conditionnelle", "refus", "approbation", "maturité", "prêt"],
    title: "Les 4 Portes d'Homologation Officielle",
    summary: "Pour éliminer les faux positifs où une forte promesse de gain masquerait un risque juridique ou de sécurité, IQ évalue la proximité de la solution avec un état idéal prêt :",
    details: `
      <p><strong>🟢 1. Voie Accélérée (Projet hautement prêt, risque minime) :</strong> Homologation rapide, aucun audit complémentaire requis.</p>
      <p><strong>🟡 2. Homologation Conditionnelle (Risque modéré) :</strong> Signature de l'évaluation des facteurs relatifs à la vie privée et relecture humaine obligatoire.</p>
      <p><strong>🔴 3. Évaluation Approfondie (Risque élevé) :</strong> Audits complets de Cybersécurité et tests d'intrusion exigés.</p>
      <p><strong>💥 4. Refus / Reconfiguration (Non conforme ou risque critique) :</strong> Projet refusé en l'état, ré-architecture obligatoire.</p>
    `,
    speech: "Le modèle d'homologation comporte 4 portes : Voie accélérée pour les projets prêts et à faible risque, Homologation conditionnelle avec revue humaine, Évaluation approfondie avec audits de cybersécurité, et Refus pour réarchitecture complète.",
    tool: "Demonstration_Mathematique_AHP_Appetit_DGIR_IQ.docx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Demonstration_Mathematique_AHP_Appetit_DGIR_IQ.docx",
    cameraFloor: 3
  },
  {
    topic: "parcours",
    keywords: ["parcours", "intake", "guichet", "demande", "soumission", "octopus", "3 parcours", "acheter un logiciel", "licence"],
    title: "Les 3 Parcours Officiels de Soumission chez IQ",
    summary: "Le guichet unique Octopus aiguille toute demande vers 3 parcours distincts :",
    details: `
      <p><strong>🛍️ Parcours 1 : Nouveau logiciel ou solution avec IA</strong> ➔ Pris en charge par l'équipe TI (processus d'achat Octopus).</p>
      <p><strong>🎫 Parcours 2 : Demandes de Licences IA</strong> ➔ Traité par le Support TI pour les outils déjà autorisés (Copilot M365, Read AI, Claude).</p>
      <p><strong>💡 Parcours 3 : Cas d'Usage Métier & Formation</strong> ➔ Cadré par le Bureau de l'IA et l'Escouade IA avec ateliers Design Thinking.</p>
    `,
    speech: "Investissement Québec organise ses demandes en trois parcours : Parcours 1 pour l'achat de nouveaux logiciels avec l'équipe TI, Parcours 2 pour les licences d'outils autorisés géré par le Support TI, et Parcours 3 pour les cas d'usage métiers accompagnés par le Bureau de l'IA.",
    tool: "Portail_Intake_Formulaires_IA_IQ.html",
    toolPath: "01_Applications_Web_Intake/Portail_Intake_Formulaires_IA_IQ.html",
    cameraFloor: 0
  },
  {
    topic: "niveaux_gouvernance",
    keywords: ["niveaux", "3 niveaux", "trois niveaux", "strategique", "stratégique", "tactique", "operationnel", "opérationnel", "comite", "comité", "qui decide", "qui décide", "approbation", "ca", "direction"],
    title: "Le Modèle Cible à Trois Niveaux Décisionnels",
    summary: "Pour assurer un contrôle rigoureux sans comités superflus, IQ structure sa gouvernance en 3 niveaux décisionnels clairs :",
    details: `
      <p><strong>1. Niveau Stratégique (Comité de direction & CA) :</strong> Réuni chaque trimestre (PDG, PVP, Responsable IA en voix consultative). Fixe les orientations, définit l'appétit au risque d'IQ, autorise les investissements majeurs et tranche sur les projets à risque très élevé. Le CA approuve la politique d'IA.</p>
      <p><strong>2. Niveau Tactique (Comité de gouvernance IA) :</strong> Réuni 8 à 10 fois par an (Responsable IA, Bureau de l'IA, TI, Cybersécurité CSI, Juridique DPRP, Risques DGIR, Affaires). Arbitre les dossiers sensibles, suit la conformité et statue sur les initiatives à risque modéré.</p>
      <p><strong>3. Niveau Opérationnel (Bureau de l'IA, Cellule-Experts & TI) :</strong> Moteur de l'exécution au quotidien. Le Bureau de l'IA (permanence de 4 personnes) gère le portefeuille, qualifie la demande et pilote l'expérimentation agile ; la Cellule-Experts apporte son appui matriciel ; les TI assurent le déploiement technique et le support.</p>
    `,
    speech: "IQ a structuré sa gouvernance en trois niveaux : le niveau stratégique avec le Comité de direction et le CA, le niveau tactique avec le Comité de gouvernance IA pour les risques modérés, et le niveau opérationnel avec le Bureau de l'IA et les TI.",
    tool: "Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    cameraFloor: 3
  },
  {
    topic: "qui_fait_quoi",
    keywords: ["qui fait quoi", "responsabilite", "responsabilités", "roles", "rôles", "orchestrateur", "livreur", "proprietaire de la valeur", "propriétaire de la valeur", "metier", "métier", "ti"],
    title: "Partage des Responsabilités : Qui fait quoi ?",
    summary: "Pour maximiser l'adoption sans créer de silos, IQ applique un principe clair de partage des responsabilités :",
    details: `
      <p><strong>• Le Bureau de l'IA (L'orchestrateur) :</strong> Facilitateur léger qui qualifie les demandes d'affaires, priorise le portefeuille d'initiatives, coordonne les évaluations de risques et prépare les dossiers de décision pour les comités.</p>
      <p><strong>• Les TI (Le livreur technique) :</strong> Responsables de l'architecture technologique, de la sécurité technique des systèmes, de l'intégration dans l'infrastructure infonuagique d'IQ, du support et des indicateurs de performance technique.</p>
      <p><strong>• Les Lignes d'affaires (Le propriétaire de la valeur) :</strong> Uniques propriétaires de leurs besoins. Portent l'expression de valeur, la responsabilité de l'adoption finale par les équipes et la réalisation effective des gains d'affaires attendus.</p>
    `,
    speech: "Le partage des responsabilités est très clair chez IQ : le Bureau de l'IA orchestre et qualifie, les TI livrent et sécurisent l'infrastructure, et les lignes d'affaires demeurent les uniques propriétaires de la valeur et de l'adoption finale.",
    tool: "Portail_Intake_Formulaires_IA_IQ.html",
    toolPath: "01_Applications_Web_Intake/Portail_Intake_Formulaires_IA_IQ.html",
    cameraFloor: 1
  },
  {
    topic: "gouverner_vs_operer",
    keywords: ["gouverner", "operer", "opérer", "distinction", "difference", "différence", "gouvernance vs operations", "gouvernance vs opérations"],
    title: "Distinction Fondamentale : Gouverner vs Opérer",
    summary: "Pour réussir, Investissement Québec sépare clairement deux dynamiques complémentaires :",
    details: `
      <p><strong>• La Gouvernance IA :</strong> Définit les conditions d'un usage responsable, encadre les décisions d'affaires, protège les données et produit la reddition de comptes.</p>
      <p><strong>• Les Opérations IA :</strong> Se concentrent sur la livraison technique, l'intégration infonuagique sécurisée, l'exploitation au quotidien et la performance des systèmes en production.</p>
    `,
    speech: "Une distinction clé chez IQ : la Gouvernance IA encadre les conditions d'usage responsable et les décisions, tandis que les Opérations IA se concentrent sur la livraison technique, l'intégration infonuagique et le maintien en condition opérationnelle.",
    tool: "Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    cameraFloor: 0
  },
  {
    topic: "cycle_de_vie_manager",
    keywords: ["cycle de vie", "etapes", "étapes", "7 etapes", "sept etapes", "7 étapes", "sept étapes", "jalons", "regle d'or", "règle d'or", "mise en production", "kri"],
    title: "Le Cycle de Vie d'une Initiative IA & Règle d'Or",
    summary: "Comment passe-t-on d'un besoin d'affaires à un système d'IA en production chez IQ ? Le parcours comprend 7 étapes balisées :",
    details: `
      <p><strong>• Étape 0 : Dépôt de la demande</strong> ➔ Expression du besoin et de la valeur via le Guichet Octopus officiel.</p>
      <p><strong>• Étape 1 : Qualification</strong> ➔ Analyse de la valeur d'affaires, alignement stratégique et faisabilité par le Bureau de l'IA.</p>
      <p><strong>• Étape 2 : Évaluation des risques</strong> ➔ Analyse conjointe avec les experts (Loi 25, Cybersécurité CSI, Risques).</p>
      <p><strong>• Étape 3 : Décision (Go / No Go)</strong> ➔ Arbitrage proportionné selon le risque (Faible ➔ Bureau IA ; Modéré ➔ Comité tactique ; Élevé ➔ Direction).</p>
      <p><strong>• Étape 4 : Développement encadré (Pilote POC)</strong> ➔ Expérimentation agile en bac à sable sécurisé pour valider concrètement valeur et hypothèses.</p>
      <p><strong>• Étape 5 : Déploiement contrôlé</strong> ➔ Prise en charge TI (appel d'offres marché ou architecture qualité production TI).</p>
      <p><strong>• Étape 6 : Exploitation et surveillance en continu</strong> ➔ Maintien opérationnel, détection dérive de modèles et suivi des indicateurs KRI par les TI.</p>
      <p><strong>🚨 Règle d'or absolue :</strong> Aucun système d'IA ne peut passer en production sans une décision documentée, un propriétaire d'affaires identifié et des indicateurs de suivi définis.</p>
    `,
    speech: "Le parcours compte 7 étapes de la qualification au support en continu. Notre règle d'or absolue. Aucun système d'IA ne passe en production sans décision documentée, propriétaire d'affaires identifié et indicateurs de suivi opérationnels.",
    tool: "Dashboard_et_Registre_Executif_IA_IQ.xlsx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Dashboard_et_Registre_Executif_IA_IQ.xlsx",
    cameraFloor: 0
  },
  {
    topic: "pourquoi_gouvernance",
    keywords: ["pourquoi", "frein", "valeur", "benefice", "bénéfice", "12%", "introduction", "mission", "finalites", "finalités"],
    title: "Pourquoi la Gouvernance IA chez Investissement Québec ?",
    summary: "Saviez-vous que les organisations dotées d'une gestion efficace des risques liés à l'IA sont 12 % plus avancées dans l'adoption de ces technologies ?",
    details: `
      <p>Chez IQ, la gouvernance n'est pas un frein : c'est un cadre structurant conçu pour libérer de la valeur de façon responsable, éthique et sécurisée.</p>
      <p><strong>Quatre finalités majeures :</strong></p>
      <p><strong>1. Alignement stratégique :</strong> S'assurer que chaque projet d'IA sert directement la mission économique d'IQ.</p>
      <p><strong>2. Conformité rigoureuse :</strong> Respecter les lois (notamment la Loi 25 sur la protection des renseignements personnels), l'éthique et la transparence.</p>
      <p><strong>3. Gestion des risques :</strong> Anticiper de façon proportionnée les dérives juridiques, réputationnelles ou opérationnelles.</p>
      <p><strong>4. Protection et confiance :</strong> Préserver l'intégrité des données et maintenir la confiance des partenaires.</p>
    `,
    speech: "Les organisations gérant efficacement leurs risques sont 12 % plus avancées dans l'adoption de l'IA. Chez IQ, la gouvernance n'est pas un frein. C'est un cadre structurant conçu pour libérer de la valeur de façon responsable, éthique et sécurisée.",
    tool: "Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    toolPath: "02_Cadres_et_Grilles_Word_Excel/Cadre_de_Controle_et_Grille_de_Qualification_NIST_AI_IQ.docx",
    cameraFloor: 0
  }
];

// ============================================================================
// ============================================================================
// SYNTHÈSE VOCALE HUMAINE HAUTE DÉFINITION & ORCHESTRATION DU CONSEILLER BUREAU IA
// ============================================================================
let selectedFrenchVoice = null;
window._currentMentorUtterance = null;
window._mentorVoiceResumeInterval = null;
window._mentorAudioPlayer = null;
window.MENTOR_GUIDED_TOUR_ACTIVE = false;
window.MENTOR_CURRENT_STEP = 0;
window.MENTOR_IS_PAUSED = false;
window.MENTOR_INTERRUPTED_TOUR_STATE = null;
window._currentTourPhase = null; // 'INTRO' | 'VIDEO' | 'OUTRO'
window._tourCountdownInterval = null;
window.LIVE_VOICE_SELECTED = localStorage.getItem('iq_voice_choice') || 'Antoine';

window.selectMentorVoice = function(voice) {
  const chosenVoice = voice || 'Antoine';
  window.LIVE_VOICE_SELECTED = chosenVoice;
  try { localStorage.setItem('iq_voice_choice', chosenVoice); } catch(e) {}

  // Boutons officiels d'accueil (Cartes de choix)
  const btnAntoine = document.getElementById('btn-voice-antoine');
  const btnSylvie = document.getElementById('btn-voice-sylvie');
  if (btnAntoine) btnAntoine.classList.toggle('active', chosenVoice === 'Antoine');
  if (btnSylvie) btnSylvie.classList.toggle('active', chosenVoice === 'Sylvie');

  // Rétrocompatibilité radio
  const labelAntoine = document.getElementById('label-voice-antoine');
  const labelSylvie = document.getElementById('label-voice-sylvie');
  if (labelAntoine) labelAntoine.classList.toggle('active', chosenVoice === 'Antoine');
  if (labelSylvie) labelSylvie.classList.toggle('active', chosenVoice === 'Sylvie');

  // Mettre à jour dynamiquement la présentation du Mentor sur l'écran d'accueil
  const mentorIntro = document.querySelector('#welcome-step-identification .welcome-text');
  if (mentorIntro) {
    if (chosenVoice === 'Sylvie') {
      mentorIntro.innerHTML = `Je suis <strong>Sylvie</strong>, votre Mentore en Gouvernance de l'IA d'Investissement Québec. Veuillez renseigner votre identité et votre direction pour personnaliser votre accompagnement.`;
    } else {
      mentorIntro.innerHTML = `Je suis <strong>Antoine</strong>, votre Mentor en Gouvernance de l'IA d'Investissement Québec. Veuillez renseigner votre identité et votre direction pour personnaliser votre accompagnement.`;
    }
  }

  const mentorVoiceLabel = document.getElementById('mentor-voice-label');
  if (mentorVoiceLabel) mentorVoiceLabel.innerText = chosenVoice;

  const visLabel = document.querySelector('#mentor-voice-visualizer span:last-child');
  if (visLabel) visLabel.textContent = `${chosenVoice} vous parle`;
};
window.handleWelcomeVoiceChange = window.selectMentorVoice;

// Initialisation du sélecteur de voix d'accueil au chargement
document.addEventListener('DOMContentLoaded', () => {
  const savedVoice = localStorage.getItem('iq_voice_choice') || 'Antoine';
  window.selectMentorVoice(savedVoice);
});

// Sélecteur cyclique de voix TTS LIVE en direct avec reprise automatique du discours interrompu
window.cycleMentorVoice = function() {
  const voices = ['Antoine', 'Sylvie'];
  const curIdx = voices.indexOf(window.LIVE_VOICE_SELECTED);
  const nextVoice = voices[(curIdx + 1) % voices.length];
  window.handleWelcomeVoiceChange(nextVoice);

  const labelEl = document.getElementById('mentor-voice-label');
  const btnEl = document.getElementById('btn-mentor-voice-toggle');
  if (labelEl) labelEl.innerText = nextVoice;
  if (btnEl) {
    btnEl.classList.add('voice-switch-active');
    setTimeout(() => btnEl.classList.remove('voice-switch-active'), 600);
  }

  // Vérifier si un discours était en cours ou avait été interrompu
  const ctx = window._currentMentorSpeechContext;
  if (ctx && ctx.text && ctx.text.length > 5) {
    window.speakMentorVoice(ctx.text, ctx.onEndCallback, true);
  } else {
    const voiceMsg = nextVoice === 'Antoine'
      ? "Voix d'Antoine activée."
      : "Voix de Sylvie activée.";
    window.speakMentorVoice(voiceMsg, null, true);
  }
};
window.cycleGeminiVoice = window.cycleMentorVoice; // Rétrocompatibilité

function getBestFrenchVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // STRICTEMENT les voix Google en français (Google français, Google français du Canada, etc.)
  // Voix humaines de très haute qualité naturelle
  const googleFr = voices.find(v => v.name.includes('Google') && (v.lang === 'fr-CA' || v.lang.startsWith('fr'))) ||
                   voices.find(v => v.name.includes('Google'));
  if (googleFr) return googleFr;

  // Si pas de voix Google, chercher une voix naturelle québécoise/canadienne de haute fidélité
  const naturalFr = voices.find(v => (v.lang === 'fr-CA' || v.lang.startsWith('fr')) && 
    (v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Enhanced')));
  if (naturalFr) return naturalFr;

  return voices.find(v => (v.lang === 'fr-CA' || v.lang.startsWith('fr'))) || null;
}

function loadBestFrenchVoice() {
  selectedFrenchVoice = getBestFrenchVoice();
}

if ('speechSynthesis' in window) {
  loadBestFrenchVoice();
  window.speechSynthesis.onvoiceschanged = loadBestFrenchVoice;
}

// Déverrouille l'API SpeechSynthesis et AudioContext suite à un geste utilisateur (clic)
window.unlockSpeechAudio = function() {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
    } catch(e) {}
  }
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!window._sharedAudioCtx) window._sharedAudioCtx = new AudioContextClass();
      if (window._sharedAudioCtx.state === 'suspended') {
        window._sharedAudioCtx.resume();
      }
    }
  } catch(e) {}
};

// ============================================================================
// MUTEX GLOBAL AUDIO & CONTRÔLE DES FLUX (ZÉRO CONCURRENCE SONORE GARANTIE)
// ============================================================================
window._tourExecutionEpoch = 0;
window._mediaPlaybackId = 0;
window._ttsAbortController = null;
window._tourStepTimeout = null;

window.HARD_AUDIO_MUTEX = {
  currentSource: null, // 'TOUR_INTRO' | 'TOUR_OUTRO' | 'CHAT_REPLY' | 'VIDEO'
  activeAudio: null,
  activeTtsAbort: null,
  token: 0
};

// Arrêt absolu et inconditionnel de tout son, voix, requête TTS et vidéo
window.killAllSoundsAndVideos = function(reason = "") {
  window.HARD_AUDIO_MUTEX.token++;
  window.HARD_AUDIO_MUTEX.currentSource = null;
  window._mediaPlaybackId++;

  // 1. Annuler toute requête HTTP TTS en cours de chargement
  if (window._ttsAbortController) {
    try { window._ttsAbortController.abort(); } catch(e) {}
    window._ttsAbortController = null;
  }
  if (window.HARD_AUDIO_MUTEX.activeTtsAbort) {
    try { window.HARD_AUDIO_MUTEX.activeTtsAbort.abort(); } catch(e) {}
    window.HARD_AUDIO_MUTEX.activeTtsAbort = null;
  }

  // 2. Couper et détruire tout objet Audio HTML5 en cours
  if (window.HARD_AUDIO_MUTEX.activeAudio) {
    try {
      window.HARD_AUDIO_MUTEX.activeAudio.pause();
      window.HARD_AUDIO_MUTEX.activeAudio.currentTime = 0;
    } catch(e) {}
    window.HARD_AUDIO_MUTEX.activeAudio = null;
  }
  if (window._mentorAudioPlayer) {
    try {
      window._mentorAudioPlayer.pause();
      window._mentorAudioPlayer.currentTime = 0;
    } catch(e) {}
    window._mentorAudioPlayer = null;
  }

  // 3. Couper et mettre en pause la vidéo Synthesia
  const player = document.getElementById('synthesia-player');
  if (player) {
    try {
      player.pause();
      player.currentTime = 0;
    } catch(e) {}
  }

  // 4. Stopper tout timer de décompte vidéo ou de transition
  if (window._videoTimerInterval) {
    clearInterval(window._videoTimerInterval);
    window._videoTimerInterval = null;
  }
  if (window._tourStepTimeout) {
    clearTimeout(window._tourStepTimeout);
    window._tourStepTimeout = null;
  }
  window._currentVideoEndCallback = null;

  // 5. Stopper toute synthèse vocale système
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e) {}
  }
  if (window._mentorVoiceResumeInterval) {
    clearInterval(window._mentorVoiceResumeInterval);
    window._mentorVoiceResumeInterval = null;
  }
  window._currentMentorUtterance = null;

  // 6. Réinitialiser les animations d'avatar
  const avatar = document.getElementById('btn-coach-avatar');
  if (avatar) avatar.classList.remove('speaking');
};

window.stopAllMedia = function(options = {}) {
  const { resetTour = false } = options;
  if (resetTour) {
    window._tourExecutionEpoch++;
  }
  window.killAllSoundsAndVideos(options.reason || "stopAllMedia");
};

window.stopMentorVoice = function(resetStatus = true) {
  window.killAllSoundsAndVideos("stopMentorVoice");
  if (resetStatus) {
    const mentorStatus = document.getElementById('mentor-status-indicator');
    if (mentorStatus) mentorStatus.innerText = "À votre écoute";
  }
};

window.toggleMentorPause = function() {
  if (window.MENTOR_IS_PAUSED) {
    window.resumeMentorVoice();
  } else {
    window.pauseMentorVoice();
  }
};

window.pauseMentorVoice = function() {
  window.MENTOR_IS_PAUSED = true;
  if (window._mentorAudioPlayer && !window._mentorAudioPlayer.paused) {
    window._mentorAudioPlayer.pause();
  }
  const modal = document.getElementById('synthesia-video-modal');
  const isVideoOpen = modal && !modal.classList.contains('hidden');
  const player = document.getElementById('synthesia-player');
  if (isVideoOpen && player && !player.paused) {
    player.pause();
  }
  const pauseIcon = document.getElementById('mentor-pause-icon');
  const pauseLabel = document.getElementById('mentor-pause-label');
  const btnPause = document.getElementById('btn-mentor-pause');
  const dockPauseIcon = document.getElementById('dock-pause-icon');
  const statusIndicator = document.getElementById('mentor-status-indicator');

  if (pauseIcon) pauseIcon.innerText = "▶️";
  if (pauseLabel) pauseLabel.innerText = "Reprendre";
  if (btnPause) btnPause.classList.add('paused');
  if (dockPauseIcon) dockPauseIcon.innerText = "▶";
  if (statusIndicator) statusIndicator.innerText = "⏸️ Présentation en pause";
};

window.resumeMentorVoice = function() {
  window.MENTOR_IS_PAUSED = false;

  const modal = document.getElementById('synthesia-video-modal');
  const isVideoOpen = modal && !modal.classList.contains('hidden');
  const player = document.getElementById('synthesia-player');

  // Si la capsule vidéo Synthesia est ouverte à l'écran, on reprend UNIQUEMENT la vidéo
  if (isVideoOpen && player) {
    if (player.paused) {
      player.play().catch(e => console.warn(e));
    }
  } else {
    // Si la vidéo est fermée ou masquée, elle DOIT ABSOLUMENT être arrêtée et ne JAMAIS jouer
    if (player) {
      try {
        player.pause();
        player.currentTime = 0;
      } catch(e) {}
    }

    // On reprend UNIQUEMENT l'audio du mentor / chatbot
    if (window._mentorAudioPlayer && window._mentorAudioPlayer.paused) {
      window._mentorAudioPlayer.play().catch(e => console.warn(e));
    }
  }

  const pauseIcon = document.getElementById('mentor-pause-icon');
  const pauseLabel = document.getElementById('mentor-pause-label');
  const btnPause = document.getElementById('btn-mentor-pause');
  const dockPauseIcon = document.getElementById('dock-pause-icon');
  const statusIndicator = document.getElementById('mentor-status-indicator');

  if (pauseIcon) pauseIcon.innerText = "⏸️";
  if (pauseLabel) pauseLabel.innerText = "Pause";
  if (btnPause) btnPause.classList.remove('paused');
  if (dockPauseIcon) dockPauseIcon.innerText = "⏸";
  if (statusIndicator) statusIndicator.innerText = "▶️ Présentation active";
};

// Fonction maîtresse : Synthèse Vocale Humaine Unique (Zéro Concurrence)
window.speakMentorVoice = async function(text, onEndCallback = null, forcePlay = false) {
  if (!IQ_BOT_VOICE_ENABLED) {
    if (onEndCallback) setTimeout(onEndCallback, 300);
    return;
  }

  // 1. Couper instantanément tout son ou vidéo antérieur
  window.killAllSoundsAndVideos("speakMentorVoice");

  if (forcePlay) {
    window.MENTOR_IS_PAUSED = false;
    const btnPause = document.getElementById('btn-mentor-pause');
    if (btnPause) btnPause.classList.remove('paused');
    const pauseIcon = document.getElementById('mentor-pause-icon');
    if (pauseIcon) pauseIcon.innerText = "⏸️";
    const pauseLabel = document.getElementById('mentor-pause-label');
    if (pauseLabel) pauseLabel.innerText = "Pause";
  }

  const myToken = ++window.HARD_AUDIO_MUTEX.token;
  const abortCtrl = new AbortController();
  window._ttsAbortController = abortCtrl;
  window.HARD_AUDIO_MUTEX.activeTtsAbort = abortCtrl;

  window.unlockSpeechAudio();

  const cleanText = text
    .replace(/24\/7/g, 'en continu')
    .replace(/24 \/ 7/g, 'en continu')
    .replace(/:\s+/g, '. ')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[\*\#\_\[\]\(\)]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/•/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    if (onEndCallback) onEndCallback();
    return;
  }

  const avatar = document.getElementById('btn-coach-avatar');
  const mentorStatus = document.getElementById('mentor-status-indicator');
  if (avatar) avatar.classList.add('speaking');
  if (mentorStatus) mentorStatus.innerText = "Le Mentor vous parle...";

  // Mémorisation du contexte de discours actif pour permettre la reprise immédiate lors d'un switch de voix
  window._currentMentorSpeechContext = {
    text: cleanText,
    onEndCallback: onEndCallback,
    forcePlay: forcePlay
  };

  let finished = false;
  const finishVoice = () => {
    if (finished) return;
    finished = true;
    if (avatar) avatar.classList.remove('speaking');
    if (mentorStatus && mentorStatus.innerText === "Le Mentor vous parle...") {
      mentorStatus.innerText = window.MENTOR_IS_PAUSED ? "⏸️ En pause" : "À votre écoute";
    }
    if (myToken === window.HARD_AUDIO_MUTEX.token) {
      window.HARD_AUDIO_MUTEX.activeAudio = null;
      window._mentorAudioPlayer = null;
      window._currentMentorSpeechContext = null;
      if (onEndCallback && typeof onEndCallback === 'function') {
        setTimeout(onEndCallback, 300);
      }
    }
  };

  try {
    const ttsResponse = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: cleanText, 
        voice: window.LIVE_VOICE_SELECTED || 'Antoine' 
      }),
      signal: abortCtrl.signal
    });

    if (myToken !== window.HARD_AUDIO_MUTEX.token) return;

    if (ttsResponse.ok) {
      const audioBlob = await ttsResponse.blob();
      if (myToken !== window.HARD_AUDIO_MUTEX.token) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      window._mentorAudioPlayer = audio;
      window.HARD_AUDIO_MUTEX.activeAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        finishVoice();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        finishVoice();
      };

      if (!window.MENTOR_IS_PAUSED || forcePlay) {
        await audio.play();
      } else {
        if (mentorStatus) mentorStatus.innerText = "⏸️ Audio en pause";
      }
      return;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.warn("Échec appel TTS serveur :", err.message);
  }

  // 1. Fallback Web Speech API natif du navigateur si le serveur n'a pas répondu
  if (window.speechSynthesis && (!window.MENTOR_IS_PAUSED || forcePlay)) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'fr-CA';
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang === 'fr-CA') || voices.find(v => v.lang && v.lang.startsWith('fr')) || null;
      if (frVoice) utter.voice = frVoice;
      utter.rate = 1.05;
      utter.onend = () => finishVoice();
      utter.onerror = () => finishVoice();
      window.speechSynthesis.speak(utter);
      return;
    } catch (speechErr) {
      console.warn("Échec fallback SpeechSynthesis :", speechErr);
    }
  }

  // 2. Sécurité de lecture : si aucune voix n'a pu parler, NE PAS sauter l'étape immédiatement !
  // On laisse à l'utilisateur le temps nécessaire pour lire le texte à l'écran.
  const wordsCount = cleanText.split(/\s+/).length;
  const readingDelayMs = Math.min(9000, Math.max(4500, wordsCount * 280));
  setTimeout(finishVoice, readingDelayMs);
};

// Rétrocompatibilité avec speakBotText (forcePlay = true pour parler vocalement la réponse du chat)
function speakBotText(text, onEndCallback = null) {
  window.speakMentorVoice(text, onEndCallback, true);
}
window.speakBotText = speakBotText;

// ============================================================================
// MATRICE OFFICIELLE D'ORCHESTRATION DES 7 JALONS DU CYCLE DE VIE IA
// ============================================================================
const MENTOR_STEPS_ORCHESTRATION = [
  {
    step: 0,
    title: "Dépôt de la demande",
    floorName: "Rez-de-chaussée",
    actor: "Demandeur • Octopus",
    speechIntro: (name, role) => {
      const cleanName = (name && name.trim()) ? name.trim() : "";
      const greeting = cleanName ? `Bonjour ${cleanName} ! ` : "Bonjour ! ";
      const cleanRole = (role && role.trim()) ? role.trim() : "employé d'Investissement Québec";
      const prefix = /^[aeiouyéèêëàâîïôûü]/i.test(cleanRole) ? "En tant qu'" : "En tant que ";
      return `${greeting}Bienvenue au rez-de-chaussée de notre tour de gouvernance. Toute initiative prend naissance ici, par le dépôt officiel du besoin d'affaires sur notre guichet d'entrée Octopus. ${prefix}${cleanRole}, Investissement Québec encadre la prise en charge selon trois parcours exclusifs. Premièrement, l'acquisition de logiciels tiers par l'équipe TI. Deuxièmement, l'attribution rapide de licences pour nos outils déjà homologués comme Copilot ou Claude. Troisièmement, la création de nouveaux cas d'usage avec l'Escouade IA. Dès que votre demande est soumise avec ses gains de temps estimés, le Bureau de l'IA prend le relais. Découvrons ensemble la capsule vidéo officielle de bienvenue !`;
    },
    speechOutro: (name, role) => `La demande est maintenant formellement enregistrée sur le guichet Octopus. Montons au premier étage pour découvrir les quatre étapes de qualification menées par le Bureau de l'IA !`,
    videoPath: "documents_phases/Etape_0_Depot/capsule_etape_0.mp4",
    tool: "Formulaire_Depot_Demande_IA_Octopus.xlsx",
    toolPath: "documents_phases/Etape_0_Depot/Formulaire_Depot_Demande_IA_Octopus.xlsx",
    scriptSummary: "Guichet Octopus & 3 parcours officiels (Logiciel TI, Licences autorisées, Cas d'usage d'affaires)."
  },
  {
    step: 1,
    title: "Qualification des cas d'usage",
    floorName: "1er Étage",
    actor: "Bureau de l'IA et experts",
    speechIntro: (name, role) => `Nous atteignons le premier étage, au sein de la salle de qualification du Bureau de l'IA et experts. Le processus officiel suit quatre étapes rigoureuses. D'abord, l'analyse de la valeur et des bénéfices anticipés, qui oriente vers la demande d'accompagnement si un outil autorisé suffit. Si aucun outil existant ne répond au besoin, nous analysons la faisabilité opérationnelle et les risques d'entreprise. Enfin, nous réalisons la veille technologique, sélectionnons l'outil et élaborons l'architecture préliminaire de la solution, indispensable pour l'évaluation des risques. Entrons dans la salle pour parcourir ces quatre postes !`,
    speechOutro: (name, role) => `La qualification des cas d'usage est conclue, l'outil approprié a été sélectionné et l'architecture préliminaire est établie ! L'initiative peut maintenant monter au deuxième étage pour l'évaluation approfondie du risque et la conformité Loi 25.`,
    videoPath: "documents_phases/Etape_1_Qualification/capsule_etape_1.mp4",
    tool: "Grille_faisabilite_cas_usage_IA.xlsx",
    toolPath: "documents_phases/Etape_1_Qualification/Grille_faisabilite_cas_usage_IA.xlsx",
    scriptSummary: "Qualification en 4 étapes : Analyse de la valeur, Accompagnement, Faisabilité & Risques, Veille, sélection d'outil et architecture préliminaire."
  },
  {
    step: 2,
    title: "Évaluation des risques & Priorisation",
    floorName: "2e Étage",
    actor: "Bureau IA + Expertises (DGIR, Cyber, PRP)",
    speechIntro: (name, role) => `Nous voici au deuxième étage, dans la Cellule d'Expertise Matricielle. Le Bureau de l'IA s'associe ici à la Cybersécurité, à la DGIR et aux experts juridiques de la Loi 25. Pourquoi fait-on cette analyse rigoureuse ? D'abord, pour protéger les renseignements personnels des citoyens et entreprises québécoises grâce à une évaluation approfondie des facteurs relatifs à la vie privée, avec interdiction formelle de réutiliser nos données pour entraîner des modèles publics. Ensuite, nous appliquons une méthode scientifique de priorisation qui évalue à quel point votre solution est proche d'une solution idéale prête. Cela combine la qualité des données, la cybersécurité et la maturité de l'intelligence artificielle. Ce calcul empêche qu'une promesse de gain financier attrayante ne vienne masquer un risque critique de sécurité ou une défaillance d'éthique. Votre initiative reçoit ainsi une note objective et transparente.`,
    speechOutro: (name, role) => `L'évaluation matricielle des risques est achevée et nos exigences de mitigation sont documentées. Montons au troisième étage pour soumettre le Mémo Décisionnel officiel aux comités d'arbitrage !`,
    videoPath: "documents_phases/Etape_2_Risques_Priorisation/capsule_etape_2.mp4",
    tool: "Questionnaire_Evaluation_Loi_25_EFVP.xlsx",
    toolPath: "documents_phases/Etape_2_Risques_Priorisation/Questionnaire_Evaluation_Loi_25_EFVP.xlsx",
    scriptSummary: "Cellule conjointe DGIR, Cyber et Loi 25. Priorisation objective mesurant la proximité avec une solution idéale prête."
  },
  {
    step: 3,
    title: "Décision Go / No-Go",
    floorName: "3e Étage",
    actor: "Bureau IA / Comité IA / CD",
    speechIntro: (name, role) => `Nous voici au troisième étage, le salon des comités décisionnels. C'est l'étape de l'arbitrage formel, appuyé sur le Mémo Décisionnel préparé par le Bureau de l'IA. Selon le niveau de risque, trois instances peuvent autoriser le projet. Premièrement, la voie accélérée du Bureau de l'IA pour les risques minimes. Deuxièmement, le Comité de Gouvernance de l'IA pour les projets modérés. Troisièmement, le Comité de Direction réunissant la Présidence et les premiers vice-présidents pour les risques élevés. Sans ce feu vert officiel, aucune dépense ni ressource ne peut être engagée.`,
    speechOutro: (name, role) => `L'arbitrage Go officiel est accordé par le comité ! Nous pouvons maintenant mobiliser l'équipe et monter au quatrième étage pour construire le prototype en laboratoire.`,
    videoPath: "documents_phases/Etape_3_Decision_GoNoGo/capsule_etape_3.mp4",
    tool: "00_Memo_Decisionnel_Comite_IA.docx",
    toolPath: "documents_phases/Etape_3_Decision_GoNoGo/00_Memo_Decisionnel_Comite_IA.docx",
    scriptSummary: "Arbitrage Go/No-Go selon 3 instances : Voie accélérée Bureau IA, Comité IA ou Comité de Direction."
  },
  {
    step: 4,
    title: "Développement encadré (Pilote POC)",
    floorName: "4e Étage",
    actor: "Bureau IA + Escouade IA",
    speechIntro: (name, role) => `Nous entrons au quatrième étage, dans le laboratoire de prototypage de l'Escouade IA. Notre principe fondamental est de ne jamais déployer à l'aveugle. Nous réalisons une Preuve de Concept en bac à sable infonuagique hautement sécurisé d'IQ. Développeurs et experts métiers testent la précision du modèle, éliminent les hallucinations selon le standard NIST et verrouillent une supervision humaine obligatoire. Si les gains réels sont au rendez-vous, la solution est prête à franchir la passerelle technologique vers les TI !`,
    speechOutro: (name, role) => `La preuve de concept a démontré toute sa pertinence et sa robustesse ! L'initiative s'apprête maintenant à traverser la passerelle d'homologation vers le Bâtiment des TI, marquant le passage officiel au Déploiement !`,
    videoPath: "documents_phases/Etape_4_Pilote_POC/capsule_etape_4.mp4",
    tool: "Grille_Evaluation_Bilan_Pilote_POC.xlsx",
    toolPath: "documents_phases/Etape_4_Pilote_POC/Grille_Evaluation_Bilan_Pilote_POC.xlsx",
    scriptSummary: "Expérimentation agile en bac à sable infonuagique sécurisé d'IQ, zéro rétention et supervision humaine."
  },
  {
    step: 5,
    title: "Déploiement contrôlé & Homologation",
    floorName: "5e Étage (Building des TI)",
    actor: "Direction des TI + Bureau IA",
    speechIntro: (name, role) => `Nous venons de traverser la Passerelle Technologique et nous entrons dans le Bâtiment de la Direction des TI. C'est le Déploiement officiel en production !

L'expérimentation en laboratoire est complétée. Deux voies s'ouvrent selon la nature de l'initiative.

• Première voie. Appel d'offres officiel. Pour certains projets d'envergure, les résultats de l'expérimentation ne sont pas codés sur mesure de zéro. Ils alimentent directement le Dossier d'opportunité officiel d'Investissement Québec pour acquérir une solution commerciale éprouvée sur le marché, selon le parcours habituel de nos projets.

• Deuxième voie. Architecture Qualité Production TI. Pour les autres projets développés à l'interne, les architectes de la Direction des TI prennent le relais. Ils conçoivent une véritable architecture de qualité production. Cela garantit une haute disponibilité, une intégration robuste aux systèmes maîtres et une sécurité renforcée.

L'homologation formelle est rendue avec la signature de l'évaluation des facteurs relatifs à la vie privée et nos quatre portes de décision. Le déploiement est officiellement lancé !`,
    speechOutro: (name, role) => `Le cadre de déploiement est validé. Qu'il s'agisse d'un appel d'offres fondé sur le dossier d'opportunité ou d'une architecture qualité production conçue par les architectes TI, l'initiative est sécurisée. Montons au sixième étage, au sommet du bâtiment des TI, pour la vigie continue en permanence.`,
    videoPath: "documents_phases/Etape_5_Deploiement_Controle/capsule_etape_5.mp4",
    tool: "ARP_Gabarit_Homologation_Securite.xlsx",
    toolPath: "documents_phases/Etape_5_Deploiement_Controle/ARP_Gabarit_Homologation_Securite.xlsx",
    scriptSummary: "Déploiement TI : Appel d'offres (Dossier d'opportunité alimenté par le pilote) ou Architecture Qualité Production TI."
  },
  {
    step: 6,
    title: "Exploitation & Surveillance continue",
    floorName: "6e Étage (Sommet TI)",
    actor: "Direction des TI (En continu)",
    speechIntro: (name, role) => `Nous voici au sommet du Bâtiment des TI, au sixième étage. C'est la Tour de Contrôle et la vigie en continu.

Le déploiement n'est pas la fin du projet, c'est le début de son cycle opérationnel.

• Surveillance en continu. La Direction des TI assure la surveillance continue de la disponibilité technique et de la dérive algorithmique des modèles.

• Prise en charge des incidents. Tout incident technique ou anomalie est pris en charge selon les processus établis dans Octopus.

• Maintien des compétences. Le Bureau de l'IA réalise des audits trimestriels pour prévenir l'érosion des compétences des employés.

L'initiative est désormais officiellement inscrite au Registre des actifs d'intelligence artificielle actifs d'Investissement Québec.`,
    speechOutro: (name, role) => `Félicitations ! Vous maîtrisez désormais l'intégralité du parcours d'une initiative d'IA à Investissement Québec. Pour concrétiser vos projets, notre guichet d'évaluation automatisé est dès maintenant à votre disposition : vous pouvez y compléter directement une demande d'analyse d'initiative, supportée par l'intelligence artificielle et validée par l'expertise humaine, ce qui accélère notre processus de 3 jours à seulement 3 minutes ! Je vous invite à ouvrir le guichet pour qualifier votre premier projet.`,
    videoPath: "documents_phases/Etape_6_Exploitation_Surveillance/capsule_etape_6.mp4",
    tool: "Registre_Officiel_Initiatives_IA_Actives.xlsx",
    toolPath: "documents_phases/Etape_6_Exploitation_Surveillance/Registre_Officiel_Initiatives_IA_Actives.xlsx",
    scriptSummary: "Maintien opérationnel en continu, vigie contre la dérive algorithmique et Registre officiel des actifs IA."
  }
];

// ============================================================================
// BOUCLE COMPLÈTE D'ORCHESTRATION GUIDÉE PAR LE MENTOR :
// EXPLICATION VOCALE -> CAPSULE VIDÉO -> ATTENTE FIN -> ÉTAPE SUIVANTE
// ============================================================================
window.runMentorStepLifecycle = function(stepIndex) {
  if (typeof stepIndex !== 'number' || stepIndex < 0 || stepIndex >= MENTOR_STEPS_ORCHESTRATION.length) return;

  const currentEpoch = ++window._tourExecutionEpoch;

  // 1. Couper immédiatement tout média antérieur (règle stricte d'exclusivité sonore)
  window.killAllSoundsAndVideos(`runMentorStepLifecycle_${stepIndex}`);

  window.unlockSpeechAudio();
  window.MENTOR_GUIDED_TOUR_ACTIVE = true;
  window.MENTOR_CURRENT_STEP = stepIndex;
  window.MENTOR_IS_PAUSED = false;
  window._currentTourPhase = 'INTRO';

  const config = MENTOR_STEPS_ORCHESTRATION[stepIndex];
  const userName = (window.USER_PROFILE && window.USER_PROFILE.name) ? window.USER_PROFILE.name.trim() : "";
  const userRole = (window.USER_PROFILE && window.USER_PROFILE.role && window.USER_PROFILE.role.trim()) 
    ? window.USER_PROFILE.role.trim() 
    : "employé d'Investissement Québec";

  // 2. Déplacer l'ascenseur physique 3D sans ouvrir de vidéo intempestive
  // Pour le jalon 1 (Bureau de l'IA), on saute le travelling caméra extérieur car enterBureauRoom zoome directement à l'intérieur
  window.goToLifecycleStep(stepIndex, false, stepIndex === 1);

  // Fermer toute capsule vidéo précédente
  window.closeSynthesiaVideo();

  // Masquer tout bandeau de reprise précédent
  const banner = document.getElementById('tour-interrupted-banner');
  if (banner) banner.classList.add('hidden');

  const statusIndicator = document.getElementById('mentor-status-indicator');

  // ==========================================================================
  // RÈGLE ABSOLUE : "ON COMMENCE PAR LA VIDÉO ENSUITE LE BOT"
  // AU REZ-DE-CHAUSSÉE (JALON 0), LA CAPSULE VIDÉO OFFICIELLE SE LANCE IMMÉDIATEMENT.
  // LE MENTOR PREND ENSUITE LE RELAIS DE VIVE VOIX À LA FIN DU VISIONNEMENT.
  // ==========================================================================
  if (stepIndex === 0) {
    window._currentTourPhase = 'VIDEO';
    if (statusIndicator) statusIndicator.innerText = "🎬 Capsule Vidéo Rez-de-chaussée en cours...";
    if (window.hideCoachSpeech) window.hideCoachSpeech();

    // 1. Lancement direct et sans délai de la capsule vidéo du RDC
    window.openSynthesiaVideo(0, null, true, () => {
      if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;

      // Fermeture de la vidéo pour dégager l'écran et la vue 3D
      window.closeSynthesiaVideo();

      // 2. Le Mentor prend le relais après la vidéo ("ensuite le bot")
      window._currentTourPhase = 'OUTRO';
      if (statusIndicator) statusIndicator.innerText = "Le Mentor prend le relais...";

      const cleanName = userName ? `${userName} ! ` : "";
      const cleanRole = userRole || "employé d'Investissement Québec";
      const prefix = /^[aeiouyéèêëàâîïôûü]/i.test(cleanRole) ? "En tant qu'" : "En tant que ";
      const botRelayText = `Bonjour ${cleanName}Bienvenue à la Tour de Gouvernance IA d'Investissement Québec ! Comme vous venez de le voir dans cette capsule, notre prise en charge structure tout besoin selon trois parcours officiels. ${prefix}${cleanRole}, vous pouvez me poser vos questions à tout moment dans le clavardage, ou bien nous montons ensemble au premier étage pour débuter la qualification au Bureau de l'IA !`;

      if (window.showCoachSpeech) {
        window.showCoachSpeech(botRelayText, [
          { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } },
          { label: "⏭️ 1er Étage : Qualification", action: { type: "NAVIGATE_STEP", step: 1 } }
        ]);
      }

      window.speakMentorVoice(botRelayText, () => {
        if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;

        // Transition automatique vers le 1er Étage (Jalon 1)
        window._tourStepTimeout = setTimeout(() => {
          if (currentEpoch === window._tourExecutionEpoch && window.MENTOR_GUIDED_TOUR_ACTIVE) {
            window.runMentorStepLifecycle(1);
          }
        }, 1800);
      });
    });
    return;
  }

  // ==========================================================================
  // JALON 1 : IMMERSION CINÉMATIQUE DU BUREAU DE L'IA AVEC LE BOT (4 POSTES)
  // ==========================================================================
  if (stepIndex === 1) {
    window._currentTourPhase = 'INTRO';
    if (statusIndicator) statusIndicator.innerText = "Jalon 1 : Qualification du Bureau de l'IA (Entrée en salle 3D)";

    // Entrer automatiquement et obligatoirement à l'intérieur de la salle du Bureau de l'IA
    if (window.enterBureauRoom) {
      window.enterBureauRoom();
    }

    const introSpeech = "Nous entrons au premier étage, au cœur du Bureau de l'IA ! Chaque initiative traverse obligatoirement quatre postes de travail : l'Analyse de la valeur, la Demande d'accompagnement, la Faisabilité et risques d'entreprise, puis la Veille et sélection technologique. Explorons ensemble chaque poste !";

    if (window.showCoachSpeech) {
      window.showCoachSpeech(introSpeech, [
        { label: "📍 Poste 1 : Analyse Valeur", action: { type: "SET_SUBSTEP", subStep: 0 } },
        { label: "💬 Clavardage", action: { type: "OPEN_CHAT" } }
      ]);
    }

    window.speakMentorVoice(introSpeech, () => {
      if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;
      window._tourStepTimeout = setTimeout(() => {
        if (currentEpoch === window._tourExecutionEpoch && window.MENTOR_GUIDED_TOUR_ACTIVE) {
          // Lancer obligatoirement la visite détaillée des 4 sous-postes du Bureau de l'IA
          if (window.runMentorBureauRoomExperience) {
            window.runMentorBureauRoomExperience(0);
          } else {
            window.runMentorStepLifecycle(2);
          }
        }
      }, 1500);
    });
    return;
  }

  // ==========================================================================
  // JALONS 2 À 6 : STRICTEMENT SANS VIDÉO, PARCOURS EN 3D GUIDÉ PAR LE ROBOT
  // ==========================================================================
  window._currentTourPhase = 'INTRO';
  const introText = config.speechIntro(userName, userRole);

  if (window.showCoachSpeech) {
    const actions = [
      { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } }
    ];
    if (stepIndex < 6) {
      actions.push({ label: `⏭️ Jalon ${stepIndex + 1}`, action: { type: "NAVIGATE_STEP", step: stepIndex + 1 } });
    }
    window.showCoachSpeech(introText, actions);
  }

  if (statusIndicator) {
    statusIndicator.innerText = `Jalon ${stepIndex} : Explication en cours...`;
  }

  window.speakMentorVoice(introText, () => {
    if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;

    if (statusIndicator) statusIndicator.innerText = `Jalon ${stepIndex} complété !`;

    if (window.showCoachSpeech) {
      const stepActions = [
        { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } }
      ];
      if (stepIndex < 6) {
        stepActions.push({ label: `⏭️ Jalon ${stepIndex + 1}`, action: { type: "NAVIGATE_STEP", step: stepIndex + 1 } });
      }
      window.showCoachSpeech(config.speechOutro(userName, userRole), stepActions);
    }

    if (stepIndex < 6) {
      window._tourStepTimeout = setTimeout(() => {
        if (currentEpoch === window._tourExecutionEpoch && window.MENTOR_GUIDED_TOUR_ACTIVE) {
          window.runMentorStepLifecycle(stepIndex + 1);
        }
      }, 2000);
    } else {
      if (statusIndicator) statusIndicator.innerText = "⭐ Cycle IA Terminé !";
      window.MENTOR_GUIDED_TOUR_ACTIVE = false;
      IQ_TOWER.autoTourRunning = false;
      if (IQ_TOWER.autoTourTimer) {
        clearTimeout(IQ_TOWER.autoTourTimer);
        IQ_TOWER.autoTourTimer = null;
      }
      if (window._tourStepTimeout) {
        clearTimeout(window._tourStepTimeout);
        window._tourStepTimeout = null;
      }
      const btnAutoTour = document.getElementById('btn-auto-tour');
      if (btnAutoTour) {
        btnAutoTour.classList.remove('active', 'active-tour');
        const tourIcon = document.getElementById('auto-tour-icon');
        const tourText = document.getElementById('auto-tour-text');
        if (tourIcon) tourIcon.innerText = '▶';
        if (tourText) tourText.innerText = 'Visite Guidée';
      }
      const finalGreeting = userName ? userName : "cher collègue";

      // Zoom cinématique fluide montrant l'ensemble du campus et les deux tours
      if (window.gsap && IQ_TOWER.camera && IQ_TOWER.controls) {
        gsap.to(IQ_TOWER.camera.position, {
          x: 88,
          y: 82,
          z: 125,
          duration: 3.2,
          ease: "power2.inOut"
        });
        gsap.to(IQ_TOWER.controls.target, {
          x: 38,
          y: 52,
          z: 0,
          duration: 3.2,
          ease: "power2.inOut"
        });
      }

      const finalSpeech = config.speechOutro(userName, userRole);
      const finalMessage = `Félicitations ${finalGreeting} ! Vous avez complété avec succès l'ensemble du cycle d'initiative IA d'Investissement Québec.\n\n⚡ <strong>Formulaire automatisé d'évaluation :</strong>\nVous pouvez dès maintenant compléter une <strong>demande d'analyse complète</strong>, supportée par l'intelligence artificielle et validée par l'humain. Cette automatisation rigoureuse accélère notre processus d'évaluation de <strong>3 jours à seulement 3 minutes</strong> !\n\n• <strong>Tour du Bureau de l'IA (gauche) :</strong> Qualification, Évaluation des risques, Arbitrage et Pilote en laboratoire.\n• <strong>Bâtiment des TI (droite) :</strong> Industrialisation qualité production, Déploiement et Surveillance continue permanente.\n• <strong>Passerelle Technologique :</strong> Homologation rigoureuse et transfert sécurisé des modèles.`;

      if (window.showCoachSpeech) {
        window.showCoachSpeech(finalMessage, [
          { label: "📝 Demande d'analyse (3 min)", action: { type: "OPEN_EVALUATION" } },
          { label: "🏢 Vue d'ensemble des 2 Tours", action: { type: "PANORAMA_VIEW" } },
          { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } },
          { label: "🔄 Recommencer au Rez-de-chaussée", action: { type: "NAVIGATE_STEP", step: 0 } }
        ]);
      }

      window.speakMentorVoice(finalSpeech);
    }
  });
};

// Orchestration du parcours immersif à l'intérieur de la salle du Bureau de l'IA (4 postes)
window.runMentorBureauRoomExperience = function(subIdx = 0) {
  if (!window.MENTOR_GUIDED_TOUR_ACTIVE) return;
  const currentEpoch = window._tourExecutionEpoch;

  if (subIdx >= BUREAU_IA_WORK_STEPS.length) {
    // Les 4 postes ont été complétés : sortie cinématique et transition vers le 2e Étage
    if (window.exitBureauRoom) window.exitBureauRoom();

    const outroSpeech = "Les quatre postes de qualification du Bureau de l'IA sont validés avec succès ! Nous sortons maintenant de la salle pour monter au deuxième étage vers l'évaluation des risques et la priorisation matricielle.";
    if (window.showCoachSpeech) {
      window.showCoachSpeech(outroSpeech, [
        { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } },
        { label: "⏭️ 2e Étage : Risques & Priorisation", action: { type: "NAVIGATE_STEP", step: 2 } }
      ]);
    }

    window.speakMentorVoice(outroSpeech, () => {
      if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;
      window._tourStepTimeout = setTimeout(() => {
        if (currentEpoch === window._tourExecutionEpoch && window.MENTOR_GUIDED_TOUR_ACTIVE) {
          window.runMentorStepLifecycle(2);
        }
      }, 1600);
    });
    return;
  }

  // Déplacer la caméra vers le sous-poste à l'intérieur de la salle
  window.goToRoomSubStep(subIdx);

  const stepData = BUREAU_IA_WORK_STEPS[subIdx];
  const speechText = stepData.speech || stepData.summary;

  const actions = [
    { label: "💬 Poser une question", action: { type: "OPEN_CHAT" } }
  ];
  if (subIdx < BUREAU_IA_WORK_STEPS.length - 1) {
    const nextTitle = BUREAU_IA_WORK_STEPS[subIdx + 1].title.replace(/^\d+\.\d+\s*/, '').split('&')[0].trim();
    actions.push({ 
      label: `⏭️ Poste ${subIdx + 2} : ${nextTitle}`, 
      action: { type: "SET_SUBSTEP", subStep: subIdx + 1 } 
    });
  } else {
    actions.push({ 
      label: "🚪 Sortir & Étage 2", 
      action: { type: "NAVIGATE_STEP", step: 2 } 
    });
  }

  if (window.showCoachSpeech) {
    window.showCoachSpeech(speechText, actions);
  }

  const statusIndicator = document.getElementById('mentor-status-indicator');
  if (statusIndicator) {
    statusIndicator.innerText = `Bureau IA • Poste ${subIdx + 1}/4 en cours...`;
  }

  window.speakMentorVoice(speechText, () => {
    if (currentEpoch !== window._tourExecutionEpoch || !window.MENTOR_GUIDED_TOUR_ACTIVE) return;

    // Progression automatique vers le poste suivant
    window._tourStepTimeout = setTimeout(() => {
      if (currentEpoch === window._tourExecutionEpoch && window.MENTOR_GUIDED_TOUR_ACTIVE) {
        window.runMentorBureauRoomExperience(subIdx + 1);
      }
    }, 1800);
  });
};

// Navigation en 2 temps du Guichet d'accueil (Accéder au Bureau de l'IA -> Choix des 2 options)
window.proceedToWelcomeChoices = function() {
  window.unlockSpeechAudio();
  const nameInput = document.getElementById('welcome-name-input');
  const roleInput = document.getElementById('welcome-role-input');
  if (nameInput) {
    const val = nameInput.value.trim();
    window.USER_PROFILE.name = val;
    localStorage.setItem('iq_user_name', val);
  }
  if (roleInput) {
    const val = roleInput.value.trim() || "Employé d'Investissement Québec";
    window.USER_PROFILE.role = val;
    localStorage.setItem('iq_user_role', val);
  }
  if (window.updateUserProfileUI) window.updateUserProfileUI();

  const targetNameSpan = document.getElementById('welcome-user-display-name');
  if (targetNameSpan) {
    targetNameSpan.textContent = window.USER_PROFILE.name || "collègue";
  }

  const targetName = (window.USER_PROFILE.name && window.USER_PROFILE.name.trim()) ? window.USER_PROFILE.name.trim() : "collègue";

  const step1 = document.getElementById('welcome-step-identification');
  const step2 = document.getElementById('welcome-step-choices');
  if (step1 && step2) {
    step1.style.display = 'none';
    step2.style.display = 'block';
  }

  // Lecture vocale avec la voix officielle haute fidélité du parcours (Antoine ou Sylvie via speakMentorVoice)
  const chosenVoice = window.LIVE_VOICE_SELECTED || 'Antoine';
  const counselorGender = chosenVoice === 'Sylvie' ? "votre conseillère" : "votre conseiller";
  const vis = document.getElementById('mentor-voice-visualizer');
  if (vis) {
    vis.style.display = 'flex';
    const visSpan = vis.querySelector('span:last-child');
    if (visSpan) visSpan.textContent = `${chosenVoice} vous parle`;
  }

  const welcomeSpeech = `Bonjour ${targetName} ! Je suis ${chosenVoice}, ${counselorGender} en gouvernance de l'IA d'Investissement Québec. Pour bien débuter votre démarche, je vous recommande vivement de commencer par la Capsule d'initiation afin de comprendre le parcours en 6 étapes, ou de déposer directement votre Demande d'Analyse au guichet.`;

  window.speakMentorVoice(welcomeSpeech, () => {
    if (vis) vis.style.display = 'none';
  }, true);
};

// Arrêt immédiat et garanti du son dès que l'usager quitte la fenêtre, change d'onglet ou clique ailleurs
function stopAllSpeechImmediately() {
  if (window.killAllSoundsAndVideos) {
    try { window.killAllSoundsAndVideos("stopAllSpeechImmediately"); } catch(e) {}
  }
  if (window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch(e) {}
  }
  const vis = document.getElementById('mentor-voice-visualizer');
  if (vis) vis.style.display = 'none';
}
window.stopAllSpeechImmediately = stopAllSpeechImmediately;

window.addEventListener('blur', stopAllSpeechImmediately);
window.addEventListener('beforeunload', stopAllSpeechImmediately);
window.addEventListener('pagehide', stopAllSpeechImmediately);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAllSpeechImmediately();
});

// Arrêter le son au clic sur n'importe quel lien sortant
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', stopAllSpeechImmediately);
  });
});

window.backToWelcomeIdentification = function() {
  stopAllSpeechImmediately();
  const step1 = document.getElementById('welcome-step-identification');
  const step2 = document.getElementById('welcome-step-choices');
  if (step1 && step2) {
    step2.style.display = 'none';
    step1.style.display = 'block';
  }
  // Re-synchroniser systématiquement et visuellement la voix sélectionnée
  const curVoice = window.LIVE_VOICE_SELECTED || localStorage.getItem('iq_voice_choice') || 'Antoine';
  window.selectMentorVoice(curVoice);
};

// Déclencheur du bouton principal d'embarquement (Overlay de bienvenue)
window.startMentorOrchestratedExperience = function(targetStep = 0) {
  window.unlockSpeechAudio();

  // Enregistrer le nom et rôle saisis dans la fenêtre d'accueil (avec champ libre et fallback)
  const nameInput = document.getElementById('welcome-name-input');
  const roleInput = document.getElementById('welcome-role-input');
  if (nameInput) {
    const val = nameInput.value.trim();
    window.USER_PROFILE.name = val;
    localStorage.setItem('iq_user_name', val);
  }
  if (roleInput) {
    const val = roleInput.value.trim() || "Employé d'Investissement Québec";
    window.USER_PROFILE.role = val;
    localStorage.setItem('iq_user_role', val);
  }
  if (window.updateUserProfileUI) window.updateUserProfileUI();

  const overlay = document.getElementById('experience-welcome-overlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.96)';
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 380);
  }

  window.MENTOR_GUIDED_TOUR_ACTIVE = true;

  const stepToRun = (typeof targetStep === 'number') ? targetStep : 0;
  setTimeout(() => {
    window.runMentorStepLifecycle(stepToRun);
  }, 450);
};

// Passer immédiatement à l'étape suivante orchestrée (sans boucler à la fin)
window.goToNextOrchestratedStep = function() {
  window.unlockSpeechAudio();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (window._videoTimerInterval) {
    clearInterval(window._videoTimerInterval);
    window._videoTimerInterval = null;
  }

  const current = (typeof window.MENTOR_CURRENT_STEP === 'number') ? window.MENTOR_CURRENT_STEP : (IQ_TOWER.currentStepIndex || 0);
  if (current >= 6) {
    // Si le sommet (Étage 6) est atteint, la visite se termine sans tourner en boucle
    window.MENTOR_GUIDED_TOUR_ACTIVE = false;
    return;
  }
  const nextStep = current + 1;
  window.runMentorStepLifecycle(nextStep);
};

// Fermer l'overlay sans lancer le parcours
window.dismissWelcomeOverlay = function() {
  window.unlockSpeechAudio();
  const overlay = document.getElementById('experience-welcome-overlay');
  if (overlay) overlay.classList.add('hidden');
};

// ============================================================================
// COPILOT IA : CONSCIENCE D'ÉTAT TEMPS RÉEL & PILOTAGE DE L'INTERFACE
// ============================================================================
window.getCurrentSimulationState = function() {
  const currentStep = (typeof IQ_TOWER.currentStepIndex === 'number') ? IQ_TOWER.currentStepIndex : 0;
  const stepData = SLIDE8_LIFECYCLE[currentStep] || {};
  const isRoom = !!IQ_TOWER.isInsideRoom;
  const subStepIdx = (typeof IQ_TOWER.roomSubStepIndex === 'number') ? IQ_TOWER.roomSubStepIndex : 0;
  const subStepData = (typeof BUREAU_IA_WORK_STEPS !== 'undefined' && BUREAU_IA_WORK_STEPS[subStepIdx]) || {};
  const videoModal = document.getElementById('synthesia-video-modal');
  const isVideoOpen = videoModal && !videoModal.classList.contains('hidden');
  const dashboard = document.getElementById('slide8-dashboard');
  const isDashboardOpen = dashboard && !dashboard.classList.contains('collapsed');

  return {
    step: currentStep,
    stepTitle: stepData.title || `Jalon ${currentStep}`,
    stepActor: stepData.actor || "Non spécifié",
    isInsideRoom: isRoom,
    subStep: isRoom ? subStepIdx : null,
    subStepTitle: isRoom ? (subStepData.title || `Sous-étape ${subStepIdx}`) : null,
    videoOpen: isVideoOpen,
    dashboardOpen: isDashboardOpen,
    autoPlayVideo: !!IQ_TOWER.autoPlayVideo
  };
};

window.updateCopilotStateBadge = function() {
  const textEl = document.getElementById('bot-context-text');
  if (!textEl) return;
  const state = window.getCurrentSimulationState();

  if (state.isInsideRoom) {
    const cleanSub = state.subStepTitle ? state.subStepTitle.split('•')[0].trim() : `1.${(state.subStep || 0) + 1}`;
    textEl.innerText = `📍 Jalon 1 : Bureau IA › ${cleanSub}`;
  } else {
    textEl.innerText = `📍 Jalon ${state.step} : ${state.stepTitle} • Tour 3D`;
  }
};

window.executeCopilotAction = function(act) {
  if (!act || !act.type) return;

  switch (act.type) {
    case 'NAVIGATE_STEP':
      if (typeof act.step === 'number') {
        // En mode action Copilot / Chat : déplacement 3D silencieux uniquement !
        goToLifecycleStep(act.step, false);
      }
      break;

    case 'PANORAMA_VIEW':
      if (window.gsap) {
        gsap.to(IQ_TOWER.camera.position, { x: 88, y: 82, z: 125, duration: 2.5, ease: "power2.inOut" });
        gsap.to(IQ_TOWER.controls.target, { x: 38, y: 52, z: 0, duration: 2.5, ease: "power2.inOut" });
      }
      break;

    case 'NEXT_ORCHESTRATED_STEP':
      if (window.goToNextOrchestratedStep) window.goToNextOrchestratedStep();
      break;

    case 'ENTER_ROOM':
      if (IQ_TOWER.currentStepIndex !== 1) {
        goToLifecycleStep(1);
        setTimeout(() => {
          if (window.enterBureauRoom) window.enterBureauRoom();
        }, 800);
      } else if (!IQ_TOWER.isInsideRoom) {
        if (window.enterBureauRoom) window.enterBureauRoom();
      }
      break;

    case 'EXIT_ROOM':
      if (IQ_TOWER.isInsideRoom && window.exitBureauRoom) {
        window.exitBureauRoom();
      }
      break;

    case 'SET_SUBSTEP':
      if (typeof act.subStep === 'number') {
        if (!IQ_TOWER.isInsideRoom) {
          if (IQ_TOWER.currentStepIndex !== 1) goToLifecycleStep(1);
          setTimeout(() => {
            if (window.enterBureauRoom) window.enterBureauRoom();
            setTimeout(() => {
              if (window.goToRoomSubStep) window.goToRoomSubStep(act.subStep);
            }, 600);
          }, 800);
        } else {
          if (window.goToRoomSubStep) window.goToRoomSubStep(act.subStep);
        }
      }
      break;

    case 'OPEN_ACCOMPAGNEMENT':
      if (window.openAccompagnementModal) window.openAccompagnementModal();
      break;

    case 'OPEN_EVALUATION':
      window.location.href = '/evaluation.html';
      break;

    case 'SELECT_ACCOMPAGNEMENT':
      if (window.selectAccompagnementPathway) window.selectAccompagnementPathway(act.pathway || 'business');
      break;

    case 'OPEN_VIDEO':
      {
        const s = (typeof act.step === 'number') ? act.step : (IQ_TOWER.currentStepIndex || 0);
        const sub = (typeof act.subStep === 'number') ? act.subStep : (IQ_TOWER.isInsideRoom ? IQ_TOWER.roomSubStepIndex : null);
        if (window.openSynthesiaVideo) window.openSynthesiaVideo(s, sub, true);
      }
      break;

    case 'CLOSE_VIDEO':
      if (window.closeSynthesiaVideo) window.closeSynthesiaVideo();
      break;

    case 'TOGGLE_DASHBOARD':
      {
        const db = document.getElementById('slide8-dashboard');
        const icon = document.getElementById('toggle-icon');
        const label = document.getElementById('toggle-label');
        if (db) {
          const shouldOpen = (act.open !== undefined) ? act.open : db.classList.contains('collapsed');
          if (shouldOpen) {
            db.classList.remove('collapsed');
            if (icon) icon.innerText = '▼';
            if (label) label.innerText = 'Masquer le cycle complet';
          } else {
            db.classList.add('collapsed');
            if (icon) icon.innerText = '▲';
            if (label) label.innerText = '📊 Afficher le cycle complet';
          }
        }
      }
      break;

    case 'AUTO_TOUR':
      {
        const enable = (act.enable !== undefined) ? act.enable : !IQ_TOWER.autoTourRunning;
        const btn = document.getElementById('btn-auto-tour');
        const icon = document.getElementById('auto-tour-icon');
        const text = document.getElementById('auto-tour-text');
        IQ_TOWER.autoTourRunning = enable;
        if (enable) {
          if (btn) btn.classList.add('active');
          if (icon) icon.innerText = '⏸';
          if (text) text.innerText = 'Pause Visite';
          runAutoTourStep();
        } else {
          if (btn) btn.classList.remove('active');
          if (icon) icon.innerText = '▶';
          if (text) text.innerText = 'Visite Guidée';
          clearTimeout(IQ_TOWER.autoTourTimer);
        }
      }
      break;

    case 'OPEN_CHAT':
      if (window.toggleChatDrawer) {
        const drawer = document.getElementById('chat-drawer');
        if (drawer && drawer.classList.contains('hidden')) {
          window.toggleChatDrawer();
        }
      }
      break;

    default:
      console.warn('Action Copilot non gérée :', act.type);
  }

  setTimeout(window.updateCopilotStateBadge, 400);
};

window.executeCopilotActions = function(actions) {
  if (!actions || !Array.isArray(actions) || actions.length === 0) return;
  let delay = 0;
  actions.forEach(act => {
    setTimeout(() => {
      window.executeCopilotAction(act);
    }, delay);
    if (act.type === 'NAVIGATE_STEP' || act.type === 'ENTER_ROOM') {
      delay += 850;
    } else {
      delay += 350;
    }
  });
};

window.askBotQuestion = async function(userQuestion) {
  if (!userQuestion || !userQuestion.trim()) return;

  // 0. Couper immédiatement tout son ou vidéo antérieur
  window.killAllSoundsAndVideos("USER_ASKED_CHAT_QUESTION");
  window.MENTOR_IS_PAUSED = false;

  const wasTourActive = window.MENTOR_GUIDED_TOUR_ACTIVE || (typeof IQ_TOWER !== 'undefined' && IQ_TOWER.autoTourRunning);
  if (wasTourActive) {
    window.MENTOR_INTERRUPTED_TOUR_STATE = {
      stepIndex: (typeof window.MENTOR_CURRENT_STEP === 'number') ? window.MENTOR_CURRENT_STEP : (IQ_TOWER.currentStepIndex || 0),
      phase: window._currentTourPhase || 'INTRO',
      timestamp: Date.now()
    };
    window.MENTOR_GUIDED_TOUR_ACTIVE = false;
    if (typeof IQ_TOWER !== 'undefined') IQ_TOWER.autoTourRunning = false;
  }

  // Désecombrement intelligent : masquer la bulle du bas pour éviter toute superposition avec le chat
  const coachBubble = document.getElementById('coach-speech-bubble');
  if (coachBubble) coachBubble.classList.add('hidden');

  liveState.userProfile = window.USER_PROFILE || { name: "Participant", role: "Directeur / Gestionnaire d'affaires", roleType: "business" };

  const chatHistory = document.getElementById('bot-chat-history');
  const botDrawer = document.getElementById('ai-bot-drawer');
  if (botDrawer && botDrawer.classList.contains('hidden')) {
    botDrawer.classList.remove('hidden');
  }

  // 1. Ajouter le message de l'utilisateur
  if (chatHistory) {
    const userMsg = document.createElement('div');
    userMsg.className = 'bot-message bot-user';
    userMsg.innerHTML = `<div class="message-bubble"><p>${escapeHtml(userQuestion)}</p></div>`;
    chatHistory.appendChild(userMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Indicateur de réflexion
  const typingId = 'typing-' + Date.now();
  if (chatHistory) {
    const typingMsg = document.createElement('div');
    typingMsg.id = typingId;
    typingMsg.className = 'bot-message bot-agent';
    typingMsg.innerHTML = `
      <div class="message-bubble" style="opacity: 0.85; font-style: italic;">
        <span>🤖 Réflexion et consultation des gabarits officiels...</span>
      </div>
    `;
    chatHistory.appendChild(typingMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  let answerText = "";
  let answerTitle = "Mentor en Gouvernance IA";
  let toolFile = "Grille_faisabilite_cas_usage_IA.xlsx";
  let toolPath = "documents_phases/Etape_1_Qualification/Grille_faisabilite_cas_usage_IA.xlsx";
  let actionsToExecute = [];
  let quickActionsList = [];

  try {
    // 2. Appel au serveur Render avec contexte temps réel (state)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: userQuestion,
        state: liveState 
      })
    });

    if (res.ok) {
      const data = await res.json();
      answerText = data.reply || "";

      // Si answerText contient du JSON ou a été renvoyé sous forme d'objet JSON en string
      if (typeof answerText === 'string' && (answerText.trim().startsWith('{') || answerText.includes('"text":'))) {
        try {
          const parsed = JSON.parse(answerText);
          if (parsed.text) {
            if (parsed.actions && Array.isArray(parsed.actions) && actionsToExecute.length === 0) actionsToExecute = parsed.actions;
            if (parsed.quickActions && Array.isArray(parsed.quickActions) && quickActionsList.length === 0) quickActionsList = parsed.quickActions;
            if (parsed.tool) toolFile = parsed.tool;
            if (parsed.toolPath) toolPath = parsed.toolPath;
            answerText = parsed.text;
          }
        } catch(e) {
          const match = answerText.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)/);
          if (match && match[1]) {
            answerText = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
            answerText = answerText
              .replace(/^\s*\{\s*"text"\s*:\s*"?/i, '')
              .replace(/"?\s*,\s*"actions"[\s\S]*$/i, '');
          }
        }
      }

      if (data.actions && Array.isArray(data.actions) && actionsToExecute.length === 0) actionsToExecute = data.actions;
      if (data.quickActions && Array.isArray(data.quickActions) && quickActionsList.length === 0) quickActionsList = data.quickActions;
      if (data.tool) toolFile = data.tool;
      if (data.toolPath) toolPath = data.toolPath;
      if (data.source === 'gemini') answerTitle = "Conseiller Bureau de l'IA";
    }
  } catch (err) {
    // Mode hors-ligne / direct sans serveur
  }

  // Si pas de réponse serveur (ou mode hors-ligne), chercher dans le RAG local
  if (!answerText) {
    const qClean = userQuestion.trim().toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    IQ_RAG_KNOWLEDGE.forEach(k => {
      let score = 0;
      k.keywords.forEach(kw => {
        if (qClean.includes(kw)) score += 3;
      });
      if (score > highestScore) {
        highestScore = score;
        bestMatch = k;
      }
    });

    if (bestMatch && highestScore > 0) {
      answerTitle = bestMatch.title;
      answerText = `${bestMatch.summary}\n\n${bestMatch.details}`;
      toolFile = bestMatch.tool;
      toolPath = bestMatch.toolPath;
      if (bestMatch.cameraFloor !== undefined) {
        actionsToExecute.push({ type: 'NAVIGATE_STEP', step: bestMatch.cameraFloor });
        if (bestMatch.cameraFloor === 1 && bestMatch.subStep !== undefined) {
          actionsToExecute.push({ type: 'ENTER_ROOM' });
          actionsToExecute.push({ type: 'SET_SUBSTEP', subStep: bestMatch.subStep });
        }
      }
    } else {
      answerText = "Toute initiative débute par le Guichet Octopus (Étape 0) et passe par la Qualification du Bureau de l'IA (Étape 1). Consultez nos gabarits officiels ou sélectionnez une question fréquente pour en savoir plus.";
      toolFile = "Portail_Intake_Formulaires_IA_IQ.html";
      toolPath = "01_Applications_Web_Intake/Portail_Intake_Formulaires_IA_IQ.html";
    }
  }

  // Retirer l'indicateur de réflexion
  const typingEl = document.getElementById(typingId);
  if (typingEl) typingEl.remove();

  // RÈGLE ABSOLUE : PAS DE "Bonjour", pas d'interpellation de prénom ("Joe, ..."), pas de "Excellente question..."
  if (answerText) {
    answerText = answerText
      .replace(/^[A-ZÀ-Ý][a-zà-ÿ]+,\s*/i, '')
      .replace(/^(bonjour|bonsoir|salut|allô|allo)\s+[^.!?,\n]+[.!?,\n]\s*/i, '')
      .replace(/^(bonjour|bonsoir|salut|allô|allo)[.!?,\n]\s*/i, '')
      .replace(/^(excellente question\b[^.!?\n]*[.!?,\n]\s*)/i, '')
      .replace(/^(c'est une excellente question\b[^.!?\n]*[.!?,\n]\s*)/i, '')
      .trim();
  }

  // 3. Exécuter les actions de manipulation de la scène 3D
  if (actionsToExecute && actionsToExecute.length > 0) {
    window.executeCopilotActions(actionsToExecute);
  }

  // 4. Générer les boutons d'actions directes cliquables
  let actionsHtml = '';
  if (quickActionsList && quickActionsList.length > 0) {
    actionsHtml += '<div class="bot-quick-actions-row">';
    quickActionsList.forEach(qa => {
      if (qa.action) {
        const actStr = JSON.stringify(qa.action).replace(/"/g, '&quot;');
        actionsHtml += `<button class="btn-copilot-action" onclick="executeCopilotAction(${actStr})">${qa.label}</button>`;
      } else if (qa.type) {
        const actObj = { type: qa.type, step: qa.step, subStep: qa.subStep, open: qa.open, enable: qa.enable };
        const actStr = JSON.stringify(actObj).replace(/"/g, '&quot;');
        actionsHtml += `<button class="btn-copilot-action" onclick="executeCopilotAction(${actStr})">${qa.label}</button>`;
      } else if (qa.url) {
        actionsHtml += `<a href="${encodeURI(qa.url)}" target="_blank" class="btn-copilot-action">${qa.label}</a>`;
      }
    });
    actionsHtml += '</div>';
  }

  // 5. Afficher la réponse dans l'historique de clavardage
  if (chatHistory) {
    const agentMsg = document.createElement('div');
    agentMsg.className = 'bot-message bot-agent';
    const formattedBody = answerText.includes('<p>') 
      ? answerText 
      : `<p>${answerText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;

    agentMsg.innerHTML = `
      <div class="message-bubble">
        <p><strong>${answerTitle}</strong></p>
        <div>${formattedBody}</div>
        ${actionsHtml}
        <div style="margin-top: 8px;">
          <a href="${encodeURI(toolPath)}" target="_blank" class="message-tool-tag" title="Ouvrir le gabarit officiel">
            📄 Gabarit officiel : ${toolFile}
          </a>
        </div>
      </div>
    `;
    chatHistory.appendChild(agentMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // 6. Synthèse vocale haute définition avec enchaînement sur la reprise de visite
  speakBotText(answerText, () => {
    // Si une visite était en cours, afficher le bandeau de reprise et enclencher le décompte
    if (window.MENTOR_INTERRUPTED_TOUR_STATE) {
      window.showTourInterruptedResumeBanner();
    }
  });

  // 7. Affichage dans le HUD Coach Immersif
  if (window.showCoachSpeech) {
    window.showCoachSpeech(answerText, quickActionsList);
  }
};

// ============================================================================
// GESTION DE LA REPRISE DE PRÉSENTATION APRÈS INTERRUPTION PAR QUESTION
// ============================================================================
window.showTourInterruptedResumeBanner = function() {
  const state = window.MENTOR_INTERRUPTED_TOUR_STATE;
  if (!state) return;

  const banner = document.getElementById('tour-interrupted-banner');
  const stepNameEl = document.getElementById('banner-tour-step-name');
  const countdownEl = document.getElementById('banner-countdown-text');

  const stepNumber = state.stepIndex;
  const stepInfo = (typeof SLIDE8_LIFECYCLE !== 'undefined' && SLIDE8_LIFECYCLE[stepNumber]) || { title: `Jalon ${stepNumber}` };
  if (stepNameEl) stepNameEl.innerText = `${stepNumber}. ${stepInfo.title}`;

  if (banner) banner.classList.remove('hidden');

  let remainingSec = 4;
  if (countdownEl) countdownEl.innerText = `Reprise automatique dans ${remainingSec}s...`;

  if (window._tourCountdownInterval) {
    clearInterval(window._tourCountdownInterval);
    window._tourCountdownInterval = null;
  }

  window._tourCountdownInterval = setInterval(() => {
    remainingSec -= 1;
    if (remainingSec > 0) {
      if (countdownEl) countdownEl.innerText = `Reprise automatique dans ${remainingSec}s...`;
    } else {
      clearInterval(window._tourCountdownInterval);
      window._tourCountdownInterval = null;
      window.resumeInterruptedPresentation();
    }
  }, 1000);
};

window.resumeInterruptedPresentation = function() {
  if (window._tourCountdownInterval) {
    clearInterval(window._tourCountdownInterval);
    window._tourCountdownInterval = null;
  }
  const banner = document.getElementById('tour-interrupted-banner');
  if (banner) banner.classList.add('hidden');

  const state = window.MENTOR_INTERRUPTED_TOUR_STATE;
  if (!state) return;
  window.MENTOR_INTERRUPTED_TOUR_STATE = null;

  const stepNumber = state.stepIndex;
  const statusIndicator = document.getElementById('mentor-status-indicator');
  if (statusIndicator) statusIndicator.innerText = `Reprise de la présentation (Jalon ${stepNumber})...`;

  // Petite phrase de transition naturelle du Mentor
  window.speakMentorVoice("Parfait ! Reprenons notre présentation officielle.", () => {
    window.runMentorStepLifecycle(stepNumber);
  });
};

window.cancelInterruptedPresentation = function() {
  if (window._tourCountdownInterval) {
    clearInterval(window._tourCountdownInterval);
    window._tourCountdownInterval = null;
  }
  const banner = document.getElementById('tour-interrupted-banner');
  if (banner) banner.classList.add('hidden');

  window.MENTOR_INTERRUPTED_TOUR_STATE = null;
  window.MENTOR_GUIDED_TOUR_ACTIVE = false;

  const statusIndicator = document.getElementById('mentor-status-indicator');
  if (statusIndicator) statusIndicator.innerText = "Mode exploration libre";
};

// Nettoyage de l'ancien nom en cache pour ne pas forcer "Mustapha" par défaut
if (localStorage.getItem('iq_user_name') === 'Mustapha') {
  localStorage.removeItem('iq_user_name');
}

window.USER_PROFILE = {
  name: localStorage.getItem('iq_user_name') || "",
  role: localStorage.getItem('iq_user_role') || "Employé d'Investissement Québec",
  roleType: localStorage.getItem('iq_user_role_key') || "business"
};

window.updateUserProfileUI = function() {
  const name = (window.USER_PROFILE.name && window.USER_PROFILE.name.trim()) 
    ? window.USER_PROFILE.name.trim() 
    : "Collaborateur IQ";
  const role = (window.USER_PROFILE.role && window.USER_PROFILE.role.trim()) 
    ? window.USER_PROFILE.role.trim() 
    : "Employé d'Investissement Québec";

  const topBadge = document.getElementById('btn-top-profile-badge');
  if (topBadge) {
    topBadge.innerHTML = `<span class="profile-icon">👤</span> <span>${name}</span> <span class="profile-role-tag">${role.split('/')[0].trim()}</span> <span class="profile-arrow">▾</span>`;
  }
  const topNameEl = document.getElementById('top-profile-name');
  if (topNameEl) topNameEl.innerText = name;
  const topRoleEl = document.getElementById('top-profile-role');
  if (topRoleEl) topRoleEl.innerText = role;

  const welcomeNameInput = document.getElementById('welcome-name-input');
  if (welcomeNameInput && !welcomeNameInput.value && window.USER_PROFILE.name) {
    welcomeNameInput.value = window.USER_PROFILE.name;
  }
  const welcomeRoleInput = document.getElementById('welcome-role-input');
  if (welcomeRoleInput && !welcomeRoleInput.value && window.USER_PROFILE.role && window.USER_PROFILE.role !== "Employé d'Investissement Québec") {
    welcomeRoleInput.value = window.USER_PROFILE.role;
  }
};

window.openProfileModal = function() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeProfileModal = function() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) modal.classList.add('hidden');
};

window.selectRoleCard = function(roleType) {
  document.querySelectorAll('.role-card').forEach(card => {
    card.classList.toggle('active', card.dataset.role === roleType);
  });
};

window.confirmUserProfile = function() {
  const nameInput = document.getElementById('profile-name-input');
  const activeCard = document.querySelector('.role-card.active');
  const newName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "";
  const newRoleType = (activeCard && activeCard.dataset.role) ? activeCard.dataset.role : "business";

  const roleTitles = {
    business: "Directeur / Gestionnaire d'affaires",
    risk: "Conseiller en Risques & Conformité",
    ti: "Architecte & Équipe TI",
    pm: "Chargé de projet / Escouade IA"
  };

  window.USER_PROFILE = {
    name: newName,
    role: roleTitles[newRoleType] || "Directeur d'affaires",
    roleType: newRoleType
  };

  if (newName) localStorage.setItem('iq_user_name', newName);
  localStorage.setItem('iq_user_role', window.USER_PROFILE.role);
  localStorage.setItem('iq_user_role_key', newRoleType);

  window.updateUserProfileUI();
  window.closeProfileModal();

  // Le Coach IA salue et adapte son discours immédiatement
  const greetingTarget = newName ? newName : "cher participant";
  const welcomeSpeech = `Bonjour ${greetingTarget} ! J'ai bien configuré votre profil en tant que ${roleTitles[newRoleType]}. J'adapte mes analyses et explications à vos priorités d'affaires.`;
  if (window.showCoachSpeech) {
    window.showCoachSpeech(welcomeSpeech);
  }
  speakBotText(welcomeSpeech);
};

// ============================================================================
// GESTION DU PARCOURS D'ACCOMPAGNEMENT OFFICIEL (SLIDE 10 : FOCUS CAS D'USAGE)
// ============================================================================
window.openAccompagnementModal = function(source = 'default') {
  const modal = document.getElementById('modal-parcours-accompagnement');
  if (modal) {
    modal.classList.remove('hidden');
    window.bringToFront(modal);
  }

  // Discours vocal du Mentor (Antoine / Sylvie)
  const introVoice = "En intelligence artificielle chez Investissement Québec, nous mettons toujours le focus sur le cas d'usage en premier ! Si votre besoin concerne un problème métier, une opportunité de productivité ou de la formation, le Bureau de l'IA et l'Escouade IA vous accompagnent en atelier de cadrage. Si votre demande est technique ou concerne une licence logicielle, l'équipe TI prend le relais. Choisissez votre parcours !";

  if (window.showCoachSpeech) {
    window.showCoachSpeech(introVoice, [
      { label: "💡 Cas d'Usage Métier (Bureau IA)", type: "SELECT_ACCOMPAGNEMENT", pathway: "business" },
      { label: "⚙️ Volet Technique (TI)", type: "SELECT_ACCOMPAGNEMENT", pathway: "ti" }
    ]);
  }
  if (window.speakBotText) {
    window.speakBotText(introVoice);
  }
};

window.closeAccompagnementModal = function() {
  const modal = document.getElementById('modal-parcours-accompagnement');
  if (modal) modal.classList.add('hidden');
};

window.selectAccompagnementPathway = function(pathway) {
  window.closeAccompagnementModal();

  // Si l'overlay de bienvenue est affiché, le fermer
  if (typeof window.dismissWelcomeOverlay === 'function') {
    window.dismissWelcomeOverlay();
  }

  if (pathway === 'business') {
    // Voie 1 : Bureau de l'IA & Escouade IA — Focus Cas d'Usage en premier !
    // Vol direct vers la salle de qualification du Bureau de l'IA (Étage 1) au poste 1.2
    if (typeof window.navigateToStep === 'function') {
      window.navigateToStep(1);
    }
    setTimeout(() => {
      if (typeof window.enterRoomMode === 'function') {
        window.enterRoomMode();
      }
      setTimeout(() => {
        if (typeof window.goToRoomSubStep === 'function') {
          window.goToRoomSubStep(1); // 1.2 Demande d'accompagnement
        }
      }, 900);
    }, 800);

    const speechText = "Excellent réflexe ! En IA, nous focalisons toujours sur le cas d'usage en premier. Le Bureau de l'IA et l'Escouade IA prennent en charge votre cadrage pour clarifier le problème d'affaires, évaluer la valeur et vérifier si un outil autorisé répond déjà à vos attentes sans développement superflu.";
    if (window.showCoachSpeech) {
      window.showCoachSpeech(speechText, [
        { label: "📄 Gabarit Cadrage Octopus", type: "DOWNLOAD_TEMPLATE", file: "Formulaire_Depot_Demande_IA_Octopus.xlsx" },
        { label: "🌿 Matrice Outils Homologués", type: "SET_SUBSTEP", subStep: 0 }
      ]);
    }
    if (window.speakBotText) {
      window.speakBotText(speechText);
    }
  } else {
    // Voie 2 : Équipe TI — Accompagnement Technique & Licences
    if (typeof window.selectOctopusPath === 'function') {
      window.selectOctopusPath(1);
    }
    if (typeof window.navigateToStep === 'function') {
      window.navigateToStep(0);
    }

    const speechText = "Votre besoin est d'ordre technique ou concerne une licence logicielle. L'équipe TI et le Support TI prennent le relais via Octopus pour analyser l'architecture, la connectivité et sécuriser les accès de votre solution.";
    if (window.showCoachSpeech) {
      window.showCoachSpeech(speechText, [
        { label: "🛍️ Parcours Achat TI", type: "SELECT_OCTOPUS", pathId: 1 },
        { label: "🎫 Billet Licences TI", type: "SELECT_OCTOPUS", pathId: 2 }
      ]);
    }
    if (window.speakBotText) {
      window.speakBotText(speechText);
    }
  }
};

// ============================================================================
// IMMERSIVE COPILOT COACH HUD & RECONNAISSANCE VOCALE (STT)
// ============================================================================
window.showCoachSpeech = function(text, quickActions = []) {
  const bubble = document.getElementById('coach-speech-bubble');
  const textEl = document.getElementById('coach-speech-text');
  const actionsBox = document.getElementById('coach-actions-box');
  const avatar = document.getElementById('btn-coach-avatar');
  const btnBubble = document.getElementById('btn-toggle-bubble');
  const mentorStatus = document.getElementById('mentor-status-indicator');

  // Si le texte est un JSON brut ou contient "text":
  if (typeof text === 'string' && (text.trim().startsWith('{') || text.includes('"text":'))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.text) text = parsed.text;
    } catch (e) {
      const match = text.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)/);
      if (match && match[1]) {
        text = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      } else {
        text = text
          .replace(/^\s*\{\s*"text"\s*:\s*"?/i, '')
          .replace(/"?\s*,\s*"actions"[\s\S]*$/i, '');
      }
    }
  }

  if (typeof text === 'string') {
    text = text.replace(/^[A-ZÀ-Ý][a-zà-ÿ]+,\s*/i, '').trim();
  }

  if (textEl) {
    const cleanText = text
      .replace(/24\/7/g, 'en continu')
      .replace(/24 \/ 7/g, 'en continu');

    const paragraphs = cleanText.split(/\n\s*\n/);
    const formattedHtml = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.includes('•')) {
        const items = trimmed.split('\n').map(l => {
          const ltrim = l.trim();
          if (ltrim.startsWith('•')) {
            return `<li style="margin-bottom: 6px; list-style-type: none; display: flex; align-items: flex-start;"><span style="color: #38bdf8; margin-right: 8px; font-weight: bold; flex-shrink: 0;">•</span><span>${ltrim.replace(/^•\s*/, '')}</span></li>`;
          }
          return `<div style="margin-bottom: 6px;">${ltrim}</div>`;
        }).join('');
        return `<ul style="margin: 6px 0 10px 0; padding-left: 0;">${items}</ul>`;
      }
      return `<p style="margin: 0 0 10px 0; line-height: 1.55;">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('');

    textEl.innerHTML = formattedHtml || cleanText;
  }
  if (bubble) bubble.classList.remove('hidden');
  if (btnBubble) btnBubble.classList.add('active');

  if (actionsBox) {
    actionsBox.innerHTML = '';
    if (quickActions && quickActions.length > 0) {
      quickActions.forEach(qa => {
        const btn = document.createElement('button');
        btn.className = 'coach-action-pill';
        btn.innerText = qa.label;
        btn.onclick = () => {
          if (qa.action) window.executeCopilotAction(qa.action);
          else if (qa.type) window.executeCopilotAction(qa);
        };
        actionsBox.appendChild(btn);
      });
    }
  }

  if (mentorStatus) mentorStatus.innerText = "Conseil en cours...";

  if (avatar) {
    avatar.classList.add('speaking');
    setTimeout(() => {
      avatar.classList.remove('speaking');
      if (mentorStatus && mentorStatus.innerText === "Conseil en cours...") {
        mentorStatus.innerText = "À votre écoute";
      }
    }, 4500);
  }
};

window.hideCoachSpeech = function() {
  const bubble = document.getElementById('coach-speech-bubble');
  const btnBubble = document.getElementById('btn-toggle-bubble');
  if (bubble) bubble.classList.add('hidden');
  if (btnBubble) btnBubble.classList.remove('active');
};

window.toggleCoachBubble = function(forceState) {
  const bubble = document.getElementById('coach-speech-bubble');
  const btnBubble = document.getElementById('btn-toggle-bubble');
  if (!bubble) return;

  if (typeof forceState === 'boolean') {
    if (forceState) bubble.classList.remove('hidden');
    else bubble.classList.add('hidden');
  } else {
    bubble.classList.toggle('hidden');
  }

  const isVisible = !bubble.classList.contains('hidden');
  if (btnBubble) btnBubble.classList.toggle('active', isVisible);
};

// Reconnaissance vocale (Speech-to-Text en français canadien fr-CA)
let speechRecognizer = null;
let isVoiceListening = false;

window.initVoiceRecognition = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition non supporté sur ce navigateur.");
    return;
  }

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = 'fr-CA';

  speechRecognizer.onstart = () => {
    isVoiceListening = true;
    updateMicButtonsUI(true);
  };

  speechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript && transcript.trim()) {
      if (window.showCoachSpeech) {
        window.showCoachSpeech(`« ${transcript} »`);
      }
      window.askBotQuestion(transcript);
    }
  };

  speechRecognizer.onerror = (event) => {
    console.warn("Erreur reconnaissance vocale :", event.error);
    isVoiceListening = false;
    updateMicButtonsUI(false);
  };

  speechRecognizer.onend = () => {
    isVoiceListening = false;
    updateMicButtonsUI(false);
  };
};

window.toggleVoiceRecording = function() {
  // RÈGLE INVIOLABLE : QUAND JE CLIQUE SUR PARLER AU MENTOR, TOUT SON / VIDÉO DOIT COUPER IMMÉDIATEMENT !
  window.killAllSoundsAndVideos("USER_CLICKED_PARLER_AU_MENTOR");

  if (window.pausePresentationDuringUserInteraction) {
    window.pausePresentationDuringUserInteraction();
  } else {
    window.MENTOR_IS_PAUSED = true;
  }

  const avatar = document.getElementById('btn-coach-avatar');
  if (avatar) avatar.classList.remove('speaking');

  if (!speechRecognizer) window.initVoiceRecognition();
  if (!speechRecognizer) {
    alert("La reconnaissance vocale nécessite Google Chrome, Microsoft Edge ou Safari.");
    return;
  }

  if (isVoiceListening) {
    speechRecognizer.stop();
  } else {
    try {
      speechRecognizer.start();
    } catch (e) {
      console.warn("Micro déjà actif ou erreur d'init :", e);
    }
  }
};

function updateMicButtonsUI(listening) {
  const micHud = document.getElementById('btn-voice-mic');
  const micLabel = document.getElementById('mic-label');
  const micWave = document.getElementById('mic-wave-indicator');
  const mentorStatus = document.getElementById('mentor-status-indicator');
  const micChat = document.getElementById('bot-mic-input-btn');

  if (micHud) micHud.classList.toggle('listening', listening);
  if (micChat) micChat.classList.toggle('listening', listening);

  if (micLabel) {
    micLabel.innerText = listening ? "Écoute en cours..." : "Parler au Mentor";
  }

  if (micWave) {
    micWave.classList.toggle('hidden', !listening);
  }

  if (mentorStatus) {
    mentorStatus.innerText = listening ? "Écoute de votre voix..." : "À votre écoute";
  }
}

window.handleBotFormSubmit = function(e) {
  e.preventDefault();
  const input = document.getElementById('bot-user-input');
  if (input && input.value.trim()) {
    const q = input.value;
    input.value = '';
    askBotQuestion(q);
  }
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function runAutoTourStep() {
  if (!IQ_TOWER.autoTourRunning) return;
  if (IQ_TOWER.currentStepIndex >= SLIDE8_LIFECYCLE.length - 1) {
    // Si le sommet (Étage 6) est atteint, la visite s'arrête sans tourner en boucle
    IQ_TOWER.autoTourRunning = false;
    if (IQ_TOWER.autoTourTimer) {
      clearTimeout(IQ_TOWER.autoTourTimer);
      IQ_TOWER.autoTourTimer = null;
    }
    const btn = document.getElementById('btn-auto-tour');
    const icon = document.getElementById('auto-tour-icon');
    const text = document.getElementById('auto-tour-text');
    if (btn) btn.classList.remove('active', 'active-tour');
    if (icon) icon.innerText = '▶';
    if (text) text.innerText = 'Visite Guidée';
    return;
  }
  const nextStep = IQ_TOWER.currentStepIndex + 1;
  goToLifecycleStep(nextStep);
  IQ_TOWER.autoTourTimer = setTimeout(runAutoTourStep, 5000);
}

// ============================================================================
// BOUCLE DE RENDU 3D & ANIMATION
// ============================================================================
function animate() {
  requestAnimationFrame(animate);

  const delta = IQ_TOWER.clock.getDelta();
  const time = IQ_TOWER.clock.getElapsedTime();

  IQ_TOWER.controls.update();

  // Animation des personnages (respiration légère)
  IQ_TOWER.characters.forEach((char, i) => {
    char.position.y += Math.sin(time * 2 + i) * 0.003;
  });

  // Animation des navettes corporatives électriques sur la route du campus
  if (IQ_TOWER.dynamicVehicles && IQ_TOWER.dynamicVehicles.length > 0) {
    IQ_TOWER.dynamicVehicles.forEach(veh => {
      const u = veh.userData;
      if (u) {
        veh.position.x += u.speed * u.dir;
        if (u.dir > 0 && veh.position.x > u.maxX) {
          veh.position.x = u.minX;
        } else if (u.dir < 0 && veh.position.x < u.minX) {
          veh.position.x = u.maxX;
        }
      }
    });
  }

  // Animation du chariot de baie de serveurs avec technicien sur la passerelle
  if (IQ_TOWER.serverCartGroup && IQ_TOWER.serverCartGroup.userData) {
    const cg = IQ_TOWER.serverCartGroup;
    const u = cg.userData;
    cg.position.x += u.speed * u.dir;
    if (cg.position.x >= u.maxX) {
      cg.position.x = u.maxX;
      u.dir = -1;
      cg.rotation.y = Math.PI;
    } else if (cg.position.x <= u.minX) {
      cg.position.x = u.minX;
      u.dir = 1;
      cg.rotation.y = 0;
    }
    // Clignotement subtil des voyants LED de la baie de serveurs
    if (u.leds && u.leds.length > 0) {
      const activeIdx = Math.floor((time * 5) % u.leds.length);
      u.leds.forEach((led, idx) => {
        led.visible = (idx === activeIdx) ? Math.sin(time * 10) > -0.2 : true;
      });
    }
  }

  // Animation du Dossier d'Initiative IA dans l'ascenseur (rotation gyroscopique continue)
  if (IQ_TOWER.elevatorHoloData) {
    const { dataCore, ring1, ring2 } = IQ_TOWER.elevatorHoloData.userData;
    if (dataCore) dataCore.rotation.y += 0.02;
    if (ring1) ring1.rotation.z += 0.025;
    if (ring2) ring2.rotation.x += 0.018;
  }

  IQ_TOWER.renderer.render(IQ_TOWER.scene, IQ_TOWER.camera);
}

function onWindowResize() {
  IQ_TOWER.camera.aspect = window.innerWidth / window.innerHeight;
  IQ_TOWER.camera.updateProjectionMatrix();
  IQ_TOWER.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.handleLogout = async function() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  sessionStorage.removeItem('ai_gov_auth');
  window.location.href = '/login';
};

window.addEventListener('DOMContentLoaded', () => {
  initTowerSimulation();
  animate();
  setTimeout(() => {
    goToLifecycleStep(0);
  }, 600);
});

