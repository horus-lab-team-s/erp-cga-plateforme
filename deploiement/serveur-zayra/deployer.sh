#!/usr/bin/env bash
# Déployer CGA BRCG sur le serveur partagé de Zayra, depuis le poste de travail.
#
#     deploiement/serveur-zayra/deployer.sh
#
# 1. construit les trois images (API, console, vitrine) ICI, étiquetées par leurs commits ;
# 2. les charge sur le serveur (`docker save | ssh | docker load`) : le serveur ne compile rien ;
# 3. pose les fichiers de déploiement dans /opt/cga ;
# 4. À LA PREMIÈRE MONTÉE SEULEMENT, crée `.env` et `api.env` avec des mots de passe et une clé
#    de chiffrement tirés au hasard SUR LE SERVEUR (ils n'en sortent pas). Ensuite, ces deux
#    fichiers ne sont plus jamais réécrits : la clé perdue rendrait illisibles les seconds
#    facteurs, un mot de passe changé couperait l'API de sa base ;
# 5. démarre la pile, rattache le nginx partagé au réseau de CGA, planifie la sauvegarde.
#
# SEULEMENT=api|console|vitrine deployer.sh : ne reconstruit et n'envoie QU'UNE image (30 octobre 2026). Une
# image fait plusieurs centaines de Mo et la liaison du poste monte à ~200 Ko/s : renvoyer les trois
# pour changer le site prenait une heure. L'API et la console déjà en service sont réétiquetées sur
# le serveur, et le script refuse si leurs commits locaux diffèrent de ceux en service.
#
# ⚠️ Il NE pose PAS la configuration nginx ni le certificat : c'est `certificats.sh`, une fois,
# sur le serveur. Ni le premier administrateur : `python -m app.premier_administrateur`.
set -euo pipefail

SERVEUR="${SERVEUR:-zayra}"
DISTANT=/opt/cga
ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPOTS="$(cd "$ICI/../../.." && pwd)"
SITE=https://cga-brcg.horus-lab.com
CONSOLE=https://console.cga-brcg.horus-lab.com
LIEN_APK="${LIEN_APPLICATION_ANDROID:-}"

etiquette_de() { git -C "$DEPOTS/$1" rev-parse --short=8 HEAD; }
for depot in erp-cga-backend erp-cga-console erp-cga-vitrine; do
  if [ -n "$(git -C "$DEPOTS/$depot" status --porcelain --untracked-files=no)" ]; then
    echo "⚠️ $depot a des modifications non enregistrées : on ne déploie qu'un commit." >&2
    exit 1
  fi
done
ETIQUETTE="$(date +%Y%m%d)-$(etiquette_de erp-cga-backend)-$(etiquette_de erp-cga-console)-$(etiquette_de erp-cga-vitrine)"
echo "== Étiquette : $ETIQUETTE"

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
  # SEULEMENT=api|console|vitrine : une seule image construite et envoyée ; les deux autres, déjà en
  # service, sont réétiquetées sur le serveur — à condition que leurs commits soient bien ceux d'ici.
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
  echo "== Construction des images"
  for partie in api console vitrine; do construire "$partie"; done
  IMAGES=("cga-api:$ETIQUETTE" "cga-console:$ETIQUETTE" "cga-vitrine:$ETIQUETTE")
fi

echo "== Chargement sur $SERVEUR"
docker save "${IMAGES[@]}" | gzip -1 | ssh "$SERVEUR" 'gunzip | docker load'
if [ -n "${SEULEMENT:-}" ]; then
  for partie in "${GARDEES[@]}"; do
    ssh "$SERVEUR" "docker tag cga-$partie:$EN_SERVICE cga-$partie:$ETIQUETTE"
  done
fi

