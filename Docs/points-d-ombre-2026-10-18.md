# Points d'ombre : les réponses (18 octobre 2026)

Ce document répond aux questions de la liste du 18 octobre 2026 (points 3, 7, 12,
15, 16, 17 et 18). Les chiffres viennent du référentiel de la plateforme
(`erp-cga-backend/Docs/referentiel/parametres.yaml` et `baremes.yaml`). Une valeur
marquée **à valider** n'a pas encore été confirmée par le fiscaliste du cabinet :
tant qu'elle ne l'est pas, ce qu'elle produit n'est pas opposable.

Ce qui est dit du code décrit ce qu'il fait **aujourd'hui**. Ce qui manque est dit
aussi, avec le point de la liste qui le traitera.

---

## 1. Le groupe de risque CNPS (point 3)

La CNPS couvre trois risques, chacun avec sa cotisation :

| Branche | Qui paie | Taux | Assiette |
|---|---|---|---|
| Pensions (vieillesse, invalidité, décès), « PVID » | salarié et employeur | 4,2 % + 4,2 % | brut plafonné à 750 000 FCFA par mois |
| Prestations familiales | employeur seul | 7 % | brut plafonné à 750 000 FCFA par mois |
| **Accidents du travail et maladies professionnelles** | employeur seul | **selon le groupe de risque** | brut réel, sans plafond |

Le **groupe de risque** ne concerne que la dernière ligne. La CNPS classe chaque
employeur selon le danger de son activité, et lui notifie son groupe :

| Groupe | Activités typiques | Taux |
|---|---|---|
| A | risque faible : commerce, bureaux, services | 1,75 % |
| B | risque moyen : transport, artisanat, petite industrie | 2,5 % |
| C | risque élevé : BTP, mines, exploitation forestière | 5 % |

**Dans la plateforme**, le groupe est porté au dossier de l'entreprise (repris à
l'inscription) et appliqué sur chaque bulletin. Sans groupe connu, le calcul prend
A, le plus bas. Le cabinet doit donc relever le groupe sur la notification CNPS de
l'employeur : un BTP calculé en A sous-cotise de 3,25 points sur toute sa masse
salariale.

---

## 2. Le rapprochement des quittances TVA et CNPS (point 7)

Une **quittance** est la preuve, délivrée par l'administration (impôts ou CNPS),
qu'un montant a été payé. Le rapprochement consiste à vérifier qu'à chaque montant
déclaré correspond un paiement prouvé.

### Les deux voies de paiement

**L'adhérent paie lui-même l'administration.**

1. Il paie au guichet des impôts ou de la CNPS, ou en ligne.
2. Il dépose la quittance dans son espace, sur l'échéance concernée.
3. Un collaborateur la compare à l'échéance (montant, période, organisme) et
   rend son verdict. Le verdict est définitif et inscrit au journal d'audit, et
   l'adhérent reçoit un courriel.
4. L'échéance passe à « Payée ».

**Le cabinet paie pour lui** (adhérent mandaté, voir le point 9).

1. Un comptable ou un réviseur fixe le montant à payer : c'est l'« appel de
   fonds ».
2. L'adhérent verse ce montant au cabinet, par Tara ou au guichet.
3. Le cabinet paie l'administration, puis porte la quittance sur l'appel. C'est
   le « reversement ».
4. L'échéance passe à « Payée », par le même chemin que pour la première voie.

L'argent reçu dans la seconde voie n'appartient pas au cabinet : ce sont des
**fonds de tiers**. La plateforme les tient à part des honoraires et ne montre
jamais l'échéance comme payée tant que la quittance n'est pas portée.

### Où cela intervient dans la TVA d'une entreprise

La TVA du mois se **calcule** d'abord, à partir des écritures :

    TVA à payer = TVA collectée sur les ventes
                − TVA déductible sur les achats admise
                − crédit de TVA reporté du mois précédent

C'est ce montant que porte la déclaration déposée. La quittance intervient
**après** : elle prouve que ce montant a été payé. Elle ne change pas le calcul.

### Ce qui manque aujourd'hui

**Livré le 18 octobre 2026 (point 7) :**

