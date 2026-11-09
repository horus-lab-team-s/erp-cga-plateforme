/**
 * Le second facteur des films : le code du moment, et l'attente de la tranche suivante.
 *
 * ⚠️ UN CODE NE SERT QU'UNE FOIS (19 octobre 2026). Le serveur retient la dernière
 * tranche de trente secondes acceptée : un film qui active la clé puis renforce la
 * session dans la même tranche serait refusé. `codeNeuf` attend la tranche suivante.
 */
import { createHmac } from "node:crypto";

function base32(texte) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of texte.replace(/[=\s]+/g, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const octets = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) octets.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(octets);
}

const tranche = () => Math.floor(Date.now() / 1000 / 30);

/** RFC 6238 : SHA-1, six chiffres, tranches de trente secondes, comme le serveur. */
export function codeDuMoment(secret) {
  const compteur = Buffer.alloc(8);
  compteur.writeBigUInt64BE(BigInt(tranche()));
  const h = createHmac("sha1", base32(secret)).update(compteur).digest();
  const depart = h[h.length - 1] & 0x0f;
  return String((h.readUInt32BE(depart) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

let derniere = -1;

/** Un code d'une tranche jamais servie : attend, s'il le faut, la suivante. */
export async function codeNeuf(secret) {
  while (tranche() <= derniere) await new Promise((r) => setTimeout(r, 500));
  derniere = tranche();
  return codeDuMoment(secret);
}
