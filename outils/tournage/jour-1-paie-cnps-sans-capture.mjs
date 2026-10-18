/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 1 — DE LA PAIE À LA CNPS PAYÉE, SANS UNE CAPTURE.
 *
 * Ce qui arrive : les bulletins de juillet. Ce que la plateforme en fait : la CNPS
 * proposée par la paie, arrêtée par la comptable, appelée à l'adhérent sans rien
 * retaper, réglée par mobile money, reçue en caisse d'elle-même, reversée par le
 * cabinet. Le résultat : la CNPS payée, la quittance au dossier, et l'adhérent n'a
 * rien photographié.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node jour-1-paie-cnps-sans-capture.mjs
 *
 * ⚠️ Pile NEUVE (`pile-de-demonstration.sh neuve`) : le mandat de Bâtiment Plus couvre la
 * CNPS, et aucun appel n'existe encore.
 * ⚠️ LA CONFIRMATION DE L'OPÉRATEUR EST SIMULÉE, et la vidéo le dit : la démonstration
 * n'a pas d'identifiants marchands. Elle passe par la route même que l'opérateur
 * appellera, refusée en production (`/souscription/paiements/{id}/simulation`).
 */
import { execFileSync } from "node:child_process";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/jour-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const QUITTANCE = new URL("./pieces/quittance-cnps-specimen.jpg", import.meta.url).pathname;
const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

const BATIMENT = "M081234567890P";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const CAISSIERE = "n.essama@cga-brcg.cm";
const OBLIGATIONS = `${CONSOLE}/fr/obligations?dossier=${BATIMENT}`;

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

// La CNPS de juillet, sous mandat : la ligne du panneau des obligations.
const ligneDeJuillet = () =>
  page.locator("li.fonds-sous-mandat", { hasText: /cotisations/i }).filter({ hasText: "01/07/2026" }).first();