* au verdict, le collaborateur peut relever le **montant de la quittance** ;
* une quittance validée **propose son écriture de paiement**, enregistrée en
  brouillon puis validée par le comptable. Au débit, le compte que le paiement
  solde, au plan du cabinet : 431 pour la CNPS, 4441 pour l'IRPP retenu à la
  source, 4431 pour la TVA. Au crédit, la trésorerie qui a payé : banque 521,
  mobile money 5231 ou caisse 571.

**Livré le 19 octobre 2026 :** la quittance se compare automatiquement au
montant de l'accusé de dépôt. La correspondance est sûre : l'échéancier pose
lui-même sur l'échéance la référence de son accusé, et seule cette référence sert
(jamais une estimation). À la vérification, la console affiche le montant de
l'accusé et l'écart dès que le montant de la quittance est saisi. Un écart de plus
d'un franc ne bloque pas la validation (paiement partiel, pénalités), mais il exige
un motif écrit, et l'écart reste au journal d'audit. Sans accusé consigné, la
quittance se vérifie comme avant.

---

## 3. Les charges, pas à pas (point 12)

### La TVA

**Le taux de 19,25 %** est la somme de deux impôts :

* la TVA proprement dite, à 17,5 % ;
* la **CAC**, centimes additionnels communaux, égale à 10 % de la TVA, soit 1,75 %.

17,5 + 1,75 = 19,25 %.

Seules les entreprises au **régime du réel** (chiffre d'affaires annuel
supérieur à 50 millions FCFA) facturent et récupèrent la TVA. Celles à l'impôt
général synthétique (IGS) ne la facturent pas.

**Exemple sur un mois :**

| | HT | TVA à 19,25 % |
|---|---:|---:|
| Ventes | 10 000 000 | 1 925 000 collectée |
| Achats avec facture conforme | 6 000 000 | 1 155 000 déductible |
| **TVA à payer** | | **770 000** |

Une TVA sur achat n'est déductible que si la facture est conforme (NIU du
fournisseur actif, mentions obligatoires) et réglée autrement qu'en espèces
au-delà du seuil fixé par la loi. C'est ce que contrôle la conformité.

**Retrouver le HT à partir du TTC** (point 14, livré) : HT = TTC ÷ 1,1925.
Exemple : 119 250 TTC donne 100 000 HT et 19 250 de TVA.

### Le bulletin de paie : un exemple complet

Un salarié payé **300 000 FCFA brut par mois**, sans avantage en nature, chez un
employeur du groupe A.

**Ce qui est retenu au salarié :**

| Ligne | Calcul | Montant |
|---|---|---:|
| CNPS pension (PVID) | 4,2 % × 300 000 | 12 600 |
| Crédit foncier (CFC) | 1 % × 300 000 | 3 000 |
| IRPP, CAC compris | voir ci-dessous | ≈ 17 131 |
| Taxe de développement local (TDL) | palier 250 001 à 300 000 : 24 000 par an, soit 1/12 | 2 000 |
| Redevance audiovisuelle (RAV, CRTV) | palier 200 001 à 300 000 | 3 250 |
| **Total retenu** | | **≈ 37 981** |
| **Net à payer** | 300 000 − 37 981 | **≈ 262 019** |

**Le calcul de l'IRPP, pas à pas :**

1. Brut annuel : 300 000 × 12 = 3 600 000.
2. Frais professionnels : 30 % du brut, plafonnés à 4 800 000 par an, soit
   1 080 000.
3. Pension CNPS du salarié, sur l'année : 12 600 × 12 = 151 200.
4. Abattement forfaitaire : 500 000.
5. Revenu imposable : 3 600 000 − 1 080 000 − 151 200 − 500 000 = **1 868 800**.
6. Barème progressif annuel :
   * 10 % jusqu'à 2 000 000 ;
   * 15 % de 2 à 3 millions ;
   * 25 % de 3 à 5 millions ;
   * 35 % au-delà.

   Ici, tout tombe dans la première tranche : 1 868 800 × 10 % = 186 880.
