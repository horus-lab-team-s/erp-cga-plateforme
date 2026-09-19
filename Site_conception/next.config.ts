import type { NextConfig } from "next";

/**
 * Le site du document de conception.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ AUCUNE RÉÉCRITURE DU CONTENU
 *
 * Le document est la source ; ce projet ne fait que le servir. Tout ce qui
 * ressemblerait à une transformation du texte (coupe, résumé, reformatage)
 * créerait une seconde version du document, et c'est elle qu'on lirait.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const config: NextConfig = {
  reactStrictMode: true,
  // ⚠️ PAS DE SORTIE AUTONOME SUR VERCEL, ET CE N'EST PAS UN CAPRICE.
  //
  // Next.js 16.3 a un défaut connu (vercel/next.js#96646) : dès qu'un adaptateur
  // de déploiement est présent — celui de Vercel l'est —, Turbopack CESSE
  // d'écrire `.next/next-server.js.nft.json`, le relevé des fichiers dont le
  // serveur a besoin. Or le finalisateur de `standalone` continue de le lire,
  // sans rattrapage. La construction s'effondre sur un `ENOENT` à la toute fin,
  // après avoir engendré toutes les pages.
  //
  // ⚠️ Le défaut NE SE REPRODUIT PAS en local : sans adaptateur, le relevé est
  // bien écrit, et la construction passe des deux façons. Chercher la cause ici
  // ne mène donc nulle part, et c'est pour cela que ce commentaire existe.
  //
  // À retirer quand le correctif sera livré (prévu pour 16.4).
  output: process.env.VERCEL ? undefined : "standalone",

  /**
   * ⚠️ Le document est servi par un fichier, pas par un composant React.
   *
   * Mesuré sur ce document : rendu par React, il partait **deux fois** (le HTML, puis la
   * même chose dans la charge utile de navigation), soit 2,17 Mo servis et 340 Ko
   * compressés pour 966 Ko de texte. La page ne porte aucun état : elle est assemblée à
   * la construction par `outils/importer-le-document.mjs` et servie comme fichier.
   *
   * ⚠️ **Seul le document est concerné.** Les autres pages du site, accueil, prérequis
   * et mise en œuvre, pèsent quelques kilo-octets et restent des pages React : c'est
   * la taille du contenu qui décide, pas une préférence de principe.
   */
  async rewrites() {
    return [{ source: "/document", destination: "/document.html" }];
  },
};

export default config;
