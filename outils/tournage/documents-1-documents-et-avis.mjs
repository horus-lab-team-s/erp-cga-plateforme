/**
 * DOCUMENTS · FLUX 1 — CE QUE LE CLIENT REÇOIT : PROFORMA, REÇUS, AVIS, BULLETIN.
 *
 * La cliente d'une création retrouve sa proforma et son reçu dans son espace, sans le
 * lien du courriel qui expire ; l'adhérent reçoit un courriel à chaque geste du cabinet
 * (honoraires réglés, quittance vérifiée ou refusée) et son reçu d'honoraires ; le
 * comptable imprime le bulletin de paie.
 *
 *     PRISE=1 node documents-1-documents-et-avis.mjs
 *
 * ⚠️ SE TOURNE APRÈS, SUR LA MÊME PILE NEUVE : `flux-4-compte-et-suivi.mjs` (le compte de
 * madame MBARGA et sa création réglée), `adherent-1-honoraires.mjs` (un règlement
 * d'honoraires) et `adherent-2-quittances.mjs` (une quittance validée, une refusée).
 * Leurs vidéos ne servent pas : ce sont les gestes qui préparent celle-ci.
 */
import {
  CONSOLE, COURRIER, souffle, carton, legende, aller, projecteur, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/documents-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const CLIENTE = "rose.mbarga@exemple.cm";
const MOT_DE_PASSE_CLIENTE = "Rose-Couture-Yaounde-2026";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const BULLETIN = `${CONSOLE}/fr/social?dossier=M081234567890P&annee=2026&mois=9&bulletin=SAL-0004`;

/** Le message le plus récent dont l'objet répond au motif. */
async function message(motif) {
  const liste = await (await fetch(`${COURRIER}/api/v1/messages`)).json();
  const trouve = liste.messages.find((m) => motif.test(m.Subject));
  if (!trouve) throw new Error(`aucun message ne répond à ${motif}`);
  return trouve;
}

/** Ouvre un lien PDF de la page dans l'onglet, comme le clic le ferait dans un onglet neuf. */
async function ouvrirLePdf(lien) {
  const href = await lien.getAttribute("href");
  await page.goto(new URL(href, CONSOLE).href, { waitUntil: "load" });
  await souffle(2600);
}

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Documents et avis",
    titre: "Ce que le client <em>reçoit et retrouve</em>",
    sous: "Sa proforma et son reçu dans son espace, un courriel à chaque geste du cabinet, ses reçus d'honoraires, le bulletin de paie imprimable.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la cliente d'une création retrouve ses documents", async () => {
  const C = "Chez la cliente";
  await seConnecter(page, CLIENTE, C, "Madame MBARGA a réglé la création de ROSE COUTURE SARL. Elle se connecte à son espace.", MOT_DE_PASSE_CLIENTE);
  await page.waitForURL(/ma-creation/, { timeout: 15000 }).catch(() => undefined);
  const bloc = page.getByRole("heading", { name: "Proforma et reçu" });
  await centrer(bloc);
  await legende(page, C, "Nouveau : sa proforma et le reçu de son règlement, sous sa session. Le lien du courriel expire ; ici, rien n'expire.");
  await souffle(5200);
  await ouvrirLePdf(page.getByRole("link", { name: "Reçu (PDF)" }));
  await legende(page, C, "Le reçu porte le montant arrêté de la proforma, en chiffres et en lettres, et le numéro de la proforma qu'il solde.");
  await souffle(5600);
});

await chapitre("2 · l'adhérent est prévenu par courriel", async () => {
  const C = "Dans la boîte de l'adhérent";
  const recu = await message(/Reçu de vos honoraires/);
  await aller(page, COURRIER, C, "Jean-Pierre NKOA, de Bâtiment Plus : à chaque geste du cabinet, un courriel. Il n'a plus à se connecter pour l'apprendre.");
  await souffle(3600);
  await aller(page, `${COURRIER}/view/${recu.ID}`, C, "Ses honoraires réglés à la caisse : le montant, la référence, et le lien vers son reçu.");
  await souffle(5200);
  const refus = await message(/est à renvoyer/);
  await aller(page, `${COURRIER}/view/${refus.ID}`, C, "Une quittance refusée : le motif du réviseur, mot pour mot. L'échéance reste à régler tant qu'elle n'est pas vérifiée.");
  await souffle(5600);
});

await chapitre("3 · son reçu d'honoraires", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Il suit le lien et se connecte.");
  await aller(page, `${CONSOLE}/fr/mon-espace/honoraires`, C, "La période réglée porte son reçu.");
  const lien = page.getByRole("link", { name: "Reçu (PDF)" }).first();
  await centrer(lien);
  await souffle(2400);
  await ouvrirLePdf(lien);
  await legende(page, C, "Le reçu d'honoraires, à l'en-tête du cabinet : ce que l'adhérent classe et produit.");
  await souffle(5200);
});

await chapitre("4 · le bulletin de paie s'imprime", async () => {
  const C = "Chez le comptable";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable, remet son bulletin à un salarié de Bâtiment Plus.");
  await aller(page, BULLETIN, C, null);
  const lien = page.getByRole("link", { name: /Imprimer le bulletin/ });
  await centrer(lien);
  await projecteur(page, "a[href*='/api/bulletins/']", { tenir: 2200, centrer: false });
  await souffle(1400);
  await ouvrirLePdf(lien);
  await legende(page, C, "Le bulletin imprimable porte le calcul de l'écran, ligne pour ligne : aucun montant n'est recalculé pour le PDF.");
  await souffle(5600);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Le client n'a plus à demander ses documents",
    sous: "Chaque document qu'il attend est dans son espace, et chaque geste du cabinet lui est annoncé. Un avis ne part qu'une fois, et seulement aux comptes du dossier.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