7. CAC : 10 % de l'IRPP, soit 18 688. Total annuel : 205 568.
8. Par mois : 205 568 ÷ 12 ≈ **17 131**.

Un salaire brut inférieur à 62 000 FCFA par mois ne supporte pas d'IRPP (seuil
**à valider**).

**Ce que paie l'employeur, en plus du brut :**

| Ligne | Calcul | Montant |
|---|---|---:|
| CNPS pension | 4,2 % × 300 000 | 12 600 |
| Prestations familiales | 7 % × 300 000 | 21 000 |
| Accidents du travail, groupe A | 1,75 % × 300 000 | 5 250 |
| CFC employeur | 1,5 % × 300 000 | 4 500 |
| FNE (Fonds national de l'emploi) | 1 % × 300 000 | 3 000 |
| **Charges patronales** | | **46 350** |
| **Coût total du salarié** | 300 000 + 46 350 | **346 350** |

**Où va l'argent :**

* La CNPS reçoit les pensions des deux parts, les prestations familiales et les
  accidents du travail. Ensemble, ces lignes forment la **DIPE** du mois.
* Les impôts reçoivent l'IRPP, la TDL, la RAV, le CFC et le FNE.

**Ce que la plateforme en fait** (point 8, livré le 18 octobre 2026) : ces
montants sont une **proposition**, en six rubriques (CNPS, IRPP, CFC, FNE, TDL,
RAV). Le collaborateur les corrige au besoin, avec un motif s'il s'écarte de la
proposition, puis les arrête. Seul le montant arrêté fait foi.

---

## 4. L'équilibre de la balance et le grand livre (point 15)

**Toute écriture est équilibrée.** En partie double, chaque opération se lit deux
fois. Une facture d'achat de 119 250 TTC s'écrit ainsi :

| Compte | Débit | Crédit |
|---|---:|---:|
| 60x Achats | 100 000 | |
| 4452 TVA récupérable | 19 250 | |
| 401 Fournisseur | | 119 250 |

Le total des débits égale le total des crédits. La plateforme **refuse** toute
écriture déséquilibrée et ne l'équilibre jamais à la place du comptable : un
écart est une erreur de saisie à comprendre, pas un chiffre à combler.

**Le grand livre** reprend, compte par compte, toutes les écritures dans l'ordre
des dates, avec le solde qui court après chaque ligne. Il sert à répondre à la
question « d'où vient ce solde ? ».

**La balance** résume le grand livre : une ligne par compte, avec le total des
débits, le total des crédits et le solde. Comme chaque écriture est équilibrée, la
balance l'est aussi : total des débits = total des crédits. Si elle ne l'est pas,
une écriture est incomplète ou a été altérée.

**Les contrôles du code :**

* **balance équilibrée** : les deux totaux sont égaux ;
* **bouclage** : la balance redonne bien les totaux des journaux ;
* **séquences incomplètes** : il ne manque aucun numéro d'écriture dans un
  journal ;
* seules les écritures **validées** entrent dans la balance, jamais un brouillon.

**L'agent comptable IA** (évolution prévue) suivra la règle des autres agents de
la plateforme : il propose, un humain décide. Il pourra signaler un compte au
solde anormal (un fournisseur débiteur, une caisse négative), proposer une
imputation ou expliquer un écart. Il ne validera jamais une écriture, et la
balance continuera de se calculer sans lui.

---

## 5. Les postes de l'actif et leur impact (point 16)

### Les immobilisations corporelles (comptes 22 à 24)

Ce sont les biens durables que l'entreprise garde pour travailler plus d'un an :
terrain, bâtiment, véhicule, matériel informatique, mobilier. Elles s'inscrivent
au bilan à leur **valeur d'origine hors taxe**. Un achat d'immobilisation n'est
pas une charge du mois : il ne réduit pas le résultat le jour de l'achat.

### Les amortissements (comptes 28)

Un bien s'use. L'amortissement répartit son coût sur sa durée d'utilisation.

**Exemple :** un véhicule de 12 000 000 HT, amorti sur 4 ans, mis en service le
1er juillet.

* Amortissement annuel : 12 000 000 ÷ 4 = 3 000 000.
* La première année est calculée au prorata des jours d'utilisation (184 jours sur
  365) : environ 1 512 000.

