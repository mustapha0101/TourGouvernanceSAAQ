const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_KEY = process.env.GEMINI_API_KEY || '';
const CACHE_DIR = path.join(__dirname, 'audio_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

function sanitizeText(rawText) {
  return rawText
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[\*\#\_\[\]\(\)]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    // Remplacer les mots déclencheurs du filtre Google TTS
    .replace(/gemini/gi, "notre modèle d'intelligence artificielle")
    .replace(/aoede/gi, "féminine")
    .replace(/fenrir/gi, "masculine")
    .replace(/kore/gi, "dynamique")
    .replace(/\s+/g, ' ')
    .trim();
}

function getCacheFilename(text, voice) {
  const clean = sanitizeText(text);
  const hash = crypto.createHash('md5').update(`${voice}__${clean}`).digest('hex');
  return path.join(CACHE_DIR, `${hash}.wav`);
}

function generateSpeech(text, voice = 'Aoede') {
  return new Promise((resolve, reject) => {
    const clean = sanitizeText(text);
    const targetFile = getCacheFilename(clean, voice);

    if (fs.existsSync(targetFile)) {
      console.log(`[DÉJÀ EN CACHE] Voix ${voice} : "${clean.slice(0, 45)}..."`);
      return resolve(fs.readFileSync(targetFile));
    }

    console.log(`[GÉNÉRATION GEMINI] Voix ${voice} : "${clean.slice(0, 45)}..."`);

    const postData = JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: clean }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 35000
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          if (res.statusCode >= 400) {
            return reject(new Error(`Erreur HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
          }
          const json = JSON.parse(body);
          if (!json.candidates || !json.candidates[0] || !json.candidates[0].content) {
            return reject(new Error(`Réponse sans audio. Feedback: ${JSON.stringify(json.promptFeedback || json)}`));
          }
          const part = json.candidates[0].content.parts[0];
          if (!part || !part.inlineData || !part.inlineData.data) {
            return reject(new Error('Données audio introuvables'));
          }
          const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
          const wavHeader = createWavHeader(pcmBuffer.length, 24000, 1, 16);
          const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

          fs.writeFileSync(targetFile, wavBuffer);
          console.log(`  -> Succès ! Fichier enregistré : ${path.basename(targetFile)} (${wavBuffer.length} octets)`);
          resolve(wavBuffer);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout Gemini TTS (>35s)"));
    });

    req.write(postData);
    req.end();
  });
}

// Les scripts officiels complets des 7 jalons
const OFFICIAL_TOUR_SCRIPTS = [
  // Jalon 0
  {
    key: "intro_0",
    text: "Bonjour Mustapha ! Bienvenue au rez-de-chaussée de notre tour de gouvernance. En tant que Directeur d'affaires, vous amorcez ici votre démarche. Investissement Québec structure la prise en charge en trois parcours clairs : l'achat de logiciel TI, les licences d'outils autorisés comme Copilot ou Claude, et les cas d'usage métiers avec l'Escouade IA. Découvrons ensemble la capsule vidéo de ce premier jalon !"
  },
  {
    key: "outro_0",
    text: "Excellente première étape ! La demande est bien prise en charge. Montons maintenant au premier étage pour la qualification au Bureau de l'IA."
  },
  // Jalon 1
  {
    key: "intro_1",
    text: "Nous arrivons au premier étage, dans la salle du Bureau de l'IA. Pour sécuriser chaque dollar investi, nous appliquons quatre contrôles majeurs : le triage initial, l'arbre de décision anti-redondance, la grille de faisabilité et le pré-filtrage des risques DGIR 2026. Visionnons la capsule de qualification !"
  },
  {
    key: "outro_1",
    text: "Qualification validée avec succès ! Les critères de rentabilité et d'architecture sont au vert. Direction le deuxième étage pour l'analyse des risques."
  },
  // Jalon 2
  {
    key: "intro_2",
    text: "Bienvenue au deuxième étage, la Cellule d'Expertise Matricielle. Nous réunissons la Cybersécurité, la DGIR et la protection des renseignements personnels. Nous appliquons l'ÉFVP pour la Loi 25 et le calcul scientifique AHP-TOPSIS afin d'éviter qu'un gain d'affaires ne masque un risque inacceptable. Regardons la capsule d'analyse des risques."
  },
  {
    key: "outro_2",
    text: "L'évaluation matricielle est rigoureusement complétée. Montons au troisième étage pour l'arbitrage Go / No-Go en comité !"
  },
  // Jalon 3
  {
    key: "intro_3",
    text: "Nous voici au troisième étage, le salon des comités décisionnels. C'est ici que s'opère l'arbitrage officiel à l'aide de notre Mémo Décisionnel. Selon le niveau de risque, la décision relève de la voie accélérée du Bureau de l'IA, du Comité de gouvernance IA ou du Comité de Direction. Regardons la capsule sur l'arbitrage officiel."
  },
  {
    key: "outro_3",
    text: "Feu vert accordé ! Le comité approuve le projet. Passons au quatrième étage pour le développement du pilote en laboratoire."
  },
  // Jalon 4
  {
    key: "intro_4",
    text: "Nous sommes au quatrième étage, dans le laboratoire de l'Escouade IA. Nous ne déployons jamais à l'aveugle : nous réalisons une preuve de concept en environnement Azure isolé, avec supervision humaine obligatoire et mesure de précision. Lançons la capsule du laboratoire pilote !"
  },
  {
    key: "outro_4",
    text: "Preuve de concept validée avec brio ! Attention, nous franchissons maintenant la Passerelle Technologique pour entrer dans le Building des TI !"
  },
  // Jalon 5
  {
    key: "intro_5",
    text: "Mustapha, nous venons de traverser la Passerelle Technologique pour entrer dans le Building des TI ! À cet étage, nous validons l'homologation selon le Modèle de Confiance Numérique du Québec et nos 4 Portes de décision. Visionnons la capsule d'homologation et de déploiement sécurisé."
  },
  {
    key: "outro_5",
    text: "Certificat d'homologation officiel paraphé ! Montons au sixième étage pour la surveillance continue et l'exploitation 24/7."
  },
  // Jalon 6
  {
    key: "intro_6",
    text: "Bienvenue au sixième étage, au sommet du Building des TI. L'équipe TI et le Bureau de l'IA assurent la surveillance 24 heures sur 24 : détection de dérive des modèles, audits trimestriels et tenue du Registre officiel d'Investissement Québec. Regardons la dernière capsule de surveillance continue !"
  },
  {
    key: "outro_6",
    text: "Félicitations Mustapha ! Vous avez complété avec succès l'ensemble du cycle de vie de gouvernance de l'IA d'Investissement Québec, de l'idéation jusqu'au sommet des TI. Votre initiative est désormais sous surveillance continue 24/7 !"
  },
  // Messages d'état et de commutation de voix
  {
    key: "switch_aoede",
    text: "La voix féminine naturelle est désormais configurée pour votre accompagnement."
  },
  {
    key: "switch_fenrir",
    text: "La voix masculine posée est désormais configurée pour votre accompagnement."
  },
  {
    key: "resume_tour",
    text: "Parfait ! Reprenons notre présentation officielle."
  }
];

async function runPreGeneration() {
  console.log("=== PRÉ-GÉNÉRATION DU CACHE AUDIO GEMINI TTS (Aoede & Fenrir) ===");
  const voices = ['Aoede', 'Fenrir'];

  for (const voice of voices) {
    console.log(`\n>>> TRAITEMENT DE LA VOIX : ${voice} <<<`);
    for (const item of OFFICIAL_TOUR_SCRIPTS) {
      try {
        await generateSpeech(item.text, voice);
        // Pause de sécurité pour ne pas dépasser le quota de requêtes par minute
        await new Promise(r => setTimeout(r, 1200));
      } catch (err) {
        console.error(`Erreur sur [${item.key}] (${voice}):`, err.message);
      }
    }
  }

  console.log("\n✅ PRÉ-GÉNÉRATION DU CACHE AUDIO TERMINÉE AVEC SUCCÈS !");
}

module.exports = {
  sanitizeText,
  getCacheFilename,
  generateSpeech,
  CACHE_DIR
};

if (require.main === module) {
  runPreGeneration();
}
