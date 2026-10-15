/**
 * PRESTATIONS PONCTUELLES · FLUX 2 — LA RÉDACTION D'UN CONTRAT, ARTICLE PAR ARTICLE.
 *
 * La juriste écrit le cahier de rédaction ; chaque article attend sa décision ; elle
 * soumet ; la directrice valide ; le projet de contrat ne porte que les articles retenus.
 *
 *     PRISE=1 node missions-2-redaction-de-contrat.mjs
 *
 * ⚠️ L'AGENT N'EST PAS JOUÉ (pas de clé d'API sur la pile) : la juriste saisit les articles,
 * dans la structure que l'agent remplit quand la clé est posée. L'écran le dit.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/missions-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const JURISTE = "p.moukouri@cga-brcg.cm";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
let adresseMission = "";

const CAHIER =
  "Prestataire : SARL BATIMENT PLUS. Client : HÔTEL LE WOURI SA, Douala. Objet : réfection de la toiture du bâtiment principal. " +
  "Prix forfaitaire : 18 500 000 FCFA HT, 30 % à la commande, solde à la réception. Délai : 60 jours. Garantie de bonne fin de 5 %.";
const ARTICLES = [
  ["Objet", "Le Prestataire réalise la réfection complète de la toiture du bâtiment principal de l'hôtel, conformément au devis annexé."],
  ["Prix et paiement", "Prix forfaitaire de 18 500 000 FCFA hors taxes : 30 % à la commande, le solde à la réception des travaux, sous trente jours."],
  ["Délai", "Les travaux sont achevés dans un délai de soixante (60) jours à compter du versement de l'acompte, sauf force majeure."],
];

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Prestations ponctuelles",
    titre: "La rédaction d'un contrat, <em>article par article</em>",
    sous: "Le cahier de rédaction, des articles proposés, chacun décidé par le juriste, puis un second regard. Le client reçoit le projet de contrat.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la mission et son cahier", async () => {
  const C = "Chez la juriste";
  await seConnecter(page, JURISTE, C, "Bâtiment Plus demande au cabinet de rédiger son contrat de travaux avec un hôtel.");
  await aller(page, `${CONSOLE}/fr/missions`, C, null);
  await page.locator('select[name="type"]').selectOption("REDACTION_CONTRAT");
  await saisir(page, 'input[name="objet"]', "Contrat de travaux, toiture de l'Hôtel Le Wouri", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "SARL BATIMENT PLUS", { cadence: 18 });
  await souffle(1200);
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  adresseMission = page.url();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("heading", { name: "Cahier de rédaction" }));
  await saisir(page, 'input[name="type_de_contrat"]', "contrat d'entreprise de travaux", { cadence: 18 });
  await page.locator('textarea[name="cahier"]').fill(CAHIER);
  await legende(page, C, "Le cahier de rédaction : les parties, l'objet, le prix, le délai, ce qui compte pour le client.");
  await souffle(4200);
  await page.getByRole("button", { name: "Enregistrer le cahier" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);
});

await chapitre("2 · des articles, chacun à décider", async () => {
  const C = "La rédaction";
  await projecteur(page, ".mission__cahier .mission__agent", { tenir: 2400 }).catch(() => undefined);
  await legende(page, C,
    "Avec la clé d'API du cabinet, « Rédiger avec l'agent » propose les articles d'après le cahier. Ici, la juriste les saisit.");
  await souffle(5200);
  await page.getByRole("button", { name: "+ Ajouter un article à la main" }).click();
  for (const [titre, texte] of ARTICLES) {
    const f = page.locator(".mission__ajout").last();
    await saisir(page, '.mission__ajout >> nth=-1 >> input[name="titre"]', titre, { cadence: 20 });
    await f.locator('textarea[name="texte"]').fill(texte);
    await souffle(700);
    await f.getByRole("button", { name: "Ajouter", exact: true }).click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(1300);
  }
  await centrer(page.locator(".mission__points"));
  await legende(page, C, "Trois articles, « à décider ». Elle retient les deux premiers et précise le troisième.");
  await souffle(4200);
  for (const i of [0, 1]) {
    await page.locator(".mission__point").nth(i).getByRole("button", { name: "Retenir" }).click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(1200);
  }
  const troisieme = page.locator(".mission__point").nth(2);
  await centrer(troisieme);
  await troisieme.getByRole("button", { name: "Reformuler" }).click();
  await troisieme.locator('textarea[name="texte_retenu"]').fill(
    "Les travaux sont achevés dans un délai de soixante (60) jours à compter de l'acompte. Tout retard non justifié entraîne une pénalité de 0,1 % du prix par jour, plafonnée à 5 %.",
  );
  await souffle(2600);
  await troisieme.getByRole("button", { name: "Retenir ainsi" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1600);
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "Soumise : la directrice relira avant que le projet parte.");
  await souffle(3000);
});

await chapitre("3 · validé, le projet de contrat", async () => {
  const C = "Le second regard";
  await seConnecter(page, DIRECTRICE, C, null);
  await aller(page, adresseMission, C, "La directrice relit les articles retenus, puis valide.");
  await centrer(page.getByRole("button", { name: "Valider et livrer" }));
  await souffle(2600);
  await page.getByRole("button", { name: "Valider et livrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);
  const href = await page.getByRole("link", { name: /livrable/ }).getAttribute("href");
  await page.goto(`${CONSOLE}${href}`, { waitUntil: "load" });
  await souffle(2500);
  await legende(page, C,
    "Le projet de contrat : les articles retenus, numérotés, dans les mots de la juriste, à relire par les parties avant signature.");
  await souffle(6200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Et la DSF ciblée",
    titre: "Une mission, trois prestations",
    sous: "La DSF ciblée suit la même mission : elle porte le dossier et l'exercice, et mène au parcours de la DSF (préparée, validée, déposée).",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
