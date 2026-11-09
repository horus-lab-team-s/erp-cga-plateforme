/**
 * VITRINE · FLUX 1 — LE SITE PUBLIC, PAR LE VISITEUR.
 *
 * Ce que voit un prospect avant tout contact : l'accueil, les services, la fiche d'une
 * forme juridique, l'adhésion au centre, l'estimation, le blog, les carrières et le
 * contact. Le dépôt d'une demande a sa propre vidéo (création · flux 1).
 *
 *     PRISE=1 node vitrine-1-le-site-public.mjs
 */
import {
  VITRINE, souffle, carton, legende, aller, descendre, remonter, projecteur, chapitre, centrer,
  ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/vitrine-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const SITE = `${VITRINE}/fr`;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const tenter = async (geste) => {
  try {
    await geste();
  } catch (e) {
    console.log(`  (geste sauté : ${String(e).slice(0, 80)})`);
  }
};

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Le site public",
    titre: "La vitrine, <em>vue par le visiteur</em>",
    sous: "Ce que lit un prospect avant tout contact : les services, l'adhésion, l'estimation, le blog, les carrières.",
    pied: "Présentation de la solution · 17 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

await chapitre("1 · l'accueil et les services", async () => {
  const C = "L'accueil";
  await aller(page, SITE, C, "L'accueil : ce que fait le cabinet, en une page, sur ordinateur comme sur téléphone.");
  // Le bandeau d'annonce flotte au bas de l'écran, là où vivent les légendes : on le ferme,
  // comme un visiteur le ferait.
  await tenter(() => page.locator(".annonce__fermer").first().click({ timeout: 5000 }));
  await souffle(3200);
  await descendre(page, { paliers: 3 });
  await legende(page, C, "Les services du cabinet : créer son entreprise, le suivi comptable et fiscal, les prestations ponctuelles, la domiciliation.");
  await souffle(5200);
  await descendre(page, { paliers: 3 });
  await legende(page, C, "Comment ça se passe : trois étapes suivies en ligne, puis les institutions avec lesquelles le cabinet travaille.");
  await souffle(4800);
  await remonter(page);
});

await chapitre("2 · créer son entreprise", async () => {
  const C = "Créer son entreprise";
  await aller(page, `${SITE}/creer-mon-entreprise`, C, "Créer son entreprise : les formes juridiques, ce que comprend la prestation, et son prix.");
  await souffle(3600);
  await descendre(page, { paliers: 4 });
  await legende(page, C, "Le visiteur dit son projet ici : la demande arrive au cabinet déjà qualifiée (voir la vidéo de la création).");
  await souffle(5200);
});

await chapitre("3 · devenir adhérent", async () => {
  const C = "L'adhésion";
  await aller(page, `${SITE}/devenir-adherent`, C, "Devenir adhérent : les formules de suivi, leur contenu et leur prix.");
  await souffle(3400);
  await descendre(page, { paliers: 4 });
  await legende(page, C, "Chaque formule dit ce qu'elle comprend : la tenue, les déclarations, la DSF, la paie.");
  await souffle(5200);
});

await chapitre("4 · l'estimation", async () => {
  const C = "L'estimation";
  await aller(page, `${SITE}/estimation`, C, "L'estimation : le visiteur mesure, avant de s'engager, ce que l'adhésion lui fait gagner.");
  await souffle(3000);
  await tenter(() => centrer(page.locator(".estimateur__grille").first()));
  await tenter(() => projecteur(page, ".estimateur__total", { tenir: 2400 }));
  await legende(page, C, "Le calcul suit les tarifs en vigueur : il se refait à chaque option cochée, et donne un devis indicatif.");
  await souffle(5200);
});

await chapitre("5 · le blog", async () => {
  const C = "Le blog";
  await aller(page, `${SITE}/blog`, C, "Le blog : les rendez-vous du cabinet, repris de sa page publique et réécrits.");
  await souffle(3400);
  await tenter(async () => {
    await page.locator("a[href*='/blog/']").first().click();
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  });
  await legende(page, C, "Un article : daté de sa publication d'origine, pour que le lecteur juge de sa fraîcheur.");
  await souffle(5000);
});

await chapitre("6 · les carrières et le contact", async () => {
  const C = "Nous rejoindre";
  await aller(page, `${SITE}/carrieres`, C, "Les carrières : les postes ouverts au cabinet. Chaque offre se lit en entier avant de postuler (voir la vidéo du recrutement).");
  await souffle(5200);
  await aller(page, `${SITE}/contact`, "Le contact", "Le contact : téléphone, WhatsApp, agences, puis un formulaire pour ce qui demande une trace écrite.");
  await souffle(5200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que le site fait",
    titre: "Un prospect informé, une demande déjà qualifiée",
    sous: "Le visiteur trouve prix, formules et démarches avant d'appeler ; ce qu'il dépose arrive au cabinet sans ressaisie.",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
