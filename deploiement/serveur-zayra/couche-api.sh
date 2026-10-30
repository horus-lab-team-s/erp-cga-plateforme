#!/usr/bin/env bash
# Déployer l'API par une COUCHE posée sur l'image en service (30 octobre 2026).
#
#     deploiement/serveur-zayra/couche-api.sh
#
# ⚠️ L'EXCEPTION À « LE SERVEUR NE COMPILE RIEN ». `deployer.sh` construit les images sur le
# poste et les envoie entières. Le 30 octobre 2026, la liaison du poste tombait à 50 Ko/s et PyPI
# coupait les téléchargements : l'image de l'API ne se construisait plus. Quand SEULS le code
# Python (`app/`) et des paquets purs Python ont changé, cette commande :
#   1. vérifie que rien d'autre n'a changé depuis l'image en service (alembic, référentiel,
#      contenu du site, Dockerfile) — sinon elle refuse, et c'est `deployer.sh` qu'il faut ;
#   2. envoie `app/` (quelques centaines de Ko) et la liste des paquets ajoutés, avec leur
#      empreinte tirée de `uv.lock` (`--require-hashes` : un paquet modifié en chemin échoue) ;
#   3. fait construire sur le serveur une couche FROM l'image en service, étiquetée comme un
#      déploiement normal, et relance l'API en gardant le mode de présentation s'il est ouvert.
set -euo pipefail

SERVEUR="${SERVEUR:-zayra}"
DISTANT=/opt/cga
ICI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPOTS="$(cd "$ICI/../../.." && pwd)"
BACK="$DEPOTS/erp-cga-backend"
# Les paquets ajoutés depuis l'image en service, purs Python, leurs dépendances déjà présentes.
PAQUETS=(openai)

etiquette_de() { git -C "$DEPOTS/$1" rev-parse --short=8 HEAD; }
[ -z "$(git -C "$BACK" status --porcelain --untracked-files=no)" ] \
  || { echo "⚠️ erp-cga-backend a des modifications non enregistrées." >&2; exit 1; }

EN_SERVICE="$(ssh "$SERVEUR" "sed -n 's/^ETIQUETTE=//p' $DISTANT/.env")"
IFS=- read -r _ api console vitrine <<<"$EN_SERVICE"
[ "$console" = "$(etiquette_de erp-cga-console)" ] && [ "$vitrine" = "$(etiquette_de erp-cga-vitrine)" ] \
  || { echo "⚠️ La console ou le site local diffère de $EN_SERVICE : deployer.sh." >&2; exit 1; }
AUTRES="$(git -C "$BACK" diff --name-only "$api" HEAD -- alembic alembic.ini Docs/referentiel Contenu_vitrine Dockerfile \
  | grep -v '^Dockerfile$' || true)"
[ -z "$AUTRES" ] || { echo "⚠️ Plus que le code a changé depuis $api : $AUTRES. Utiliser deployer.sh." >&2; exit 1; }

ETIQUETTE="$(date +%Y%m%d)-$(etiquette_de erp-cga-backend)-$console-$vitrine"
echo "== Couche $EN_SERVICE → $ETIQUETTE"

TRAVAIL="$(mktemp -d)"
trap 'rm -rf "$TRAVAIL"' EXIT
git -C "$BACK" archive HEAD app | gzip -9 > "$TRAVAIL/app.tar.gz"
: > "$TRAVAIL/paquets.txt"
for p in "${PAQUETS[@]}"; do
  bloc="$(sed -n "/^name = \"$p\"$/,/^\[\[package\]\]/p" "$BACK/uv.lock")"
  version="$(sed -n 's/^version = "\(.*\)"$/\1/p' <<<"$bloc" | head -1)"
  empreinte="$(grep -oE 'py3-none-any\.whl", hash = "sha256:[0-9a-f]+' <<<"$bloc" | head -1 | sed 's/.*sha256://')"
  [ -n "$version" ] && [ -n "$empreinte" ] || { echo "$p introuvable dans uv.lock" >&2; exit 1; }
  echo "$p==$version --hash=sha256:$empreinte" >> "$TRAVAIL/paquets.txt"
done
cat > "$TRAVAIL/Dockerfile" <<EOF
FROM cga-api:$EN_SERVICE
USER root
COPY paquets.txt /tmp/paquets.txt
RUN pip install --no-deps --require-hashes --no-cache-dir -r /tmp/paquets.txt && rm /tmp/paquets.txt
RUN rm -rf /application/app
ADD app.tar.gz /application/
RUN chown -R cga:cga /application/app
USER cga
EOF
echo "== Envoi (code et liste des paquets)"
ssh "$SERVEUR" "rm -rf $DISTANT/couche && mkdir -p $DISTANT/couche"
scp -q "$TRAVAIL/app.tar.gz" "$TRAVAIL/paquets.txt" "$TRAVAIL/Dockerfile" "$SERVEUR:$DISTANT/couche/"

ssh "$SERVEUR" ETIQUETTE="$ETIQUETTE" EN_SERVICE="$EN_SERVICE" DISTANT="$DISTANT" bash -s <<'SUR_LE_SERVEUR'
set -euo pipefail
cd "$DISTANT"
echo "== Construction de la couche sur le serveur"
docker build -q -t "cga-api:$ETIQUETTE" couche
docker tag "cga-console:$EN_SERVICE" "cga-console:$ETIQUETTE"
docker tag "cga-vitrine:$EN_SERVICE" "cga-vitrine:$ETIQUETTE"
rm -rf couche
EN_PRESENTATION=0
docker exec cga-api-1 printenv CGA_URL_BASE_DE_DONNEES 2>/dev/null | grep -q cga_presentation && EN_PRESENTATION=1
sed -i "s/^ETIQUETTE=.*/ETIQUETTE=$ETIQUETTE/" .env
if [ "$EN_PRESENTATION" = 1 ]; then
  docker compose --env-file .env -f docker-compose.yml -f docker-compose.presentation.yml up -d --no-deps --force-recreate api
  docker compose --env-file .env up -d --no-deps console vitrine
  echo "  Mode de présentation gardé (base cga_presentation)."
else
  docker compose --env-file .env up -d --no-deps api ordonnanceur console vitrine
fi
docker compose --env-file .env ps
SUR_LE_SERVEUR
echo "== Déployé : $ETIQUETTE"
