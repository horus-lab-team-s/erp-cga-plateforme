/**
 * LES AGENTS COMPTABLES · CHATGPT AU TRAVAIL (30 octobre 2026).
 *
 * Les six agents de la plateforme, joués pour de vrai avec la clé OpenAI du cabinet :
 * 1. la lecture d'une facture photographiée (l'OCR est fait par le modèle) ;
 * 2. la relecture de la balance ;
 * 3. la relecture de la DSF ;
 * 4. l'analyse d'un contrat ;
 * 5. la rédaction d'un contrat ;
 * 6. la réponse à un candidat.
 * Chaque fois : l'agent PROPOSE, la personne décide. Rien ne s'enregistre sans elle.
 *
 *     set -a; . ~/Cles-CGA/openai.env; set +a
 *     CGA_IA_FOURNISSEUR=openai outils/pile-de-demonstration.sh neuve    (dépôt du serveur)
 *     TOURNAGE_CONSOLE=http://localhost:3011 TOURNAGE_VITRINE=http://localhost:3012 \
 *       TOURNAGE_DATE="30 octobre 2026" PRISE=1 node agents-1-chatgpt.mjs
 *
 * ⚠️ Pile NEUVE. Les documents lus sont des SPÉCIMENS fictifs (`pieces/`). Les réponses de
 * l'agent ne sont pas écrites d'avance : elles changent d'une prise à l'autre, et le film le dit.
 */
import {
  CONSOLE, VITRINE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre,
  centrer, ouvrirLePlateau, descendre,
} from "./outils.mjs";

