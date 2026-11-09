/**
 * CREATION D'ENTREPRISE · FLUX 2 — LE PRIX SE JUSTIFIE LIGNE PAR LIGNE.
 *
 * Le responsable voit la proforma avant de l'emettre et la retouche ; le montant
 * est le total de ses lignes. Le client recoit un courriel au style du document,
 * avec le logo, le detail et le PDF joint.
 *
 *     PRISE=1 node flux-2-proforma-justifiee.mjs
 *
 * ⚠️ Se tourne sur une pile de demonstration NEUVE.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

import {
  VITRINE, CONSOLE, COURRIER, souffle, carton, legende, aller, descendre, remonter,
  projecteur, saisir, seConnecter, chapitre, lecture, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const ICI = new URL("./sortie/", import.meta.url).pathname;
const SORTIE = `${ICI}flux-2-prise-${process.env.PRISE ?? "x"}.mp4`;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const CLIENT = { nom: "FOKOU Armand", telephone: "+237677112244", courriel: "armand.fokou@exemple.cm" };
const PROJET = [
  ["denomination_souhaitee", "FOKOU BTP SARL"], ["associes", "2"], ["capital_social", "1000000"],
  ["apports_en_nature", "non", true], ["chiffre_affaires_prevu", "DE_10M_A_50M", true],
  ["salaries_prevus", "5"], ["region_siege", "LITTORAL", true], ["siege", "Bonabéri, Douala"],
  ["activite", "Bâtiment et travaux publics"], ["statuts_apportes", "non", true],
  ["pieces_deja_reunies", "CNI des associés"],
];

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Un prix se justifie <em>ligne par ligne</em>",
    sous: "Flux 2 sur 5. Le juriste voit la proforma avant de l'émettre et la retouche ; le client la reçoit au style du cabinet, détail et document joints.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("rappel · la demande déjà remplie", async () => {
  const C = "Rappel du flux 1";
  await aller(page, `${VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande`, C,
    "Monsieur FOKOU dépose sa demande de création. Il dit son projet sur le site : c'est l'objet du flux précédent, joué ici rapidement.");
  await page.locator("#demande").scrollIntoViewIfNeeded().catch(() => undefined);
  await souffle(900);
  await saisir(page, "#demande-nom", CLIENT.nom, { cadence: 22 });
  await saisir(page, "#demande-tel", CLIENT.telephone, { cadence: 18 });
  await saisir(page, "#demande-courriel", CLIENT.courriel, { cadence: 12 });
  for (const [code, valeur, liste] of PROJET) {
    const champ = `#declaration-${code}`;
    await page.locator(champ).scrollIntoViewIfNeeded().catch(() => undefined);
    if (liste) await page.selectOption(champ, valeur);
    else await page.fill(champ, valeur);
    await souffle(260);
  }
  await centrer(page.locator("#demande-accord-whatsapp"));
  await legende(page, C,
    "Une case nouvelle, facultative : il accepte que le cabinet lui écrive sur WhatsApp. Sans cet accord écrit, le cabinet ne le fait pas.");
  await projecteur(page, "label:has(#demande-accord-whatsapp)", { tenir: 2200, centrer: false });
  await page.locator("#demande-accord-whatsapp").check();
  await souffle(1200);
  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await souffle(600);
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await souffle(6500);
});

await chapitre("1 · le dossier arrive qualifié", async () => {
  const C = "Le juriste, dans sa console";
  await seConnecter(page, "p.moukouri@cga-brcg.cm", C,
    "Patricia MOUKOURI, chargée de clientèle et de formalités : c'est elle qui qualifie, échange et fixe le prix d'une création.");
  await aller(page, `${CONSOLE}/fr/acquisition`, C,
    "La demande de monsieur FOKOU est là, affectée, et sa qualification déjà remplie par ses propres réponses.");
  await projecteur(page, `a:has-text("${CLIENT.nom}")`, { tenir: 2200 });
  await lecture();
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${CLIENT.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);

  await saisir(page, 'input[name="commentaire"]', "Client joint : projet confirmé.", { cadence: 24 });
  await page.click('form:has(input[name="commentaire"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await centrer(page.locator('form:has([name^="q_"]) button[type="submit"]'));
  await page.click('form:has([name^="q_"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C,
    "Elle confirme l'échange et enregistre : la qualification est complète sans qu'elle ait retapé une seule réponse.");
  await souffle(2600);

  await page.evaluate(() => [...document.querySelectorAll("h2, h3")]
    .find((n) => /^Chiffrage/.test(n.textContent ?? ""))
    ?.scrollIntoView({ behavior: "smooth", block: "center" })).catch(() => undefined);
  await souffle(1300);
  await page.click('form:has([name="score_charge"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  await legende(page, C,
    "Le barème rend son intervalle. C'est une borne, pas un prix : le prix, lui, va se lire dans la proforma.");
  await souffle(3000);
});

await chapitre("2 · l'aperçu, et le prix qui en découle", async () => {
  const C = "La proforma, avant l'émission";
  const E = "form.emission";
  await centrer(page.locator(`${E} select[name="composition"]`));
  await legende(page, C,
    "Le document est proposé d'office : une SARL à la qualification, donc la proforma de formalisation d'une SARL. Elle peut en choisir un autre.");
  await projecteur(page, `${E} select[name="composition"]`, { tenir: 2600, centrer: false });
  await souffle(3000);

  await centrer(page.locator(`${E} .feuille__titre`));
  await legende(page, C,
    "Voici l'aperçu, à l'image du document que le client recevra : même en-tête, mêmes rubriques, mêmes lignes que les proformas papier du cabinet.");
  await souffle(3600);
  await page.locator(`${E} .feuille`).evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "start" }));
  await souffle(1500);
  await legende(page, C,
    "Chaque ligne vient du référentiel : timbres, caisse du CFCE, journal officiel, impôts, CNPS, suivi sur douze mois, DSF. Rien n'est tapé de mémoire.");
  await souffle(3200);
  await centrer(page.locator(`${E} .feuille__total`));
  await legende(page, C,
    "Le total, 505 000 francs, n'est pas saisi : c'est la somme des lignes. Le montant arrêté se lit ici, il ne se tape plus à côté.");
  await projecteur(page, `${E} .feuille__total`, { tenir: 2600, centrer: false });
  await souffle(3200);

  /* ── L'action : le juriste retouche une ligne ──────────────────────── */
  const ligne = page.locator(`${E} .feuille__rubrique`).first().locator(".feuille__ligne").first();
  await centrer(ligne);
  await legende(page, C,
    "Mais les statuts de monsieur FOKOU feront neuf pages, et non sept. La juriste corrige la ligne des timbres, directement dans l'aperçu.");
  await souffle(2200);
  await ligne.locator("input").first().fill("");
  await ligne.locator("input").first().pressSequentially(
    "Timbres Statuts (9 pages X 1500 FCFA X 6 exemplaires)", { delay: 22 });
  await ligne.locator(".feuille__montant").fill("");
  await ligne.locator(".feuille__montant").pressSequentially("81000", { delay: 130 });
  await souffle(1400);
  await legende(page, C,
    "Le sous-total de la rubrique passe à 195 000, et le total suit aussitôt. Elle n'a refait aucun calcul.");
  await souffle(2600);
  await centrer(page.locator(`${E} .feuille__total`));
  await projecteur(page, `${E} .feuille__total`, { tenir: 2400, centrer: false });
  await centrer(page.locator(`${E} .emission__prix`));
  await legende(page, C,
    "523 000 francs, « détail retouché ». L'écran rappelle ce que totalise le document du référentiel : l'écart se voit, il ne se cache pas.");
  await projecteur(page, `${E} .emission__prix`, { tenir: 2600, centrer: false });
  await souffle(3000);

  await saisir(page, `${E} input[name="motif"]`,
    "Statuts de neuf pages : deux pages de timbres en plus.", { cadence: 22 });
  await legende(page, C,
    "Le serveur tient la même règle : un montant que ses lignes ne totalisent pas est refusé. C'est le détail qui justifie le prix.");
  await souffle(2600);
  await centrer(page.locator(`${E} button[type="submit"]`));
  await projecteur(page, `${E} button[type="submit"]`, { tenir: 1600, centrer: false });
  await page.click(`${E} button[type="submit"]`, { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(3000);
  await legende(page, C,
    "La proforma est émise et numérotée. Le courriel est parti au même instant, écrit par le serveur avec le lien d'acceptation.");
  await souffle(3200);
  const whatsapp = page.locator('a:has-text("Envoyer sur WhatsApp")').first();
  if (await whatsapp.count()) {
    await centrer(whatsapp);
    await legende(page, C,
      "Et parce que le client l'a accepté sur le site, un bouton ouvre WhatsApp sur son numéro, message et lien déjà rédigés.");
    await projecteur(page, 'a:has-text("Envoyer sur WhatsApp")', { tenir: 2800, centrer: false });
    await souffle(3200);
  }
});

