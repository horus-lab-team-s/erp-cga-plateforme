/**
 * DSF · FLUX 2 — LES ANNEXES : PIÈCES À JOINDRE, FICHES DES FOURNISSEURS, IMPÔT ESTIMÉ.
 *
 * SARL BATIMENT PLUS, exercice 2026. Le comptable prépare le dépôt :
 * 1. l'impôt sur les sociétés estimé, au taux ou au minimum de perception (CGI art. 17, 22, 23) ;
 * 2. les pièces que le portail de la DGI exige : il verse l'attestation de visa, déclare sans
 *    objet ce qui ne concerne pas le dossier ; celles que la plateforme produit sont prêtes ;
 * 3. les fiches des fournisseurs : il complète sigle, téléphone et ville, et le modèle
 *    « MODELE FOURNISSEURS » de la DGI les reprend.
 *
 *     PRISE=1 node dsf-2-annexes-de-la-dsf.mjs
 *
 * ⚠️ HORS CHAMP : une écriture de ventes de l'exercice, saisie et validée par l'API. Les
 * données de démonstration n'ont pas de chiffre d'affaires en 2026, et l'impôt estimé dirait
 * « aucun impôt dû ». L'attestation versée est un SPÉCIMEN, qui le dit.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre, centrer,
  ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.API ?? "http://localhost:8100";
const SORTIE = new URL(`./sortie/dsf-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const VISA = new URL("./pieces/attestation-visa-specimen.pdf", import.meta.url).pathname;
const BATIMENT = "M081234567890P";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const ECRAN = `${CONSOLE}/fr/cloture?dossier=${BATIMENT}&exercice=2026`;

async function horsChamp() {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel: COMPTABLE, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const r = await fetch(`${API}/comptabilite/dossiers/${BATIMENT}/ecritures`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      journal: "VE", exercice: "2026", date_operation: "2026-09-30", libelle: "Travaux facturés, troisième trimestre",
      piece_justificative: "FV-2026-T3",
      lignes: [
        { compte: "411", libelle: "Clients", sens: "DEBIT", montant: "101362500" },
        { compte: "706", libelle: "Travaux facturés", sens: "CREDIT", montant: "85000000" },
        { compte: "4431", libelle: "TVA facturée", sens: "CREDIT", montant: "16362500" },
      ],
    }),
  });
  if (r.status !== 201) throw new Error(`saisie : ${r.status} ${await r.text()}`);
  const { numero, journal } = await r.json();
  const v = await fetch(`${API}/comptabilite/dossiers/${BATIMENT}/ecritures/2026/${journal ?? "VE"}/${numero}/validation`, {
    method: "POST",
    headers: { cookie },
  });
  if (v.status !== 200) throw new Error(`validation : ${v.status} ${await v.text()}`);
}

await horsChamp();
console.log("Ventes posées hors champ.");
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Clôture et DSF",
    titre: "Les annexes de la DSF, <em>prêtes avant le portail</em>",
    sous: "L'impôt estimé, les pièces que le portail de la DGI exige, et les fiches des fournisseurs que ses modèles déclarent.",
    pied: "Présentation de l'avancement du développement · 16 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · l'impôt estimé", async () => {
  const C = "L'impôt de l'exercice";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable, prépare la DSF 2026 de Bâtiment Plus.");
  await aller(page, ECRAN, C, "La liasse de l'exercice : sous le résultat fiscal, l'impôt sur les sociétés estimé.");
  const ligne = page.getByText("Impôt sur les sociétés dû, estimé");
  await centrer(ligne);
  await legende(page, C, "L'IS à 30 % du résultat, ou au moins 2 % du chiffre d'affaires, centimes additionnels compris : le plus élevé est dû.");
  await souffle(6200);
  await legende(page, C, "Les taux viennent du référentiel, avec leur article du CGI 2026 ; un taux pas encore validé par le fiscaliste est signalé.");
  await souffle(5600);
});

await chapitre("2 · les pièces à joindre", async () => {
  const C = "Les pièces de la DSF";
  const pieces = page.locator("section[aria-label='Pièces à joindre à la DSF']");
  await centrer(pieces);
  await legende(page, C, "La liste du guide de la DGI : le portail refuse de soumettre tant qu'il en manque une. Elle le dit avant le dépôt.");
  await souffle(5600);
  const balances = pieces.locator("li", { hasText: "Balance auxiliaire fournisseurs" });
  await centrer(balances);
  await legende(page, C, "Les balances auxiliaires et les déclarations par tiers sont produites par la plateforme, depuis les écritures.");
  await souffle(5000);
  const visa = pieces.locator("li", { hasText: "Attestation de visa" });
  await centrer(visa);
  await legende(page, C, "L'attestation de visa, il la verse : un PDF, gardé au dossier.");
  await visa.locator('input[type="file"]').setInputFiles(VISA);
  await souffle(1500);
  await visa.getByRole("button", { name: "Verser" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  const accises = pieces.locator("li", { hasText: "Droits d'accises" });
  await centrer(accises);
  await legende(page, C, "Les droits d'accises ne concernent pas une entreprise de bâtiment : il le déclare sans objet, et dit pourquoi.");
  await accises.getByRole("button", { name: "Sans objet" }).click();
  await saisir(page, `section[aria-label='Pièces à joindre à la DSF'] li:has-text("Droits d'accises") input[name="motif"]`, "Bâtiment Plus ne vend aucun produit soumis aux droits d'accises.");
  await souffle(800);
  await accises.getByRole("button", { name: "Confirmer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  await centrer(pieces.locator(".dsf__note").first());
  await legende(page, C, "Le compte des pièces à fournir a baissé de deux : versée et sans objet, chacune tracée au journal.");
  await souffle(5600);
});

await chapitre("3 · les fiches des fournisseurs", async () => {
  const C = "Les fournisseurs déclarés";
  const bloc = page.locator("section[aria-label='Fiches des fournisseurs déclarés']");
  await centrer(bloc);
  await legende(page, C, "Le modèle « MODELE FOURNISSEURS » de la DGI demande sigle, téléphone et ville : une facture ne les donne pas.");
  await souffle(5600);
  const quincaillerie = bloc.locator("li", { hasText: "QUINCAILLERIE DU WOURI" });
  await centrer(quincaillerie);
  await quincaillerie.getByRole("button", { name: "Compléter la fiche" }).click();
  await souffle(900);
  const base = `section[aria-label='Fiches des fournisseurs déclarés'] li:has-text("QUINCAILLERIE DU WOURI")`;
  await saisir(page, `${base} input[name="sigle"]`, "QDW");
  await saisir(page, `${base} input[name="telephone"]`, "+237 699 00 11 22");
  await saisir(page, `${base} input[name="ville"]`, "Douala");
  await legende(page, C, "Il complète la fiche une fois : chaque export la reprend, sans seconde saisie.");
  await souffle(1600);
  await quincaillerie.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  await centrer(bloc.locator("li", { hasText: "QUINCAILLERIE DU WOURI" }));
  await legende(page, C, "La fiche est complète ; les autres disent encore ce qui leur manque.");
  await souffle(5200);
  const declaration = page.locator("section[aria-label='Pièces à joindre à la DSF'] li", { hasText: "achats par fournisseur" });
  await legende(page, C, "Le modèle de la DGI, sous son nom exact, se télécharge rempli : prêt à joindre sur le portail.");
  await centrer(declaration);
  await souffle(1600);
  const [fichier] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }).catch(() => null),
    declaration.getByRole("button", { name: "Télécharger" }).click(),
  ]);
  console.log(`  fichier : ${fichier ? fichier.suggestedFilename() : "aucun téléchargement"}`);
  await souffle(5000);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Le dépôt se prépare dans la plateforme",
    sous: "L'impôt est estimé avant le portail, chaque pièce exigée est suivie, et les modèles de la DGI sortent remplis de ce que le dossier sait déjà.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
