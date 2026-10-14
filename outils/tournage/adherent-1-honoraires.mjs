/**
 * ESPACE ADHERENT · FLUX 1 — SES HONORAIRES, REGLES EN LIGNE OU AU GUICHET.
 *
 * La direction fixe le contrat ; l'adherent lit son echeancier et peut regler par
 * mobile money ; la responsable de caisse constate un reglement au guichet ; la
 * ligne de l'adherent change d'etat.
 *
 *     PRISE=1 node adherent-1-honoraires.mjs
 *
 * ⚠️ Pile NEUVE construite apres le 14 octobre 2026 : les contrats de
 * demonstration sont dates du jour de l'amorcage.
 *
 * ⚠️ LE DEBIT MOBILE MONEY N'EST PAS JOUE, comme convenu avec le cabinet pour le
 * flux 3 de la creation : l'ecran est montre, la video le dit.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter,
  chapitre, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/adherent-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "Ses honoraires, <em>réglés en ligne ou au guichet</em>",
    sous: "Flux 1 sur 3. Le contrat fixé par la direction, l'échéancier de l'adhérent, le mobile money, et la caisse qui constate.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la direction fixe le contrat", async () => {
  const C = "À la direction";
  await seConnecter(page, "b.mballa@cga-brcg.cm", C,
    "Bernadette MBALLA, directrice, ouvre le dossier de SARL Bâtiment Plus.");
  await aller(page, `${CONSOLE}/fr/portefeuille/${BATIMENT}`, C,
    "Sur la fiche de l'entreprise, un panneau nouveau : les honoraires convenus avec l'adhérent.");
  const panneau = page.locator("section, div").filter({ has: page.getByRole("heading", { name: "Honoraires" }) }).last();
  await centrer(page.getByRole("heading", { name: "Honoraires" }));
  await souffle(1200);
  await legende(page, C,
    "45 000 francs par mois, payables en début de mois. Le dossier doit 90 000 francs, dont un mois en retard.");
  await projecteur(page, ".contrat-honoraires", { tenir: 2600, centrer: false });
  await souffle(3800);
  await legende(page, C,
    "C'est la direction qui fixe le montant : la caisse encaisse, elle ne fixe rien. Ce contrat produit l'échéancier de l'adhérent.");
  await souffle(4400);
  void panneau;
});

await chapitre("2 · l'adhérent lit ce qu'il doit", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "Ce que je dois, et comment le régler",
    sous: "Jusqu'ici, l'espace adhérent ne disait rien des honoraires. Un onglet nouveau : l'échéancier complet, et le règlement.",
  }, 8000);

  const C = "Chez l'adhérent";
  await seConnecter(page, "jp.nkoa@batimentplus.cm", C,
    "Jean-Pierre NKOA, gérant de Bâtiment Plus, se connecte à son espace.");
  await aller(page, `${CONSOLE}/fr/mon-espace/honoraires`, C,
    "L'onglet « Honoraires » : en tête, ce qui est à régler aujourd'hui.");
  await souffle(1600);
  await projecteur(page, ".honoraires__resume", { tenir: 2800 });
  await legende(page, C,
    "90 000 francs, dont une période en retard. Puis chaque période due, avec son état : « En retard », « À régler ».");
  await souffle(4200);
  await centrer(page.locator(".honoraires__liste").last());
  await legende(page, C,
    "Plus bas, l'échéancier : les mois réglés, avec la date, le canal (au guichet ou par mobile money) et la référence du reçu.");
  await souffle(4800);

  await centrer(page.locator('.honoraires__ligne[data-etat="A_REGLER"]').first());
  await page.locator('.honoraires__ligne[data-etat="A_REGLER"] .honoraires__payer').first().click();
  await souffle(800);
  await saisir(page, '.honoraires__ligne[data-etat="A_REGLER"] input[name="telephone"]', "655102030", { cadence: 60 });
  await legende(page, C,
    "Pour octobre, il choisit le mobile money et indique son numéro. L'opérateur pousse la demande sur son téléphone, il valide avec son code.");
  await souffle(3800);
  await page.locator('.honoraires__ligne[data-etat="A_REGLER"] button[type="submit"]').first().click();
  await page.waitForSelector(".honoraires__attente", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".honoraires__attente"));
  await legende(page, C,
    "C'est la notification de l'opérateur qui règle la période, sans personne, et la page se met à jour seule.");
  await souffle(4200);
  await legende(page, C,
    "Ce geste n'est pas joué ici : la démonstration n'a pas d'identifiants marchands, et la page le dit. Il règle septembre au cabinet.");
  await souffle(4600);
});

await chapitre("3 · la caisse constate", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "Au guichet, la caisse constate",
    sous: "La caisse avait les propositions acceptées ; elle a maintenant les honoraires des adhérents, le retard en tête.",
  }, 8000);

  const C = "À la caisse";
  await seConnecter(page, "n.essama@cga-brcg.cm", C,
    "Nadège ESSAMA, responsable de caisse.");
  const panneau = page.getByRole("heading", { name: "Honoraires des adhérents" });
  await centrer(panneau);
  await legende(page, C,
    "« Honoraires des adhérents » : Bâtiment Plus, septembre, en retard. Le montant vient du contrat : elle ne le tape pas.");
  const ligne = page.locator("li.caisse__ligne", { hasText: "SARL BATIMENT PLUS" })
    .filter({ has: page.locator('.caisse__etat[data-etat="EN_RETARD"]') }).first();
  await centrer(ligne);
  await souffle(3800);
  await saisir(page, `li.caisse__ligne:has(.caisse__etat[data-etat="EN_RETARD"]) input[name="reference_externe"]`, "Reçu de caisse n° 2026-0521", { cadence: 34 });
  await ligne.locator('input[name="rapproche"]').check();
  await legende(page, C,
    "La référence du reçu, et son attestation. Encaisser.");
  await souffle(2400);
  await ligne.locator('button[type="submit"]').click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2000);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator("li.caisse__ligne--reglee", { hasText: "Reçu de caisse n° 2026-0521" }));
  await legende(page, C,
    "Réglé au guichet. Un règlement par mobile money arriverait ici tout seul, déjà « Réglé » : le rapprochement est automatique.");
  await souffle(4800);
});

await chapitre("4 · la ligne de l'adhérent a changé", async () => {
  const C = "Chez l'adhérent";
  await seConnecter(page, "jp.nkoa@batimentplus.cm", C, null);
  await aller(page, `${CONSOLE}/fr/mon-espace/honoraires`, C,
    "Monsieur NKOA rouvre ses honoraires : plus de retard, il reste octobre à régler.");
  await projecteur(page, ".honoraires__resume", { tenir: 2600 });
  await souffle(2600);
  await centrer(page.locator(".honoraires__ligne", { hasText: "Reçu de caisse n° 2026-0521" }));
  await legende(page, C,
    "Septembre : « Réglée au guichet », avec le numéro du reçu. Personne n'a eu à le lui écrire.");
  await souffle(4800);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Un montant convenu, un échéancier lisible, deux façons de régler",
    sous: "La direction fixe, l'adhérent voit et règle, la caisse constate, et une période ne se règle jamais deux fois. Flux suivant : la TVA et la CNPS.",
  }, 10000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Espace adhérent",
    titre: "Flux 1 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
