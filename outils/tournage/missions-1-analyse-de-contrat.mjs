/**
 * PRESTATIONS PONCTUELLES · FLUX 1 — L'ANALYSE D'UN CONTRAT, L'HUMAIN DANS LA BOUCLE.
 *
 * La juriste ouvre une mission et y verse le contrat ; chaque point d'analyse attend sa
 * décision (retenir, reformuler, écarter) ; elle soumet ; la directrice valide ; le
 * livrable ne porte que ce qui a été retenu.
 *
 *     PRISE=1 node missions-1-analyse-de-contrat.mjs
 *
 * ⚠️ L'AGENT N'EST PAS JOUÉ : la pile de démonstration n'a pas de clé d'API, et l'écran le
 * dit. La juriste saisit ses points dans la structure que l'agent remplit quand la clé est
 * posée. Le contrat est un SPÉCIMEN fictif (`pieces/contrat-bail-specimen.pdf`).
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/missions-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const CONTRAT = new URL("./pieces/contrat-bail-specimen.pdf", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const JURISTE = "p.moukouri@cga-brcg.cm";
const DIRECTRICE = "b.mballa@cga-brcg.cm";
let adresseMission = "";

const POINTS = [
  {
    rubrique: "CLAUSE_A_RISQUE", gravite: "ELEVEE", titre: "Résiliation unilatérale en quinze jours",
    texte: "Le bailleur peut résilier à tout moment, sans indemnité, avec quinze jours de préavis ; le preneur ne le peut qu'à chaque période triennale.",
    citation: "Le Bailleur pourra résilier le présent bail à tout moment, sans indemnité",
  },
  {
    rubrique: "CLAUSE_A_RISQUE", gravite: "ELEVEE", titre: "Juridiction à Paris",
    texte: "Un litige devrait être porté devant les tribunaux de Paris, pour un bien et des parties situés à Douala.",
    citation: "compétence exclusive des tribunaux de Paris",
  },
  {
    rubrique: "RECOMMANDATION", gravite: "", titre: "À renégocier avant signature",
    texte: "Obtenir un préavis réciproque d'au moins six mois, la compétence des juridictions de Douala et un plafond aux pénalités de retard.",
    citation: "",
  },
];

async function ajouterLePoint(p) {
  const f = page.locator(".mission__ajout");
  await f.locator('select[name="rubrique"]').selectOption(p.rubrique);
  if (p.gravite) await f.locator('select[name="gravite"]').selectOption(p.gravite);
  await saisir(page, '.mission__ajout input[name="titre"]', p.titre, { cadence: 14 });
  await f.locator('textarea[name="texte"]').fill(p.texte);
  if (p.citation) await f.locator('textarea[name="citation"]').fill(p.citation);
  await souffle(900);
  await f.getByRole("button", { name: "Ajouter", exact: true }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1600);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Prestations ponctuelles",
    titre: "L'analyse d'un contrat, <em>l'humain dans la boucle</em>",
    sous: "L'agent propose, le juriste décide de chaque point, un second valide. Le client ne reçoit que ce qui a été retenu.",
    pied: "Présentation de l'avancement du développement · 15 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · la juriste ouvre la mission", async () => {
  const C = "Chez la juriste";
  await seConnecter(page, JURISTE, C,
    "Patricia MOUKOURI, juriste du cabinet. Bâtiment Plus lui confie un bail avant de le signer.");
  await aller(page, `${CONSOLE}/fr/missions`, C,
    "Un menu nouveau : les prestations ponctuelles. Ce qui suit la vente d'une analyse ou d'une rédaction de contrat.");
  await page.locator('input[name="objet"]').fill("");
  await saisir(page, 'input[name="objet"]', "Bail du dépôt de Bonabéri, avant signature", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "SARL BATIMENT PLUS", { cadence: 18 });
  await page.locator('input[name="client_courriel"]').fill("jp.nkoa@batimentplus.cm");
  await page.locator('input[name="fichier"]').setInputFiles(CONTRAT);
  await souffle(1600);
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  adresseMission = page.url();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.waitForSelector(".apercu-pdf__page", { timeout: 20000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "La mission est ouverte : le contrat à gauche, l'analyse à droite.");
  await souffle(4200);
});

await chapitre("2 · des points, chacun à décider", async () => {
  const C = "L'analyse";
  await projecteur(page, ".mission__agent", { tenir: 2600 });
  await legende(page, C,
    "Avec la clé d'API du cabinet, « Lire avec l'agent » prépare ces points. Ici, la juriste les saisit : la structure est la même.");
  await souffle(5600);
  await page.getByRole("button", { name: "+ Ajouter un point à la main" }).click();
  await souffle(800);
  for (const p of POINTS) await ajouterLePoint(p);
  await centrer(page.locator(".mission__points"));
  await legende(page, C,
    "Trois points, tous « à décider » : rien ne part au client sans que la juriste l'ait retenu, reformulé ou écarté.");
  await souffle(5200);
  const points = page.locator(".mission__point");
  await points.nth(0).getByRole("button", { name: "Retenir" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1400);
  await page.locator(".mission__point").nth(1).getByRole("button", { name: "Retenir" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1400);
  const troisieme = page.locator(".mission__point").nth(2);
  await centrer(troisieme);
  await troisieme.getByRole("button", { name: "Reformuler" }).click();
  await troisieme.locator('textarea[name="texte_retenu"]').fill(
    "Avant de signer, obtenir : un préavis réciproque d'au moins six mois, la compétence des tribunaux de Douala, et des pénalités de retard plafonnées à 10 % du loyer mensuel.",
  );
  await legende(page, C, "Elle reformule la recommandation : c'est son texte qui ira au client, pas celui de la proposition.");
  await souffle(3800);
  await troisieme.getByRole("button", { name: "Retenir ainsi" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2000);
});

await chapitre("3 · soumise au second regard", async () => {
  const C = "Chez la juriste";
  await centrer(page.getByRole("button", { name: "Soumettre au second regard" }));
  await legende(page, C, "Tous les points sont décidés : elle soumet. Elle ne pourra pas valider elle-même.");
  await souffle(3600);
  await page.getByRole("button", { name: "Soumettre au second regard" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2400);
});

await chapitre("4 · la directrice valide, le livrable part", async () => {
  const C = "Le second regard";
  await seConnecter(page, DIRECTRICE, C, "Bernadette MBALLA, directrice, relit la mission.");
  await aller(page, adresseMission, C, null);
  await centrer(page.getByRole("button", { name: "Valider et livrer" }));
  await legende(page, C, "Elle peut valider, ou renvoyer à la juriste avec un motif.");
  await souffle(3800);
  await page.getByRole("button", { name: "Valider et livrer" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2200);
  const lien = page.getByRole("link", { name: /livrable/ });
  const href = await lien.getAttribute("href");
  await page.goto(`${CONSOLE}${href}`, { waitUntil: "load" });
  await souffle(2500);
  await legende(page, C,
    "Le livrable : les seuls points retenus, dans les mots de la juriste, avec l'extrait du contrat sur lequel chacun repose. Validé, il ne porte plus « PROJET ».");
  await souffle(6500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "L'agent propose, le cabinet signe",
    sous: "Chaque point passe par une décision humaine, puis par un second regard. La rédaction de contrat et la DSF ciblée suivront la même mission.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
