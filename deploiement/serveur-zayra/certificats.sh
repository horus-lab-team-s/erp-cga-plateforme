#!/usr/bin/env bash
# Le certificat Let's Encrypt des trois noms de CGA, puis la configuration https.
#
#     ./certificats.sh
#
# Même outillage que les autres projets du serveur : le conteneur certbot, les volumes du nginx
# partagé (certificats et racine de validation HTTP-01). Un seul certificat couvre les trois noms.
set -euo pipefail
cd "$(dirname "$0")"

./poser-nginx.sh nginx/cga-brcg-http.conf
docker run --rm \
  -v backend_certbot_certs:/etc/letsencrypt \
  -v backend_certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  --cert-name cga-brcg.horus-lab.com \
  -d cga-brcg.horus-lab.com -d console.cga-brcg.horus-lab.com -d api.cga-brcg.horus-lab.com \
  --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring
./poser-nginx.sh nginx/cga-brcg.conf

# Le renouvellement, une fois par semaine, comme les autres projets.
LIGNE='5 5 * * 1 docker run --rm -v backend_certbot_certs:/etc/letsencrypt -v backend_certbot_www:/var/www/certbot certbot/certbot renew --cert-name cga-brcg.horus-lab.com --quiet && docker exec backend-nginx-1 nginx -t -q && docker exec backend-nginx-1 nginx -s reload  # CGA BRCG TLS'
( crontab -l 2>/dev/null | grep -v '# CGA BRCG TLS' ; echo "$LIGNE" ) | crontab -
echo "Certificat posé ; renouvellement planifié le lundi à 5 h 05."
