/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 4C — DE LA DEMANDE PONCTUELLE AU CONTRAT EN WORD.
 *
 * Ce qui arrive : une demande payée, « rédiger le bail de notre entrepôt ». Ce que la
 * plateforme en fait : la mission s'ouvre depuis la demande, sans recopier de
 * référence ; le client est prévenu ; le bail part d'un modèle du cabinet ; rien
 * d'inachevé ne passe au second regard. Le résultat : le contrat validé, en PDF et en
 * Word, que les parties retouchent.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node jour-4c-de-la-demande-au-contrat.mjs
 *
 * ⚠️ Pile NEUVE. HORS CHAMP : la demande est déposée sur le site, puis marquée réglée
 * (le chiffrage et le paiement font l'objet des films de la vitrine).
 * ⚠️ L'AGENT N'EST PAS JOUÉ (pas de clé d'API) : le bail part d'un MODÈLE du cabinet, la
 * voie qui marche sans agent.
 */
import { execFileSync } from "node:child_process";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, seConnecter, chapitre, centrer,
  ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/jour-4c-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const JURISTE = "p.moukouri@cga-brcg.cm";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
const COURRIEL = "contact@briqueterie-wouri.cm";

// ── Hors champ : la demande déposée sur le site, puis réglée ────────────────────────────
const depot = await fetch(`${API}/acquisition/demandes`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nom: "Briqueterie du Wouri",
    telephone: "699441122",
    courriel: COURRIEL,
    service_souhaite: "PONCTUEL",
    canal_prefere: "APPEL",
    message: "Rédiger le bail de notre entrepôt de Bonabéri, que nous louons à partir de novembre.",
  }),
});
console.log(`Demande déposée : ${depot.status}`);
execFileSync("psql", [
  "-h", "127.0.0.1", "-p", "55432", "-U", "cga", "-d", "cga_dev", "-Atc",
  `update dossier_commercial set etat = 'PAYEE', donnees = (donnees::jsonb || '{"etat": "PAYEE", "payee_le": "2026-10-18T08:30:00"}')::json where donnees->'demande'->>'courriel' = '${COURRIEL}'`,
]);

// Les articles du modèle, tels que la juriste les rend au client.
const REFORMULES = [
  "Le Bailleur donne à bail au Preneur, qui accepte, un entrepôt de 400 m² situé à Bonabéri, Douala IV, que le Preneur déclare connaître pour l'avoir visité.",
  "Les locaux sont destinés exclusivement au stockage et à la vente de briques et de matériaux de construction. Tout changement d'activité requiert l'accord écrit du Bailleur.",
  "Le bail est consenti pour une durée de trois ans à compter du 1er novembre 2026, et se renouvelle dans les conditions du bail à usage professionnel du droit OHADA.",
  "Le loyer est fixé à 350 000 francs CFA par mois, payable d'avance le 5 de chaque mois. Le Preneur verse à la signature une caution de trois mois de loyer, restituée en fin de bail déduction faite des sommes dues.",
  "Le Preneur supporte les consommations d'eau et d'électricité et l'entretien courant des locaux. Les grosses réparations restent à la charge du Bailleur.",
  "Le Preneur ne peut sous-louer tout ou partie des locaux sans l'accord écrit du Bailleur.",
  "À défaut de paiement du loyer ou d'exécution d'une clause du bail, et après une mise en demeure restée sans effet pendant un mois, le Bailleur peut demander la résiliation du bail en justice.",
  "Les parties rechercheront d'abord une solution amiable. À défaut d'accord dans un délai de trente jours, le litige sera porté devant les juridictions compétentes de Douala.",
  "Le présent contrat exprime l'intégralité de l'accord des parties. Toute modification fait l'objet d'un avenant écrit et signé des deux parties. Fait en deux exemplaires originaux, à Douala.",
];

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");
let adresseDeLaMission = null;

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "De la demande ponctuelle <em>au contrat en Word</em>",
    sous: "Ce qui arrive : une demande réglée, « rédiger notre bail ». Ce que la plateforme en fait : une mission ouverte d'un geste, un bail parti d'un modèle, rien d'inachevé au client. Le résultat : le contrat, en PDF et en Word.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 12000);
});

await chapitre("1 · ce qui arrive : une demande réglée", async () => {
  const C = "Chez la juriste";
  await seConnecter(page, JURISTE, C, "Patricia MOUKOURI, juriste, ouvre les prestations ponctuelles.");
  await aller(page, `${CONSOLE}/fr/missions`, C,
    "En tête, une file nouvelle : les demandes réglées qui attendent leur mission.");
  await centrer(page.getByText("Briqueterie du Wouri").first());
  await legende(page, C,
    "La Briqueterie du Wouri : son message, son téléphone, la date du paiement. Personne n'a à recopier une référence.");
  await souffle(4800);
});

