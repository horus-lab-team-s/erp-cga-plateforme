/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 4A — LES RÔLES DU CABINET, ET LE RÈGLEMENT DES
 * HONORAIRES (RETARD, GRÂCE).
 *
 * Ce qui arrive : une recrue aux ressources humaines, et un adhérent en retard de
 * règlement. Ce que la plateforme en fait : le super administrateur crée un rôle à la
 * mesure du poste, fixe le retard toléré, et accorde une grâce nommée. Le résultat : un rôle
 * attribuable, un dossier « Sous grâce » qui se traite, et chaque geste au journal d'audit
 * avec son motif.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node jour-4a-les-roles-et-le-reglement.mjs
 *
 * ⚠️ Pile NEUVE. LE SECOND FACTEUR EST RÉEL : le super administrateur l'enrôle hors champ.
 */
import { createHmac } from "node:crypto";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/jour-4a-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const SUPER_ADMIN = "h.kamga@cga-brcg.cm";

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

async function enrolerHorsChamp(courriel) {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const demande = await fetch(`${API}/transverse/second-facteur`, { method: "POST", headers: { cookie } });
  if (!demande.ok) throw new Error(`enrôlement refusé : ${await demande.text()}`);
  const retenus = await (await fetch(`${API}/transverse/courriels?code=compte.second_facteur_confirmation`)).json();
  const lien = retenus.filter((m) => m.destinataire === courriel).at(-1).contexte.lien;
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(lien)[1];
  const confirmation = await fetch(`${API}/transverse/second-facteur/confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ jeton }),
  });
  if (!confirmation.ok) throw new Error(`confirmation refusée : ${await confirmation.text()}`);
  return (await confirmation.json()).secret;
}

const secret = await enrolerHorsChamp(SUPER_ADMIN);
console.log("Second facteur du super administrateur enrôlé hors champ.");

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");
const dans = (jours) => new Date(Date.now() + jours * 86400000).toISOString().slice(0, 10);

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "Les rôles du cabinet, <em>et le règlement des honoraires</em>",
    sous: "Ce qui arrive : une recrue aux ressources humaines, un adhérent en retard. Ce que la plateforme en fait : un rôle sur mesure, un retard toléré, une grâce nommée. Le résultat : chaque geste écrit, avec son motif.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · la matrice des rôles", async () => {
  const C = "Au super administrateur";
  await seConnecter(page, SUPER_ADMIN, C, "Hervé KAMGA, super administrateur, ouvre la matrice des rôles.");
  await aller(page, `${CONSOLE}/fr/roles`, C, "Chaque rôle, chaque droit, d'un coup d'œil. L'administrateur la lit ; seul le super administrateur la règle.");
  await centrer(page.locator(".matrice__grille"));
  await souffle(4200);
  await centrer(page.locator('input[name="code"]').first());
  await legende(page, C, "Régler ce que d'autres peuvent faire exige le second facteur.");
  await saisir(page, 'input[name="code"]', codeDuMoment(secret), { cadence: 90 });
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForSelector(".matrice__grille", { timeout: 15000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
});

await chapitre("2 · ce qui arrive : une recrue aux RH", async () => {
  const C = "Au super administrateur";
  await centrer(page.getByRole("button", { name: "+ Créer un rôle du cabinet" }));
  await page.getByRole("button", { name: "+ Créer un rôle du cabinet" }).click();
  const creation = page.locator('section[aria-label="Créer un rôle du cabinet"]');
  await centrer(creation);
  await saisir(page, 'section[aria-label="Créer un rôle du cabinet"] input[name="libelle"]', "Ressources humaines");
  await legende(page, C, "Un rôle à la mesure du poste : les offres de poste et les candidatures, rien d'autre. Aucun dossier client.");
  for (const droit of ["Éditer le site et les offres de poste", "Traiter les candidatures (CV, réponses)"]) {
    const caseADroit = creation.getByLabel(droit);
    await centrer(caseADroit);
    await caseADroit.check();
    await souffle(900);
  }
  await souffle(1800);
  await saisir(page, 'section[aria-label="Créer un rôle du cabinet"] input[name="motif"]', "Note de service du 18/10/2026 : création du poste RH.");
  await creation.getByRole("button", { name: "Créer le rôle" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await centrer(page.locator(".matrice__grille"));
  // La colonne du nouveau rôle est la dernière : la grille défile jusqu'à elle.
  await page.locator(".matrice__grille").evaluate((g) => g.scrollTo({ left: g.scrollWidth, behavior: "smooth" }));
  await souffle(1400);
  await projecteur(page, '.matrice__role:has-text("Ressources humaines")', { tenir: 2600, centrer: false });
  await legende(page, C, "Le rôle paraît dans la matrice, « réglé » par le cabinet. Il s'attribue ensuite depuis Comptes et habilitations.");
  await souffle(4600);
});

await chapitre("3 · ce qui arrive : un adhérent en retard", async () => {
  await carton(page, {
    type: "chapitre", num: "Le règlement",
    titre: "En retard, puis bloqué, sauf grâce",
    sous: "Un dossier dont les honoraires ne sont pas réglés se lit et reçoit ses pièces ; passé le retard toléré, il ne se traite plus.",
  }, 7500);
  const C = "Au super administrateur";
  await aller(page, `${CONSOLE}/fr/portefeuille`, C, "Le portefeuille dit d'emblée qui est hors règle, et depuis quand.");
  const panneau = page.locator(".situations").first();
  await centrer(panneau);
  await souffle(3800);
  const regle = page.locator("details.geste-reglement", { hasText: "règle de dépassement" }).first();
  await centrer(regle);
  await regle.locator("summary").click();
  await regle.locator('input[name="delai_jours"]').fill("15");
  await saisir(page, 'details.geste-reglement[open] input[name="motif"]', "Décision du gérant : quinze jours tolérés après l'échéance.");
  await legende(page, C, "La règle du cabinet : quinze jours de retard tolérés avant d'arrêter le traitement.");
  await souffle(2600);
  await regle.getByRole("button", { name: "Enregistrer la règle" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  const lien = page.locator(".situations li a").first();
  const nom = (await lien.textContent())?.trim();
  console.log(`  dossier : ${nom}`);
  await lien.click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  const situation = page.locator(".situation-dossier").first();
  await centrer(situation);
  await legende(page, C, `${nom} : en retard depuis plus de quinze jours, le dossier est « Bloqué ». Saisie, déclarations et DSF sont refusées.`);
  await souffle(4600);
});

await chapitre("4 · une grâce, nommée", async () => {
  const C = "Au super administrateur";
  const grace = page.locator("details.geste-reglement", { hasText: "Accorder une grâce" }).first();
  await centrer(grace);
  await grace.locator("summary").click();
  await grace.locator('input[name="jusqu_au"]').fill(dans(30));
  await saisir(page, 'details.geste-reglement[open] input[name="motif"]', "Règlement promis au 15 novembre par le gérant : DSF à ne pas retarder.");
  await legende(page, C, "Une grâce : le dossier se traite jusqu'à une date, pour un motif écrit. Elle se lève à tout moment.");
  await souffle(3000);
  await grace.getByRole("button", { name: "Accorder" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  await centrer(page.locator(".situation-dossier").first());
  await legende(page, C, "« Sous grâce » : saisie, déclarations et DSF reprennent. La grâce et son motif restent au journal d'audit.");
  await souffle(5200);
  await centrer(page.locator(".faveurs__liste").first());
  await souffle(3000);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Des droits à la mesure, des écarts écrits",
    sous: "Chaque rôle se lit et se règle sous second facteur ; chaque écart à la règle commune porte un nom, une date et un motif.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Rôles et règlement : <em>gouvernés</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
