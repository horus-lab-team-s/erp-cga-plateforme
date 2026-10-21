/**
 * LES MISES À JOUR DU 19 ET DU 20 OCTOBRE 2026, PAR CAS D'USAGE : ce qui arrive au cabinet,
 * ce que la plateforme en fait, et le résultat.
 *
 *     node montage.mjs programmes/mises-a-jour-2026-10-20.mjs
 */
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

export default {
  nom: "mises-a-jour-2026-10-20",
  docs: "../../../../erp-cga-brcg/Docs/demonstration",
  fichier: "mises-a-jour-plateforme-cga-2026-10-20.mp4",
  titre: "La plateforme CGA : les mises à jour du 20 octobre 2026",
  date: "20 octobre 2026",
  avertissement:
    "Chaque cas suit le même fil : ce qui arrive au cabinet, ce que la plateforme en fait, le résultat. Toutes les séquences ont été jouées en direct sur la solution, et l'application mobile dans un émulateur Android ; les données sont fictives, les pièces sont des spécimens, et le prix de la DSF montré est un exemple.",
  sequences: [
    {
      sommaire: "Ouverture",
      duree: 13000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "La transformation digitale du cabinet, <em>cas par cas</em>",
        sous: "Ce qui arrive au cabinet, ce que la plateforme en fait, et le résultat : les demandes et leur suivi, la sécurité des comptes, les quittances, la DSF en ligne, l'application mobile.",
        pied: `Mises à jour du 20 octobre 2026<br>${PIED}`,
      },
    },
    {
      sommaire: "Partie 1 · Le client, de la demande au livrable",
      carton: {
        type: "chapitre", num: "Partie 1 sur 4",
        titre: "Le client, de la demande au livrable",
        sous: "Un document joint à sa demande, puis un lien pour la suivre et ouvrir son livrable, sans compte.",
      },
    },
    { niveau: 2, sommaire: "Une demande, et le document qui va avec", flux: "maj-2026-10-20-flux-1-demande-et-document-joint.mp4" },
    { niveau: 2, sommaire: "Le suivi de la demande, puis le livrable", flux: "maj-2026-10-20-flux-2-suivi-et-livrable.mp4" },
    {
      sommaire: "Partie 2 · Le cabinet, protégé et rigoureux",
      carton: {
        type: "chapitre", num: "Partie 2 sur 4",
        titre: "Le cabinet, protégé et rigoureux",
        sous: "Un second facteur qui ne compte qu'après son premier code ; une quittance comparée à l'accusé de dépôt.",
      },
    },
    { niveau: 2, sommaire: "Le second facteur, activé par son premier code", flux: "maj-2026-10-20-flux-3-second-facteur.mp4" },
    { niveau: 2, sommaire: "La quittance, comparée à l'accusé de dépôt", flux: "maj-2026-10-20-flux-4-quittance-et-accuse.mp4" },
    {
      sommaire: "Partie 3 · La DSF, vendue en ligne",
      carton: {
        type: "chapitre", num: "Partie 3 sur 4",
        titre: "La DSF, vendue en ligne",
        sous: "Au prix que la direction a fixé, et à aucun autre.",
      },
    },
    { niveau: 2, sommaire: "La DSF, commandée au prix du cabinet", flux: "maj-2026-10-20-flux-5-dsf-en-ligne.mp4" },
    {
      sommaire: "Partie 4 · L'application mobile",
      carton: {
        type: "chapitre", num: "Partie 4 sur 4",
        titre: "L'application mobile, repensée",
        sous: "Un accueil plus lisible, le scan en PDF avec sa fiche, le mode sombre, et l'application sans réseau.",
      },
    },
    { niveau: 2, sommaire: "Le nouvel accueil, et le scan en PDF", flux: "maj-2026-10-20-mobile-5-accueil-et-scan-pdf.mp4" },
    { niveau: 2, sommaire: "Le mode sombre, et l'application sans réseau", flux: "maj-2026-10-20-mobile-6-sombre-et-hors-ligne.mp4" },
    {
      sommaire: "Ce qui dépend du cabinet",
      duree: 16000,
      carton: {
        type: "chapitre", num: "Pour passer en production",
        titre: "Ce qui dépend du cabinet",
        sous: "Les huit prix encore à fixer dans « Tarifs de l'offre », dont la DSF ; la validation des taux et de la correspondance des comptes de la DSF par l'expert-comptable ; le serveur en ligne, les clés Tara Money et les sauvegardes.",
      },
    },
    {
      sommaire: "Clôture",
      duree: 9000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "Merci",
        sous: "Toutes les séquences de cette vidéo ont été jouées en direct sur la solution, le 20 octobre 2026.",
        pied: PIED,
      },
    },
  ],
};
