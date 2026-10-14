/**
 * La capture en pleine qualite.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ POURQUOI PAS L'ENREGISTREUR DE PLAYWRIGHT.
 *
 * Il rend un WebM VP8 a debit fixe, autour de 650 kbit/s en 1600 x 900 : net sur
 * un ecran immobile, brouille des que la page defile. Aucun reglage ne le monte.
 *
 * Ici le navigateur envoie ses images une a une (protocole de developpement,
 * JPEG a 95), et elles partent directement dans ffmpeg, horodatees a l'arrivee.
 * Rien n'est stocke entre les deux : un quart d'heure d'images en fichiers
 * peserait plusieurs gigaoctets.
 *
 * ⚠️ LE NAVIGATEUR NE REND UNE IMAGE QUE SI L'ECRAN CHANGE. Sur un carton
 * immobile il se tait, et l'encodeur croirait la video arretee. Un battement
 * renvoie donc la derniere image tant que rien de neuf n'arrive.
 *
 * ⚠️ FFMPEG N'EST PAS INSTALLE SUR LE POSTE. Celui-ci vient d'une bibliotheque
 * Python (imageio-ffmpeg) ; `TOURNAGE_FFMPEG` permet d'en designer un autre.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { spawn } from "node:child_process";
import { once } from "node:events";

const FFMPEG = process.env.TOURNAGE_FFMPEG ??
  "/home/tchakounte/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";

export async function demarrerLaCapture(contexte, page, sortie) {
  const encodeur = spawn(FFMPEG, [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-use_wallclock_as_timestamps", "1", "-c:v", "mjpeg", "-i", "-",
    "-vf", "fps=30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "14",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", sortie,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  encodeur.stdin.on("error", () => undefined);

  const session = await contexte.newCDPSession(page);
  let derniere = null, ecrite = 0, recues = 0;
  const ecrire = (image) => { encodeur.stdin.write(image); ecrite = Date.now(); };

  session.on("Page.screencastFrame", ({ data, sessionId }) => {
    derniere = Buffer.from(data, "base64");
    recues += 1;
    ecrire(derniere);
    session.send("Page.screencastFrameAck", { sessionId }).catch(() => undefined);
  });
  await session.send("Page.startScreencast", { format: "jpeg", quality: 95, everyNthFrame: 1 });

  const battement = setInterval(() => {
    if (derniere && Date.now() - ecrite > 90) ecrire(derniere);
  }, 45);

  return async function arreter() {
    clearInterval(battement);
    await session.send("Page.stopScreencast").catch(() => undefined);
    if (derniere) ecrire(derniere);
    encodeur.stdin.end();
    await once(encodeur, "close");
    return recues;
  };
}
