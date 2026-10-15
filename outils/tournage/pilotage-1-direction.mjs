/**
 * PILOTAGE · FLUX 1 — CE QUE LA DIRECTION LIT, ET LE RAPPORT DU MOIS.
 *
 * La directrice ouvre son tableau de bord, le pilotage du cabinet (dossiers par risque,
 * charge par collaborateur), le détail d'un dossier, puis génère le rapport mensuel.
 *
 *     PRISE=1 node pilotage-1-direction.mjs
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/pilotage-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Pilotage",
    titre: "Ce que la direction <em>lit et décide</em>",
    sous: "Le portefeuille par risque, la charge de l'équipe, et le rapport mensuel, calculés sur les mêmes chiffres que les écrans de production.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

await chapitre("1 · le tableau de bord", async () => {
  const C = "Chez la directrice";
  await seConnecter(page, "b.mballa@cga-brcg.cm", C,
    "Bernadette MBALLA dirige le cabinet. Son tableau de bord s'ouvre à la connexion.");
  await souffle(3000);
  await legende(page, C,
    "Les retards, les échéances de la semaine, les dossiers à surveiller : ce qui demande une décision, en tête.");
  await souffle(5200);
  await page.mouse.move(800, 500);
  await page.mouse.wheel(0, 500);
  await souffle(3000);
});

await chapitre("2 · le pilotage du cabinet", async () => {
  const C = "Le pilotage";
  await aller(page, `${CONSOLE}/fr/pilotage`, C,
    "Les dossiers par risque, du plus risqué au moins risqué : la direction traite ce qui est en haut.");
  await souffle(4200);
  await centrer(page.getByRole("heading", { name: "Charge par collaborateur" }));
  await legende(page, C,
    "La charge par collaborateur : comment le travail se répartit. L'écran le dit : ceci n'évalue personne.");
  await souffle(5200);
});

await chapitre("3 · le rapport du mois", async () => {
  const C = "Le rapport mensuel";
  await aller(page, `${CONSOLE}/fr/pilotage/rapports`, C,
    "Le rapport qualité du mois : ses sections reprennent exactement les chiffres des écrans, à la date du rapport.");
  await souffle(2600);
  await projecteur(page, 'button:has-text("Générer le rapport mensuel")', { tenir: 2200 }).catch(() => undefined);
  await page.getByRole("button", { name: /Générer le rapport mensuel/ }).click();
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
  await souffle(3000);
  await legende(page, C,
    "Généré, archivé, versionné : une regénération crée une version suivante, l'ancienne reste.");
  await souffle(5200);
  const lien = page.locator('a[href*="/pilotage/rapports/"]').first();
  if (await lien.count()) {
    await Promise.all([
      page.waitForURL(/pilotage\/rapports\//, { timeout: 15000 }).catch(() => undefined),
      lien.click(),
    ]);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(2200);
    await legende(page, C, "Le rapport s'imprime tel quel pour le comité de direction.");
    await souffle(4600);
    await page.mouse.move(800, 500);
    await page.mouse.wheel(0, 600);
    await souffle(2600);
  }
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
