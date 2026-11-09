/**
 * LE MONTAGE D'UNE VIDÉO À PARTIR D'UN PROGRAMME (15 octobre 2026).
 *
 * Un programme décrit la vidéo : ses cartons (générés ici) et ses flux (déjà tournés,
 * déposés dans `Docs/demonstration`). Le montage génère les cartons, assemble le tout
 * SANS RÉENCODAGE, et écrit le sommaire horodaté à côté de la vidéo.
 *
 *     node montage.mjs programmes/evolution-2026-10-15.mjs
 *
 * ⚠️ SANS RÉENCODAGE : `-f concat -c copy`. Toutes les séquences sortent du même
 * plateau (1600×900, 30 i/s, H.264) : les recoller ne perd rien, et une vidéo livrée au
 * client n'a pas à être plus floue que l'écran filmé. Une séquence d'un autre format
 * ferait échouer ou dérailler la copie : `verifierLeFormat` la refuse avant.
 *
 * ⚠️ LE SOMMAIRE SE CALCULE SUR LES DURÉES RÉELLES, lues dans chaque fichier : un
 * horodatage écrit à la main se décale au premier carton rallongé.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { carton, ouvrirLePlateau } from "./outils.mjs";

const FFMPEG =
  process.env.TOURNAGE_FFMPEG ??
  "/home/tchakounte/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";
const FORMAT_ATTENDU = /h264 .*1600x900.*30 fps/;

/** Ce que ffmpeg dit d'un fichier : sa durée en secondes et sa ligne vidéo. */
function decrire(fichier) {
  let sortie = "";
  try {
    execFileSync(FFMPEG, ["-hide_banner", "-i", fichier], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    // ffmpeg sans sortie demandée rend 1 : ce qu'il décrit est sur stderr.
    sortie = String(e.stderr ?? "");
  }
  const duree = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(sortie);
  const video = /Stream .*Video: (.*)/.exec(sortie);
  if (!duree || !video) throw new Error(`illisible : ${fichier}\n${sortie.slice(-400)}`);
  return { secondes: +duree[1] * 3600 + +duree[2] * 60 + +duree[3], video: video[1] };
}

function verifierLeFormat(fichier) {
  const { video } = decrire(fichier);
  if (!FORMAT_ATTENDU.test(video)) {
    throw new Error(`${fichier} n'est pas au format du plateau (1600×900, 30 i/s, H.264) : ${video}`);
  }
}

const horodatage = (s) => {
  const t = Math.round(s);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const cheminDuProgramme = process.argv[2];
if (!cheminDuProgramme) throw new Error("usage : node montage.mjs <programme.mjs>");
const { default: programme } = await import(pathToFileURL(resolve(cheminDuProgramme)).href);
const ICI = dirname(new URL(import.meta.url).pathname);
const DOCS = resolve(ICI, programme.docs);
const CARTONS = join(ICI, "sortie", programme.nom);
mkdirSync(CARTONS, { recursive: true });

// 1 · Les cartons, un fichier chacun.
const sequences = [];
for (const [rang, s] of programme.sequences.entries()) {
  if (s.carton) {
    const fichier = join(CARTONS, `${String(rang).padStart(2, "0")}-carton.mp4`);
    const plateau = await ouvrirLePlateau(fichier);
    await carton(plateau.page, s.carton, s.duree ?? 8000);
    await plateau.fermer();
    sequences.push({ ...s, fichier });
    console.log(`  ✓ carton ${rang}`);
  } else {
    sequences.push({ ...s, fichier: join(DOCS, s.flux) });
  }
}

// 2 · Le format, puis l'assemblage sans réencodage.
for (const s of sequences) verifierLeFormat(s.fichier);
const liste = join(CARTONS, "liste.txt");
writeFileSync(liste, sequences.map((s) => `file '${s.fichier.replaceAll("'", "'\\''")}'`).join("\n") + "\n");
const video = join(DOCS, programme.fichier);
execFileSync(FFMPEG, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", liste, "-c", "copy", "-movflags", "+faststart", video], {
  stdio: "inherit",
});

// 3 · Le sommaire, sur les durées réelles.
let t = 0;
const lignes = [`# ${programme.titre}`, "", `*${programme.date} · \`${programme.fichier}\` · ${horodatage(decrire(video).secondes).replace(":", " min ")}*`, "", programme.avertissement, ""];
for (const s of sequences) {
  if (s.sommaire) lignes.push(s.niveau === 2 ? `- ${horodatage(t)} · ${s.sommaire}` : `\n**${horodatage(t)} · ${s.sommaire}**`);
  t += decrire(s.fichier).secondes;
}
writeFileSync(join(DOCS, programme.fichier.replace(/\.mp4$/, "-sommaire.md")), lignes.join("\n") + "\n");
console.log(`\nVidéo : ${video} (${horodatage(t)})`);
