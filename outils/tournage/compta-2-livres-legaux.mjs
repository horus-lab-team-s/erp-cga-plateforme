/**
 * COMPTABILITE · FLUX 2 — LES LIVRES OBLIGATOIRES, IMPRIMABLES.
 *
 * Le comptable lit la balance de l'exercice, puis édite le grand livre et la balance
 * générale en PDF, sur la période choisie (AUDCIF, art. 19).
 *
 *     PRISE=1 node compta-2-livres-legaux.mjs
 *
 * ⚠️ Le PDF est TÉLÉCHARGÉ par l'application ; pour le montrer, la prise l'ouvre ensuite
 * dans le même onglet (la capture ne suit qu'un onglet).
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/compta-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const DOSSIER_PDF = new URL("./sortie/", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";
const BALANCE = `${CONSOLE}/fr/comptabilite?dossier=${BATIMENT}&exercice=2026&du=2026-07-10&au=2026-09-30`;

async function montrerLePdf(bouton, C, texte) {
  const [telechargement] = await Promise.all([
    page.waitForEvent("download", { timeout: 25000 }),
    page.getByRole("button", { name: bouton }).click(),
  ]);
  const chemin = `${DOSSIER_PDF}${telechargement.suggestedFilename()}`;
  await telechargement.saveAs(chemin);
  await souffle(1200);
  await page.goto(`file://${chemin}`, { waitUntil: "load" });
  await souffle(2200);
  await legende(page, C, texte);
  await souffle(5200);
  await page.mouse.move(800, 500);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 450);
    await souffle(650);
  }
  await souffle(1800);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Comptabilité",
    titre: "Les livres obligatoires, <em>imprimables</em>",
    sous: "Livre-journal, grand livre et balance générale en PDF, sur les écritures validées, par les mêmes calculs que l'écran.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

await chapitre("1 · la balance de l'exercice", async () => {
  const C = "Chez le comptable";
  await seConnecter(page, "l.fotso@cga-brcg.cm", C, "Léonard FOTSO tient la comptabilité de Bâtiment Plus.");
  await aller(page, BALANCE, C,
    "La balance du 10 juillet au 30 septembre : chaque compte, ses mouvements et son solde, contrôlés à l'affichage.");
  await souffle(3600);
  await centrer(page.locator(".livres-obligatoires"));
  await projecteur(page, ".livres-obligatoires", { tenir: 2600 });
  await legende(page, C,
    "Un panneau : les trois livres que l'Acte uniforme OHADA impose, en PDF, sur la période filtrée.");
  await souffle(4200);
});

await chapitre("2 · le grand livre", async () => {
  await montrerLePdf("Grand livre (PDF)", "Le grand livre",
    "La période commence le 10 juillet : chaque compte ouvre sur son solde reporté, puis ses mouvements et son solde progressif.");
});

await chapitre("3 · la balance générale", async () => {
  await montrerLePdf("Balance générale (PDF)", "La balance générale",
    "La balance, elle, cumule depuis l'ouverture et s'arrête au 30 septembre : un total par classe, débits et crédits égaux.");
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Les livres qu'un contrôleur demande",
    sous: "Arrêtés à une date, paginés, avec le dossier et le NIU sur chaque page. Les chiffres sont ceux de l'écran : un livre légal qui divergerait serait le pire des deux.",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