Chaque année, l'écriture d'amortissement débite le compte 681 (dotation aux
amortissements, une **charge**) et crédite le compte 28 (amortissements). Au
bilan, le bien apparaît pour sa **valeur nette** : valeur d'origine moins
amortissements cumulés.

**Impact :** la dotation réduit le résultat, donc l'IS, sans sortie d'argent. Un
terrain ne s'amortit pas : il ne s'use pas.

**Dans la plateforme** (travail en cours, non commité) :

* registre des immobilisations ;
* tableau d'amortissement linéaire, exporté en Excel ;
* écriture de dotation proposée en brouillon à la clôture.

Ce tableau est l'une des pièces jointes de la DSF.

### Les dépréciations (comptes 29, 39, 49)

Une dépréciation constate une perte de valeur **probable**, et non une usure. Le
cas le plus courant est celui d'un client qui ne paiera sans doute pas : on
déprécie sa créance (compte 491). L'écriture est une charge, comme
l'amortissement, mais elle se reprend si le client finit par payer.

### Clients et comptes rattachés (compte 411)

C'est ce que les clients doivent encore : une facture émise et non encaissée.

**Impact :**

* La TVA est collectée **à la facture**, pas à l'encaissement : l'entreprise peut
  devoir à l'État une TVA qu'elle n'a pas encore reçue.
* Un poste clients qui grossit signale des retards de paiement, donc une
  trésorerie qui se tend.

**Dans la plateforme :**

* balance auxiliaire par client ;
* lettrage, qui associe une facture à son règlement ;
* déclaration par tiers.

### La trésorerie active (classe 5)

C'est l'argent disponible : banque (521), mobile money (55), caisse (571).

**Impact :** c'est le seul poste qui dit si l'entreprise peut payer demain. Un
résultat bénéficiaire avec une trésorerie vide est fréquent : les clients n'ont
pas encore payé, ou le bénéfice a servi à acheter du matériel.

**Dans la plateforme :**

* rapprochement bancaire : le relevé de la banque est comparé au compte 521 ;
* il n'existe pas encore de tableau de bord de trésorerie.

---

## 6. La transmission de la DSF à la DGI (point 17)

**Le point d'accès.** La plateforme n'appelle **aucun** service de la DGI. Le
dépôt se fait à la main, sur le portail de la DGI, par le collaborateur. La
plateforme enregistre ensuite l'accusé de réception qu'il rapporte, après en
avoir vérifié la référence et l'empreinte. L'API de la DGI existe (huit appels,
jeton temporaire, documentation visible après connexion), mais elle n'est pas
branchée : le passage par Excel est la voie retenue pour l'instant.

**Le format.** Le fichier produit est le **modèle Excel officiel de la DGI**
(`DSF_Normal_DGIFORMAT_VERROUILLEVF.xlsx`), téléchargé sur impots.cm. Son empreinte
est conservée, pour savoir si la DGI le change.

* Les montants sont écrits dans les feuilles « Bilan » et « Compte de résultat »,
  aux lignes repérées par leurs codes officiels SYSCOHADA (AD, AE…). Aucune autre
  feuille n'est touchée.
* Le fichier porte le **nom exact du modèle** : le portail refuse tout autre nom.
* La plateforme refuse de le produire si l'exercice est ouvert, si un compte n'a
  pas de ligne officielle, si le bilan ne s'équilibre pas, ou si l'entreprise
  relève de l'IGS ou du système minimal (SMT).

**Ce qui est sûr :** les tests vérifient que les codes du fichier sont ceux du
modèle, que seules deux feuilles changent, que chaque montant tombe sur sa ligne,
et que le nom du fichier est le bon.

**Ce qui ne l'est pas encore :**

1. **La table de correspondance des comptes** vers les lignes officielles doit
   être validée par l'expert-comptable du cabinet. C'est le préalable à tout
   dépôt réel.
2. **Aucun dépôt réel** n'a encore été fait sur le portail. Le premier doit être
   fait avec un dossier de test et relu ligne à ligne.