echo "== Fichiers de déploiement"
ssh "$SERVEUR" "mkdir -p $DISTANT/nginx && chmod 700 $DISTANT"
scp -q "$ICI/docker-compose.yml" "$ICI/docker-compose.presentation.yml" "$ICI/env.modele" \
  "$ICI/api.env.modele" "$ICI/poser-nginx.sh" "$ICI/certificats.sh" "$ICI/sauvegarde.sh" \
  "$ICI/presentation.sh" "$ICI/jeu-de-presentation.yaml" "$SERVEUR:$DISTANT/"
scp -q "$ICI/nginx/"*.conf "$SERVEUR:$DISTANT/nginx/"
scp -q "$DEPOTS/erp-cga-backend/outils/roles-postgresql.sql" "$SERVEUR:$DISTANT/"

ssh "$SERVEUR" ETIQUETTE="$ETIQUETTE" DISTANT="$DISTANT" bash -s <<'SUR_LE_SERVEUR'
set -euo pipefail
cd "$DISTANT"
chmod +x poser-nginx.sh certificats.sh sauvegarde.sh presentation.sh
umask 077
aleatoire() { head -c 24 /dev/urandom | base64 | tr -d '/+='; }
if [ ! -f .env ]; then
  { echo "ETIQUETTE=$ETIQUETTE"
    echo "MOT_DE_PASSE_PROPRIETAIRE=$(aleatoire)"
    echo "MOT_DE_PASSE_MIGRATION=$(aleatoire)"
    echo "MOT_DE_PASSE_APP=$(aleatoire)"; } > .env
  echo "  .env créé (mots de passe tirés ici)."
else
  sed -i "s/^ETIQUETTE=.*/ETIQUETTE=$ETIQUETTE/" .env
fi
if [ ! -f api.env ]; then
  sed "s|^CGA_CLE_CHIFFREMENT=.*|CGA_CLE_CHIFFREMENT=$(head -c 32 /dev/urandom | base64)|" api.env.modele > api.env
  echo "  api.env créé (clé de chiffrement tirée ici). ⚠️ Remplir CGA_SMTP_UTILISATEUR et CGA_SMTP_MOT_DE_PASSE."
fi
if grep -q '^CGA_COURRIELS_DIFFERES=true' api.env; then
  echo "⚠️ api.env : CGA_COURRIELS_DIFFERES=true, aucun courriel ne partira tant que le relais n'est pas posé." >&2
elif ! grep -q '^CGA_SMTP_MOT_DE_PASSE=.\+' api.env; then
  echo "⚠️ api.env : le relais SMTP n'est pas rempli. La production refuse de démarrer sans lui." >&2
  echo "   Éditer $DISTANT/api.env, puis relancer ce déploiement." >&2
  exit 3
fi

# ⚠️ LE MODE DE PRÉSENTATION SURVIT AU DÉPLOIEMENT (30 octobre 2026). `up` relance l'API sur la
# composition de production : un déploiement fait pendant que la présentation était ouverte l'a
# refermée sans le dire, et les comptes de la recette ne répondaient plus. On note le mode avant,
# et on le rétablit après (`presentation.sh` reste seul à l'ouvrir ou le fermer).
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
docker network inspect cga_default --format '{{range .Containers}}{{.Name}} {{end}}' | grep -q backend-nginx-1 \
  || docker network connect cga_default backend-nginx-1

LIGNE="40 3 * * * GARDER=14 $DISTANT/sauvegarde.sh >> /var/log/cga-sauvegarde.log 2>&1  # CGA BRCG SAUVEGARDE"
( crontab -l 2>/dev/null | grep -v '# CGA BRCG SAUVEGARDE' ; echo "$LIGNE" ) | crontab -

# Les images des étiquettes précédentes, sauf les deux dernières : de quoi revenir en arrière.
for image in cga-api cga-console cga-vitrine; do
  docker images "$image" --format '{{.Tag}}' | sort -r | tail -n +3 | xargs -r -I{} docker rmi "$image:{}" || true
done
docker compose --env-file .env ps
SUR_LE_SERVEUR
echo "== Déployé : $ETIQUETTE"
