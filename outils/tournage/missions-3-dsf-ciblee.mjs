/**
 * PRESTATIONS PONCTUELLES · FLUX 3 — LA DSF CIBLÉE, LA MÊME MISSION.
 *
 * Un cabinet confie au centre la seule DSF de son exercice. La réviseure ouvre une mission
 * « DSF ciblée » sur le dossier et l'exercice ; la DSF se prépare dans son parcours (le
 * même que pour un adhérent) ; la mission porte les constats et recommandations au client,
 * chacun décidé ; la directrice valide ; le livrable ne porte que ce qui a été retenu.
 *
 *     PRISE=1 node missions-3-dsf-ciblee.mjs
 *
 * ⚠️ L'AGENT N'EST PAS JOUÉ : la pile de démonstration n'a pas de clé d'API. Les constats
 * sont saisis à la main, dans la structure que l'agent remplit quand la clé est posée.
 * La DSF n'est que préparée ici : sa validation et son dépôt ont leur propre flux (DSF 1).
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/missions-3-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const NGUEMA = "P027788990011M";
const REVISEUSE = "a.bouba@cga-brcg.cm";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
let adresseMission = "";

const POINTS = [
  {
    rubrique: "RESUME", gravite: "", titre: "DSF 2025 préparée sur la balance arrêtée",
    texte: "Résultat comptable 27 520 000 FCFA ; résultat fiscal 13 760 000 FCFA après l'abattement de 50 % ouvert par l'adhésion au CGA. Les contrôles de la liasse sont passés ; les à-nouveaux 2026 concordent.",
  },
  {
    rubrique: "MANQUE", gravite: "MOYENNE", titre: "Liste des clients et fournisseurs à joindre",
    texte: "Les annexes nominatives (clients et fournisseurs au-delà du seuil) ne sont pas encore produites : à fournir par le cabinet avant le dépôt.",
  },
  {
    rubrique: "RECOMMANDATION", gravite: "", titre: "Régulariser l'IGS avant le dépôt",
    texte: "L'échéancier montre un acompte d'IGS réglé hors délai : régulariser les pénalités avant le dépôt de la DSF, pour ne pas les voir relevées au contrôle.",
  },
];

async function ajouterLePoint(p) {
  const f = page.locator(".mission__ajout");
  await f.locator('select[name="rubrique"]').selectOption(p.rubrique);
  if (p.gravite) await f.locator('select[name="gravite"]').selectOption(p.gravite);
  await saisir(page, '.mission__ajout input[name="titre"]', p.titre, { cadence: 14 });
  await f.locator('textarea[name="texte"]').fill(p.texte);
  await souffle(900);
  await f.getByRole("button", { name: "Ajouter", exact: true }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1600);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Prestations ponctuelles",
    titre: "La DSF ciblée, <em>dans la même mission</em>",
    sous: "Un client confie la seule DSF de son exercice. Elle se prépare dans son parcours ; les constats au client passent chacun par une décision, puis par un second regard.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la réviseure ouvre la mission", async () => {
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUSE, C,
    "Aïcha BOUBA, réviseure. Le Cabinet NGUEMA Conseil confie au centre sa seule DSF 2025.");
  await aller(page, `${CONSOLE}/fr/missions`, C,
    "Les prestations ponctuelles : la DSF ciblée est le troisième type de mission, après l'analyse et la rédaction de contrat.");
  await page.locator('select[name="type"]').selectOption("DSF_CIBLEE");
  await souffle(1200);
  await saisir(page, 'input[name="objet"]', "DSF 2025 du Cabinet NGUEMA Conseil", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "CABINET NGUEMA CONSEIL", { cadence: 18 });
  await saisir(page, 'input[name="dossier_niu"]', NGUEMA, { cadence: 22 });
  await saisir(page, 'input[name="exercice"]', "2025", { cadence: 60 });
  await legende(page, C, "Pour une DSF ciblée, la mission demande le dossier et l'exercice : c'est la DSF de ce dossier qui sera préparée, pas une copie.");
  await souffle(4200);
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  adresseMission = page.url();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await projecteur(page, ".mission__agent", { tenir: 2600 });
  await legende(page, C, "La mission renvoie au parcours de la DSF du dossier, et garde ici les constats destinés au client.");
  await souffle(4800);
});

await chapitre("2 · la DSF se prépare dans son parcours", async () => {
  const C = "La DSF 2025";
  await Promise.all([
    page.waitForURL(/cloture/, { timeout: 25000 }),
    page.getByRole("link", { name: /Ouvrir la DSF 2025/ }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.getByRole("heading", { name: "Déclaration statistique et fiscale" }));
  await legende(page, C, "Le même parcours que pour un adhérent : contrôles, préparation, aperçu, puis validation par un second et dépôt.");
  await souffle(4600);
  await page.getByRole("button", { name: "Préparer la DSF" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2200);
  await centrer(page.locator(".dsf"));
  await legende(page, C, "Préparée : version 1, résultat fiscal après l'abattement CGA de 50 %. Un autre réviseur la validera ; le dépôt a sa propre présentation.");
  await souffle(5200);
});

await chapitre("3 · les constats, chacun décidé", async () => {
  const C = "Les constats au client";
  await aller(page, adresseMission, C, "Retour à la mission : ce que le client lira avec sa DSF.");
  await page.getByRole("button", { name: "+ Ajouter un point à la main" }).click();
  await souffle(800);
  for (const p of POINTS) await ajouterLePoint(p);
  await centrer(page.locator(".mission__points"));
  await legende(page, C, "Trois constats, tous « à décider » : rien ne part au client sans une décision.");
  await souffle(4600);
  for (let i = 0; i < POINTS.length; i += 1) {
    const point = page.locator(".mission__point").nth(i);
    await centrer(point);
    await point.getByRole("button", { name: "Retenir" }).click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await souffle(1300);
  }
  await centrer(page.getByRole("button", { name: "Soumettre au second regard" }));
  await legende(page, C, "Tous retenus : elle soumet au second regard.");
  await souffle(3200);
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
});

await chapitre("4 · la directrice valide, le livrable part", async () => {
  const C = "Le second regard";
  await seConnecter(page, DIRECTRICE, C, "Bernadette MBALLA, directrice, relit la mission.");
  await aller(page, adresseMission, C, null);
  await centrer(page.getByRole("button", { name: "Valider et livrer" }));
  await legende(page, C, "Elle valide, ou renvoie à la réviseure avec un motif.");
  await souffle(3600);
  await page.getByRole("button", { name: "Valider et livrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  const href = await page.getByRole("link", { name: /livrable/ }).getAttribute("href");
  await page.goto(`${CONSOLE}${href}`, { waitUntil: "load" });
  await souffle(2500);
  await legende(page, C, "Le livrable au client : les constats retenus, validé, sans la mention « PROJET ».");
  await souffle(6500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Une DSF vendue seule, sans parcours à part",
    sous: "La DSF ciblée emprunte le parcours de la DSF du dossier ; la mission y ajoute les constats au client, décidés un à un et validés par un second.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
