/**
 * Les gestes de camera, isoles du scenario.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ POURQUOI UNE SEULE PAGE POUR TOUTE LA VIDEO.
 *
 * Playwright enregistre UNE video PAR PAGE. Ouvrir un onglet par chapitre
 * rendrait douze fichiers qu'il faudrait recoller, et recoller demande ffmpeg,
 * qui n'est pas installe sur ce poste. Une seule page du debut a la fin rend un
 * seul fichier, continu, sans aucun montage.
 *
 * C'est aussi pourquoi le tournage navigue d'une application a l'autre au lieu
 * de les ouvrir cote a cote : la continuite est a ce prix.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ⚠️ Les cartons vivent A COTE de ce fichier, et leur adresse en est deduite.
// Elle pointait un dossier temporaire de seance : au redemarrage du poste, le
// 14 octobre 2026, tout l'outillage de tournage avait disparu avec lui.
export const CARTE = new URL("./cartes.html", import.meta.url).href;

export const VITRINE = process.env.TOURNAGE_VITRINE ?? "http://localhost:3101";
export const CONSOLE = process.env.TOURNAGE_CONSOLE ?? "http://localhost:3100";
export const COURRIER = process.env.TOURNAGE_COURRIER ?? "http://localhost:8026";

/** Playwright est emprunte a la console, qui l'installe deja pour ses essais. */
export const PLAYWRIGHT = new URL("../../../erp-cga-console/node_modules/playwright/index.mjs", import.meta.url).href;
export const SECRET = "cabinet brcg douala 2026";

/** Le temps d'une respiration. Tout le rythme de la video se regle ici. */
export const souffle = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

/* ──────────────────────────────────────────────────────────────────────────
   LE TEMPS DE LIRE
   ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ UNE LEGENDE N'EST REMPLACEE QU'APRES AVOIR PU ETRE LUE.
 *
 * Les videos se regardent seules, sans voix. Mesure le 13 octobre 2026 : une
 * legende sur trois defilait au-dela de 22 caracteres par seconde. Un sous-titre
 * se lit confortablement autour de 15.
 *
 * Chaque legende note l'instant avant lequel elle ne doit pas disparaitre, et
 * tout ce qui la remplacerait ou quitterait l'ecran attend cet instant :
 * `legende`, `aller`, `carton`, `seConnecter`, et `lecture()` avant un clic qui
 * navigue.
 */
const CARACTERES_PAR_SECONDE = 15;
let lisibleJusqua = 0;

export async function lecture() {
  const reste = lisibleJusqua - Date.now();
  if (reste > 0) await souffle(reste);
}

function noterLaLecture(texte) {
  const lu = String(texte).replace(/<[^>]+>/g, "");
  lisibleJusqua = Date.now() + 900 + (lu.length * 1000) / CARACTERES_PAR_SECONDE;
}

/* ──────────────────────────────────────────────────────────────────────────
   LES CARTONS
   ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ LA DATE DU TOURNAGE (30 octobre 2026). Chaque film porte sur ses cartons la date de sa
 * premiere prise (« 14 octobre 2026 », « Mises a jour du 20 octobre 2026 »). Rejoues pour une
 * nouvelle serie, ils mentiraient sur la version filmee. `TOURNAGE_DATE="30 octobre 2026"`
 * remplace ces dates sur les cartons, sans toucher aux scenarios.
 */
const DATE_DU_TOURNAGE = process.env.TOURNAGE_DATE;
function dater(demande) {
  if (!DATE_DU_TOURNAGE) return demande;
  const remplacer = (texte) => typeof texte !== "string" ? texte : texte
    .replace(/Mises à jour du \d{1,2} octobre 2026/g, `Version du ${DATE_DU_TOURNAGE}`)
    .replace(/\d{1,2} octobre 2026/g, DATE_DU_TOURNAGE);
  return Object.fromEntries(Object.entries(demande).map(([cle, valeur]) => [cle, remplacer(valeur)]));
}

/** Affiche un carton et le laisse a l'ecran le temps qu'on le lise. */
export async function carton(page, demande, duree = 6000) {
  demande = dater(demande);
  await lecture();
  await page.goto(`${CARTE}#${encodeURIComponent(JSON.stringify(demande))}`,
                  { waitUntil: "load" });
  // Les elements du carton apparaissent un par un ; la duree compte a partir
  // du moment ou le dernier est pose, sinon on coupe sur une animation.
  await souffle(duree);
}

