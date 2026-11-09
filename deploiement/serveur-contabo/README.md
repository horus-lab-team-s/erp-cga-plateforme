# CGA BRCG sur le serveur Contabo de la cliente

Préparé le 8 novembre 2026. Serveur `ssh gathe-client` (`deploy@169.58.69.78`, Ubuntu 24.04,
11 Go). **Gathe Finance y tourne déjà et n'est pas à toucher** : ce déploiement n'en lit ni n'en
modifie aucun fichier.

| Adresse | Service | Routeur Traefik |
|---|---|---|
| https://cga-brcgroup.com (www. y renvoie) | site public (vitrine) | `cga-vitrine` |
| https://console.cga-brcgroup.com | console du cabinet, espace adhérent | `cga-console` |
| https://api.cga-brcgroup.com | API, appelée aussi par l'application mobile | `cga-api`, `cga-api-secrets` |

## Comment le serveur est organisé (et ce que CGA en utilise)

- `/srv/edge` : **Traefik**, seul sur 80/443. Il découvre les conteneurs par leurs étiquettes
  (réseau `edge`) et obtient seul un certificat Let's Encrypt par nom (`le-http`). Ses middlewares
  communs : `securise` (en-têtes, sur tout `websecure`), `chaine-web` (en plus : compression,
  100 requêtes/s par adresse). CGA s'y raccorde par ses étiquettes ; il ne modifie rien dans `/srv/edge`.
- `/srv/services` : Postgres, Redis et MinIO partagés (réseau `data`). **CGA ne les utilise pas** :
  il garde sa base à lui (trois rôles, cloisonnement par ligne), sur son réseau interne.
- `/srv/projects/cga` : tout CGA (droits 700) : `docker-compose.yml`, `.env`, `api.env`, les
  scripts et `sauvegardes/`. Projet compose `cga`, conteneurs `cga-*-1`.
- Gathe Finance est ailleurs (`/home/gathe/...`), sur ses propres réseaux.

## DNS (zone O2Switch de cga-brcgroup.com), fait le 8 novembre 2026

- `cga-brcgroup.com`, `www`, `console`, `api` : A vers 169.58.69.78.
- Le courrier reste chez O2Switch : `mail` en A vers 109.234.165.14, MX vers `mail.cga-brcgroup.com`.
- À faire pour Brevo : déclarer `cga-brcgroup.com` dans le compte Brevo et poser dans la zone
  les entrées SPF et DKIM qu'il indique (expéditeur `noreply@cga-brcgroup.com`).

## Première mise en ligne

1. **Depuis le poste**, `deploiement/serveur-contabo/deployer.sh`. À la première montée, il crée
   `.env` (mots de passe des rôles) et `api.env` (clé de chiffrement), tirés au hasard sur le
   serveur, puis s'arrête : le relais SMTP n'est pas rempli.
