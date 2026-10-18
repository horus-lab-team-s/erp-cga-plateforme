/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 4B — DE L'OFFRE DE POSTE À LA RÉPONSE AU CANDIDAT.
 *
 * Ce qui arrive : une candidature, déposée sur le site avec son CV. Ce que la plateforme en
 * fait : le cabinet la lit, décide, prépare la réponse depuis le texte type de la décision,
 * et la plateforme refuse un « [à compléter] » oublié. Le résultat : la réponse part au
 * candidat, et reste sous sa candidature.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 PRISE=1 node jour-4b-de-l-offre-a-la-reponse.mjs
 *
 * ⚠️ Pile NEUVE (aucune offre). Le CV déposé est un SPÉCIMEN.
 * ⚠️ L'AGENT N'EST PAS JOUÉ (pas de clé d'API) : la réponse part du texte type du cabinet.
 */
import {
  VITRINE, CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/jour-4b-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const CV = new URL("./pieces/attestation-domicile-specimen.pdf", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const DIRECTION = "b.mballa@cga-brcg.cm";

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "De l'offre de poste <em>à la réponse au candidat</em>",
    sous: "Ce qui arrive : une candidature et son CV. Ce que la plateforme en fait : décider, préparer la réponse, la relire. Le résultat : le candidat reçoit une réponse, sans courriel à écrire de zéro.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · l'offre, publiée", async () => {
  const C = "À la direction";
  await seConnecter(page, DIRECTION, C, "Bernadette MBALLA, direction, ouvre les offres de poste du cabinet.");
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, null);
  await page.getByRole("button", { name: "Rédiger une offre" }).click();
  await souffle(800);
  const f = page.locator("form.offres__formulaire");
  await saisir(page, "form.offres__formulaire input[name=intitule]", "Assistant comptable");
  await f.locator("input[name=lieu]").fill("Douala, Akwa");
  await saisir(page, "form.offres__formulaire textarea[name=description]", "Appuyer l'équipe de tenue comptable : saisie des pièces, rapprochements, déclarations mensuelles.");
  const q = f.getByRole("textbox", { name: "Qualifications attendues" });
  await q.fill("### Profil recherché\n- BTS ou licence en comptabilité\n- **Deux ans** d'expérience\n- Maîtrise du SYSCOHADA");
  await legende(page, C, "L'offre, rédigée au mini-éditeur, puis publiée sur la page Carrières du site.");
  await souffle(2600);
  await f.getByRole("button", { name: "Rédiger en brouillon" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.getByRole("button", { name: "Publier sur le site" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await projecteur(page, ".offres__offre", { tenir: 2200 });
  await souffle(1600);
});

await chapitre("2 · ce qui arrive : la candidature", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce qui arrive",
    titre: "Une candidature, déposée sur le site",
    sous: "Sans compte : son nom, son téléphone, son adresse, un mot, et le CV en PDF.",
  }, 7000);
  const C = "Sur le site";
  await aller(page, `${VITRINE}/fr/carrieres`, C, "La page Carrières : le poste vient de paraître.");
  await page.locator(".annonce__fermer").first().click({ timeout: 5000 }).catch(() => undefined);
  await souffle(2000);
  await page.getByRole("link", { name: "Lire l'offre et postuler" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const fo = page.locator("form.candidature");
  await centrer(fo);
  await saisir(page, "form.candidature input[name=nom]", "Ngo Biyong Claire");
  await saisir(page, "form.candidature input[name=telephone]", "699887766");
  await saisir(page, "form.candidature input[name=courriel]", "claire.ngobiyong@exemple.cm");
  await saisir(page, "form.candidature textarea[name=message]", "Deux ans en cabinet à Douala, à l'aise sur le SYSCOHADA.");
  await fo.locator("input[name=cv]").setInputFiles(CV);
  await fo.locator("input[name=consentement]").check();
  await souffle(1400);
  await fo.getByRole("button", { name: "Envoyer ma candidature" }).click();
  await page.waitForTimeout(2500);
  await centrer(page.locator(".candidature__recue, .candidature__echec").first());
  await legende(page, C, "Reçue. Elle arrive au cabinet sous l'offre, avec son CV : aucune boîte de courriel à trier.");
  await souffle(4000);
});

await chapitre("3 · ce que la plateforme en fait : décider, répondre", async () => {
  const C = "Au cabinet";
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, "L'offre compte une candidature.");
  await page.getByRole("button", { name: /1 candidature/ }).click();
  await souffle(1000);
  const candidature = page.locator(".offres__candidatures > li").first();
  await centrer(candidature);
  await legende(page, C, "Nom, téléphone, adresse, son mot ; le CV se télécharge en PDF.");
  await souffle(3800);

  await candidature.locator('select[name="decision"]').selectOption("ENTRETIEN");
  await saisir(page, '.offres__decision input[name="note"]', "Expérience en cabinet, disponible de suite.");
  await candidature.getByRole("button", { name: "Enregistrer la décision" }).click();
  await page.waitForSelector(".offres__decision .offres__fait", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "La décision : entretien. La note reste au dossier.");
  await souffle(3200);

  const liste = page.locator(".offres__candidatures > li").first();
  await liste.getByRole("button", { name: /Préparer la réponse/ }).click();
  await page.waitForSelector(".offres__reponse", { timeout: 15000 });
  await centrer(page.locator(".offres__reponse"));
  await legende(page, C, "La réponse part du texte type de la décision, adressée au candidat. Reste à compléter la date.");
  await souffle(5200);

  await page.getByRole("button", { name: "Envoyer au candidat" }).click();
  await page.waitForSelector(".offres__reponse .offres__echec", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".offres__reponse .offres__echec"));
  await legende(page, C, "Oubliée, la mention « [à compléter] » est refusée : elle serait partie telle quelle chez le candidat.");
  await souffle(4800);

  const corps = page.locator('.offres__reponse textarea[name="corps"]');
  await centrer(corps);
  const texte = await corps.inputValue();
  await corps.fill(texte.replace("[à compléter]", "mardi 21 octobre 2026 à 10 h, au cabinet"));
  await legende(page, C, "La date proposée, écrite : c'est ce texte relu qui part.");
  await souffle(3200);
  await page.getByRole("button", { name: "Envoyer au candidat" }).click();
  await page.waitForSelector(".offres__traitement > .offres__fait", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
});

await chapitre("4 · le résultat", async () => {
  const C = "Au cabinet";
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  await page.getByRole("button", { name: /1 candidature/ }).click();
  await souffle(1000);
  const historique = page.locator("details.offres__historique").first();
  await historique.locator("summary").click();
  await centrer(historique);
  await legende(page, C, "« Entretien », et la réponse envoyée, datée, sous la candidature : qui a répondu quoi, et quand.");
  await souffle(5200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Chaque candidat reçoit une réponse",
    sous: "La candidature arrive avec son CV, la décision se note, la réponse part d'un texte type relu, et la plateforme refuse ce qui ne devait pas partir.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Le recrutement : <em>jusqu'à la réponse</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives ; le CV est un spécimen.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
