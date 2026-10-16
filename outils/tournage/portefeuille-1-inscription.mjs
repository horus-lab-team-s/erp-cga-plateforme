/**
 * PORTEFEUILLE · FLUX 1 — L'ENTREPRISE EXISTANTE ENTRE AU PORTEFEUILLE, SANS RESSAISIE.
 *
 * La Briqueterie du Wouri, société déjà immatriculée, a demandé la paie de ses salariés et
 * l'a réglée. La direction l'inscrit au portefeuille : le formulaire reprend ce que le dossier
 * commercial sait déjà (nom, téléphone, groupe de risque CNPS et numéro employeur répondus au
 * questionnaire) ; elle vérifie l'identité fiscale sur pièces et complète. La paie applique
 * ensuite d'office le groupe CNPS repris.
 *
 *     PRISE=1 node portefeuille-1-inscription.mjs
 *
 * ⚠️ HORS CHAMP : la demande du visiteur, son affectation et sa qualification passent par
 * l'API, comme dans le parcours réel ; le règlement, lui, est posé directement en base. Le
 * paiement a sa propre vidéo (création · flux 3), et le rejouer ici n'apprendrait rien.
 */
import { execFileSync } from "node:child_process";

import {
  CONSOLE, souffle, carton, legende, aller, projecteur, saisir, seConnecter, chapitre, centrer,
  ouvrirLePlateau, SECRET,
} from "./outils.mjs";

const API = process.env.API ?? "http://localhost:8100";
const PILE = process.env.PILE ?? "cga-film3";
const SORTIE = new URL(`./sortie/portefeuille-1-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const DIRECTION = "b.mballa@cga-brcg.cm";
const NIU = "M099988877766Q";

async function session(courriel) {
  const r = await fetch(`${API}/transverse/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courriel, mot_de_passe: SECRET }),
  });
  return r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