2. **Sur le serveur**, reprendre les clés Brevo et Tara de Gathe Finance sans les afficher.
   Gathe Finance n'a que la **clé d'API** Brevo (pas de clé SMTP) : CGA l'utilise telle quelle
   (`CGA_BREVO_CLE_API`, envoi par l'API de Brevo ; voir `transport_brevo.py` dans le serveur).

       cd /srv/projects/cga
       sudo ./reprendre-cles.sh --noms /home/gathe/gathe-finance/infra/.env.prod   # les noms seulement
       sudo ./reprendre-cles.sh /home/gathe/gathe-finance/infra/.env.prod \
            BREVO_API_KEY=CGA_BREVO_CLE_API \
            TARA_API_KEY=CGA_TARA_CLE_API TARA_BUSINESS_ID=CGA_TARA_IDENTIFIANT_MARCHAND

   Le script n'écrit que `api.env` (sauvegardé avant en `api.env.avant-reprise`) et ne montre
   aucune valeur. ⚠️ Avec les clés Tara de Gathe Finance, les paiements arrivent sur ce compte
   marchand. L'adresse de rappel part avec chaque paiement : rien à déclarer chez Tara.
   ⚠️ Brevo n'envoie que depuis un domaine authentifié dans ce compte : `cga-brcgroup.com`
   doit y être validé (SPF, DKIM), sinon chaque envoi est refusé (visible dans le journal de l'API).
3. **Depuis le poste**, relancer `deployer.sh` : la pile démarre, Traefik la découvre et fait
   les certificats au premier appel, la sauvegarde est planifiée (3 h 40), CGA est inscrit au
   registre `/srv/README.md`.
4. **Le premier compte** (une seule fois ; il invite ensuite les autres depuis la console) :

       cd /srv/projects/cga && docker compose --env-file .env exec api \
         python -m app.premier_administrateur --courriel tchambaedwin@gmail.com --nom … --prenom …

   Il reçoit ADMINISTRATEUR et SUPER_ADMIN, et son lien d'activation s'affiche (et part par courriel).
   **Des comptes d'essai, un par rôle** (`tchambaedwin+comptable@gmail.com`, …), actifs, mot de
   passe tiré au hasard et affiché une seule fois :

       docker compose --env-file .env exec api python -m app.comptes_de_test --base tchambaedwin@gmail.com
       #   --niu <NIU> ajoute ADHERENT et INSPECTEUR sur ce dossier ; --creation CRE-… CLIENT_CREATION
       docker compose --env-file .env exec api python -m app.comptes_de_test --base tchambaedwin@gmail.com --retirer

   ⚠️ Ce sont des comptes réels : `--retirer` les suspend, à faire avant l'ouverture au public.

5. **L'application mobile** : une nouvelle version, compilée avec l'adresse
   `https://api.cga-brcgroup.com`, puis posée sur le site (`erp-cga-vitrine/outils/publier-apk.sh`).

## Mettre à jour

⚠️ **Construire sur le serveur** quand la liaison du poste est lente :
`construire-sur-le-serveur.sh [api] [console] [vitrine]` envoie le code des commits (quelques Mo)
et le serveur construit les mêmes images, à la même étiquette ; `deployer.sh` les retrouve ensuite.

Comme sur Zayra : `deployer.sh` (ou `SEULEMENT=api|console|vitrine deployer.sh`, ou
`couche-api.sh` quand seul le code Python a changé). Les deux dernières étiquettes restent sur le
serveur pour revenir en arrière (`ETIQUETTE=` dans `.env`, puis `docker compose up -d`).

Le mode de présentation : `/srv/projects/cga/presentation.sh ouvrir | fermer | etat`.

## Ce qu'il faut savoir

- ⚠️ **`api.env` et `.env` ne sont jamais réécrits** par le déploiement. Les copier dans un coffre,
  hors du serveur : la clé `CGA_CLE_CHIFFREMENT` perdue rend illisibles les seconds facteurs.
- ⚠️ **Traefik lit une requête en 60 s au plus** (`readTimeout` de `websecure`, réglage commun à
  tout le serveur). Un scan de 20 Mo sur une liaison lente (moins de 350 Ko/s) peut échouer. On
  ne le change pas d'ici : il vaut pour Gathe Finance aussi.
- **Limites propres à CGA** (middlewares `cga-*`) : 25 Mo par requête sur la console et l'API,
  12 Mo sur le site ; 10 essais par minute et par adresse sur la connexion, le mot de passe,
  l'activation et le second facteur.
- **Sauvegardes** : `/srv/projects/cga/sauvegardes`, base, rôles et pièces déposées, relues après
  coup, gardées 14 jours ; journal `sauvegardes/journal.log`. ⚠️ **Il manque une copie hors du
  serveur** : à organiser.
- **Mémoire** : chaque service a son plafond (environ 2,9 Go au plus en tout ; 9,9 Go disponibles
  le 8 novembre 2026).
