/**
 * COMPTABILITÉ · FLUX 4 — LES IMMOBILISATIONS : LE REGISTRE, LA DOTATION, LE TABLEAU DE LA DSF.
 *
 * SARL BATIMENT PLUS, exercice 2026. Des portables achetés en juillet sont en comptabilité,
 * pas au registre : le contrôle avec la balance le signale. Le comptable saisit la fiche ; la
 * dotation se calcule au prorata des jours, se passe en écriture en brouillon, se valide ; le
 * registre concorde alors avec la balance, et le tableau des amortissements, pièce n° 7 de la
 * DSF, se télécharge en Excel.
 *
 *     PRISE=1 node compta-4-immobilisations.mjs
 *
 * ⚠️ HORS CHAMP : l'écriture d'achat des portables (compte 24), saisie et validée par l'API.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre, centrer,
  ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.API ?? "http://localhost:8100";
const SORTIE = new URL(`./sortie/compta-4-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const BATIMENT = "M081234567890P";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const ECRAN = `${CONSOLE}/fr/comptabilite/immobilisations?dossier=${BATIMENT}&exercice=2026`;

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
      journal: "OD", exercice: "2026", date_operation: "2026-07-01", libelle: "Achat de six ordinateurs portables",
      piece_justificative: "F-INFO-2026-07",
      lignes: [
        { compte: "24", libelle: "Ordinateurs portables", sens: "DEBIT", montant: "3650000" },
        { compte: "401", libelle: "INFOTECH DOUALA", sens: "CREDIT", montant: "3650000" },
      ],
    }),
  });
  if (r.status !== 201) throw new Error(`saisie : ${r.status} ${await r.text()}`);
  const { numero } = await r.json();
  const v = await fetch(`${API}/comptabilite/dossiers/${BATIMENT}/ecritures/2026/OD/${numero}/validation`, {
    method: "POST",
    headers: { cookie },
  });
  if (v.status !== 200) throw new Error(`validation : ${v.status} ${await v.text()}`);
}

await horsChamp();
console.log("Achat posé hors champ.");
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Comptabilité",
    titre: "Les immobilisations, <em>amorties sans calcul à la main</em>",
    sous: "Une fiche par bien ; la dotation calculée et passée en écriture ; le tableau des amortissements produit pour la DSF.",
    pied: "Présentation de la solution · 17 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

await chapitre("1 · le contrôle signale un bien oublié", async () => {
  const C = "Le registre";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable de Bâtiment Plus, ouvre les immobilisations du dossier.");
  await aller(page, ECRAN, C, "Comptabilité · Immobilisations : le tableau de l'exercice, puis le registre des biens.");
  await souffle(1500);
  await projecteur(page, ".immobilisations__controle", { tenir: 2400 });
  await legende(page, C, "Des portables achetés en juillet sont en comptabilité, mais pas au registre : le contrôle avec la balance le montre.");
  await souffle(5600);
});

await chapitre("2 · saisir la fiche", async () => {
  const C = "La fiche du bien";
  await page.getByRole("button", { name: "Saisir une immobilisation" }).click();
  await souffle(900);
  const f = "form.immobilisations__formulaire";
  await centrer(page.locator(f));
  await legende(page, C, "Une fiche : code, libellé, catégorie, valeur hors taxe, mise en service, durée d'utilisation.");
  await saisir(page, `${f} input[name=code]`, "INFO-01");
  await saisir(page, `${f} input[name=libelle]`, "Six ordinateurs portables");
  await page.locator(`${f} select[name=categorie]`).selectOption("24");
  await saisir(page, `${f} input[name=valeur_origine]`, "3650000");
  await page.locator(`${f} input[name=mise_en_service]`).fill("2026-07-01");
  await saisir(page, `${f} input[name=duree_annees]`, "4");
  await saisir(page, `${f} input[name=fournisseur]`, "INFOTECH DOUALA");
  await saisir(page, `${f} input[name=piece]`, "F-INFO-2026-07");
  await legende(page, C, "La durée se fixe bien par bien, selon les taux admis par le CGI, validés avec le fiscaliste.");
  await souffle(2400);
  await page.getByRole("button", { name: "Enregistrer au registre" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  await centrer(page.locator(".immobilisations__tableau"));
  await legende(page, C, "Le tableau se calcule : 184 jours d'utilisation en 2026, soit 460 000 FCFA de dotation, au prorata des jours.");
  await souffle(6200);
});

await chapitre("3 · passer la dotation", async () => {
  const C = "La dotation";
  await centrer(page.getByRole("button", { name: /Passer la dotation/ }));
  await legende(page, C, "Un clic : la dotation part en écriture au journal des opérations diverses, en brouillon, datée de la clôture.");
  await souffle(2400);
  await page.getByRole("button", { name: /Passer la dotation/ }).click();
  await page.waitForTimeout(2500);
  const message = await page.locator(".immobilisations__fait").first().textContent().catch(() => "");
  const numero = Number((message ?? "").match(/OD\/(\d+)/)?.[1] ?? "0");
  await centrer(page.locator(".immobilisations__fait"));
  await souffle(3600);
  await aller(
    page,
    `${CONSOLE}/fr/comptabilite/ecritures?dossier=${BATIMENT}&exercice=2026&journal=OD&numero=${numero}`,
    C,
    "L'écriture : 681 au débit, 28 au crédit, avec le tableau des amortissements pour pièce. Elle se relit, puis se valide.",
  );
  await souffle(4200);
  await page.getByRole("button", { name: "Valider" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(3200);
});

await chapitre("4 · le registre concorde, la pièce de la DSF est prête", async () => {
  const C = "Le tableau de la DSF";
  await aller(page, ECRAN, C, "Validée, la dotation entre en balance : le registre concorde, brut comme amortissements.");
  await projecteur(page, ".immobilisations__controle", { tenir: 2400 });
  await souffle(3800);
  await legende(page, C, "Le tableau des amortissements, pièce n° 7 de la DSF, se télécharge en Excel, bien par bien.");
  const [fichier] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: "Tableau des amortissements (Excel)" }).click(),
  ]);
  console.log(`  fichier : ${fichier ? fichier.suggestedFilename() : "aucun"}`);
  await souffle(4400);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Une fiche par bien, le reste se calcule",
    sous: "La dotation n'est plus calculée à la main, le tableau de la DSF n'est plus ressaisi, et un bien oublié au registre se voit.",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
