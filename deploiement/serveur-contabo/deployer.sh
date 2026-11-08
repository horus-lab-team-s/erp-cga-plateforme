#!/usr/bin/env bash
# Déployer CGA BRCG sur le serveur Contabo de la cliente, depuis le poste de travail.
#
#     deploiement/serveur-contabo/deployer.sh
#
# 1. construit les trois images (API, console, vitrine) ICI, étiquetées par leurs commits ;
# 2. les charge sur le serveur (`docker save | ssh | docker load`) : le serveur ne compile rien ;
# 3. pose les fichiers de déploiement dans /srv/projects/cga ;
# 4. À LA PREMIÈRE MONTÉE SEULEMENT, crée `.env` et `api.env` avec des mots de passe et une clé
#    de chiffrement tirés au hasard SUR LE SERVEUR (ils n'en sortent pas). Ensuite, ces deux
#    fichiers ne sont plus jamais réécrits : la clé perdue rendrait illisibles les seconds
#    facteurs, un mot de passe changé couperait l'API de sa base ;
# 5. démarre la pile (Traefik la découvre seul par ses étiquettes et obtient les certificats),
#    planifie la sauvegarde, inscrit CGA au registre des projets (/srv/README.md).
#
# SEULEMENT=api|console|vitrine deployer.sh : ne reconstruit et n'envoie QU'UNE image. L'API et la
# console déjà en service sont réétiquetées sur le serveur, et le script refuse si leurs commits
# locaux diffèrent de ceux en service.
#
# ⚠️ CE SCRIPT NE TOUCHE À RIEN EN DEHORS DE /srv/projects/cga, sauf une ligne ajoutée au registre
# /srv/README.md et une ligne à la crontab de `deploy`. Ni Traefik (/srv/edge), ni les services
# partagés (/srv/services), ni Gathe Finance : il n'en lit ni n'en modifie aucun fichier.
#
# ⚠️ Il NE pose PAS le premier administrateur : `python -m app.premier_administrateur` (README).
set -euo pipefail

SERVEUR="${SERVEUR:-gathe-client}"
DISTANT=/srv/projects/cga
DOMAINE="${DOMAINE:-cga-brcgroup.com}"
ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPOTS="$(cd "$ICI/../../.." && pwd)"
SITE="https://$DOMAINE"
CONSOLE="https://console.$DOMAINE"
LIEN_APK="${LIEN_APPLICATION_ANDROID:-}"

etiquette_de() { git -C "$DEPOTS/$1" rev-parse --short=8 HEAD; }
for depot in erp-cga-backend erp-cga-console erp-cga-vitrine; do
  if [ -n "$(git -C "$DEPOTS/$depot" status --porcelain --untracked-files=no)" ]; then
    echo "⚠️ $depot a des modifications non enregistrées : on ne déploie qu'un commit." >&2
    exit 1
  fi
done

# Le serveur a-t-il bien le portier attendu ? Sans le réseau `edge`, la pile ne serait jointe par
# personne : on s'arrête AVANT d'envoyer des centaines de Mo.
ssh "$SERVEUR" 'docker network inspect edge >/dev/null' \
  || { echo "⚠️ Pas de réseau « edge » sur $SERVEUR : Traefik (/srv/edge) n'est pas là." >&2; exit 1; }

ETIQUETTE="$(date +%Y%m%d)-$(etiquette_de erp-cga-backend)-$(etiquette_de erp-cga-console)-$(etiquette_de erp-cga-vitrine)"
echo "== Étiquette : $ETIQUETTE ($DOMAINE)"

# Les trois images et le dépôt dont chacune sort.
declare -A DEPOT=([api]=erp-cga-backend [console]=erp-cga-console [vitrine]=erp-cga-vitrine)
construire() {
  case "$1" in
    api) docker build -t "cga-api:$ETIQUETTE" "$DEPOTS/erp-cga-backend" ;;
    console) docker build -t "cga-console:$ETIQUETTE" \
      --build-arg NEXT_PUBLIC_ADRESSE_VITRINE="$SITE" \
      --build-arg NEXT_PUBLIC_SITE_URL="$CONSOLE" \
      "$DEPOTS/erp-cga-console" ;;
    vitrine) docker build -t "cga-vitrine:$ETIQUETTE" \
      --build-arg NEXT_PUBLIC_ADRESSE_CONSOLE="$CONSOLE" \
      --build-arg NEXT_PUBLIC_SITE_URL="$SITE" \
      --build-arg NEXT_PUBLIC_LIEN_APPLICATION_ANDROID="$LIEN_APK" \
      "$DEPOTS/erp-cga-vitrine" ;;
  esac
}

