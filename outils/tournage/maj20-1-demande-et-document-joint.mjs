/**
 * MISES À JOUR DU 20 OCTOBRE 2026 · FILM 1 — UNE DEMANDE, ET LE DOCUMENT QUI VA AVEC.
 *
 * Ce qui arrive : un visiteur demande l'analyse d'un bail, et l'envoyait jusqu'ici à part,
 * par WhatsApp. Ce que la plateforme en fait : une fois la demande enregistrée, il y joint
 * le bail depuis la même page. Le résultat : le cabinet lit le document sous la demande,
 * avant de rappeler.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 PRISE=1 node maj20-1-demande-et-document-joint.mjs
 *
 * ⚠️ Le bail joint est un SPÉCIMEN (`pieces/contrat-bail-specimen.pdf`).
 */
import {
  VITRINE, CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, lecture, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/maj20-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const BAIL = new URL("./pieces/contrat-bail-specimen.pdf", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const VISITEUR = { nom: "Alain Tchoupo", telephone: "677451209", courriel: "a.tchoupo@exemple.cm" };

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 20 octobre 2026",
    titre: "Une demande, <em>et le document qui va avec</em>",
    sous: "Ce qui arrive : une demande d'analyse de bail, dont le bail partait à part, par WhatsApp. Ce que la plateforme en fait : le joindre à la demande, sur la même page. Le résultat : le cabinet le lit avant de rappeler.",
    pied: `Démonstration jouée en direct sur la solution · 20 octobre 2026<br>${PIED}`,
  }, 10000);
});

await chapitre("1 · la demande, sur le site", async () => {
  const C = "Le visiteur, sur le site";
  await aller(page, `${VITRINE}/services/assistance-juridique#demande`, C,
    "Monsieur TCHOUPO veut faire relire le bail de son futur entrepôt. Il ouvre la page Assistance juridique.");
  await page.locator(".annonce__fermer").first().click({ timeout: 4000 }).catch(() => undefined);
  await centrer(page.locator("#demande-nom"));
  await saisir(page, "#demande-nom", VISITEUR.nom);
  await saisir(page, "#demande-tel", VISITEUR.telephone, { cadence: 34 });
  await saisir(page, "#demande-courriel", VISITEUR.courriel, { cadence: 26 });
  await saisir(page, "#demande-message", "Bail commercial d'un entrepôt à Bonabéri, à relire avant signature.", { cadence: 24 });
  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await legende(page, C, "Son nom, son téléphone, un mot. Jusqu'ici, le bail lui-même partait ensuite par WhatsApp, sans lien avec la demande.");
  await souffle(2400);
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await page.waitForSelector(".formulaire-service__pieces", { timeout: 20000 });
  await souffle(1200);
});

await chapitre("2 · le document, joint à la demande", async () => {
  const C = "Le visiteur, sur le site";
  await centrer(page.locator(".formulaire-service__pieces"));
  await legende(page, C, "Nouveau : la demande enregistrée, la page propose d'y joindre un document. Tout est facultatif.");
  await projecteur(page, ".formulaire-service__pieces", { tenir: 3000, centrer: false });
  await souffle(3200);
  await page.locator('.formulaire-service__pieces input[type="file"]').setInputFiles(BAIL);
  await legende(page, C, "Il choisit le bail, en PDF. Une photo convient aussi : 10 Mo au plus, cinq documents au maximum.");
  await souffle(2600);
  await lecture();
  await page.locator(".formulaire-service__pieces button.depot__bouton").click();
  await page.waitForSelector(".formulaire-service__pieces [role=status]", { timeout: 20000 });
  await centrer(page.locator(".formulaire-service__pieces [role=status]"));
  await legende(page, C, "Reçu. Le bail est rangé sous sa demande : la demande elle-même ne pouvait plus se perdre en route.");
  await souffle(4200);
});

await chapitre("3 · le cabinet lit la demande et son document", async () => {
  await carton(page, {
    type: "chapitre", num: "Au cabinet",
    titre: "La demande arrive avec son document",
    sous: "Affectée d'elle-même à un responsable, en quelques secondes.",
  }, 6500);
  const C = "Le cabinet, dans sa console";
  await seConnecter(page, "p.moukouri@cga-brcg.cm", C, "Patricia MOUKOURI, juriste, ouvre les demandes entrantes.");
  await aller(page, `${CONSOLE}/fr/acquisition`, C, "La demande de monsieur TCHOUPO est là.");
  await projecteur(page, `a:has-text("${VISITEUR.nom}")`, { tenir: 2600 });
  await souffle(1200);
  await lecture();
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${VISITEUR.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  const joints = page.locator("p:has-text('Documents joints par le visiteur')").locator("..");
  await centrer(joints);
  await legende(page, C, "Sous ce qu'il a écrit : « Documents joints par le visiteur », avec le nom, la taille et la date de réception.");
  await projecteur(page, "div:has(> p:has-text('Documents joints par le visiteur'))", { tenir: 3200, centrer: false });
  await souffle(3400);
  const lien = joints.locator("a").first();
  const href = await lien.getAttribute("href");
  await legende(page, C, "Elle l'ouvre : elle connaît le bail avant même d'appeler.");
  await page.goto(`${CONSOLE}${href}`, { waitUntil: "load" }).catch(() => undefined);
  await souffle(5500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Plus de demande muette, plus de fichier orphelin",
    sous: "Le document part avec la demande, depuis la même page ; le cabinet le lit sous la demande, avant le premier échange.",
  }, 9000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "Les documents de la demande : <em>en place</em>",
    sous: "Joué en direct sur la solution le 20 octobre 2026. Données fictives ; le bail est un spécimen.",
    pied: PIED,
  }, 6500);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
