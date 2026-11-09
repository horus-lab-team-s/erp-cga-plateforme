#!/usr/bin/env bash
# Pose une configuration de CGA dans le nginx partagé du serveur, SANS RISQUE POUR LES AUTRES SITES.
#
#     ./poser-nginx.sh nginx/cga-brcg-http.conf     # étape 1, avant le certificat
#     ./poser-nginx.sh nginx/cga-brcg.conf          # étape 2, après
#
# ⚠️ `nginx -t` AVANT le rechargement, et l'ancienne configuration remise s'il échoue : une
# directive fausse dans un fichier ferait tomber la dizaine de sites que ce nginx sert.
#
# ⚠️ Le fichier est COPIÉ dans le conteneur, comme ceux des autres projets : seul
# `default.conf` y est monté depuis le disque. Si `backend-nginx-1` est un jour recréé, il faut
# reposer ce fichier (la source reste ici, dans /opt/cga/nginx/).
set -euo pipefail
NGINX=backend-nginx-1
CIBLE=/etc/nginx/conf.d/cga-brcg.conf
SOURCE="${1:?usage : poser-nginx.sh <fichier.conf>}"

docker exec "$NGINX" sh -c "[ -f $CIBLE ] && cp $CIBLE /tmp/cga-brcg.conf.avant || rm -f /tmp/cga-brcg.conf.avant"
docker cp "$SOURCE" "$NGINX:$CIBLE"
if docker exec "$NGINX" nginx -t; then
  docker exec "$NGINX" nginx -s reload
  echo "nginx : $SOURCE posé et rechargé."
else
  docker exec "$NGINX" sh -c "if [ -f /tmp/cga-brcg.conf.avant ]; then mv /tmp/cga-brcg.conf.avant $CIBLE; else rm -f $CIBLE; fi"
  echo "ÉCHEC : configuration refusée par nginx -t, l'ancienne est remise. Rien n'a été rechargé." >&2
  exit 1
fi
