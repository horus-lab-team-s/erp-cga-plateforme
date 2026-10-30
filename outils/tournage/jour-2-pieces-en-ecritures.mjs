/**
 * MISES À JOUR DU 18 OCTOBRE 2026 · FILM 2 — DE LA PIÈCE REÇUE À L'ÉCRITURE PROPOSÉE.
 *
 * Deux cas, chacun « ce qui arrive, ce que la plateforme en fait, le résultat » :
 *
 * 1. La quittance. L'adhérent a payé sa TVA de juillet lui-même ; il envoie la quittance
 *    depuis son espace, et la voit avant de l'envoyer. La réviseure la lit, la valide
 *    avec son montant ; l'écriture de paiement se propose. L'adhérent lit « Payée ».
 * 2. La facture. Reçue par WhatsApp, importée par le comptable. Il ne tape que le TTC :
 *    le HT et la TVA s'en déduisent. Contrôle du NIU, écriture d'achat, brouillon.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 PRISE=1 node jour-2-pieces-en-ecritures.mjs
 *
 * ⚠️ Pile NEUVE. Les pièces sont des SPÉCIMENS.
 * ⚠️ LA LECTURE PAR L'AGENT N'EST PAS JOUÉE : ce poste n'a pas de clé d'API. La vidéo le
 * dit, et montre la voie qui marche toujours, la saisie assistée.
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/jour-2-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const QUITTANCE = new URL("./pieces/quittance-tva-specimen.jpg", import.meta.url).pathname;
const FACTURE = new URL("./pieces/facture-quincaillerie-specimen.jpg", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";

const BATIMENT = "M081234567890P";
const ADHERENT = "jp.nkoa@batimentplus.cm";
const REVISEUR = "a.bouba@cga-brcg.cm";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const COMMENTAIRE = "Facture Quincaillerie du Wouri, reçue par WhatsApp";
const F = ".lecture__formulaire";

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Mises à jour du 18 octobre 2026",
    titre: "De la pièce reçue <em>à l'écriture proposée</em>",
    sous: "Une quittance envoyée par l'adhérent, une facture reçue par WhatsApp : ce qui arrive, ce que la plateforme en fait, et l'écriture qui en sort, prête à valider.",
    pied: `Démonstration jouée en direct sur la solution · 18 octobre 2026<br>${PIED}`,
  }, 11000);
});

// ── Premier cas : la quittance ──────────────────────────────────────────────────

await chapitre("1 · ce qui arrive : une quittance de TVA", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier cas · ce qui arrive",
    titre: "Il a payé sa TVA lui-même, il envoie la quittance",
    sous: "Depuis son espace, une photo ou un PDF. Il voit ce qu'il envoie avant de l'envoyer : une mauvaise page se voit tout de suite, pas au cabinet trois jours plus tard.",
  }, 9000);
  const C = "Chez l'adhérent";
  await seConnecter(page, ADHERENT, C, "Jean-Pierre NKOA ouvre ses échéances.");
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, C,
    "La TVA de juillet est en retard. Il l'a réglée lui-même, en ligne.");
  await Promise.all([
    page.waitForURL(/echeance=/, { timeout: 15000 }),
    page.locator(".adherent__echeances a", { hasText: /valeur ajoutée|TVA/ }).first().click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator('input[name="fichier"]'));
  await page.locator('input[name="fichier"]').setInputFiles(QUITTANCE);
  await souffle(1600);
  await centrer(page.locator(".apercu-envoi"));
  await projecteur(page, ".apercu-envoi", { tenir: 3000, centrer: false });
  await legende(page, C,
    "La quittance s'affiche avant de partir : c'est bien la bonne, juillet, 84 000 francs.");
  await souffle(4600);
  await page.locator(".adherent__depot-envoyer").click();
  await page.getByText(/Preuve envoyée/).first().waitFor({ timeout: 20000 }).catch(() => undefined);
  await centrer(page.getByText(/Preuve envoyée/).first());
  await legende(page, C, "Envoyée. Le cabinet la vérifie, puis la joint à la déclaration.");
  await souffle(3600);
});

await chapitre("2 · ce que la plateforme en fait : la vérifier", async () => {
  const C = "Chez la réviseure";
  await seConnecter(page, REVISEUR, C, "Aïcha BOUBA, réviseure, ouvre l'échéancier de Bâtiment Plus.");
  await aller(page, `${CONSOLE}/fr/obligations?dossier=${BATIMENT}`, C,
    "« Preuves de paiement envoyées par l'adhérent » : la quittance de TVA attend son verdict.");
  const tva = page.locator("li", { hasText: /valeur ajoutée/ }).filter({ has: page.locator(".juger-quittance") }).first();
  await centrer(tva);
  await tva.locator(".document-piece button", { hasText: "Aperçu" }).click().catch(() => undefined);
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(tva.locator(".document-piece__apercu"));
  await legende(page, C, "Elle la lit sans quitter l'écran : TVA de juillet, Bâtiment Plus, 84 000 francs.");
  await souffle(4600);
  await centrer(tva.locator(".juger-quittance"));
  await saisir(page, 'li:has(.juger-quittance) input[name="montant_quittance"]', "84000", { cadence: 60 });
  await legende(page, C, "Elle relève le montant de la quittance, et la valide.");
  await souffle(3000);
  await tva.locator('button[value="VALIDEE"]').click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(2200);
});

await chapitre("3 · le résultat : l'écriture de paiement", async () => {
  const C = "Chez la réviseure";
  const formulaire = page.locator("form.juger-quittance", { has: page.locator('select[name="compte_tresorerie"]') }).first();
  await centrer(formulaire);
  await legende(page, C,
    "La quittance validée propose aussitôt son écriture : l'État au débit, la trésorerie qui a payé au crédit.");
  await souffle(4400);
  await formulaire.locator('select[name="compte_tresorerie"]').selectOption("5231");
  await legende(page, C, "Payée par mobile money : le compte 5231.");
  await souffle(2600);
  await formulaire.locator("button[type=submit]").click();
  const confirmation = page.getByRole("status").filter({ hasText: /écriture de paiement passée/ }).first();
  await confirmation.waitFor({ timeout: 20000 }).catch(() => undefined);
  await centrer(confirmation);
  await legende(page, C,
    "Écriture passée en brouillon, citant la quittance : le comptable la relit et la valide. Personne ne l'a retapée.");
  await souffle(4600);
  await seConnecter(page, ADHERENT, "Chez l'adhérent", null);
  await aller(page, `${CONSOLE}/fr/mon-espace/echeances`, "Chez l'adhérent",
    "Et chez l'adhérent, la TVA de juillet : « Payée : quittance vérifiée par le cabinet ».");
  await projecteur(page, '.adherent__echeances li[data-etat="PAYEE"]', { tenir: 3000 });
  await souffle(4200);
});

// ── Second cas : la facture ─────────────────────────────────────────────────────

await chapitre("4 · ce qui arrive : une facture par WhatsApp", async () => {
  await carton(page, {
    type: "chapitre", num: "Second cas · ce qui arrive",
    titre: "Une facture reçue par WhatsApp",
    sous: "Le comptable l'importe au dossier. Il ne tape que ce qui est écrit en bas : le total TTC. Le reste se déduit, et se vérifie.",
  }, 8500);
  const C = "Chez le comptable";
  await seConnecter(page, COMPTABLE, C,
    "Léonard FOTSO, comptable de Bâtiment Plus, a reçu une facture fournisseur par WhatsApp.");
  await aller(page, `${CONSOLE}/fr/pieces`, C, "Il l'importe dans les pièces justificatives du dossier.");
  await page.getByRole("button", { name: "Importer des pièces" }).click();
  await souffle(800);
  await page.locator('select[name="dossier"]').selectOption(BATIMENT);
  await page.locator('input[name="fichier"]').setInputFiles(FACTURE);
  await page.locator('input[name="commentaire"]').fill(COMMENTAIRE);
  await souffle(1800);
  await legende(page, C, "Lui aussi voit la pièce avant de l'enregistrer.");
  await souffle(2600);
  await page.getByRole("button", { name: "Enregistrer la pièce" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1800);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const details = page.locator("details", { hasText: "à identifier" }).first();
  await details.locator("summary").click();
  const ligne = details.locator("div", { hasText: COMMENTAIRE }).first();
  await centrer(ligne);
  await souffle(1800);
  await Promise.all([
    page.waitForURL(/pieces\/facture\//, { timeout: 15000 }),
    ligne.getByRole("link", { name: /Lire la facture/ }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
});

await chapitre("5 · ce que la plateforme en fait : le TTC suffit", async () => {
  const C = "La lecture";
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "La facture à gauche, ce qu'il faut en retenir à droite. L'agent ChatGPT peut remplir ces champs (volet des agents) ; ici, la saisie assistée.");
  await souffle(5200);
  await saisir(page, `${F} label:has-text("Fournisseur") input`, "QUINCAILLERIE DU WOURI SARL", { cadence: 18 });
  await saisir(page, `${F} label:has-text("NIU du fournisseur") input`, "M091234567890Q", { cadence: 30 });
  await saisir(page, `${F} label:has-text("N° de facture") input`, "FA-2026-0815", { cadence: 30 });
  await page.locator(`${F} input[type="date"]`).fill("2026-09-12");
  await saisir(page, `${F} input[aria-label="Ligne 1 : désignation"]`, "Ciment et fer à béton", { cadence: 18 });
  await saisir(page, `${F} .lecture__trois label:nth-child(3) input`, "178875", { cadence: 40 });
  await legende(page, C, "Il ne tape que le total TTC : 178 875 francs.");
  await souffle(2800);
  await page.locator(".lecture__depuis-ttc").click();
  await souffle(900);
  await centrer(page.locator(".lecture__trois"));
  await projecteur(page, `${F} .lecture__trois`, { tenir: 3000, centrer: false });
  await legende(page, C,
    "« Calculer HT et TVA depuis le TTC » : 150 000 HT, 28 875 de TVA à 19,25 %. Il corrige si la facture est exonérée.");
  await souffle(5200);
  await page.locator(`${F} input[aria-label="Ligne 1 : montant HT"]`).fill("");
  await saisir(page, `${F} input[aria-label="Ligne 1 : montant HT"]`, "150000", { cadence: 30 });
  await souffle(1200);
  await page.getByRole("button", { name: "Enregistrer la facture" }).click();
  await page.waitForSelector('.lecture__message[data-ton="fait"]', { timeout: 15000 }).catch(() => undefined);
  await souffle(1800);
  await page.getByRole("button", { name: "Proposer l'écriture" }).click();
  await page.waitForSelector(".lecture__empechements", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".lecture__empechements"));
  await legende(page, C,
    "Le contrôle s'arrête sur une chose : le NIU du fournisseur n'est pas vérifié. Sans lui, ni la TVA ni la charge ne se déduisent.");
  await souffle(5000);
  await centrer(page.locator(".lecture__case"));
  await page.locator(".lecture__case input").check();
  await legende(page, C, "Il le vérifie sur le portail de la DGI, et l'atteste.");
  await souffle(3200);
  await page.getByRole("button", { name: "Enregistrer la facture" }).click();
  await page.waitForSelector('.lecture__message[data-ton="fait"]', { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
});

await chapitre("6 · le résultat : l'écriture d'achat", async () => {
  const C = "L'écriture";
  await page.getByRole("button", { name: "Proposer l'écriture" }).click();
  await page.waitForSelector(".lecture__ecriture", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".lecture__ecriture"));
  await legende(page, C,
    "La charge au débit, la TVA déductible en 4451, le fournisseur en 401 avec son NIU : 178 875 francs, équilibrée.");
  await souffle(6000);
  // ⚠️ AIDE DE TOURNAGE, PAS DU PRODUIT : de la marge sous la page, pour que la fin ne
  // passe pas sous la bande de légende.
  await page.addStyleTag({ content: ".page-travail { padding-bottom: 220px !important; }" });
  await page.getByRole("button", { name: "Enregistrer en brouillon" }).click();
  await page.waitForSelector(".lecture__proposition .lecture__accord", { timeout: 20000 }).catch(() => undefined);
  await page.mouse.wheel(0, 400);
  await souffle(900);
  await page.locator(".lecture__proposition .lecture__accord").evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "start" })).catch(() => undefined);
  await souffle(900);
  await legende(page, C, "Brouillon numéroté : il se relit et se valide. La pièce passe alors à « comptabilisée ».");
  await souffle(5000);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Ce qui arrive se lit, se vérifie, et s'écrit tout seul",
    sous: "Une quittance validée propose son écriture de paiement ; une facture, à partir de son seul TTC, son écriture d'achat. Le cabinet décide, la plateforme ne retape rien.",
  }, 11000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group",
    titre: "De la pièce à l'écriture : <em>livré</em>",
    sous: "Joué en direct sur la solution le 18 octobre 2026. Données fictives ; la quittance et la facture sont des spécimens.",
    pied: PIED,
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
