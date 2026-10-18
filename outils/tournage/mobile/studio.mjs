/**
 * MONTER UN FILM MOBILE (18 octobre 2026) : l'enregistrement de l'écran du téléphone et
 * ses légendes datées, posés dans le studio, entre un carton d'ouverture et un carton de
 * fin. Le fichier sort au format des films web (1600×900, 30 i/s, H.264) : le montage du
 * jour le recolle sans réencoder.
 *
 *     node mobile/studio.mjs mobile-1-deposer-une-piece
 *
 * Le film se décrit dans `mobile/films/<nom>.json` ; l'enregistrement et ses légendes,
 * dans `sortie/mobile/<nom>.mp4` et `.json` (produits par `filmer.py`).
 *
 * ⚠️ LE NAVIGATEUR NE JOUE PAS LA VIDÉO. Filmée par la capture d'écran du navigateur, la
 * lecture ne rendait que quatre ou cinq images par seconde : chaque défilement saccadait.
 * Le navigateur ne rend donc que le décor, une image par légende ; ffmpeg y incruste
 * l'écran du téléphone, à sa pleine cadence.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { carton, ouvrirLePlateau, PLAYWRIGHT } from "../outils.mjs";

const FFMPEG =
  process.env.TOURNAGE_FFMPEG ??
  "/home/tchakounte/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";
const nom = process.argv[2];
const film = JSON.parse(readFileSync(new URL(`./films/${nom}.json`, import.meta.url)));
const ecran = new URL(`../sortie/mobile/${nom}.mp4`, import.meta.url).pathname;
const legendes = JSON.parse(readFileSync(new URL(`../sortie/mobile/${nom}.json`, import.meta.url)));
const SORTIE = new URL(`../sortie/${nom}-prise-${process.env.PRISE ?? "x"}.mp4`, import.meta.url).pathname;
const ATELIER = new URL(`../sortie/mobile/atelier-${nom}/`, import.meta.url).pathname;
const STUDIO = new URL("./studio.html", import.meta.url).href;
const PIED = "<b>Zayra Technologies</b> · Entreprise porteuse du projet";
mkdirSync(ATELIER, { recursive: true });

const ffmpeg = (...args) => execFileSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args]);
const ENCODAGE = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30"];

/** Un carton, filmé seul par le plateau : il sort déjà au bon format. */
async function filmerUnCarton(fichier, demande, duree) {
  const plateau = await ouvrirLePlateau(fichier);
  await carton(plateau.page, demande, duree);
  await plateau.fermer();
}

await filmerUnCarton(`${ATELIER}ouverture.mp4`, {
  type: "ouverture",
  sur: "CGA Broad Range Consulting Group · L'application mobile · 18 octobre 2026",
  titre: film.titre,
  sous: film.sous,
  pied: `Démonstration jouée en direct sur l'application · 18 octobre 2026<br>${PIED}`,
}, 9000);
await filmerUnCarton(`${ATELIER}fin.mp4`, { type: "chapitre", num: "Ce que ce film montre", ...film.fin }, 9000);

// ── Le décor : une image par légende, et la place exacte de l'écran ─────────────────────

const { chromium } = await import(PLAYWRIGHT);
const navigateur = await chromium.launch({ channel: "chrome", headless: true });
const page = await navigateur.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const demande = { video: "", titre: film.titre, sur: film.sur, legendes };
await page.goto(`${STUDIO}#${encodeURIComponent(JSON.stringify(demande))}`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const place = await page.locator("#ecran").evaluate((v) => {
  const r = v.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), l: Math.round(r.width), h: Math.round(r.height) };
});
const parlees = legendes.filter((l) => !l.fin);
const fin = legendes.find((l) => l.fin)?.t ?? parlees.at(-1).t + 4;
const liste = [];
for (let i = 0; i < parlees.length; i++) {
  await page.evaluate((rang) => window.poserFixe(rang), i);
  await page.waitForTimeout(450);
  const image = `${ATELIER}decor-${String(i).padStart(2, "0")}.png`;
  await page.screenshot({ path: image });
  const debut = i === 0 ? 0 : parlees[i].t;
  const suivante = i + 1 < parlees.length ? parlees[i + 1].t : fin;
  liste.push(`file '${image}'\nduration ${(suivante - debut).toFixed(3)}`);
}
liste.push(`file '${ATELIER}decor-${String(parlees.length - 1).padStart(2, "0")}.png'`);
writeFileSync(`${ATELIER}decors.txt`, liste.join("\n") + "\n");
await navigateur.close();

