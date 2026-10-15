/**
 * DSF · FLUX 1 — PRÉPARÉE, VALIDÉE PAR UN SECOND REGARD, DÉPOSÉE AVEC SON ACCUSÉ.
 *
 * CABINET NGUEMA CONSEIL (le dossier que la démonstration laisse en retard) : sa DSF 2025
 * est à faire. La comptable la prépare sur l'exercice clos et la relit en PDF ; la
 * réviseure la valide ; après le dépôt sur le portail de la DGI, elle consigne l'accusé,
 * avec le second facteur ; l'échéancier dit « déclarée ».
 *
 *     PRISE=1 node dsf-1-preparee-validee-deposee.mjs
 *
 * ⚠️ LE PORTAIL DE LA DGI N'EST PAS JOUÉ : on ne s'y connecte pas pour une démonstration,
 * et l'accusé est un SPÉCIMEN fictif (`pieces/accuse-dsf-specimen.jpg`), qui le dit.
 * ⚠️ LE SECOND FACTEUR EST RÉEL. Avant le tournage (hors champ), la réviseure enrôle son
 * application d'authentification par le lien reçu dans la boîte de démonstration, comme
 * tout utilisateur ; à l'écran, elle tape le code du moment, calculé sur ce secret.
 */
import { createHmac } from "node:crypto";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.API ?? "http://localhost:8100";
const COURRIER = process.env.COURRIER ?? "http://localhost:8026";
const SORTIE = new URL(`./sortie/dsf-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const ACCUSE = new URL("./pieces/accuse-dsf-specimen.jpg", import.meta.url).pathname;

const NGUEMA = "P027788990011M";
const COMPTABLE = "c.ndongo@cga-brcg.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";
const CLOTURE = `${CONSOLE}/fr/cloture?dossier=${NGUEMA}&exercice=2025`;

// ── Hors champ : la réviseure enrôle son second facteur, par le lien du courriel ──────────

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
  await new Promise((r) => setTimeout(r, 1500));
  const boite = await (await fetch(`${COURRIER}/api/v1/search?query=${encodeURIComponent(`to:${REVISEUR}`)}`)).json();
  const dernier = boite.messages[0];
  const message = await (await fetch(`${COURRIER}/api/v1/message/${dernier.ID}`)).json();
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(message.Text ?? message.HTML)[1];
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
    sur: "CGA Broad Range Consulting Group · Clôture et DSF",
    titre: "La DSF : <em>préparée, validée, déposée</em>",
    sous: "Figée sur l'exercice clos, relue en PDF, validée par un second regard, puis consignée avec l'accusé de la DGI.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la comptable relit la liasse 2025", async () => {
  const C = "Chez la comptable";
  await seConnecter(page, COMPTABLE, C,
    "Christelle NDONGO tient CABINET NGUEMA CONSEIL. Sa DSF 2025 est en retard : le cabinet la régularise.");
  await aller(page, CLOTURE, C,
    "L'exercice 2025, repris du logiciel précédent du client, est clos. La liasse se lit d'abord : les contrôles.");
  await souffle(3600);
  await centrer(page.getByText("Passage du résultat", { exact: false }).first());
  await legende(page, C,
    "Le passage au résultat fiscal : l'abattement CGA s'applique, parce que le droit est ouvert (adhérent toute l'année, sous le seuil).");
  await souffle(5200);
});

await chapitre("2 · préparer, et relire le PDF", async () => {
  const C = "Chez la comptable";
  await centrer(page.getByRole("heading", { name: "Déclaration statistique et fiscale" }));
  await legende(page, C, "Un panneau nouveau : la DSF. « Préparer » fige la liasse, avec son empreinte. Rien ne part encore.");
  await souffle(3800);
  await page.getByRole("button", { name: "Préparer la DSF" }).click();
  await page.waitForSelector(".dsf__version", { timeout: 20000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(panneauDsf());
  await legende(page, C, "Version 1, préparée. Le résultat fiscal, qui l'a préparée, et son empreinte.");
  await souffle(4200);
  // ⚠️ Dans l'application, l'aperçu s'ouvre dans un onglet à lui. La capture ne suit qu'un
  // onglet : on y va donc dans le même, puis on revient.
  const lien = panneauDsf().getByRole("link", { name: /aperçu PDF/ });
  await projecteur(page, '.dsf__apercu a', { tenir: 2200 });
  const adresse = await lien.getAttribute("href");
  await page.goto(`${CONSOLE}${adresse}`, { waitUntil: "load" });
  await souffle(2500);
  await legende(page, C,
    "L'aperçu est rendu de la version figée, pas recalculé : « PROJET », la synthèse, les contrôles, les visas avec les noms.");
  await souffle(6000);
  await page.mouse.move(800, 500);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 500);
    await souffle(700);
  }
  await legende(page, C, "Puis le bilan, le compte de résultat et le passage au résultat fiscal, avec l'abattement CGA.");
  await souffle(5000);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
});

await chapitre("3 · la réviseure valide", async () => {
  await carton(page, {
    type: "chapitre", num: "Le second regard",
    titre: "Valider, jamais ce qu'on a préparé soi-même",
    sous: "La DGI n'admet que douze soumissions par an et par contribuable : une DSF fausse ne se corrige pas sans compter.",
  }, 8000);
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre la même DSF.");
  await aller(page, CLOTURE, C, null);
  await centrer(panneauDsf());
  await legende(page, C, "Elle relit l'aperçu, puis valide la version 1.");
  await souffle(3600);
  await page.getByRole("button", { name: "Valider la version 1" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await page.waitForSelector('.dsf__version[data-etat="VALIDEE"]', { timeout: 20000 }).catch(() => undefined);
  await centrer(panneauDsf());
  await legende(page, C, "Validée, prête au dépôt : son nom et l'heure, sur la version et dans le PDF.");
  await souffle(4200);
});

await chapitre("4 · déposée sur le portail, l'accusé consigné", async () => {
  const C = "Chez la réviseure";
  await legende(page, C,
    "Elle dépose sur le portail de la DGI, hors de la plateforme (non montré). Puis elle consigne l'accusé : un geste qui exige le second facteur.");
  await souffle(5200);
  const code = page.locator('.dsf input[name="code"]');
  await centrer(code);
  await saisir(page, '.dsf input[name="code"]', codeDuMoment(secretDeLaReviseure), { cadence: 90 });
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await page.waitForSelector('.dsf__depot input[name="numero"]', { timeout: 20000 });
  await centrer(page.locator(".dsf__depot"));
  await legende(page, C, "Session renforcée. Le numéro de l'accusé, sa date, et l'accusé lui-même, versé au dossier.");
  await saisir(page, '.dsf__depot input[name="numero"]', "DGI-2026-DSF-204771", { cadence: 40 });
  await page.locator('.dsf__depot input[name="depose_le"]').fill("2026-10-14T11:05");
  await page.locator('.dsf__depot input[name="fichier"]').setInputFiles(ACCUSE);
  await souffle(2600);
  await page.getByRole("button", { name: "Consigner le dépôt" }).click();
  await page.waitForSelector('.dsf__version[data-etat="DEPOSEE"]', { timeout: 25000 }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(panneauDsf());
  await legende(page, C,
    "Déposée. L'accusé a été confronté à l'empreinte de la version validée : un accusé d'une autre version serait refusé.");
  await souffle(5200);
});

await chapitre("5 · l'échéancier le sait", async () => {
  const C = "À l'échéancier";
  await aller(page, `${CONSOLE}/fr/obligations?dossier=${NGUEMA}&exercice=2025`, C,
    "Sur l'échéancier du dossier, la DSF 2025 n'est plus en retard : elle est déclarée, avec son accusé.");
  const lien = page.getByRole("link", { name: "Déclaration statistique et fiscale" }).first();
  await centrer(lien);
  await souffle(1200);
  await legende(page, C,
    "La ligne mène désormais au parcours de la DSF ; le constat libre ne la propose plus.");
  await souffle(5200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce qui reste à décider avec la DGI",
    titre: "Déposer d'ici, un jour, par l'API de la DGI",
    sous: "La DGI publie une API de dépôt des DSF, mais sa documentation ne se lit qu'une fois connecté au compte du contribuable. La note « DSF et interconnexion DGI » dit ce qu'il faut au cabinet pour l'ouvrir.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Clôture et DSF",
    titre: "DSF : <em>livrée</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
