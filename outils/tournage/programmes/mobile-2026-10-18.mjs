/**
 * L'APPLICATION MOBILE DE L'ADHÉRENT, PAR CAS D'USAGE (18 octobre 2026) : ce qui arrive,
 * ce que la plateforme en fait, et le résultat, sur le téléphone.
 *
 *     node montage.mjs programmes/mobile-2026-10-18.mjs
 */
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

export default {
  nom: "mobile-2026-10-18",
  docs: "../../../../erp-cga-brcg/Docs/demonstration",
  fichier: "application-mobile-cga-2026-10-18.mp4",
  titre: "L'application mobile de l'adhérent : les cas d'usage du 18 octobre 2026",
  date: "18 octobre 2026",
  avertissement:
    "Joué en direct sur l'application, dans un émulateur Android. Les données sont fictives, les pièces sont des spécimens, et la confirmation de l'opérateur mobile money est simulée : la démonstration n'a pas d'identifiants marchands.",
  sequences: [
    {
      sommaire: "Ouverture",
      duree: 12000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "L'espace adhérent, <em>dans la poche</em>",
        sous: "Déposer une pièce, régler sans capture, suivre sa DSF et ses documents, tout l'espace adhérent : chaque question a son écran, et chaque écran son geste.",
        pied: `Mises à jour du 18 octobre 2026<br>${PIED}`,
      },
    },
    { niveau: 2, sommaire: "Déposer une pièce, d'un geste", flux: "maj-2026-10-18-mobile-1-deposer-une-piece.mp4" },
    { niveau: 2, sommaire: "Régler la CNPS sans une capture", flux: "maj-2026-10-18-mobile-2-regler-sans-capture.mp4" },
    { niveau: 2, sommaire: "La DSF et les documents", flux: "maj-2026-10-18-mobile-3-documents-et-dsf.mp4" },
    { niveau: 2, sommaire: "L'accueil et « Plus »", flux: "maj-2026-10-18-mobile-4-accueil-et-plus.mp4" },
    {
      sommaire: "Clôture",
      duree: 9000,
      carton: {
        type: "ouverture",
        sur: "CGA Broad Range Consulting Group",
        titre: "Merci",
        sous: "Toutes les séquences de cette vidéo ont été jouées en direct sur l'application, le 18 octobre 2026.",
        pied: PIED,
      },
    },
  ],
};