/* ──────────────────────────────────────────────────────────────────────────
   LA LEGENDE, POSEE SUR LES ECRANS REELS
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Pose, en bas de l'ecran filme, le nom du chapitre et ce qui se passe.
 *
 * ⚠️ TOUT EST ECRIT PAR LE CSSOM, jamais par une balise <style> ni par un
 * attribut style= dans du HTML analyse. La console sert une politique de
 * contenu stricte, avec un nonce ; une balise de style injectee serait
 * refusee par le navigateur et la legende n'apparaitrait pas, en silence.
 */
export async function legende(page, chapitre, texte) {
  await lecture();
  await page.evaluate(({ chapitre, texte }) => {
    let barre = document.getElementById("cga-legende");
    if (!barre) {
      barre = document.createElement("div");
      barre.id = "cga-legende";
      Object.assign(barre.style, {
        position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "2147483647",
        padding: "16px 36px 18px", display: "flex", alignItems: "baseline", gap: "20px",
        // Opaque des le premier quart : le bandeau d'offre du site vit au meme
        // endroit, et transparaissait sous le texte.
        background: "linear-gradient(180deg, rgba(14,8,24,.0) 0%, rgba(14,8,24,.98) 24%, rgba(14,8,24,.99) 100%)",
        font: "400 19px/1.45 Inter, 'Segoe UI', system-ui, sans-serif",
        color: "#f4f1f8", pointerEvents: "none",
        borderTop: "0", minHeight: "76px", boxSizing: "border-box",
      });

      const marque = document.createElement("span");
      marque.id = "cga-legende-chapitre";
      Object.assign(marque.style, {
        font: "700 11px/1 Inter, 'Segoe UI', system-ui, sans-serif",
        letterSpacing: ".2em", textTransform: "uppercase", color: "#d47fcb",
        whiteSpace: "nowrap", flex: "0 0 auto", paddingTop: "5px",
        borderLeft: "3px solid #c05fb8", paddingLeft: "13px",
      });

      const dit = document.createElement("span");
      dit.id = "cga-legende-texte";
      Object.assign(dit.style, { flex: "1 1 auto" });

      barre.appendChild(marque);
      barre.appendChild(dit);
      document.body.appendChild(barre);
    }
    const marque = document.getElementById("cga-legende-chapitre");
    const dit = document.getElementById("cga-legende-texte");
    const change = dit.textContent !== texte;
    marque.textContent = chapitre;
    dit.innerHTML = texte;
    // Un leger fondu a chaque changement : sans lui, le texte saute et l'oeil
    // ne sait pas qu'il doit relire.
    if (change) {
      dit.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
                  { duration: 320, easing: "cubic-bezier(.2,.7,.3,1)" });
    }
  }, { chapitre, texte });
  noterLaLecture(texte);
}

/** Retire la legende : utile avant une capture qui doit montrer le bas de page. */
export async function effacerLaLegende(page) {
  await page.evaluate(() => document.getElementById("cga-legende")?.remove());
}

/* ──────────────────────────────────────────────────────────────────────────
   LES DEPLACEMENTS DANS LA PAGE
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Va a une adresse, attend que l'ecran soit reellement pose, et remet la
 * legende — qu'une navigation efface forcement.
 */
export async function aller(page, adresse, chapitre, texte, { attente = 1400 } = {}) {
  await lecture();
  await page.goto(adresse, { waitUntil: "domcontentloaded" });
  // ⚠️ `domcontentloaded` ne suffit pas pour Next : l'hydratation repeint. On
  // laisse le temps a l'ecran de se stabiliser, sinon la video montre un
  // squelette puis un saut.
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(attente);
  if (texte) await legende(page, chapitre, texte);
  await souffle(500);
}

/** Descend doucement dans la page, par paliers lisibles. */
export async function descendre(page, { pas = 480, pause = 1250, paliers = 5 } = {}) {
  for (let i = 0; i < paliers; i++) {
    const enBas = await page.evaluate((pas) => {
      const avant = window.scrollY;
      window.scrollBy({ top: pas, behavior: "smooth" });
      const hauteur = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      return avant + window.innerHeight >= hauteur - 8;
    }, pas).catch(() => true);
    await souffle(pause);
    if (enBas) break;
  }
}

/** Remonte en haut, d'un geste. */
export async function remonter(page, pause = 900) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" })).catch(() => undefined);
  await souffle(pause);
}

/**
 * Entoure un element d'un halo le temps qu'on le remarque.
 *
 * ⚠️ L'ancienne ombre est remise apres coup : certains elements de la console
 * en portent une, et la perdre definitivement se verrait au chapitre suivant.
 */
