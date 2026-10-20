/**
 * MISES À JOUR DU 20 OCTOBRE 2026 · FILM 2 — LE CLIENT SUIT SA DEMANDE, PUIS OUVRE SON LIVRABLE.
 *
 * Ce qui arrive : une analyse de bail, confiée au cabinet ; le client demandait au
 * téléphone « où en est mon dossier ? ». Ce que la plateforme en fait : un lien de suivi,
 * reçu par courriel, sans compte ; les étapes s'y lisent. Le résultat : le livrable validé
 * s'ouvre depuis la même page, sur le papier à en-tête du cabinet.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 PRISE=1 node maj20-2-suivi-et-livrable.mjs
 *
 * ⚠️ L'AGENT N'EST PAS JOUÉ (pas de clé d'API) : la juriste saisit son point.
 * ⚠️ Le bail est un SPÉCIMEN.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/maj20-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const BAIL = new URL("./pieces/contrat-bail-specimen.pdf", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const JURISTE = "p.moukouri@cga-brcg.cm";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
const CLIENT = "a.tchoupo@exemple.cm";

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
let adresseMission = "";
console.log("Tournage en cours…\n");

/** Le lien que le client a reçu, pour l'avis donné. */
async function lienRecu(code) {
  const retenus = await (await fetch(`${API}/transverse/courriels?code=${code}`)).json();
  const lien = retenus.filter((m) => m.destinataire === CLIENT).at(-1)?.contexte?.lien;
  if (!lien) throw new Error(`aucun avis ${code} pour ${CLIENT}`);
  return lien;
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 20 octobre 2026",
    titre: "Le client suit sa demande, <em>puis ouvre son livrable</em>",
    sous: "Ce qui arrive : « Où en est mon dossier ? », au téléphone. Ce que la plateforme en fait : un lien de suivi, sans compte. Le résultat : le livrable validé s'ouvre depuis la même page.",
    pied: `Démonstration jouée en direct sur la solution · 20 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · la mission s'ouvre, le client est prévenu", async () => {
  const C = "Chez la juriste";
  await seConnecter(page, JURISTE, C, "Patricia MOUKOURI, juriste, prend en charge l'analyse du bail de monsieur TCHOUPO.");
  await aller(page, `${CONSOLE}/fr/missions`, C, null);
  await saisir(page, 'input[name="objet"]', "Bail de l'entrepôt de Bonabéri, avant signature", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "Alain TCHOUPO", { cadence: 18 });
  await page.locator('input[name="client_courriel"]').fill(CLIENT);
  await page.locator('input[name="fichier"]').setInputFiles(BAIL);
  await legende(page, C, "L'adresse du client est notée : c'est là que partira son lien de suivi.");
  await souffle(2600);
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  adresseMission = page.url();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "La mission est ouverte. Le client reçoit aussitôt un courriel : « Votre demande est prise en charge », avec son lien.");
  await souffle(4200);
});

await chapitre("2 · ce que le client lit : en cours", async () => {
  await carton(page, {
    type: "chapitre", num: "Chez le client",
    titre: "Un lien, et pas de compte à créer",
    sous: "Il ouvre le lien reçu par courriel, sur son téléphone ou son ordinateur.",
  }, 6500);
  const C = "Le client, par son lien";
  await aller(page, await lienRecu("mission.ouverte"), C,
    "La page de sa demande : l'objet, et les étapes. Il voit où elle en est sans appeler le cabinet.");
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await projecteur(page, ".jalons", { tenir: 3000 });
  await souffle(2600);
  await centrer(page.locator(".suivi__encart"));
  await legende(page, C, "« En ce moment : un juriste du cabinet instruit votre demande. »");
  await souffle(3800);
});

await chapitre("3 · l'analyse, puis le second regard", async () => {
  const C = "Chez la juriste";
  await seConnecter(page, JURISTE, C, "Au cabinet, la juriste rédige son analyse.");
  await aller(page, adresseMission, C, null);
  await page.getByRole("button", { name: "+ Ajouter un point à la main" }).click();
  const f = page.locator(".mission__ajout");
  await f.locator('select[name="rubrique"]').selectOption("RECOMMANDATION");
  await saisir(page, '.mission__ajout input[name="titre"]', "À renégocier avant signature", { cadence: 14 });
  await f.locator('textarea[name="texte"]').fill(
    "Obtenir un préavis réciproque d'au moins six mois, la compétence des tribunaux de Douala et un plafond aux pénalités de retard.",
  );
  await legende(page, C, "Un point d'analyse, qu'elle retient ; puis elle soumet au second regard.");
  await f.getByRole("button", { name: "Ajouter", exact: true }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  await page.locator(".mission__point").first().getByRole("button", { name: "Retenir" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);

  await seConnecter(page, DIRECTRICE, "Le second regard", "Bernadette MBALLA, directrice, relit et valide.");
  await aller(page, adresseMission, "Le second regard", null);
  await centrer(page.getByRole("button", { name: "Valider et livrer" }));
  await page.getByRole("button", { name: "Valider et livrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, "Le second regard", "Validée : la mission est livrée, et le client reçoit un second courriel.");
  await souffle(3600);
});

await chapitre("4 · le résultat : le livrable, chez le client", async () => {
  const C = "Le client, par son lien";
  await aller(page, await lienRecu("mission.livree"), C, "Le même lien. La page dit maintenant : « C'est prêt ».");
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await centrer(page.locator(".suivi__encart"));
  await projecteur(page, ".suivi__encart", { tenir: 3000, centrer: false });
  await souffle(3000);
  const href = await page.locator(".suivi__encart a.bouton").first().getAttribute("href");
  await legende(page, C, "Il ouvre son livrable : relu, validé, sur le papier à en-tête du cabinet.");
  await souffle(2200);
  const adresse = new URL(href, page.url()).href;
  await page.goto(adresse, { waitUntil: "load" }).catch(() => undefined);
  await souffle(6500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Le client sait où en est sa demande",
    sous: "Un lien reçu par courriel, sans compte : les étapes, puis le livrable validé, sur le papier à en-tête du cabinet. Le lien est scellé : il n'ouvre que cette demande.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Le suivi des demandes : <em>en place</em>",
    sous: "Joué en direct sur la solution le 20 octobre 2026. Données fictives ; le bail est un spécimen.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
