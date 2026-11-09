/**
 * CREATION D'ENTREPRISE · FLUX 3 — LE REGLEMENT, ET CELLE QUI L'ENCAISSE.
 *
 * Le client accepte et peut regler en ligne ; la responsable de caisse constate
 * les versements recus au guichet ; le dossier s'ouvre tout seul.
 *
 *     PRISE=1 node flux-3-paiement-et-caisse.mjs
 *
 * ⚠️ Se tourne sur une pile de demonstration NEUVE, amorcee APRES le 14 octobre
 * 2026 : le compte de la caissiere n'existe pas dans une base plus ancienne.
 *
 * ⚠️ LE PAIEMENT PAR MOBILE MONEY N'EST PAS JOUE, a la demande du cabinet : sans
 * identifiants marchands la plateforme tourne en mode simule. L'ecran est montre,
 * le geste ne l'est pas, et la video le dit.
 */
import {
  VITRINE, CONSOLE, COURRIER, souffle, carton, legende, aller, descendre, remonter,
  projecteur, saisir, seConnecter, chapitre, lecture, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/flux-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const CLIENTE = { nom: "ABENA Solange", telephone: "+237677334455", courriel: "solange.abena@exemple.cm" };
const PROJET = [
  ["denomination_souhaitee", "ABENA TRAITEUR SARL"], ["associes", "2"], ["capital_social", "1000000"],
  ["apports_en_nature", "non", true], ["chiffre_affaires_prevu", "MOINS_10M", true],
  ["salaries_prevus", "3"], ["region_siege", "CENTRE", true], ["siege", "Bastos, Yaoundé"],
  ["activite", "Restauration et traiteur"], ["statuts_apportes", "non", true],
  ["pieces_deja_reunies", "CNI des associés"],
];

async function lienDeLaProposition() {
  const liste = await (await fetch(`${COURRIER}/api/v1/messages`)).json();
  const message = liste.messages.find((m) => /Votre proposition/.test(m.Subject));
  const detail = await (await fetch(`${COURRIER}/api/v1/message/${message.ID}`)).json();
  return /href="([^"]*\/proforma\/[^"]*)"/.exec(detail.HTML)[1].replaceAll("&amp;", "&");
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Le règlement, et <em>celle qui l'encaisse</em>",
    sous: "Flux 3 sur 5. La cliente accepte et peut régler ; la responsable de caisse constate les versements ; le dossier s'ouvre sans autre geste.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("rappel · de la demande à la proforma", async () => {
  const C = "Rappel des flux 1 et 2";
  await aller(page, `${VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande`, C,
    "Madame ABENA dépose sa demande et dit son projet sur le site. Ce sont les deux flux précédents, joués ici en accéléré.");
  await page.locator("#demande").scrollIntoViewIfNeeded().catch(() => undefined);
  await page.fill("#demande-nom", CLIENTE.nom);
  await page.fill("#demande-tel", CLIENTE.telephone);
  await page.fill("#demande-courriel", CLIENTE.courriel);
  for (const [code, valeur, liste] of PROJET) {
    const champ = `#declaration-${code}`;
    await page.locator(champ).scrollIntoViewIfNeeded().catch(() => undefined);
    if (liste) await page.selectOption(champ, valeur);
    else await page.fill(champ, valeur);
    await souffle(170);
  }
  await page.locator("#demande-accord-whatsapp").check();
  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await souffle(500);
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await souffle(6500);

  await seConnecter(page, "p.moukouri@cga-brcg.cm", C,
    "La juriste confirme l'échange, enregistre la qualification déjà remplie, chiffre, et émet la proforma proposée.");
  await page.goto(`${CONSOLE}/fr/acquisition`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${CLIENTE.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(900);
  await legende(page, C,
    "La juriste confirme l'échange, enregistre la qualification déjà remplie, chiffre, et émet la proforma proposée.");
  await page.fill('input[name="commentaire"]', "Cliente jointe : projet confirmé.");
  await page.click('form:has(input[name="commentaire"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1100);
  await page.click('form:has([name^="q_"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1100);
  await page.click('form:has([name="score_charge"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1300);
  const E = "form.emission";
  await centrer(page.locator(`${E} .feuille__total`));
  await page.fill(`${E} input[name="motif"]`, "Formule avec suivi sur douze mois et DSF, demandée par la cliente.");
  await souffle(1500);
  await centrer(page.locator(`${E} button[type="submit"]`));
  await page.click(`${E} button[type="submit"]`, { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2600);
});

let lien = "";
await chapitre("1 · la cliente accepte, et peut régler", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "La cliente accepte, et on ne la fait plus attendre",
    sous: "Elle lisait « le cabinet revient vers vous pour le règlement ». Elle lit maintenant comment régler, tout de suite.",
  }, 7000);

  const C = "Chez la cliente";
  lien = await lienDeLaProposition();
  await aller(page, lien, C,
    "Madame ABENA ouvre le lien reçu par courriel. Sa proposition : 505 000 francs, avec le suivi sur douze mois et la DSF.");
  await souffle(2600);
  await centrer(page.locator('input[name="identite_declaree"]'));
  await saisir(page, 'input[name="identite_declaree"]', "ABENA Solange, gérante", { cadence: 36 });
  await page.check('input[name="engagement"]');
  await souffle(900);
  await page.click("button.proforma__valider");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  await centrer(page.locator("#paiement"));
  await legende(page, C,
    "Son accord donné, la page change d'elle-même : « Régler votre proposition ». Elle n'attend plus qu'on la rappelle.");
  await souffle(3400);
  await projecteur(page, "#paiement button", { tenir: 2800, centrer: false });
  await legende(page, C,
    "Un bouton demande le paiement par mobile money : l'opérateur pousse la demande sur son téléphone, et elle valide avec son code.");
  await souffle(3600);
  await legende(page, C,
    "La notification de l'opérateur constate alors le règlement, sans personne : c'est l'auto-validation. La page se met à jour seule.");
  await souffle(3600);
  await legende(page, C,
    "Ce geste n'est pas joué ici : la démonstration n'a pas d'identifiants marchands, et la plateforme ne simule jamais un paiement réussi.");
  await souffle(3800);
  await projecteur(page, ".proforma__autrement", { tenir: 2800 });
  await legende(page, C,
    "Elle peut aussi régler au cabinet, en espèces ou par virement. C'est ce que fait madame ABENA : suivons-la au guichet.");
  await souffle(3600);
});

await chapitre("2 · la caisse", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "La responsable de caisse, un rôle à part entière",
    sous: "Jusqu'ici seul l'administrateur pouvait constater un règlement. Un dixième rôle existe désormais : il encaisse, et ne voit rien d'autre.",
  }, 8000);

  const C = "À la caisse du cabinet";
  await seConnecter(page, "n.essama@cga-brcg.cm", C,
    "Nadège ESSAMA, responsable de caisse, se connecte avec le même écran que tout le monde.");
  await legende(page, C,
    "Elle arrive sur sa caisse, et son menu ne porte qu'une entrée. Les vues suivent le profil : ni dossiers, ni comptabilité, ni comptes.");
  await projecteur(page, "nav", { tenir: 2600, centrer: false }).catch(() => undefined);
  await souffle(3800);
  await legende(page, C,
    "En haut, ce qui est dû : madame ABENA, sa proposition, son montant. La caissière ne ressaisit rien, tout vient de la proposition acceptée.");
  await projecteur(page, ".caisse__ligne", { tenir: 2800, centrer: false });
  await souffle(3800);

  const F = ".caisse__constat";
  await saisir(page, `${F} input[name="reference_externe"]`, "Reçu de caisse n° 2026-0412", { cadence: 34 });
  await legende(page, C,
    "Deux choses seulement : la référence du reçu, que le rapprochement cherchera, et son attestation, qui engage son nom.");
  await page.locator(`${F} input[name="rapproche"]`).first().check();
  await souffle(2600);
  await projecteur(page, `${F} button`, { tenir: 1600, centrer: false });
  await page.locator(`${F} button`).first().click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2600);
  await legende(page, C,
    "Encaissé. La ligne a quitté la file et rejoint le journal du jour, et le total encaissé a suivi.");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  await legende(page, C,
    "Encaissé. La ligne a quitté la file et rejoint le journal du jour, et le total encaissé a suivi.");
  await projecteur(page, ".caisse__ligne--reglee", { tenir: 2600 }).catch(() => undefined);
  await souffle(3200);
  await legende(page, C,
    "Un paiement par mobile money arriverait ici tout seul, déjà « encaissé » : le rapprochement de la caisse est automatique.");
  await souffle(3800);
});