export async function projecteur(page, selecteur, { tenir = 2600, centrer = true } = {}) {
  await page.evaluate(({ selecteur, tenir, centrer }) => {
    const cible = document.querySelector(selecteur);
    if (!cible) return false;
    if (centrer) cible.scrollIntoView({ behavior: "smooth", block: "center" });
    const avant = { ombre: cible.style.boxShadow, transition: cible.style.transition };
    cible.style.transition = "box-shadow .45s ease";
    cible.style.boxShadow = "0 0 0 3px #c05fb8, 0 0 30px 8px rgba(192,95,184,.42)";
    setTimeout(() => {
      cible.style.boxShadow = avant.ombre;
      setTimeout(() => { cible.style.transition = avant.transition; }, 500);
    }, tenir);
    return true;
  }, { selecteur, tenir, centrer }).catch(() => false);
  await souffle(900);
}

/** Saisit un texte au rythme d'une main, et non d'un collage. */
export async function saisir(page, selecteur, valeur, { cadence = 42 } = {}) {
  const champ = page.locator(selecteur).first();
  await champ.scrollIntoViewIfNeeded().catch(() => undefined);
  await champ.click({ timeout: 8000 }).catch(() => undefined);
  await champ.pressSequentially(String(valeur), { delay: cadence }).catch(async () => {
    await champ.fill(String(valeur)).catch(() => undefined);
  });
  await souffle(220);
}

/* ──────────────────────────────────────────────────────────────────────────
   LA CONNEXION A LA CONSOLE
   ────────────────────────────────────────────────────────────────────────── */

/** Ouvre une session pour un compte de demonstration, camera tournante. */
export async function seConnecter(page, courriel, chapitre, texte, motDePasse = SECRET) {
  await lecture();
  await page.goto(`${CONSOLE}/fr/deconnexion`, { waitUntil: "domcontentloaded" }).catch(() => undefined);
  await page.goto(`${CONSOLE}/fr/connexion`, { waitUntil: "domcontentloaded" });
  await souffle(1200);
  if (texte) await legende(page, chapitre, texte);
  await souffle(900);
  await saisir(page, 'input[name="courriel"]', courriel, { cadence: 34 });
  await saisir(page, 'input[name="motDePasse"]', motDePasse, { cadence: 28 });
  await souffle(500);
  await lecture();
  await Promise.all([
    page.waitForURL(/tableau-de-bord|mon-espace|ma-creation|caisse/, { timeout: 25000 }).catch(() => undefined),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  await souffle(1500);
}

/** Dit ce qui s'est mal passe sans arreter le tournage pour autant. */
export async function chapitre(nom, jouer) {
  const depart = Date.now();
  try {
    await jouer();
    console.log(`  ✓ ${nom} (${Math.round((Date.now() - depart) / 1000)} s)`);
  } catch (echec) {
    console.log(`  ✗ ${nom} : ${echec.message.split("\n")[0]}`);
  }
}

/** Amene un element au milieu de l'ecran, doucement. */
export async function centrer(lieu) {
  await lieu.first().evaluate((n) => n.scrollIntoView({ behavior: "smooth", block: "center" }))
    .catch(() => undefined);
  await souffle(1100);
}

/**
 * Ouvre le navigateur de tournage : une seule page, et sa capture.
 *
 * ⚠️ `LANGUAGE` et `LANG` : `--lang` ne suffit pas sous Linux, et sans elles les
 * champs natifs (date, fichier) parlent anglais en pleine console.
 */
export async function ouvrirLePlateau(sortie) {
  const { chromium } = await import(PLAYWRIGHT);
  const { demarrerLaCapture } = await import("./capture.mjs");
  const navigateur = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--force-color-profile=srgb", "--font-render-hinting=none",
           "--disable-lcd-text", "--hide-scrollbars", "--lang=fr-FR"],
    env: { ...process.env, LANGUAGE: "fr_FR", LANG: "fr_FR.UTF-8" },
  });
  const contexte = await navigateur.newContext({
    viewport: { width: 1600, height: 900 },
    locale: "fr-FR",
    timezoneId: "Africa/Douala",
    deviceScaleFactor: 1,
  });
  const page = await contexte.newPage();
  page.setDefaultTimeout(20000);
  // Le formulaire du site ouvre aussi un brouillon de courriel : on l'absorbe.
  page.on("dialog", (boite) => boite.dismiss().catch(() => undefined));
  const arreter = await demarrerLaCapture(contexte, page, sortie);
  return {
    navigateur, contexte, page,
    async fermer() {
      await lecture();
      const images = await arreter();
      await contexte.close();
      await navigateur.close();
      return images;
    },
  };
}
