/**
 * PAIE · FLUX 1 — LE BULLETIN AU CODE GÉNÉRAL DES IMPÔTS 2026.
 *
 * Le comptable ouvre un bulletin de Bâtiment Plus : CNPS, CFC, IRPP (pension déduite,
 * frais plafonnés), TDL et redevance audiovisuelle par palier, chaque ligne avec son
 * fondement, « à valider par le fiscaliste » tant qu'il ne l'a pas fait. Puis il embauche
 * un salarié à temps partiel sous le SMIG : le bulletin l'alerte, sans le refuser.
 *
 *     PRISE=1 node paie-1-bulletin-cgi-2026.mjs
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/paie-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";
const SOCIAL = (mois, bulletin) =>
  `${CONSOLE}/fr/social?dossier=${BATIMENT}&annee=2026&mois=${mois}${bulletin ? `&bulletin=${bulletin}` : ""}`;
const MATRICULE = "SAL-0099";

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Social et paie",
    titre: "Le bulletin, <em>au Code général des impôts 2026</em>",
    sous: "Chaque taux relu dans l'édition officielle 2026 du CGI et ses annexes, chaque ligne avec son fondement. Le fiscaliste du cabinet valide.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · un bulletin, ligne par ligne", async () => {
  const C = "Chez le comptable";
  await seConnecter(page, "l.fotso@cga-brcg.cm", C, "Léonard FOTSO établit la paie de septembre de Bâtiment Plus.");
  await aller(page, SOCIAL(9, "SAL-0004"), C, "Le bulletin d'un salarié : 410 000 de base, des primes, un brut taxable de 495 000.");
  await centrer(page.getByRole("heading", { name: /^Bulletin de/ }).first());
  await souffle(3600);
  await legende(page, C,
    "CNPS pension 4,2 % sous plafond de 750 000, CFC 1 % sur une base arrondie au millier : les taux du décret CNPS et de la loi CFC.");
  await souffle(5200);
  await legende(page, C,
    "L'IRPP : frais professionnels de 30 % plafonnés, pension CNPS déduite (article 34), abattement de 500 000, barème progressif, plus 10 % de CAC.");
  await souffle(6000);
  await legende(page, C,
    "La TDL et la redevance audiovisuelle, au montant fixe de leur palier, comme les textes les donnent.");
  await souffle(4800);
  await legende(page, C,
    "« À valider par le fiscaliste » : ces barèmes attendent sa validation au référentiel. Lui seul engage le cabinet sur un taux légal.");
  await souffle(5600);
});

await chapitre("2 · une embauche sous le SMIG", async () => {
  const C = "Une embauche";
  await aller(page, SOCIAL(10), C, "Bâtiment Plus embauche un gardien à temps partiel, à 55 000 francs par mois.");
  await page.getByRole("button", { name: "Embaucher un salarié" }).click();
  await souffle(900);
  await saisir(page, 'input[name="matricule"]', MATRICULE, { cadence: 40 });
  await saisir(page, 'input[name="prenom"]', "Paul", { cadence: 40 });
  await saisir(page, 'input[name="nom"]', "ESSOMBA", { cadence: 40 });
  await page.locator('input[name="debut"]').fill("2026-10-01");
  await saisir(page, 'input[name="salaire_base"]', "55000", { cadence: 40 });
  await saisir(page, 'input[name="poste"]', "Gardien, temps partiel", { cadence: 25 });
  await souffle(1400);
  await page.getByRole("button", { name: "Embaucher", exact: true }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2200);
  await aller(page, SOCIAL(10, MATRICULE), C, null);
  await page.waitForSelector('[role="alert"]', { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('[role="alert"]').first());
  await projecteur(page, '[role="alert"] >> nth=0', { tenir: 2800 }).catch(() => undefined);
  await legende(page, C,
    "Le bulletin signale un salaire sous le SMIG de 60 000 francs (décret de 2023) : à justifier, temps partiel ou secteur agricole. Il ne refuse pas.");
  await souffle(6200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Des taux qui se justifient",
    sous: "CNPS, CFC, FNE, IRPP, TDL, redevance audiovisuelle : chaque montant remonte à son article, à la date de la période. La note « Paie : taux officiels 2026 » liste ce que le fiscaliste tranche.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
