/**
 * RECRUTEMENT · FLUX 1 — L'OFFRE DE POSTE : RÉDIGÉE, LUE, POSTULÉE.
 *
 * La direction rédige une offre au mini-éditeur (titre, liste, gras) et la publie ; un
 * candidat la lit sur le site, puis postule avec son CV ; le cabinet retrouve la
 * candidature et télécharge le CV.
 *
 *     PRISE=1 node recrutement-1-offre-de-poste.mjs
 *
 * ⚠️ Le CV déposé est un SPÉCIMEN (`pieces/attestation-domicile-specimen.pdf` sert de PDF).
 */
import {
  VITRINE, CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/recrutement-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const CV = new URL("./pieces/attestation-domicile-specimen.pdf", import.meta.url).pathname;
const DIRECTION = "b.mballa@cga-brcg.cm";
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Recrutement",
    titre: "L'offre de poste, <em>lue avant de postuler</em>",
    sous: "Le cabinet rédige les qualifications au mini-éditeur ; le candidat les lit sur le site, puis dépose son CV.",
    pied: "Présentation de la solution · 17 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

await chapitre("1 · rédiger l'offre", async () => {
  const C = "À la direction";
  await seConnecter(page, DIRECTION, C, "Bernadette MBALLA, direction, ouvre les offres de poste du cabinet.");
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, "Administration · Offres de poste : brouillon, publiée sur le site, puis close.");
  await page.getByRole("button", { name: "Rédiger une offre" }).click();
  await souffle(900);
  const f = page.locator("form.offres__formulaire");
  await saisir(page, "form.offres__formulaire input[name=intitule]", "Comptable confirmé");
  await f.locator("input[name=lieu]").fill("Douala, Akwa");
  await saisir(page, "form.offres__formulaire textarea[name=description]", "Rejoindre l'équipe de tenue comptable et fiscale.");
  const q = f.getByRole("textbox", { name: "Qualifications attendues" });
  await centrer(q);
  await legende(page, C, "Les qualifications se rédigent au mini-éditeur : titre, liste, gras, sans aucune balise à connaître.");
  await q.click();
  await q.pressSequentially("Profil recherché\nLicence en comptabilité\nTrois ans d'expérience\nMaîtrise du SYSCOHADA", { delay: 30 });
  await q.evaluate((z) => z.setSelectionRange(0, 0));
  await f.getByRole("button", { name: "Titre" }).nth(1).click();
  await souffle(500);
  let txt = await q.inputValue();
  let d = txt.indexOf("Licence");
  await q.evaluate((z, [a, b]) => z.setSelectionRange(a, b), [d, txt.length]);
  await f.getByRole("button", { name: "Liste" }).nth(1).click();
  await souffle(500);
  txt = await q.inputValue();
  d = txt.indexOf("Trois ans");
  await q.evaluate((z, [a, b]) => z.setSelectionRange(a, b), [d, d + 9]);
  await f.getByRole("button", { name: "Gras" }).nth(1).click();
  await souffle(1600);
  await f.getByRole("button", { name: "Aperçu" }).nth(1).click();
  await legende(page, C, "L'aperçu montre exactement ce que le candidat lira sur le site.");
  await souffle(5200);
  await f.getByRole("button", { name: "Rédiger en brouillon" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);
  await page.getByRole("button", { name: "Publier sur le site" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);
  await projecteur(page, ".offres__offre", { tenir: 2400 });
  await legende(page, C, "Publiée : l'offre paraît sur la page Carrières du site.");
  await souffle(4200);
});

await chapitre("2 · le candidat lit et postule", async () => {
  const C = "Sur le site";
  await aller(page, `${VITRINE}/fr/carrieres`, C, "Sur le site, sans compte : la page Carrières liste les postes ouverts.");
  // Le bandeau d'annonce flotte là où vivent les légendes : on le ferme.
  await page.locator(".annonce__fermer").first().click({ timeout: 5000 }).catch(() => undefined);
  await souffle(2600);
  await page.getByRole("link", { name: "Lire l'offre et postuler" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".texte-riche").last());
  await legende(page, C, "Les qualifications d'abord, mises en forme comme le cabinet les a rédigées.");
  await souffle(5600);
  const fo = page.locator("form.candidature");
  await centrer(fo);
  await saisir(page, "form.candidature input[name=nom]", "Ngo Biyong Claire");
  await saisir(page, "form.candidature input[name=telephone]", "699887766");
  await saisir(page, "form.candidature textarea[name=message]", "Trois ans en cabinet, à l'aise sur le SYSCOHADA.");
  await fo.locator("input[name=cv]").setInputFiles(CV);
  await fo.locator("input[name=consentement]").check();
  await legende(page, C, "Le CV se dépose en PDF, vérifié sur son contenu ; une même personne ne postule qu'une fois.");
  await souffle(2600);
  await fo.getByRole("button", { name: "Envoyer ma candidature" }).click();
  await page.waitForTimeout(2500);
  await centrer(page.locator(".candidature__recue, .candidature__echec").first());
  await souffle(3600);
});

await chapitre("3 · le cabinet reçoit", async () => {
  const C = "Au cabinet";
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, "Au cabinet : l'offre compte désormais une candidature.");
  await page.getByRole("button", { name: /1 candidature/ }).click();
  await souffle(1200);
  await centrer(page.locator(".offres__candidatures"));
  await legende(page, C, "Nom, téléphone, message, date de réception ; le CV se télécharge en PDF.");
  const [fichier] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: "CV (PDF)" }).click(),
  ]);
  console.log(`  fichier : ${fichier ? fichier.suggestedFilename() : "aucun"}`);
  await souffle(5200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Une offre rédigée une fois, lue telle quelle",
    sous: "Ce que le cabinet met en forme, le candidat le lit à l'identique ; sa candidature arrive au cabinet avec son CV, sans courriel à trier.",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
