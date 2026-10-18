/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 3 — LA DSF, DE LA PIÈCE QUE L'ADHÉRENT DÉTIENT
 * À LA COPIE DÉPOSÉE QU'IL TÉLÉCHARGE.
 *
 * Ce qui arrive : une attestation que seul l'adhérent détient. Ce que la plateforme en
 * fait : il la verse depuis « Ma DSF », le cabinet la voit dans les pièces du guide de
 * la DGI, prépare la liasse, la fait relire, la valide, la dépose. Le résultat : chez
 * l'adhérent, « Déposée à la DGI », l'accusé, et sa copie à télécharger, visée par le
 * cabinet.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node jour-3-la-dsf-de-l-adherent.mjs
 *
 * ⚠️ Pile NEUVE. CABINET NGUEMA CONSEIL : sa DSF 2025 reste à faire.
 * ⚠️ LE PORTAIL DE LA DGI N'EST PAS JOUÉ ; l'accusé et l'attestation sont des SPÉCIMENS.
 * ⚠️ LE SECOND FACTEUR EST RÉEL : la réviseure l'enrôle hors champ, par le lien du courriel
 * que la pile de démonstration retient (`/transverse/courriels`).
 * ⚠️ L'AGENT DE RELECTURE N'EST PAS JOUÉ (pas de clé d'API) : l'écran le dit, et la DSF se
 * prépare sans lui.
 */
import { createHmac } from "node:crypto";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/jour-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const ACCUSE = new URL("./pieces/accuse-dsf-specimen.jpg", import.meta.url).pathname;
const TITRES = new URL("./pieces/attestation-titres-specimen.pdf", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

const NGUEMA = "P027788990011M";
const ADHERENT = "s.nguema@nguemaconseil.cm";
const COMPTABLE = "c.ndongo@cga-brcg.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";
const CLOTURE = `${CONSOLE}/fr/cloture?dossier=${NGUEMA}&exercice=2025`;

// ── Hors champ : la réviseure enrôle son second facteur ─────────────────────────────────

function base32(texte) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of texte.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const octets = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) octets.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(octets);
}