async function mesEcheances() {
  await page.goto(`${CONSOLE}/fr/mon-espace/echeances`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
}

/** La confirmation de l'opérateur, simulée : le dernier paiement de cet appel. */
function simulerLaConfirmation(appel) {
  const identifiant = execFileSync("psql", [
    "-h", "127.0.0.1", "-p", "55432", "-U", "cga", "-d", "cga_dev", "-Atc",
    `select identifiant from paiement where reference_reglee = '${appel}' order by donnees->>'initie_le' desc limit 1`,
  ]).toString().trim();
  return fetch(`${API}/souscription/paiements/${identifiant}/simulation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reussi: true }),
  }).then((r) => r.status);
}

/**
 * Hors caméra : attend que le relais ait publié le reversement, et que l'échéance de
 * juillet soit « Payée » chez l'adhérent. Le relais publie à sa cadence ; filmer avant
 * montrerait un état qui va changer.
 */
async function attendreLaCnpsPayee() {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel: ADHERENT, mot_de_passe: "cabinet brcg douala 2026" }),
  });
  const temoin = (session.headers.get("set-cookie") ?? "").split(";")[0];
  for (let i = 0; i < 40; i++) {
    const r = await fetch(`${API}/obligations/dossiers/${BATIMENT}/mes-echeances`, { headers: { cookie: temoin } });
    const { echeances } = await r.json();
    const juillet = echeances.find((e) => e.code_obligation === "CNPS" && e.periode_debut === "2026-07-01");
    if (juillet?.etat === "PAYEE") return true;
    await souffle(2000);
  }
  return false;
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "De la paie à la CNPS payée, <em>sans une capture</em>",
    sous: "Ce qui arrive : les bulletins du mois. Ce que la plateforme en fait : la CNPS proposée, arrêtée, appelée, réglée par mobile money. Le résultat : payée, quittance au dossier.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · ce qui arrive : la paie de juillet", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce qui arrive",
    titre: "Les bulletins de juillet, et la CNPS qu'ils proposent",
    sous: "La paie calcule ; elle ne décide pas. Un rappel de la CNPS, un salarié payé hors plateforme : seul le cabinet le sait. La comptable arrête.",
  }, 8500);
  const C = "Chez la comptable";
  await seConnecter(page, COMPTABLE, C,
    "Léonard FOTSO, comptable, ouvre la paie de Bâtiment Plus pour juillet 2026.");
  await aller(page, `${CONSOLE}/fr/social?dossier=${BATIMENT}&annee=2026&mois=7`, C,
    "Sous les bulletins, un panneau nouveau : « Arrêter les charges du mois ».");
  await centrer(page.locator("form.arrete-charges"));
  await projecteur(page, "form.arrete-charges", { tenir: 3000, centrer: false });
  await legende(page, C,
    "CNPS, IRPP, CFC, FNE, TDL, RAV : la proposition de la paie, rubrique par rubrique. Elle peut corriger ; un écart exige alors son motif.");
  await souffle(5200);
  await legende(page, C,
    "Rien à corriger ce mois-ci. Elle arrête : ce montant, et lui seul, servira désormais.");
  await page.locator("form.arrete-charges button[type=submit]").click();
  await page.waitForSelector(".arrete-charges__retour", { timeout: 15000 }).catch(() => undefined);
  await souffle(3600);
});

await chapitre("2 · l'appel se remplit tout seul", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que la plateforme en fait",
    titre: "L'appel de fonds, déjà rempli",
    sous: "Bâtiment Plus a confié au cabinet le paiement de sa CNPS. Le montant à lui appeler vient de l'arrêté : plus rien à retaper.",
  }, 8000);
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre l'échéancier du dossier.");
  await aller(page, OBLIGATIONS, C,
    "« Payées par le cabinet, sous mandat de paiement » : la CNPS de juillet attend son montant.");
  const ligne = ligneDeJuillet();
  await centrer(ligne);
  await projecteur(page, 'li.fonds-sous-mandat input[name="montant"]', { tenir: 2600, centrer: false });
  await legende(page, C,
    "Le champ est déjà rempli : c'est le montant arrêté par la comptable. Elle n'a qu'à confirmer.");
  await souffle(4600);
  await ligne.locator("button[type=submit]").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1500);
  await centrer(ligneDeJuillet());
  await legende(page, C, "Appelé : en attente des fonds de l'adhérent.");
  await souffle(3200);
});

await chapitre("3 · l'adhérent règle par mobile money", async () => {
  await carton(page, {
    type: "chapitre", num: "Chez l'adhérent",
    titre: "Il règle depuis son téléphone, et c'est tout",
    sous: "Pas de guichet, pas de capture à envoyer : le cabinet paie l'administration et garde la quittance.",
  }, 8000);
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Jean-Pierre NKOA, gérant de Bâtiment Plus, ouvre ses échéances.");
  await mesEcheances();
  await projecteur(page, ".adherent__echeances li:has(.adherent__confie)", { tenir: 2800 });
  await legende(page, C, "Sur la CNPS : « Le cabinet paie pour vous », et le montant à lui remettre.");
  await souffle(4200);
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator(".adherent__echeances li:has(.adherent__confie) a").first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("heading", { name: "Le cabinet paie pour vous" }));
  await souffle(2200);
  await page.locator(".honoraires__payer").first().click();
  await souffle(700);
  await saisir(page, 'input[name="telephone"]', "677123456", { cadence: 60 });
  await legende(page, C,
    "Son numéro mobile money. L'opérateur lui envoie la demande ; il valide avec son code.");
  await souffle(3400);
  await page.locator('form.honoraires__formulaire button[type="submit"]').click();
  await page.waitForSelector(".honoraires__attente", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".honoraires__attente"));
  await legende(page, C, "Demande envoyée. C'est la confirmation de l'opérateur qui fera foi, pas ce clic.");
  await souffle(4200);
  const statut = await simulerLaConfirmation(`AF-${BATIMENT}-CNPS-20260701`);
  console.log(`    confirmation simulée : ${statut}`);
  await legende(page, C,
    "La démonstration n'a pas d'opérateur : sa confirmation est simulée, par la route même qu'il appellera.");
  await souffle(4800);
});

await chapitre("4 · la caisse : reçu, sans rien saisir", async () => {
  const C = "À la caisse";
  await seConnecter(page, CAISSIERE, C, "Nadège ESSAMA ouvre la caisse.");
  await centrer(page.getByRole("heading", { name: "Fonds remis pour l'administration" }));
  await legende(page, C,
    "« Fonds remis pour l'administration » : la CNPS de Bâtiment Plus est déjà reçue, par mobile money. Personne ne l'a saisie.");
  await souffle(5400);
});

await chapitre("5 · le cabinet paie et porte la quittance", async () => {
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, null);
  await aller(page, OBLIGATIONS, C,
    "Sur la ligne : reçus par mobile money, l'administration est à payer.");
  const ligne = ligneDeJuillet();
  await centrer(ligne);
  await souffle(2800);
  await ligne.locator('input[type="file"]').setInputFiles(QUITTANCE);
  await legende(page, C,
    "Elle paie la CNPS avec ces fonds, et joint la quittance de l'administration (un spécimen ici).");
  await souffle(3600);
  await ligne.locator("button[type=submit]").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2600);
});

await chapitre("6 · le résultat", async () => {
  await carton(page, {
    type: "chapitre", num: "Le résultat",
    titre: "Payée, quittance au dossier",
    sous: "Et l'adhérent n'a rien photographié.",
  }, 6500);
  const C = "Chez l'adhérent";
  console.log(`    CNPS de juillet payée chez l'adhérent : ${await attendreLaCnpsPayee()}`);
  await seConnecter(page, ADHERENT, C, null);
  await mesEcheances();
  await projecteur(page, '.adherent__echeances li[data-etat="PAYEE"]', { tenir: 2800 });
  await legende(page, C, "Cotisations CNPS de juillet : « Payée ».");
  await souffle(3800);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Un montant décidé une fois, et suivi jusqu'au bout",
    sous: "La paie propose, la comptable arrête, l'appel se remplit, l'adhérent règle depuis son téléphone, la caisse reçoit d'elle-même, le cabinet paie. Le film suivant : la même scène, sur l'application mobile.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "De la paie à la CNPS : <em>livré</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives ; la quittance est un spécimen.",
    pied: PIED,
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
