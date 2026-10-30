/**
 * RECETTE · FILM 1 (30 octobre 2026) — LES ACCÈS, LA FICHE DE L'ADHÉRENT, LE CLOISONNEMENT.
 *
 * Les points du document de recette qui n'avaient pas encore de vidéo :
 * 1. la chargée de clientèle renvoie le lien d'activation ; l'adhérent active son compte ;
 * 2. un nouvel adhérent renseigne la fiche de sa DSF et l'envoie ; la réviseure la valide ;
 * 3. une comptable ne voit que ses dossiers ; l'inspecteur, en lecture seule, que le sien ;
 * 4. l'administrateur suspend puis rétablit un compte, sous second facteur.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_DATE="30 octobre 2026" PRISE=1 \
 *       node recette-1-acces-fiche-et-cloisonnement.mjs
 *
 * ⚠️ Pile NEUVE, avec le jeu de présentation (`python -m app.jeu_de_presentation`) : les
 * comptes de la recette (Émile TCHOUMBA, Samuel NDJOCK, Georges ATANGANA…). Le second
 * facteur de l'administrateur est enrôlé HORS CHAMP (son activation a son propre film).
 */
import {
  CONSOLE, SECRET, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau,
} from "./outils.mjs";
import { codeNeuf } from "./second-facteur.mjs";

