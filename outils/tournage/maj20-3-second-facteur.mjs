/**
 * MISES À JOUR DU 20 OCTOBRE 2026 · FILM 3 — LE SECOND FACTEUR, ACTIVÉ PAR SON PREMIER CODE.
 *
 * Ce qui arrive : l'administrateur veut inviter un collaborateur, un geste sensible. Ce
 * que la plateforme en fait : elle exige le second facteur ; la clé reçue par lien ne
 * protège le compte qu'après le premier code ; un code déjà servi est refusé. Le résultat :
 * les gestes sur les comptes s'ouvrent, quinze minutes.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node maj20-3-second-facteur.mjs
 *
 * ⚠️ Pile NEUVE : l'administrateur n'a pas encore de second facteur.
 * ⚠️ LA CLÉ EST FLOUTÉE À L'IMAGE : elle ne doit figurer sur aucune vidéo livrée.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";
import { codeNeuf } from "./second-facteur.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/maj20-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const ADMINISTRATEUR = "s.onana@cga-brcg.cm";

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
let secret = "";
let codeServi = "";
console.log("Tournage en cours…\n");

/** La clé à l'écran : lue pour le film, floutée pour l'image. */
async function lireEtFlouterLaCle() {
  return page.evaluate(() => {
    const cle = [...document.querySelectorAll("p")].find((p) => /^[A-Z2-7]{4}( [A-Z2-7]{1,4})+$/.test(p.textContent.trim()));
    if (!cle) return "";
    cle.style.filter = "blur(7px)";
    cle.style.userSelect = "none";
    document.querySelectorAll('a[href^="otpauth:"]').forEach((a) => { a.style.filter = "blur(4px)"; });
    return cle.textContent.replace(/\s+/g, "");
  });
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 20 octobre 2026",
    titre: "Le second facteur, <em>activé par son premier code</em>",
    sous: "Ce qui arrive : un geste sensible sur les comptes. Ce que la plateforme en fait : exiger une application d'authentification, et refuser un code déjà servi. Le résultat : un compte qu'un mot de passe volé n'ouvre pas.",
    pied: `Démonstration jouée en direct sur la solution · 20 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · le geste sensible attend le second facteur", async () => {
  const C = "À l'administration";
  await seConnecter(page, ADMINISTRATEUR, C, "Serge ONANA, administrateur, doit inviter une nouvelle collaboratrice.");
  await aller(page, `${CONSOLE}/fr/comptes`, C, "La page des comptes. Inviter, suspendre, rétablir : ces gestes exigent le second facteur.");
  await projecteur(page, "form:has(button:has-text('Associer une application'))", { tenir: 3000 });
  await souffle(2600);
  await legende(page, C, "Son compte n'en a pas encore. Il demande l'association : un lien de confirmation part à son adresse.");
  await souffle(2200);
  await page.getByRole("button", { name: /Associer une application/ }).click();
  await page.waitForSelector("p[role=status]", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator("p[role=status]"));
  await souffle(3800);
});

await chapitre("2 · le lien reçu, la clé, le premier code", async () => {
  const C = "Le lien reçu";
  const retenus = await (await fetch(`${API}/transverse/courriels?code=compte.second_facteur_confirmation`)).json();
  const lien = retenus.filter((m) => m.destinataire === ADMINISTRATEUR).at(-1).contexte.lien;
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(lien)[1];
  await aller(page, `${CONSOLE}/fr/second-facteur/confirmation?jeton=${jeton}`, C,
    "Il ouvre le lien reçu par courriel. La clé ne s'affiche qu'au clic, et une seule fois.");
  await souffle(1500);
  await page.getByRole("button", { name: "Afficher ma clé" }).click();
  await page.waitForSelector('input[name="code"]', { timeout: 15000 });
  secret = await lireEtFlouterLaCle();
  if (!secret) throw new Error("clé introuvable à l'écran");
  await souffle(600);
  await legende(page, C, "La clé, floutée pour ce film. Il la saisit dans son application d'authentification, sur son téléphone.");
  await souffle(4200);
  await centrer(page.locator('input[name="code"]'));
  await legende(page, C, "Nouveau : la clé ne protège le compte qu'après le premier code. Une page fermée trop tôt ne bloque plus personne dehors.");
  await souffle(3000);
  codeServi = await codeNeuf(secret);
  await saisir(page, 'input[name="code"]', codeServi, { cadence: 110 });
  await souffle(600);
  await page.getByRole("button", { name: "Activer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  await legende(page, C, "Le premier code est juste : le second facteur est actif.");
  await souffle(3200);
});

await chapitre("3 · un code ne sert qu'une fois", async () => {
  const C = "À l'administration";
  await seConnecter(page, ADMINISTRATEUR, C, "Plus tard, il se reconnecte. Son mot de passe ne suffit plus.");
  await aller(page, `${CONSOLE}/fr/comptes`, C, "Aux comptes, la plateforme demande maintenant un code.");
  await centrer(page.locator('input[name="code"]'));
  // Le code tout juste servi à l'activation : le serveur doit le refuser.
  await saisir(page, 'input[name="code"]', codeServi, { cadence: 110 });
  await legende(page, C, "Il ressaisit le code déjà utilisé, comme le ferait quelqu'un qui l'aurait vu par-dessus son épaule.");
  await souffle(2400);
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForSelector('[role="alert"]', { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('[role="alert"]'));
  await legende(page, C, "Refusé : un code déjà servi ne rouvre rien. Le refus est inscrit au journal.");
  await souffle(4200);
  const neuf = await codeNeuf(secret);
  await page.locator('input[name="code"]').fill("");
  await legende(page, C, "Trente secondes plus tard, l'application affiche un nouveau code.");
  await saisir(page, 'input[name="code"]', neuf, { cadence: 110 });
  await souffle(800);
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
});

await chapitre("4 · le résultat", async () => {
  const C = "À l'administration";
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  await souffle(1200);
  await legende(page, C, "La session est renforcée pour quinze minutes : l'invitation et les gestes sur les comptes s'ouvrent.");
  await projecteur(page, "button:has-text('Inviter un collaborateur')", { tenir: 3200 });
  await souffle(4200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Un mot de passe ne suffit plus",
    sous: "Les gestes sensibles exigent un code ; la clé ne compte qu'après son premier code ; un code vu ou volé ne sert pas une seconde fois.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Le second facteur : <em>en place</em>",
    sous: "Joué en direct sur la solution le 20 octobre 2026. Données fictives ; la clé est floutée.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