/** RFC 6238 : SHA-1, six chiffres, tranches de trente secondes, comme le serveur. */
function codeDuMoment(secret) {
  const compteur = Buffer.alloc(8);
  compteur.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000 / 30)));
  const h = createHmac("sha1", base32(secret)).update(compteur).digest();
  const depart = h[h.length - 1] & 0x0f;
  return String((h.readUInt32BE(depart) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

async function enrolerHorsChamp() {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel: REVISEUR, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const demande = await fetch(`${API}/transverse/second-facteur`, { method: "POST", headers: { cookie } });
  if (!demande.ok) throw new Error(`enrôlement refusé : ${await demande.text()}`);
  const retenus = await (await fetch(`${API}/transverse/courriels?code=compte.second_facteur_confirmation`)).json();
  const lien = retenus.filter((m) => m.destinataire === REVISEUR).at(-1).contexte.lien;
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(lien)[1];
  const confirmation = await fetch(`${API}/transverse/second-facteur/confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ jeton }),
  });
  if (!confirmation.ok) throw new Error(`confirmation refusée : ${await confirmation.text()}`);
  return (await confirmation.json()).secret;
}

const secretDeLaReviseure = await enrolerHorsChamp();
console.log("Second facteur de la réviseure enrôlé hors champ.");

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");
const panneauDsf = () => page.locator(".dsf");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "La DSF, de la pièce de l'adhérent <em>à sa copie déposée</em>",
    sous: "Ce qui arrive : une attestation que seul l'adhérent détient. Ce que la plateforme en fait : la verser, préparer, relire, valider, déposer. Le résultat : « Déposée », l'accusé, la copie.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · ce qui arrive : la pièce que lui seul détient", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce qui arrive",
    titre: "« Ma DSF » : ce que le cabinet attend de lui",
    sous: "L'état de sa déclaration, et les pièces que le guide de la DGI demande. Celles qu'il détient se versent ici ; le reste, le cabinet l'établit.",
  }, 8500);
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Sylvain NGUEMA, gérant de Cabinet Nguema Conseil, ouvre son espace.");
  await aller(page, `${CONSOLE}/fr/mon-espace/dsf`, C,
    "Ma déclaration annuelle : l'exercice 2025, en préparation au cabinet, et les pièces à fournir.");
  await centrer(page.locator(".adherent__exercice-dsf").first());
  await souffle(3800);
  const piece = page.locator("li.adherent__piece", { hasText: "dématérialisation des titres" }).first();
  await centrer(piece);
  await piece.locator("details.adherent__ma-piece summary").click();
  await piece.locator('input[name="fichier"]').setInputFiles(TITRES);
  await souffle(1800);
  await centrer(piece.locator(".apercu-envoi"));
  await legende(page, C, "L'attestation du dépositaire, que lui seul reçoit : elle s'affiche avant de partir.");
  await souffle(4200);
  await piece.locator(".adherent__depot-envoyer").click();
  await page.waitForSelector(".adherent__depot-retour", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator("li.adherent__piece", { hasText: "dématérialisation des titres" }).first());
  await legende(page, C, "« Reçue » : elle est au cabinet. Il pourra la remplacer tant que la DSF n'est pas déposée.");
  await souffle(4400);
});

await chapitre("2 · ce que la plateforme en fait : préparer", async () => {
  const C = "Chez la comptable";
  await seConnecter(page, COMPTABLE, C, "Christelle NDONGO, comptable du dossier, ouvre la clôture 2025.");
  await aller(page, CLOTURE, C, "Les pièces à joindre, selon le guide de la DGI.");
  const titres = page.locator(".pieces-dsf__piece", { hasText: "dématérialisation des titres" }).first();
  await centrer(titres);
  await projecteur(page, ".pieces-dsf__piece[data-etat=\"JOINTE\"]", { tenir: 2800, centrer: false });
  await legende(page, C, "L'attestation des titres : versée par l'adhérent lui-même. Personne ne l'a ressaisie ni relancée.");
  await souffle(4600);
  await centrer(page.getByRole("button", { name: "Demander une relecture à l'agent" }));
  await page.getByRole("button", { name: "Demander une relecture à l'agent" }).click();
  await page.waitForSelector(".dsf__message", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "Un second regard par l'agent, sur les codes d'activité et les pièces probables. Il n'est pas branché ici : la DSF se prépare sans lui.");
  await souffle(5200);
  await centrer(page.getByRole("button", { name: "Préparer la DSF" }));
  await page.getByRole("button", { name: "Préparer la DSF" }).click();
  await page.waitForSelector(".dsf__version", { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(panneauDsf());
  await legende(page, C, "Version 1, préparée : la liasse est figée, avec son empreinte. Rien ne part encore.");
  await souffle(4200);
});

await chapitre("3 · le second regard, puis le dépôt", async () => {
  await carton(page, {
    type: "chapitre", num: "Le second regard",
    titre: "Valider, jamais ce qu'on a préparé soi-même",
    sous: "Puis déposer sur le portail de la DGI, et consigner l'accusé : un geste qui exige le second facteur.",
  }, 7500);
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre la même DSF.");
  await aller(page, CLOTURE, C, null);
  await centrer(panneauDsf());
  await page.getByRole("button", { name: "Valider la version 1" }).click();
  await page.waitForSelector('.dsf__version[data-etat="VALIDEE"]', { timeout: 20000 }).catch(() => undefined);
  await legende(page, C, "Validée. Elle dépose sur le portail de la DGI (non montré), puis consigne l'accusé.");
  await souffle(4200);
  await centrer(page.locator('.dsf input[name="code"]'));
  await saisir(page, '.dsf input[name="code"]', codeDuMoment(secretDeLaReviseure), { cadence: 90 });
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForSelector('.dsf__depot input[name="numero"]', { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".dsf__depot"));
  await saisir(page, '.dsf__depot input[name="numero"]', "DGI-2026-DSF-204771", { cadence: 40 });
  await page.locator('.dsf__depot input[name="depose_le"]').fill("2026-10-18T10:05");
  await page.locator('.dsf__depot input[name="fichier"]').setInputFiles(ACCUSE);
  await legende(page, C, "Session renforcée : le numéro de l'accusé, sa date, et l'accusé lui-même.");
  await souffle(3200);
  await page.getByRole("button", { name: "Consigner le dépôt" }).click();
  await page.waitForSelector('.dsf__version[data-etat="DEPOSEE"]', { timeout: 25000 }).catch(() => undefined);
  await centrer(panneauDsf());
  await legende(page, C, "Déposée : l'accusé est confronté à l'empreinte de la version validée.");
  await souffle(4400);
});

await chapitre("4 · le résultat, chez l'adhérent", async () => {
  await carton(page, {
    type: "chapitre", num: "Le résultat",
    titre: "« Déposée à la DGI », et sa copie",
    sous: "L'adhérent n'a rien demandé : il le lit, avec l'accusé, et télécharge la déclaration déposée.",
  }, 7000);
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, null);
  await aller(page, `${CONSOLE}/fr/mon-espace/dsf`, C,
    "Exercice 2025 : « Déposée à la DGI », l'accusé n° DGI-2026-DSF-204771, la date du dépôt.");
  await centrer(page.locator(".adherent__exercice-dsf").first());
  await souffle(4200);
  const lien = page.getByRole("link", { name: /copie déposée/ }).first();
  await centrer(lien);
  const adresse = await lien.getAttribute("href");
  if (adresse) {
    await page.goto(`${CONSOLE}${adresse}`, { waitUntil: "load" });
    await souffle(2400);
    await legende(page, C,
      "Sa copie de la DSF déposée. Les visas portent « le cabinet » : aucun nom de collaborateur sur ce que reçoit le client.");
    await souffle(5600);
  }
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Une déclaration que l'adhérent suit, sans appeler",
    sous: "Il verse ce que lui seul détient, le cabinet prépare et dépose sous double regard et second facteur, et l'adhérent lit le résultat chez lui, avec sa copie.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "La DSF de l'adhérent : <em>livrée</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives ; l'attestation et l'accusé sont des spécimens.",
    pied: PIED,
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
