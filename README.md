# Plateforme CGA Broad Range · conception, recette et déploiement

Ce dépôt porte ce qui parle des **quatre autres à la fois** : le document de conception, les
journaux de construction, le registre de recette, les manifestes de déploiement, et le site
qui sert la documentation.

Conception et réalisation : **TCHAMBA TCHAKOUNTE Edwin**, ingénieur informaticien.

## Les cinq dépôts

| Dépôt | Ce qu'il porte |
| --- | --- |
| `erp-cga-backend` | Le serveur : quatorze contextes bornés, le référentiel légal, le contenu éditorial de la vitrine |
| `erp-cga-console` | La console du cabinet et l'espace de l'adhérent |
| `erp-cga-vitrine` | Le site public |
| `erp-cga-mobile` | L'application de terrain, hors ligne |
| **`erp-cga-plateforme`** | Ce dépôt : la conception, la recette, le déploiement, le site de documentation |

## Ce qu'il contient

| Dossier | Contenu |
| --- | --- |
| `Docs/architecture/` | Le dossier de conception, à lire dans l'ordre, et les journaux des trois chantiers |
| `Docs/architecture/document-de-conception/` | **La source unique** du document publié : 136 sections, 102 figures |
| `Docs/architecture/avancement/grille-des-ecrans.yaml` | La cible que l'outil d'avancement mesure |
| `Docs/recette/` | Le registre des soixante-quinze cas d'usage, et le cahier qu'il engendre |
| `Docs/referentiel/` | Les paramètres légaux datés, leurs fondements et leur statut de validation |
| `Site_conception/` | Le site qui sert le document, déployable avec ce dossier pour racine |
| `deploiement/kubernetes/` | Les manifestes, dans leur ordre d'application |

⚠️ **Le référentiel légal est ici, et le serveur le lit par un chemin réglable.** Il n'est
pas du code : c'est la matière que le fiscaliste relit et contresigne, et son domicile
naturel est le dépôt de la conception. Le serveur le désigne par `CGA_DOSSIER_REFERENTIEL`.

## ⚠️ Ce que la scission a rendu fragile, et qui doit être surveillé

Trois outils du dépôt backend mesurent l'invariant du projet, « tout ce que le serveur
permet est à l'écran ». Ils lisent maintenant **trois dépôts** : le serveur pour ses
routes, les deux interfaces pour leurs appels, et celui-ci pour la grille. Les réglages :

```bash
CGA_RACINE_CONSOLE=../erp-cga-console:../erp-cga-vitrine \
CGA_RACINE_PLATEFORME=../erp-cga-plateforme \
python -m outils.avancement_des_ecrans
```

⚠️ **Un dépôt manquant fait échouer l'outil, jamais afficher « cent pour cent ».** C'est
délibéré : un outil de vérification qui, faute de trouver ce qu'il doit lire, annonce zéro
écart est pire qu'un outil absent, puisqu'il éteint l'alarme qu'il portait. Au premier essai
après la scission, ne lire que la console a fait tomber le compte de 226 à 222 sans
qu'aucune route n'ait disparu : les quatre manquantes étaient celles de la vitrine.

## Le site de documentation

```bash
cd Site_conception
npm install
npm run dev
```

La construction relit `Docs/architecture/document-de-conception/` et engendre la page
servie. C'est la raison pour laquelle le site vit dans ce dépôt : l'en sortir obligerait à
recopier le document, donc à en tenir deux versions.
