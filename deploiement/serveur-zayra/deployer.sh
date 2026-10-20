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

echo "== Construction des images"
docker build -t "cga-api:$ETIQUETTE" "$DEPOTS/erp-cga-backend"
docker build -t "cga-console:$ETIQUETTE" \
  --build-arg NEXT_PUBLIC_ADRESSE_VITRINE="$SITE" \
  --build-arg NEXT_PUBLIC_SITE_URL="$CONSOLE" \
  "$DEPOTS/erp-cga-console"
docker build -t "cga-vitrine:$ETIQUETTE" \
  --build-arg NEXT_PUBLIC_ADRESSE_CONSOLE="$CONSOLE" \
  --build-arg NEXT_PUBLIC_SITE_URL="$SITE" \
  --build-arg NEXT_PUBLIC_LIEN_APPLICATION_ANDROID="$LIEN_APK" \
  "$DEPOTS/erp-cga-vitrine"

echo "== Chargement sur $SERVEUR"
docker save "cga-api:$ETIQUETTE" "cga-console:$ETIQUETTE" "cga-vitrine:$ETIQUETTE" \
  | gzip -1 | ssh "$SERVEUR" 'gunzip | docker load'

echo "== Fichiers de déploiement"
ssh "$SERVEUR" "mkdir -p $DISTANT/nginx && chmod 700 $DISTANT"
scp -q "$ICI/docker-compose.yml" "$ICI/docker-compose.presentation.yml" "$ICI/env.modele" \
  "$ICI/api.env.modele" "$ICI/poser-nginx.sh" "$ICI/certificats.sh" "$ICI/sauvegarde.sh" \
  "$ICI/presentation.sh" "$SERVEUR:$DISTANT/"
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

docker compose --env-file .env up -d --remove-orphans
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