await chapitre("3 · ce que le règlement déclenche", async () => {
  await carton(page, {
    type: "chapitre", num: "Troisième temps",
    titre: "Personne d'autre n'a rien à faire",
    sous: "Le constat de la caissière suffit. Trois choses se produisent sans intervention : la page de la cliente, son courriel, son dossier de formalité.",
  }, 8000);

  const C = "Ce que le règlement déclenche";
  await aller(page, lien, C,
    "La page de la cliente, rouverte : « Règlement constaté ». Elle n'a appelé personne pour le savoir.");
  await centrer(page.locator("main.proforma h2").filter({ hasText: /Règlement constaté/ }));
  await souffle(3800);

  await aller(page, COURRIER, C,
    "Sa boîte : l'accusé de sa demande, sa proposition, la confirmation de son accord, et l'ouverture de son dossier.");
  await souffle(3000);
  await lecture();
  await page.click("text=/est ouvert/", { timeout: 8000 }).catch(() => undefined);
  await souffle(2400);
  await legende(page, C,
    "Le dernier lui annonce que son dossier de création est ouvert, avec le lien qui lui permet de le suivre.");
  await souffle(3800);

  await seConnecter(page, "p.moukouri@cga-brcg.cm", C,
    "Et la chargée de formalités, sans que la caisse l'ait prévenue :");
  await aller(page, `${CONSOLE}/fr/creation-entreprise`, C,
    "ABENA TRAITEUR SARL est dans son pipeline. Le dossier est né du règlement, avec le nom, la forme et le siège dits par la cliente au flux 1.");
  await projecteur(page, 'a:has-text("ABENA TRAITEUR")', { tenir: 3000 });
  await souffle(4200);
});

await chapitre("ce que ce flux change", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Celle qui chiffre n'encaisse pas, celle qui encaisse ne voit que sa caisse",
    sous: "Un règlement en ligne prêt à brancher, un guichet tenu par un rôle dédié, un rapprochement sans saisie. Flux suivant : le compte de la cliente et son suivi.",
  }, 10000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Flux 3 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