if [ -n "${SEULEMENT:-}" ]; then
  [ -n "${DEPOT[$SEULEMENT]:-}" ] || { echo "SEULEMENT vaut api, console ou vitrine." >&2; exit 2; }
  EN_SERVICE="$(ssh "$SERVEUR" "sed -n 's/^ETIQUETTE=//p' $DISTANT/.env")"
  IFS=- read -r _ en_api en_console en_vitrine <<<"$EN_SERVICE"
  declare -A EN=([api]=$en_api [console]=$en_console [vitrine]=$en_vitrine)
  GARDEES=()
  for partie in api console vitrine; do
    [ "$partie" = "$SEULEMENT" ] && continue
    if [ "${EN[$partie]}" != "$(etiquette_de "${DEPOT[$partie]}")" ]; then
      echo "⚠️ En service : $EN_SERVICE. La partie « $partie » locale a changé : déploiement complet requis." >&2
      exit 1
    fi
    GARDEES+=("$partie")
  done
  echo "== $SEULEMENT seul : ${GARDEES[*]} de $EN_SERVICE sont gardées"
  construire "$SEULEMENT"
  IMAGES=("cga-$SEULEMENT:$ETIQUETTE")
else
  # ⚠️ UNE IMAGE DÉJÀ SUR LE SERVEUR, DU MÊME COMMIT, N'EST NI RECONSTRUITE NI RENVOYÉE (8 novembre
  # 2026) : la liaison du poste monte à ~200 Ko/s, une image fait 350 à 550 Mo. Elle est retrouvée
  # par son étiquette (AAAAMMJJ-<api>-<console>-<vitrine>) et réétiquetée là-bas. Valable parce que
  # les images de CE serveur sont toutes construites pour SON domaine (console et site portent
  # leurs adresses en dur), ou, pour l'API, indépendantes du domaine.
  declare -A POSITION=([api]=2 [console]=3 [vitrine]=4)
  IMAGES=()
  REPRISES=()
  for partie in api console vitrine; do
    commit="$(etiquette_de "${DEPOT[$partie]}")"
    deja="$(ssh "$SERVEUR" "docker images cga-$partie --format '{{.Tag}}'" \
      | awk -F- -v p="${POSITION[$partie]}" -v c="$commit" '$p == c { print; exit }')"
    if [ -n "$deja" ]; then
      echo "== $partie : déjà sur le serveur ($deja), gardée"
      REPRISES+=("$partie:$deja")
    else
      echo "== Construction : $partie"
      construire "$partie"
      IMAGES+=("cga-$partie:$ETIQUETTE")
    fi
  done
fi

if [ "${#IMAGES[@]}" -gt 0 ]; then
  echo "== Chargement sur $SERVEUR : ${IMAGES[*]}"
  docker save "${IMAGES[@]}" | gzip -6 | ssh "$SERVEUR" 'gunzip | docker load'
fi
if [ -n "${SEULEMENT:-}" ]; then
  for partie in "${GARDEES[@]}"; do
    ssh "$SERVEUR" "docker tag cga-$partie:$EN_SERVICE cga-$partie:$ETIQUETTE"
  done
fi
for reprise in "${REPRISES[@]:-}"; do
  [ -n "$reprise" ] || continue
  ssh "$SERVEUR" "docker tag cga-${reprise%%:*}:${reprise#*:} cga-${reprise%%:*}:$ETIQUETTE"
done

echo "== Fichiers de déploiement"
ssh "$SERVEUR" "mkdir -p $DISTANT && chmod 700 $DISTANT"
scp -q "$ICI/docker-compose.yml" "$ICI/docker-compose.presentation.yml" "$ICI/env.modele" \
  "$ICI/api.env.modele" "$ICI/sauvegarde.sh" "$ICI/presentation.sh" "$ICI/reprendre-cles.sh" \
  "$ICI/jeu-de-presentation.yaml" "$SERVEUR:$DISTANT/"
scp -q "$DEPOTS/erp-cga-backend/outils/roles-postgresql.sql" "$SERVEUR:$DISTANT/"

