#!/usr/bin/env bash
# Le mode de présentation : ouvrir avant la séance chez la cliente, FERMER juste après.
#
#     /opt/cga/presentation.sh ouvrir      base de présentation neuve, jeu de démonstration, API basculée
#     /opt/cga/presentation.sh completer   verse `jeu-de-presentation.yaml` (clients ajoutés), sans rien effacer
#     /opt/cga/presentation.sh fermer      API remise sur la production, base de présentation détruite
#     /opt/cga/presentation.sh etat        lequel des deux modes tourne
#
# Voir `docker-compose.presentation.yml`. La base de production `cga` n'est jamais touchée.
set -euo pipefail
cd "$(dirname "$0")"
COMPOSE=(docker compose --env-file .env)
PRESENTATION=(docker compose --env-file .env -f docker-compose.yml -f docker-compose.presentation.yml)
# Le jeu de la recette (équipe complète, clients fictifs), par-dessus la démonstration.
verser_le_jeu() {
  "${PRESENTATION[@]}" run --rm --no-deps -v "$PWD/jeu-de-presentation.yaml:/jeu.yaml:ro" api \
    python -m app.jeu_de_presentation /jeu.yaml
}
psql_cga() { docker exec -i cga-db-1 psql -v ON_ERROR_STOP=1 -U cga -d cga -qAt "$@"; }

case "${1:-etat}" in
  ouvrir)
    echo "== Base de présentation neuve"
    psql_cga -c "DROP DATABASE IF EXISTS cga_presentation WITH (FORCE);"
    psql_cga -c "CREATE DATABASE cga_presentation OWNER cga;"
    echo "== Schéma et jeu de démonstration"
    "${PRESENTATION[@]}" run --rm --no-deps api sh -c \
      'rm -rf /application/fichiers/presentation && mkdir -p /application/fichiers/presentation \
       && alembic upgrade head && python -c "from app.amorcage import amorcer; print(amorcer())"'
    echo "== Jeu de la recette"
    verser_le_jeu
    echo "== API et ordonnanceur sur la présentation"
    # ⚠️ `--force-recreate` : déjà en présentation, `up` ne redémarrait rien, et la mémoire de
    # l'API (courriels retenus, limiteur de connexions) survivait à la base remise à neuf.
    "${PRESENTATION[@]}" up -d --no-deps --force-recreate api ordonnanceur
    echo
    echo "Mode de présentation OUVERT. Comptes de démonstration, mot de passe « cabinet brcg douala 2026 »."
    echo "⚠️ À fermer dès la séance finie : $0 fermer"
    ;;
  completer)
    "${PRESENTATION[@]}" exec -T api printenv CGA_URL_BASE_DE_DONNEES | grep -q cga_presentation \
      || { echo "La présentation n'est pas ouverte : $0 ouvrir" >&2; exit 1; }
    verser_le_jeu
    ;;
  fermer)
    echo "== API et ordonnanceur remis sur la production"
    "${COMPOSE[@]}" up -d --no-deps api ordonnanceur
    echo "== Base et fichiers de présentation détruits"
    psql_cga -c "DROP DATABASE IF EXISTS cga_presentation WITH (FORCE);"
    "${COMPOSE[@]}" exec -T api rm -rf /application/fichiers/presentation
    echo "Mode de présentation FERMÉ : la production est revenue."
    ;;
  etat)
    if docker exec cga-api-1 printenv CGA_URL_BASE_DE_DONNEES | grep -q cga_presentation; then
      echo "PRÉSENTATION ouverte (base cga_presentation). La fermer : $0 fermer"
    else
      echo "PRODUCTION (base cga)."
    fi
    ;;
  *) echo "usage : $0 ouvrir | completer | fermer | etat" >&2; exit 2 ;;
esac
