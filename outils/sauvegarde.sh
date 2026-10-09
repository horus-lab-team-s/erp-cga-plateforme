#!/usr/bin/env bash
#
# Sauvegarder la base, et prouver que la sauvegarde vaut quelque chose.
#
# ──────────────────────────────────────────────────────────────────────────────
# ⚠️ IL N'Y AVAIT AUCUNE PROCÉDURE, ET LA SEULE PHRASE ÉCRITE DISAIT
# « une base infogérée dont quelqu'un vérifie les sauvegardes ».
#
# « Quelqu'un » n'est pas une procédure. Une sauvegarde qu'on n'a jamais
# restaurée n'est pas une sauvegarde : c'est un fichier dont on espère qu'il
# contient quelque chose.
#
# ⚠️ LE PIÈGE QUI A MOTIVÉ CE FICHIER, MESURÉ SUR LA PILE EN SERVICE
#
# La base porte 35 politiques de cloisonnement. Une sauvegarde prise sous le
# rôle applicatif `cga_app`, qui ne les contourne pas, échoue bruyamment :
#
#     pg_dump: error: query would be affected by row-level security policy
#
# Le réflexe est alors d'ajouter l'option qui fait taire l'erreur,
# `--enable-row-security`. Elle la fait taire, en effet. Mesuré ici :
#
#     sauvegarde complète     193 035 octets   1 173 lignes
#     avec --enable-row-security 10 171 octets       8 lignes
#
# Le fichier déclare ses 38 tables, donc il PARAÎT complet. Il contient zéro
# compte, zéro accusé de réception, zéro écriture comptable. Et la commande rend
# zéro : aucune alerte, aucune trace, et on le découvre le jour de la
# restauration.
#
# D'où les deux règles de ce script, et il n'y en a pas d'autres :
#
#   1. sauvegarder sous un rôle qui contourne le cloisonnement (`cga`) ;
#   2. COMPTER les lignes sauvegardées et les comparer à la base. Un écart
#      arrête tout.
#
# ⚠️ LES RÔLES NE SONT PAS DANS LA SAUVEGARDE DE LA BASE
#
# `pg_dump` sauvegarde une base ; `cga_app` et `cga_migration` vivent dans la
# GRAPPE. Restaurée sur un serveur neuf, la base seule retrouve ses 35
# politiques et ses 152 privilèges — qui désignent des rôles inexistants.
# `pg_dumpall --roles-only` les emporte, et ce script le fait toujours.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="${CGA_BASE:-cga}"
UTILISATEUR="${CGA_UTILISATEUR:-cga}"
DESTINATION="${1:-sauvegardes}"
HORODATAGE="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$DESTINATION"
ARCHIVE="$DESTINATION/$BASE-$HORODATAGE.dump"
ROLES="$DESTINATION/$BASE-$HORODATAGE.roles.sql"

echo "── Rôles de la grappe"
pg_dumpall -U "$UTILISATEUR" --roles-only > "$ROLES"

echo "── Base « $BASE »"
pg_dump -U "$UTILISATEUR" -d "$BASE" --format=custom --file="$ARCHIVE"

echo "── Contrôle : la sauvegarde contient-elle les données ?"
# ⚠️ CE CONTRÔLE EST LA RAISON D'ÊTRE DU SCRIPT. Sans lui, une sauvegarde vide
# est indiscernable d'une bonne — même nom, même extension, même code de retour.
ATTENDU=$(psql -U "$UTILISATEUR" -d "$BASE" -tAc \
  "select coalesce(sum(n_live_tup), 0) from pg_stat_user_tables;")
TABLES_SAUVEES=$(pg_restore -l "$ARCHIVE" | grep -c "TABLE DATA" || true)
TAILLE=$(stat -c%s "$ARCHIVE")

echo "   lignes vivantes en base : $ATTENDU"
echo "   tables de données dans l'archive : $TABLES_SAUVEES"
echo "   taille : $TAILLE octets"

# Seuil volontairement grossier : il ne cherche pas à mesurer finement, il
# cherche à arrêter une sauvegarde manifestement vide. Mille lignes dans une
# archive de deux kilo-octets, c'est le cas qu'on veut voir échouer.
if [ "$ATTENDU" -gt 100 ] && [ "$TAILLE" -lt 20000 ]; then
  echo "‼️  ARCHIVE SUSPECTE : $ATTENDU lignes en base pour $TAILLE octets." >&2
  echo "    Le cloisonnement a probablement filtré les données." >&2
  echo "    Vérifier que le rôle employé contourne les politiques :" >&2
  echo "      psql -tAc \"select rolbypassrls from pg_roles where rolname=current_user\"" >&2
  exit 1
fi

echo "✓ $ARCHIVE"
echo "✓ $ROLES"
echo
echo "⚠️ Cette sauvegarde n'est PAS vérifiée tant qu'elle n'a pas été restaurée."
echo "   outils/restauration.sh $ARCHIVE $ROLES"