3. **Les accusés de dépôt** sont rangés en base (table `accuse_reception`) et
   survivent au redémarrage. *Corrigé le 18 octobre : une première version de ce
   document les disait gardés en mémoire, à tort.*
4. **Les fiches R1 à R3** sont remplies, mais l'emplacement de leurs cellules est
   à confirmer sur le portail.
5. **Les notes annexes** ne sont pas remplies.
6. **Les anciens codes de liasse**, qui ne correspondent pas aux codes
   officiels, servent encore aux systèmes autres que le Normal. Le Système Normal
   utilise la bonne table.

---

## 7. L'IS, et le principe du bulletin de paie (point 18)

### L'impôt sur les sociétés (IS)

C'est l'impôt sur le **bénéfice** d'une société (SARL, SA, SAS). Un entrepreneur
individuel paie l'IRPP sur ses bénéfices à la place.

**Le calcul, pas à pas :**

1. **Résultat comptable** : les produits moins les charges de l'exercice,
   amortissements compris.
2. **Résultat fiscal** : on part du résultat comptable, on **réintègre** les
   charges que la loi n'admet pas (amendes, dépenses somptuaires, charges sans
   facture conforme…) et on **déduit** ce que la loi exonère.
3. **Abattement CGA** : l'adhérent d'un centre de gestion agréé bénéficie d'un
   abattement de **50 %** sur son bénéfice fiscal (CGI art. 118 et 119). C'est
   l'un des premiers intérêts de l'adhésion. Ses conditions (plafond, délai après
   l'adhésion) sont **à préciser**.
4. **Taux** : 30 % au réel normal, 25 % au régime simplifié, plus la CAC de 10 %
   de l'impôt.
5. **Minimum de perception** : l'IS ne peut pas être inférieur à un pourcentage du
   chiffre d'affaires, 2 % hors CAC au référentiel (**à valider**). Une société en
   perte paie donc quand même ce minimum.

**Exemple** au réel normal, pour un bénéfice fiscal de 10 000 000 :

|  | Sans abattement CGA | Avec l'abattement de 50 % |
|---|---:|---:|
| Base imposable | 10 000 000 | 5 000 000 |
| IS à 30 % | 3 000 000 | 1 500 000 |
| CAC (10 % de l'IS) | 300 000 | 150 000 |
| **Total dû** | **3 300 000** | **1 650 000** |

Dans les deux cas, on retient le plus élevé de ce montant et du minimum de
perception.

### Le principe du bulletin de paie

Le bulletin est le document que l'employeur remet au salarié chaque mois. Il a
trois étages :

1. **Ce qui est gagné** : le salaire de base, les primes et les avantages en
   nature. Leur somme est le **brut**.
2. **Ce qui est retenu au salarié** : sa part de CNPS, son IRPP, le CFC, la TDL et
   la RAV. Le brut moins ces retenues donne le **net à payer**, ce qu'il reçoit.
3. **Ce que paie l'employeur en plus** : sa part de CNPS, les prestations
   familiales, les accidents du travail, le CFC employeur et le FNE. Ces lignes
   ne touchent pas le net, mais forment le **coût total** du salarié.

L'exemple chiffré est à la section 3. Un **avantage en nature** (logement,
véhicule) entre dans le brut imposable, mais pas dans le net, puisque le salarié
l'a reçu autrement qu'en argent.

Chaque ligne du bulletin produit par la plateforme dit quel paramètre du
référentiel elle applique. Si l'un d'eux est encore « à valider », le bulletin le
signale et se déclare **provisoire**.

---

## Ce que le cabinet doit confirmer

| Paramètre | Valeur au référentiel |
|---|---|
| Minimum de perception de l'IS | 2 % du chiffre d'affaires, hors CAC |
| Conditions de l'abattement CGA de 50 % | plafond et délai après adhésion |
| Seuil de dispense d'IRPP sur salaire | 62 000 FCFA par mois |
| Barèmes IRPP, TDL et RAV | tous « à valider » |
| SMIG | 60 000 non agricole, 45 000 agricole |
| Table de correspondance des comptes vers la DSF | à valider par l'expert-comptable |
