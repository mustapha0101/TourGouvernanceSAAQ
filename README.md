# Playbook A.G.E.N.T. & Tour de Gouvernance IA — SAAQ

> **Client** : Société de l'assurance automobile du Québec (SAAQ)  
> **Entité responsable** : Centre d'expertise en intelligence artificielle (CEIA)  
> **Cadre de conformité** : Loi 25 (protection des renseignements personnels) & Sécurité de l'information gouvernementale  
> **Statut** : Dépôt indépendant et isolé du référentiel Investissement Québec  

---

## 🎯 1. Vue d'Ensemble & Objectifs

Cette plateforme interactive et immersive est conçue sur mesure pour la **Société de l'assurance automobile du Québec (SAAQ)** afin d'accompagner les directions d'affaires, les gestionnaires et les professionnels dans la reconception de leurs processus grâce aux systèmes d'IA agentiques et à une gouvernance rigoureuse.

Elle intègre :
1. **Le Playbook A.G.E.N.T. Interactif** (`coach_playbook_agent.html`) :
   - Parcours guidé pas à pas à travers les 5 phases : **Audit (A)**, **Gauge (G)**, **Engineer (E)**, **Navigate (N)**, **Track (T)**.
   - Coach socratique et maïeutique en direct, respectant le protocole institutionnel de la SAAQ (zéro anglicisme, zéro fuite de prompt système).
   - Génération dynamique en un clic des livrables exécutifs officiels :
     - 📄 **Document Word (.docx)** avec en-tête officiel SAAQ et tableaux structurés.
     - 📊 **Présentation PowerPoint (.pptx)** 16:9 au gabarit exécutif du Centre d'expertise en IA.
2. **La Tour de Gouvernance IA 3D** (`index.html`) :
   - Modélisation en Three.js/WebGL du cycle de vie des initiatives IA en 7 jalons (0 à 6).
   - Prise en charge des guichets de service et des parcours d'accompagnement du CEIA.
3. **L'Atelier Socratique en Éthique de l'IA** (`formation_ethique_dilemmes_ia.html`) :
   - Simulation en temps réel des arbitrages moraux (Déontologie, Vertu, Utilitarisme) et garde-fous opérationnels (*Human-in-Command*, droit de veto, Loi 25).

---

## 🏛️ 2. Personnalisation Institutionnelle SAAQ

- **Organisation** : *Société de l'assurance automobile du Québec (SAAQ)*
- **Entité d'attache** : *Centre d'expertise en intelligence artificielle (CEIA)*
- **Processus cibles illustratifs** :
  - Services aux citoyens et transactions SAAQclic (authentification, délivrance de permis, immatriculation)
  - Indemnisation des accidentés de la route (évaluation médico-légale et traitement des réclamations)
  - Contrôle routier et sécurité véhiculaire (inspections et conformité des transporteurs)
  - Gestion des centres de services et relations clientèle (triage et réclamations)
- **Vidéo d'accueil** : Emplacement réservé pour la capsule vidéo officielle de la SAAQ.

---

## 🚀 3. Démarrage Rapide

### Prérequis
- Node.js (v18+)
- Python 3.9+ avec `python-docx` et `python-pptx`

### Installation
```bash
npm install
pip install -r requirements.txt
```

### Lancement du Serveur Local
```bash
npm start
# ou
node server.js
```
Le serveur démarre sur `http://localhost:3000` (ou le port défini par `PORT`).

### Exécution de la Suite de Tests
```bash
npm test
```
La suite valide les 30 tests unitaires et d'intégration : cycle A.G.E.N.T., anti-boucle en Phase T, neutralité socratique, conformité Loi 25 et génération des livrables.

---

## 🌐 4. Déploiement Cloud Dédié (Render)

Ce projet dispose d'une configuration `render.yaml` indépendante :
- **Service Web** : `playbook-agent-saaq`
- **Base de données PostgreSQL** : `saaq-initiatives-db`
- **Isolation totale** : Aucun lien avec le service Render ou le dépôt d'Investissement Québec.

---

## 📦 5. Gestion du Dépôt Git

Ce répertoire constitue un dépôt Git autonome dédié à la SAAQ.  
Pour le lier à votre nouveau dépôt distant (ex: GitHub) :
```bash
git remote add origin <URL_DU_NOUVEAU_DEPOT_SAAQ>
git push -u origin main
```
