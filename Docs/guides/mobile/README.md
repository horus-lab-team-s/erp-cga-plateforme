# Guide d'utilisation de l'application mobile adhérent

- `guide-mobile.html` : la source du guide (A4, polices et logo lus dans `../../../../erp-cga-mobile/assets`).
- `Guide-utilisation-application-mobile-CGA.pdf` : le PDF livré (A4, 23 pages, version 1.1 du 20 octobre 2026).
- `../collection.css`, `../mise_en_page.py` : la charte commune aux trois guides et l'impression (césure, pied, signets, compression).
- `captures/` : les écrans (barre d'état du téléphone retirée).
- `facture-fictive.jpg` : la facture inventée qui sert aux aperçus de dépôt.
- `fabriquer.py` : refait le PDF.

## Refaire le PDF

```bash
python3 fabriquer.py
```

Deux passes de `google-chrome --headless=new --no-pdf-header-footer` : la première lit
(avec `pdftotext`) la page de chaque chapitre, la seconde l'écrit dans le sommaire. Ghostscript compresse, puis pypdf et reportlab
ajoutent le pied de page, les signets et les métadonnées.

## Refaire les captures

1. **Banc (sans téléphone)** : depuis `erp-cga-mobile`,
   ```bash
   APERCUS=/tmp/apercus flutter test test/apercus/apercus_test.dart
   APERCUS=/tmp/apercus FACTURE=$PWD/../erp-cga-plateforme/Docs/guides/mobile/facture-fictive.jpg \
     flutter test test/apercus/guide_test.dart
   ```
   Copier ensuite `justificatifs-en-attente`, `apercu-photo`, `apercu-scan`,
   `apercu-formulaire` (rogné au formulaire, y de 1085 à 2615), `echeances` (en
   `echeances-mobile-money`) et `ma-dsf` (en `dsf-a-fournir`).
2. **Téléphone (dossier de démonstration jp.nkoa@batimentplus.cm)** : toutes les autres,
   avec `outils/tournage/mobile/telephone.py`, `adb exec-out screencap -p`, puis 80 px
   rognés en haut (barre d'état). Vérifier avant chaque capture que l'appli CGA est au
   premier plan. Ne jamais toucher le bouton central « Déposer » ni les trois choix :
   ils ouvrent l'appareil photo, la galerie ou les fichiers du téléphone.
