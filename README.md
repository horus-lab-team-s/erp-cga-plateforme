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
| `Site_conception/` | Le site qui sert le document, déployable avec ce dossier pour racine |
| `deploiement/kubernetes/` | Les manifestes, dans leur ordre d'application |

## ⚠️ Où est passé le référentiel légal

Il était ici. Il est maintenant dans `erp-cga-backend`, sous `Docs/referentiel/`, et ce
déplacement mérite d'être expliqué parce qu'il contredit la règle qui a présidé à ce dépôt.

Toute la documentation est venue ici. Le référentiel n'en est pas : le serveur le lit **à
chaque requête**, pour décider d'un taux, d'un seuil, d'un motif de refus. Un serveur qui
ne peut ni démarrer ni être testé sans cloner un second dépôt est un serveur qu'on finit
par tester ailleurs, c'est-à-dire nulle part. Le fondement se discute, la valeur s'exécute.

Ce qui reste ici, c'est ce qui l'explique : `Docs/architecture/02-referentiel-normatif.md`,
et le circuit de contreseing du fiscaliste. Son historique d'avant la scission est dans le
journal de ce dépôt.

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

## Sauvegarder, et vérifier que la sauvegarde vaut quelque chose

```bash
outils/sauvegarde.sh   sauvegardes/                       # rôles + base, avec contrôle
outils/restauration.sh sauvegardes/cga-….dump  …roles.sql # dans une base NEUVE
```

⚠️ **Il n'y avait aucune procédure.** La seule phrase écrite disait « une base infogérée
dont quelqu'un vérifie les sauvegardes ». « Quelqu'un » n'est pas une procédure, et une
sauvegarde qu'on n'a jamais restaurée n'est pas une sauvegarde.

### Le piège, mesuré sur la pile en service

La base porte 35 politiques de cloisonnement. Une sauvegarde prise sous le rôle applicatif
`cga_app`, qui ne les contourne pas, **échoue bruyamment** :

```
pg_dump: error: query would be affected by row-level security policy
```

Le réflexe est d'ajouter l'option qui fait taire l'erreur, `--enable-row-security`. Elle la
fait taire, en effet :

| Sauvegarde | Taille | Lignes réellement présentes |
| --- | --- | --- |
| sous le rôle propriétaire | 193 035 octets | **1 173** |
| avec `--enable-row-security` | 10 171 octets | **8** |

Le fichier déclare bien ses 38 tables, donc il *paraît* complet. Il contient zéro compte,
zéro accusé de réception, zéro écriture comptable. Et la commande rend zéro : aucune
alerte, et on le découvre le jour de la restauration.

`sauvegarde.sh` compte donc les lignes en base et refuse une archive manifestement vide.

### Ce que `pg_dump` n'emporte pas

`cga_app` et `cga_migration` vivent dans la **grappe**, pas dans la base. Restaurée sur un
serveur neuf, la base seule retrouve ses 35 politiques et ses 152 privilèges — qui
désignent des rôles inexistants. `pg_dumpall --roles-only` les emporte, et le script le
fait toujours.

### Ce qui a été exercé, en vrai

| Contrôle | Résultat |
| --- | --- |
| 38 tables, ligne par ligne, avant et après | identiques |
| 35 politiques, 35 tables protégées | conservées |
| 152 privilèges de `cga_app` | conservés |
| Cloisonnement exercé sous `cga_app` | 0 ligne sans locataire, 12 comptes avec le bon, 0 avec un locataire étranger |
| Refus de restaurer par-dessus une base existante | déclenché |
| Refus d'une archive vide | déclenché sur les valeurs mesurées |

⚠️ **`restauration.sh` ne restaure jamais par-dessus une base existante.** On restaure le
plus souvent pour *vérifier* une sauvegarde, et c'est le cas où écraser la base en service
serait catastrophique. Le jour d'un vrai sinistre : restaurer dans une base neuve, puis
basculer.

## Le site de documentation

```bash
cd Site_conception
npm install
npm run dev
```

La construction relit `Docs/architecture/document-de-conception/` et engendre la page
servie. C'est la raison pour laquelle le site vit dans ce dépôt : l'en sortir obligerait à
recopier le document, donc à en tenir deux versions.
