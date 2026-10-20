# CGA BRCG sur le serveur partagé de Zayra

Mis en place le 20 octobre 2026. Serveur `ssh zayra` (81.0.246.144), une dizaine d'autres
projets y tournent derrière le même nginx (`backend-nginx-1`).

| Adresse | Service | Alias sur `cga_default` |
|---|---|---|
| https://cga-brcg.horus-lab.com | site public (vitrine) | `cga-vitrine:3000` |
| https://console.cga-brcg.horus-lab.com | console du cabinet, espace adhérent | `cga-console:3000` |
| https://api.cga-brcg.horus-lab.com | API, appelée aussi par l'application mobile | `cga-api:8000` |

Sur le serveur, tout vit dans `/opt/cga` (droits 700) : `docker-compose.yml`, `.env`,
`api.env`, `nginx/`, les scripts, et `sauvegardes/`.

## Première mise en ligne

1. **DNS** : trois enregistrements A vers 81.0.246.144 (fait le 20 octobre 2026).
2. **Depuis le poste**, `deploiement/serveur-zayra/deployer.sh`. À la première montée, il crée
   `.env` (mots de passe des rôles) et `api.env` (clé de chiffrement), tirés au hasard sur le
   serveur, puis s'arrête : le relais SMTP n'est pas rempli.
3. **Sur le serveur**, remplir `CGA_SMTP_UTILISATEUR` et `CGA_SMTP_MOT_DE_PASSE` dans
   `/opt/cga/api.env` (identifiant et clé SMTP de Brevo), et l'expéditeur
   `CGA_COURRIEL_EXPEDITEUR` (une adresse d'un domaine vérifié chez Brevo).
4. **Depuis le poste**, relancer `deployer.sh` : la pile démarre, le nginx est rattaché au réseau,
   la sauvegarde est planifiée (3 h 40 chaque nuit).
5. **Sur le serveur**, `/opt/cga/certificats.sh` : le certificat des trois noms, la configuration
   https, son renouvellement hebdomadaire.
6. **Le premier compte** (une seule fois ; il invite ensuite les autres depuis la console) :

       docker compose -f /opt/cga/docker-compose.yml --env-file /opt/cga/.env exec api \
         python -m app.premier_administrateur --courriel … --nom … --prenom …

   Il reçoit un lien d'activation par courriel, et la commande l'affiche aussi.

## Mettre à jour

Depuis le poste, sur des dépôts sans modification en attente : `deployer.sh`. Les images sont
étiquetées `AAAAMMJJ-<api>-<console>-<vitrine>` ; les deux dernières restent sur le serveur pour
revenir en arrière (`ETIQUETTE=` dans `/opt/cga/.env`, puis `docker compose up -d`).

## Ce qu'il faut savoir

- ⚠️ **`api.env` et `.env` ne sont jamais réécrits.** La clé `CGA_CLE_CHIFFREMENT` perdue rend
  illisibles les seconds facteurs ; un mot de passe de rôle changé coupe l'API de sa base.
  Les copier dans un coffre, hors du serveur.
- ⚠️ **La configuration nginx est copiée dans le conteneur**, comme celles des autres projets
  (seul `default.conf` y est monté). Si `backend-nginx-1` est recréé, reposer la nôtre :
  `/opt/cga/poser-nginx.sh /opt/cga/nginx/cga-brcg.conf`. Ce script teste avant de recharger,
  et remet l'ancienne configuration en cas d'échec : il ne peut pas faire tomber les autres sites.
- **Sauvegardes** : `/opt/cga/sauvegardes`, base (`pg_dump`), rôles, et pièces déposées, relues
  après coup, gardées 14 jours. ⚠️ **Il manque une copie hors du serveur** : à organiser.
  Restaurer : `outils/restauration.sh` du dépôt de la plateforme (dans une base neuve).
- **Tara Money** : sans identifiants dans `api.env`, le paiement mobile money est refusé avec un
  message, et le guichet du cabinet reste ouvert.
- **Mémoire** : chaque service a son plafond (environ 2,6 Go en tout au plus, sur 5 Go libres).
