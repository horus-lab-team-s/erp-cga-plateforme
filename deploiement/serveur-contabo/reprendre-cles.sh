#!/usr/bin/env bash
# Reprendre des réglages d'un autre fichier du serveur (les clés Brevo et Tara de Gathe Finance)
# dans `api.env` de CGA, SANS JAMAIS LES AFFICHER.
#
#     ./reprendre-cles.sh <fichier source> SOURCE=CIBLE [SOURCE=CIBLE …]
#     ./reprendre-cles.sh --noms <fichier source>      les NOMS des réglages du fichier, sans valeur
#
# Exemple (les noms de gauche sont ceux du fichier source, à relever avec --noms) :
#
#     sudo ./reprendre-cles.sh /chemin/du/.env \
#         BREVO_SMTP_LOGIN=CGA_SMTP_UTILISATEUR  BREVO_SMTP_KEY=CGA_SMTP_MOT_DE_PASSE \
#         TARA_API_KEY=CGA_TARA_CLE_API          TARA_BUSINESS_ID=CGA_TARA_IDENTIFIANT_MARCHAND
#
# ⚠️ LE FICHIER SOURCE N'EST QUE LU, et seulement les lignes nommées. Ni les valeurs ni le reste
# du fichier ne passent à l'écran, dans un journal ou dans l'historique : le script dit pour
# chaque réglage « repris » ou « absent », rien d'autre. `api.env` est sauvegardé avant
# (api.env.avant-reprise, droits 600), puis réécrit avec les droits 600.
#
# Les guillemets autour d'une valeur (`CLE="abc"`) sont retirés ; une valeur sur plusieurs
# lignes n'est pas prise en charge (le script la signale « illisible » et n'écrit rien pour elle).
set -euo pipefail
cd "$(dirname "$0")"
umask 077

if [ "${1:-}" = "--noms" ]; then
  [ -r "${2:-}" ] || { echo "usage : $0 --noms <fichier source>" >&2; exit 2; }
  sed -n 's/^[[:space:]]*\(export[[:space:]]\+\)\?\([A-Za-z_][A-Za-z0-9_]*\)=.*/\2/p' "$2"
  exit 0
fi

SOURCE="${1:?usage : $0 <fichier source> SOURCE=CIBLE [SOURCE=CIBLE …]}"
shift
[ $# -gt 0 ] || { echo "usage : $0 <fichier source> SOURCE=CIBLE [SOURCE=CIBLE …]" >&2; exit 2; }
[ -r "$SOURCE" ] || { echo "$SOURCE illisible (droits ? essayer avec sudo)" >&2; exit 1; }
[ -f api.env ] || { echo "api.env absent : lancer d'abord deployer.sh depuis le poste." >&2; exit 1; }

cp -p api.env api.env.avant-reprise
chmod 600 api.env.avant-reprise
TRAVAIL="$(mktemp api.env.XXXXXX)"
trap 'rm -f "$TRAVAIL"' EXIT
cp api.env "$TRAVAIL"

for paire in "$@"; do
  nom_source="${paire%%=*}"
  nom_cible="${paire#*=}"
  [[ "$nom_source" =~ ^[A-Za-z_][A-Za-z0-9_]*$ && "$nom_cible" =~ ^CGA_[A-Z0-9_]+$ ]] \
    || { echo "  $paire : forme attendue SOURCE=CGA_CIBLE" >&2; exit 2; }
  # La dernière occurrence gagne, comme pour docker compose.
  ligne="$(grep -E "^[[:space:]]*(export[[:space:]]+)?${nom_source}=" "$SOURCE" | tail -n 1 || true)"
  if [ -z "$ligne" ]; then
    echo "  $nom_source → $nom_cible : absent du fichier source"
    continue
  fi
  valeur="${ligne#*=}"
  valeur="${valeur%$'\r'}"
  if [[ "$valeur" =~ ^\"(.*)\"$ || "$valeur" =~ ^\'(.*)\'$ ]]; then
    valeur="${BASH_REMATCH[1]}"
  fi
  if [ -z "$valeur" ] || [[ "$valeur" == \"* || "$valeur" == \'* ]]; then
    echo "  $nom_source → $nom_cible : vide ou illisible, rien écrit"
    continue
  fi
  # ⚠️ docker compose remplace `$NOM` dans les valeurs d'un env_file, sauf entre apostrophes :
  # une clé contenant `$` arriverait tronquée à l'API. Mise entre apostrophes dans ce cas.
  if [[ "$valeur" == *'$'* || "$valeur" == *' #'* ]]; then
    if [[ "$valeur" == *"'"* ]]; then
      echo "  $nom_source → $nom_cible : contient à la fois \$ et une apostrophe, rien écrit (à poser à la main)"
      continue
    fi
    valeur="'$valeur'"
  fi
  # Réécrire la ligne cible sans passer la valeur à sed (elle peut contenir | / & \).
  NOM="$nom_cible" VALEUR="$valeur" awk '
    BEGIN { nom = ENVIRON["NOM"]; valeur = ENVIRON["VALEUR"]; fait = 0 }
    index($0, nom "=") == 1 { print nom "=" valeur; fait = 1; next }
    { print }
    END { if (!fait) print nom "=" valeur }
  ' "$TRAVAIL" > "$TRAVAIL.nouveau"
  mv "$TRAVAIL.nouveau" "$TRAVAIL"
  echo "  $nom_source → $nom_cible : repris"
done

# Le relais posé, les courriels ne sont plus retenus.
if grep -q '^CGA_SMTP_MOT_DE_PASSE=.\+' "$TRAVAIL" && grep -q '^CGA_COURRIELS_DIFFERES=true' "$TRAVAIL"; then
  sed -i 's/^CGA_COURRIELS_DIFFERES=true/CGA_COURRIELS_DIFFERES=false/' "$TRAVAIL"
  echo "  CGA_COURRIELS_DIFFERES remis à false (relais SMTP posé)."
fi
chmod 600 "$TRAVAIL"
mv "$TRAVAIL" api.env
trap - EXIT
# Si sudo a servi, le fichier doit rester à `deploy`, qui lance docker compose.
[ -n "${SUDO_USER:-}" ] && chown "$SUDO_USER:" api.env api.env.avant-reprise
echo "api.env mis à jour. Relancer la pile : deployer.sh depuis le poste, ou ici :"
echo "  docker compose --env-file .env up -d"