const SORTIE = new URL(`./sortie/agents-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const FACTURE = new URL("./pieces/facture-quincaillerie-specimen.jpg", import.meta.url).pathname;
const CONTRAT = new URL("./pieces/contrat-bail-specimen.pdf", import.meta.url).pathname;
const CV = new URL("./pieces/attestation-domicile-specimen.pdf", import.meta.url).pathname;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
const BATIMENT = "M081234567890P";
const NGUEMA = "P027788990011M";
const COMPTABLE = "l.fotso@cga-brcg.cm";
const COMPTABLE_NGUEMA = "c.ndongo@cga-brcg.cm";
const JURISTE = "j.ateba@cga-brcg.cm";
const DIRECTION = "b.mballa@cga-brcg.cm";
const F = ".lecture__formulaire";
const AGENT = 180000; // une réponse longue (un contrat) peut prendre plus d'une minute

const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

/** Attendre que l'agent ait rendu la main : le libellé « en cours » disparaît. */
async function attendreLAgent(enCours) {
  await page.waitForFunction((t) => !document.body.innerText.includes(t), enCours, { timeout: AGENT }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
}

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Les agents comptables",
    titre: "ChatGPT au travail, <em>l'humain décide</em>",
    sous: "Six agents : la lecture des factures (photo ou PDF, lue par le modèle), la relecture de la balance et de la DSF, l'analyse et la rédaction des contrats, la réponse aux candidats. Chacun propose ; rien ne s'enregistre sans la personne qui en répond.",
    pied: `Démonstration jouée en direct sur la solution, avec ChatGPT · 30 octobre 2026<br>${PIED}`,
  }, 12000);
});

await chapitre("1 · une facture photographiée, lue par l'agent", async () => {
  const C = "Lecture d'une facture";
  await seConnecter(page, COMPTABLE, C, "Léonard FOTSO, comptable de Bâtiment Plus, reçoit la photo d'une facture par WhatsApp.");
  await aller(page, `${CONSOLE}/fr/pieces`, C, "Il l'importe dans les pièces justificatives du dossier.");
  await page.getByRole("button", { name: "Importer des pièces" }).click();
  await souffle(800);
  await page.locator('select[name="dossier"]').selectOption(BATIMENT);
  await page.locator('input[name="fichier"]').setInputFiles(FACTURE);
  await page.locator('input[name="commentaire"]').fill("Facture Quincaillerie du Wouri, photo WhatsApp");
  await souffle(1200);
  await page.getByRole("button", { name: "Enregistrer la pièce" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const details = page.locator("details", { hasText: "à identifier" }).first();
  await details.locator("summary").click();
  const ligne = details.locator("div", { hasText: "photo WhatsApp" }).first();
  await Promise.all([
    page.waitForURL(/pieces\/facture\//, { timeout: 15000 }),
    ligne.getByRole("link", { name: /Lire la facture/ }).click(),
  ]);
  await page.waitForSelector(".document-piece__apercu", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "La photo à gauche, les champs vides à droite. Il demande la lecture à l'agent.");
  await souffle(3200);
  await projecteur(page, "button:has-text('Lire automatiquement')", { tenir: 2200 });
  await page.getByRole("button", { name: "Lire automatiquement" }).click();
  await legende(page, C, "La photo part chez ChatGPT, qui la lit lui-même : pas de logiciel de reconnaissance à part.");
  await attendreLAgent("Lecture…");
  await centrer(page.locator(F));
  await legende(page, C, "En quelques secondes : fournisseur, NIU, numéro, date, lignes, totaux. Chaque champ dit sa confiance.");
  await souffle(6000);
  await centrer(page.locator(".lecture__trois").first());
  await legende(page, C, "Le calcul se vérifie sous ses yeux : 150 000 HT, TVA à 19,25 % = 28 875, total 178 875 F.");
  await souffle(6000);
  await centrer(page.locator(".lecture__case"));
  await page.locator(".lecture__case input").check();
  await legende(page, C, "Ce que l'agent ne peut pas faire : attester que le NIU est actif à la DGI. Le comptable le vérifie et coche.");
  await souffle(4600);
  await page.getByRole("button", { name: "Enregistrer la facture" }).click();
  await page.waitForSelector('.lecture__message[data-ton="fait"]', { timeout: 15000 }).catch(() => undefined);
  await souffle(1200);
  await page.getByRole("button", { name: "Proposer l'écriture" }).click();
  await page.waitForSelector(".lecture__ecriture", { timeout: 20000 }).catch(() => undefined);
  await centrer(page.locator(".lecture__ecriture"));
  await legende(page, C, "L'écriture d'achat se propose : charge au débit, TVA déductible en 4451, fournisseur en 401. Elle part en brouillon, à valider.");
  await souffle(6500);
});

await chapitre("2 · la balance, relue par l'agent", async () => {
  const C = "Relecture de la balance";
  await aller(page, `${CONSOLE}/fr/comptabilite?dossier=${BATIMENT}`, C,
    "La balance de Bâtiment Plus. Avant de clôturer, le comptable la fait relire.");
  await souffle(1500);
  const bouton = page.getByRole("button", { name: /relecture de la balance à l'agent/ });
  await centrer(bouton);
  await souffle(1500);
  await bouton.click();
  await legende(page, C, "L'agent lit les soldes, compte par compte, comme un réviseur le ferait.");
  await attendreLAgent("Relecture…");
  await descendre(page, { paliers: 2 });
  await legende(page, C, "Il signale ce qui mérite un regard, et pourquoi : un solde anormal, un compte d'attente. Il ne corrige rien.");
  await souffle(7500);
});

await chapitre("3 · la DSF, relue avant la validation", async () => {
  const C = "Relecture de la DSF";
  await seConnecter(page, COMPTABLE_NGUEMA, C, "Christelle NDONGO prépare la DSF 2025 du Cabinet Nguema Conseil.");
  await aller(page, `${CONSOLE}/fr/cloture?dossier=${NGUEMA}&exercice=2025`, C, "La DSF se prépare depuis la balance de l'exercice clos.");
  const preparer = page.getByRole("button", { name: "Préparer la DSF" });
  if (await preparer.count()) {
    await preparer.click();
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
    await souffle(2000);
  }
  const relire = page.getByRole("button", { name: /relecture à l'agent/ });
  await centrer(relire);
  await legende(page, C, "Avant de la soumettre à la réviseure, elle demande une relecture à l'agent.");
  await souffle(2500);
  await relire.click();
  await attendreLAgent("Relecture…");
  await centrer(page.locator("text=/agent/i").last());
  await legende(page, C, "Les points à vérifier dans la liasse, chacun expliqué. La réviseure garde le dernier mot.");
  await souffle(7500);
});

let adresseMission = "";
await chapitre("4 · un contrat analysé par l'agent", async () => {
  const C = "Analyse d'un contrat";
  await seConnecter(page, JURISTE, C, "Julienne ATEBA, juriste. Bâtiment Plus lui confie un bail avant de le signer.");
  await aller(page, `${CONSOLE}/fr/missions`, C, "Elle ouvre une mission d'analyse et y verse le bail.");
  await saisir(page, 'input[name="objet"]', "Bail du dépôt de Bonabéri, avant signature", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "SARL BATIMENT PLUS", { cadence: 18 });
  await page.locator('input[name="client_courriel"]').fill("jp.nkoa@batimentplus.cm");
  await page.locator('input[name="fichier"]').setInputFiles(CONTRAT);
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  adresseMission = page.url();
  await page.waitForSelector(".apercu-pdf__page", { timeout: 20000 }).catch(() => undefined);
  await projecteur(page, ".mission__agent", { tenir: 2200 });
  await page.getByRole("button", { name: "Lire avec l'agent" }).click();
  await legende(page, C, "« Lire avec l'agent » : ChatGPT lit le bail entier et prépare les points d'analyse.");
  await attendreLAgent("L'agent lit le contrat…");
  await centrer(page.locator(".mission__points"));
  await legende(page, C, "Chaque point arrive « à décider », avec la clause citée. Rien ne part au client tel quel.");
  await souffle(7000);
  const premier = page.locator(".mission__point").first();
  await centrer(premier);
  await premier.getByRole("button", { name: "Retenir" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await legende(page, C, "Elle retient, reformule ou écarte chaque point. Le livrable ne portera que ce qu'elle a décidé.");
  await souffle(5000);
});

await chapitre("5 · un contrat rédigé avec l'agent", async () => {
  const C = "Rédaction d'un contrat";
  await aller(page, `${CONSOLE}/fr/missions`, C, "Une autre mission : rédiger un contrat de travaux.");
  await page.locator('select[name="type"]').selectOption("REDACTION_CONTRAT");
  await saisir(page, 'input[name="objet"]', "Contrat de travaux, toiture de l'Hôtel Le Wouri", { cadence: 16 });
  await saisir(page, 'input[name="client"]', "SARL BATIMENT PLUS", { cadence: 18 });
  await Promise.all([
    page.waitForURL(/missions\/MIS-/, { timeout: 25000 }),
    page.getByRole("button", { name: "Ouvrir la mission" }).click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await saisir(page, 'input[name="type_de_contrat"]', "contrat d'entreprise de travaux", { cadence: 18 });
  const cahier = page.locator('textarea[name="cahier"], textarea').first();
  await cahier.fill("Réfection de la toiture de l'Hôtel Le Wouri, Douala. Prix forfaitaire 18 500 000 FCFA HT, acompte 30 %. Délai 90 jours, pénalités de retard, garantie décennale, retenue de garantie 5 %. Droit camerounais, OHADA.");
  await legende(page, C, "Elle écrit le cahier de rédaction : les parties, le prix, le délai, les garanties.");
  await souffle(4200);
  await page.getByRole("button", { name: "Enregistrer le cahier" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.getByRole("button", { name: "Rédiger avec l'agent" }).click();
  await legende(page, C, "« Rédiger avec l'agent » : ChatGPT propose les articles d'après le cahier.");
  await attendreLAgent("L'agent rédige…");
  await centrer(page.locator(".mission__points"));
  await legende(page, C, "Les articles arrivent, chacun à décider : la juriste garde la plume.");
  await souffle(7000);
});

await chapitre("6 · la réponse au candidat, proposée par l'agent", async () => {
  const C = "Recrutement";
  await seConnecter(page, DIRECTION, C, "Bernadette MBALLA, directrice, publie une offre de poste.");
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, null);
  await page.getByRole("button", { name: "Rédiger une offre" }).click();
  await souffle(800);
  const f = page.locator("form.offres__formulaire");
  await saisir(page, "form.offres__formulaire input[name=intitule]", "Assistant comptable");
  await f.locator("input[name=lieu]").fill("Douala, Akwa");
  await page.locator("form.offres__formulaire textarea[name=description]").fill("Saisie des pièces, rapprochements, déclarations mensuelles.");
  await f.getByRole("textbox", { name: "Qualifications attendues" }).fill("- BTS ou licence en comptabilité\n- Maîtrise du SYSCOHADA");
  await f.getByRole("button", { name: "Rédiger en brouillon" }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await page.getByRole("button", { name: "Publier sur le site" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await aller(page, `${VITRINE}/fr/carrieres`, C, "Sur le site, une candidate postule, avec son CV.");
  await page.locator(".annonce__fermer").first().click({ timeout: 5000 }).catch(() => undefined);
  await page.getByRole("link", { name: "Lire l'offre et postuler" }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  const fo = page.locator("form.candidature");
  await centrer(fo);
  await page.locator("form.candidature input[name=nom]").fill("Claire Ngo Biyong");
  await page.locator("form.candidature input[name=telephone]").fill("699887766");
  await page.locator("form.candidature input[name=courriel]").fill("claire.ngobiyong@exemple.cm");
  await page.locator("form.candidature textarea[name=message]").fill("Deux ans en cabinet à Douala, à l'aise sur le SYSCOHADA.");
  await fo.locator("input[name=cv]").setInputFiles(CV);
  await fo.locator("input[name=consentement]").check();
  await fo.getByRole("button", { name: "Envoyer ma candidature" }).click();
  await page.waitForTimeout(2500);
  await aller(page, `${CONSOLE}/fr/offres-de-poste`, C, "Au cabinet, la directrice ouvre la candidature et décide : entretien.");
  await page.getByRole("button", { name: /1 candidature/ }).click();
  await souffle(1000);
  const candidature = page.locator(".offres__candidatures > li").first();
  await candidature.locator('select[name="decision"]').selectOption("ENTRETIEN");
  await page.locator('.offres__decision input[name="note"]').fill("Expérience en cabinet, disponible de suite. Entretien mardi 4 novembre à 10 h.");
  await candidature.getByRole("button", { name: "Enregistrer la décision" }).click();
  await page.waitForSelector(".offres__decision .offres__fait", { timeout: 15000 }).catch(() => undefined);
  await page.locator(".offres__candidatures > li").first().getByRole("button", { name: /Préparer la réponse/ }).click();
  await page.waitForSelector(".offres__reponse", { timeout: 15000 });
  const proposer = page.getByRole("button", { name: /Proposer avec l.agent/ });
  await centrer(proposer);
  await legende(page, C, "« Proposer avec l'agent » : ChatGPT rédige la réponse d'après la décision et la note.");
  await souffle(2500);
  await proposer.click();
  await page.waitForFunction(() => /Proposée par l'agent/.test(document.body.innerText), null, { timeout: AGENT }).catch(() => undefined);
  await centrer(page.locator(".offres__reponse"));
  await legende(page, C, "La réponse est proposée : la directrice la relit et la corrige. Elle partira telle qu'elle la laisse.");
  await souffle(8000);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce film montre",
    titre: "L'agent propose, <em>la personne décide</em>",
    sous: "Lire une facture, relire une balance ou une DSF, analyser et rédiger un contrat, répondre à un candidat : ChatGPT fait le premier jet en quelques secondes. Le comptable, la juriste ou la directrice valide, corrige ou écarte. Sans clé d'API, tout se fait à la main, dans les mêmes écrans.",
    pied: `30 octobre 2026<br>${PIED}`,
  }, 11000);
});

await plateau.fermer();
console.log(`\nFilm : ${SORTIE} · ${Math.round((Date.now() - debut) / 1000)} s`);
