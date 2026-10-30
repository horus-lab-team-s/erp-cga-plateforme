/**
 * HORS CHAMP, pour les films mobiles : la CNPS de juillet de Bâtiment Plus arrêtée par la
 * comptable, puis appelée par la réviseure. Les mêmes gestes que le film web 1, sans les
 * filmer : l'adhérent trouve sur son téléphone un montant à régler par mobile money.
 *
 *     TOURNAGE_CONSOLE=http://localhost:3011 node mobile/preparer-cnps-appelee.mjs
 */
import { CONSOLE, PLAYWRIGHT, SECRET } from "../outils.mjs";

const BATIMENT = "M081234567890P";
const { chromium } = await import(PLAYWRIGHT);
const navigateur = await chromium.launch({ channel: "chrome", headless: true });

async function sous(courriel, geste) {
  const contexte = await navigateur.newContext({ locale: "fr-FR", timezoneId: "Africa/Douala" });
  const page = await contexte.newPage();
  await page.goto(`${CONSOLE}/fr/connexion`);
  await page.locator('input[name="courriel"]').fill(courriel);
  await page.locator('input[name="motDePasse"]').fill(SECRET);
  await Promise.all([page.waitForURL(/tableau-de-bord|mon-espace|caisse/, { timeout: 25000 }), page.locator('button[type="submit"]').first().click()]);
  await geste(page);
  await contexte.close();
}

await sous("l.fotso@cga-brcg.cm", async (page) => {
  await page.goto(`${CONSOLE}/fr/social?dossier=${BATIMENT}&annee=2026&mois=7`, { waitUntil: "networkidle" });
  await page.locator("form.arrete-charges button[type=submit]").click();
  await page.waitForSelector(".arrete-charges__retour", { timeout: 15000 });
  console.log("arrêté :", await page.locator(".arrete-charges__retour").textContent());
});

await sous("a.bouba@cga-brcg.cm", async (page) => {
  await page.goto(`${CONSOLE}/fr/obligations?dossier=${BATIMENT}`, { waitUntil: "networkidle" });
  const ligne = page.locator("li.fonds-sous-mandat", { hasText: /cotisations/i }).filter({ hasText: "01/07/2026" }).first();
  console.log("montant proposé :", await ligne.locator('input[name="montant"]').inputValue());
  await ligne.locator("button[type=submit]").click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
  console.log("appelé.");
});

await navigateur.close();
