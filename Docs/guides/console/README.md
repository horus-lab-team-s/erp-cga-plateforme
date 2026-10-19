# Guide d'utilisation de la console du cabinet

**Livrable : `Guide-utilisation-console-CGA.pdf`** (A4, 70 pages, version 1.0 du 19 octobre 2026).

| Fichier | Rôle |
|---|---|
| `guide-console.html` | la source du guide (texte, styles d'impression) |
| `captures/*.png` | les écrans, photographiés sur la pile réelle, 1440 x 900, échelle 1,5 |
| `captures.py` | le script qui refait les captures (une session par profil) |
| `sessions.py` | ouverture et réutilisation des sessions, code du second facteur |
| `construire.py` | le rendu PDF : sommaire paginé, pieds de page, signets |
| `polices/` | Poppins et Inter (licence OFL), `cga-logo-blanc.png` pour la couverture |

## Régénérer

1. Une pile de démonstration doit tourner (console 3011, vitrine 3012, API 8010).
2. Refaire les captures :

       CGA_GUIDE_SESSIONS=/un/dossier/hors/du/depot python3 Docs/guides/console/captures.py
       python3 Docs/guides/console/captures.py 12 34     # seulement les captures 12* et 34*

   Le dossier des sessions garde les témoins de connexion et les secrets du second
   facteur : il ne se versionne jamais (par défaut `.sessions/` à côté du script).
   Le limiteur de la pile retient 30 connexions par cinq minutes : le script ouvre une
   session par profil et la réutilise, ne le lancez pas en boucle.
   Au premier passage sur une pile neuve, il dépose une demande sur la vitrine, ouvre
   une prestation ponctuelle, rédige une offre de poste en brouillon et enrôle le second
   facteur de la réviseure et du super administrateur (par le lien que la pile retient).
   Il n'encaisse rien, ne prépare aucune DSF, ne consigne aucun dépôt.
   Il utilise Google Chrome (`CGA_NAVIGATEUR=chrome`) pour que les champs natifs (date,
   fichier) parlent français.
3. Rendre le PDF :

       python3 Docs/guides/console/construire.py

   Chrome sans en-tête ni pied ; les captures entrent au PDF en JPEG (1600 px) pour
   tenir le fichier vers 14 Mo ; pypdf et reportlab ajoutent la numérotation et les
   signets.

## Règles de rédaction

Français, vouvoiement, aucun tiret cadratin (la CI de la plateforme le refuse).
Ne décrire que ce qui fonctionne dans la console ; ce qui est partiel va dans un encadré
« Fonction partielle » et dans l'annexe du chapitre 21.
