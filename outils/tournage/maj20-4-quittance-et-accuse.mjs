/**
 * MISES À JOUR DU 20 OCTOBRE 2026 · FILM 4 — LA QUITTANCE, COMPARÉE À L'ACCUSÉ DE DÉPÔT.
 *
 * Ce qui arrive : l'adhérent envoie sa quittance CNPS de juillet ; elle porte moins que ce
 * que le cabinet a déclaré. Ce que la plateforme en fait : elle met sous les yeux de la
 * réviseure ce que porte l'accusé de dépôt, calcule l'écart, et ne laisse valider qu'avec
 * un motif. Le résultat : « Payée » chez l'adhérent, et l'écart écrit au journal.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node maj20-4-quittance-et-accuse.mjs
 *
 * ⚠️ Pile NEUVE. Le dépôt de la CNPS de juillet est consigné HORS CHAMP, par l'API, avec un
 * accusé de 196 500 FCFA ; la quittance SPÉCIMEN porte 184 500 FCFA.
 */
import {
  CONSOLE, SECRET, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";
import { codeNeuf } from "./second-facteur.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/maj20-4-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const QUITTANCE = new URL("./pieces/quittance-cnps-specimen.jpg", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const BATIMENT = "M081234567890P";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";

/** Le cabinet consigne le dépôt de la CNPS de juillet, hors champ : enrôlement, code, dépôt. */
async function consignerHorsChamp() {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel: REVISEUR, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const json = { "Content-Type": "application/json", cookie };
  await fetch(`${API}/transverse/second-facteur`, { method: "POST", headers: { cookie } });
  const retenus = await (await fetch(`${API}/transverse/courriels?code=compte.second_facteur_confirmation`)).json();
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(retenus.filter((m) => m.destinataire === REVISEUR).at(-1).contexte.lien)[1];
  const { secret } = await (await fetch(`${API}/transverse/second-facteur/confirmation`, {
    method: "POST", headers: json, body: JSON.stringify({ jeton }),
  })).json();
  const active = await fetch(`${API}/transverse/second-facteur/activation`, {
    method: "POST", headers: json, body: JSON.stringify({ code: await codeNeuf(secret) }),
  });
  if (!active.ok) throw new Error(`activation refusée : ${await active.text()}`);
  const depot = await fetch(`${API}/obligations/dossiers/${BATIMENT}/depots`, {
    method: "POST", headers: json,
    body: JSON.stringify({
      code_obligation: "CNPS", periode_debut: "2026-07-01", periode_fin: "2026-07-31",
      numero: "CNPS-2026-07-000417", depose_le: "2026-08-12T09:00:00", montant_constate: "196500",
    }),
  });
  if (!depot.ok) throw new Error(`dépôt refusé : ${await depot.text()}`);
}

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 20 octobre 2026",
    titre: "La quittance, <em>comparée à l'accusé de dépôt</em>",
    sous: "Ce qui arrive : une quittance CNPS qui porte moins que la déclaration. Ce que la plateforme en fait : montrer l'écart, et exiger un motif pour valider. Le résultat : « Payée », et l'écart écrit au journal.",
    pied: `Démonstration jouée en direct sur la solution · 20 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · l'adhérent envoie sa quittance", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Jean-Pierre NKOA, gérant de Bâtiment Plus, a réglé sa CNPS de juillet à la banque.");
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, C, null);
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator(".adherent__echeances a", { hasText: "Cotisations sociales CNPS" }).first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('input[name="fichier"]'));
  await page.locator('input[name="fichier"]').setInputFiles(QUITTANCE);
  await legende(page, C, "« J'ai déjà payé » : il joint la photo de sa quittance, 184 500 francs, et l'envoie.");
  await souffle(3000);
  await page.locator(".adherent__depot-envoyer").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".adherent__bandeau"));
  await legende(page, C, "« Preuve envoyée : le cabinet la vérifie. »");
  await souffle(3200);
});

await chapitre("2 · entre-temps, le dépôt", async () => {
  await consignerHorsChamp();
  await carton(page, {
    type: "chapitre", num: "Entre-temps",
    titre: "Le cabinet a déposé la déclaration CNPS",
    sous: "L'accusé de dépôt de juillet porte 196 500 FCFA. L'échéance garde la référence de son accusé : la comparaison devient sûre.",
  }, 9000);
});

await chapitre("3 · la réviseure compare et justifie", async () => {
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre l'échéancier de Bâtiment Plus.");
  await aller(page, `${CONSOLE}/fr/obligations?dossier=${BATIMENT}`, C, null);
  const cnps = page.locator("li", { hasText: "CNPS" }).filter({ has: page.locator(".juger-quittance") }).first();
  await centrer(cnps);
  await cnps.locator(".document-piece button", { hasText: "Aperçu" }).click().catch(() => undefined);
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(cnps.locator(".juger-quittance"));
  await legende(page, C, "Nouveau : sous la quittance, ce que porte l'accusé de dépôt. Elle n'a plus à le chercher ailleurs.");
  await projecteur(page, ".juger-quittance__attendu", { tenir: 3000, centrer: false });
  await souffle(3400);
  await saisir(page, '.juger-quittance input[name="montant_quittance"]', "184500", { cadence: 120 });
  await souffle(800);
  await legende(page, C, "Elle relève le montant de la quittance : l'écart, 12 000 francs de moins, s'affiche aussitôt.");
  await projecteur(page, ".juger-quittance__attendu", { tenir: 3000, centrer: false });
  await souffle(3600);
  const motif = cnps.locator('.juger-quittance input[name="motif"]');
  await centrer(motif);
  await legende(page, C, "Un écart n'empêche pas de valider, mais il ne passe pas sans un mot : paiement partiel, pénalités, régularisation.");
  await souffle(3000);
  await saisir(page, '.juger-quittance input[name="motif"]', "Paiement partiel : le solde de 12 000 F suit avec la CNPS d'août.", { cadence: 24 });
  await souffle(900);
  await cnps.locator('button[value="VALIDEE"]').click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await legende(page, C, "Validée. L'écart et son motif sont écrits au journal d'audit, avec son nom et l'heure.");
  await souffle(3800);
});

await chapitre("4 · le résultat chez l'adhérent", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, null);
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, C, "Monsieur NKOA rouvre ses échéances : la CNPS de juillet est « Payée ».");
  await projecteur(page, `.adherent__echeances li:has-text("Cotisations sociales CNPS")`, { tenir: 3200 });
  await souffle(4200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Un écart ne passe plus inaperçu",
    sous: "La quittance se lit à côté de l'accusé de dépôt ; l'écart se calcule ; valider malgré lui demande un motif, gardé au journal.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Le rapprochement des quittances : <em>en place</em>",
    sous: "Joué en direct sur la solution le 20 octobre 2026. Données fictives ; la quittance est un spécimen.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
