# Le scénario de bout en bout, de la création au suivi

Ce document décrit **un seul parcours**, joué du premier clic d'un inconnu sur le site
public jusqu'à la pièce que son comptable traite dans la console. Il nomme à chaque étape
**qui** agit, **avec quel compte**, et **ce qui doit être vrai** pour que l'étape compte
comme réussie.

⚠️ **Il ne remplace pas le registre des soixante-quinze cas d'usage.** Celui-ci vérifie
chaque geste séparément, et c'est ce qui permet de dire qu'un geste marche. Le scénario
vérifie autre chose, que la somme des gestes ne dit jamais : que les gestes **s'enchaînent**,
et qu'une donnée posée à l'étape 2 se retrouve bien à l'étape 9.

## Les comptes du jeu de démonstration

Tous partagent le mot de passe `cabinet brcg douala 2026`. Trois d'entre eux **doivent**
échouer à la connexion, et c'est voulu.

| Compte | Nom | Rôle | Portée |
| --- | --- | --- | --- |
| `A-001` | Jean-Pierre NKOA | Adhérent | BATIMENT |
| `A-002` | Marie-Claire ESSOMBA | Adhérent | COLOMBE |
| `A-003` | Émile TCHOUMBA | Adhérent | TCHOUMBA · ⚠️ **jamais activé** |
| `C-001` | Bernadette MBALLA | Direction | tout le cabinet |
| `C-002` | Serge ONANA | Administrateur | tout le cabinet |
| `C-003` | Aïcha BOUBA | Réviseur | tout le cabinet |
| `C-004` | Léonard FOTSO | Comptable | BATIMENT, COLOMBE, AGRO |
| `C-005` | Christelle NDONGO | Comptable | TCHOUMBA, NGUEMA |
| `C-006` | Roger EBOLO | Fiscaliste | tout le cabinet |
| `C-007` | Patricia MOUKOURI | Chargé de clientèle et de formalités | tout le cabinet |
| `C-008` | Alain TCHINDA | Comptable | CLINIQUE · ⚠️ **suspendu** |
| `I-001` | Georges ATANGANA | Inspecteur assistant | AGRO |

## Le décor

| Pièce | Adresse | Rôle dans le scénario |
| --- | --- | --- |
| Vitrine | `localhost:3101` | Ce que voit l'inconnu |
| Console | `localhost:3100` | Ce que voient le cabinet et l'adhérent |
| Serveur | `localhost:8100` | Ce qui décide |
| Application de terrain | TECNO KM5, par câble | Ce que fait l'adhérent dans sa boutique |

⚠️ **Base neuve avant chaque passe.** Les étapes écrivent ; une seconde passe sur une base
déjà écrite fait échouer des cas pour la seule raison que la première est passée.

---

## Acte I · L'inconnu (aucun compte)

| # | Geste | Ce qui doit être vrai |
| --- | --- | --- |
| 1 | Ouvrir l'accueil de la vitrine | La page se sert sans compte, et le contenu vient du **serveur**, pas du secours |
| 2 | Lire un article du blog | L'article s'ouvre, son illustration s'affiche |
| 3 | Ouvrir « Créer mon entreprise » | La liste des pièces à réunir est celle du référentiel |
| 4 | Demander une estimation | Un montant, et **le détail de son calcul** : aucun prix n'est opposable sans sa règle |
| 5 | Souscrire une prestation | Un numéro de dossier est rendu, sans compte créé |
| 6 | Suivre son dossier par ce numéro | Le suivi s'ouvre **sans mot de passe** : le prospect n'en a pas encore |

⚠️ **Le NIU est exigé dès que le service ouvre un accès** (UC-15). Une souscription qui
donnerait un espace sans numéro d'identifiant fiscal ouvrirait un dossier qu'on ne peut
rattacher à personne.

## Acte II · Le paiement, et la naissance de l'accès

| # | Geste | Ce qui doit être vrai |
| --- | --- | --- |
| 7 | Régler la proforma, en mode simulé | L'accès s'ouvre, **et un courriel part** (UC-16) |
| 8 | Vérifier que la simulation est gardée | En production, cette route **refuse** : 409 dès que des identifiants réels existent (UC-18) |
| 9 | Suivre le lien reçu, définir son mot de passe | Le compte devient actif ; sans ce geste il reste **ni actif ni inexistant** (UC-17) |

## Acte III · L'adhérent, depuis son écran

| # | Compte | Geste | Ce qui doit être vrai |
| --- | --- | --- | --- |
| 10 | `A-001` | Se connecter à la console | L'espace adhérent s'ouvre, jamais celui du cabinet |
| 11 | `A-001` | Lire son mois | Ce qui manque, ou que tout est complet (UC-65) |
| 12 | `A-001` | Répondre à une demande du cabinet | La demande reste **ouverte** : répondre n'est pas fournir (UC-66) |

## Acte IV · L'adhérent, depuis le terrain

| # | Geste | Ce qui doit être vrai |
| --- | --- | --- |
| 13 | Se connecter sur le téléphone | Session ouverte contre le serveur ; le dossier est **relu du serveur**, jamais deviné |
| 14 | Photographier une facture | La pièce entre en file, et la photo est **recopiée hors du cache** |
| 15 | Envoyer | La file se vide, la pièce existe côté serveur |
| 16 | Renvoyer la même pièce | Le serveur répond **rejeu** : une seule pièce, jamais deux |

⚠️ **Sans réseau, rien ne doit être perdu ni refusé.** Une coupure laisse la pièce en
attente ; une session expirée la laisse en attente **sans compter de tentative**.

## Acte V · Le cabinet

| # | Compte | Geste | Ce qui doit être vrai |
| --- | --- | --- | --- |
| 17 | `C-004` | Ouvrir la boîte de réception | La pièce du téléphone y figure, canal **« Application mobile »** |
| 18 | `C-004` | Ouvrir la pièce | Le document se télécharge : c'est bien la photo prise |
| 19 | `C-005` | Ouvrir la même boîte | ⚠️ Elle **ne voit pas** la pièce : ce dossier n'est pas le sien |
| 20 | `C-002` | Ouvrir le tableau de bord | ⚠️ **Refusé**, et le refus nomme les rôles qui y ont droit |
| 21 | `C-002` | Ouvrir les comptes et habilitations | Les douze comptes, dont le suspendu et le jamais activé |
| 22 | `C-001` | Lire le journal d'audit | Les gestes des actes précédents y figurent, chaînés |

## Ce que le scénario ne couvre pas, et pourquoi

| Hors scénario | Raison |
| --- | --- |
| Le paiement réel | Aucun identifiant du fournisseur ; la simulation est gardée, et c'est l'étape 8 qui le vérifie |
| L'envoi réel d'un courriel | Aucun relais configuré : les courriels sont **retenus**, jamais envoyés |
| Les valeurs légales non contresignées | Cinquante et une attendent le fiscaliste ; le produit les applique, personne ne les a encore arrêtées |