async function horsChamp() {
  const depot = await fetch(`${API}/acquisition/demandes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: "Briqueterie du Wouri", telephone: "699221100", service_souhaite: "PAIE",
      canal_prefere: "APPEL", message: "Je voudrais confier la paie de mes douze salariés.",
    }),
  });
  if (![200, 201].includes(depot.status)) throw new Error(`demande : ${depot.status}`);
  const cookie = await session(DIRECTION);
  const dossiers = await (await fetch(`${API}/acquisition/dossiers`, { headers: { cookie } })).json();
  const reference = dossiers.filter((d) => d.etat === "DEPOSEE" || d.etat === "AFFECTEE").map((d) => d.reference).at(-1);
  await fetch(`${API}/acquisition/dossiers/${reference}/affectation`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: "{}" });
  const reponses = [
    ["salaries_a_traiter", 12], ["numero_employeur_cnps", "0912345678"], ["groupe_risque_cnps", "B"],
    ["avantages_en_nature", "LOGEMENT"], ["elements_variables", "SYSTEMATIQUES"], ["reprise_historique", 0],
    ["premiere_paie_souhaitee", "2026-11-01"],
  ].map(([code, valeur]) => ({ code, valeur }));
  const q = await fetch(`${API}/acquisition/dossiers/${reference}/qualification`, {
    method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ reponses }),
  });
  if (q.status !== 200) throw new Error(`qualification : ${q.status} ${await q.text()}`);
  const sql = `update dossier_commercial set etat='PAYEE', donnees = jsonb_set(donnees::jsonb, '{etat}', '"PAYEE"')::json where reference='${reference}'`;
  execFileSync("docker", ["compose", "-p", PILE, "exec", "-T", "base", "sh", "-c", `psql -U "\${POSTGRES_USER:-cga}" -d "\${POSTGRES_DB:-cga}" -c "${sql.replaceAll('"', '\\"')}"`], {
    cwd: new URL("../..", import.meta.url).pathname, stdio: "inherit",
  });
  return reference;
}

const reference = await horsChamp();
console.log(`Dossier ${reference} qualifié et réglé, hors champ.`);
const plateau = await ouvrirLePlateau(SORTIE);
const { page } = plateau;
const debut = Date.now();
console.log("Tournage en cours…\n");

await chapitre("ouverture", async () => {
  await carton(page, {
    type: "ouverture",
    sur: "CGA Broad Range Consulting Group · Portefeuille",
    titre: "L'entreprise existante <em>entre au portefeuille</em>",
    sous: "Une société déjà immatriculée a réglé sa paie. Elle s'inscrit depuis son dossier commercial : ce qu'elle a déjà dit ne se ressaisit pas.",
    pied: "Présentation de l'avancement du développement · 16 octobre 2026<br><b>Zayra Technologies</b> · Entreprise porteuse du projet",
  }, 10000);
});

await chapitre("1 · l'inscription, préremplie", async () => {
  const C = "À la direction";
  await seConnecter(page, DIRECTION, C, "Bernadette MBALLA, direction, ouvre le portefeuille du cabinet.");
  await aller(page, `${CONSOLE}/fr/portefeuille`, C, "En tête : les entreprises payées qui attendent leur inscription.");
  await projecteur(page, ".inscriptions__ligne", { tenir: 2600 });
  await legende(page, C, "La Briqueterie du Wouri a réglé la paie : elle n'est encore qu'un dossier commercial.");
  await souffle(4200);
  await page.getByRole("button", { name: "Inscrire au portefeuille" }).first().click();
  await souffle(1200);
  const f = page.locator("form.inscriptions__formulaire").first();
  await centrer(f);
  await legende(page, C, "Le formulaire reprend le nom, le téléphone, le groupe de risque CNPS et le numéro employeur répondus au questionnaire.");
  await souffle(6200);
  await legende(page, C, "Elle vérifie l'identité fiscale sur la carte de contribuable et le RCCM, et complète.");
  await saisir(page, "form.inscriptions__formulaire input[name=niu]", NIU);
  await f.locator("input[name=denomination]").fill("BRIQUETERIE DU WOURI SARL");
  await f.locator("select[name=forme_juridique]").selectOption("SARL");
  await f.locator("input[name=date_creation]").fill("2019-05-06");
  await saisir(page, "form.inscriptions__formulaire input[name=rccm]", "RC/DLA/2019/B/1234");
  await f.locator("select[name=regime]").selectOption("REEL");
  await f.locator("select[name=centre]").selectOption("CIME");
  await f.locator("input[name=groupe_risque_notifie_le]").fill("2024-02-01");
  await saisir(page, "form.inscriptions__formulaire textarea[name=justification]", "Carte de contribuable, RCCM et notification CNPS vus ce jour.");
  await legende(page, C, "Elle dit les pièces vues : la phrase part au journal d'audit, comme pour toute inscription de statut.");
  await souffle(2600);
  await f.getByRole("button", { name: "Inscrire", exact: true }).click();
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(2600);
  const ligne = page.getByRole("link", { name: "BRIQUETERIE DU WOURI SARL" }).first();
  await centrer(ligne);
  await legende(page, C, "La société est au portefeuille : régime réel, centre CIME, exercice 2026 ouvert. L'adhésion se fait ensuite, par son propre geste.");
  await souffle(6200);
});

await chapitre("2 · la paie reprend le groupe", async () => {
  const C = "La paie";
  await aller(page, `${CONSOLE}/fr/social?dossier=${NIU}`, C, "La paie du nouveau dossier : le groupe de risque CNPS y est déjà.");
  await projecteur(page, ".groupe-risque", { tenir: 2600 });
  await legende(page, C, "Groupe B, notifié le 1er février 2024 : chaque bulletin et chaque DIPE l'appliquent, sans qu'on le redemande.");
  await souffle(6200);
});

await chapitre("fin", async () => {
  await carton(page, {
    type: "chapitre", num: "Ce que ce flux change",
    titre: "Ce que le client a dit une fois sert partout",
    sous: "La réponse donnée au questionnaire commercial devient le groupe CNPS de la paie. Le cabinet vérifie l'identité fiscale, il ne ressaisit rien.",
  }, 10000);
});

const images = await plateau.fermer();
console.log(`\nImages reçues du navigateur : ${images}`);
console.log(`Durée du tournage : ${Math.round((Date.now() - debut) / 1000)} s`);
console.log(`Fichier : ${SORTIE}`);
