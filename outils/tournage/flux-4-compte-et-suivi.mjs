/**
 * CREATION D'ENTREPRISE · FLUX 4 — SON COMPTE AU PAIEMENT, ET UN SUIVI QUI RENSEIGNE.
 *
 * Le reglement constate ouvre le compte de la cliente ; elle choisit son mot de
 * passe, arrive sur sa creation, voit ou elle en est et envoie ses pieces. Son
 * lien sans mot de passe reste valable et montre la meme chose.
 *
 *     PRISE=1 node flux-4-compte-et-suivi.mjs
 *
 * ⚠️ Se tourne sur une pile de demonstration NEUVE, construite APRES le 14
 * octobre 2026 : le role « client en creation » n'existe pas dans une image plus
 * ancienne.
 */
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  VITRINE, CONSOLE, COURRIER, souffle, carton, legende, aller,
  projecteur, saisir, seConnecter, chapitre, lecture, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/flux-4-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const CLIENTE = { nom: "MBARGA Rose", telephone: "+237677889900", courriel: "rose.mbarga@exemple.cm" };
const MOT_DE_PASSE = "Rose-Couture-Yaounde-2026";
const PROJET = [
  ["denomination_souhaitee", "ROSE COUTURE SARL"], ["associes", "2"], ["capital_social", "1000000"],
  ["apports_en_nature", "non", true], ["chiffre_affaires_prevu", "MOINS_10M", true],
  ["salaries_prevus", "2"], ["region_siege", "CENTRE", true], ["siege", "Mvog-Mbi, Yaoundé"],
  ["activite", "Couture et retouches"], ["statuts_apportes", "non", true],
  ["pieces_deja_reunies", "CNI des associés"],
];