const API = process.env.TOURNAGE_API ?? "http://127.0.0.1:8010";
const SORTIE = new URL(`./sortie/recette-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const CHARGEE = "p.moukouri@cga-brcg.cm";
const ADHERENT_A_ACTIVER = "e.tchoumba@tchoumbaetfils.cm";
const TCHOUMBA = "P019876543210K";
const NOUVEL_ADHERENT = "s.ndjock@quincaillerie-moderne.cm";
const QUINCAILLERIE = "M041122334455Q";
const REVISEURE = "a.bouba@cga-brcg.cm";
const COMPTABLE = "c.ndongo@cga-brcg.cm";
const INSPECTEUR = "g.atangana@inspection.cm";
const BATIMENT = "M081234567890P";
const ADMINISTRATEUR = "s.onana@cga-brcg.cm";
const MOT_DE_PASSE_REFUSE = "Tchoumba et Fils 2026 !";
const NOUVEAU_MOT_DE_PASSE = "Ciment bleu sur la colline 47";

/** Les courriels retenus par la pile de démonstration, pour un code et un destinataire. */
async function dernierCourriel(code, destinataire) {
  for (let essai = 0; essai < 10; essai++) {
    const liste = await (await fetch(`${API}/transverse/courriels${code ? `?code=${code}` : ""}`)).json();
    const m = liste.filter((c) => c.destinataire === destinataire).at(-1);
    if (m) return m;
    await souffle(1000);
  }
  throw new Error(`aucun courriel ${code} pour ${destinataire}`);
}

async function enrolerHorsChamp(courriel) {
  const session = await fetch(`${API}/transverse/session`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel, mot_de_passe: SECRET }),
  });
  const cookie = session.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const demande = await fetch(`${API}/transverse/second-facteur`, { method: "POST", headers: { cookie } });
  if (!demande.ok) throw new Error(`enrôlement refusé : ${await demande.text()}`);
  const lien = (await dernierCourriel("compte.second_facteur_confirmation", courriel)).contexte.lien;
  const jeton = /jeton=([A-Za-z0-9_\-.]+)/.exec(lien)[1];
  const confirmation = await fetch(`${API}/transverse/second-facteur/confirmation`, {
    method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ jeton }),
  });
  if (!confirmation.ok) throw new Error(`confirmation refusée : ${await confirmation.text()}`);
  const { secret } = await confirmation.json();
  const activation = await fetch(`${API}/transverse/second-facteur/activation`, {
    method: "POST", headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ code: await codeNeuf(secret) }),
  });
  if (!activation.ok) throw new Error(`activation refusée : ${await activation.text()}`);
  return secret;
}

const secretAdministrateur = await enrolerHorsChamp(ADMINISTRATEUR);
console.log("Second facteur de l'administrateur enrôlé hors champ.");

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Recette en présentiel",
    titre: "Les accès, la fiche de l'adhérent, <em>le cloisonnement</em>",
    sous: "Un lien d'activation renvoyé, un compte activé ; une fiche de DSF envoyée puis validée ; chacun ne voit que ses dossiers ; un compte suspendu puis rétabli, sous second facteur.",
    pied: `Démonstration jouée en direct sur la solution · 30 octobre 2026<br>${PIED}`,
  }, 11000);
});

await chapitre("1 · le lien d'activation, renvoyé puis suivi", async () => {
  const C = "Chargée de clientèle";
  await seConnecter(page, CHARGEE, C, "Patricia MOUKOURI, chargée de clientèle. Émile TCHOUMBA n'a jamais activé son compte.");
  await aller(page, `${CONSOLE}/fr/portefeuille/${TCHOUMBA}`, C, "Le dossier Tchoumba & Fils : son accès est « en attente d'activation ».");
  const bloc = page.locator("section, div", { hasText: "Accès des adhérents" }).last();
  await centrer(bloc);
  await souffle(2500);
  await saisir(page, 'input[name="verification"]', "Rappelé au 677 41 22 09 ; NIU et date de création confirmés", { cadence: 20 });
  await legende(page, C, "Elle note comment elle l'a reconnu au téléphone, puis renvoie le lien : il part à l'adresse du compte, jamais à une autre.");
  await souffle(3500);
  await page.getByRole("button", { name: "Renvoyer le lien d'activation" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2500);
  const C2 = "L'adhérent";
  const message = await dernierCourriel("", ADHERENT_A_ACTIVER);
  const jeton = /jeton=([^"&\s]+)/.exec(message.contexte.lien)[1];
  await aller(page, `${CONSOLE}/fr/activation?jeton=${jeton}`, C2, "Émile ouvre le lien reçu et choisit son mot de passe.");
  await saisir(page, 'input[name="motDePasse"]', MOT_DE_PASSE_REFUSE, { cadence: 40 });
  await saisir(page, 'input[name="confirmation"]', MOT_DE_PASSE_REFUSE, { cadence: 40 });
  await souffle(800);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2500);
  await legende(page, C2, "Refusé : le mot de passe contient son nom, le premier essai de quiconque le viserait. La plateforme dit pourquoi.");
  await souffle(5000);
  await page.locator('input[name="motDePasse"]').fill("");
  await page.locator('input[name="confirmation"]').fill("");
  await saisir(page, 'input[name="motDePasse"]', NOUVEAU_MOT_DE_PASSE, { cadence: 40 });
  await saisir(page, 'input[name="confirmation"]', NOUVEAU_MOT_DE_PASSE, { cadence: 40 });
  await souffle(800);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2000);
  await seConnecter(page, ADHERENT_A_ACTIVER, C2, "Il se connecte avec son nouveau mot de passe.", NOUVEAU_MOT_DE_PASSE);
  await legende(page, C2, "Son espace s'ouvre : ses échéances, ses justificatifs, son entreprise.");
  await souffle(5000);
});

await chapitre("2 · la fiche de la DSF, envoyée par l'adhérent", async () => {
  const C = "Nouvel adhérent";
  await seConnecter(page, NOUVEL_ADHERENT, C, "Samuel NDJOCK, Quincaillerie Moderne de Bonabéri, nouveau client du cabinet.");
  await aller(page, `${CONSOLE}/fr/mon-espace/entreprise`, C, "« Mon entreprise » : ce que le cabinet sait, et la fiche de sa DSF à compléter.");
  const liste = page.getByText("Il manque encore, pour la DSF").first();
  await centrer(liste);
  await legende(page, C, "La plateforme dit ce qui manque pour la DSF : téléphone, ville, adresse, banque, signataire, activité.");
  await souffle(5000);
  const remplir = async (nom, valeur) => { await centrer(page.locator(`input[name="${nom}"]`)); await saisir(page, `input[name="${nom}"]`, valeur, { cadence: 20 }); };
  await remplir("telephone", "233 39 41 52");
  await remplir("ville", "Douala");
  await remplir("adresse_geographique", "Carrefour Bonabéri, face station Tradex");
  await remplir("signataire_nom", "NDJOCK Samuel");
  await remplir("signataire_qualite", "Gérant");
  await remplir("banque", "Afriland First Bank");
  await remplir("numero_de_compte", "10005 00001 01234567890 12");
  await page.locator('select[name="controle"]').selectOption({ index: 2 });
  await remplir("activite.designation", "Commerce de matériaux de construction et de quincaillerie");
  await remplir("activite.code_nacam", "4752");
  await remplir("activite.chiffre_affaires_ht", "185000000");
  await legende(page, C, "Il renseigne une fois : le cabinet relit, et reprend la fiche chaque année.");
  await souffle(3000);
  const envoyer = page.getByRole("button", { name: "Envoyer au cabinet" });
  await centrer(envoyer);
  await envoyer.click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await centrer(page.getByText("Fiche de votre déclaration").first());
  await legende(page, C, "La fiche est partie au cabinet.");
  await souffle(4000);
  await aller(page, `${CONSOLE}/fr/portefeuille/${BATIMENT}`, C, "Il essaie d'ouvrir le dossier d'une autre entreprise, par son adresse…");
  await souffle(1500);
  await legende(page, C, "… introuvable : un adhérent ne voit que son entreprise.");
  await souffle(4000);
});

await chapitre("3 · la réviseure valide la fiche", async () => {
  const C = "Réviseure";
  await seConnecter(page, REVISEURE, C, "Aïcha BOUBA, réviseure, reçoit la fiche.");
  await aller(page, `${CONSOLE}/fr/portefeuille/${QUINCAILLERIE}`, C, "Dans le dossier de la Quincaillerie, la fiche de la DSF, telle que l'adhérent l'a envoyée.");
  const valider = page.getByRole("button", { name: "Valider la fiche" });
  await centrer(valider);
  await legende(page, C, "Elle la relit. Valider, ou renvoyer avec un motif que l'adhérent lira.");
  await souffle(5000);
  await valider.click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await legende(page, C, "Validée : la DSF reprendra ces informations.");
  await souffle(4000);
});

await chapitre("4 · chacun ne voit que ses dossiers", async () => {
  const C = "Cloisonnement";
  await seConnecter(page, COMPTABLE, C, "Christelle NDONGO, comptable, suit quatre dossiers.");
  await aller(page, `${CONSOLE}/fr/portefeuille`, C, "Son portefeuille : ses quatre dossiers, pas un de plus.");
  await souffle(3500);
  await aller(page, `${CONSOLE}/fr/portefeuille/${BATIMENT}`, C, "Elle tape l'adresse du dossier Bâtiment Plus, que suit son collègue…");
  await souffle(1500);
  await legende(page, C, "… introuvable. Le serveur ne dit même pas qu'il existe.");
  await souffle(4200);
  await seConnecter(page, INSPECTEUR, C, "Georges ATANGANA, inspecteur externe, en lecture seule.");
  await aller(page, `${CONSOLE}/fr/portefeuille`, C, "Un seul dossier lui est ouvert : Agro-Nkolo.");
  await souffle(3500);
  await aller(page, `${CONSOLE}/fr/portefeuille/${BATIMENT}`, C, "Tout autre dossier lui est introuvable, comme aux autres.");
  await souffle(4200);
});

await chapitre("5 · suspendre et rétablir un compte", async () => {
  const C = "Administration";
  await seConnecter(page, ADMINISTRATEUR, C, "Serge ONANA, administrateur. Un collaborateur part en congé prolongé.");
  await aller(page, `${CONSOLE}/fr/comptes`, C, "Suspendre un compte est un geste sensible : la plateforme demande le second facteur.");
  await centrer(page.locator('input[name="code"]'));
  await saisir(page, 'input[name="code"]', await codeNeuf(secretAdministrateur), { cadence: 110 });
  await page.getByRole("button", { name: "Renforcer la session" }).click();
  await page.waitForTimeout(2500);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  console.log("    · session renforcée :", await page.getByRole("button", { name: "Suspendre", exact: true }).count(), "bouton(s) Suspendre");
  const ligne = page.locator("[role=row]", { hasText: "r.ebolo@cga-brcg.cm" }).first();
  await centrer(ligne);
  await legende(page, C, "Roger EBOLO, fiscaliste. Un compte ne se supprime jamais : son nom reste dans les écritures et le journal. Il se suspend.");
  await souffle(4500);
  await ligne.getByRole("button", { name: "Suspendre", exact: true }).click();
  console.log("    · formulaire de suspension ouvert");
  await ligne.locator('textarea[name="motif"]').fill("Congé prolongé constaté le 30 octobre 2026, sur décision de la direction.");
  await ligne.locator('input[name="confirmation"]').check();
  await souffle(1500);
  await ligne.getByRole("button", { name: "Suspendre le compte" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  const suspendu = page.locator("[role=row]", { hasText: "r.ebolo@cga-brcg.cm" }).first();
  await centrer(suspendu);
  await legende(page, C, "Suspendu : ses sessions sont fermées, il ne peut plus se connecter. Le motif part au journal d'audit.");
  await souffle(4500);
  console.log("    · suspendu");
  await suspendu.getByRole("button", { name: "Rétablir" }).click();
  await suspendu.locator('textarea[name="motif"]').fill("Retour de congé le 30 octobre 2026, accès rétabli à sa demande.");
  await souffle(1200);
  await suspendu.getByRole("button", { name: "Lever la suspension" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.reload({ waitUntil: "networkidle" }).catch(() => undefined);
  await centrer(page.locator("[role=row]", { hasText: "r.ebolo@cga-brcg.cm" }).first());
  await legende(page, C, "Rétabli, avec son motif. Les deux gestes sont tracés, sous le nom de l'administrateur.");
  await souffle(4500);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "Chacun son accès, <em>et rien de plus</em>",
    sous: "Un lien d'activation qui ne part qu'à l'adresse connue ; une fiche que l'adhérent renseigne une fois et que le cabinet valide ; des dossiers introuvables pour qui ne les suit pas ; des comptes suspendus, jamais supprimés.",
    pied: `30 octobre 2026<br>${PIED}`,
  }, 10000);
});

await plateau.fermer();
console.log(`\nFilm : ${SORTIE} · ${Math.round((Date.now() - debut) / 1000)} s`);
