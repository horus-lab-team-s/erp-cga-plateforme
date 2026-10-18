/**
 * CREATION D'ENTREPRISE · FLUX 1 — LA DEMANDE QUI NE SE RESSAISIT PAS.
 *
 * Le client dit son projet une fois, sur le site. Ses reponses ouvrent la
 * qualification du dossier deja remplie : le responsable les confirme au lieu
 * de les redemander.
 *
 *     PRISE=1 node flux-1-demande-preremplie.mjs
 *
 * ⚠️ Se tourne sur une pile de demonstration NEUVE : la demande est reellement
 * deposee, et une seconde prise sur la meme base la rattacherait au meme fil.
 */
import {
  VITRINE, CONSOLE, souffle, carton, legende, aller, descendre, remonter,
  projecteur, saisir, seConnecter, chapitre, lecture, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/flux-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const CLIENTE = { nom: "MBARGA Estelle", telephone: "+237677009988", courriel: "estelle.mbarga@exemple.cm" };
const PROJET = [
  ["denomination_souhaitee", "MBARGA COUTURE SARL", 34],
  ["associes", "2", 120],
  ["capital_social", "1000000", 70],
  ["apports_en_nature", "non"],
  ["chiffre_affaires_prevu", "MOINS_10M"],
  ["salaries_prevus", "3", 120],
  ["region_siege", "LITTORAL"],
  ["siege", "Akwa, Douala", 40],
  ["activite", "Confection et vente de vêtements", 26],
  ["statuts_apportes", "non"],
  ["pieces_deja_reunies", "CNI des associés", 34],
];

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Une information ne se saisit <em>qu'une fois</em>",
    sous: "Flux 1 sur 5. Le client dit son projet sur le site ; le cabinet ouvre un dossier déjà rempli. Tout est joué en direct sur la solution.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9500);
});

await chapitre("1 · le client dit son projet", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "Le client dit son projet, sur le site",
    sous: "Sans compte, et sans rien d'obligatoire au-delà de son nom et de son téléphone.",
  }, 6500);

  const C = "Le client, sur le site";
  await aller(page, `${VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande`, C,
    "Madame MBARGA veut créer son atelier de couture. Elle arrive sur la fiche du service, depuis le lien « Créer une SARL ».");
  await page.locator("#demande").scrollIntoViewIfNeeded().catch(() => undefined);
  await souffle(1500);
  await saisir(page, "#demande-nom", CLIENTE.nom);
  await saisir(page, "#demande-tel", CLIENTE.telephone, { cadence: 34 });
  await saisir(page, "#demande-courriel", CLIENTE.courriel, { cadence: 26 });

  await centrer(page.locator(".formulaire-service__projet-titre"));
  await legende(page, C,
    "Voici ce qui est nouveau : « Votre projet, en quelques réponses ». Douze questions, toutes facultatives.");
  await projecteur(page, ".formulaire-service__projet", { tenir: 2600, centrer: false });
  await souffle(2600);
  await legende(page, C,
    "La forme juridique est déjà cochée : elle vient du lien qu'elle a suivi. On ne la lui demande pas deux fois sur la même page.");
  await projecteur(page, "#declaration-forme_juridique", { tenir: 2400 });
  await souffle(2600);

  let posees = 0;
  for (const [code, valeur, cadence] of PROJET) {
    const champ = `#declaration-${code}`;
    if (cadence) await saisir(page, champ, valeur, { cadence });
    else {
      await page.locator(champ).scrollIntoViewIfNeeded().catch(() => undefined);
      await page.selectOption(champ, valeur);
      await souffle(700);
    }
    posees += 1;
    if (posees === 3) {
      await legende(page, C,
        "Ces questions ne sont pas écrites dans le site. Il les demande au référentiel du cabinet, qui décide lesquelles poser au client.");
    }
    if (posees === 7) {
      await legende(page, C,
        "Elles sont dites dans sa langue à elle : « Combien serez-vous d'associés ? », et non « Nombre d'associés ».");
    }
  }
  await souffle(1200);
  await legende(page, C,
    "Elle aurait pu tout sauter : sa demande serait partie quand même. Un champ obligatoire de plus, c'est un visiteur de moins.");
  await souffle(2400);

  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await souffle(900);
  await projecteur(page, '.formulaire-service button[type="submit"]', { tenir: 1800 });
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await souffle(3600);
  await legende(page, C,
    "Le site confirme l'enregistrement. Côté cabinet, sa demande existe, et sa qualification est déjà ouverte.");
  await souffle(3200);
});