// La piece envoyee : un PDF reel, tres court, que le serveur reconnait a son contenu.
const DOSSIER_PIECES = mkdtempSync(join(tmpdir(), "flux4-"));
const PIECE = join(DOSSIER_PIECES, "cni-rose-mbarga.pdf");
writeFileSync(PIECE, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

async function message(motif) {
  const liste = await (await fetch(`${COURRIER}/api/v1/messages`)).json();
  const trouve = liste.messages.find((m) => motif.test(m.Subject));
  return (await fetch(`${COURRIER}/api/v1/message/${trouve.ID}`)).json();
}

async function jusquA(condition, { essais = 40, pause = 1500 } = {}) {
  for (let i = 0; i < essais; i += 1) {
    if (await condition().catch(() => false)) return true;
    await souffle(pause);
  }
  return false;
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Son compte au paiement, <em>et un suivi qui renseigne</em>",
    sous: "Flux 4 sur 5. Le règlement ouvre le compte de la cliente ; elle choisit son mot de passe et suit sa création, étape par étape.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("rappel · de la demande au règlement", async () => {
  const C = "Rappel des flux 1 à 3";
  await aller(page, `${VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande`, C,
    "Madame MBARGA dépose sa demande sur le site, la juriste émet la proforma, la cliente l'accepte et règle à la caisse. En accéléré.");
  await page.locator("#demande").scrollIntoViewIfNeeded().catch(() => undefined);
  await page.fill("#demande-nom", CLIENTE.nom);
  await page.fill("#demande-tel", CLIENTE.telephone);
  await page.fill("#demande-courriel", CLIENTE.courriel);
  for (const [code, valeur, liste] of PROJET) {
    const champ = `#declaration-${code}`;
    await page.locator(champ).scrollIntoViewIfNeeded().catch(() => undefined);
    if (liste) await page.selectOption(champ, valeur);
    else await page.fill(champ, valeur);
    await souffle(120);
  }
  await page.locator("#demande-accord-whatsapp").check();
  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await souffle(5000);

  await seConnecter(page, "p.moukouri@cga-brcg.cm", C, null);
  await page.goto(`${CONSOLE}/fr/acquisition`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${CLIENTE.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "Madame MBARGA dépose sa demande sur le site, la juriste émet la proforma, la cliente l'accepte et règle à la caisse. En accéléré.");
  await page.fill('input[name="commentaire"]', "Cliente jointe : projet confirmé.");
  await page.click('form:has(input[name="commentaire"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(800);
  await page.click('form:has([name^="q_"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(800);
  await page.click('form:has([name="score_charge"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1000);
  const E = "form.emission";
  await page.fill(`${E} input[name="motif"]`, "Formule proposée d'après la forme juridique.");
  await centrer(page.locator(`${E} button[type="submit"]`));
  await page.click(`${E} button[type="submit"]`, { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1800);
});

let lienProposition = "";
await chapitre("1 · la proposition s'explique comme le document", async () => {
  const C = "Chez la cliente";
  const proposition = await message(/Votre proposition/);
  lienProposition = /href="([^"]*\/proforma\/[^"]*)"/.exec(proposition.HTML)[1].replaceAll("&amp;", "&");
  await aller(page, lienProposition, C,
    "Sa proposition, en ligne. « Ce qui compose le prix » reprend maintenant les rubriques de la proforma reçue, avec leurs sous-totaux.");
  await centrer(page.locator(".proforma__rubrique"));
  await projecteur(page, ".proforma__detail", { tenir: 3000, centrer: false });
  await legende(page, C,
    "Avant, la page montrait le calcul interne du barème, qui ne totalisait pas le montant du document. Une seule explication du prix désormais.");
  await souffle(4200);
  await centrer(page.locator('input[name="identite_declaree"]'));
  await page.fill('input[name="identite_declaree"]', "MBARGA Rose, gérante");
  await page.check('input[name="engagement"]');
  await page.click("button.proforma__valider");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);

  await seConnecter(page, "n.essama@cga-brcg.cm", "À la caisse", null);
  await legende(page, "À la caisse",
    "Elle règle au guichet. La caissière constate le versement : le rappel s'arrête ici, c'est la suite qui est nouvelle.");
  await page.locator('.caisse__constat input[name="reference_externe"]').first().fill("Reçu de caisse n° 2026-0415");
  await page.locator('.caisse__constat input[name="rapproche"]').first().check();
  await souffle(1200);
  await page.locator(".caisse__constat button").first().click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2600);
});

let lienCompte = "";
let lienSuivi = "";
await chapitre("2 · un seul courriel, deux chemins", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "Le règlement lui ouvre un compte",
    sous: "Sans personne. Le courriel d'ouverture de son dossier porte maintenant un bouton pour choisir son mot de passe, et garde le lien de suivi sans compte.",
  }, 8000);

  const C = "Dans sa boîte";
  await jusquA(async () => /est ouvert/.test(JSON.stringify(await (await fetch(`${COURRIER}/api/v1/messages`)).json())));
  const ouverture = await message(/est ouvert/);
  const jeton = /activation\?jeton=([^"&]+)/.exec(ouverture.HTML)[1];
  lienCompte = `${CONSOLE}/fr/activation?jeton=${jeton}&parcours=creation`;
  const suivi = /\/mon-dossier\/([^\s"<?]+)\?s=([0-9a-f]+)/.exec(ouverture.Text ?? ouverture.HTML);
  lienSuivi = `${VITRINE}/fr/mon-dossier/${suivi[1]}?s=${suivi[2]}`;

  await aller(page, COURRIER, C,
    "Son règlement constaté, madame MBARGA reçoit l'ouverture de son dossier.");
  await souffle(2000);
  await page.click("text=/est ouvert/", { timeout: 8000 }).catch(() => undefined);
  await souffle(2400);
  await legende(page, C,
    "Le bouton : « Choisir mon mot de passe ». Juste au-dessus, pour qui n'a pas le temps, le lien personnel qui ouvre son dossier sans compte.");
  await souffle(5200);
});

await chapitre("3 · elle choisit son mot de passe", async () => {
  const C = "Son mot de passe";
  await aller(page, lienCompte, C,
    "La page lui parle de sa création, et non d'une souscription : le texte suit ce qu'elle a acheté.");
  await souffle(2600);
  await saisir(page, 'input[name="motDePasse"]', MOT_DE_PASSE, { cadence: 30 });
  await saisir(page, 'input[name="confirmation"]', MOT_DE_PASSE, { cadence: 22 });
  await legende(page, C,
    "Personne au cabinet ne connaîtra ce mot de passe. Le lien ne sert qu'une fois.");
  await souffle(2600);
  await Promise.all([
    page.waitForURL(/connexion/, { timeout: 20000 }).catch(() => undefined),
    page.click('button[type="submit"]'),
  ]);
  await souffle(1600);
  await seConnecter(page, CLIENTE.courriel, C,
    "Elle se connecte une première fois, avec l'écran de tout le monde.", MOT_DE_PASSE);
});

await chapitre("4 · sa création, étape par étape", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "Où j'en suis, ce que je dois faire",
    sous: "Le cabinet voulait un suivi « plus soft et plus indicatif ». Une frise des six étapes, ce que fait le cabinet, ce qu'on attend d'elle.",
  }, 8000);

  const C = "Ma création";
  await page.goto(`${CONSOLE}/fr/ma-creation`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "Elle arrive directement sur sa création. Pas d'écran du cabinet, pas d'espace adhérent : sa société n'existe pas encore.");
  await souffle(3600);
  await projecteur(page, ".frise", { tenir: 3200 });
  await legende(page, C,
    "La frise : règlement fait, pièces en cours, puis statuts, dépôt, immatriculation et remise. Elle voit ce qui vient.");
  await souffle(4200);
  await projecteur(page, ".creation__encart", { tenir: 3200 });
  await legende(page, C,
    "En ce moment, ce que fait le cabinet. De son côté, ce qu'on attend d'elle. Aucun délai n'est promis : le référentiel n'en fixe pas.");
  await souffle(4600);
  await centrer(page.locator(".creation__progression"));
  await legende(page, C,
    "Ses documents : combien sont reçus sur combien sont nécessaires. Une pièce facultative ne compte pas.");
  await souffle(3800);

  const premier = page.locator(".creation__piece").first();
  await centrer(premier);
  await premier.locator('input[type="file"]').setInputFiles(PIECE);
  await legende(page, C,
    "Elle envoie sa première pièce : une photo ou un PDF, depuis son téléphone comme ici.");
  await souffle(2200);
  await premier.locator("button.creation__envoyer").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2400);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".creation__progression"));
  await legende(page, C,
    "Reçue. Le compte a avancé d'un, et la pièce est passée dans « Déjà reçus ». Le cabinet la voit dans son dossier.");
  await souffle(4400);
});

