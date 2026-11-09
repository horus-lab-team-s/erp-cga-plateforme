#!/usr/bin/env bash
# La sauvegarde de CGA : la base ET les pièces déposées (factures, scans, livrables).
#
#     GARDER=14 /opt/cga/sauvegarde.sh        # planifiée chaque nuit par `deployer.sh`
#
# ⚠️ LES FICHIERS AUTANT QUE LA BASE. La base dit qu'une facture existe ; le fichier est la
# facture. Une restauration sans eux rendrait une comptabilité dont aucune pièce ne s'ouvre.
#
# ⚠️ Chaque sauvegarde est VÉRIFIÉE après coup : `pg_restore --list` relit le vidage, `tar -t`
# relit l'archive. Une sauvegarde qu'on n'a jamais relue est une hypothèse.
#
# ⚠️ CE QUI RESTE À FAIRE PAR LE CABINET : une copie HORS DE CE SERVEUR. Une panne de disque ou
# une suppression du serveur emporterait sauvegardes et données ensemble.
set -euo pipefail
DOSSIER="${DOSSIER:-/opt/cga/sauvegardes}"
GARDER="${GARDER:-14}"
JOUR="$(date +%Y%m%d-%H%M)"
umask 077
mkdir -p "$DOSSIER"

docker exec cga-db-1 pg_dump -U cga -d cga -Fc > "$DOSSIER/cga-base-$JOUR.dump"
docker exec cga-db-1 pg_dumpall -U cga --roles-only > "$DOSSIER/cga-roles-$JOUR.sql"
docker run --rm -v cga_fichiers:/fichiers:ro -v "$DOSSIER":/sortie alpine:3.20 \
  tar -czf "/sortie/cga-fichiers-$JOUR.tar.gz" -C /fichiers .

docker exec -i cga-db-1 pg_restore --list < "$DOSSIER/cga-base-$JOUR.dump" > /dev/null
tar -tzf "$DOSSIER/cga-fichiers-$JOUR.tar.gz" > /dev/null
echo "$(date -Is) sauvegarde $JOUR : base $(du -h "$DOSSIER/cga-base-$JOUR.dump" | cut -f1), fichiers $(du -h "$DOSSIER/cga-fichiers-$JOUR.tar.gz" | cut -f1), relues."

# Les plus anciennes au-delà de GARDER jours.
find "$DOSSIER" -maxdepth 1 -name 'cga-*' -mtime "+$GARDER" -delete
