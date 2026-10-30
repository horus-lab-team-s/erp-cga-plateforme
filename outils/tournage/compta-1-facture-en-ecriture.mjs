/**
 * COMPTABILITE · FLUX 1 — UNE FACTURE CHARGEE DEVIENT UNE ECRITURE.
 *
 * Le comptable importe la facture ; il la lit le document sous les yeux ; les montants se
 * recoupent ou l'ecran le dit ; le controle de conformite bloque tant que le NIU n'est pas
 * atteste actif ; l'ecriture est proposee (6xx, 4451, 401) et enregistree en brouillon.
 *
 *     PRISE=1 node compta-1-facture-en-ecriture.mjs
 *
 * ⚠️ LA LECTURE AUTOMATIQUE PAR CLAUDE N'EST PAS JOUEE : la pile de demonstration n'a pas de
 * cle d'API, et l'ecran le dit. On ne simule pas une lecture d'IA dans une video : la saisie
 * est faite a la main, dans les memes champs que Claude preremplit quand la cle est posee.
 * ⚠️ La facture est un SPECIMEN fictif (`pieces/facture-quincaillerie-specimen.jpg`).
 */
import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/compta-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const FACTURE = new URL("./pieces/facture-quincaillerie-specimen.jpg", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const BATIMENT = "M081234567890P";
const COMMENTAIRE = "Facture Quincaillerie du Wouri, reçue par WhatsApp";
const F = ".lecture__formulaire";

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Comptabilité",
    titre: "Une facture chargée <em>devient une écriture</em>",
    sous: "Lue le document sous les yeux, confirmée, contrôlée, puis proposée en écriture : 6xx, TVA déductible, fournisseur.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · le comptable importe la facture", async () => {
  const C = "Chez le comptable";
  await seConnecter(page, "l.fotso@cga-brcg.cm", C,
    "Léonard FOTSO, comptable de Bâtiment Plus, a reçu une facture fournisseur par WhatsApp.");
  await aller(page, `${CONSOLE}/fr/pieces`, C, "Il l'importe dans les pièces justificatives du dossier.");
  await page.getByRole("button", { name: "Importer des pièces" }).click();
  await souffle(800);
  await page.locator('select[name="dossier"]').selectOption(BATIMENT);
  await page.locator('input[name="fichier"]').setInputFiles(FACTURE);
  await page.locator('input[name="commentaire"]').fill(COMMENTAIRE);
  await souffle(1600);
  await page.getByRole("button", { name: "Enregistrer la pièce" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1800);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const details = page.locator("details", { hasText: "à identifier" }).first();
  await details.locator("summary").click();
  const ligne = details.locator("div", { hasText: COMMENTAIRE }).first();
  await centrer(ligne);
  await legende(page, C,
    "La pièce est reçue. Un lien nouveau : « Lire la facture et proposer l'écriture ».");
  await souffle(3200);
  await Promise.all([
    page.waitForURL(/pieces\/facture\//, { timeout: 15000 }),
    ligne.getByRole("link", { name: /Lire la facture/ }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
});

await chapitre("2 · lire, le document sous les yeux", async () => {
  const C = "La lecture";
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "À gauche, la facture ; à droite, ce qu'il faut en retenir. Le comptable ne quitte plus l'écran.");
  await souffle(4000);
  await projecteur(page, ".lecture__note", { tenir: 2600 });
  await legende(page, C,
    "« Lire automatiquement » fait remplir ces champs par l'agent ChatGPT (voir le volet des agents). Ici, le comptable saisit à la main : les deux chemins passent par les mêmes contrôles.");
  await souffle(5200);
  await saisir(page, `${F} label:has-text("Fournisseur") input`, "QUINCAILLERIE DU WOURI SARL", { cadence: 18 });
  await saisir(page, `${F} label:has-text("NIU du fournisseur") input`, "M091234567890Q", { cadence: 30 });
  await saisir(page, `${F} label:has-text("N° de facture") input`, "FA-2026-0815", { cadence: 30 });
  await page.locator(`${F} input[type="date"]`).fill("2026-09-12");
  await saisir(page, `${F} input[aria-label="Ligne 1 : désignation"]`, "Ciment CPJ 42.5, 20 sacs", { cadence: 18 });
  await saisir(page, `${F} input[aria-label="Ligne 1 : montant HT"]`, "100000", { cadence: 30 });
  await page.getByRole("button", { name: "+ Ajouter une ligne" }).click();
  await saisir(page, `${F} input[aria-label="Ligne 2 : désignation"]`, "Fer à béton HA 10, 10 barres", { cadence: 18 });
  await saisir(page, `${F} input[aria-label="Ligne 2 : montant HT"]`, "50000", { cadence: 30 });
  // ⚠️ Par la position dans la rangée des totaux : « TVA » figure aussi dans le libellé de
  // l'attestation du NIU, et la prise 1 a tapé le montant dans la case à cocher.
  await saisir(page, `${F} .lecture__trois label:nth-child(1) input`, "150000", { cadence: 30 });
  await saisir(page, `${F} .lecture__trois label:nth-child(2) input`, "28875", { cadence: 30 });
  await saisir(page, `${F} .lecture__trois label:nth-child(3) input`, "180000", { cadence: 30 });
  await centrer(page.locator(".lecture__ecart").first());
  await legende(page, C,
    "Les montants se recoupent sous ses yeux : 150 000 + 28 875 ne font pas 180 000. Le bouton reste fermé tant que c'est faux.");
  await souffle(4800);
  await page.locator(`${F} .lecture__trois label:nth-child(3) input`).fill("");
  await saisir(page, `${F} .lecture__trois label:nth-child(3) input`, "178875", { cadence: 30 });
  await souffle(1200);
});

await chapitre("3 · le contrôle bloque un NIU non vérifié", async () => {
  const C = "Le contrôle";
  await page.getByRole("button", { name: "Enregistrer la facture" }).click();
  await page.waitForSelector('.lecture__message[data-ton="fait"]', { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "Facture enregistrée : la pièce est lue. Il propose l'écriture.");
  await souffle(2600);
  await page.getByRole("button", { name: "Proposer l'écriture" }).click();
  await page.waitForSelector(".lecture__empechements", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".lecture__empechements"));
  await legende(page, C,
    "Bloqué : sans NIU vérifié actif, ni la TVA ni la charge ne se déduisent. C'est la règle FAC-ID-003 du référentiel, et elle dit quoi faire.");
  await souffle(5400);
  await centrer(page.locator(".lecture__case"));
  await page.locator(".lecture__case input").check();
  await legende(page, C,
    "Il vérifie le NIU sur le portail de la DGI et l'atteste. L'interconnexion avec la DGI pourra un jour le faire à sa place.");
  await souffle(4200);
  await page.getByRole("button", { name: "Enregistrer la facture" }).click();
  await page.waitForSelector('.lecture__message[data-ton="fait"]', { timeout: 15000 }).catch(() => undefined);
  await souffle(1600);
});

await chapitre("4 · l'écriture proposée, puis le brouillon", async () => {
  const C = "L'écriture";
  await page.getByRole("button", { name: "Proposer l'écriture" }).click();
  await page.waitForSelector(".lecture__ecriture", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".lecture__ecriture"));
  await legende(page, C,
    "L'écriture d'achat : la charge au débit, la TVA déductible en 4451 (Bâtiment Plus est au réel), le fournisseur en 401 avec son NIU, pour 178 875 francs.");
  await souffle(6000);
  // ⚠️ AIDE DE TOURNAGE, PAS DU PRODUIT : de la marge sous la page, pour que la fin ne passe
  // pas sous la bande de légende (prise 3 : le message de confirmation y restait caché).
  await page.addStyleTag({ content: ".page-travail { padding-bottom: 220px !important; }" });
  await page.getByRole("button", { name: "Enregistrer en brouillon" }).click();
  await page.waitForSelector(".lecture__proposition .lecture__accord", { timeout: 20000 }).catch(() => undefined);
  // ⚠️ Le message tombait sous la bande de légende (prise 2) : on descend franchement.
  await page.mouse.wheel(0, 400);
  await souffle(900);
  await page.locator(".lecture__proposition .lecture__accord").evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "start" })).catch(() => undefined);
  await souffle(900);
  await legende(page, C,
    "Brouillon enregistré, numéroté. Il se relit et se valide sur l'écran de saisie ; la validation passe la pièce à « comptabilisée ».");
  await souffle(5000);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "De la pièce à l'écriture, sans ressaisie",
    sous: "La facture se lit une fois, se contrôle, et l'écriture en découle. L'agent ChatGPT peut préremplir la lecture ; montants, date et NIU restent confirmés par le comptable.",
  }, 10000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Comptabilité",
    titre: "Flux 1 : <em>livré</em>",
    sous: "Tout ce qui précède a été joué en direct sur la solution, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 7000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
