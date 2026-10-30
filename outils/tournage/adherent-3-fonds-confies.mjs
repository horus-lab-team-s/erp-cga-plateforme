/**
 * ESPACE ADHERENT · FLUX 3 — LE CABINET PAIE POUR L'ADHERENT QUI L'A MANDATE.
 *
 * La reviseure arrete le montant ; l'adherent remet ses fonds (mobile money montre,
 * guichet joue) ; la caisse les recoit, a part des honoraires ; l'echeance dit « fonds
 * recus » ; la reviseure porte la quittance de l'administration ; l'echeance est payee.
 *
 *     PRISE=1 node adherent-3-fonds-confies.mjs
 *
 * ⚠️ Pile NEUVE construite apres le 14 octobre 2026. La quittance est un SPECIMEN.
 * ⚠️ Le debit mobile money n'est pas joue, comme convenu avec le cabinet.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/adherent-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const QUITTANCE = new URL("./pieces/quittance-cnps-specimen.jpg", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";
const CAISSIERE = "n.essama@cga-brcg.cm";
const OBLIGATIONS = `${CONSOLE}/fr/obligations?dossier=${BATIMENT}`;
// La plus ancienne période CNPS sous mandat : la première ligne du panneau.
const ligneMandat = () => page.locator("li.fonds-sous-mandat", { hasText: /cotisations/i }).first();

async function ouvrirLaCarteCnps() {
  await page.goto(`${CONSOLE}/fr/mon-espace/echeances`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "Le cabinet paie <em>pour l'adhérent qui l'a mandaté</em>",
    sous: "Flux 3 sur 3. Il remet ses fonds, par mobile money ou au guichet ; le cabinet paie l'administration et porte la quittance. Ces fonds ne sont pas des honoraires.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 11000);
});

await chapitre("1 · la réviseure arrête le montant", async () => {
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C,
    "Bâtiment Plus a signé un mandat de paiement pour la CNPS et les retenues sur salaires. Sa TVA, il la règle lui-même.");
  await aller(page, OBLIGATIONS, C,
    "Sur l'échéancier du dossier, un panneau nouveau : « Payées par le cabinet, sous mandat de paiement ».");
  await centrer(page.getByRole("heading", { name: /sous mandat de paiement/ }));
  await souffle(3200);
  const ligne = ligneMandat();
  await centrer(ligne);
  await ligne.locator('input[name="montant"]').fill("");
  await saisir(page, 'li.fonds-sous-mandat >> nth=0 >> input[name="montant"]', "184500", { cadence: 60 });
  await legende(page, C,
    "Hors TVA, rien ne calcule un montant définitif : c'est elle qui l'arrête. Sans mandat, aucun appel n'est possible.");
  await souffle(3600);
  await ligne.locator("button[type=submit]").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2400);
});

await chapitre("2 · l'adhérent remet ses fonds", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "Il lit ce qu'il doit remettre, et comment",
    sous: "Sur sa carte : « le cabinet paie pour vous ». Il remet ses fonds par mobile money, ou au guichet.",
  }, 8000);
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Jean-Pierre NKOA ouvre ses échéances.");
  await ouvrirLaCarteCnps();
  await projecteur(page, '.adherent__echeances li:has(.adherent__confie)', { tenir: 2800 });
  await legende(page, C,
    "Cotisations CNPS : « Le cabinet paie pour vous : 184 500 FCFA à lui remettre ».");
  await souffle(4000);
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator('.adherent__echeances li:has(.adherent__confie) a').first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("heading", { name: "Le cabinet paie pour vous" }));
  await legende(page, C,
    "Le montant, le bouton mobile money, et le guichet. « Payée » n'arrivera qu'avec la quittance de l'administration.");
  await souffle(4600);
  await legende(page, C,
    "Le débit mobile money n'est pas joué ici, faute d'identifiants marchands. Il remet ses fonds au guichet du cabinet.");
  await souffle(4400);
});

await chapitre("3 · la caisse reçoit, à part", async () => {
  const C = "À la caisse";
  await seConnecter(page, CAISSIERE, C, "Nadège ESSAMA, à la caisse.");
  await centrer(page.getByRole("heading", { name: "Fonds remis pour l'administration" }));
  await legende(page, C,
    "Un panneau à part : « Fonds remis pour l'administration ». Cet argent n'est pas au cabinet, il ne s'additionne à aucun total.");
  await souffle(4600);
  const panneau = page.locator("section, div").filter({ has: page.getByRole("heading", { name: "Fonds remis pour l'administration" }) }).last();
  void panneau;
  await saisir(page, 'li.caisse__ligne:has(button:has-text("Recevoir les fonds")) input[name="reference_externe"]', "Reçu de caisse n° 2026-0602", { cadence: 34 });
  await page.locator('li.caisse__ligne:has(button:has-text("Recevoir les fonds")) input[name="rapproche"]').check();
  await souffle(1600);
  await page.locator('button:has-text("Recevoir les fonds")').first().click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await legende(page, C,
    "Reçus. Le message le rappelle : ils sont à reverser à l'administration, ce ne sont pas des honoraires.");
  await souffle(4200);
});

await chapitre("4 · « fonds reçus » n'est pas « payée »", async () => {
  const C = "Chez l'adhérent";
  await souffle(6000); // le relais publie l'événement vers les Obligations
  await seConnecter(page, ADHERENT, C, null);
  await ouvrirLaCarteCnps();
  await projecteur(page, '.adherent__echeances li[data-etat="FONDS_RECUS"]', { tenir: 2800 });
  await legende(page, C,
    "« Fonds reçus par le cabinet : il règle l'administration. » Pas encore « payée » : un retard de reversement serait une pénalité pour lui, il doit pouvoir le voir.");
  await souffle(5600);
});

await chapitre("5 · la réviseure paie et porte la quittance", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "Payer l'administration, porter la quittance",
    sous: "La réviseure règle la CNPS avec les fonds reçus, puis dépose la quittance au dossier : l'échéance de l'adhérent passe à « Payée ».",
  }, 8000);
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, null);
  await aller(page, OBLIGATIONS, C,
    "La ligne CNPS dit maintenant : 184 500 francs reçus au guichet, l'administration est à payer.");
  const ligne = ligneMandat();
  await centrer(ligne);
  await souffle(3200);
  await ligne.locator('input[type="file"]').setInputFiles(QUITTANCE);
  await legende(page, C,
    "Elle a réglé la CNPS ; elle joint la quittance de l'administration.");
  await souffle(3000);
  await ligne.locator("button[type=submit]").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2600);
});

await chapitre("6 · payée, avec la quittance", async () => {
  const C = "Chez l'adhérent";
  await souffle(6000);
  await seConnecter(page, ADHERENT, C, null);
  await ouvrirLaCarteCnps();
  await projecteur(page, '.adherent__echeances li[data-etat="PAYEE"]', { tenir: 2800 });
  await legende(page, C,
    "Cotisations CNPS : « Payée : quittance vérifiée par le cabinet ».");
  await souffle(3600);
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator('.adherent__echeances li[data-etat="PAYEE"] a').first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".document-piece").first());
  await page.locator(".document-piece button", { hasText: "Aperçu" }).first().click();
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".document-piece__apercu"));
  await legende(page, C,
    "Et il lit la quittance de l'administration que le cabinet a portée pour lui.");
  await souffle(4600);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Deux voies pour la TVA et la CNPS, un seul sens à « Payée »",
    sous: "Il paie lui-même et envoie sa quittance, ou il confie ses fonds au cabinet sous mandat. Dans les deux cas, « Payée » n'arrive qu'avec la quittance de l'administration.",
  }, 10000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "Paiements de l'adhérent : <em>trois flux livrés</em>",
    sous: "Honoraires, quittances vérifiées, fonds confiés au cabinet. Tout a été joué en direct, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 8000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
