/**
 * LA VIDÉO D'ÉVOLUTION DU 15 OCTOBRE 2026 : ce qui s'ajoute à la présentation complète
 * du matin (`presentation-complete-plateforme-cga-2026-10-15.mp4`).
 *
 *     node montage.mjs programmes/evolution-2026-10-15.mjs
 */
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

export default {
  nom: "evolution-2026-10-15",
  docs: "../../../../erp-cga-brcg/Docs/demonstration",
  fichier: "evolution-plateforme-cga-2026-10-15.mp4",
  titre: "La plateforme CGA : les évolutions du 15 octobre 2026",
  date: "15 octobre 2026",
  avertissement:
    "Ce qui s'ajoute à la présentation complète du matin. Toutes les séquences ont été jouées en direct sur la solution ; les données sont fictives, et le contrat montré est un spécimen marqué comme tel.",
  sequences: [
    {
      sommaire: "Ouverture",
      duree: 13000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "La plateforme CGA : <em>les évolutions du jour</em>",
        sous: "Ce qui s'ajoute à la présentation complète de ce matin : les prestations ponctuelles, les documents et les avis au client, les annexes de la DSF.",
        pied: `Présentation de l'avancement du développement · 15 octobre 2026<br>${PIED}`,
      },
    },
    {
      sommaire: "Partie 1 · Les prestations ponctuelles",
      carton: {
        type: "chapitre", num: "Partie 1 sur 3",
        titre: "Les prestations ponctuelles",
        sous: "Analyse et rédaction de contrat, DSF ciblée : l'agent propose, un collaborateur décide de chaque point, un second valide. Le client ne reçoit que ce qui a été retenu.",
      },
    },
    { niveau: 2, sommaire: "L'analyse d'un contrat", flux: "missions-flux-1-analyse-de-contrat.mp4" },
    { niveau: 2, sommaire: "La rédaction d'un contrat", flux: "missions-flux-2-redaction-de-contrat.mp4" },
    { niveau: 2, sommaire: "La DSF ciblée", flux: "missions-flux-3-dsf-ciblee.mp4" },
    {
      sommaire: "Partie 2 · Les documents et les avis au client",
      carton: {
        type: "chapitre", num: "Partie 2 sur 3",
        titre: "Les documents et les avis au client",
        sous: "La cliente d'une création retrouve sa proforma et son reçu ; l'adhérent reçoit un courriel à chaque geste du cabinet ; le bulletin de paie s'imprime.",
      },
    },
    { niveau: 2, sommaire: "Proforma, reçus, avis et bulletin", flux: "documents-flux-1-documents-et-avis.mp4" },
    {
      sommaire: "Partie 3 · Les annexes de la DSF",
      carton: {
        type: "chapitre", num: "Partie 3 sur 3",
        titre: "Les annexes de la DSF",
        sous: "Les balances auxiliaires clients et fournisseurs que la DGI demande en Excel, et un report à nouveau qui garde chaque tiers.",
      },
    },
    { niveau: 2, sommaire: "Les balances auxiliaires", flux: "comptabilite-flux-3-balances-auxiliaires.mp4" },
    {
      sommaire: "Ce qui dépend du cabinet",
      duree: 16000,
      carton: {
        type: "chapitre", num: "Pour passer en production",
        titre: "Ce qui dépend du cabinet",
        sous: "Les identifiants marchands Tara Money. La validation des taux de paie par le fiscaliste. L'agent, lui, ne fait que proposer : sans clé d'API, tout se traite à la main, et rien n'est bloqué.",
      },
    },
    {
      sommaire: "Clôture",
      duree: 9000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "Merci",
        sous: "Toutes les séquences de cette vidéo ont été jouées en direct sur la solution, le 15 octobre 2026.",
        pied: PIED,
      },
    },
  ],
};
