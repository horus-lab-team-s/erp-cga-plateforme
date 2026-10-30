/**
 * COMPTABILITÉ · FLUX 3 — LES BALANCES AUXILIAIRES, ANNEXES DE LA DSF.
 *
 * La DGI demande, parmi les listings obligatoires de la DSF, la balance auxiliaire clients
 * et la balance auxiliaire fournisseurs, en Excel (guide utilisateur DSF 2025). La
 * comptable les lit à l'écran, tiers par tiers, et les télécharge.
 *
 *     PRISE=1 node compta-3-balances-auxiliaires.mjs
 *
 * ⚠️ HORS CHAMP : une facture ALUCAM saisie et validée par l'API, pour qu'un tiers neuf
 * figure à côté des fournisseurs nés des factures lues. Et une écriture sans tiers, pour
 * montrer ce que l'écran signale.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, seConnecter, chapitre, centrer,
  ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.API ?? "http://localhost:8100";
const SORTIE = new URL(`./sortie/compta-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const BATIMENT = "M081234567890P";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const ECRAN = `${CONSOLE}/fr/comptabilite?dossier=${BATIMENT}&exercice=2026`;

async function horsChamp() {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel: COMPTABLE, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const ecrire = async (piece, libelle, tiers, montant) => {
    const r = await fetch(`${API}/comptabilite/dossiers/${BATIMENT}/ecritures`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        journal: "OD", exercice: "2026", date_operation: "2026-06-15", libelle, piece_justificative: piece,
        lignes: [
          { compte: "602", libelle: "Achat", sens: "DEBIT", montant },
          { compte: "401", libelle, sens: "CREDIT", montant, ...(tiers ? { tiers } : {}) },
        ],
      }),
    });
    if (r.status !== 201) throw new Error(`saisie : ${r.status} ${await r.text()}`);
    const { numero } = await r.json();
    const v = await fetch(`${API}/comptabilite/dossiers/${BATIMENT}/ecritures/2026/OD/${numero}/validation`, { method: "POST", headers: { cookie } });
    if (v.status !== 200) throw new Error(`validation : ${v.status}`);
  };
  await ecrire("FA-ALU-0612", "Facture ALUCAM non réglée", "M012345678901A", "2500000");
  await ecrire("FA-DIV-0618", "Fournitures diverses", null, "180000");
}

await horsChamp();
console.log("Écritures posées hors champ.");
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Comptabilité",
    titre: "Les balances auxiliaires, <em>annexes de la DSF</em>",
    sous: "La DGI demande la balance auxiliaire clients et la balance auxiliaire fournisseurs en Excel. Elles se lisent ici tiers par tiers, et se téléchargent.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · tiers par tiers, à l'écran", async () => {
  const C = "Chez la comptable";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable, prépare les annexes de la DSF de Bâtiment Plus.");
  await aller(page, ECRAN, C, "La comptabilité du dossier : sous les livres obligatoires, les balances auxiliaires.");
  await centrer(page.locator(".livres-obligatoires"));
  await projecteur(page, ".livres-obligatoires__groupe + .livres-obligatoires__groupe", { tenir: 2600 });
  await souffle(1200);
  await Promise.all([
    page.waitForURL(/auxiliaire=fournisseurs/, { timeout: 20000 }),
    page.getByRole("link", { name: "fournisseurs", exact: true }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("heading", { name: "Balance auxiliaire fournisseurs" }));
  await legende(page, C, "Une ligne par fournisseur : son nom et son NIU, repris des factures lues, le reporté, les mouvements, le solde.");
  await souffle(5600);
  await projecteur(page, '[role="note"]', { tenir: 2600 });
  await legende(page, C, "Une écriture saisie sans tiers est signalée : elle se ventile avant le dépôt, sinon l'annexe ne retombe pas sur le compte 401.");
  await souffle(5600);
});

await chapitre("2 · l'Excel de l'annexe", async () => {
  const C = "L'annexe";
  const bouton = page.getByRole("button", { name: "Balance auxiliaire fournisseurs (Excel)" });
  await centrer(bouton);
  await legende(page, C, "Le même contenu en Excel, comme la DGI le demande : des montants en nombres, une ligne de total.");
  await souffle(3200);
  const [fichier] = await Promise.all([page.waitForEvent("download", { timeout: 20000 }).catch(() => null), bouton.click()]);
  await souffle(1800);
  console.log(`  fichier : ${fichier ? fichier.suggestedFilename() : "aucun téléchargement"}`);
  await legende(page, C, "Il porte une feuille « À lire » : ce n'est pas encore le modèle Excel de la DGI, que le cabinet obtient à la télédéclaration.");
  await souffle(5600);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Des annexes tirées des livres, sans ressaisie",
    sous: "À la clôture, chaque client et chaque fournisseur est désormais reporté à son nom : l'exercice suivant sait ce qu'il doit à qui, et ses balances auxiliaires repartent justes.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
