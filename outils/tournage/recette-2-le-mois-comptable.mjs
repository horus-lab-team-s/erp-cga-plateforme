/**
 * RECETTE · FILM 2 (30 octobre 2026) — LE MOIS COMPTABLE, DE LA SAISIE AU DÉPÔT DE LA TVA.
 *
 * AGRO-NKOLO SA, septembre 2026. Les points de la recette qui n'avaient pas de vidéo :
 * le rapprochement bancaire, la clôture du mois et sa transmission, la révision du mois
 * (remarque, réponse, clôture), la déclaration de TVA, son dépôt et son accusé.
 * Et les calculs, à l'écran : TVA à 19,25 % (17,5 % + 10 % de centimes additionnels),
 * TVA collectée moins TVA déductible moins crédit reporté.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_DATE="30 octobre 2026" PRISE=1 \
 *       node recette-2-le-mois-comptable.mjs
 *
 * ⚠️ Pile NEUVE (septembre d'Agro-Nkolo vierge, crédit de TVA de 1 778 700 F reporté d'août).
 * Le second facteur de la réviseure est enrôlé HORS CHAMP. Le portail de la DGI n'est pas
 * joué : l'accusé consigné est un SPÉCIMEN.
 */
import { writeFileSync } from "node:fs";
import {
  CONSOLE, SECRET, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";
import { codeNeuf } from "./second-facteur.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/recette-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const RELEVE = new URL("./pieces/releve-bancaire-septembre-specimen.csv", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const AGRO = "M065544332211L";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const REVISEURE = "a.bouba@cga-brcg.cm";
const REVUE = `${CONSOLE}/fr/comptabilite/revues/REV-20260901-20260930?dossier=${AGRO}`;

// Le relevé de la banque, tel qu'elle l'exporte : point-virgule, dates jj/mm/aaaa.
writeFileSync(RELEVE, [
  "Date;Libellé;Débit;Crédit",
  "25/09/2026;VIR RECU SODECAO FV-2026-0912;;11925000",
  "28/09/2026;VIR ENGRAIS CAMEROUN SA F-2026-0951;2385000;",
  "30/09/2026;FRAIS DE TENUE DE COMPTE SEPT;15000;",
].join("\n") + "\n");

async function enrolerHorsChamp(courriel) {
  const dernier = async (code) => {
    for (let i = 0; i < 10; i++) {
      const m = (await (await fetch(`${API}/transverse/courriels?code=${code}`)).json()).filter((c) => c.destinataire === courriel).at(-1);
      if (m) return m;
      await souffle(1000);
    }
    throw new Error("courriel absent");
  };
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courriel, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  await fetch(`${API}/transverse/second-facteur`, { method: "POST", headers: { cookie } });
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec((await dernier("compte.second_facteur_confirmation")).contexte.lien)[1];
  const { secret } = await (await fetch(`${API}/transverse/second-facteur/confirmation`, {
    method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ jeton }),
  })).json();
  const activation = await fetch(`${API}/transverse/second-facteur/activation`, {
    method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ code: await codeNeuf(secret) }),
  });
  if (!activation.ok) throw new Error(`activation refusée : ${await activation.text()}`);
  return secret;
}

const secretReviseure = await enrolerHorsChamp(REVISEURE);
console.log("Second facteur de la réviseure enrôlé hors champ.");

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

