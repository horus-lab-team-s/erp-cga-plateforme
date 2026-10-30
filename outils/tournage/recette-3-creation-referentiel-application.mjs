/**
 * RECETTE · FILM 3 (30 octobre 2026) — LA CRÉATION QUI ENTRE AU PORTEFEUILLE, LE RÉFÉRENTIEL DU
 * FISCALISTE, L'APPLICATION À TÉLÉCHARGER.
 *
 * Les derniers points de la recette sans vidéo :
 * 1. la juriste porte le RCCM et le NIU délivrés, puis convertit la création en dossier ;
 * 2. le fiscaliste lit les taux et les seuils, et éprouve une règle de contrôle sur une facture ;
 * 3. le visiteur télécharge l'application mobile depuis le site.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 \
 *       TOURNAGE_DATE="30 octobre 2026" PRISE=1 node recette-3-creation-referentiel-application.mjs
 *
 * ⚠️ Pile NEUVE, avec le jeu de présentation. Le RCCM et le NIU saisis sont FICTIFS.
 */
import {
  CONSOLE, VITRINE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau, descendre,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/recette-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const JURISTE = "j.ateba@cga-brcg.cm";
const FISCALISTE = "r.ebolo@cga-brcg.cm";
const SAHEL = "CR-2026-0014";

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Recette en présentiel",
    titre: "La création qui entre au portefeuille, <em>le référentiel, l'application</em>",
    sous: "La juriste porte le NIU délivré et convertit la création en dossier ; le fiscaliste lit les taux et éprouve une règle de contrôle ; le visiteur télécharge l'application.",
    pied: `Démonstration jouée en direct sur la solution · 30 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · le NIU délivré, puis la conversion en dossier", async () => {
  const C = "Création d'entreprise";
  await seConnecter(page, JURISTE, C, "Julienne ATEBA, juriste, suit les créations d'entreprise.");
  await aller(page, `${CONSOLE}/fr/creation-entreprise`, C, "Le pipeline : chaque dossier à son étape. Sahel Distribution SA est à l'immatriculation.");
  await souffle(3500);
  await aller(page, `${CONSOLE}/fr/creation-entreprise/${SAHEL}`, C, "Le guichet a délivré le RCCM et le NIU : elle les porte au dossier, avec leurs dates.");
  await centrer(page.locator('input[name="rccm"]'));
  await saisir(page, 'input[name="rccm"]', "RC/DLA/2026/B/2417", { cadence: 30 });
  await page.fill('input[name="rccm_obtenu_le"]', "2026-10-27");
  await saisir(page, 'input[name="niu"]', "M102655443322S", { cadence: 30 });
  await page.fill('input[name="niu_obtenu_le"]', "2026-10-28");
  await legende(page, C, "Le format de chaque identifiant est contrôlé : un NIU, c'est une lettre, douze chiffres, une lettre.");
  await souffle(3500);
  await page.getByRole("button", { name: "Enregistrer les identifiants" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await souffle(800);
  await legende(page, C, "Les identifiants obtenus, le dossier passe à l'étape suivante : « À livrer ».");
  await page.getByRole("button", { name: /Passer à « À livrer »/ }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2000);
  await centrer(page.getByRole("button", { name: "Convertir en entreprise" }));
  await page.locator('select[name="regime"]').selectOption({ label: "Réel" });
  await page.locator('select[name="centre"]').selectOption({ index: 2 });
  await page.locator('input[name="adherent"]').check().catch(() => undefined);
  await page.locator('input[name="confirmation"]').check().catch(() => undefined);
  await legende(page, C, "Elle choisit le régime d'entrée et le centre des impôts : choisis, jamais déduits, une entreprise qui naît n'a pas de chiffre d'affaires.");
  await souffle(5500);
  await page.getByRole("button", { name: "Convertir en entreprise" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2000);
  await legende(page, C, "Sahel Distribution entre au portefeuille, avec son premier exercice. Le dossier de création se ferme.");
  await souffle(5000);
  await aller(page, `${CONSOLE}/fr/creation-entreprise`, C, "Au pipeline, elle figure désormais parmi les « Convertis ».");
  await centrer(page.getByText("Convertis").first());
  await souffle(4500);
});

await chapitre("2 · le fiscaliste : les taux, les seuils, une règle éprouvée", async () => {
  const C = "Référentiel";
  await seConnecter(page, FISCALISTE, C, "Roger EBOLO, fiscaliste du cabinet.");
  await aller(page, `${CONSOLE}/fr/referentiel`, C, "Le référentiel : 67 paramètres, chacun avec sa source et sa date d'effet.");
  await souffle(3000);
  await legende(page, C, "Ce qui n'est pas encore confirmé sur le CGI est marqué « À valider » : c'est à lui de le valider, nommément.");
  await souffle(5000);
  const seuil = page.getByText("règlement en espèces exclut la déduction de la TVA").first();
  await centrer(seuil);
  await legende(page, C, "Un seuil parmi d'autres : au-delà de 100 000 F payés en espèces, la TVA d'une facture n'est pas déductible.");
  await souffle(5500);
  // ⚠️ AIDE DE TOURNAGE, PAS DU PRODUIT : de la marge sous la page, pour que le rapport, posé sous
  // le bouton en bas de page, puisse remonter au-dessus de la bande de légende.
  await page.addStyleTag({ content: ".page-travail { padding-bottom: 420px !important; }" });
  const formulaire = page.locator("form").filter({ has: page.getByRole("button", { name: "Contrôler" }) });
  await centrer(formulaire);
  await legende(page, C, "Il éprouve les règles sur une facture de démonstration : 2 350 000 F TTC, réglée en espèces.");
  await souffle(4500);
  await formulaire.getByRole("button", { name: "Contrôler" }).click();
  await page.waitForTimeout(2500);
  await page.getByText(/Anomalie majeure/).last().evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "center" }));
  await souffle(900);
  await legende(page, C, "La règle FAC-ACH-007 réagit : paiement en espèces au-delà du seuil, 379 350 F de TVA non déductible.");
  await souffle(6500);
  const zone = formulaire.locator("textarea").first();
  await zone.evaluate((t) => { t.value = t.value.replace('"ESPECES"', '"VIREMENT"'); t.dispatchEvent(new Event("input", { bubbles: true })); });
  await centrer(zone);
  await legende(page, C, "Il change le mode de règlement : virement bancaire. Et contrôle de nouveau.");
  await souffle(3500);
  await formulaire.getByRole("button", { name: "Contrôler" }).click();
  await page.waitForTimeout(2500);
  await page.getByText(/Conforme — aucun constat/).last().evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "center" }));
  await souffle(900);
  await legende(page, C, "« Conforme — aucun constat » : la TVA redevient déductible. Rien n'a été enregistré, c'était un essai.");
  await souffle(6000);
});

await chapitre("3 · l'application, téléchargée depuis le site", async () => {
  const C = "Sur le site";
  await aller(page, `${VITRINE}/fr/application`, C, "Sur le site du cabinet, la page de l'application mobile.");
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await souffle(1500);
  const bouton = page.locator("a[data-paquet]").first();
  await centrer(bouton);
  await legende(page, C, "Sur un ordinateur, le bouton propose la version universelle (56 Mo) ; ouvert sur un téléphone, il choisit le paquet de ce téléphone : 20 Mo.");
  await souffle(5000);
  await page.locator(".application__versions summary").click().catch(() => undefined);
  await centrer(page.locator(".application__versions"));
  await legende(page, C, "Les autres versions, avec leur empreinte : de quoi vérifier un fichier téléchargé, et la conduite à tenir s'il est abîmé.");
  await souffle(6500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "De la création au portefeuille, <em>des règles éprouvées</em>",
    sous: "Une entreprise créée par le cabinet devient un dossier suivi, sans ressaisie ; les taux et les seuils sont sourcés, validés par le fiscaliste, et chaque règle s'éprouve avant d'agir ; l'application s'installe depuis le site, au poids juste.",
    pied: `30 octobre 2026<br>${PIED}`,
  }, 10000);
});

await plateau.fermer();
console.log(`\nFilm : ${SORTIE} · ${Math.round((Date.now() - debut) / 1000)} s`);