await chapitre("le relais", async () => {
  await carton(page, {
    type: "chapitre", num: "Pendant ce temps",
    titre: "Personne n'a encore ouvert la plateforme",
    sous: "Un travail périodique tourne toutes les cinq secondes : il prend la demande et l'affecte à un responsable, selon sa charge et son métier.",
  }, 8500);
});

await chapitre("2 · le cabinet ouvre un dossier déjà rempli", async () => {
  const C = "Le cabinet, dans sa console";
  await seConnecter(page, "p.moukouri@cga-brcg.cm", C,
    "Patricia MOUKOURI, chargée de clientèle et de formalités, ouvre sa console.");
  await aller(page, `${CONSOLE}/fr/acquisition`, C,
    "Les demandes entrantes. Celle de madame MBARGA est là, déjà affectée, sans que personne ne l'ait touchée.");
  await projecteur(page, `a:has-text("${CLIENTE.nom}")`, { tenir: 2600 });
  await souffle(1500);
  await lecture();
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${CLIENTE.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C,
    "Le dossier. En haut, ce que la visiteuse a écrit. Avant aujourd'hui, la qualification en dessous était vide : treize champs à retaper.");
  await souffle(3200);

  const Q = 'form:has([name^="q_"])';
  await page.evaluate(() => [...document.querySelectorAll("h2, h3")]
    .find((n) => /^Qualification/.test(n.textContent ?? ""))
    ?.scrollIntoView({ behavior: "smooth", block: "start" })).catch(() => undefined);
  await souffle(1500);
  await legende(page, C,
    "Elle arrive remplie : douze réponses sur treize, chacune marquée « dit par le client sur le site ». Plus aucune n'est manquante.");
  await souffle(3600);
  await projecteur(page, `${Q} [name="q_denomination_souhaitee"]`, { tenir: 2400, centrer: false });
  await legende(page, C,
    "Le nom de la société, le capital, le siège, l'activité : tout ce que le dossier de formalité reprendra, sans nouvelle saisie.");
  await souffle(3200);
  await projecteur(page, `${Q} [name="q_chiffre_affaires_prevu"]`, { tenir: 2400, centrer: false });
  await legende(page, C,
    "Les listes se lisent comme sur le site, « Moins de 10 millions de FCFA », et non plus comme un code interne.");
  await souffle(3000);

  /* ── Signalees, pas verrouillees : le responsable corrige ──────────── */
  await legende(page, C,
    "Ces réponses sont signalées, pas verrouillées. Au téléphone, madame MBARGA précise qu'ils seront trois associés, et non deux.");
  await souffle(1800);
  await page.locator(`${Q} [name="q_associes"]`).fill("");
  await saisir(page, `${Q} [name="q_associes"]`, "3", { cadence: 200 });
  await souffle(1500);

  await centrer(page.locator('form:has(input[name="commentaire"])'));
  await legende(page, C,
    "Le responsable déclare son premier échange. Il a confirmé des réponses ; il n'en a redemandé aucune.");
  await saisir(page, 'input[name="commentaire"]',
    "Cliente jointe : projet confirmé, trois associés et non deux.", { cadence: 22 });
  await souffle(800);
  await page.click('form:has(input[name="commentaire"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2400);

  await page.locator(`${Q} [name="q_associes"]`).fill("3").catch(() => undefined);
  await centrer(page.locator(`${Q} button[type="submit"]`));
  await page.click(`${Q} button[type="submit"]`, { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  await legende(page, C,
    "Enregistré : la qualification est complète, et le dossier peut être chiffré. Le responsable n'a saisi qu'un seul chiffre.");
  await souffle(3400);

  await page.evaluate(() => [...document.querySelectorAll("h2, h3")]
    .find((n) => /^Chiffrage/.test(n.textContent ?? ""))
    ?.scrollIntoView({ behavior: "smooth", block: "center" })).catch(() => undefined);
  await souffle(1500);
  await page.click('form:has([name="score_charge"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  await legende(page, C,
    "Et le barème parle aussitôt : l'intervalle de prix est calculé sur les réponses de la cliente. C'est l'objet du flux suivant.");
  await souffle(4200);
});

await chapitre("ce que ce flux change", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Douze réponses données une fois, zéro ressaisie",
    sous: "Les questions viennent du référentiel, le client y répond sur le site, et sa qualification s'ouvre remplie. Flux suivant : la proforma et sa justification.",
  }, 9500);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Flux 1 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