ssh "$SERVEUR" ETIQUETTE="$ETIQUETTE" DISTANT="$DISTANT" DOMAINE="$DOMAINE" bash -s <<'SUR_LE_SERVEUR'
set -euo pipefail
cd "$DISTANT"
chmod +x sauvegarde.sh presentation.sh reprendre-cles.sh
umask 077
aleatoire() { head -c 24 /dev/urandom | base64 | tr -d '/+='; }
if [ ! -f .env ]; then
  { echo "ETIQUETTE=$ETIQUETTE"
    echo "DOMAINE=$DOMAINE"
    echo "MOT_DE_PASSE_PROPRIETAIRE=$(aleatoire)"
    echo "MOT_DE_PASSE_MIGRATION=$(aleatoire)"
    echo "MOT_DE_PASSE_APP=$(aleatoire)"; } > .env
  echo "  .env créé (mots de passe tirés ici)."
else
  sed -i "s/^ETIQUETTE=.*/ETIQUETTE=$ETIQUETTE/" .env
  grep -q '^DOMAINE=' .env || echo "DOMAINE=$DOMAINE" >> .env
fi
if [ ! -f api.env ]; then
  sed "s|^CGA_CLE_CHIFFREMENT=.*|CGA_CLE_CHIFFREMENT=$(head -c 32 /dev/urandom | base64)|" api.env.modele > api.env
  echo "  api.env créé (clé de chiffrement tirée ici)."
fi
if grep -q '^CGA_COURRIELS_DIFFERES=true' api.env; then
  echo "⚠️ api.env : CGA_COURRIELS_DIFFERES=true, aucun courriel ne partira tant que le relais n'est pas posé." >&2
elif ! grep -qE '^CGA_(SMTP_MOT_DE_PASSE|BREVO_CLE_API)=.+' api.env; then
  echo "⚠️ api.env : ni la clé d'API Brevo ni le relais SMTP ne sont remplis. La production refuse de démarrer sans eux." >&2
  echo "   Le reprendre : $DISTANT/reprendre-cles.sh (voir le README), puis relancer ce déploiement." >&2
  exit 3
fi

# ⚠️ LE MODE DE PRÉSENTATION SURVIT AU DÉPLOIEMENT : noté avant, rétabli après.
EN_PRESENTATION=0
if docker exec cga-api-1 printenv CGA_URL_BASE_DE_DONNEES 2>/dev/null | grep -q cga_presentation; then
  EN_PRESENTATION=1
  echo "  Mode de présentation ouvert : il sera rétabli après la relance."
fi
docker compose --env-file .env up -d --remove-orphans
if [ "$EN_PRESENTATION" = 1 ]; then
  docker compose --env-file .env -f docker-compose.yml -f docker-compose.presentation.yml up -d --no-deps --force-recreate api
  docker compose --env-file .env stop ordonnanceur
  echo "  Mode de présentation RÉTABLI (base cga_presentation). À fermer après la séance : ./presentation.sh fermer"
fi

mkdir -p sauvegardes
LIGNE="40 3 * * * GARDER=14 $DISTANT/sauvegarde.sh >> $DISTANT/sauvegardes/journal.log 2>&1  # CGA BRCG SAUVEGARDE"
# ⚠️ `|| true` : sans crontab, `crontab -l` et `grep -v` rendent 1, et `pipefail` arrêtait ici.
( { crontab -l 2>/dev/null || true; } | { grep -v '# CGA BRCG SAUVEGARDE' || true; } ; echo "$LIGNE" ) | crontab -

# Le registre des projets du serveur (tableau du README de /srv), une fois.
if [ -w /srv/README.md ] && ! grep -q '^| cga ' /srv/README.md; then
  printf '| %-14s | %-26s | %-12s | %-12s | %-9s | %s |\n' \
    cga "$DOMAINE (console., api.)" "propre (cga)" "aucun" "aucune" "$(date +%F)" >> /srv/README.md
  echo "  Inscrit au registre /srv/README.md."
fi

# Les images des étiquettes précédentes, sauf les deux dernières : de quoi revenir en arrière.
for image in cga-api cga-console cga-vitrine; do
  docker images "$image" --format '{{.Tag}}' | sort -r | tail -n +3 | xargs -r -I{} docker rmi "$image:{}" || true
done
docker compose --env-file .env ps
SUR_LE_SERVEUR
echo "== Déployé : $ETIQUETTE"
echo "   Les certificats se font au premier appel : https://$DOMAINE, https://console.$DOMAINE, https://api.$DOMAINE"
