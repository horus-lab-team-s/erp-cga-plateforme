/**
 * LES MISES À JOUR DU 18 OCTOBRE 2026, PAR CAS D'USAGE : ce qui arrive au cabinet, ce que
 * la plateforme en fait, et le résultat.
 *
 *     node montage.mjs programmes/mises-a-jour-2026-10-18.mjs
 */
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

export default {
  nom: "mises-a-jour-2026-10-18",
  docs: "../../../../erp-cga-brcg/Docs/demonstration",
  fichier: "mises-a-jour-plateforme-cga-2026-10-18.mp4",
  titre: "La plateforme CGA : les mises à jour du 18 octobre 2026",
  date: "18 octobre 2026",
  avertissement:
    "Chaque cas suit le même fil : ce qui arrive au cabinet, ce que la plateforme en fait, le résultat. Toutes les séquences ont été jouées en direct sur la solution ; les données sont fictives, et les pièces montrées sont des spécimens marqués comme tels.",
  sequences: [
    {
      sommaire: "Ouverture",
      duree: 13000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "La transformation digitale du cabinet, <em>cas par cas</em>",
        sous: "Ce qui arrive au cabinet, ce que la plateforme en fait, et le résultat : la paie et la CNPS, les pièces, la DSF, les contrats, le recrutement, les rôles.",
        pied: `Mises à jour du 18 octobre 2026<br>${PIED}`,
      },
    },
    {
      sommaire: "Partie 1 · Le social et la comptabilité",
      carton: {
        type: "chapitre", num: "Partie 1 sur 3",
        titre: "Le social et la comptabilité",
        sous: "Une paie qui devient une CNPS réglée sans capture d'écran ; des pièces qui deviennent des écritures.",
      },
    },
    { niveau: 2, sommaire: "Paie → CNPS → mobile money, sans capture", flux: "maj-2026-10-18-flux-1-paie-cnps-sans-capture.mp4" },
    { niveau: 2, sommaire: "Une facture, puis l'écriture", flux: "maj-2026-10-18-flux-2-pieces-en-ecritures.mp4" },
    {
      sommaire: "Partie 2 · La DSF de l'adhérent",
      carton: {
        type: "chapitre", num: "Partie 2 sur 3",
        titre: "La DSF, suivie par l'adhérent",
        sous: "Il verse ce que lui seul détient ; le cabinet prépare, fait valider, dépose ; l'adhérent lit « Déposée » et télécharge sa copie.",
      },
    },
    { niveau: 2, sommaire: "De la pièce de l'adhérent au dépôt", flux: "maj-2026-10-18-flux-3-dsf-de-l-adherent-au-depot.mp4" },
    {
      sommaire: "Partie 3 · Contrats, recrutement, rôles",
      carton: {
        type: "chapitre", num: "Partie 3 sur 3",
        titre: "Le cabinet, gouverné",
        sous: "Un contrat qui part d'un modèle et n'emporte rien d'inachevé ; un candidat qui reçoit une réponse ; des rôles sur mesure et des écarts écrits.",
      },
    },
    { niveau: 2, sommaire: "De la demande au contrat", flux: "maj-2026-10-18-flux-4c-de-la-demande-au-contrat.mp4" },
    { niveau: 2, sommaire: "De l'offre de poste à la réponse", flux: "maj-2026-10-18-flux-4b-de-l-offre-a-la-reponse.mp4" },
    { niveau: 2, sommaire: "Les rôles et le règlement des honoraires", flux: "maj-2026-10-18-flux-4a-roles-et-reglement.mp4" },
    {
      sommaire: "Ce qui dépend du cabinet",
      duree: 16000,
      carton: {
        type: "chapitre", num: "Pour passer en production",
        titre: "Ce qui dépend du cabinet",
        sous: "Les identifiants marchands Tara Money ; les mentions fiscales du cabinet pour ses factures, à saisir dans les tarifs. L'agent ne fait que proposer : sans clé d'API, tout se traite à la main, et rien n'est bloqué.",
      },
    },
    {
      sommaire: "Clôture",
      duree: 9000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "Merci",
        sous: "Toutes les séquences de cette vidéo ont été jouées en direct sur la solution, le 18 octobre 2026.",
        pied: PIED,
      },
    },
  ],
};