// ── L'écran du téléphone, incrusté à sa place, sous les coins arrondis du cadre ─────────
//
// ⚠️ PAS DE MASQUE EN BOUCLE. Un masque répété image après image, fondu à l'écran par
// `alphamerge`, s'accumulait en mémoire sur un enregistrement à cadence variable : ffmpeg
// finissait tué. Les coins du cadre sont découpés UNE FOIS dans le décor, et posés par-dessus.

const coins = `${ATELIER}coins.png`;
execFileSync("python3", ["-c", `
from PIL import Image, ImageDraw
decor = Image.open("${ATELIER}decor-00.png").convert("RGBA").crop((${place.x}, ${place.y}, ${place.x + place.l}, ${place.y + place.h}))
trou = Image.new("L", decor.size, 255)
ImageDraw.Draw(trou).rounded_rectangle((0, 0, ${place.l - 1}, ${place.h - 1}), radius=44, fill=0)
decor.putalpha(trou)
decor.save("${coins}")
`]);
// ⚠️ L'ÉCRAN EST D'ABORD REMIS À CADENCE FIXE, SEUL. `screenrecord` laisse des trous de
// plusieurs secondes quand l'écran ne bouge pas ; incrusté tel quel, ffmpeg gardait en
// mémoire toutes les images du décor en attendant la suivante (5,7 Go pour vingt secondes).
// ⚠️ Et `screenrecord` n'émet rien sur un écran immobile en fin d'enregistrement : la
// dernière image est prolongée, sans quoi le film s'arrêtait avant sa dernière légende.
const ecranFixe = `${ATELIER}ecran-30.mp4`;
ffmpeg(
  "-i", ecran,
  "-vf", `tpad=stop_mode=clone:stop_duration=30,fps=30,scale=${place.l}:${place.h}:force_original_aspect_ratio=increase,crop=${place.l}:${place.h}`,
  "-t", (fin + 1).toFixed(2), ...ENCODAGE, ecranFixe,
);
// Le décor aussi, pour la même raison : une image tenue dix-sept secondes faisait
// attendre l'incrustation tout autant.
const decorFixe = `${ATELIER}decor-30.mp4`;
ffmpeg(
  "-f", "concat", "-safe", "0", "-i", `${ATELIER}decors.txt`,
  "-vf", "fps=30,format=yuv420p", "-t", fin.toFixed(2), ...ENCODAGE, decorFixe,
);
ffmpeg(
  "-i", decorFixe,
  "-i", ecranFixe,
  "-i", coins,
  "-filter_complex",
  `[0:v][1:v]overlay=${place.x}:${place.y}[pose];` +
  `[pose][2:v]overlay=${place.x}:${place.y}[v]`,
  "-map", "[v]", "-t", fin.toFixed(2), ...ENCODAGE, "-movflags", "+faststart", `${ATELIER}milieu.mp4`,
);

writeFileSync(`${ATELIER}morceaux.txt`, ["ouverture", "milieu", "fin"].map((m) => `file '${ATELIER}${m}.mp4'`).join("\n") + "\n");
ffmpeg("-f", "concat", "-safe", "0", "-i", `${ATELIER}morceaux.txt`, "-c", "copy", "-movflags", "+faststart", SORTIE);
console.log(`Fichier : ${SORTIE}`);
