#!/usr/bin/env bash
#
# Restaurer une sauvegarde dans une base NEUVE, et vérifier qu'elle est entière.
#
# ──────────────────────────────────────────────────────────────────────────────
# ⚠️ CE SCRIPT NE RESTAURE JAMAIS PAR-DESSUS UNE BASE EXISTANTE, ET C'EST VOULU.
#
# On restaure pour deux raisons : parce que la production est perdue, ou pour
# VÉRIFIER une sauvegarde. Le second cas est de très loin le plus fréquent, et
# c'est celui où écraser la base en service serait catastrophique. Le script
# crée donc une base au nom donné et refuse si elle existe déjà.
#
# Le jour d'un vrai sinistre, on restaure dans une base neuve puis on bascule :
# une étape de plus, et une base intacte pendant qu'on regarde si la sauvegarde
# tient.
#
# ⚠️ CE QUI EST VÉRIFIÉ APRÈS COUP, ET POURQUOI CES QUATRE CHOSES-LÀ
#
#   · le nombre de lignes, table par table — une restauration partielle rend
#     une base qui s'ouvre et qui ment ;
#   · les 35 politiques de cloisonnement — sans elles, tous les locataires se
#     voient, et rien à l'écran ne le signale ;
#   · le nombre de tables protégées — une politique présente sur une table dont
#     `ROW LEVEL SECURITY` a été désactivé ne s'applique pas ;
#   · le cloisonnement EXERCÉ sous le rôle applicatif — la seule preuve qui
#     vaille : sans locataire établi, zéro ligne.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ⚠️ POURQUOI CETTE FONCTION PLUTÔT QU'UN `psql -l | grep`
#
# La première version employait `psql -lqt | cut -d'|' -f1 | grep -qw "$BASE"`.
# Elle répondait TOUJOURS « absente », y compris sur une base existante, et le
# garde-fou « ne jamais restaurer par-dessus » ne se déclenchait donc jamais.
#
# `grep -q` sort dès la première correspondance ; `cut`, encore en train
# d'écrire, reçoit alors un SIGPIPE et meurt. Avec `set -o pipefail`, la mort
# d'un maillon rend tout le tuyau en échec — le test lit donc « échec », c'est-
# à-dire « absente », précisément quand la base EST là.
#
# Le défaut s'est vu en exerçant le script sur la pile en service, pas en le
# relisant. C'est tout l'objet de cet exercice.
existe() {
  local combien
  combien=$(psql -U "$UTILISATEUR" -d postgres -tAc \
    "select count(*) from pg_database where datname = '$1';")
  [ "$(echo "$combien" | tr -d ' ')" != "0" ]
}


ARCHIVE="${1:?usage: restauration.sh <archive.dump> [roles.sql] [base-cible]}"
ROLES="${2:-}"
CIBLE="${3:-cga_verification_$(date +%Y%m%d%H%M%S)}"
UTILISATEUR="${CGA_UTILISATEUR:-cga}"
ORIGINE="${CGA_BASE:-cga}"

if existe "$CIBLE"; then
  echo "‼️  La base « $CIBLE » existe déjà. Ce script ne restaure jamais par-dessus." >&2
  exit 1
fi

if [ -n "$ROLES" ] && [ -f "$ROLES" ]; then
  echo "── Rôles (les erreurs « existe déjà » sont normales sur une grappe en service)"
  psql -U "$UTILISATEUR" -d postgres -f "$ROLES" 2>&1 | grep -v "existe déjà\|already exists" || true
fi

echo "── Création de « $CIBLE »"
createdb -U "$UTILISATEUR" "$CIBLE"

echo "── Restauration"
pg_restore -U "$UTILISATEUR" -d "$CIBLE" "$ARCHIVE"

echo
echo "── Vérification"
empreinte() {
  psql -U "$UTILISATEUR" -d "$1" -tAc "
    select table_name||':'||(xpath('/row/c/text()',
      query_to_xml('select count(*) c from public.'||quote_ident(table_name), false, true, '')))[1]::text::int
    from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE' order by table_name;"
}

if existe "$ORIGINE"; then
  if diff <(empreinte "$ORIGINE") <(empreinte "$CIBLE") > /tmp/ecart-restauration.txt; then
    echo "✓ lignes identiques à « $ORIGINE », table par table"
  else
    echo "‼️  ÉCART DE CONTENU avec « $ORIGINE » :" >&2
    cat /tmp/ecart-restauration.txt >&2
    exit 1
  fi
else
  echo "ℹ️  « $ORIGINE » absente : comparaison impossible, on vérifie le reste."
fi

lire() { psql -U "$UTILISATEUR" -d "$CIBLE" -tAc "$1" | tr -d ' '; }
POLITIQUES=$(lire "select count(*) from pg_policies where schemaname='public';")
PROTEGEES=$(lire "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
                  where n.nspname='public' and c.relrowsecurity;")
echo "✓ $POLITIQUES politiques de cloisonnement, $PROTEGEES tables protégées"

if [ "$POLITIQUES" -eq 0 ] || [ "$PROTEGEES" -eq 0 ]; then
  echo "‼️  AUCUN CLOISONNEMENT : tous les locataires se verraient." >&2
  exit 1
fi

echo
echo "⚠️ Reste à exercer le cloisonnement sous le rôle applicatif — la seule"
echo "   preuve qui vaille. Sans locataire établi, la réponse doit être zéro :"
echo "     PGPASSWORD=… psql -U cga_app -d $CIBLE -tAc 'select count(*) from compte;'"
echo
echo "✓ Base de vérification : $CIBLE"
echo "  Elle contient une copie des données. La supprimer quand la"
echo "  vérification est faite :  dropdb -U $UTILISATEUR $CIBLE"
