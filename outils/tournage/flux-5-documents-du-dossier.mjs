/**
 * CREATION D'ENTREPRISE · FLUX 5 — LES DOCUMENTS DU DOSSIER.
 *
 * La juriste verse au dossier les pieces recues par WhatsApp ; le dossier dit
 * d'ou vient chaque piece et qui l'a versee ; le cabinet les ouvre en apercu ou
 * les telecharge ; la cliente les retrouve dans son espace.
 *
 *     PRISE=1 node flux-5-documents-du-dossier.mjs
 *
 * ⚠️ Pile de demonstration NEUVE, construite apres le 14 octobre 2026. Les
 * documents verses sont des SPECIMENS fictifs, generes dans `pieces/`.
 */
import {
  VITRINE, CONSOLE, COURRIER, souffle, carton, legende, aller,
  projecteur, saisir, seConnecter, chapitre, centrer, ouvrirLePlateau,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/flux-5-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const CNI = new URL("./pieces/cni-specimen.jpg", import.meta.url).pathname;
const DOMICILE = new URL("./pieces/attestation-domicile-specimen.pdf", import.meta.url).pathname;
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

const CLIENTE = { nom: "NDZANA Pauline", telephone: "+237699445566", courriel: "pauline.ndzana@exemple.cm" };
const MOT_DE_PASSE = "Pauline-Epices-Yaounde-2026";
const SOCIETE = "PAULINE ÉPICES SARL";
const PROJET = [
  ["denomination_souhaitee", SOCIETE], ["associes", "2"], ["capital_social", "1000000"],
  ["apports_en_nature", "non", true], ["chiffre_affaires_prevu", "MOINS_10M", true],
  ["salaries_prevus", "2"], ["region_siege", "CENTRE", true], ["siege", "Mvog-Ada, Yaoundé"],
  ["activite", "Commerce d'épices et de produits locaux"], ["statuts_apportes", "non", true],
  ["pieces_deja_reunies", "CNI des associés"],
];
const PIECE_CNI = "Pièce d'identité du fondateur";
const PIECE_DOMICILE = "Justificatif de domiciliation du siège";

async function message(motif) {
  const liste = await (await fetch(`${COURRIER}/api/v1/messages`)).json();
  const trouve = liste.messages.find((m) => motif.test(m.Subject));
  return (await fetch(`${COURRIER}/api/v1/message/${trouve.ID}`)).json();
}

async function jusquA(condition, { essais = 40, pause = 1500 } = {}) {
  for (let i = 0; i < essais; i += 1) {
    if (await condition().catch(() => false)) return true;
    await souffle(pause);
  }
  return false;
}

// ⚠️ La ligne qui porte un formulaire : la fiche liste aussi les constats (« Pièce
// manquante : … »), qui contiennent le même libellé et passent avant (prise 1).
let ficheDuDossier = "";
const ligne = (libelle) => page.locator("li", { hasText: libelle, has: page.locator("form") }).first();

async function verser(libelle, fichier, canal, C, texte) {
  const l = ligne(libelle);
  await centrer(l);
  await l.locator('input[type="file"]').setInputFiles(fichier);
  await l.locator('select[name="canal"]').selectOption(canal);
  await legende(page, C, texte);
  await souffle(2600);
  await projecteur(page, `li:has-text("${libelle}"):has(form) button[type="submit"]`, { tenir: 1400, centrer: false });
  await l.locator('button[type="submit"]').first().click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1600);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(ligne(libelle));
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Les documents <em>du dossier</em>",
    sous: "Flux 5 sur 5. La juriste verse les pièces reçues par WhatsApp ; le cabinet les ouvre ou les télécharge ; la cliente les retrouve dans son espace.",
    pied: "Présentation de l'avancement du développement · 14 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("rappel · de la demande à son compte", async () => {
  const C = "Rappel des flux 1 à 4";
  await aller(page, `${VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande`, C,
    "Madame NDZANA dépose sa demande, accepte la proforma, règle à la caisse et choisit son mot de passe. En accéléré.");
  await page.locator("#demande").scrollIntoViewIfNeeded().catch(() => undefined);
  await page.fill("#demande-nom", CLIENTE.nom);
  await page.fill("#demande-tel", CLIENTE.telephone);
  await page.fill("#demande-courriel", CLIENTE.courriel);
  for (const [code, valeur, liste] of PROJET) {
    const champ = `#declaration-${code}`;
    await page.locator(champ).scrollIntoViewIfNeeded().catch(() => undefined);
    if (liste) await page.selectOption(champ, valeur);
    else await page.fill(champ, valeur);
    await souffle(100);
  }
  await page.locator("#demande-accord-whatsapp").check();
  await page.locator('.formulaire-service__consentement input[type="checkbox"]').first().check({ timeout: 5000 });
  await page.click('.formulaire-service button[type="submit"]', { timeout: 8000 });
  await souffle(4500);

  await seConnecter(page, "p.moukouri@cga-brcg.cm", C, null);
  await page.goto(`${CONSOLE}/fr/acquisition`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await Promise.all([
    page.waitForURL(/acquisition\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${CLIENTE.nom}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C,
    "Madame NDZANA dépose sa demande, accepte la proforma, règle à la caisse et choisit son mot de passe. En accéléré.");
  await page.fill('input[name="commentaire"]', "Cliente jointe : projet confirmé.");
  await page.click('form:has(input[name="commentaire"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.click('form:has([name^="q_"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.click('form:has([name="score_charge"]) button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.fill('form.emission input[name="motif"]', "Formule proposée d'après la forme juridique.");
  await page.click('form.emission button[type="submit"]', { timeout: 8000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await souffle(1200);

  const proposition = await message(/Votre proposition/);
  const lien = /href="([^"]*\/proforma\/[^"]*)"/.exec(proposition.HTML)[1].replaceAll("&amp;", "&");
  await page.goto(lien, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.fill('input[name="identite_declaree"]', "NDZANA Pauline, gérante");
  await page.check('input[name="engagement"]');
  await page.click("button.proforma__valider");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1000);

  await seConnecter(page, "n.essama@cga-brcg.cm", C, null);
  await page.locator('.caisse__constat input[name="reference_externe"]').first().fill("Reçu de caisse n° 2026-0418");
  await page.locator('.caisse__constat input[name="rapproche"]').first().check();
  await page.locator(".caisse__constat button").first().click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);

  await jusquA(async () => /est ouvert/.test(JSON.stringify(await (await fetch(`${COURRIER}/api/v1/messages`)).json())));
  const ouverture = await message(/est ouvert/);
  const jeton = /activation\?jeton=([^"&]+)/.exec(ouverture.HTML)[1];
  await page.goto(`${CONSOLE}/fr/activation?jeton=${jeton}&parcours=creation`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="motDePasse"]', MOT_DE_PASSE);
  await page.fill('input[name="confirmation"]', MOT_DE_PASSE);
  await Promise.all([
    page.waitForURL(/connexion/, { timeout: 20000 }).catch(() => undefined),
    page.click('button[type="submit"]'),
  ]);
  await souffle(1200);
});

await chapitre("1 · la juriste verse ce qu'elle reçoit par WhatsApp", async () => {
  await carton(page, {
    type: "chapitre", num: "Premier temps",
    titre: "Ce qui arrive par WhatsApp entre au dossier",
    sous: "Beaucoup de clientes envoient leurs pièces en photo sur WhatsApp. La juriste les verse au dossier, et le dossier garde d'où elles viennent.",
  }, 8000);

  const C = "Chez la juriste";
  await seConnecter(page, "p.moukouri@cga-brcg.cm", C,
    "Patricia MOUKOURI, chargée des formalités, a reçu la carte d'identité de madame NDZANA sur WhatsApp.");
  await aller(page, `${CONSOLE}/fr/creation-entreprise`, C,
    `Le dossier ${SOCIETE} est dans son pipeline : il s'est ouvert au règlement.`);
  await projecteur(page, `a:has-text("${SOCIETE}")`, { tenir: 2200 });
  await Promise.all([
    page.waitForURL(/creation-entreprise\/.+/, { timeout: 15000 }),
    page.click(`a:has-text("${SOCIETE}")`),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  ficheDuDossier = page.url();
  await souffle(1200);

  await verser(PIECE_CNI, CNI, "WHATSAPP", C,
    "Elle joint la photo reçue, indique « par WhatsApp », et marque la pièce reçue. Un seul geste.");
  await legende(page, C,
    "Le dossier le dit désormais : reçue aujourd'hui, par WhatsApp, versée par elle. Six mois plus tard, on saura où retrouver l'original.");
  await souffle(4600);

  await verser(PIECE_DOMICILE, DOMICILE, "COURRIEL", C,
    "L'attestation de domiciliation est arrivée par courriel, en PDF : même geste, autre canal.");
  await souffle(2400);
});

await chapitre("2 · aperçu et téléchargement", async () => {
  await carton(page, {
    type: "chapitre", num: "Deuxième temps",
    titre: "Ouvrir une pièce sans quitter le dossier",
    sous: "Jusqu'ici, la juriste voyait « reçue » sans pouvoir lire la pièce. Elle l'ouvre maintenant en aperçu, ou la télécharge.",
  }, 8000);

  const C = "L'aperçu";
  // ⚠️ Le carton est une page à lui : on revient à la fiche (prise 2).
  await aller(page, ficheDuDossier, C,
    "Les deux pièces sont reçues, chacune avec son canal. Un bouton « Aperçu » et un bouton « Télécharger » sur chacune.");
  await souffle(2600);
  const cni = ligne(PIECE_CNI);
  await centrer(cni);
  await cni.getByRole("button", { name: /^Aperçu/ }).click();
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".document-piece__apercu").first());
  await legende(page, C,
    "La carte d'identité s'affiche dans le dossier. Elle vérifie qu'elle est lisible avant de constituer le dossier du guichet.");
  await souffle(4800);
  await page.getByRole("button", { name: "Fermer l’aperçu" }).first().click().catch(() => undefined);
  await souffle(800);

  // ⚠️ LE PDF N'EST PAS OUVERT EN APERÇU DANS CETTE VIDÉO, ET ELLE LE DIT.
  // Le navigateur de tournage, sans écran, n'a pas de visionneuse PDF : l'aperçu y
  // tombe sur son message de repli (prise 3). Sur le poste du cabinet, la
  // visionneuse du navigateur l'affiche. Montrer le repli en prétendant le
  // contraire serait faux ; on montre le téléchargement.
  const domicile = ligne(PIECE_DOMICILE);
  await centrer(domicile);
  await legende(page, C,
    "L'attestation, en PDF, s'ouvre dans la visionneuse du navigateur du poste. « Télécharger » l'enregistre sous le nom du dossier et de la pièce.");
  await souffle(4800);
  await projecteur(page, `li:has-text("${PIECE_DOMICILE}"):has(form) button:has-text("Télécharger")`, { tenir: 2200, centrer: false });
  await souffle(1200);
  await legende(page, C,
    "Seuls les documents de CE dossier s'ouvrent ici : la porte ne sert aucun autre fichier du cabinet, ni les pièces comptables des adhérents.");
  await souffle(4600);
  await projecteur(page, `li:has-text("${PIECE_CNI}"):has(form) summary`, { tenir: 2400 });
  await legende(page, C,
    "Une pièce à reprendre se remplace ici. Et la cocher reçue sans fichier n'efface plus jamais le document déjà joint.");
  await souffle(4200);
});

await chapitre("3 · la cliente les retrouve", async () => {
  const C = "Chez la cliente";
  await seConnecter(page, CLIENTE.courriel, C,
    "Madame NDZANA se connecte à son espace.", MOT_DE_PASSE);
  await page.goto(`${CONSOLE}/fr/ma-creation`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".creation__progression"));
  await legende(page, C,
    "Ses deux pièces sont comptées : elle n'a pas à les renvoyer par le site, la juriste les a versées pour elle.");
  await souffle(4400);
  await page.locator(".creation__recus summary").click();
  await centrer(page.locator(".creation__recus"));
  const sienne = page.locator(".creation__recus li", { hasText: PIECE_CNI }).first();
  await sienne.getByRole("button", { name: /^Aperçu/ }).click();
  await page.waitForSelector(".creation__recus .document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await centrer(page.locator(".creation__recus .document-piece__apercu").first());
  await legende(page, C,
    "Elle relit ce que le cabinet a reçu d'elle. Son dossier, et seulement le sien.");
  await souffle(4600);
});

await chapitre("fin du module", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Une pièce reçue est une pièce lisible, et datée de son canal",
    sous: "WhatsApp, guichet, courriel ou dépôt de la cliente : tout entre au même dossier, s'ouvre en aperçu, et se retrouve des deux côtés.",
  }, 9000);
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Création d'entreprise",
    titre: "Module création : <em>cinq flux livrés</em>",
    sous: "Demande préremplie, proforma justifiée, règlement et caisse, compte et suivi, documents du dossier. Tout a été joué en direct, le 14 octobre 2026.",
    pied: "<b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 9000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