await chapitre("2 · la mission s'ouvre, le client est prévenu", async () => {
  const C = "Chez la juriste";
  const formulaire = page.locator("form", { has: page.locator('input[name="reference_commerciale"]') }).first();
  await formulaire.locator('select[name="type"]').selectOption("REDACTION_CONTRAT");
  await legende(page, C, "Elle choisit la prestation : rédaction de contrat. L'objet reprend la demande.");
  await souffle(3000);
  await formulaire.locator("button[type=submit]").click();
  await page.waitForURL(/missions\/MIS-/, { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  if (!/missions\/MIS-/.test(page.url())) {
    await page.goto(`${CONSOLE}/fr/missions`, { waitUntil: "domcontentloaded" });
    await page.locator('a[href*="/missions/MIS-"]').first().click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  }
  adresseDeLaMission = page.url();
  await legende(page, C,
    "La mission est ouverte. Le client reçoit un courriel : sa demande est prise en charge par le cabinet, sans nom de juriste.");
  await souffle(4600);
});

await chapitre("3 · le bail part d'un modèle", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que la plateforme en fait",
    titre: "Un bail à partir d'un modèle du cabinet",
    sous: "Le canevas du cahier, et neuf articles types, chacun à décider. Sans clé d'API, le modèle suffit ; avec elle, l'agent complète.",
  }, 8000);
  await page.goto(adresseDeLaMission, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const C = "Chez la juriste";
  await centrer(page.locator('select[name="modele"]'));
  await page.locator('select[name="modele"]').selectOption("BAIL_COMMERCIAL");
  await legende(page, C, "« Bail à usage professionnel », neuf articles.");
  await souffle(2600);
  await page.getByRole("button", { name: "Partir de ce modèle" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1500);
  await centrer(page.locator("li.mission__point").first());
  await legende(page, C,
    "Les articles arrivent « tirés du modèle », en attente. Là où le modèle ne sait pas, il l'écrit : [À COMPLÉTER].");
  await souffle(5000);
});

await chapitre("4 · rien d'inachevé ne passe", async () => {
  const C = "La garde";
  const n = await page.locator("li.mission__point").count();
  for (let i = 0; i < n; i++) {
    const point = page.locator("li.mission__point").nth(i);
    await point.locator('button[value="RETENUE"]').click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(300);
  }
  await legende(page, C, "Elle retient les neuf articles tels quels, et soumet.");
  await centrer(page.getByRole("button", { name: "Soumettre au second regard" }));
  await souffle(2200);
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForSelector('.mission__message[data-ton="echec"]', { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('.mission__message[data-ton="echec"]').first());
  await legende(page, C,
    "Refusé : des articles portent encore « [À COMPLÉTER » ou une consigne au juriste. Retenus tels quels, ils partiraient au client.");
  await souffle(5600);
});

await chapitre("5 · elle reformule, avec la donnée du client", async () => {
  const C = "Chez la juriste";
  await legende(page, C,
    "Elle reformule chaque article avec ce que le client lui a dit : l'entrepôt, le loyer, la caution, la durée.");
  for (let i = 0; i < REFORMULES.length; i++) {
    const point = page.locator("li.mission__point").nth(i);
    await centrer(point);
    await point.getByRole("button", { name: "Reformuler" }).click();
    await point.locator('textarea[name="texte_retenu"]').fill(REFORMULES[i]);
    await souffle(i < 4 ? 1400 : 500);
    await point.locator('button[value="MODIFIEE"]').click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(300);
  }
  await centrer(page.getByRole("button", { name: "Soumettre au second regard" }));
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Soumise, cette fois. Le second regard valide.");
  await souffle(3200);
});

await chapitre("6 · le résultat : le contrat validé, en PDF et en Word", async () => {
  await carton(page, {
    type: "chapitre", num: "Le résultat",
    titre: "Le contrat, validé, en PDF et en Word",
    sous: "La directrice relit et valide ; le client est prévenu ; le projet part en Word, pour que les parties le retouchent.",
  }, 8000);
  const C = "Chez la directrice";
  await seConnecter(page, DIRECTRICE, C, "Bernadette MBALLA, directrice, ouvre la mission soumise.");
  await page.goto(adresseDeLaMission, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("button", { name: "Valider et livrer" }));
  await legende(page, C, "Elle relit les neuf articles retenus, et valide. La mission est livrée.");
  await souffle(3600);
  await page.getByRole("button", { name: "Valider et livrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1500);
  const word = page.getByRole("link", { name: /Word/ }).first();
  await centrer(word);
  await projecteur(page, 'a[href*="/word"]', { tenir: 2800, centrer: false });
  await legende(page, C,
    "« Le contrat en Word (.docx) » : les mêmes articles, la même numérotation, à retoucher avec les parties.");
  await souffle(4800);
  const pdf = await page.getByRole("link", { name: /livrable \(PDF\)/ }).first().getAttribute("href");
  if (pdf) {
    await page.goto(`${CONSOLE}${pdf}`, { waitUntil: "load" });
    await souffle(2200);
    await legende(page, C, "Et le PDF : « Projet de bail à usage professionnel », visé par le cabinet, sans nom de juriste.");
    await souffle(5200);
  }
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Une demande, une mission, un contrat qu'on peut signer",
    sous: "La mission s'ouvre depuis la demande réglée ; le bail part d'un modèle ; une mention à compléter ne passe jamais au second regard ; le client reçoit un document fini, en PDF et en Word.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "De la demande au contrat : <em>livré</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives.",
    pied: PIED,
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
