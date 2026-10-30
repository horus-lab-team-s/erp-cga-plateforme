/**
 * LES CARTONS DE LA PRÉSENTATION COMPLÈTE (15 octobre 2026).
 *
 * Un fichier par carton : l'ouverture générale, un carton par partie, la clôture. Le
 * montage les intercale entre les flux déjà tournés. Pour une vidéo nouvelle, préférer
 * un programme de `montage.mjs` (voir `programmes/`), qui fait cartons, montage et sommaire.
 *
 *     node presentation-cartons.mjs
 */
import { carton, ouvrirLePlateau } from "./outils.mjs";

const SORTIE = new URL("./sortie/presentation/", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

const CARTONS = [
  ["00-ouverture", 14000, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "La plateforme CGA : <em>présentation complète</em>",
    sous: "Créer une entreprise, accompagner l'adhérent, tenir sa comptabilité et sa paie, déposer sa DSF, piloter le cabinet. Chaque écran qui suit a été joué en direct sur la solution.",
    pied: `Présentation de l'avancement du développement · 15 octobre 2026<br>${PIED}`,
  }],
  ["01-creation", 8000, {
    type: "chapitre", num: "Partie 1 sur 6",
    titre: "Créer une entreprise",
    sous: "La demande du site, la proforma, le paiement à la caisse, le compte du client et le suivi de son dossier, les documents.",
  }],
  ["02-adherent", 8000, {
    type: "chapitre", num: "Partie 2 sur 6",
    titre: "L'espace adhérent : payer et suivre",
    sous: "Les honoraires, la TVA et la CNPS par quittance, ou confiées au cabinet sous mandat de paiement.",
  }],
  ["03-comptabilite", 8000, {
    type: "chapitre", num: "Partie 3 sur 6",
    titre: "La comptabilité",
    sous: "Une facture chargée devient une écriture ; les livres obligatoires s'impriment.",
  }],
  ["04-paie", 8000, {
    type: "chapitre", num: "Partie 4 sur 6",
    titre: "La paie",
    sous: "Le bulletin au Code général des impôts 2026, chaque ligne avec son fondement.",
  }],
  ["05-dsf", 8000, {
    type: "chapitre", num: "Partie 5 sur 6",
    titre: "La clôture et la DSF",
    sous: "Préparée sur l'exercice clos, validée par un second regard, déposée avec l'accusé de la DGI.",
  }],
  ["06-pilotage", 8000, {
    type: "chapitre", num: "Partie 6 sur 6",
    titre: "Le pilotage du cabinet",
    sous: "Ce que la direction lit, et le rapport mensuel.",
  }],
  ["07-a-decider", 16000, {
    type: "chapitre", num: "Ce qui reste à décider ensemble",
    titre: "Pour passer en production",
    sous: "Les identifiants marchands Tara Money. La clé d'API qui active la lecture automatique des factures. La validation des taux de paie par le fiscaliste du cabinet. Un accès de télédéclaration pour le modèle DGI de la DSF, et la position de la DGI sur le dépôt par un CGA.",
  }],
  ["08-cloture", 9000, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Merci",
    sous: "Toutes les séquences de cette présentation ont été jouées en direct sur la solution, les 14 et 15 octobre 2026.",
    pied: PIED,
  }],
];

for (const [nom, duree, demande] of CARTONS) {
  const plateau = await ouvrirLePlateau(`${SORTIE}${nom}.mp4`);
  await carton(plateau.page, demande, duree);
  await plateau.fermer();
  console.log(`  ✓ ${nom}`);
}