let numero = "";
await chapitre("3 · ce que le client reçoit", async () => {
  const C = "Chez le client";
  await aller(page, COURRIER, C,
    "Le relais de messagerie. Les courriels partent réellement, par SMTP ; ici ils s'arrêtent avant d'atteindre une vraie boîte.");
  await lecture();
  await page.click("text=/Votre proposition PRO-/", { timeout: 8000 });
  await souffle(2400);
  await legende(page, C,
    "Le courriel porte le logo du cabinet et reprend le style de ses proformas : une ligne par rubrique, et le total en cartouche.");
  await souffle(4200);
  await legende(page, C,
    "Les montants sont ceux de l'aperçu, retouche comprise : 195 000 pour la procédure au CFCE, 523 000 au total. Une seule source, deux lectures.");
  await souffle(4200);
  await legende(page, C,
    "Le document complet est joint au message, en PDF. Voyons-le tel que le client l'ouvre.");
  await projecteur(page, "text=/Attachment/", { tenir: 2400, centrer: false }).catch(() => undefined);
  await souffle(3000);

  // Le PDF reellement joint, lu dans le message et mis en images pour l'ecran.
  const liste = await (await fetch(`${COURRIER}/api/v1/messages`)).json();
  const message = liste.messages.find((m) => /Votre proposition/.test(m.Subject));
  const detail = await (await fetch(`${COURRIER}/api/v1/message/${message.ID}`)).json();
  numero = (/PRO-\d+-\d+/.exec(message.Subject) ?? [""])[0];
  const piece = detail.Attachments[0];
  const octets = Buffer.from(await (await fetch(
    `${COURRIER}/api/v1/message/${message.ID}/part/${piece.PartID}`)).arrayBuffer());
  writeFileSync(`${ICI}piece-jointe.pdf`, octets);
  execFileSync("pdftoppm", ["-r", "110", "-png", `${ICI}piece-jointe.pdf`, `${ICI}piece-jointe`]);
  writeFileSync(`${ICI}piece-jointe.html`, `<!doctype html><meta charset="utf-8"><title>${piece.FileName}</title>
<body style="margin:0;background:#1a1228;font:500 14px 'Segoe UI',system-ui,sans-serif;color:#cfc6e0">
<p style="margin:0;padding:18px 40px 0;letter-spacing:.14em;text-transform:uppercase;font-size:11px">
Pièce jointe au courriel · ${piece.FileName}</p>
<div style="display:flex;gap:32px;justify-content:center;padding:18px 40px 120px">
<img src="piece-jointe-1.png" style="height:760px;box-shadow:0 12px 40px rgba(0,0,0,.5)">
<img src="piece-jointe-2.png" style="height:760px;box-shadow:0 12px 40px rgba(0,0,0,.5)"></div></body>`);

  await aller(page, `file://${ICI}piece-jointe.html`, C,
    "La proforma, sur ses deux pages. À gauche, le détail et le total en toutes lettres, avec la ligne des timbres telle que la juriste l'a corrigée.");
  await souffle(5200);
  await legende(page, C,
    "À droite, ce que le papier du cabinet disait déjà : les pièces à fournir, celles que le client recevra, le délai et les moyens de règlement.");
  await souffle(5200);
});

await chapitre("ce que ce flux change", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Le prix n'est plus un chiffre, c'est un détail",
    sous: "Un aperçu retouchable, un total qui suit ses lignes, un courriel et un document au style du cabinet. Flux suivant : le paiement, par Tara ou au guichet.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Flux 2 : <em>livré</em>",
    sous: `Proforma ${numero}, jouée en direct sur la solution, le 14 octobre 2026.`,
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
