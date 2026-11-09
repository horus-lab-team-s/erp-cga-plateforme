#!/usr/bin/env bash
# Construire les images SUR le serveur de la cliente, à partir des commits du poste (8 novembre 2026).
#
#     deploiement/serveur-contabo/construire-sur-le-serveur.sh [api] [console] [vitrine]
#     deploiement/serveur-contabo/deployer.sh        # retrouve ensuite les images, n'envoie rien
#
# POURQUOI. La liaison du poste monte à ~200 Ko/s et se coupe : le 8 novembre 2026, le relais
# de l'image de l'API (544 Mo) a rompu après 25 minutes, et Docker Hub ne répondait plus au poste
# pendant ce temps. Le serveur, lui, télécharge vite. On envoie donc le CODE (`git archive` du
# commit, 3 à 10 Mo ; plus les APK pour le site, ~55 Mo) et le serveur construit.
#
# ⚠️ CE SONT LES MÊMES IMAGES QUE CELLES DU POSTE : mêmes Dockerfile, mêmes arguments, même
# étiquette (AAAAMMJJ-<api>-<console>-<vitrine>), à partir d'un commit propre. `deployer.sh` les
# reconnaît à leur commit et ne les reconstruit pas.
#
# ⚠️ LE SERVEUR EST PARTAGÉ AVEC GATHE FINANCE : une construction à la fois (une construction
# Next.js prend quelques minutes de processeur). Rien hors de /srv/projects/cga/construction
# n'est écrit, sauf les images et le cache de construction de Docker.
set -euo pipefail

SERVEUR="${SERVEUR:-gathe-client}"
DISTANT=/srv/projects/cga/construction
DOMAINE="${DOMAINE:-cga-brcgroup.com}"
ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPOTS="$(cd "$ICI/../../.." && pwd)"
PARTIES=("$@")
[ ${#PARTIES[@]} -gt 0 ] || PARTIES=(api console vitrine)

etiquette_de() { git -C "$DEPOTS/$1" rev-parse --short=8 HEAD; }
declare -A DEPOT=([api]=erp-cga-backend [console]=erp-cga-console [vitrine]=erp-cga-vitrine)
for partie in "${PARTIES[@]}"; do
  [ -n "${DEPOT[$partie]:-}" ] || { echo "Partie inconnue : $partie (api, console, vitrine)" >&2; exit 2; }
  [ -z "$(git -C "$DEPOTS/${DEPOT[$partie]}" status --porcelain --untracked-files=no)" ] \
    || { echo "⚠️ ${DEPOT[$partie]} a des modifications non enregistrées." >&2; exit 1; }
done
ETIQUETTE="$(date +%Y%m%d)-$(etiquette_de erp-cga-backend)-$(etiquette_de erp-cga-console)-$(etiquette_de erp-cga-vitrine)"
echo "== Étiquette : $ETIQUETTE"

TRAVAIL="$(mktemp -d)"
trap 'rm -rf "$TRAVAIL"' EXIT
for partie in "${PARTIES[@]}"; do
  depot="$DEPOTS/${DEPOT[$partie]}"
  git -C "$depot" archive --format=tar -o "$TRAVAIL/$partie.tar" HEAD
  # Les APK ne sont pas dans le dépôt du site (trop lourdes) : posées par outils/publier-apk.sh.
  if [ "$partie" = vitrine ] && [ -d "$depot/public/telechargements" ]; then
    tar -rf "$TRAVAIL/$partie.tar" -C "$depot" public/telechargements
  fi
  gzip -6 "$TRAVAIL/$partie.tar"
done

echo "== Envoi du code"
ssh "$SERVEUR" "mkdir -p $DISTANT"
for partie in "${PARTIES[@]}"; do scp -q "$TRAVAIL/$partie.tar.gz" "$SERVEUR:$DISTANT/"; done

# ⚠️ 9 novembre 2026 : ssh recolle ses arguments en UNE ligne que le serveur relit. Sans les
# guillemets échappés, `PARTIES=api console vitrine` y devenait la commande « console ».
ssh "$SERVEUR" ETIQUETTE="$ETIQUETTE" DISTANT="$DISTANT" DOMAINE="$DOMAINE" "PARTIES='${PARTIES[*]}'" bash -s <<'SUR_LE_SERVEUR'
set -euo pipefail
cd "$DISTANT"
for partie in $PARTIES; do
  rm -rf "$partie" && mkdir "$partie" && tar -xzf "$partie.tar.gz" -C "$partie"
  echo "== Construction : $partie ($(date +%T))"
  case "$partie" in
    api) docker build -q -t "cga-api:$ETIQUETTE" api ;;
    console) docker build -q -t "cga-console:$ETIQUETTE" \
      --build-arg NEXT_PUBLIC_ADRESSE_VITRINE="https://$DOMAINE" \
      --build-arg NEXT_PUBLIC_SITE_URL="https://console.$DOMAINE" console ;;
    vitrine) docker build -q -t "cga-vitrine:$ETIQUETTE" \
      --build-arg NEXT_PUBLIC_ADRESSE_CONSOLE="https://console.$DOMAINE" \
      --build-arg NEXT_PUBLIC_SITE_URL="https://$DOMAINE" \
      --build-arg NEXT_PUBLIC_LIEN_APPLICATION_ANDROID= vitrine ;;
  esac
  rm -rf "$partie" "$partie.tar.gz"
done
docker images --format '{{.Repository}}:{{.Tag}} {{.Size}}' | grep -- "$ETIQUETTE"
SUR_LE_SERVEUR
echo "== Construit sur $SERVEUR : $ETIQUETTE. Ensuite : deployer.sh"