await chapitre("5 · le même suivi, sans compte", async () => {
  const C = "Par son lien personnel";
  await aller(page, lienSuivi, C,
    "Le lien du courriel ouvre la même page sur le site, sans mot de passe : même frise, mêmes encarts, même pièce reçue.");
  await souffle(3200);
  // ⚠️ Centrer le rappel lui-même : un défilement à paliers dépassait la carte, et la
  // légende parlait d'un texte que l'image ne montrait plus (prise 2).
  await centrer(page.locator(".proforma__carte > p.suivi__mention").last());
  await projecteur(page, ".proforma__carte > p.suivi__mention:last-of-type", { tenir: 3000, centrer: false });
  await legende(page, C,
    "En bas, un rappel : son espace client existe. Le compte s'ajoute au lien, il ne le remplace pas.");
  await souffle(4200);
});

await chapitre("6 · chacun ses vues", async () => {
  const C = "Les vues suivent le profil";
  await seConnecter(page, "n.essama@cga-brcg.cm", C,
    "Correction faite au passage : la barre de la caissière ne montre plus le sélecteur « Tous les dossiers ».");
  await projecteur(page, "nav", { tenir: 3000, centrer: false }).catch(() => undefined);
  await souffle(3600);
});

await chapitre("ce que ce flux change", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Un compte dès le paiement, et le même compte à l'immatriculation",
    sous: "Le jour où sa société est immatriculée et qu'elle prend le suivi, son compte reçoit l'espace adhérent, sans en créer un second. Flux suivant : les pièces reçues par WhatsApp, versées par la juriste.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Flux 4 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