/** Une écriture saisie à l'écran ; `vite` remplit sans frappe visible (les écritures de routine). */
async function ecriture(journal, date, libelle, piece, lignes, { vite = false } = {}) {
  await page.locator('select[name="journal"]').selectOption(journal);
  await page.fill('input[name="date_operation"]', date);
  const taper = async (sel, v) => (vite ? page.fill(sel, v) : saisir(page, sel, v, { cadence: 22 }));
  await taper('input[name="libelle"]', libelle);
  await page.fill('input[name="piece_justificative"]', piece);
  for (const [i, [compte, lib, sens, montant]] of lignes.entries()) {
    await taper(`input[name="compte-${i}"]`, compte);
    await page.fill(`input[name="libelle-${i}"]`, lib);
    await page.locator(`select[name="sens-${i}"]`).selectOption({ label: sens });
    await taper(`input[name="montant-${i}"]`, montant);
  }
}
async function enregistrer() {
  await page.getByRole("button", { name: "Enregistrer en brouillon" }).click();
  await page.waitForTimeout(1800);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Recette en présentiel",
    titre: "Le mois comptable, <em>de la saisie au dépôt de la TVA</em>",
    sous: "Agro-Nkolo SA, septembre 2026 : les écritures et leurs calculs, le rapprochement bancaire, la clôture du mois, la révision par un second regard, la déclaration de TVA et son dépôt.",
    pied: `Démonstration jouée en direct sur la solution · 30 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · les écritures du mois, et leurs calculs", async () => {
  const C = "Saisie";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable d'Agro-Nkolo, passe les opérations de septembre.");
  await aller(page, `${CONSOLE}/fr/comptabilite/saisie?dossier=${AGRO}`, C, "Une vente de 50 tonnes de maïs à la SODECAO, 10 000 000 F hors taxes.");
  await ecriture("VE", "2026-09-15", "Vente de maïs — SODECAO", "FV-2026-0912", [
    ["411", "SODECAO", "Débit", "11925000"],
    ["701", "Ventes de maïs grain — 50 t", "Crédit", "10000000"],
    ["4431", "TVA facturée", "Crédit", "1925000"],
  ]);
  await legende(page, C, "TVA à 19,25 % : 17,5 % de principal + 10 % de centimes additionnels = 1 925 000 F. Le client doit 11 925 000 F TTC.");
  await souffle(6000);
  await centrer(page.getByText("équilibrée").first());
  await legende(page, C, "Débit et crédit s'égalent : l'écriture est équilibrée. Elle naît en brouillon.");
  await souffle(3500);
  await enregistrer();
  await legende(page, C, "Puis l'achat d'engrais, 2 000 000 F HT : TVA récupérable 385 000 F, fournisseur 2 385 000 F.");
  await ecriture("AC", "2026-09-20", "Engrais complémentaires — ENGRAIS CAMEROUN SA", "F-2026-0951", [
    ["602", "Engrais urée — 5 t", "Débit", "2000000"],
    ["4451", "TVA récupérable sur achats", "Débit", "385000"],
    ["401", "ENGRAIS CAMEROUN SA", "Crédit", "2385000"],
  ], { vite: true });
  await souffle(3500);
  await enregistrer();
  await legende(page, C, "La banque : l'encaissement de la SODECAO, le règlement du fournisseur, les frais de tenue de compte.");
  await ecriture("BQ", "2026-09-25", "Encaissement SODECAO — FV-2026-0912", "VIR-0925", [
    ["521", "Banque", "Débit", "11925000"], ["411", "SODECAO", "Crédit", "11925000"],
  ], { vite: true });
  await enregistrer();
  await ecriture("BQ", "2026-09-28", "Règlement ENGRAIS CAMEROUN SA — F-2026-0951", "VIR-0928", [
    ["401", "ENGRAIS CAMEROUN SA", "Débit", "2385000"], ["521", "Banque", "Crédit", "2385000"],
  ], { vite: true });
  await enregistrer();
  await ecriture("BQ", "2026-09-30", "Frais de tenue de compte — septembre", "REL-0930", [
    ["631", "Frais bancaires", "Débit", "15000"], ["521", "Banque", "Crédit", "15000"],
  ], { vite: true });
  await enregistrer();
  await legende(page, C, "Cinq brouillons. Il les relit et les valide : une écriture validée ne se corrige plus que par son inverse.");
  for (let i = 0; i < 5; i++) {
    const valider = page.getByRole("button", { name: "Valider", exact: true }).first();
    if (!(await valider.count())) break;
    await centrer(valider);
    await valider.click();
    await page.waitForTimeout(1600);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  }
  await souffle(2500);
});

await chapitre("2 · le rapprochement bancaire", async () => {
  const C = "Rapprochement";
  await aller(page, `${CONSOLE}/fr/comptabilite/rapprochement?dossier=${AGRO}`, C, "Le relevé de septembre, exporté de la banque, s'importe ici.");
  await page.locator('select[name="journal"]').selectOption("BQ");
  await page.fill('input[name="du"]', "2026-09-01");
  await page.fill('input[name="au"]', "2026-09-30");
  await saisir(page, 'input[name="solde_initial"]', "0", { cadence: 60 });
  await saisir(page, 'input[name="solde_final"]', "9525000", { cadence: 60 });
  await page.locator('select[name="profil"]').selectOption("csv-debit-credit");
  await page.locator('input[name="fichier"]').setInputFiles(RELEVE);
  await legende(page, C, "Les soldes du relevé contrôlent le fichier : 0 + 11 925 000 − 2 385 000 − 15 000 = 9 525 000 F.");
  await souffle(5500);
  await Promise.all([
    page.waitForURL(/rapprochement\/RB-/, { timeout: 20000 }).catch(() => undefined),
    page.getByRole("button", { name: "Importer et rapprocher" }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Chaque ligne du relevé trouve son écriture d'elle-même : même montant, date proche. Écart : zéro.");
  await souffle(6000);
  await centrer(page.getByText("État de rapprochement").first());
  await souffle(3500);
  const valider = page.getByRole("button", { name: "Valider le rapprochement" });
  await centrer(valider);
  await valider.click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Le rapprochement est arrêté : le solde bancaire et le compte 521 disent la même chose.");
  await souffle(4500);
});

await chapitre("3 · la clôture du mois, transmise au réviseur", async () => {
  const C = "Clôture";
  await aller(page, `${CONSOLE}/fr/comptabilite/cloture?dossier=${AGRO}&mois=2026-09`, C,
    "La clôture de septembre : chaque point de contrôle, réglé au référentiel.");
  await centrer(page.getByText("Points de contrôle du mois").first());
  await souffle(5000);
  await legende(page, C, "Pas de brouillon, rapprochement à jour, balance équilibrée, numérotation continue : il peut transmettre.");
  await souffle(4000);
  await saisir(page, 'textarea[name="message"]', "Septembre bouclé : vente SODECAO, achat d'engrais, banque rapprochée.", { cadence: 16 });
  await page.getByRole("button", { name: /Transmettre au réviseur/ }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Transmis : septembre est verrouillé. Toute correction passera par une contre-passation, visible au grand livre.");
  await souffle(5000);
});

await chapitre("4 · le second regard : remarque, réponse, validation", async () => {
  const C = "Révision";
  await seConnecter(page, REVISEURE, C, "Aïcha BOUBA, réviseure, reçoit le mois avec un échantillon d'écritures atypiques.");
  await aller(page, REVUE, C, "Les points de contrôle, puis l'échantillon : les plus gros montants, les comptes rarement mouvementés.");
  await souffle(4000);
  await page.getByRole("button", { name: "Remarquer" }).first().click();
  await saisir(page, ".page-travail textarea[name=texte]", "Pièce FV-2026-0912 : joindre le bon de livraison signé par SODECAO, pour justifier la vente de 50 t.", { cadence: 14 });
  await page.getByRole("button", { name: "Poser la remarque" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "Une remarque sur la vente : il manque le bon de livraison. Elle renvoie le mois au comptable.");
  await souffle(3500);
  await page.getByRole("button", { name: /Renvoyer au comptable/ }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await seConnecter(page, COMPTABLE, C, "Léonard reçoit la remarque.");
  await aller(page, REVUE, C, "Il répond, pièce à l'appui, puis retransmet.");
  await page.getByRole("button", { name: "Répondre" }).first().click();
  await saisir(page, 'textarea[name="reponse"]', "Bon de livraison BL-0912 signé par SODECAO, joint à la pièce.", { cadence: 16 });
  await page.getByRole("button", { name: "Répondre" }).last().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.getByRole("button", { name: /Retransmettre au réviseur/ }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await seConnecter(page, REVISEURE, C, "Aïcha lit la réponse.");
  await aller(page, REVUE, C, "Satisfaite, elle clôt la remarque, puis valide le mois.");
  await page.getByRole("button", { name: "Clore" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.getByRole("button", { name: "Valider le mois" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Septembre est validé. Le second regard est inscrit, et la TVA du mois devient déposable.");
  await souffle(4500);
});

await chapitre("5 · la déclaration de TVA, puis son dépôt", async () => {
  const C = "TVA de septembre";
  await aller(page, `${CONSOLE}/fr/obligations/declarations?dossier=${AGRO}`, C, "La déclaration de TVA de septembre, construite depuis les journaux : rien ne se ressaisit.");
  await centrer(page.getByText("Décompte de la période").first());
  await legende(page, C, "TVA collectée 1 925 000 − TVA déductible 385 000 − crédit reporté d'août 1 778 700 = − 238 700 F.");
  await souffle(7500);
  await legende(page, C, "Rien à payer en septembre : un crédit de 238 700 F à reporter sur octobre.");
  await souffle(4500);
  await centrer(page.locator('.page-travail input[name="code"]'));
  await legende(page, C, "Consigner un dépôt est un geste sensible : la réviseure renforce sa session par le second facteur.");
  await saisir(page, '.page-travail input[name="code"]', await codeNeuf(secretReviseure), { cadence: 110 });
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  await centrer(page.locator('input[name="numero"]'));
  await legende(page, C, "Après le dépôt sur le portail de la DGI, elle consigne l'accusé : numéro, date, montant, pièce.");
  await saisir(page, 'input[name="numero"]', "DGI-TVA-2026-09-114872", { cadence: 30 });
  await page.fill('input[name="depose_le"]', "2026-10-14T10:30");
  await saisir(page, 'input[name="montant_constate"]', "0", { cadence: 60 });
  await saisir(page, 'input[name="piece_jointe"]', "Accusé DGI du 14/10/2026 (spécimen)", { cadence: 20 });
  await souffle(1200);
  await page.getByRole("button", { name: "Consigner le dépôt de TVA" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Le dépôt est consigné, confronté au bordereau préparé. L'échéance de septembre passe à « déclarée ».");
  await souffle(5000);
  await aller(page, `${CONSOLE}/fr/obligations?dossier=${AGRO}`, C, "L'échéancier d'Agro-Nkolo, à jour.");
  await souffle(4500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Un mois tenu, <em>contrôlé, déclaré</em>",
    sous: "Des écritures équilibrées dont chaque montant se calcule à l'écran ; une banque rapprochée sans écart ; un mois clos, verrouillé, relu par un second regard ; une TVA tirée des journaux, avec son crédit reporté, déposée sous second facteur.",
    pied: `30 octobre 2026<br>${PIED}`,
  }, 11000);
});

await plateau.fermer();
console.log(`\nFilm : ${SORTIE} · ${Math.round((Date.now() - debut) / 1000)} s`);
