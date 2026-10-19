# Guide du site et de l'espace adhérent

Guide d'utilisation pour les prospects et les adhérents : le site public (`erp-cga-vitrine`)
et l'espace client (routes `(adherent)` de `erp-cga-console` : « Ma création » et « Mon espace »).

| Fichier | Rôle |
|---|---|
| `Guide-utilisation-site-et-espace-adherent-CGA.pdf` | Le livrable (A4, 48 pages, version 1.0 du 19 octobre 2026) |
| `guide-vitrine.html` | La source du guide (texte, mise en page, charte) |
| `captures/*.png` | Les écrans réels, pris contre la pile de démonstration |
| `captures.py` | Prend les captures, puis construit le PDF |
| `polices/`, `cga-logo-*.{jpg,png}` | Poppins, Inter et le logo, copiés des dépôts |

## Régénérer

Depuis `erp-cga-plateforme`, avec la pile de démonstration lancée
(vitrine 3012, console 3011, API 8010 ; adresses modifiables par `GUIDE_VITRINE`,
`GUIDE_CONSOLE`, `GUIDE_API`) :

```sh
python3 Docs/guides/vitrine/captures.py public adherent   # sans effet sur les données
python3 Docs/guides/vitrine/captures.py pdf               # deux passes : sommaire numéroté
```

Préfixes des captures : `p` site public, `c` création (demande, proposition, suivi, compte),
`s` souscription, `a` espace adhérent (recadré sur sa colonne), `m` téléphone (390 points).

Le texte du PDF ne doit contenir aucun tiret cadratin.

## Attention

- **Limiteur : 30 connexions par 5 minutes pour toute la pile.** Chaque compte ouvre une
  seule session, gardée dans un fichier caché `.etat-*.json` à côté du script. Ces fichiers
  contiennent des témoins de session : ne les versionnez pas, supprimez-les après usage.
- `creation`, `creation-suite`, `confirmation` et `souscription` **écrivent dans la base** :
  demande fictive « EXEMPLE Awa », proposition, constat de caisse, compte client, pièce
  spécimen, devis. À lancer une seule fois, sur une pile neuve, dans cet ordre :
  `creation`, puis `creation-suite`. Les captures `c04`, `c07` et `c08` (prises avant le
  règlement) ont été recadrées à la main le 19 octobre 2026.
- Aucun paiement mobile money n'est déclenché : le règlement est constaté au guichet.
- Sur cette pile, la boîte de recette de l'API (`/transverse/courriels`) rend une erreur 500
  sans filtre : le script l'interroge gabarit par gabarit, et lit le lien de la proposition
  dans la fiche du dossier côté cabinet.
