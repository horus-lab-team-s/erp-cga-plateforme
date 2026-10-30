/**
 * ESPACE ADHERENT · FLUX 2 — TVA ET CNPS : IL PAIE L'ADMINISTRATION, LE CABINET VERIFIE.
 *
 * L'adherent envoie la quittance ; le reviseur la lit en apercu et la valide (« Payee ») ou
 * la refuse avec son motif, que l'adherent lit. Et l'apercu des documents qu'il a charges.
 *
 *     PRISE=1 node adherent-2-quittances.mjs
 *
 * ⚠️ Pile NEUVE construite apres le 14 octobre 2026. La quittance est un SPECIMEN fictif.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, seConnecter, chapitre, centrer,
  ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/adherent-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const QUITTANCE = new URL("./pieces/quittance-cnps-specimen.jpg", import.meta.url).pathname;
const AUTRE = new URL("./pieces/attestation-domicile-specimen.pdf", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";

async function envoyer(titre, fichier, C, texte) {
  await page.goto(`${CONSOLE}/fr/mon-espace/echeances`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator(".adherent__echeances a", { hasText: titre }).first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('input[name="fichier"]'));
  await page.locator('input[name="fichier"]').setInputFiles(fichier);
  if (texte) await legende(page, C, texte);
  await souffle(2600);
  await page.locator(".adherent__depot-envoyer").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2200);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "TVA et CNPS : <em>il paie, le cabinet vérifie</em>",
    sous: "Flux 2 sur 3. L'adhérent règle lui-même l'administration et envoie sa quittance ; le cabinet la lit, la valide ou la refuse, et le statut change.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · l'adhérent envoie sa quittance", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Jean-Pierre NKOA ouvre ses échéances.");
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, C,
    "Juillet : CNPS, TVA, acompte, retenues, tout est « en retard ». Il a réglé la CNPS à la banque.");
  await souffle(2600);
  await envoyer("Cotisations sociales CNPS", QUITTANCE, C,
    "Sur la carte de la CNPS : « J'ai déjà payé », il joint la photo de sa quittance et l'envoie.");
  await centrer(page.locator(".adherent__bandeau"));
  await legende(page, C,
    "« Preuve envoyée : le cabinet la vérifie. » Ce n'est pas encore « payée » : une quittance illisible ou d'un autre mois ne règle rien.");
  await souffle(4600);
  await centrer(page.locator(".document-piece").first());
  await page.locator(".document-piece button", { hasText: "Aperçu" }).first().click();
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".document-piece__apercu"));
  await legende(page, C,
    "Il peut relire ce qu'il a envoyé, sans quitter la page : c'est l'aperçu des documents chargés.");
  await souffle(4200);

  await envoyer("TVA du mois", AUTRE, C, null);
  await legende(page, C,
    "Pour la TVA de juillet, il envoie aussi un document. Mais ce n'est pas le bon.");
  await souffle(3600);
});

await chapitre("2 · la réviseure juge", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "Lire, puis dire : payée, ou refusée",
    sous: "La quittance restait « à vérifier » jusqu'au dépôt de la déclaration. La réviseure la lit en aperçu et rend un verdict, écrit au journal d'audit.",
  }, 8000);

  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre l'échéancier de Bâtiment Plus.");
  await aller(page, `${CONSOLE}/fr/obligations?dossier=${BATIMENT}`, C,
    "Le panneau « Preuves de paiement envoyées par l'adhérent » : les deux envois, chacun avec son aperçu.");
  const panneau = page.getByRole("heading", { name: /Preuves de paiement envoyées/ });
  await centrer(panneau);
  await souffle(3000);

  const cnps = page.locator("li", { hasText: "CNPS" }).filter({ has: page.locator(".juger-quittance") }).first();
  await centrer(cnps);
  await cnps.locator(".document-piece button", { hasText: "Aperçu" }).click();
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(cnps.locator(".document-piece__apercu"));
  await legende(page, C,
    "La quittance CNPS : juillet 2026, Bâtiment Plus, 184 500 francs. C'est la bonne.");
  await souffle(4400);
  await centrer(cnps.locator(".juger-quittance"));
  await cnps.locator('button[value="VALIDEE"]').click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await legende(page, C, "Validée : l'adhérent lit « Payée ».");
  await souffle(3000);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  // ⚠️ Le panneau du cabinet dit « taxe sur la valeur ajoutée », jamais « TVA » (prise 1).
  const tva = page.locator("li", { hasText: /valeur ajoutée/ }).filter({ has: page.locator(".juger-quittance") }).first();
  await centrer(tva);
  await tva.locator(".document-piece button", { hasText: "Aperçu" }).click();
  await souffle(2400);
  await legende(page, C,
    "Pour la TVA, le document envoyé est une attestation de domiciliation : rien à voir avec un paiement.");
  await souffle(3800);
  await tva.getByRole("button", { name: "Refuser…" }).click();
  await tva.locator('input[name="motif"]').fill("Ce document est une attestation de domiciliation, pas la quittance de TVA de juillet.");
  await legende(page, C,
    "Refuser exige un motif : c'est la phrase que l'adhérent lira.");
  await souffle(3400);
  await tva.locator('button[value="REFUSEE"]').click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2400);
});

await chapitre("3 · le statut a changé chez l'adhérent", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, null);
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, C,
    "Monsieur NKOA rouvre ses échéances.");
  await centrer(page.locator(".adherent__echeances"));
  await projecteur(page, '.adherent__echeances li[data-etat="PAYEE"]', { tenir: 2800, centrer: false });
  await legende(page, C,
    "La CNPS de juillet : « Payée : quittance vérifiée par le cabinet ».");
  await souffle(4200);
  await projecteur(page, '.adherent__echeances li:has(.adherent__refus)', { tenir: 2800, centrer: false });
  await legende(page, C,
    "La TVA de juillet est de nouveau « en retard », avec le motif du refus : il sait quelle quittance renvoyer.");
  await souffle(4800);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Une quittance reçue est une quittance jugée",
    sous: "« Payée » ne s'affiche que sur le verdict d'un réviseur ou d'un comptable ; un refus porte son motif. Flux suivant : le cabinet paie pour l'adhérent qui l'a mandaté.",
  }, 10000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "Flux 2 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
