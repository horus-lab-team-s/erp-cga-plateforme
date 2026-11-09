/**
 * MISES À JOUR DU 20 OCTOBRE 2026 · FILM 5 — LA DSF, COMMANDÉE EN LIGNE AU PRIX DU CABINET.
 *
 * Ce qui arrive : une entreprise qui n'est pas adhérente veut faire établir sa DSF. Ce que
 * la plateforme en fait : tant que la direction n'a pas fixé le prix, le site ne l'encaisse
 * pas et fait rappeler le client ; une fois le prix fixé dans « Tarifs de l'offre », la DSF
 * se commande et se règle en ligne. Le résultat : un devis au prix du cabinet, payable.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 PRISE=1 node maj20-5-dsf-en-ligne.mjs
 *
 * ⚠️ Pile NEUVE (prix de la DSF « à fixer »). LE PRIX SAISI EST UN EXEMPLE : le cabinet
 * fixe le sien. Le film le dit.
 */
import {
  VITRINE, CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, lecture, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/maj20-5-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
const CLIENTE = {
  prenom: "Esther", nom: "Mvondo", courriel: "e.mvondo@exemple.cm", telephone: "690112233",
};

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

/** Le formulaire de souscription, rempli pour la DSF ; `formule` : la tranche, si elle s'offre. */
async function demanderLaDsf(C, formule) {
  await aller(page, `${VITRINE}/souscrire?service=DSF`, C, null);
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await page.locator('select[name="service"]').selectOption("DSF");
  await centrer(page.locator('select[name="service"]'));
  await souffle(900);
  if (formule) await page.locator('select[name="formule"]').selectOption(formule).catch(() => undefined);
  await saisir(page, 'input[name="prenom"]', CLIENTE.prenom, { cadence: 30 });
  await saisir(page, 'input[name="nom"]', CLIENTE.nom, { cadence: 30 });
  await saisir(page, 'input[name="courriel"]', CLIENTE.courriel, { cadence: 20 });
  await saisir(page, 'input[name="telephone"]', CLIENTE.telephone, { cadence: 26 });
  await souffle(900);
  await lecture();
  await Promise.all([
    page.waitForURL(/souscrire\/devis\//, { timeout: 25000 }).catch(() => undefined),
    page.getByRole("button", { name: "Établir mon devis" }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.locator(".annonce__fermer").first().click({ timeout: 3000 }).catch(() => undefined);
  await souffle(1200);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 20 octobre 2026",
    titre: "La DSF, <em>commandée en ligne au prix du cabinet</em>",
    sous: "Ce qui arrive : une entreprise non adhérente veut sa DSF. Ce que la plateforme en fait : n'encaisser qu'un prix fixé par la direction. Le résultat : la DSF se commande et se règle en ligne.",
    pied: `Démonstration jouée en direct sur la solution · 20 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · avant le prix : rien ne s'encaisse", async () => {
  const C = "La cliente, sur le site";
  await aller(page, `${VITRINE}/souscrire`, C,
    "Madame MVONDO veut faire établir sa DSF. Sur « Souscrire en ligne », la DSF n'est pas proposée.");
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await page.evaluate(() => window.scrollTo({ top: 520, behavior: "smooth" }));
  await souffle(3400);
  await legende(page, C, "Son prix n'est pas encore fixé par le cabinet : le site ne vend pas ce qui n'a pas de prix décidé.");
  await souffle(3600);
});

await chapitre("2 · la direction fixe le prix", async () => {
  await carton(page, {
    type: "chapitre", num: "Au cabinet",
    titre: "Le prix est une décision de la direction",
    sous: "Dans « Tarifs de l'offre », tranche par tranche, avec sa date d'effet et son motif. Le montant montré ici est un exemple.",
  }, 8000);
  const C = "À la direction";
  await seConnecter(page, DIRECTRICE, C, "Bernadette MBALLA, directrice, ouvre les tarifs de l'offre.");
  await aller(page, `${CONSOLE}/fr/tarifs`, C, "Le compteur des prix encore à fixer, puis chaque prestation : la DSF y figure, « à fixer ».");
  const ligne = page.locator("div, li, tr").filter({ hasText: "Entreprise à l'impôt libératoire" })
    .filter({ has: page.getByRole("button", { name: "Fixer ce prix" }) }).last();
  await centrer(ligne);
  await projecteur(page, "div:has(> * button:has-text('Fixer ce prix'))", { tenir: 2000, centrer: false });
  await souffle(2000);
  await ligne.getByRole("button", { name: "Fixer ce prix" }).click();
  await souffle(800);
  await saisir(page, 'input[name="montant"]', "150000", { cadence: 110 });
  await saisir(page, 'textarea[name="motif"], input[name="motif"]', "Exemple pour la démonstration : DSF d'une entreprise à l'impôt libératoire.", { cadence: 16 });
  await page.locator('input[name="confirmation"]').check();
  await legende(page, C, "Le montant, la date d'effet, le motif, et une case qui confirme : un prix ne se fixe pas par mégarde.");
  await souffle(3200);
  await page.getByRole("button", { name: "Fixer le prix" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Fixé. La décision s'inscrit plus bas : qui, combien, à partir de quand, et pourquoi.");
  await souffle(3600);
});

await chapitre("3 · le résultat : la DSF se commande en ligne", async () => {
  const C = "La cliente, sur le site";
  await demanderLaDsf(C, "DSF_LIBERATOIRE");
  await legende(page, C, "La même demande : le devis porte maintenant le prix du cabinet, et se règle par Mobile Money.");
  await centrer(page.getByRole("button", { name: "Payer et souscrire" }));
  await projecteur(page, "form:has(button:has-text('Payer et souscrire'))", { tenir: 3200, centrer: false });
  await souffle(3400);
  await legende(page, C, "Payée, la commande arrive au cabinet dans la file des missions à ouvrir : le juriste ouvre la DSF sur son NIU et son exercice.");
  await souffle(4200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Rien ne s'encaisse sans un prix décidé",
    sous: "La DSF est au catalogue en ligne, en deux tranches. Elle ne se paie qu'au prix que la direction a fixé ; avant, le client est rappelé.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "La DSF en ligne : <em>prête, au prix du cabinet</em>",
    sous: "Joué en direct sur la solution le 20 octobre 2026. Données fictives ; le prix montré est un exemple.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
