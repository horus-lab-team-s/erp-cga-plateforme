# Journal de bord — ERP et vitrine CGA Broad Range Consulting

Ce journal consigne les échanges avec le cabinet, les décisions prises et leur
motif. Il est versionné avec le code : une décision sans son pourquoi se perd en
quelques semaines, et le code seul ne dit jamais ce qui a été écarté.

L'entrée la plus récente est en tête. Chaque entrée dit : ce qui a été demandé,
ce qui a été décidé et pourquoi, ce qui a été livré, ce qui reste.

---

## 30 septembre 2026 (suite 2) — Elle suit sa création, sans compte

Le cabinet a tranché après avoir nommé la contrainte lui-même : **on ne peut
écrire librement sur la messagerie instantanée que dans les vingt-quatre heures
qui suivent le dernier mot du client.** Hors de cette fenêtre, il faut un modèle
approuvé, et aucun des sept ne l'est. Une formalité dure des semaines.

Bâtir la chaîne documentaire d'une création sur cette horloge, c'est la remettre
à autrui. Décision : **un espace de suivi, ouvert par un lien signé, sans
compte.**

### Ce qui existe maintenant

    GET  /creations/{ref}/suivi          son dossier, son étape, ses pièces
    POST /collecte/fichiers-scelles      elle téléverse son document
    POST /creations/{ref}/suivi/pieces   il se rattache à la pièce attendue
    GET  /collecte/fichiers/{empreinte}  le cabinet l'ouvre
    POST /collecte/fichiers-de-formalite le cabinet dépose ce qu'il reçoit

Et la page, `/fr/mon-dossier/{ref}?s=…`, dessinée d'abord pour 360 px : c'est sur
un téléphone qu'elle l'ouvrira, et pour y photographier des documents.

Vérifié dans un navigateur, sur la pile :

    avant le dépôt : manquants 7 · déjà reçus 1
    après le dépôt : manquants 6 · déjà reçus 2

### Le lien n'expire pas, et c'est le cœur de sa conception

Sa durée de vie est **celle du dossier** : il ouvre tant que la formalité est en
cours, et cesse dès qu'elle est convertie ou abandonnée.

Les deux autres options ont été écartées et le code dit pourquoi :

- **inventer trente ou quatre-vingt-dix jours** l'aurait enfermée dehors au milieu
  de sa formalité, et le référentiel ne porte aucun délai validé : j'aurais écrit
  une durée que personne n'a décidée ;
- **le sceller sur l'étape** l'aurait invalidé à chaque jalon franchi, c'est-à-dire
  précisément quand elle a une raison de revenir.

Il n'est pas non plus à usage unique, contrairement à celui de la proforma : on
n'accepte qu'une fois, on suit pendant des semaines.

⚠️ **Et toujours pas de mot de passe.** La décision du 27 septembre tient, avec sa
raison : « un formulaire à identifiants pour envoyer la photo d'une carte
d'identité ferait abandonner la moitié des dossiers ». Le compte arrive avec la
société, au NIU.

### Le sceau vit à `partage/`, et cela a servi deux fois

La Création émet le lien, la Collecte range le fichier, et le graphe n'autorise
pas ces deux-là à se voir. Leur ouvrir une arête se serait fait en une ligne —
c'est exactement ce que ce graphe existe pour empêcher.

⚠️ **Le sceau s'est d'abord appelé `exiger`**, comme la garde de permission du
Transverse. Le cas qui tient close la liste des routes publiques s'y est trompé :
il a cru la route gardée parce qu'elle appelait « exiger ». Un lecteur pressé s'y
serait trompé de même, et aurait cru qu'un sceau vaut une habilitation. **Il ne
vaut pas** : il prouve que le cabinet a émis un lien, jamais qui le présente.
Renommé `exiger_le_sceau`, et le nom est long exprès.

### Quatre défauts trouvés en le faisant pour de vrai

**La fonction était à moitié bâtie.** Elle déposait, le fichier arrivait au
magasin, l'empreinte s'inscrivait — et **personne ne pouvait l'ouvrir** : le seul
téléchargement passait par un identifiant de pièce, donc par un NIU, qu'une
formalité n'a pas.

**Le compte ne bougeait pas.** La ligne disait « document reçu », mais « il nous
manque 8 documents » restait à huit. Une cliente qui envoie neuf pièces a besoin
de voir le compte descendre : sans cela, elle renvoie deux fois le même document
par précaution.

**Une empreinte tronquée rendait 500.** Le magasin refuse déjà toute clé qui n'est
pas un SHA-256 ; ma route n'attrapait pas ce refus. Elle rend 404, la même
réponse qu'une empreinte inconnue : distinguer les deux dirait à un curieux que
sa forme est bonne.

**Le cabinet n'avait pas le chemin que je venais de donner à la cliente.** Un
collaborateur qui recevait la même pièce autrement ne pouvait que cocher une
case. Le dossier portait deux sortes de pièces reçues, et six mois plus tard on
ne savait plus laquelle portait son document. Le geste existant a été étendu :
« Joindre et marquer reçue », le fichier restant facultatif — une pièce vue au
guichet et rendue au client existe.

### Les messages, repris de fond en comble

Le cabinet ne veut **aucun tiret cadratin** dans ce qu'un client lit. Mesuré :
trente-sept dans les courriels rendus, dont trente-quatre venaient du pied de
page et de son séparateur, répétés sur dix-huit gabarits. Plus un dans un modèle
WhatsApp, et **dix libellés servis** — clôture, comptabilité, catalogue,
obligations, checklist de création.

La signature emploie maintenant `-- `, le séparateur que la RFC 3676 pose et que
les messageries reconnaissent. Cinq cas tiennent la règle : texte, HTML, objet,
modèles WhatsApp, séparateur.

⚠️ **Un libellé de pièce est COPIÉ dans le dossier à son ouverture.** Les dossiers
ouverts avant la correction gardent donc leur cadratin. Reprendre leurs données
demande l'accord du cabinet.

Côté style, une amélioration qui se voit **avant d'ouvrir** : chaque message
s'annonçait « CGA Broad Range Consulting Group », dix-huit fois la même ligne. Il
porte désormais le début du premier paragraphe.

### Trois leçons sur la chaîne de vérification

**Un cas de recette reconnaissait un courriel à sa formule.** Le flux cherchait
« bien reçu » dans l'objet ; l'objet a changé en retirant le cadratin, et il a
déclaré qu'aucun courriel n'était arrivé — alors qu'il était là. Il reconnaît
désormais l'accusé **à sa référence** : une formulation se reprend, une référence
non.

**Deux sessions pytest sur la même base se marchent dessus**, et produisent des
échecs qui ressemblent exactement à des défauts du produit. Six échecs se sont
ainsi évanouis en rejouant seul.

**Une suite qui tourne sur un arbre qui bouge** rend des verdicts sur un code qui
n'existe nulle part. Un échec de la liste close des routes publiques venait de
là.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 30 septembre 2026 (suite) — La souscription de création, pas à pas

Demande du cabinet : « est-ce que la souscription jusqu'à fixation de prix marche
déjà côté demande de création d'entreprise ? » Joué sur la pile, pas à pas, dix
étapes.

### Ce que le produit a répondu

    ✓  1. Elle dépose sa demande depuis le site            201
    ✓  2. Le dossier entre dans la file                    DEPOSEE
    ✓  3. Un responsable est désigné                       AFFECTEE · C-001
    ✓  4. Le questionnaire de création est publié          13 questions, version 2
    ✓  5. Chiffrer AVANT de qualifier                      409 · les 9 manquantes nommées
    ✓  6. La qualification est enregistrée                 complète · 10/13 · QUALIFIEE
    ✓  7. Le chiffrage rend un INTERVALLE                  200 000 / 250 000 / 375 000
    ✓  8. Un comptable arrête le prix                      403 · permission nommée
    ✓  9. 150 000 F sous le plancher, sans motif           422
    ✓ 10. Le même prix, motif à l'appui                    201 · PRO-2026-0041

**Oui, la chaîne marche de bout en bout.**

### Trois choses que la relecture confirme

**Le refus du pas 9 est une phrase, pas un code** : « un écart accordé sans raison
écrite est un écart que personne ne saura défendre six mois plus tard ».

**Le chiffrage avoue ce qu'il n'a pas pu calculer** :

    ⚠ TAR-STA-001 : sans réponse à « statuts_apportes », ajustement non appliqué

Et ce n'est pas enterré dans l'API : la console l'affiche sous « À vérifier avant
d'arrêter un prix ». Vérifié après l'avoir vu, parce qu'un aveu que l'écran cache
ne vaut rien.

**Le document dit que la séparation des tâches n'a pas été tenue** —
`separation_respectee: False` — le même compte ayant chiffré et validé. Le produit
le déclare au lieu de faire semblant.

### Mon erreur, et ce qu'elle prouve

J'ai envoyé `MOINS_DE_50M` pour le chiffre d'affaires. Le produit a rendu 422 **en
nommant les valeurs admises** : `MOINS_10M`, `DE_10M_A_50M`, `DE_50M_A_250M`,
`PLUS_250M`. Il m'a corrigé en une seconde. C'est ce qu'on demande à un refus.

### Un cas de recette qui expirait à minuit

La suite a rendu trois échecs, dans **mes** cas de la veille. `JOUR =
"2026-09-29"`, écrit en dur : la route refuse un prix fixé dans le passé — « un
devis déjà émis changerait de prix » —, la fixation rendait 422, `FORMATION`
retrouvait son absence de prix ferme, et le chiffrage repartait sur la
qualification pour finir en **404**.

Ils ont donc passé le jour de leur écriture et sont tombés le lendemain. La date
se calcule désormais.

⚠️ **Et une seconde leçon du même incident.** Deux des trois cas appelaient l'aide
`_fixer` **sans regarder ce qu'elle rendait**. L'échec est ressorti trois pas plus
loin, sous la forme « aucun questionnaire pour FORMATION » — un message qui envoie
chercher exactement là où il n'y a rien. L'aide vérifie maintenant son propre
succès.

Cherché ailleurs : les deux autres dates écrites en dur dans les cas sont des
dates d'exercice, pas « aujourd'hui ». Elles ne sont pas fragiles.

### Une réserve sur le fond

L'intervalle vient du barème `2026.1`, dont les valeurs sont encore `A_VALIDER` :
personne au cabinet ne les a arrêtées. **La mécanique est juste, les montants sont
illustratifs.** Le barème reste à fixer.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 30 septembre 2026 — L'espace de l'adhérente, écran par écran

Cinq écrans, parcourus un à un sur la pile : mon entreprise, mes échéances, mes
documents, mes rappels, mon mois. Un défaut trouvé, et il est du genre que ce
chantier connaît bien.

### Le produit ne l'entendait pas

Le dossier de démonstration portait trois demandes de pièces ouvertes, et **les
trois avaient une réponse de l'adhérente** :

    DP-2026-002 · « Je n'ai pas ce document »
    DP-2026-009 · « Je n'ai pas ce document »
    DP-2026-010 · « Je l'aurai la semaine prochaine · annoncée pour le 28/09/2026 »

Le bandeau — **le premier texte qu'elle lit en ouvrant son espace** — annonçait :

    Il manque 3 justificatifs
    La date prévue est passée : envoyez-les dès que possible, le cabinet vous attend.

Elle avait parlé trois fois. Le modèle porte pourtant sa réponse, et son
commentaire dit l'intention : « sa dernière réponse, telle que le cabinet la
lit : **l'adhérent voit qu'elle est arrivée** ». La liste la montrait ; le bandeau
ne la regardait pas.

⚠️ Une demande répondue **reste ouverte** : le cabinet a toujours besoin de la
pièce. Mais elle n'attend plus un geste d'elle — elle attend une suite du cabinet,
qui doit insister, accepter un substitut, ou clore.

**Deux corrections, et aucune ne prétend que le cabinet a agi :**

- `{pieces}` ne compte plus que les demandes **sans réponse**. Le cas mixte, le
  plus fréquent, annonce donc « il manque 1 justificatif » là où il en annonçait
  deux ;
- la **date limite** se lit sur ce qu'elle doit encore envoyer. La lui rappeler
  sur une pièce qu'elle a dit ne pas avoir la mettait en faute pour rien ;
- quand tout a reçu une réponse, un texte nouveau au référentiel :

      Vous avez répondu à 3 demandes
      Le cabinet en prend connaissance et vous dira la suite. Rien à faire de
      votre côté pour l'instant.

Relu sur la pile après reconstruction : c'est bien ce qu'elle lit, et plus aucune
injonction à envoyer. Un cas vérifie d'ailleurs l'absence du mot « envoyez ».

### Deux fausses pistes, vérifiées et écartées

- **« Mon mois » montre août le 30 septembre.** Correct : l'en-tête du référentiel
  le dit, « le mois observé est le mois précédent — c'est sa déclaration que le
  cabinet prépare ».
- **`jours = 0` sur toutes les échéances.** Conforme : le champ porte les jours de
  retard ou les jours restants, et vaut zéro dans les autres états. Son propre
  commentaire le dit.

Les noter ici a un intérêt : ce sont deux choses que j'ai crues fausses avant de
lire. **Un doute vérifié coûte dix minutes ; un doute corrigé à tort coûte un
défaut.**

### Un cas de recette abîmait le jeu qu'il traversait

En parcourant les échéances, aucune carte « à venir » ni « en retard » : les
dix-huit étaient `PREUVE_ENVOYEE` ou `DEPOSEE`. C'est **mon** UC-69 qui avait fait
cela : il prenait `prouvables[0]`, la première de la réponse, et avait attaché des
quittances à des échéances de **novembre**, depuis septembre.

Le produit l'accepte — on peut payer d'avance —, mais le jeu de démonstration s'en
trouvait appauvri : plus une seule carte à montrer dans le cas principal de cet
écran. **Un cas de recette qui abîme le jeu qu'il traverse ne le dit à personne.**

Il choisit désormais la plus ancienne, ce qui place tout ce qui est échu avant
tout ce qui vient.

⚠️ **Et une leçon sur mon propre commentaire.** J'avais d'abord écrit un tri
comparant l'échéance à « aujourd'hui », en lisant `a_la_date` dans la réponse. Ce
champ **n'existe pas** : le tri se dégradait en un tri par date, qui donnait le bon
résultat pour une mauvaise raison, et le commentaire décrivait un code qui
n'existait pas. Réécrit pour dire ce que le code fait.

### Trois cent quatre-vingt-sept cas sautés, et la suite sortait à zéro

Découvert en relançant la suite après la correction : la base de test locale avait
disparu — **le répertoire de données lui-même**, pas seulement le serveur. Elle vit
dans un répertoire temporaire et « se jette », c'est écrit dans l'outil et c'est
voulu.

Ce qui ne l'est pas, c'est ce que la suite en dit :

    3542 passed, 387 skipped, 4 errors     → exit 0

Trois cent quatre-vingt-sept cas — tout ce qui touche à la persistance, au
cloisonnement et aux parcours de bout en bout — n'avaient **rien vérifié**. Lu
vite, « 3542 passed » ressemble à un succès. C'est arrivé **trois fois** dans la
journée, et j'ai relancé sans m'interroger les deux premières.

La chaîne d'intégration a un garde pour cela, et il est bien écrit : « une
variable mal nommée, un service PostgreSQL qui démarre trop tard […] dans les
trois cas la suite reste **verte** en n'ayant rien vérifié ». **En local, rien ne
prévenait.**

Le garde existe maintenant à sa place, dans `conftest.py` :

    ================= BASE ABSENTE : LA SUITE N'A PAS TOUT VÉRIFIÉ =================
      387 cas sautés faute de PostgreSQL sur postgresql+psycopg://…
      Motif : connection refused
      Démarrer l'instance : eval "$(outils/postgres-local.sh start)"

⚠️ **Il ne fait pas échouer la suite** : sauter est légitime quand on travaille
sans base, et transformer cela en erreur obligerait à monter une base pour
vérifier une fonction pure. Il rend l'omission impossible à ne pas voir, ce qui
est exactement ce qui manquait.

Éprouvé dans les deux sens : bruyant sans base, silencieux avec.

### Ce qui reste, et qui demande votre accord

Le jeu de démonstration ne porte plus d'échéance « à venir » ni « en retard ». Le
rétablir demande de **retirer des preuves de paiement** en base : c'est une
suppression de données, et je ne la fais pas sans votre accord. `recaler_la_
demonstration` n'y suffit pas — il ajoute des accusés, il n'en retire aucun.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 (suite 5) — Les gabarits, relus un par un

Demande du cabinet : vérifier le **format des gabarits, pas à pas**. Vingt-quatre
au total — sept modèles WhatsApp, dix-sept gabarits de courriel — plus le
document de proforma. Rendus et relus un par un.

### Les sept modèles WhatsApp

Un défaut de forme, qui aurait coûté un cycle de soumission :

    cga_relance_proforma · le corps SE TERMINE par un emplacement

Il finissait sur « {{4}} » seul. La plateforme refuse ces modèles. Le refus
serait arrivé **des semaines après l'écriture**, dans son vocabulaire à elle, à
quelqu'un qui n'avait pas écrit le texte — c'est précisément ce que le README du
dossier redoute pour l'approbation, et que personne n'avait transposé à la forme.

Corrigé, et le lien introduit par une phrase, comme `cga_envoi_proforma` le fait
déjà : une adresse jetée sur une ligne nue ne dit pas au client ce qu'elle ouvre.

**Trois règles de forme entrent au domaine** — ne pas commencer par un
emplacement, ne pas finir par un, ne pas en coller deux — avec leurs cas, et une
contre-épreuve qui vérifie que les sept modèles réels passent encore. ⚠️ **Seules
les règles dont on est sûr sont vérifiées** : deviner celles de catégorie, de
longueur ou de bouton ferait refuser des modèles valides, ce qui coûte plus cher
que de les laisser passer.

### Les dix-sept gabarits de courriel

Rendus avec le contexte de leur appelant, puis relus : **aucun emplacement non
rempli, aucune double espace, aucun objet vide**. Les montants emploient déjà
l'espace fine insécable, la même que la vitrine — `75 000 FCFA` se lit pareil des
deux côtés.

⚠️ **Mon propre contrôle était fautif**, et il a fallu le voir : il signalait
vingt-sept « espaces avant une ponctuation ». En français, `:` et `;` **prennent**
une espace avant. Les gabarits étaient corrects ; c'est la sonde qui accusait.

### Le gabarit qui n'existe pas

**Il n'y a pas de document de proforma.** Le code le dit lui-même :

    # Le contenu du document PDF n'est pas encore produit : son empreinte porte
    # donc ce que le système sait de figé.

La cliente lit une page et clique. Elle ne reçoit aucun document à garder, et la
page ne porte pas de feuille d'impression. À instruire avec le cabinet.

### Ce que la relecture a fait trouver, et qui est plus grave

En vérifiant ce que la cliente reçoit **après** avoir cliqué, sur la pile :

    avant  : ['Nous avons bien reçu votre demande — dos-…',
              'Votre proposition PRO-2026-0039 : 75 000 FCFA']
    après  : les deux mêmes

**Elle engage son entreprise et ne reçoit rien.** La page le dit en toutes
lettres — « mon accord engage l'entreprise que je représente » — et le domaine le
confirme : une proforma acceptée **vaut contrat**. Ni le montant accepté, ni la
date, ni le nom déclaré. Le cabinet, lui, avait tout.

C'est le même défaut que l'accusé de dépôt corrigé la veille, un cran plus loin
dans le parcours — et un cran plus grave, puisqu'il s'agit d'un engagement.

Un gabarit `proforma.acceptation` part désormais. Relu dans la boîte, sur la
pile :

    C'est noté, Sylvie NGONO
    Vous avez accepté la proposition PRO-2026-0040, d'un montant de
    75 000 FCFA, le 29/09/2026 à 16h08.
    Cet accord a été donné au nom de Sylvie NGONO, gérante. Conservez ce
    message : il est la trace de ce que vous avez accepté, et de la date.

⚠️ **IL NE LÈVE JAMAIS.** L'accord EST enregistré et le dossier a suivi : rendre
une erreur parce qu'un serveur de messagerie n'a pas répondu ferait **perdre une
signature contractuelle**, pour un accusé. Un cas force la panne du relais et
vérifie que l'acceptation passe quand même.

⚠️ **Et un piège évité de justesse.** Le premier cas écrit passait au vert en ne
vérifiant rien : le dossier d'essai partagé ne porte **pas** d'adresse — elle est
facultative au formulaire public. Il a fallu une cliente joignable pour que le
cas mesure quelque chose, et le cas « sans adresse » garde désormais l'autre
bord.

### Ce que cette passe apprend

Un gabarit ne se relit jamais tout seul. Celui qui manquait — l'accusé
d'acceptation — ne pouvait pas être trouvé en relisant les gabarits **existants** :
il a fallu suivre la cliente jusqu'à sa boîte, après le geste. **Ce qu'on vérifie,
ce n'est pas ce que le produit envoie, c'est ce qu'elle reçoit.**

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 (suite 4) — Les deux parcours qu'on ne jouait plus

Le cahier compte quatre flux de bout en bout. Deux sont joués à chaque passe — le
parcours M→I et le cahier des cas. Les deux autres, la **saisie comptable** et la
**paie**, ne l'avaient pas été de la session. Joués : trois défauts, aucun dans le
produit, tous dans la chaîne qui le vérifie.

### 1. Deux flux sur quatre ne pouvaient pas être pointés sur une pile

`flux_saisie.py` et `flux_social.py` portaient leurs adresses **écrites en dur**
(`:8010`, `:3011`), quand les deux autres les lisent de l'environnement. Joués sur
la pile de démonstration, ils rendaient sept étapes rouges d'affilée, toutes sur
« Connection refused ».

**Un faux rouge ne dit rien du produit et fait douter du cahier.** C'est la même
faute que le cas UC-69 qui mangeait son terrain, à un autre endroit. Les quatre
flux lisent désormais les mêmes variables, avec les mêmes valeurs par défaut :
deux conventions pour une question finissent toujours par diverger.

### 2. Un chemin de brouillon resté dans le dépôt

`flux_social.py` ouvrait ses imports sur `/tmp/cga-pg`, resté d'une mise au point.
Sur une machine qui n'a pas ce dossier, le flux **ne démarre pas du tout**, et
rien dans le message ne dit que la cause est une ligne du dépôt. Remplacé par le
dossier du fichier lui-même.

### 3. Un cas de recette accusait le produit d'un défaut qu'il n'a pas

Étape 6 de la paie : « Valeurs non validées signalées », rouge à 2 lignes sur 9.
Le cas exigeait que **toutes** les lignes du bulletin soient marquées `A_VALIDER`.

C'était juste quand le référentiel entier l'était. Vérifié ligne à ligne sur la
pile, puis au référentiel :

    CNPS_PVID_S · CFC_S · CNPS_PVID_P · CNPS_PF · CNPS_AT · CFC_P · FNE  → VALIDE
    IRPP · TDL (barèmes progressifs)                                     → non validés

**Le produit marque exactement les deux bonnes lignes.** C'est le cas qui avait
vieilli.

⚠️ **Un drapeau uniforme ne vaut rien.** S'il est vrai partout, il ne dit plus
lequel des chiffres repose sur une valeur que personne n'a validée, et le
comptable cesse de le lire. Le cas vérifie donc qu'il **discrimine**, et sur quoi.

⚠️ **L'attente est fermée**, et non « au moins celles-là » : le jour où le cabinet
validera le barème de l'IRPP, ce cas tombera. C'est voulu — quelqu'un reviendra y
constater que le produit a cessé d'alerter, au lieu de le découvrir sur une fiche
de paie. C'est la convention déjà tenue pour la liste des services sans sonde.

Les deux flux passent désormais en entier : **8/8** pour la saisie comptable,
**15/15** pour la paie.

### Ce que cette passe apprend

Les trois défauts sont dans la chaîne de vérification, pas dans le produit. Un
outil de contrôle vieillit comme le reste, et il vieillit plus discrètement :
personne ne relit un cas vert, et un cas rouge qu'on a pris l'habitude de voir
rouge ne se distingue plus d'une panne réelle.

**Un flux qu'on ne joue pas ne protège rien.** Les deux qui ont dérivé sont
exactement ceux qui ne tournaient plus.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 (suite 3) — Le site vendait ce que le cabinet ne pouvait pas facturer

Reprise du point laissé ouvert : `FORMATION`, `DOMICILIATION` et `PONCTUEL`,
« invendables par le tunnel ». Confronté au réel plutôt que cru sur parole, le
défaut s'est révélé plus profond que sa description.

### Ce que la pile a montré, pas à pas

    1. une visiteuse demande une FORMATION depuis le site   → 201
    2. le dossier entre dans la file du cabinet             → DEPOSEE
    3. un responsable est désigné                            → AFFECTEE
    4. le gérant arrête le prix à 75 000 F, motif à l'appui  → 201
    5. le chargé de clientèle émet la proforma               → 404

        « aucun questionnaire pour le service FORMATION »

**Le cabinet pouvait décider un prix et ne pas pouvoir le facturer.** Le site
public proposait ces services, une cliente demandait, un responsable était
mobilisé — et le dossier mourait là, sans que rien ne le signale.

### Trois maillons manquants, et non un

En remontant la chaîne, ce n'était pas « il manque un questionnaire » :

1. **Le chiffrage exigeait une qualification de tous les services.** La
   qualification existe pour **calculer** un prix que personne ne connaît
   d'avance ; l'exiger d'un prix déjà arrêté était une règle du sur-étude
   appliquée à tout.
2. **`QUALIFIÉE` ne s'atteint que par la qualification**, et le graphe des états
   n'offrait aucune autre route vers `CHIFFRÉE`. Les faire passer par `QUALIFIÉE`
   aurait été un mensonge : rien n'a été qualifié.
3. **`premier_contact` n'avait aucune route.** Le domaine le portait,
   `enregistrer_un_appel` aussi, et **rien ne les appelait depuis l'extérieur** :
   le seul chemin vers `EN_CONVERSATION` passait par l'enregistrement d'une
   qualification.

⚠️ **Le troisième point dépasse largement ces trois services.**
`premier_echange_le` mesure « la réactivité du cabinet ». Un responsable qui
appelait son client sans pouvoir le qualifier — parce que le client n'était pas
prêt, parce qu'il fallait un devis d'abord — laissait le dossier `AFFECTÉE`, et
**la veille des vingt-quatre heures le réaffectait à un collègue qui rappelait le
même client**. Le carnet des rappels ne rattrapait rien : les rappels ne naissent
qu'à la relance, jamais à l'affectation.

### Ce qui a été livré

- **Une route pour le geste qui manquait** : « j'ai joint le client ». Rejouable,
  elle ne réécrit pas la date du premier échange et refuse un dossier que
  personne ne tient. Le panneau est à l'écran de la fiche, avec son champ « ce
  qui a été dit ».
- **Un prix arrêté par le gérant se chiffre sans qualification.** L'intervalle
  est réduit à un point : plancher = référence = plafond. Le responsable garde le
  droit de s'en écarter, et le motif reste exigé comme ailleurs.
- **Une arête de plus au graphe** : `EN_CONVERSATION → CHIFFRÉE`. Le tableau des
  transitions pose lui-même la condition — « chaque arête suppose quelque chose
  qui l'emprunte » —, et c'est le prix ferme qui l'emprunte.
- **Un rappel clos fait avancer son dossier**, ce qu'il ne faisait pas. Sans
  lever : le rappel EST clos, et refuser la requête ferait rappeler le client une
  seconde fois.

⚠️ **LA GARDE QUI COMPTE, ET QUI EST TESTÉE EN PREMIER.** Un tarif `A_VALIDER` —
ceux de la maquette de la vitrine, que personne au cabinet n'a fixés — ne passe
**pas** par ce chemin. Sans cette garde, on aurait encaissé un prix que nul
n'avait décidé, ce que le catalogue s'interdit explicitement depuis qu'il porte
`StatutTarif`. Le premier cas de la classe vérifie le refus **avant** que le
second ne vérifie la vente.

### Relu sur la pile, de bout en bout

    ✓ 1. Une visiteuse demande une formation            HTTP 201
    ✓ 2. Le dossier entre dans la file                  dos-… · DEPOSEE
    ✓ 3. Un responsable est désigné                     HTTP 200
    ✓ 4. Le responsable déclare avoir joint la cliente  état EN_CONVERSATION
    ✓ 5. Le gérant arrête le prix                       HTTP 201
    ✓ 6. Le chiffrage constate le prix arrêté           75000 · 75000 · 75000
    ✓ 7. La proforma est émise                          PRO-2026-0037 · 75000 FCFA
    ✓ 8. Elle est transmise à la cliente                état TRANSMISE

`DOMICILIATION` passe de même, à 160 000 F.

### Deux gardes vérifiées en direct, parce qu'elles protègent la création

Ce correctif ouvre un chemin ; il fallait s'assurer qu'il n'en ouvrait pas
d'autres. Le gérant peut-il fixer un prix sur un service **sur étude** et
court-circuiter ainsi la qualification d'une création ?

    fixer un prix sur CREATION   → HTTP 422
    fixer un prix sur PONCTUEL   → HTTP 422
    « se chiffre sur étude, dossier par dossier : un prix unique n'y a pas de sens »

Non. Le domaine le refuse, et la porte est close des deux côtés : sans prix
ferme, `_prix_ferme_du_service` rend `None` et l'on retombe sur la qualification.

### Une garantie du domaine a changé d'étage, et le cas le dit

`test_on_ne_chiffre_pas_avant_d_avoir_qualifie` est tombé, et il avait raison
jusqu'ici. L'invariant « on ne chiffre pas avant d'avoir qualifié » était vrai
tant que **tout** prix se calculait.

⚠️ **La garde n'a pas disparu, elle a changé d'étage.** Le dossier ne connaît pas
le catalogue, et il n'a pas à le connaître : savoir si un prix a une base est la
question de celui qui tient les tarifs. Le cas a été réécrit pour dire ce qui est
désormais garanti, et **où vit l'autre garde**. Une borne subsiste au domaine, et
c'est la vraie : on ne chiffre pas un dossier `DÉPOSÉE` ou `AFFECTÉE` — émettre un
prix sur un dossier que personne n'a ouvert, c'est envoyer une facture à
quelqu'un qui a posé une question.

### Une note de ma liste était fausse

J'avais inscrit « une pièce du mobile arrive en `INDETERMINE` » parmi les
frictions à corriger. Vérifié : le mobile envoie bien `canal: MOBILE`, et
`INDETERMINE` est le **type** de pièce, dont le défaut est délibéré et
documenté : « avant lecture, on ne sait pas ce qu'on a reçu, et exiger le montant
d'une facture pour l'accepter ferait renoncer la moitié des adhérents ». Ce
n'était pas un défaut. La note est retirée.

### Ce qui reste invendable, et pourquoi c'est juste

`PONCTUEL` demeure refusé. Son catalogue le dit : « une mission délimitée,
chiffrée après examen ». Un prix unique au catalogue n'aurait aucun sens pour une
mission qui varie à chaque dossier. Il lui faut **soit** un questionnaire au
référentiel, **soit** un prix fixé dossier par dossier, qui n'existe pas encore.
**C'est une décision du cabinet, pas la mienne.**

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 (suite 2) — Le volet WhatsApp, tel qu'il est vraiment

Demande du cabinet : lancer la pile en direct pour validation, et dire si le
volet WhatsApp est complet. La pile est ouverte sur quatre onglets. Pour la
seconde question, la réponse honnête est **non**, et j'ai trouvé pourquoi.

### Ce qui marchait, et ce qui ne marchait plus après un rechargement

Le bouton « Envoyer sur WhatsApp » de la proforma existait, avec sa garde de
consentement et un message repris mot pour mot du modèle soumis à la
plateforme. Mais le lien d'acceptation n'était rendu **qu'à l'émission**, et
`EmissionProforma` le gardait dans l'état de son composant.

Vérifié sur la pile, sur les **sept dossiers réels en `PROFORMA_EMISE`** :
aucun n'affichait le bouton. L'écran disait même la chose en toutes lettres :

    Le lien d'acceptation a été remis à l'émission et ne se réaffiche pas.

Conséquence : le responsable qui rechargeait la page, fermait l'onglet ou
revenait le lendemain n'avait plus d'autre voie que le courriel — y compris pour
une cliente qui avait expressément autorisé la messagerie et n'avait donné que
son numéro.

⚠️ **Le serveur savait pourtant recomposer ce lien.** Il le faisait déjà pour le
courriel, et `POST /transmission` le rendait depuis le 28 septembre. La console
**jetait la réponse** : `await appeler(...)` sans rien en lire.

### La correction, et pourquoi pas la plus courte

Une route de lecture, `GET /acquisition/proformas/{numero}/lien`, sans aucun
effet de bord.

**Ce qui a été écarté, et pourquoi.**

- *Mettre le lien sur la fiche du dossier.* Elle n'exige que `LIRE_PROSPECT`, et
  son en-tête dit depuis le pas 78 : « jamais le lien d'acceptation ». Ce lien
  est un **porteur** : qui l'a, peut accepter à la place du client. L'élargir à
  tous les lecteurs de prospects aurait été une extension silencieuse de ce que
  le sceau protège.
- *Se servir de `POST /transmission`, qui rend déjà le lien.* Elle **date
  l'envoi**, et c'est cette date qui arme la relance : la rappeler pour relire un
  lien remettrait le compteur à zéro à chaque consultation, et le client ne
  serait jamais relancé. Elle obligerait de plus à déclarer « j'ai envoyé le
  lien » **avant** de l'avoir.

Une lecture est une lecture. Elle ne note rien, et un cas le vérifie en la
rappelant trois fois de suite.

Relu à l'écran après reconstruction, sur les mêmes sept dossiers : quatre
affichent « le client ne l'a pas autorisé à sa demande », un affiche le bouton.
Son lien ouvre la vraie page : « Proposition PRO-2026-0027 · Création
d'entreprise · 250 000 FCFA · Lien valable jusqu'au 13 octobre 2026 ».

### Deux fonctions exportées et jamais éprouvées

`messageWhatsapp` et `numeroWhatsapp` n'avaient aucun cas. Or `numeroWhatsapp`
est exactement ce qui casse en silence : `wa.me` refuse le `+`, les espaces et le
zéro initial, et un numéro mal formé **n'échoue pas** — il ouvre une conversation
avec le mauvais correspondant, ou avec personne. Le responsable croit avoir
envoyé, le client ne reçoit rien. Sept cas, dont le numéro étranger qu'on ne doit
pas préfixer de 237.

### L'état du volet WhatsApp, sans fard

**Ce qui marche aujourd'hui, sans aucun compte à ouvrir** — tout passe par
`wa.me`, c'est-à-dire par l'application du correspondant :

- le visiteur écrit au cabinet depuis le pied de page, le bandeau d'appel, la
  page de contact et sa proposition ;
- les deux formulaires publics composent un message **et** déposent la demande en
  base au même clic ;
- l'estimateur envoie son devis ;
- le cabinet renvoie une proforma, message identique au modèle, garde de
  consentement, et désormais **après un rechargement** ;
- une pièce reçue par WhatsApp s'enregistre au dossier, canal compris ;
- le domaine tient le consentement, sa révocation, le repli de canal et
  `joignable_sur_whatsapp`.

**Ce qui ne marche pas, et ne peut pas venir de moi :**

- **aucun envoi automatique.** `canaux.yaml` porte `WHATSAPP: actif: false`, avec
  son motif écrit : « compte de la plateforme d'envoi non ouvert, aucun modèle
  approuvé ». Il n'existe aucun adaptateur d'envoi, et c'est cohérent ;
- les **sept modèles sont rédigés** et portent `statut: EN_ATTENTE` : ils
  attendent leur soumission à Meta ;
- `whatsapp_disponible` est **écrit en dur à faux** dans les réglages de rappel
  de l'adhérent, avec le commentaire qui dit que c'est une donnée et non un
  oubli ;
- donc : aucune relance, aucune proforma, aucun rappel d'échéance **automatique**
  par WhatsApp. Tout geste WhatsApp part d'un humain.

Vérifié en direct, deux invariants qui tiennent :

    demande avec consentement, canal préféré WHATSAPP → canal de rappel : APPEL
    demande SANS consentement, canal préféré WHATSAPP → 422

Le premier est le plus important : le produit **ne promet pas un canal qu'il ne
peut pas tenir**. Le référentiel dit le canal inactif, le repli s'applique, et le
visiteur lit ce qui se passera réellement.

**Ce qui débloque le reste** : ouvrir le compte WhatsApp Business de la
plateforme et faire approuver les sept modèles. Le jour où c'est fait, `actif:
true` au référentiel — « et rien d'autre ne bouge dans le système », dit le
fichier. Il reste à écrire l'adaptateur d'envoi, qui n'a pas de sens avant.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 (suite) — Vérification de fond en comble

Demande du cabinet : « est-ce que tu peux déjà checker le système de fond en
fond, c'est bon déjà ? ». Passe complète sur les cinq dépôts, la pile allumée et
la chaîne d'intégration. Trois défauts trouvés, deux corrigés, un à décider.

### 1. Le formulaire public disait « demarches.CREATION » au cabinet

Trouvé par le parcours navigateur de la vitrine, qui refuse toute erreur de
console sur une page publique :

    MISSING_MESSAGE: vitrine.formulaire.demarches.CREATION (fr)

**Défaut de mon unification du vocabulaire du 27 septembre.** Les codes du
catalogue sont en majuscules, les clés de traduction en minuscules. Quatre
endroits composaient la clé à la main ; trois minusculaient, **un l'avait
oublié** — et les deux se trouvaient dans le même fichier, à quarante lignes
d'écart.

Ce que le visiteur en voyait : le message WhatsApp préparé pour le cabinet
portait « Démarche : demarches.CREATION » au lieu du libellé. Un message que la
cliente envoie, et que le cabinet reçoit.

Corrigé là où on ne peut pas l'oublier : `cleDeLaDemarche(code)` dans la
bibliothèque partagée, et les quatre appels y passent. Relu dans le navigateur
après reconstruction :

    Votre démarche : Création d'entreprise

### 2. Ce qui a laissé passer ce défaut compte autant que le défaut

Le parcours navigateur l'a trouvé en une seconde. **Mais les parcours navigateur
ne tournent pas en intégration continue** : ils demandent une pile allumée, et la
chaîne n'en monte pas. Elle vérifie les types, le lint, les tests unitaires et la
construction, et elle était verte pendant les deux jours où la vitrine criait
dans la console de chaque visiteur.

⚠️ **Une chaîne verte ne prouve que ce qu'elle exécute.** C'est la même leçon que
la veille sur la salutation vide, à un étage au-dessus : là c'était la suite qui
ne mesurait pas ; ici c'est la chaîne qui ne lance pas la mesure.

Fermé pour cette classe de défaut par un cas qui tourne, lui, à chaque
intégration : il parcourt le catalogue des démarches et exige un libellé dans les
deux langues, plus une contre-épreuve sur les libellés orphelins. Aucune pile
nécessaire, seulement les fichiers de traduction. Éprouvé en retirant une clé :
il tombe et nomme la démarche.

**Il ne remplace pas le parcours navigateur.** Brancher les parcours réels sur la
chaîne demande d'y monter la pile, ce qui engage des minutes d'intégration et un
couplage entre dépôts. **C'est une décision du cabinet, pas la mienne** ; je la
pose telle quelle.

### 3. La chaîne mobile serait tombée sur le formateur

`dart format --set-exit-if-changed` rendait **1** sur huit fichiers, dont quatre
que j'avais touchés cette semaine. La chaîne mobile aurait refusé la livraison
sans que rien d'autre ne le signale — `flutter analyze` et les 265 cas passaient.
Formaté ; l'analyse et les tests repassent.

### Ce qui a été éprouvé, et ce que ça donne

| Couche | Contrôle | Résultat |
|---|---|---|
| Serveur | 3 912 cas, ruff, `alembic check` | vert, aucune dérive modèle/migrations |
| Serveur | avancement, couverture et contrat des écrans | 100 %, 232/236 routes, 303/304 appels |
| Console | tsc, lint, 398 cas, construction | vert |
| Console | 14 parcours navigateur sur la pile | 14/14 |
| Vitrine | tsc, lint, 90 cas, construction | vert |
| Vitrine | 10 parcours navigateur sur la pile | 10/10 après correction |
| Mobile | format, analyse, 265 cas | vert après correction |
| Bout en bout | flux M→I, 35 étapes | complet |
| Bout en bout | cahier de recette | 98/98 |

**Le cloisonnement, éprouvé et non supposé.** Avec une session valide du cabinet
et un en-tête `Host` pointant sur un locataire réel du répertoire, l'API rend
**401** : la session ne franchit pas la frontière. Un sous-domaine inexistant rend
**404**, le même code qu'un locataire suspendu, pour qu'énumérer les sous-domaines
n'apprenne rien.

### Ce qui reste, et que je ne décide pas

- **Les parcours navigateur hors de la chaîne** (ci-dessus). Le plus important.
- **Trois services du catalogue restent invendables par le tunnel** : `FORMATION`,
  `DOMICILIATION`, `PONCTUEL` n'ont pas de questionnaire au référentiel. Le
  formulaire les propose, et une demande ainsi déposée ne peut pas être chiffrée.
- **La patente à J+1** : une société créée aujourd'hui sera en retard d'un jour
  demain. Exact au sens du texte ; le cabinet voudra peut-être un délai
  d'installation, qui se lira au référentiel le jour où il y sera écrit.
- **`tenue-comptable → ADHESION`** reste mon interprétation, signalée au README du
  référentiel pour relecture du cabinet.
- **Le jeu de démonstration s'est chargé** : 17 locataires, 43 entreprises, 55
  dossiers, accumulés par les rejeux. Le nettoyer demande votre accord.
- **Quatre routes ne sont appelées par aucun écran**, dont deux légitimement : le
  rappel du prestataire de paiement et la simulation de règlement. Les deux autres
  sont `GET /collecte/pieces/{identifiant}` et `GET /comptabilite/plan-comptable`.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 29 septembre 2026 — Le monitoring mentait dans les deux sens

Deux corrections sur l'écran d'exploitation, qui se répondent : il déclarait sains
trois services qu'il n'interrogeait pas, et il déclarait en difficulté une
plateforme qui n'avait pas failli une seule fois.

### 1. Trois services sur quatorze n'étaient pas sondés

La Clôture, la Création d'entreprise et le Social se disaient `SANS_SONDE`. Le
registre était honnête — il disait qu'il ne savait pas —, mais personne ne savait
non plus.

La décision de ne pas leur en donner était écrite, et son motif était bon :

> « Leur inventer une sonde qui relit la ressource d'un autre créerait deux
> vérités sur une même question. »

**Elle est révisée, pour une raison précise : ces sondes ne posent pas la question
du Référentiel.** La sienne demande « le fichier se charge-t-il, et porte-t-il
quelque chose ». Les leurs demandent « porte-t-il les **valeurs nommées** sans
lesquelles je ne produis plus rien ». Un référentiel de soixante paramètres auquel
manque `CNPS_PLAFOND_MENSUEL` répond oui à la première et non à la seconde. Ce
n'est pas deux vérités sur une question, c'est une vérité sur une question que
personne ne posait.

**Et c'est là que ça compte : les trois contextes se rabattent en silence.**

- `_constater_le_capital` rend un constat **non bloquant** quand le capital
  minimum manque au référentiel. Bon choix au guichet — une ligne absente d'un
  YAML ne doit pas empêcher d'instruire tous les dossiers de SARL. Revers : le
  capital n'est plus comparé au minimum légal, et le dossier part au greffe.
- `_abattement_cga` rend `None` et une phrase jointe au dossier. L'explication vit
  donc **dans le dossier**, lue une fois par la personne qui traite celui-là. Si le
  taux manque, chaque adhérent paie l'impôt plein, chacun avec sa petite phrase.
  **L'abattement est la seule chose que l'adhésion achète.**
- Et un piège dans l'autre sens : un plafond d'abattement absent vaut `0`, et le
  code ne plafonne que si le plafond est positif. Un plafond absent **supprime
  donc le plafonnement**. Le référentiel ne distingue pas « la loi ne plafonne
  pas » de « personne n'a écrit la ligne » ; la sonde le dit, en `SUSPECT`, parce
  que l'explication innocente existe.

⚠️ **Une sonde qui se tait toujours est verte sur une installation cassée.** Les
trois sont donc éprouvées **deux fois** : sur le référentiel réel, où elles
doivent se taire, et sur un référentiel amputé de la seule valeur qui les
concerne, où elles doivent parler **et nommer ce qui manque**. Seize cas.

Une contre-épreuve accompagne la Clôture : `SEUIL_SYSTEME_NORMAL` absent ne doit
**pas** alarmer. Son absence rend le Système Normal, qui est le régime de droit
commun ; alarmer pour un manque sans conséquence est le plus sûr moyen
d'apprendre aux exploitants à ne plus lire ces alertes.

Sur la pile, les quatorze répondent, et le registre coûte **5 ms**.

### 2. Un panneau rouge en permanence, pour zéro panne

Mesuré sur la pile de démonstration après une recette complète :

    requêtes 454 · 2xx 322 · 4xx 132 · 5xx 0
    taux d'erreur affiché : 29,1 %   (seuil d'alerte de la console : 2 %)

**Zéro panne, et un panneau rouge.** Or ce produit refuse par métier : 403 pour un
comptable écarté de l'acquisition, 409 pour un dépôt aux pièces incomplètes, 422
pour un prix hors intervalle sans motif. Ce sont des succès du produit, comptés
comme ses échecs — et nos propres cas de recette les exigent.

Là encore une décision écrite : « un 404 isolé est normal, un pic de 404 est un
symptôme ; les séparer perdrait le second pour épargner le premier ».

⚠️ **Elle était optimiste sur un point : un taux global ne détecte pas un PIC, il
détecte un NIVEAU.** Fusionner les deux ne donnait donc pas le signal qu'on croyait
acheter ; cela rendait seulement le seuil inutilisable.

Deux taux désormais, et `par_statut` reste à côté :

- **erreurs (5xx)** — ce que la plateforme a raté. Seuil d'alerte à 2 %, qui veut
  enfin dire quelque chose.
- **refus (4xx)** — ce qu'elle a refusé, **sans ton d'alerte et délibérément** : il
  n'existe pas de taux de refus « normal », il dépend entièrement de ce que les
  appelants demandent. Lui donner un seuil reviendrait à réinventer le panneau
  rouge permanent qu'on vient de retirer.

Relu à l'écran, après cinq refus délibérés :

    0.0 % erreurs (5xx)   ·   83.3 % refus (4xx)   ·   panneau au vert

### 3. Un cas de recette qui mangeait son propre terrain

Trouvé en régénérant le cahier : 97/98, alors que le registre venait de rendre
98/98 une minute plus tôt. UC-69, « envoyer la preuve qu'il a déjà payé », rendait
« aucune échéance à régler ».

Ce n'était pas le produit. Le cas n'acceptait que les échéances `EN_RETARD` ou
`A_VENIR`, et il en **règle une à chaque exécution**. Au bout de quatorze passages
sur la même pile, il ne restait plus rien : 14 cartes en `PREUVE_ENVOYEE`, 4 en
`DEPOSEE`, et un cas rouge pour un produit qui n'avait rien fait de mal.

⚠️ **Le filtre était aussi plus étroit que le produit.** Vérifié sur la pile avant
de toucher au cas : une quittance **neuve** sur une échéance déjà prouvée rend
**201**. C'est juste — l'adhérente qui a envoyé la mauvaise quittance doit pouvoir
envoyer la bonne. Le 409 documenté porte sur **la même pièce** rejouée, pas sur
l'échéance.

Le cas écarte désormais `DEPOSEE`, et rien d'autre ; il préfère une échéance non
réglée quand il en reste une, et son constat dit lequel des deux scénarios il a
joué. Trois exécutions d'affilée, trois fois vert.

**Un cas de recette qui consomme un stock fini est un faux négatif à retardement**,
et il se déclenche le jour où l'on a le plus besoin de croire le cahier.

### Ce que cette passe apprend

Deux décisions anciennes ont été révisées, et aucune n'était sotte : l'une évitait
une duplication, l'autre voulait garder un signal. Toutes deux avaient été prises
avant que le produit n'ait quatorze contextes et ne refuse par métier un appel sur
trois. **Une décision juste se démode ; ce qui la rend fausse, c'est le temps, pas
la bêtise de qui l'a prise.** Les deux motifs d'origine sont recopiés dans le code
à côté de leur révision, pour que le prochain qui passe sache ce qui a changé.

**Livré :** trois sondes, seize cas qui les éprouvent par amputation, deux taux
distincts, console à jour, un cas de recette qui ne s'épuise plus, 98/98 au
cahier, 3 912 cas au vert.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 28 septembre 2026 (suite 4) — Trois messages faux, et la suite qui les laissait passer

Passe de corrections demandée en bloc, après la recette du parcours de création.
Trois défauts, tous **visibles par la cliente**, tous invisibles à une suite de
3 882 cas restée verte.

### 1. La patente réclamée à une société qui n'existait pas

Le dernier écran de la recette, le sien, affichait :

    Contribution des patentes — En retard de 212 jours

Sa société avait été immatriculée le jour même. L'échéance d'une obligation
annuelle civile se calculait sur la seule année de fin de période : la patente
se règle fin février, donc fin février, quelle que soit la date de naissance de
l'entreprise.

**Ce produit s'interdit de tranquilliser à tort. Alarmer à tort est la même
faute retournée** — et celle-ci accueille la cliente à sa première connexion, le
seul moment où elle décide si cet espace lui dit vrai.

**Ce qui a été écarté :** fabriquer un délai. Le référentiel ne dit pas combien
de temps une société créée en cours d'année a pour s'acquitter de sa patente, et
écrire « deux mois » ou « trente jours » serait ranger une règle fiscale dans du
code, sans texte derrière.

**Ce qui a été retenu :** une échéance ne précède jamais le début de la période
qu'elle couvre. Elle est ramenée au premier jour où l'obligation peut exister.
Elle est **due**, elle n'est pas **en retard**. Une société installée depuis 2020
garde sa date statutaire au 28 février, au jour près — un cas le vérifie.

Relu sur la pile de démonstration, sur le dossier réel :

    "echeance": "2026-09-28", "en_retard": false, "jours_restants": 0

**Reste à instruire :** à J+1, elle sera en retard d'un jour. C'est exact au
sens du texte — la patente est un droit d'exercer, payé d'avance — mais le
cabinet voudra peut-être un délai d'installation. Il se lira au référentiel le
jour où il y sera écrit, pas avant.

### 2. L'accusé de dépôt, qui n'existait pas

Compté depuis la boîte de la cliente, le parcours entier lui envoyait **deux**
messages : sa proposition commerciale, puis son accès. Le premier arrive après
l'échange avec l'expert, des jours après son dépôt.

Entre les deux, rien. Elle quittait la page sur « un responsable vous
recontacte » et n'avait plus aucune trace de son geste : ni référence, ni
confirmation, rien à relire. C'est le silence le plus long du parcours, et celui
où elle doute le plus — au point de redéposer, ce que l'anti-doublon rattrape, ou
de renoncer, ce que rien ne rattrape.

Un second abonné se branche donc sur `DemandeDéposée`, à côté de l'affectation.
Les deux ne se commandent pas : **l'accusé ne nomme personne**, précisément pour
partir même quand l'annuaire n'a trouvé aucun responsable. C'est la veille qui
remonte l'absence, pas le silence fait à la cliente.

Il est idempotent — `accuse_de_depot_le` le porte — et il **ne lève pas** : une
demande sans adresse n'est pas une panne, c'est une cliente qu'on rappellera, ce
qu'elle a demandé.

**Le piège, et il est gros.** Il y a un objet `Consentement` sur la demande, il
porte `vaut_maintenant`, et le brancher ici ferait sérieux. Ce serait faux : ce
consentement est celui de **WhatsApp** — champ `consentement_whatsapp`, version
`consentement-whatsapp-v1` — et il est décoché par défaut. S'y adosser aurait
privé d'accusé la grande majorité des clientes, celles qui ont pourtant écrit
leur adresse dans le formulaire. Ce qui autorise ce message, c'est qu'elle a
donné cette adresse, à l'instant, dans ce formulaire-là. Un cas le dit, et dit
pourquoi.

**Aucun délai n'est annoncé.** Le référentiel porte les délais de veille — ce
qu'on se donne avant de s'alarmer — et non un engagement pris au client. Écrire
« sous 24 heures » aurait fabriqué une promesse que personne n'a signée, et la
première demande déposée un vendredi soir l'aurait démentie.

Relu dans la boîte, sur la pile :

    Objet : Nous avons bien reçu votre demande — dos-c793bff8c8fc4db1
    Bonjour Sylvie NGONO
    Votre demande concernant Création d'entreprise nous est bien parvenue.

Huit tours de relais plus tard : toujours un seul message.

### 3. « Bonjour  », suivi d'une demande d'argent

C'est en relisant cette boîte qu'un autre message s'est montré — un rappel
d'échéance réel, parti vers une adhérente :

    Bonjour

    Votre échéance Patente est à régler avant le 28/09/2026.

Rien après « Bonjour », et une espace en trop.

**C'est une conséquence de ma propre correction de la veille.** `Compte.prenom` a
été relâché à `""` pour laisser entrer une fondatrice dont le formulaire public ne
porte qu'un champ de nom. La correction était juste. J'avais même écrit, dans le
modèle : « ce qui AFFICHE ce champ doit donc composer proprement ». Je ne l'avais
appliqué qu'aux deux messages écrits le même jour. **Douze autres** composaient
leur salutation sur `compte.prenom` brut.

**La suite est restée verte tout du long.** Elle ne mesurait pas la salutation.

Corrigé là où on ne peut pas l'oublier : `Compte.appellation` — « ce qu'on écrit
après Bonjour, jamais vide » — et les douze appelants y passent. Un treizième
site fabriquait un prénom en coupant le nom au premier espace ; il porte
désormais l'appellation, parce que l'étiquette du formulaire public dit « Nom et
prénom », **dans cet ordre**, et que la coupe rendait donc le nom de famille.

Deux gardes plutôt qu'une : l'une sur le modèle, l'autre qui **lit le code
source** et refuse tout contexte de courriel remplissant `prenom` autrement que
par `appellation` — y compris `compte.prenom or compte.nom`, qui rend pourtant le
bon résultat mais qu'il faut penser à écrire. La garde a été éprouvée en
réintroduisant le défaut : elle tombe, et nomme le fichier et la ligne.

Relu sur la pile, sur le compte même qui produisait « Bonjour  » :

    Bonjour Sylvie MBIDA

### Ce que cette passe apprend

Les trois défauts sont du même genre : **le produit parlait, et disait faux**.
Une dette réclamée avant la naissance, un silence là où il fallait un accusé,
une salutation vide devant une demande d'argent. Aucun n'aurait fait tomber un
test ; tous les trois se voient en dix secondes dans une boîte aux lettres.

Une suite verte ne prouve que ce qu'elle mesure. Les trois cas ajoutés mesurent
désormais ce que la cliente lit, et non ce que le code renvoie.

### Ce qui a été mis sous surveillance

Le cahier de recette passe de 90 à **94 cas** (UC-91 à UC-94), et le flux M→I de
33 à **35 étapes** : l'accusé y est lu dans la boîte de la cliente, avec sa
référence, et son échéancier est refusé s'il porte une seule ligne antérieure à
la naissance de sa société.

    ✓  4. Elle reçoit l'accusé de sa demande
           « Nous avons bien reçu votre demande — dos-a8adac4cff4943c6 »
    ✓ 32. Aucune échéance n'est antérieure à sa société
           aucune dette d'avant sa naissance

Au passage, une entrée de ce journal — « 27 septembre (suite 12) » — s'était
glissée au-dessus de celles du 28. Remise à sa place.

**Livré :** 3 894 cas au vert (3 882 au départ), 94/94 au cahier de recette,
flux M→I complet en 35 étapes, API reconstruite et rejouée sur la pile de
démonstration, les trois corrections relues dans la boîte réelle.

**Non commité** — rien n'a été porté à l'index ni à l'historique.

## 28 septembre 2026 (suite 3) — Elle entre dans son espace

Le parcours va désormais **du formulaire du site à son espace adhérent**, et je
l'ai suivi dans un vrai navigateur jusqu'au bout.

```
2. après soumission : /connexion?defini=1
3. après connexion  : /mon-espace
   écran            : SM | Sylvie MBIDA B346 | Espace adhérent
```

Elle y voit **son** entreprise : SYLVIE COUTURE SARL, NIU MB3465F0011Q, régime
réel, CDI, assujettie à la TVA, « adhésion au centre agréé : en cours ». Ses
échéances, le dépôt d'un justificatif, ses envois.

**Flux M→I : 33 étapes, complet.**

### Trois défauts trouvés en y arrivant

**1. Un prénom exigé que le produit ne connaît pas.** `Compte.prenom` imposait au
moins un caractère. Or le formulaire public ne porte qu'UN champ de nom, la
demande de contact le conserve entier, et le dossier de formalité fait de même —
`Fondateur.prenom` tolère le vide depuis toujours.

L'ouverture de l'accès tombait donc **en quarantaine après dix tentatives**, sur
« String should have at least 1 character ». Sa société était immatriculée, au
portefeuille, et elle n'avait aucun chemin vers son espace — l'échec vivant dans
une colonne de la boîte d'envoi, que personne ne lit.

Les deux remèdes possibles étaient pires : couper le nom au premier espace pour
en tirer un prénom — l'étiquette du formulaire dit « Nom et prénom », dans cet
ordre —, ou recopier le nom dans ce champ, c'est-à-dire ranger un faux en base.
**Le produit préfère ne pas savoir.** Le champ accepte le vide, et une propriété
unique, `nom_affiche`, compose le nom sans laisser d'espace en tête — trois
f-strings la remplacent, qui auraient rendu «  MBIDA » en première ligne de toute
liste triée.

**2. Un message faux.** Le courriel réemployait `compte.activation`, qui ouvre sur
« Votre souscription **X** est encaissée ». Une fondatrice n'a pas souscrit :
elle a fait immatriculer sa société, et son accès s'ouvre des semaines après son
paiement. La référence n'existant pas, la phrase sortait en outre avec une double
espace.

Un gabarit à part, `compte.activation_creation` : « Votre société SYLVIE COUTURE
SARL est immatriculée ». **Ce n'est pas la duplication que le catalogue
interdit** — celle-ci vise le même message écrit deux fois ; ici ce sont deux
événements différents. Le banc l'a d'ailleurs exigé : il refuse un gabarit sans
contexte de référence recopié de son site d'appel.

**3. Mon propre flux se trompait de titre.** Il cherchait « accès » dans l'objet
du courriel. L'objet a changé, et le flux s'est mis à dire qu'aucun courriel
n'arrivait alors qu'il était là, sous un autre nom. Il le reconnaît maintenant à
son **lien d'activation** — ce qui ne changera pas.

### Et une chose qui l'alarmerait à tort

Sur son écran, première ligne de ses échéances :

> **Contribution des patentes — En retard de 212 jours**

Sa société a été immatriculée **aujourd'hui**. 212 jours avant le 28 septembre
ramènent à fin février : l'échéancier calcule la patente sur l'année civile, sans
tenir compte de la date de création. Or la patente est un droit d'exercer payé
d'avance, et une entreprise qui n'existait pas en février ne devait rien.

Le produit s'interdit de tranquilliser à tort ; alarmer à tort est la même faute
retournée. À instruire — `generer_echeancier` reçoit bien l'entreprise, donc sa
date de création.

---

## 28 septembre 2026 (suite 2) — La proforma par WhatsApp, et une adresse en double

Demande du cabinet : que la proforma parte aussi par WhatsApp, à côté du
courriel.

**Elle partait déjà.** La console porte un bouton « Envoyer sur WhatsApp » avec
un message pré-rempli, conditionné au **consentement** de la cliente — « le
client ne l'a pas autorisé à sa demande » quand il manque. Vérifié dans un vrai
navigateur, en émettant depuis l'écran :

```
Bonjour Voie WhatsApp 57ED, votre proforma n° PRO-2026-0029 est prête,
pour un montant de 250 000 FCFA.
Vous pouvez la consulter ici : http://localhost:3101/fr/proforma/PRO-2026-0029?v=1&e=…&s=…
Répondez à ce message si vous souhaitez en discuter avant de valider.
```

Destinataire `237675153025`, et le courriel était parti en parallèle.

### Mais l'adresse existait en deux exemplaires

La console **recomposait** l'adresse à partir du sceau, de la version et de
l'expiration. Le commentaire l'avouait : « même adresse que celle que le serveur
met dans le courriel ». Deux recettes pour une seule adresse.

Elles avaient **déjà divergé une fois** : le lien partait sur le domaine de
production au lieu de la vitrine, et la cliente recevait un lien vers un site où
sa proforma n'existe pas. Le courriel, lui, continuait de marcher — rien ne le
signalait. Le correctif d'alors avait réparé la copie, pas la duplication.

- Le serveur rend désormais **`lien_client`**, l'adresse complète, composée là où
  il compose celle du courriel. Et `telephone`, pour savoir à qui écrire.
- La console la prend telle quelle. Un paramètre renommé les change toutes les
  deux, ou aucune.
- `lien_acceptation` garde son nom trompeur — il porte le sceau — parce que deux
  routes le rendent et la vitrine le lit. Les deux champs se côtoient, et leurs
  commentaires disent lequel est lequel.

Trois cas ajoutés côté serveur, dont celui qui compte : **l'adresse rendue ouvre
vraiment la proforma**, sans session, par une consultation réelle. Et un cas de
la console a changé de sens : il gardait la recomposition, il garde maintenant
son absence.

⚠️ Au passage, le panneau dit deux choses justes que je n'avais pas relevées :
« Chiffrée et engagée par le même compte : aucune validation par un second
collaborateur », et « Transmission notée : la relance est armée ». L'écran ne
cache ni l'un ni l'autre.

---

## 28 septembre 2026 (suite) — L'accès vient avec l'entreprise, et avec le suivi

Le cabinet a précisé la règle, et elle est plus juste que ce que j'avais câblé.

### Pendant la création, elle n'a besoin d'aucun compte

Ses pièces — carte d'identité, casier judiciaire, statuts — arrivent **par
WhatsApp**, et un collaborateur les coche au dossier de formalité. C'est déjà
ainsi que la checklist fonctionne, et c'est le bon choix : un formulaire à
identifiants pour envoyer la photo d'une carte d'identité ferait abandonner la
moitié des dossiers, sur un canal que tout le monde emploie ici de toute façon.

### L'accès demande DEUX conditions, pas une

1. **Son entreprise existe** — avant l'immatriculation, il n'y a rien à lui
   montrer, et la portée d'une adhérente est un NIU.
2. **Elle a pris le suivi.**

La seconde vaut la première. Le cabinet peut immatriculer une société sans en
tenir la comptabilité : la cliente repart avec son RCCM et son NIU, et la
prestation est complète. Lui ouvrir un espace de suivi qu'elle n'a pas acheté lui
ferait attendre un service qui ne viendra pas — et le cabinet le découvrirait à
la première échéance non traitée, c'est-à-dire trop tard.

**Le drapeau existait déjà** : `DemandeConversion.adherent`, qui pose l'adhésion
sur l'entreprise. Il entre maintenant dans `EntrepriseCréée`, et l'abonné en fait
sa condition.

⚠️ **Absent vaut vrai**, ici aussi : avant cette clé, la conversion valait
adhésion, et il en dort dans la boîte d'envoi. Les ignorer laisserait une
adhérente payante sans accès, sans que personne sache pourquoi.

Trois cas ajoutés : sans suivi rien ne s'ouvre et le journal dit que c'est ce qui
a été vendu ; avec le suivi l'accès s'ouvre ; un événement d'avant la distinction
ouvre toujours. Dix cas au total sur cet abonné.

---

## 28 septembre 2026 — Une vente n'ouvre pas toujours un locataire

Le cabinet a tranché : **une cliente qui achète une prestation est une adhérente
du cabinet**, pas un locataire de la plateforme. Son compte doit vivre là où vit
son dossier.

### Ce que l'ancien comportement produisait

Toute proforma payée ouvrait un locataire, `tnt-{slug}`, quel que soit le service
vendu. Une entrepreneuse qui achetait la création de sa SARL recevait donc **son
propre espace de plateforme**, isolé, pendant que son entreprise entrait au
portefeuille **du cabinet**. Deux locataires pour une seule cliente — et même en
activant son compte, elle serait entrée dans un espace vide.

Relevé en base, sur quatre exécutions du flux :

| | Locataire |
|---|---|
| Son compte | `tnt-couture-a2af8c` |
| Son entreprise, son dossier, ses échéances | `CGA-BRCG` |

### Ce qui a été livré

- `SERVICES_OUVRANT_UN_LOCATAIRE` dans l'application de la souscription. Une
  seule entrée : **`PLATEFORME`**, l'offre « un autre centre de gestion achète la
  plateforme ».
- L'événement `PaiementEncaissé` porte `ouvre_un_locataire`, **dit explicitement
  et non déduit d'un slug absent** : un champ manquant est un défaut, une
  consigne s'écrit.
- L'abonné du contexte Tenants s'arrête sans rien faire quand la clé dit non —
  et **ne lève pas** : ce n'est ni un échec ni un rejeu, il n'y avait rien à
  ouvrir. `ResultatOuverture` porte `sans_objet`.
- **Absent vaut vrai** : un événement déposé avant cette distinction n'en porte
  pas la clé et ouvre toujours son locataire. Il en dort dans la boîte d'envoi ;
  les ignorer laisserait un cabinet payé sans espace.

⚠️ `PLATEFORME` **n'est pas au catalogue** : aucun prospect ne peut l'acheter. Le
code est écrit pour que le mécanisme d'ouverture garde ses cas — un mécanisme
câblé que plus aucun cas ne traverse pourrit en silence et se découvre cassé le
jour où l'on en a besoin. Le jour où le cabinet vend la plateforme, le service
s'ajoute au catalogue **sous ce code exact**. C'est la leçon de la veille : trois
vocabulaires pour une même prestation avaient rendu le tunnel sans issue.

### Et une conséquence que je n'avais pas vue

J'avais répondu au cabinet : « elle a accès à son interface **après le
paiement** ». C'est faux, et le mécanisme d'accès adhérent le dit lui-même.

`ouvrir_acces_adherent` exige un **NIU** : la portée d'une adhérente est le
dossier de **son** entreprise, et rien d'autre — « une souscription ne peut pas
fabriquer un réviseur ». Or au moment où elle paie sa création, **son entreprise
n'existe pas**. Son NIU n'arrive qu'à l'immatriculation, au bout du tunnel des
formalités.

Son accès ne peut donc s'ouvrir qu'à la **conversion**, quand le dossier de
formalité devient une entreprise du portefeuille. Ce qui se tient : avant cela,
il n'y a rien à lui montrer.

⚠️ La promesse du produit change donc, et il faut que le site le dise : on
n'achète pas un accès, on achète une société. L'accès vient avec elle.

**Reste à faire** : la conversion ne publie aucun événement. Il lui en faut un,
porteur du NIU et des coordonnées de la fondatrice, sur lequel brancher
l'ouverture de l'accès adhérent — le mécanisme, lui, existe et fonctionne depuis
le parcours d'adhésion.

---

## 27 septembre 2026 (bilan) — Le parcours de création est livrable

Fin de la journée sur la souscription de création d'entreprise. Toutes les
suites repassées **sur les images reconstruites**, rien d'injecté nulle part.

| Ce qui est éprouvé | Compte |
|---|---|
| Serveur | **3 860** cas, aucun sauté |
| Console | 398 cas · contrat des écrans 303/304 |
| Vitrine | 86 cas |
| Mobile | 265 cas · analyse propre |
| Parcours navigateur | 14 |
| Flux M→I, de bout en bout | **26/26** |
| **Cahier de recette** | **88/88**, huit pages, HTML et PDF |

Le cahier compte 88 cas contre 75 ce matin : le mobile y est entré (7), et le
parcours de création souscrite aussi (6). Répartition : accès et exploitation 21,
collecte des pièces 11, **souscription 10**, **création d'entreprise 8**,
comptabilité 8, pilotage 7, social 6, clôture 6, obligations 5, conformité 5.

### Ce que la journée a établi sur ce parcours

Le site vend « votre SARL immatriculée ». Ce matin, **aucune demande déposée
depuis le site ne pouvait être qualifiée** — trois vocabulaires pour une même
prestation —, une création payée n'ouvrait **qu'un accès à l'ERP**, et quatre
écrans tombaient en 500 sur des cas ordinaires.

Ce soir, le chemin est continu et vérifié : un visiteur dépose sa demande, le
cabinet la qualifie et la chiffre, le client lit sa proforma par un lien signé,
l'accepte, la règle — et **l'encaissement ouvre à la fois son espace et son
dossier de formalité**, celui-ci portant les faits qu'il a donnés au téléphone.
Le tunnel mène ensuite au RCCM, au NIU, au portefeuille, et à un échéancier
fiscal de dix obligations calculé sans qu'on l'ait demandé.

### Ce qui reste à décider, et qui n'est pas du code

- **`tenue-comptable` → `ADHESION`** est une interprétation de ma part, signalée
  dans le README du référentiel. Le catalogue ne porte pas de service « tenue
  comptable » distinct.
- **`lien_acceptation` porte mal son nom** : il contient le sceau. Le renommer
  touche un contrat rendu par deux routes et lu par la vitrine.
- **Les services sans questionnaire** — `FORMATION`, `DOMICILIATION`,
  `PONCTUEL` — ne peuvent être ni qualifiés ni chiffrés. Les écrans le disent
  désormais au lieu de tomber, mais ces trois prestations restent invendables par
  le tunnel. Il leur faut un fichier au référentiel, ou une décision de les
  traiter hors parcours.

---

## 27 septembre 2026 (suite 12) — L'envoi automatique, et les choix de l'expert

Question du cabinet, et elle était juste : **le flux avait-il joué la proforma
envoyée automatiquement après l'échange, avec les choix de l'expert ?**

**Non.** Le flux émettait la proforma puis appelait `POST /transmission` — le
chemin **manuel**, celui où un responsable recopie un lien dans un courriel et
coche « j'ai envoyé ». L'envoi automatique existait, avec cinq cas unitaires, et
n'avait **jamais été vu partir**. Les choix de l'expert, eux, n'étaient pas
touchés du tout : je passais le prix de référence, zéro débours, aucun motif.

### L'envoi automatique, éprouvé jusqu'à la boîte du client

Le flux émet désormais avec `envoyer_par_courriel`, et vérifie quatre choses que
la réponse seule ne prouve pas :

- le serveur répond `ENVOYE`, vers une adresse **masquée** — `s***@exemple.cm` ;
- **un courriel parti vaut transmission** : la proforma est `TRANSMISE` sans
  second geste, et c'est cette date qui arme la relance. Sans elle, le client
  aurait sa proposition et personne ne le relancerait ;
- le message est **réellement dans la boîte** — relu dans le collecteur, sujet
  compris : « Votre proposition PRO-2026-0023 : 199 999 FCFA » ;
- **le lien du message ouvre sa proposition**, sur la vraie page de la vitrine,
  et le montant y figure.

⚠️ Le dernier point est le seul qui compte vraiment. Entre « le service de
notification n'a pas levé » et « la cliente peut cliquer », il y a un serveur
SMTP, un gabarit, un encodage et une adresse de site : quatre façons de n'avoir
rien envoyé tout en ayant l'air d'avoir envoyé. Le flux ouvre donc **le lien du
courriel**, et non le sceau rendu par la réponse.

### Les choix de l'expert, maintenant exercés

- **Les débours** : 41 500 de greffe et 15 000 de publication légale, avancés
  pour le compte de la cliente. Ils ressortent du chiffrage à part — 56 500 —
  parce que les fondre dans le prix ferait passer une avance pour une marge.
- **Un prix hors intervalle sans motif est refusé** : 199 999 contre un plancher
  à 200 000, et le serveur nomme l'intervalle. Un rabais sans motif est un rabais
  que personne ne relit.
- **Le même prix avec motif passe**, et le motif est conservé avec la proforma.

### Et un contrôle qui ne peut pas fonctionner

`separation_respectee` vaut `chiffre_par != valide_par`. Or les deux sont
renseignés **au même instant, par le même compte** : celui qui émet. Le geste de
chiffrage ne persiste rien — c'est une simulation qui rend un intervalle.

Ce n'est pas un oubli, et le code le déclare en toutes lettres : « aucun geste
distinct de validation n'existe encore ; le contrôle interne le verra, au lieu de
lire une validation déclarée. » Le produit préfère afficher « non respectée »
plutôt que de simuler un contrôle que personne n'a fait — et ce choix est le bon.

⚠️ **Mais la conséquence est concrète, et elle vient d'être mise en scène** : un
prix **sous le plancher** a été accordé, avec un motif écrit par celui-là même
qui l'accordait, et rien dans le produit ne peut exiger un second regard. Pour un
geste commercial, c'est une décision du cabinet ; pour un contrôle interne, c'est
un trou. Le cas de recette le **constate** et ne le reproche pas ; il deviendra un
vrai contrôle le jour où la validation aura sa propre route.

### Un défaut de mon propre flux, et il était du genre le plus vicieux

Un garde hérité lisait `code` après le chiffrage pour s'arrêter si celui-ci
n'aboutissait pas. Depuis qu'une étape **refusée à dessein** le précède — le prix
hors intervalle —, ce même `code` valait 422 : le flux s'arrêtait à l'étape 9 en
se déclarant **COMPLET**. Vert, et muet sur dix-neuf étapes jamais jouées.

C'est la deuxième fois de la journée qu'un outil de recette manque de mentir en
vert, après le sélecteur Playwright qui se sautait lui-même. Un banc d'essai qui
se trompe ne fait pas d'erreur bruyante : il se tait.

**Flux M→I : 31 étapes, toutes vertes.**

---

## 27 septembre 2026 (suite 11) — Trois écrans qui tombaient, et un dossier introuvable

Les images sont reconstruites — le réseau est revenu, le code et le référentiel
ne sont plus injectés dans les conteneurs. Le flux M→I rejoué sur ces images :
**26/26**.

En voulant écrire le parcours navigateur de ce tunnel, trois défauts sont sortis,
qu'aucune suite ne pouvait voir.

### 1. Un dossier payé n'apparaissait nulle part

`GET /acquisition/dossiers` rend la file « en cours », et `ouverts()` en écarte
les états terminaux. C'est juste : un dossier payé n'attend plus rien de
personne, et l'y laisser le ferait traiter deux fois.

Mais `?etat=PAYEE` passait par **le même chemin** et rendait donc toujours une
liste vide. Un filtre qui ne peut jamais rien rendre ne dit pas « il n'y en a
pas » : il ment, et l'on cherche le défaut ailleurs. J'y ai perdu une demi-heure.

Demander un état terminal n'est pas parcourir la file : c'est chercher quelque
chose de précis. La route le rend désormais.

**Et c'était grave, pas seulement gênant.** Une création payée dont le dossier de
formalité ne s'ouvre pas — un fait manquant à la qualification — était
**invisible partout** : hors de la file, et sans écran qui la liste. Le client
avait payé, le travail n'avait pas commencé, et rien ne le disait. C'est la faute
que ce produit s'interdit, déplacée d'un cran par la fonctionnalité du matin.

Un panneau « Créations payées » la rend visible en deux clics. Il ne dit pas
lui-même si le dossier est ouvert : la fiche le fait, en une requête par dossier.
Le faire dans la liste coûterait un aller-retour par ligne sur un réseau qu'on
sait mauvais.

### 2. La fiche tombait en 500 pour qui ne suit pas les formalités

Mon panneau appelait `/creations/{ref}`, qui exige `SUIVRE_FORMALITE`. Je ne
reprenais que le 404. Résultat : **la direction ne pouvait plus ouvrir la fiche
d'un dossier payé**. Un défaut que j'avais créé une heure plus tôt.

La fiche a maintenant **trois réponses, et non deux** : ouvert, avec le lien ;
pas encore, parce qu'il part sur un événement ; ou « vous ne suivez pas les
formalités ». Rendre `null` dans les deux derniers cas ferait dire « pas encore
ouvert » à quelqu'un qui n'a simplement pas l'habilitation — et l'on attend
devant un écran, puis on appelle.

### 3. La fiche tombait en 500 pour tout service sans questionnaire

Celui-là ne venait pas de moi. Il restait **un quatrième appel** à `prendre()`
sans reprise, dans `GET /acquisition/dossiers/{ref}/qualification`. La fiche d'un
dossier `FORMATION`, `DOMICILIATION`, `PONCTUEL` — ou déposé sous un ancien code
— **ne s'ouvrait pas du tout**. Le collaborateur voyait une page d'erreur à la
place du dossier de son client, et n'apprenait rien.

Traduit en 404, comme les trois autres. Côté console, le panneau de qualification
dit pourquoi il est vide, celui du chiffrage se tait — un geste qui ne peut pas
aboutir ne s'offre pas — et **le reste de la fiche s'affiche** : la demande, les
proformas, le règlement.

### Ce que cela dit du banc d'essai

Trois écrans cassés, dont deux depuis longtemps, et **aucune suite ne les
voyait**. Les cas du serveur éprouvent des routes ; ceux de la console éprouvent
des composants. Personne n'ouvrait la fiche d'un dossier dont le service n'a pas
de questionnaire.

Le parcours navigateur ajouté emprunte le chemin du collaborateur : panneau des
créations payées → fiche → lien → dossier de formalité. **14 parcours verts.**

⚠️ Il a lui-même failli mentir : mon premier sélecteur prenait `section,div`
filtré par le texte, donc **tous les ancêtres** du panneau — c'est-à-dire la page
entière, avec les liens de la file « en cours ». Le parcours passait sur des
dossiers non payés et **se sautait lui-même**, en vert. Un parcours qui se saute
ne prouve rien, et ne se remarque pas.

---

## 27 septembre 2026 (suite 10) — Vingt-six étapes, du visiteur à l'immatriculation

Le flux va désormais jusqu'au bout : **du visiteur anonyme sur le site à
l'entreprise immatriculée au portefeuille, avec son échéancier fiscal**.

```
catalogue → demande sans compte → file du cabinet → refus du comptable
→ affectation → questionnaire → qualification → chiffrage → proforma
→ transmission → lecture par lien signé → acceptation → règlement
→ encaissement → espace utilisable → dossier de formalité ouvert seul
→ faits repris → dépôt refusé (pièces nommées) → dossier déposable
→ CFCE → suivi → livraison refusée sans NIU → livraison
→ conversion → portefeuille → échéancier de 10 obligations
→ seconde conversion refusée
```

**Pourquoi prolonger, alors que `flux_creation.py` couvre déjà ce tunnel.**
Parce qu'il l'éprouve depuis un dossier ouvert **à la main**, avec des faits
écrits dans le script. Ici le dossier est né d'un **paiement**, sur les faits que
la cliente a donnés au téléphone. Le tunnel n'a pas à savoir d'où vient son
dossier ; la seule façon de s'en assurer est de le lui faire parcourir depuis
l'autre bout. Il le fait.

**Ce que cela établit, et qui n'était établi nulle part :** l'argent encaissé
produit une société immatriculée. Pas un accès, pas un dossier vide — une
entreprise au portefeuille, qui sait ce qu'elle doit et quand.

### Le sceau perdu à la seconde transmission, corrigé

Le lien d'acceptation n'était rendu qu'à **l'émission**. La transmission — la
route qu'un collaborateur emploie quand il envoie le document — ne le rendait
pas, et rien ne permettait de le retrouver ensuite.

Un client qui perd son courriel n'avait donc plus de chemin vers sa proforma. Le
seul recours du cabinet était d'émettre une **v2** d'un document que personne
n'avait contesté : nouveau numéro, ancien lien invalidé, suivi commercial
brouillé — pour un courriel égaré.

Le lien n'est pas persisté, et c'est un choix qui se tient : il ne contient rien
que la proforma ne porte déjà — numéro, version, et une expiration qui vaut
`emise_le + N jours`. Il est donc **recalculé**, en un seul endroit, et les deux
routes s'en servent. La transmission le rend désormais, à l'identique.

Trois cas le tiennent, dont celui qui compte : **le lien renvoyé est le MÊME**,
et pas un lien neuf. En émettre un autre invaliderait celui que le client
retrouvera peut-être demain, sans que personne le sache. Éprouvés en retirant le
correctif : les trois tombent.

⚠️ Le champ reste nommé `lien_acceptation` alors qu'il contient le **sceau**. Le
renommer touche un contrat rendu par deux routes et lu par la vitrine ; c'est une
correction à faire, mais pas en passant.

### Et le chemin manquait dans la console

Le dossier de formalité s'ouvrant désormais tout seul, la fiche commerciale
payée annonçait l'ouverture de l'espace… et rien de la société. Le collaborateur
n'avait **aucun chemin** vers le dossier qui venait de naître : un manque créé
par la fonctionnalité du jour même.

Le panneau du règlement le dit maintenant, en **trois états** et sans lien posé à
l'aveugle : ouvert, avec un lien vers l'immatriculation ; pas encore, parce qu'il
part sur un événement et arrive quelques secondes plus tard ; ou absent parce
qu'un fait manquait — et la phrase dit alors où le journal le nomme et qu'il est
à ouvrir à la main.

⚠️ Un 404 est **attendu** ici et ne remonte pas : laisser l'erreur passer ferait
tomber la fiche commerciale entière pour une course de quelques secondes.

⚠️ La fiche n'interroge le dossier de formalité que pour une **création payée**.
Une adhésion n'en ouvre aucun, et un aller-retour sur chaque fiche ouverte se
paierait sur un réseau qu'on sait mauvais.

---

## 27 septembre 2026 (suite 9) — Le parcours de création, de bout en bout

Le cabinet a tranché les deux questions ouvertes par la simulation :

1. **Le catalogue fait foi.** Un seul vocabulaire, celui que publie
   `GET /souscription/services`.
2. **Le dossier de formalité s'ouvre tout seul** à l'encaissement.

### Ce que l'unification a touché

- `Docs/referentiel/qualification/` : `creation-sarl.yaml` → `CREATION.yaml`,
  `tenue-comptable.yaml` → `ADHESION.yaml`, clé `service:` comprise.
- `Docs/referentiel/tarification/baremes.yaml` : mêmes clés.
- La vitrine : `DEMARCHES` passe aux codes du catalogue. **Deux listes existaient**
  — celle de `app/lib/acquisition.ts` et une copie locale dans
  `FormulaireDemarche.tsx` — et elles avaient divergé. Une seule demeure.
- La page publique de proforma : les libellés suivent les nouveaux codes.
- Vingt-huit fichiers de cas du serveur.
- Le README du référentiel énonce désormais l'histoire, pas seulement la règle.

⚠️ `tenue-comptable` → `ADHESION` est une **interprétation** : le catalogue ne
porte pas de service « tenue comptable » distinct, et l'adhésion y est décrite
comme « suivi comptable et fiscal ». Elle est signalée comme telle dans le
README, à relire par le cabinet.

**Un second écart de vocabulaire, trouvé en chemin.** Le questionnaire proposait
`SARL_UNIPERSONNELLE` et `ETABLISSEMENT` là où `FormeJuridique`, l'énumération du
portefeuille, dit `SARLU` et `ETS`. Ce champ traverse trois contextes — il chiffre
la prestation, il ouvre le dossier de formalité, il devient la forme de
l'entreprise au portefeuille. Un seul endroit l'employait ; aligné.

### L'ouverture automatique du dossier de formalité

**Par un événement, et non par un appel direct.** Le graphe autorise
`creation_entreprise → {conformite, portefeuille}` et `souscription →
{portefeuille}` : ni l'un ni l'autre ne peut lire son voisin, et c'est voulu —
une création d'entreprise n'a pas à savoir comment on vend. `PaiementEncaissé`
est le mécanisme prévu pour franchir cette frontière.

- `abonne_de_souscription.py` dans le contexte de la création : il n'agit que si
  le service vendu est `CREATION`, et n'a besoin que de l'événement.
- **Rejouable** : la référence du dossier de formalité est *dérivée* de celle du
  dossier commercial — `CRE-dos-abc123`. Le même encaissement remis deux fois
  désigne le même dossier, et le second passage constate qu'il existe. Une
  référence tirée au hasard ouvrirait deux dossiers pour un seul client payé.
  Elle est lisible par surcroît : on sait d'où vient le dossier sans requête.
- **Ce qui manque n'est pas inventé.** Un fait fondateur absent n'ouvre rien :
  l'abonné le dit dans le journal d'exploitation et laisse le dossier à ouvrir à
  la main. Un dossier au nom de « Société à nommer » circulerait jusqu'au greffe.

**L'événement a grandi, et chaque ajout a dû se justifier** devant le cas qui
garde sa minimalité :

- `service` — sans lui, l'abonné ne sait pas s'il doit agir.
- `faits_fondateurs` — **cinq** faits sur la douzaine recueillie. Les tranches de
  chiffre d'affaires et le nombre de salariés ont servi à *chiffrer* : ils
  restent sur la proforma, qui les conserve, et ne circulent pas.
- `telephone_titulaire` — il était écarté avec ce motif : « il ne sert pas à créer
  un compte ». C'était juste tant que l'encaissement n'ouvrait qu'un espace. Le
  fondateur d'un dossier de formalité porte un téléphone : c'est par là que le
  greffe le joint. **Le motif d'hier ne tient plus ; la règle, elle, n'a pas
  bougé** — rien qui ne serve.

**Le questionnaire passe en version 2** : `denomination_souhaitee` et `siege`
s'ajoutent, parce qu'un dossier de formalité ne s'ouvre pas sans eux, et que la
qualification est le seul moment où quelqu'un parle au client.

⚠️ La forme juridique **reste la première question**. J'avais mis la dénomination
en tête ; un cas de recette gardait l'ordre, avec son motif — « demander le
capital avant la forme fait interrompre le responsable par le client ». Une
décision motivée ne se renverse pas pour une préférence : la dénomination est
passée en deuxième.

### Le flux, et ce qu'il a coûté à écrire

`flux_creation_souscrite.py`, **dix-sept étapes, toutes vertes** : catalogue → demande
déposée sans compte → file du cabinet → refus du comptable → affectation →
questionnaire → qualification → chiffrage → proforma → transmission → lecture
par lien signé → acceptation → règlement → encaissement → espace ouvert →
**dossier de formalité ouvert tout seul** → faits de la qualification repris.

Six erreurs de MA part, chacune corrigée par ce que le serveur répondait :

- chercher le dossier par son nom, quand c'est le téléphone qui identifie un
  prospect — deux demandes d'un même numéro ne font qu'un dossier ;
- un numéro à dix chiffres, refusé avec le format en toutes lettres ;
- le mauvais compte pour l'affectation : quatre permissions distinctes courent
  sur ce parcours, et trois mains ;
- des réponses de qualification mal typées, refusées en 422 ;
- **le sceau cherché sur la transmission, alors qu'il vient de l'émission** ;
- l'impatience : le dossier s'ouvre par un événement, que le relais publie à sa
  cadence.

**Deux pièges relevés, à signaler.**

- `lien_acceptation` **ne contient pas un lien**, mais le sceau seul. Le nom
  trompe : on croit tenir une adresse à ouvrir, on tient une signature à
  recomposer.
- Une **seconde** transmission d'une proforma rend `lien_acceptation: null` et
  `expire_le: null`. Un collaborateur qui renvoie le lien à un client qui l'a
  perdu ne le récupère donc pas.

**Une septième erreur de ma part, et la plus instructive.** J'ai d'abord écrit
que la saga d'ouverture du tenant ne se déclenchait pas : `ouverture` rendait
`demarree: false` après encaissement, alors que le dossier de formalité, lui,
s'ouvrait. J'en ai conclu que des deux abonnés du même événement, un seul
réagissait.

C'était faux, deux fois. D'abord j'interrogeais l'ouverture **immédiatement**
après l'encaissement, sans laisser au relais le temps de passer — je mesurais mon
impatience. Ensuite je relisais le mauvais dossier : celui d'une exécution
antérieure, arrêtée avant l'encaissement.

La vérification en base a tranché : quatre sagas `ouverture-de-tenant`, toutes
**TERMINEE**, sans une seule tentative en échec ; la boîte d'envoi sans
quarantaine ; et l'ouverture des trois dossiers payés rend `utilisable: true`
avec **zéro étape substituée**. Les trois ports posés le 26 septembre font donc
leur travail en conditions réelles.

Le flux attend désormais le relais à cette étape aussi, et compte les étapes
substituées : un espace ouvert par substitution n'est pas un espace ouvert.

⚠️ La leçon vaut d'être gardée : **une réaction à un événement ne se vérifie pas
dans la seconde qui suit la requête**. Deux de mes sept erreurs sur ce parcours
viennent de là.

⚠️ L'image du serveur n'a pas pu être reconstruite (registre Docker injoignable) :
le code et le référentiel ont été **injectés dans le conteneur** pour la
vérification en direct.

---

## 27 septembre 2026 (suite 8) — Le tunnel commercial est sans issue depuis le site

Demande du cabinet : reprendre la simulation, cadrée sur **la souscription de
création d'entreprise** — l'offre de première page, « votre SARL immatriculée
pour 275 000 FCFA ».

**Il n'existait aucun flux pour ce parcours.** `flux_souscription.py` part d'un
prospect qui souscrit une ADHÉSION ; `flux_creation.py` part d'un dossier de
création **déjà ouvert par un collaborateur**. Entre les deux manquait le seul
cas que le site vend en vitrine : quelqu'un qui n'a pas encore d'entreprise et
qui veut l'acheter. `flux_creation_souscrite.py` le joue désormais.

**Ce qui marche, et qui mérite d'être dit.**

- La création est déclarée SUR ÉTUDE au catalogue, et le serveur le TIENT : un
  devis de création sort sans montant, quel que soit le montant proposé dans la
  requête. J'ai essayé de lui imposer 275 000 : il a rendu `montant: null`,
  `chiffrée: false`, avec la mention « chiffré après examen du dossier ».
- L'engagement d'un tel devis est refusé en 409, avec une phrase courtoise :
  « le devis comporte des prestations non chiffrées, qui supposent un examen du
  dossier. Le cabinet vous confirme le devis définitif sans frais. » **Aucun
  espace ne s'ouvre gratuitement.**
- Deux demandes portant le même téléphone sont **rattachées au même dossier**
  commercial, avec le motif d'affectation consigné. C'est le même prospect qui
  relance, pas un second client.
- Un numéro mal formé est refusé avec le format attendu, en toutes lettres.
- Le cloisonnement tient : un comptable est refusé sur le chiffrage. Le parcours
  passe par **quatre permissions** et trois mains — `LIRE_PROSPECT`,
  `AFFECTER_DOSSIER`, `QUALIFIER_PROSPECT`, `GERER_COMPTES`.

**Ce qui ne marche pas, et c'est un point bloquant de livraison.**

Trois vocabulaires pour une même prestation :

| Où | Code employé |
|---|---|
| Le formulaire de la vitrine | `creation` |
| Le catalogue public `/souscription/services` | `CREATION` |
| Le référentiel de qualification | `creation-sarl` |

Le README du référentiel énonce pourtant la règle : « **le nom du fichier est la
clé du service au catalogue** ». Les données l'ont perdue de vue.

Conséquence, vérifiée avec la valeur exacte que transmet le formulaire : un
dossier né du **vrai site** ne peut être ni qualifié, ni chiffré, ni transformé
en proforma. Et ce n'est pas propre à la création — **aucune** des six valeurs
que le formulaire peut envoyer (`creation`, `adhesion`, `ponctuel`,
`domiciliation`, `formation`, `autre`) ne correspond à un questionnaire. Le
tunnel commercial est **mort à l'arrivée pour tout le trafic public**.

**Pourquoi personne ne l'avait vu.** Le jeu de démonstration et les cas du
serveur déposent directement `creation-sarl`, la clé du référentiel. Le pipeline
est donc éprouvé avec le vocabulaire interne, jamais avec ce que le site envoie.
La frontière n'était traversée par aucun test.

**Un second défaut, corrigé aujourd'hui.** Le chiffrage laissait
`QuestionnaireIntrouvable` s'échapper : le cabinet recevait **HTTP 500**,
« Internal Server Error », sur la seule route qui pouvait lui apprendre quoi
corriger. Les routes du questionnaire et de la qualification faisaient déjà la
reprise en 404 — l'écart n'en était que plus difficile à voir. Le message levé
est excellent : il nomme le service demandé ET les services qualifiables ; le
500 le jetait. Traduit en 404, comme `BaremeIntrouvable` quinze lignes plus bas.
Les deux appelants en bénéficient : le chiffrage et l'émission de la proforma.

Cas de non-régression ajouté à `test_prix_du_dossier.py`, éprouvé en retirant le
correctif : il tombe. `tests/test_acquisition.py` et `test_prix_du_dossier.py`
verts.

**L'écart de vocabulaire, lui, n'est pas corrigé** : trancher lequel fait foi
touche à l'offre commerciale, et appartient au cabinet. Le flux le **nomme**
plutôt que de s'arrêter sur un code HTTP.

⚠️ L'image du serveur n'a pas pu être reconstruite — le registre Docker est
injoignable depuis ce poste. Le fichier corrigé a été **injecté dans le
conteneur** pour la vérification en direct ; l'image sera refaite au retour du
réseau.

---

## 27 septembre 2026 (suite 7) — Un contrôleur refabriqué, et la suite du serveur

**Une faute que j'ai commise le matin même, et corrigée avant qu'elle ne sorte.**
Le champ de recherche livré une heure plus tôt fabriquait son
`TextEditingController` dans `build`. Cela paraît marcher, et les cinq cas
passaient : le texte s'affiche, le filtre s'applique.

Mais la liste se reconstruit à **chaque frappe**. Le champ recevait donc un
contrôleur neuf à chaque lettre, et la **région de composition** partait avec
l'ancien. Cette région porte le mot en cours : la saisie prédictive, la
correction automatique, et **les accents composés** — le « é » obtenu en
maintenant le « e » sur un clavier Android.

C'est-à-dire exactement ce dont se sert quelqu'un qui tape « février ». Un champ
écrit pour chercher en français, qui casse sur les accents : l'ironie aurait
coûté cher, et aucun cas ne l'aurait vue, parce que `enterText` pose le texte
d'un bloc et ne compose rien.

Le contrôleur vit maintenant dans l'état, et la valeur de l'écran n'y est
recopiée que lorsqu'elle **diffère** du texte saisi — sinon, remettre le même
texte replacerait le curseur à chaque lettre. Un cas frappe désormais lettre par
lettre (« f », « fe », « fev », « fevr ») et vérifie que le texte s'accumule,
que le curseur reste au bout, et que le filtre suit.

Suite mobile : **265 cas verts**.

**La suite du serveur, passée en entier.** Elle ne l'avait pas été de la
session : **3 844 cas, tous verts, aucun sauté**, en 13 minutes 58, contre la
base d'essai réelle. Aucune régression du côté serveur, ce qui était attendu —
rien ne l'a touché aujourd'hui — mais qui devait être établi avant de parler de
livraison plutôt que supposé.

---

## 27 septembre 2026 (suite 6) — Le cahier de recette, réengendré à 82 cas

Le cahier livrable datait de 75 cas. Il en compte 82, mobile compris.

**Un second silence, trouvé en le régénérant.** `COMPTE_DU_CAS` est la seule
partie du cahier écrite à la main : elle dit au testeur humain quel compte
employer pour rejouer chaque cas. Le rendu la lit avec `.get(..., "")`. Elle
s'arrêtait à **UC-64** — dix-huit cas s'imprimaient donc avec une case vide,
sans que rien ne le signale. Un testeur devant UC-70 n'avait aucun moyen de
savoir sous quelle identité se connecter, et le cahier avait l'air complet.

Même famille que les deux défauts du matin : ce qui manque ne se voit pas, tant
que rien n'est chargé de le dire.

- Les dix-huit entrées manquantes sont écrites, dont les sept cas mobiles, avec
  leur mode opératoire réel : l'application installée sur un téléphone Android,
  branchée sur la pile de démonstration par `adb reverse`, et un compte
  **adhérent** — celui d'un collaborateur n'ouvre pas l'espace adhérent.
- `_cas_sans_compte()` liste à voix haute, à chaque engendrement, les cas sans
  indication. **Il n'arrête pas le cahier** : celui-ci reste juste sur les
  autres, et un manque d'aide au testeur n'est pas un échec du produit. Garde
  éprouvé en retirant une entrée : il la désigne.

**Cahier engendré : 82/82, sept pages**, HTML et PDF. Les sept cas mobiles y
figurent, chacun avec le compte et le geste à reproduire.

Répartition par contexte : Accès et exploitation 21, **Collecte des pièces 11**
(elle en avait 4 ce matin), Comptabilité 8, Création d'entreprise 7, Pilotage 7,
Social 6, Clôture 6, Conformité 5, Obligations 5, Souscription 5, Base 1.

---

## 27 septembre 2026 (suite 5) — Chercher, quand la liste dépasse l'écran

Troisième friction relevée en usage réel, et la seule des trois qui ne demandait
aucune décision du cabinet : **on ne pouvait rien chercher**. Soixante-cinq
accusés de dépôt et cinquante et une pièces remises, en liste plate. Retrouver
l'accusé de février 2024 sur le dossier de démonstration demandait quatorze
glissements. L'information était là, l'accès manquait.

**Ce qui a été livré.**

- `domaine/recherche.dart` : la comparaison employée par les deux écrans.
- `composants/champ_de_recherche.dart` : le champ, et le message de liste vide.
- La recherche sur **Mes documents** — numéro, déclaration, période, guichet.
- La recherche sur **Pièces remises** — émetteur, référence, et **mois**.

**Quatre décisions, et leur pourquoi.**

*Sans accents, dans les deux sens.* On tape « fevrier » sur un clavier de
téléphone : la touche des accents est en second niveau, et personne ne l'ouvre
pour filtrer une liste. Une comparaison brute n'aurait rien rendu, et l'adhérent
en aurait conclu que le document n'existe pas. Le sens inverse compte autant :
taper « février » doit trouver une ligne écrite « Fevrier » par un opérateur
pressé. Une table de douze caractères, et non un paquet tiré pour cela — Dart ne
porte pas la décomposition Unicode, et le français tient en une ligne.

*Les mots cherchés séparément.* « tva fevrier » trouve une ligne « TVA du mois ·
février 2024 », où les deux mots vivent dans deux champs différents et dans
l'autre ordre. Exiger la chaîne entière obligerait à deviner la mise en forme de
la ligne.

*Le mois ajouté à la main pour les pièces.* Il n'est porté par aucun champ du
serveur : il est **calculé à l'affichage**. Sans l'ajouter explicitement à la
recherche, « septembre » n'aurait rien rendu — alors que l'écran l'écrit en
titre de section, juste au-dessus. Le genre d'écart qu'on ne voit qu'en
essayant.

*Le champ n'apparaît qu'au-delà de huit lignes.* En deçà, on lit plus vite qu'on
ne tape, et un champ de recherche en tête de page n'est que du bruit.

**Et la règle qui ne souffre aucune exception :** une recherche qui ne rend rien
dit « Rien ne correspond à « … » — vos autres documents sont toujours là », et
**jamais** « aucun accusé de dépôt ». C'est la même règle que pour le réseau
absent : dire à un adhérent que le cabinet n'a rien pour lui, alors que c'est sa
recherche qui ne rend rien, est exactement le message qui fait appeler en
urgence. Deux cas le tiennent, un par écran.

Dix-huit cas ajoutés. Suite mobile : **264 cas verts**, analyse propre.

**Cahier de recette : UC-80, UC-81, UC-82**, sur le banc Flutter ouvert plus
tôt. Sept cas mobiles y figurent désormais, tous verts.

---

## 27 septembre 2026 (suite 4) — La porte que la barre cachait

Demande du cabinet : améliorer le rendu de la barre du bas, et donner accès à
l'historique des documents envoyés — pièce jointe comprise.

**La découverte, en cherchant où poser cette porte.** L'historique existait
déjà. Complet : les pièces remises groupées par mois, le bilan en tête,
l'avancement de chacune en mots ET en segments, l'émetteur qui remplace la date
dès que le cabinet a ouvert la photo, et le document consultable d'un appui sur
la ligne entière. Cinq cent cinquante lignes, écrites et testées.

**Et son seul point d'entrée était la tuile « Mes pièces », tout en bas de
l'accueil.** C'est-à-dire précisément la section que la barre du bas recouvrait
jusqu'à ce matin. Le défaut de mise en page ne cachait pas trois tuiles
décoratives : **il cachait la porte d'un écran entier**, et personne ne pouvait
le savoir — ni le cabinet, qui ne l'avait jamais vu, ni les cas de rendu, qui
n'ont pas d'encart système.

Deux défauts qui se masquaient l'un l'autre. Le second ne s'est vu qu'une fois
le premier corrigé.

**Ce qui a été livré.**

*L'accès à l'historique.* Une carte « Tout ce que j'ai envoyé » sur l'écran des
justificatifs — l'onglet du dépôt, c'est-à-dire l'onglet de ce que j'envoie. Une
carte dans la page, et **non une troisième icône dans la barre du haut** : c'est
la règle posée à l'ouverture de la coquille, six icônes dans une barre de titre
de téléphone ne se distinguent plus. Elle est volontairement discrète : le
verdict au-dessus répond à la question du jour, l'historique à une question
d'après. Le sous-titre annonce le document de chaque pièce, parce que c'est ce
que l'adhérent vient chercher — pas une ligne de journal, la facture elle-même.

*Et la même porte dans « Documents ».* Cet écran ne montrait qu'une moitié des
documents de l'adhérent : les accusés déposés PAR le cabinet. Les pièces remises
AU cabinet vivaient sur un écran auquel rien ne menait depuis là. Or
« Documents » est l'onglet où l'on cherche un document, quel qu'en soit le sens ;
y taire la moitié revenait à la cacher. La carte est donc sortie dans
`composants/porte_de_l_historique.dart` et posée aux deux endroits — sous le
verdict du dépôt, et sous le chapeau des accusés.

*Un compteur sur le bouton de dépôt.* Une pastille dans l'anneau, avec le nombre
de pièces qui attendent encore. C'est **la seule information que l'application
détient et que le serveur ignore** : hors réseau, une pièce photographiée
n'existe que sur ce téléphone. Rien ne la signalait tant qu'on n'ouvrait pas
l'onglet du dépôt — on consultait ses échéances sans savoir qu'une facture
attendait à deux écrans de là. Elle reste DANS l'anneau et ne déborde pas
au-dessus de la barre : ce qui déborde d'un parent ne reçoit pas les appuis, la
leçon du 23 septembre sur ce même bouton. Fond clair, chiffre sombre, pour se
détacher du magenta. Au-delà de neuf, « 9+ » : trois chiffres dans dix-neuf
points ne se lisent pas, et le nombre exact n'apprend plus rien à ce stade.

*Un fondu au ras de la barre.* Au milieu d'un défilement, une carte passait sous
la barre et se coupait net sur son bord : on croyait la liste finie, et la carte
tronquée. Vingt-quatre points de dégradé de la couleur du fond rendent la
coupure progressive — l'œil comprend qu'il passe DERRIÈRE quelque chose. Un
dégradé, **et non un flou** : un `BackdropFilter` coûte une passe de rendu par
image sur un appareil d'entrée de gamme, qui est la cible de ce produit. Le
voile ne remplace pas le coussin : celui-ci garantit que la dernière ligne est
lisible, le voile ne sert qu'au trajet.

*Un retour au doigt.* `selectionClick` au changement d'onglet, `mediumImpact` au
déclenchement de l'appareil photo. Sur une dalle bon marché, l'affichage met
parfois deux dixièmes de seconde à basculer ; sans retour, on croit avoir raté
sa cible et l'on appuie une seconde fois.

**Une source unique pour le compteur.** La coquille tient un `ValueNotifier`,
que l'écran du dépôt met à jour là où il relit la file. Si la barre relisait la
file pour son compte, deux lectures du même état pourraient se contredire à
l'écran — « tout est parti » d'un côté, « 2 » de l'autre.

Six cas ajoutés : le compteur muet à zéro, le compteur lu depuis un autre
onglet, le plafond à « 9+ », la porte présente et fonctionnelle, la porte
absente tant que le dossier n'est pas connu, et la porte des documents qui mène
bien à l'historique. Suite mobile : **246 cas verts**, analyse propre.

---

## 27 septembre 2026 (suite 3) — Le cahier de recette ignorait un livrable entier

En cherchant à rattacher le défaut de la file à un cas d'usage, constat net :
le registre comptait **75 cas, et pas un seul pour l'application mobile**. Le
serveur, la console, la vitrine — oui. Le mobile, rien. C'est pourtant par là
que l'adhérent remet ses pièces, et c'est précisément là qu'un défaut vient
d'échapper à tout le monde pendant des semaines.

Un cahier qui ignore un livrable ne dit pas « il reste à couvrir » : il ne dit
rien du tout, et son total rassure à tort. C'est la même faute que celle du pas
119, à une échelle plus grande.

**Ce qui a été livré.**

- Le registre sait maintenant rejouer un cas sur **deux bancs** : `pytest` sur le
  serveur, `flutter` sur le mobile. Un champ `banc` sur `CasUsage`, une fonction
  de dépouillement propre à `flutter test` — qui ne rend pas un résumé comme
  pytest mais une ligne d'avancement `+n -n ~n` réécrite en place, dont il faut
  lire la dernière.
- Le dépôt du mobile se trouve par `CGA_RACINE_MOBILE`, ou en voisin. **Son
  absence n'arrête pas le registre, mais ne valide rien** : les cas concernés
  rendent « dépôt du mobile introuvable », donc en échec. Quelqu'un qui n'a
  cloné que le serveur garde un registre utilisable, sans jamais croire que le
  mobile a été vérifié.
- Quatre cas d'usage ajoutés, contexte C — Collecte des pièces : UC-76 (une
  pièce photographiée part sans aucun geste), UC-77 (la file repart au retour
  dans l'application, après un essai sans réseau), UC-78 (l'écran ne promet que
  ce que l'application tient), UC-79 (la dernière section reste lisible sous la
  barre).

**Le garde-fou, éprouvé sur ses trois façons de mentir.** Un filtre qui ne
correspond à rien, un fichier qui n'existe pas, un dépôt absent : les trois
rendent **échec**, aucun ne rend « validé ». C'est la règle de ce registre depuis
le pas 119, et elle valait d'être revérifiée sur un banc neuf.

**Registre complet : 79/79.** Il a d'abord rendu 78/79 : UC-31 échouait parce que
ses tests se **sautaient** faute de base d'essai — le registre a refusé de le
valider, ce qui est exactement son travail. L'instance locale du projet
(`outils/postgres-local.sh start`) l'a réglé.

---

## 27 septembre 2026 (suite 2) — La pièce qui ne partait jamais

Suite du contrôle en direct : le geste central du produit, jamais éprouvé sur un
vrai téléphone. Photographier une facture et la remettre au cabinet.

**Ce qui marche.** L'appareil photo du système s'ouvre depuis le bouton central
— qui change de rôle sur son propre onglet, ce qui n'est pas évident mais est
documenté et cohérent. La pièce se range dans la file, avec sa vignette, son
dossier et son heure. L'envoi manuel fonctionne de bout en bout : la pièce
arrive en base avec le canal `MOBILE`, le bon dossier, l'état `RECUE` et le bon
locataire.

**Ce qui ne marchait pas, et que personne ne pouvait voir.** L'écran de la file
annonçait :

> Elles partiront dès que le réseau le permet. **Vous pouvez fermer.**

C'était faux. Le seul déclencheur d'envoi était le nuage de la barre du haut.
Rien dans `initState`, rien au retour de l'application, aucune reprise. Vérifié
sur l'appareil : au bout d'une minute, la pièce était toujours sur le téléphone,
et la base n'avait pas bougé.

**Pourquoi c'est grave, et pas seulement gênant.** L'adhérent fait exactement ce
qu'on lui dit : il ferme. Il croit sa facture remise. Le cabinet ne la reçoit
jamais, et personne ne s'en aperçoit avant la déclaration. C'est la faute que ce
projet s'interdit depuis le début — **tranquilliser à tort** — et elle était
écrite noir sur blanc dans l'interface.

**Pourquoi aucun test ne l'avait vue.** Les cas couvraient l'appui sur le bouton,
l'absence de réseau, la session expirée, le compte des pièces. Aucun ne couvrait
l'**absence de geste**. On teste ce qu'on fait faire à l'écran ; ici il fallait
tester ce qu'il fait tout seul.

**Ce qui a été livré.**

- `_envoyerDiscretement()` dans `accueil.dart` : vide la file **sans rien dire**.
  Pas de réseau est l'état normal de ce produit, pas une anomalie — un message
  d'échec à chaque tentative serait du bruit. Le bouton, lui, parle encore :
  on y a appuyé exprès. Le seul cas qui rompt le silence est la session
  expirée, parce que plus rien ne partira tant que l'adhérent n'est pas revenu.
- Quatre moments de déclenchement : à l'ouverture de l'écran, **juste après une
  prise de vue**, au **retour de l'application**, et toutes les 30 secondes.
  Le retour est le plus utile : on photographie dans une boutique sans réseau,
  on range le téléphone, on ressort dans la rue où la 3G revient.
- La phrase est ramenée à ce que le produit tient vraiment : « Elles repartent
  toutes seules dès que le réseau revient, **tant que cette application est
  ouverte**. » Un envoi en arrière-plan, application fermée, demanderait une
  dépendance de plus (`workmanager`) et des réveils programmés : c'est une
  décision du cabinet, pas un correctif de passage. Tant qu'elle n'est pas
  prise, l'écran ne promet pas ce qu'il ne fait pas.
- Trois cas ajoutés ou refaits dans `ecran_accueil_test.dart` : la file part
  seule sans qu'on appuie sur rien ; elle repart au retour dans l'application
  après un premier essai sans réseau ; et la phrase affichée ne contient plus
  « vous pouvez fermer ». Le cas du bouton a été refait sur le scénario réel qui
  lui reste : le premier envoi automatique n'a pas eu de réseau, l'adhérent en
  retrouve un, et appuie.

Suite mobile : **240 cas verts**. `flutter analyze --fatal-infos` propre.

**Preuve sur l'appareil.** Photographie prise, puis **plus aucun geste** : la
pièce était en base dix secondes plus tard, et l'écran affichait « Tout est
parti », le nuage grisé. Une seconde pièce de démonstration s'ajoute donc au jeu
d'essai du dossier M071122334455J, canal `MOBILE`.

**Un cas non testable sur ce banc.** Le départ juste après la prise de vue passe
par de vraies écritures disque, que `testWidgets` ne déroule pas sans
`runAsync` ; le cas a été remplacé par celui du retour d'application, qui tient
la même garantie et se teste vraiment. Le départ après prise de vue reste prouvé
sur l'appareil, ci-dessus.

---

## 27 septembre 2026 (suite) — Le correctif que l'écran a démenti

Reprise en main directe du TECNO KM5 branché, avec l'APK de production et une
session réelle. En descendant l'accueil d'un adhérent jusqu'au bout, la dernière
section — les raccourcis « Mes pièces », « Mon entreprise », « Écrire » —
restait **coupée par la barre du bas**. Deux captures identiques à la suite ont
confirmé que c'était bien la fin de la liste.

**Le premier diagnostic, et pourquoi il était faux.** Les écrans réservaient
`Marque.espaceSousLaBarre`, une constante à 104 : la barre mesure 86 et laisse
12 sous elle. J'ai conclu qu'il manquait l'encart du système — la bande de
gestes — et ajouté `MediaQuery.viewPaddingOf(context).bottom`. Cinq cas de test
verts, suite complète verte, APK reconstruit, réinstallé.

**L'écran n'a pas bougé d'un pixel.** C'est là que le contrôle en direct paie :
une suite verte ne prouve que ce qu'elle mesure, et elle mesurait ma propre
hypothèse. J'ai donc posé une mesure dans l'écran et relu le journal de
l'appareil :

```
hauteur=800.0   viewPadding=0.0   padding=114.0   viewInsets=0.0   reserve=104.0
```

Deux choses d'un coup. `viewPadding` vaut **zéro**, et non l'encart : la coquille
pose la barre dans une `SafeArea`, et `MediaQuery.removePadding` retranche de
`viewPadding` ce qu'elle vient de consommer. Mon ajout ajoutait zéro. Et le cadre
annonçait déjà la bonne valeur ailleurs : `padding.bottom = 114`, soit la barre
(86), sa marge (12) et l'encart (16) réunis — parce que la coquille monte la
barre en `bottomNavigationBar` d'un `Scaffold` en `extendBody`, et que Flutter
annonce alors au contenu ce que la barre lui prend. La constante écrite à la main
en réservait 104. Il manquait dix pixels, et c'est ce qui était coupé.

**Ce qui a été livré.**

- `Marque.espaceSousLaBarreDe(context)` ne bricole plus : elle prend
  `MediaQuery.paddingOf(context).bottom` et y ajoute `espace3` d'air. La
  constante reste comme plancher, pour un écran monté hors de la coquille.
- **Effet de bord gagné** : la hauteur de la barre grandit avec la taille de
  texte du système. Une constante ne pouvait pas suivre ; la valeur annoncée,
  si. Le défaut aurait reparu chez toute personne qui grossit les caractères.
- Les cinq écrans concernés y passent : `accueil`, `documents`, `echeances`,
  `mon_entreprise`, `tableau_de_bord`.
- `test/espace_sous_la_barre_test.dart`, cinq cas, réécrits sur le mécanisme
  réel : ils posent le `padding` annoncé — dont 114, la valeur relevée, et 136,
  la barre à 200 % de taille de texte. Le cinquième **relit le code des écrans**
  et échoue si l'un réemploie la constante nue. Garde-fou éprouvé en le faisant
  échouer pour de bon.

Suite mobile : **238 cas verts**. `flutter analyze --fatal-infos` propre.
Vérifié à l'écran sur les quatre écrans défilants de l'espace adhérent :
accueil, échéances, documents, entreprise. Tous se terminent au-dessus de la
barre, avec de l'air.

**Deux leçons à garder.**

1. Un correctif de mise en page n'est pas acquis parce que les tests passent : il
   est acquis quand l'écran a changé. Ici les tests validaient l'hypothèse, pas
   le produit.
2. Avant d'ajouter un terme au calcul, demander à l'appareil ce qu'il annonce.
   La mesure a coûté quatre minutes et a remplacé deux hypothèses fausses.

**Un piège de construction, au passage.** `flutter build apk --release` sans
`--dart-define` repart sur l'adresse d'émulateur par défaut : l'application
affichait « Pas de réseau » sur un téléphone pourtant relié par `adb reverse`.
Les deux adresses sont réglées à la compilation, par choix — pour qu'une version
de démonstration ne puisse pas se retrouver branchée sur la production par un
fichier oublié. Il faut donc les repasser à **chaque** construction :

```
flutter build apk --release \
  --dart-define=CGA_API=http://localhost:8100 \
  --dart-define=CGA_VITRINE=http://localhost:3101
```

**Ce qui reste.** Le collecteur de courrier de démonstration a dû être déporté
sur le port 8026 : le 8025 est pris par un autre projet de la machine. Rien à
décider, mais à savoir au déploiement.

## 27 septembre 2026 — La politique de contenu, avec un nonce plutôt qu'un alibi

Dernier point de sécurité que je pouvais traiter seul : il n'y avait **aucune
`Content-Security-Policy`**, et l'absence était assumée par un commentaire de
`next.config.ts` — « une politique écrite à la légère se contente d'un
`'unsafe-inline'` partout et ne protège de rien ». C'était vrai. L'absence ne
protégeait de rien non plus.

### Mesurer avant d'écrire

Ce qu'une politique doit autoriser ne se devine pas. Relevé sur la pile :

| Ce qui a été compté | Résultat |
| --- | --- |
| Styles en attribut | **1 496** dans la console, 185 dans la vitrine |
| Balises `<style>` en ligne | 0 |
| Scripts externes | 0 |
| Origines externes dans la page servie | **aucune** — `next/font` héberge les polices localement |
| Scripts **en ligne** servis | **3** : le thème (le nôtre) et deux de Next |

Ce sont les trois scripts en ligne qui décidaient de tout.

### Un nonce, et non `'unsafe-inline'`

Avec `'unsafe-inline'`, un script injecté s'exécute exactement comme les nôtres :
la politique devient décorative. Avec un nonce par requête, seuls les scripts que
**nous** marquons s'exécutent — et le nonce change à chaque requête, ce qu'un cas
vérifie.

Ce que les autres directives empêchent, et qui compte autant :

- **`connect-src 'self'`** — le gain le plus concret. Le navigateur ne parle
  jamais au backend directement : tout passe par une seule origine. Un script
  injecté ne peut donc envoyer la session, un montant ou un NIU **nulle part** ;
- **`object-src 'none'`** — un justificatif déposé par un adhérent est du contenu
  venu du dehors : il ne s'exécute pas dans la page ;
- **`base-uri 'self'`** — sans elle, une balise `<base>` injectée détourne toutes
  les adresses relatives, formulaires compris ;
- **`form-action 'self'`** — ce qui empêche un mot de passe de partir chez un
  tiers.

⚠️ **`style-src` garde `'unsafe-inline'`, et c'est assumé.** Dix-sept cents styles
en attribut sont la façon d'écrire de ce produit, et `style-src-attr` ne connaît
pas les nonces. Un style injecté peut défigurer une page ; il ne peut ni exécuter
de code, ni faire sortir une donnée.

⚠️ **Et elle ne répare pas une injection** : elle en limite les effets. Ce qui
empêche l'injection reste l'échappement de React et le refus du serveur.

### Deux refus du build, tous deux instructifs

- J'ai écrit un `middleware.ts`. Le build l'a refusé : « Both middleware file
  "./middleware.ts" and proxy file "./proxy.ts" are detected. » **Depuis Next 16,
  l'intergiciel s'appelle `proxy.ts`**, et le projet en avait déjà un — celui qui
  négocie la langue. Mon `ls middleware.ts` ne l'avait pas trouvé parce qu'il
  cherchait l'ancien nom. La politique s'ajoute donc **dans** `proxy.ts`, et la
  négociation de langue passe **d'abord** : c'est sa réponse qu'il faut coiffer.
- La politique ne peut pas vivre dans `next.config.ts` : ses en-têtes sont
  statiques, calculés une fois à la compilation, et un nonce constant est un
  nonce inutile. Le commentaire qui annonçait l'absence a été corrigé — laissé
  tel quel, il aurait menti au prochain lecteur.

### Vérifié

| Contrôle | Résultat |
| --- | --- |
| Politique servie | mesurée sur la réponse réelle du conteneur |
| Nonce | **différent à chaque requête**, vérifié sur deux appels |
| Parcours navigateur | **13 sur la console, 8 sur la vitrine** — dont « aucune erreur de console » sur dix écrans et le test d'hydratation : la preuve que les scripts s'exécutent toujours |
| Cas de garde neufs | 4 — dont un qui **tombe si quelqu'un ajoute `'unsafe-inline'`** aux scripts pour « faire marcher » quelque chose |
| Types, lint, unitaires, compilation | 398 et 86 cas, au vert |

### Une fausse alerte, de mon fait

Neuf parcours en échec sur `waitForURL`, tous ceux qui se connectent. C'était la
**limitation de débit que j'avais épuisée** — trente connexions par cinq minutes,
et j'avais enchaîné quatre exécutions du cahier de recette et trois séries de
parcours. Après la fenêtre : 13 sur 13. Les quatre qui passaient malgré tout
étaient ceux qui ne se connectent pas.

C'est la troisième fois cette semaine qu'un « échec » venait de mon propre rythme
d'essais. Le limiteur, lui, fait exactement son travail.

---

## 26 septembre 2026 (fin) — Le cahier de recette repasse à 75/75, et il est rejouable

Demande du cabinet : laisser iOS de côté et **valider l'ensemble des cas d'usage
conformément au cahier des charges**. L'instrument existe — `Docs/recette/`, un
registre de **75 cas d'usage** qui porte chacun sa preuve : exécutée à l'instant
contre la pile, ou déléguée à un test nommé de la suite.

### Il était impointable sur la pile de démonstration

Les deux adresses étaient **codées en dur** sur les ports du développement — 3011
et 8010 — dans `cas_usage.py` **et** dans `verifier_profils.py`. Le registre ne
pouvait donc pas viser la pile de démonstration, qui écoute 3100 et 8100, sans
éditer l'instrument de recette pour pouvoir l'exécuter.

Réglables désormais par `CGA_FRONT_RECETTE` et `CGA_API_RECETTE`, avec les ports
du développement pour défauts — c'est la convention que le projet applique déjà
partout ailleurs (`CGA_RACINE_*`, `CGA_API` du téléphone). Une seule variable pour
les deux fichiers, pour qu'ils ne puissent pas viser deux piles différentes.

### Le verdict, et les quatre cas qui tombaient

Premier passage : **54/54 en direct**, puis **72/75** au complet. Second passage :
**71/75** — deux exécutions, deux résultats. C'est le symptôme : **le registre
modifiait les données qu'il éprouvait.**

Aucun des quatre échecs n'était un défaut du produit :

| Cas | Ce que le registre disait | Ce qui se passait vraiment |
| --- | --- | --- |
| UC-68 | « une carte par obligation : False » | **L'assertion était fausse.** Une TVA mensuelle a une carte par PÉRIODE. Relevé : `IRPP_ACOMPTE` en août et en juillet, `CNPS` en juillet et en septembre. Et les états `PREUVE_ENVOYEE` venaient d'UC-69, qui tourne juste avant |
| UC-66 | « demande toujours OUVERTE : False » | La demande **était** ouverte. Au second passage, la réponse existait déjà : le premier envoi rend 409, et le corps du 409 ne porte pas le statut |
| UC-72 | « lien None envoyé » | **Un garde-fou du produit qui tient** : « 2 lien(s) déjà renvoyé(s) aujourd'hui à ce compte. Au-delà, chaque lien valide de plus est un risque. » Mes exécutions avaient consommé le quota du jour |
| UC-74 | « écart refusé : HTTP 409 » | L'écart existait. Ma relecture interrogeait `/conformite/pieces/{ref}/ecarts`, **qui n'existe qu'en POST** — 405, donc « introuvable » sur un écart pourtant posé. Le journal des dérogations est la seule lecture qui les liste |

### Ce qui a été corrigé, et pourquoi c'est l'instrument et non le produit

Les quatre cas sont désormais **rejouables** : un 409 sur un geste déjà fait est
reconnu comme la preuve que le domaine refuse le doublon, et non comme un échec.
UC-72 traite explicitement le 409 de la borne quotidienne comme une **réussite** :
exiger 201 faisait accuser le produit alors qu'il protégeait l'adhérent.

⚠️ **Un cahier de recette qui ne passe qu'une fois ne vaut presque rien**, et c'est
précisément ce qu'on découvre la veille d'une livraison : on le relance pour
montrer au client, et il tombe.

### Le verdict final

**75/75 cas d'usage validés**, sur une base **déjà modifiée par trois exécutions
précédentes** — c'est la preuve de la rejouabilité, pas une base vierge de
complaisance.

### Ce qui reste

- Les quatre corrections portent sur l'instrument. **Aucun défaut du produit n'a
  été trouvé par cette passe** — ce qui est le résultat qu'on espère, et qui ne
  valait d'être affirmé qu'après l'avoir mesuré quatre fois.
- Le cahier PDF (`cahier_de_recette.py`) n'a pas été régénéré : il ouvre une
  session par compte et la borne de trente connexions par cinq minutes est déjà
  bien sollicitée par ces quatre exécutions.

---

## 26 septembre 2026 (suite) — Le point bloquant de la livraison est levé

Le constat de la passe précédente : `ProvisionneurLocal` prend trois ports en
option et **substitue** l'étape quand le port manque. Il était câblé **sans aucun
des trois**. Toute ouverture de tenant se terminait donc avec le schéma, le
stockage et le compte administrateur sans effet — un client payé sans identifiant
ni lien d'activation.

C'était honnête, la substitution étant déclarée et l'écran la montrant depuis le
pas 93. Ce n'était pas livrable : **un second cabinet n'aurait pas pu ouvrir son
espace.**

### Ce qui était déjà là, et qu'il suffisait de relier

Rien à inventer. Les deux capacités existaient :

- `MagasinLocal` range les fichiers en `racine/<locataire>/xx/yy/clé`. Ouvrir le
  préfixe, c'est créer ce répertoire — et vérifier qu'on peut y écrire.
- `inviter_collaborateur` crée un compte et son jeton à usage unique.

### Trois refus du code, et ce qu'ils ont appris

⚠️ **Le garde-fou d'architecture.** J'avais posé les ports dans le contexte
Tenants. `test_architecture.py` a refusé : le graphe **interdit** aux Tenants de
connaître le Transverse. Le refus était juste — un port qui relie deux contextes
appartient à celui qui a le droit de voir les deux, pas au plus profond. Déplacé
dans `transverse/adaptateurs/sortant/ports_d_ouverture.py`.

⚠️ **Le garde-fou de cloisonnement.** Ma première version écrivait le compte du
client dans les dépôts **du cabinet** — la saga tourne dans l'unité de travail de
celui qui a confirmé l'encaissement. Le socle a refusé net : *« une écriture
croisée est un défaut, pas un cas limite »*. Le port ouvre désormais **sa propre
unité de travail sur le tenant du client**.

⚠️ **La recette du parcours.** J'avais écrit un port pour `SCHEMA_CREE` qui
vérifiait les politiques de cloisonnement. Quatre cas de bout en bout sont tombés :
les cas d'essai montent leur schéma par `create_all`, qui crée les tables mais
**pas** les politiques — seul Alembic les pose. Le port refusait donc d'ouvrir
dans tout environnement d'essai. Retiré : c'était une propriété **globale** de la
plateforme, que `/sante` rend déjà, et la vérifier à l'ouverture de chaque client
couplait son sort à l'état général de l'installation.

### Une décision, et son motif

L'étape `SCHEMA_CREE` est le vestige de la **décision D3, révisée** : le schéma
par tenant a été abandonné au profit d'une colonne `locataire` et des politiques
de lignes. Elle est donc substituée **sur toutes les installations**.

La compter comme un manque rendrait `utilisable` faux pour l'éternité : l'écran
dirait « l'espace n'est pas utilisable » à un client qui a son compte, son lien et
son stockage. `ETAPES_SANS_OBJET` l'exclut donc du calcul, et `manques_reels`
remplace la liste brute dans la route — citer une étape sans objet ferait croire
à un défaut au chargé de clientèle.

⚠️ **L'étape n'est pas retirée de `EtapeOuverture`** : les contextes de saga déjà
écrits en base portent `SCHEMA_CREE` dans `franchies`, et l'ôter demanderait une
reprise de données. C'est une décision à prendre avec le cabinet.

### Deux cas se substituent plutôt que de lever

La règle est écrite dans le provisionneur lui-même : *« le silence mentirait,
l'échec bloquerait, la substitution déclarée informe. »*

- **Adresse du titulaire absente** — il existe des événements déposés avant que la
  charge ne la transporte. Lever les ferait tourner jusqu'à la quarantaine.
- **Aucun courrier configuré** — vérifié **avant** de créer le compte. L'inverse
  laisserait un compte sans lien : un état à moitié fait, le pire des trois.

En revanche, un envoi **refusé** lève : le compte existe, et c'est le seul cas qui
mérite une saga en échec — elle se reprendra sans le recréer.

### Un détail qui n'en est pas un : le nom du titulaire

Une demande commerciale porte **un seul** champ de nom : « Jean-Paul NKOA », ou
« NKOA Jean-Paul ». Le découper supposerait un ordre, et au Cameroun le nom de
famille précède souvent le prénom. Se tromper misnomme un client dès son premier
courriel, et le compte garde l'erreur.

`Compte` exige les deux champs. On y met donc le nom tel qu'il a été donné, dans
les deux, et le titulaire corrigera à l'activation — il est le seul à savoir. Le
nom rendu deux fois est visible, donc corrigible ; un découpage faux passe
inaperçu.

### Vérifié

| Contrôle | Résultat |
| --- | --- |
| `test_un_visiteur_devient_un_tenant` | **passe avec les ports réels** : le visiteur obtient un tenant ACTIF, un préfixe de stockage et un compte administrateur avec son lien |
| 13 cas neufs sur les ports | dont le rejeu, qui n'envoie pas un second lien |
| Suite serveur | relancée |
| `ruff` | propre |
| L'API en service | démarre avec les deux ports branchés |
| La route d'ouverture, en direct | ne rapporte plus que les **manques réels** |

### Ce qui reste

- **Le tenant ouvert le 23 septembre reste inutilisable** : il a été ouvert avant
  le branchement, et ses deux étapes ont été réellement substituées. Rien ne le
  reprend automatiquement — c'est voulu, une reprise de saga sur un tenant actif
  est une décision.
- **Le courriel d'activation part sur `adresse_publique`**, pas sur le
  sous-domaine du cabinet. Le jour où la passerelle le résout, c'est une ligne à
  changer, et le commentaire le dit d'avance.
- **Le premier administrateur porte son nom deux fois** jusqu'à ce qu'il le
  corrige.

---

## 26 septembre 2026 — Un écran pour ce que la machine endure, et un fichier que j'ai écrasé

Demande du cabinet, à l'approche de la livraison : l'inventaire de ce qui est
opérationnel et éprouvé, **et une interface de surveillance des services et de
la charge**.

### Ce qui existait, et ce qui manquait

L'écran d'exploitation montrait ce qui **fonctionne** : services inscrits, boîte
d'envoi, quarantaine, travaux de fond. Il ne montrait rien de ce que la machine
**endure** : mémoire, processeur, connexions de base, latences, taux d'erreur.

Or c'est exactement ce qu'on regarde en premier quand « c'est lent », et la
seule chose dont on ne disposait pas.

### Livré : `GET /transverse/charge` et son panneau

| Bloc | Ce qu'il donne | Pourquoi d'abord celui-là |
| --- | --- | --- |
| **Requêtes servies** | médiane, 95e centile, débit, taux d'erreur, réponses par famille, cinq routes les plus lentes | « Est-ce lent pour tout le monde, ou sur une route ? » se tranche là |
| **Base de données** | aller-retour, connexions employées sur maximum, **bassin employé**, taille | Le bassin sature en premier : chaque requête y prend une connexion pour la durée de sa transaction, et un bassin plein fait attendre **sans qu'aucune erreur ne soit rendue** |
| **Cette instance** | mémoire résidente, fils, temps processeur, durée de service, charge moyenne | En dernier, parce qu'on y arrive rarement |

L'ordre des blocs suit l'ordre du **diagnostic**, pas celui des couches
techniques.

### Quatre décisions, et leur raison

- **Aucune dépendance nouvelle.** `psutil` ferait ce travail en trois lignes ; il
  n'est pas déclaré, donc pas dans l'image. L'ajouter pour un écran de
  surveillance mettrait une bibliothèque de plus dans la chaîne
  d'approvisionnement d'un produit qui manipule la comptabilité d'un tiers.
  `/proc` est toujours là, et c'est de là que `psutil` lit lui-même.
- **L'anneau est borné à mille passages.** Une liste qui grandirait à chaque
  requête est une fuite de mémoire déguisée en mesure : sur un serveur qui tourne
  trois mois, elle finit par peser plus que l'application.
- **La sonde de santé n'est pas mesurée.** Docker et Kubernetes l'appellent
  toutes les cinq secondes : comptée, elle représenterait la moitié de l'anneau
  et écraserait les latences réelles du travail du cabinet.
- **La portée est écrite dans la réponse ET à l'écran.** Par instance, depuis son
  démarrage, sans historique. Un exploitant qui croirait lire l'ensemble du parc
  — deux répliques derrière un répartiteur — verrait la moitié du trafic et
  doublerait ses estimations.

⚠️ **Ce n'est pas un système de métriques**, et le dire fait partie de la
livraison. Pas d'historique, pas d'agrégation, pas d'alerte. Ce que cela donne
et qui n'existait pas : « à cet instant, sur cette instance, la médiane est à
40 ms et 2 % des requêtes échouent », sans aucune infrastructure à installer.

### ⚠️ Une faute de ma part : j'ai écrasé vingt-cinq cas

J'ai créé `tests/test_charge.py` **sans vérifier qu'il existait déjà**. Il
existait : vingt-cinq cas sur l'**évaluation de charge d'un dossier** — le poids
de travail qu'un adhérent représente pour le cabinet, contexte Portefeuille.

« Charge » a deux sens dans ce produit, et je n'ai vu que le mien.

Ce qui est grave n'est pas l'écrasement : c'est que **la suite est restée
verte**. 3 820 cas avant, 3 800 après — aucun échec, aucun saut, et un total qui
baisse de vingt pendant que j'en ajoutais douze. Je ne l'ai vu qu'en comparant
deux exécutions à la main.

Restauré depuis git ; mon fichier s'appelle désormais
`test_charge_de_la_plateforme.py`, et son en-tête explique les deux sens du mot.
Un balayage des autres fichiers créés cette semaine n'en a trouvé aucun dans le
même cas.

**Ce que j'en retiens** : un fichier de cas créé sans vérifier son existence est
une suppression silencieuse. Le nombre total de cas d'une suite mérite d'être
suivi d'une exécution à l'autre, au même titre que les échecs.

### Vérifié

| Contrôle | Résultat |
| --- | --- |
| `avancement_des_ecrans` | **100 %**, 233 gestes sur 233, zéro route orpheline |
| `contrat_des_ecrans` | 302 appels justes sur 303 |
| Console | 398 cas unitaires, types, lint, compilation |
| Parcours navigateur | 11 sur la console (dont 2 sur le monitoring), 8 sur la vitrine |
| L'écran, en direct | médiane, centiles, bassin et mémoire réels, zéro erreur de console |

---

## 25 septembre 2026 (fin de nuit) — Je me trompais depuis cinq passes, et le produit savait

⚠️ **Cette entrée corrige ce que j'ai rapporté au cabinet à cinq reprises.**

Je signalais, depuis plusieurs jours, « un client qui paie par la voie
commerciale obtient un locataire mais ni compte ni lien d'accès », et je
présentais cela comme une **décision de conception en attente**. C'était faux.

### Ce que le produit fait réellement

La saga d'ouverture franchit **sept étapes**, dont `ADMINISTRATEUR_CREE` : « le
compte administrateur existe, avec son jeton d'activation à usage unique ». Le
parcours est complet, et depuis longtemps.

Quand l'infrastructure manque — ce qui est le cas de la pile de démonstration —
une étape est **substituée** : traversée sans rien faire, et le domaine
l'inscrit. Relevé en base le 25 septembre sur le seul dossier payé :

    franchies : SLUG_RESERVE, LIGNE_CREEE, SCHEMA_CREE, METIER_AMORCE,
                STOCKAGE_OUVERT, ADMINISTRATEUR_CREE, PRET
    etapes_substituees : SCHEMA_CREE, STOCKAGE_OUVERT, ADMINISTRATEUR_CREE

Il n'y avait donc aucune décision à prendre : le geste existe, il est écrit, et
il marche là où l'infrastructure existe.

### Le vrai défaut, bien plus étroit

Le domaine écrit lui-même, dans `substitution.py` :

    « Le tenant existe, son sous-domaine répond, et il n'a ni schéma, ni
    stockage, ni compte administrateur. **Annoncer au client un espace ouvert
    dans ce cas serait un mensonge que sa première connexion découvrirait.** »

Cette information était **calculée, stockée, et exposée nulle part**. Aucune
route HTTP ne la rendait. Et la console annonçait, dans tous les cas :

    Payé le 23/09/2026 · espace « essai-paiement-0062 ».

Le chargé de clientèle raccrochait en disant au client que son espace était
ouvert. Le client le découvrait à sa première connexion.

### Livré

- **`GET /acquisition/dossiers/{reference}/ouverture`** — rend `demarree`,
  `terminee`, **`utilisable`**, `etapes_substituees`, `slug`, `dernier_echec`.
  ⚠️ `terminee` n'est pas `utilisable` : une saga terminée avec trois étapes
  substituées est terminée, et l'espace n'est pas utilisable. La route emploie
  `ouverture_reellement_complete` du **domaine** plutôt que de recopier la
  règle, qui divergerait.
- ⚠️ **Aucune erreur quand la saga n'a pas encore tourné.** Le relais publie
  toutes les cinq secondes ; entre la confirmation et le premier tour, la saga
  n'existe pas. Rendre 404 afficherait une erreur au collaborateur qui vient de
  réussir son geste : on rend `demarree: false`, que l'écran sait dire.
- **Le panneau « Règlement » de la fiche commerciale** dit maintenant l'état
  réel, en quatre cas : pas encore démarrée, en cours, ouverte et utilisable, ou
  — le cas qu'il fallait rendre visible — « l'espace existe, mais il n'est pas
  utilisable ; le client n'a ni identifiant ni lien d'activation : ne lui
  annoncez pas que son espace est ouvert ».
- **6 cas serveur**, dont trois paramétrés qui figent `terminee` ≠ `utilisable`,
  le troisième reproduisant exactement l'état relevé en démonstration.

Vérifié en direct, dans un vrai navigateur, sur le dossier réellement payé.

### Un défaut que J'AVAIS introduit, relevé par l'outil du projet

`contrat_des_ecrans` parcourt **tous** les fichiers TypeScript, cas d'essai
compris, et confronte chaque appel aux routes du serveur. Mes 398 cas de console
employaient des adresses inventées pour l'exemple — `/comptabilite/ecritures`,
`/portefeuille/dossiers`, `/referentiel/regles` — qui n'existent pas.

**Mon banc d'essai cassait l'outil de vérification du projet.** Sept adresses
corrigées, et écrites sous forme **paramétrée** (`${DOSSIER}`) parce que l'outil
lit la forme de l'adresse, pas sa valeur. L'outil repasse à **301 appels justes
sur 302**, le seul restant étant le chemin dynamique connu.

### Et un garde-fou qui a fait son travail

`test_les_routes_du_parcours_sont_montees` porte une liste **close** des routes
sous `/acquisition`. Ma route neuve l'a fait tomber — c'est exactement ce qu'il
est là pour faire : obliger à décider si une route est publique comme le dépôt
de demande, ou protégée comme les autres. Décision inscrite : **protégée**,
`LIRE_PROSPECT`, parce qu'elle parle d'un client identifié.

### Vérifié

| Contrôle | Résultat |
| --- | --- |
| Suite serveur | 3 825 cas |
| Console | 398 cas, types, lint, compilation |
| `avancement_des_ecrans` | **100 %**, 232 gestes sur 232, zéro route orpheline |
| `contrat_des_ecrans` | 301 sur 302 |
| `ruff` | propre |
| L'écran, en direct | dit la vérité sur le dossier payé |

### Ce que j'en retiens, et qui dépasse ce défaut

J'ai rapporté cinq fois une conclusion tirée d'une **observation de la
démonstration**, sans lire le code qui la produisait. Le produit portait la
réponse, écrite en toutes lettres dans un docstring, et j'ai demandé au cabinet
de trancher une question qui n'existait pas.

---

## 25 septembre 2026 (nuit, très tard) — Le dernier trou : un vrai navigateur

Le seul trou de **nature** différente restait : aucun parcours réel. Tout le
banc — 4 531 cas — est du même tissu : de la logique éprouvée hors navigateur.

### Ce que ce harnais attrape, et que rien d'autre ne peut voir

**Console, 9 parcours. Vitrine, 8.** En moins d'une minute à eux deux.

| Ce qui est attrapé | Pourquoi les cas unitaires ne le voient pas |
| --- | --- |
| L'hydratation du formulaire de saisie | Un composant peut rendre juste en DOM simulé et ne **jamais s'hydrater** en vrai : la page reste figée, le pied des totaux n'affiche rien, et la compilation est parfaite |
| Le témoin de session réellement posé | `HttpOnly`, `SameSite`, `Secure` vérifiés sur le témoin que **Chrome a reçu**, pas sur l'objet qu'une doublure a rendu |
| Une page qui répond 200 et n'affiche rien | C'est exactement ce que rend un composant serveur qui lève |
| Les erreurs de console sur dix écrans | **Aucune**, mesuré. Une seule signifierait de l'hydratation cassée |
| Les en-têtes de sécurité **servis** | Mesurés sur la réponse du conteneur, et non sur la configuration : la seule façon de voir qu'un en-tête déclaré n'est pas servi |
| Le 404 sur un dossier hors périmètre | Un 403 confirmerait son existence |
| L'hydratation de l'estimateur | `estimer()` a 20 cas, mais un estimateur figé rend les mêmes chiffres quoi qu'on change et **paraît fonctionner** |
| Le champ « capital » qu'on peut effacer | Le défaut du 11 août ne se voit que dans un navigateur |
| Les images réellement **chargées** | Les cas unitaires vérifient que le fichier existe ; celui-ci vérifie que le navigateur le charge, y compris en bas de page |

### Trois décisions, et leur raison

- **Séparé de `npm test`.** Il exige la pile en service ; un banc unitaire qui
  exigerait Docker ne tournerait ni sur le poste d'un nouveau venu, ni dans la
  chaîne. Il se lance par `npm run essai-reel`.
- **Le Chrome du poste**, pas celui que l'outil télécharge. 170 Mo en moins à
  chaque montée de version, et surtout : c'est le navigateur que le cabinet
  emploie. Un parcours qui passe sur un Chromium d'outil et casse sur le Chrome
  du poste ne sert à rien.
- **Il n'écrit rien.** Les données d'essai s'accumulent déjà dans la base de
  démonstration et personne ne les nettoie. La vitrine, elle, dépose de VRAIES
  demandes commerciales : un parcours qui les enverrait créerait un prospect à
  chaque exécution, et le chargé de clientèle rappellerait un fantôme. Ce qu'on
  perd en couverture, on le gagne en pouvoir tourner cent fois sans trace.

### Deux fausses alertes, toutes deux de mon fait

- **« Le tableau de bord n'a pas de titre. »** Faux : mon script lisait le titre
  avant que le document ne soit remplacé après la redirection. Les treize pages
  en ont un.
- **« Une requête d'image ne finit jamais. »** Faux aussi : les images sous la
  ligne de flottaison sont en chargement **paresseux**, et le navigateur retient
  leur requête tant qu'on ne descend pas. `networkidle` n'est donc jamais
  atteint, et l'attente expire sur une page saine — l'optimiseur rend ces images
  en **4 ms**, mesuré. Le parcours descend maintenant la page, ce qui déclenche
  le chargement paresseux et le vérifie du même coup.

Les deux se sont vues en mesurant, pas en supposant. C'est la deuxième fois
cette semaine qu'un « défaut » trouvé au navigateur était un défaut de
l'instrument.

### L'état du banc, au complet

| | Cas |
| --- | --- |
| Serveur | 3 814 |
| Console, unitaires | 398 |
| Téléphone | 233 |
| Vitrine, unitaires | 86 |
| **Parcours navigateur** | **17** |
| **Total** | **4 548** |

### Ce qui reste

- **Le parcours n'écrit pas.** Un parcours complet — saisir, valider, clôturer —
  demanderait un jeu de données jetable, donc une base de démonstration qu'on
  remonte à chaque exécution. C'est le pas suivant si le cabinet le veut.
- **Soixante-douze composants sur soixante-quinze** non couverts en unitaire.
- **Dix fichiers d'actions**, petits et sans calcul métier.

---

## 25 septembre 2026 (nuit, fin) — Les composants, là où les tests de logique ne voient rien

Basculé des actions vers les **composants**, comme proposé : les dix fichiers
d'actions restants sont de petits passe-plats, et le rendement de les couvrir
était devenu faible. Les défauts d'affichage, eux, ne se voient nulle part
ailleurs.

### Trois composants, choisis pour leur portée

| Composant | Cas | Le défaut que ces cas empêchent |
| --- | --- | --- |
| `FormulaireEcriture.tsx` | 18 | **Un total qui afficherait « équilibrée » sur une écriture qui ne l'est pas.** Le pied calcule l'écart à chaque frappe : c'est ce qui remplace la bande de calculatrice. Un total qui ignorerait « 1 500,75 » — espaces et virgule — rassurerait à tort, et c'est le pire défaut possible ici |
| `ListeConstats.tsx` | 17 | Un constat **sans sa référence légale**. C'est la contrainte forte de la fiche : devant un adhérent qui demande « de quel droit refusez-vous ma facture ? », le comptable lit l'article. Sans lui, le refus est indéfendable et le cabinet cède |
| `Tableau.tsx` | 16 | **Une grille différente entre l'en-tête et les lignes** : un montant se retrouve sous le libellé « Date », et le comptable lit de travers sans s'en apercevoir. Ce fichier est employé par presque tous les écrans — un défaut n'y touche pas un écran, il en touche trente |

**51 cas neufs.** Console : **398**, tous verts.

### Ce que l'écriture de ces cas a appris

- **`aria-live="polite"` sur le pied des totaux** : un comptable aveugle entend
  « écart 10 000 au débit » au moment où il l'introduit, et non dix lignes plus
  loin. Le cas le fige, parce que c'est le genre d'attribut qu'on retire en
  refondant un pied de page.
- **La bibliothèque de rendu NORMALISE les blancs.** L'espace insécable étroite
  — celle qui empêche un montant de se couper en fin de ligne — y devient une
  espace ordinaire. Trois cas écrits avec `getByText` ne voyaient donc pas ce
  qu'ils croyaient vérifier ; ils lisent maintenant le texte brut du document.
  Au passage : `toLocaleString("fr-FR")` emploie la même espace fine que
  `ESPACE_FINE`, donc les totaux du pied sont cohérents avec les montants
  formatés ailleurs.
- **Le compilateur a refusé mes données d'essai**, et il avait raison : j'avais
  écrit `libelle` là où le type dit `intitule`. Un `as Journal[]` de complaisance
  aurait compilé, serait passé, et aurait masqué le jour où le contrat du
  backend change. Les données d'essai sont désormais typées sans aucun `as`.

### Ce qui reste

- **Soixante-douze composants sur soixante-quinze** restent non couverts, mais
  les trois pris sont les plus employés et les plus porteurs de règles.
- **Dix fichiers d'actions**, tous petits et sans calcul métier.
- **Aucun parcours de bout en bout dans un navigateur** — c'est désormais le
  seul trou de nature différente.

---

## 25 septembre 2026 (nuit, suite) — Les actions d'écriture sous filet à 85 %

Suite de la descente. Trois fichiers ce tour-ci, aucun défaut de production
trouvé — ce qui est le résultat qu'on espère quand on descend une liste par
risque décroissant.

### Ce qui a été couvert

| Fichier | Cas | Le défaut que ces cas empêchent |
| --- | --- | --- |
| `actions-creations.ts` | 18 | Un identifiant de guichet porté **sans sa date**. La date mesure le délai du guichet : c'est elle qui permet de dire au fondateur suivant « le RCCM prend trois semaines ». Et l'accord des clés — `patente_obtenue_le` au féminin, `rccm_obtenu_le` au masculin — dont l'erreur ferait ignorer une date en silence |
| `actions-social.ts` | 15 | **Une embauche à moitié faite.** Le salarié est créé, puis son contrat ; si le second échoue, le salarié existe déjà. Sans le message qui le dit, le gestionnaire recommence toute la saisie et se heurte à « matricule déjà pris », qui ressemble à un bogue du produit |
| `actions-souscription.ts` | 11 | Un prix fixé à **zéro**, qui rendrait la prestation gratuite sans que personne ne l'ait décidé — et que le backend encaisserait comme un paiement abouti |

**44 cas neufs.** Console : **347**, tous verts, types, lint et compilation
compris.

### Où en est la couverture des actions

**Seize fichiers sur vingt-six, mais 3 723 lignes sur 4 364 — 85 %.** Les dix
qui restent totalisent 641 lignes : exploitation, conformité-revue, échange,
règles-du-cabinet, pilotage, lettrage, règles, pilotage-charge, notifications,
rapport-mensuel. Aucun ne dépasse 118 lignes, et aucun ne porte de calcul
métier — ce sont des passe-plats vers le backend.

### Un défaut de mes propres cas

Une doublure de `fetch` à qui j'ai passé un corps brut là où elle attend
`{ corps }` : l'appel rendait un objet vide, et le cas échouait sur une lecture
de champ absent. Corrigé en une ligne, mais il vaut d'être noté : une doublure
mal formée fait échouer un cas pour une raison étrangère à ce qu'il mesure, et
c'est le genre d'échec qu'on met dix minutes à lire.

### Ce qui reste

- **Dix fichiers d'actions**, tous petits et sans calcul métier.
- **Un seul composant couvert sur soixante-quinze.**
- **Aucun parcours de bout en bout dans un navigateur.**

---

## 25 septembre 2026 (nuit) — Un mois « 2026-00 » ouvrait une revue qui finissait avant de commencer

Suite de la descente des actions serveur. Trois fichiers ce tour-ci, et un vrai
défaut trouvé **en écrivant le cas**, pas en relisant le code.

### Le défaut : un motif de mois trop permissif

`actions-revue.ts` et `actions-rapport-mensuel.ts` validaient le mois avec
`/^\d{4}-\d{2}$/` — quatre chiffres, un tiret, deux chiffres. Ce motif accepte
`2026-00`, `2026-13`, `2026-99`. Le mois sert ensuite à **borner une période** :

| Mois saisi | Période calculée |
| --- | --- |
| `2026-13` | du 2026-13-01 au 2027-01-31 |
| `2026-00` | du 2026-00-01 au **2025-12-31** — la période finit avant de commencer |
| `2026-99` | du 2026-99-01 au 2034-03-31 — **huit ans de revue** |

Le backend aurait refusé « 2026-99-01 » comme date invalide. Mais l'écran aurait
envoyé du charabia au lieu de refuser, et le collaborateur aurait lu un message
de schéma là où il attend « choisissez le mois ».

⚠️ **Trois pages du même dépôt employaient déjà le motif strict.** Deux actions
employaient le lâche. C'est l'écart qui ne se voit qu'en mettant les deux côte à
côte — et un test qui essaie « 2026-13 » les met côte à côte.

Le motif vit désormais à un seul endroit, `MOIS_VALIDE` dans `saisie.ts`, avec
le tableau ci-dessus écrit à côté.

### Ce qui a été couvert

| Fichier | Cas | Le défaut que ces cas empêchent |
| --- | --- | --- |
| `actions-referentiel.ts` | 14 | Un taux envoyé en **texte** au lieu d'un nombre : « 9 » serait alors supérieur à « 19,25 ». Et l'inverse — une expression régulière convertie en nombre, qui ferait accepter n'importe quel NIU. C'est le principe n° 1 du projet qui se joue là : aucune valeur légale codée en dur, donc toutes passent par cet écran |
| `actions-revue.ts` | 13 | Le mois ci-dessus, et la borne de fin : 28, 29, 30 ou 31 selon le mois **et** l'année. Une borne fausse d'un jour laisse l'écriture du 31 hors de la revue — précisément celle qu'on passe en fin de mois |
| `actions-rapprochement.ts` | 11 | Un solde **négatif** refusé, ce qui rendrait l'écran inutilisable sur tout compte en découvert. Et un relevé décodé en texte : les libellés en cp1252 d'une banque camerounaise deviendraient illisibles, et le comptable ne le verrait qu'au rapprochement |

**38 cas neufs.** Console : **303**, tous verts, types, lint et compilation
compris.

### Où en est la couverture

Treize fichiers d'actions sur vingt-six, mais **3 214 lignes sur 4 364** — près
des trois quarts, et les treize plus risqués. Les treize qui restent font
1 150 lignes, aucun ne dépassant 204.

### Ce qui reste sur ce volet

- **Treize fichiers d'actions** sans filet : souscription (console), créations,
  social, exploitation, conformité-revue, règles, lettrage, échange, pilotage,
  notifications, règles-du-cabinet, pilotage-charge, rapport-mensuel.
- **Un seul composant couvert sur soixante-quinze.**
- **Aucun parcours de bout en bout dans un navigateur.**

---

## 25 septembre 2026 (fin) — Six écrans d'écriture mis sous filet

Demande : continuer les tests pas à pas. J'ai poursuivi l'inventaire des actions
serveur, en descendant la liste par risque et par taille.

### Ce qui est couvert, et pourquoi dans cet ordre

Les six fichiers pris ce tour-ci sont ceux qui **écrivent** et dont l'erreur ne
se voit pas tout de suite :

| Fichier | Cas | Le défaut que ces cas empêchent |
| --- | --- | --- |
| `actions-administration.ts` | 22 | Une portée envoyée `[]` en croyant dire « tout le cabinet ». `null` = tout le portefeuille, une liste — **même vide** — restreint. C'est la même distinction qu'`acces.ts`, la plus coûteuse du produit |
| `actions-collecte.ts` | 21 | Une photo de plus de 20 Mo refusée par « erreur 413 » au lieu de « photographiez en qualité normale ». Et le message de rejeu : la file hors ligne rejoue par construction, l'adhérent doit lire « c'était déjà arrivé » et non croire qu'il a envoyé deux fois |
| `actions-acquisition.ts` | 21 | Un lien de proforma construit sur le domaine de production : le client reçoit une adresse où sa proforma n'existe pas. Et l'origine, qui vient de la page, bornée à quarante caractères |
| `actions-obligations.ts` | 16 | **L'heure d'un accusé de dépôt.** Un dépôt fait le 15 à 00 h 30 à Douala vaut le 14 à 23 h 30 en UTC. Une conversion oubliée, et un dépôt dans les temps est consigné hors délai — ou l'inverse, ce qui est pire : le cabinet croit son client en règle |
| `actions-portefeuille.ts` | 16 | Une admission au Centre sans source de chiffre nommée : devant un contrôle, l'attestation ne vaut rien, et c'est le Centre qui engage sa responsabilité |
| `actions-ecarts.ts` | 13 | Un « écart enregistré » sec, qui laisse croire l'anomalie levée alors que le constat **compte encore** faute de second regard. Le réviseur passe à la suite avec une anomalie active |

**109 cas neufs.** Console : **265**, tous verts, types, lint et compilation
compris.

### Où en est la couverture des actions

Dix fichiers sur vingt-six — mais ce sont les dix plus gros et les plus
risqués : **2 762 lignes couvertes sur 4 364**, soit près des deux tiers. Les
seize qui restent totalisent 1 602 lignes, aucun ne dépassant 204.

### Deux défauts de mes propres cas, corrigés

- Un canal de réception écrit « GUICHET » au lieu de « DEPOT_CABINET ». J'avais
  deviné la valeur au lieu de lire le vocabulaire. Le cas qui en est sorti est
  meilleur que celui que j'écrivais : il vérifie désormais **qu'aucun canal
  inventé ne passe**, ce qui est l'invariant qui compte.
- Un accès à `.motif` sur une union discriminée, que `vitest` acceptait et que
  `tsc` a refusé. La lecture passe maintenant par une fonction qui restreint le
  type et **lève** si le résultat n'est pas un refus : un cas d'essai laxiste
  masque le jour où la forme change.

### Ce qui reste sur ce volet

- **Seize fichiers d'actions** encore sans filet, tous de taille moyenne.
- **Un seul composant couvert sur soixante-quinze.**
- **Aucun parcours de bout en bout dans un navigateur.**

---

## 25 septembre 2026 (suite) — « Aujourd'hui » valait la veille, cinq fois recopié

Demande : continuer les tests pour se rassurer que tout est complet. J'ai visé
ce qui écrit dans l'ERP sans filet, et le premier fichier ouvert a rendu un
défaut plus large que celui de la veille.

### Le même fuseau, mais cette fois sur ce qui part au backend

L'entrée précédente corrigeait l'**affichage**. Celle-ci corrige le **calcul** :

- **`aujourdhui()`** rendait `new Date().toISOString().slice(0, 10)`, c'est-à-dire
  le jour **UTC**. Ces pages sont des composants serveur : elles tournent dans le
  conteneur. Entre minuit et une heure du matin à Douala, « aujourd'hui » valait
  donc la veille — et cette date part au backend comme `a_la_date`, le paramètre
  qui décide de ce qui est échu, de ce qui est en retard, de quel exercice est
  courant. Une heure par jour, la console lit le portefeuille à la mauvaise date.
- **`moisPrecedent()`** était **recopié dans cinq endroits**, tous calculant en
  UTC. Le premier du mois entre minuit et une heure, « le mois écoulé »
  désignait **l'avant-dernier mois** — le jour précis où le cabinet ouvre la
  période déclarative. La clôture, la relance des pièces, le rapport mensuel et
  le rapprochement proposaient tous le mois d'avant.
- **La date par défaut d'une écriture comptable** venait de la même source. Une
  écriture saisie après minuit était datée de la veille, et tombait dans le
  mauvais mois le premier du mois.
- **Le constat de dépôt de TVA** envoyait `a_la_date` en UTC : la date de dépôt
  est précisément ce qui prouve qu'on a respecté l'échéance.

Deux fonctions partagées — `jourADouala` et `moisPrecedentADouala`, avec
**l'instant injectable**, sans quoi on ne peut éprouver la bascule de minuit
qu'en changeant l'horloge de la machine. Les cinq copies supprimées.

### Ce qui a été couvert, et pourquoi ces fichiers-là

| Fichier | Le défaut que ces cas empêchent |
| --- | --- |
| `actions-comptabilite.ts` | Un « 1 500,75 » envoyé tel quel, refusé par un message de schéma — alors que le comptable a saisi ce qu'on lui a appris à saisir. Et `lignes_offertes`, qui vient du formulaire donc du client, borné à cent : une requête fabriquée annonçant un million de lignes ferait boucler le serveur |
| `actions-cloture.ts` | Un premier envoi qui appliquerait au lieu de contrôler. **Une clôture ne se rouvre pas** : seul « oui » applique, et rien d'approchant |
| `actions-second-facteur.ts` | Une réinitialisation sans motif écrit ni confirmation. C'est le geste qu'un attaquant obtient par téléphone : « j'ai perdu mon téléphone » |
| `actions-souscription.ts` (vitrine) | Un NIU envoyé avec ses espaces devant un prospect qui vient de remplir huit champs. Et des champs d'identité fournis par la page, qui permettraient de déposer une demande **au nom d'un tiers** sous la référence de son devis |
| `obligations.ts`, `fiche-dossier.ts`, `rapprochement.ts` | Un dernier jour de mois écrit à la main — on oublie février bissextile. Et un signe de mouvement inversé, qui fait « équilibrer » un rapprochement avec un écart du double du montant |

**Console 156 cas, vitrine 86.** Types, lint et compilation au vert sur les deux.

### Une précision sur le point en attente de décision

En écrivant les cas de la vitrine, j'ai trouvé `activerUneSouscription` : le
geste ouvre l'accès après vérification d'identité écrite, coche de confirmation,
et nomme la personne à qui l'accès vient d'être ouvert. **Il existe déjà, et il
marche** — mais sur la voie **souscription** (libre-service), pas sur la voie
**acquisition** (proforma commerciale).

Le constat signalé depuis plusieurs passes tient donc, mais il change de nature :
ce n'est plus une question de conception, c'est une transposition. Le patron est
écrit, éprouvé, et se lit dans `erp-cga-vitrine/app/lib/actions-souscription.ts`.

### Ce qui reste sur ce volet

- **Un seul composant couvert sur soixante-quinze.** Les cas portent sur la
  logique, pas sur le rendu.
- **Vingt-trois fichiers `actions-*.ts` restent sans filet** côté console.
- **Aucun parcours de bout en bout dans un navigateur.**

---

## 25 septembre 2026 — L'ordonnanceur avait l'air mort, et c'était l'écran qui mentait

Volet jamais éprouvé : **la mécanique asynchrone** — boîte d'envoi, relais,
ordonnanceur. Tout le reste en dépend : l'ouverture d'un locataire payé, les
relances, les rappels d'échéance.

### L'état, qui est bon

| Contrôle | Résultat |
| --- | --- |
| Boîte d'envoi | 17 événements, **tous publiés**, 0 en attente, 0 tentative, 0 échec |
| Quarantaine | vide |
| Six travaux inscrits | tous dans leur cadence |
| Relais (cadence 5 s) | a avancé de 20 s exactement pendant un relevé de 20 s |

Le socle tourne, et il tournait tout seul : un `DossierRepris` daté de 04 h 39
ce matin, sans que personne ne lance rien.

### Mais j'ai d'abord cru qu'il était arrêté depuis une heure

L'écran d'exploitation — et la route qui l'alimente — rendent `termine_le` en
**UTC, sans marqueur de fuseau**. `horodatageCourt` découpait la chaîne ISO sans
rien convertir. À 11 h 07 heure de Douala, le tableau affichait « 10:06 » pour un
relais passé deux secondes plus tôt.

La première réaction devant cela est la mauvaise : **on relance un service qui
tourne**. J'y suis tombé, et c'est bien l'exploitant du cabinet qui y tombera.

Le contrat était pourtant écrit, côté serveur, dans `app/partage/horloge.py` :
« tout est horodaté en UTC, et **la conversion à l'affichage est l'affaire de
l'interface** ». Les interfaces ne la faisaient pas.

### Trois endroits, trois gravités

- **Le journal d'audit** affichait l'UTC brut **avec l'heure**, sans dire lequel.
  C'est le registre qui fait foi : « 20:09:43 » pour une action faite à 21:09:43.
  Une heure sans fuseau n'est pas opposable. Converti, et la colonne s'intitule
  désormais « Horodatage (Douala) » — le fuseau dans l'intitulé n'est pas
  cosmétique.
- **Les trois formats de date** (`dateLongue`, `dateCourte`, `periode`) lisaient
  le jour d'un instant UTC. Entre 23 h et minuit UTC — donc entre minuit et une
  heure du matin à Douala — tout s'affichait **daté de la veille**. Sur un accusé
  de dépôt, un jour faux est la preuve qu'on a déposé à temps.
- **Le téléphone**, même défaut : `DateTime.parse` sans `Z` interprète la chaîne
  dans le fuseau de l'appareil. Une pièce déposée à 00 h 30 apparaissait la
  veille dans l'historique, et basculait dans le **mois précédent** le premier du
  mois.

⚠️ **La distinction qui commande la correction : une date n'est pas un instant.**
`2026-08-15` est une échéance — elle ne se convertit pas, le 15 août est le 15
août partout. `2026-08-15T23:30:00` est un instant UTC, et c'est déjà le 16 à
Douala. Les formats regardent donc si la valeur porte une heure.

### Un défaut préexistant trouvé en écrivant le cas

Une date illisible rendait « NaN/NaN/NaN ». Même famille que le montant absent
affiché « 0 » de l'entrée précédente : les trois formats rendent maintenant un
tiret, qui se lit « on ne sait pas ».

### Livré

- `depuisUtc` dans `heure-douala.ts` (console), miroir Dart
  `lib/domaine/heure_douala.dart` (téléphone) ;
- les trois formats de date corrigés dans **les deux** dépôts web, qui les
  partagent ;
- le journal d'audit converti et son intitulé rendu explicite ;
- **31 cas neufs** : 22 sur les formats de chaque interface, 12 sur l'heure côté
  console, 9 côté téléphone. Les cas mobiles sont le miroir des cas web — si une
  interface décale et l'autre non, l'adhérent voit son dépôt daté du 15 sur son
  téléphone et du 16 sur le site, et doute de tout le reste.

### Ce qui reste sur ce volet

- **Le fuseau n'est écrit que dans un intitulé de colonne**, celui de l'audit.
  Ailleurs, l'heure est juste mais muette sur son fuseau. Acceptable tant que le
  cabinet est à Douala ; à revoir le jour d'une antenne ailleurs.
- **Le serveur rend toujours des horodatages sans marqueur.** Poser un `Z` au
  contrat le rendrait auto-descriptif et empêcherait ce défaut de revenir dans
  une interface neuve. C'est un changement de contrat, donc une décision.

---

## 24 septembre 2026 (nuit, suite) — Le cabinet au travail en même temps

Volet suivant : **le comportement sous concurrence**. Seules des latences
ponctuelles avaient été mesurées, une requête à la fois, ce qui ne dit rien de
ce qui se passe quand cinq collaborateurs travaillent ensemble.

### Ce qui a été mesuré, et comment

Cinq comptes réels, chacun sur **son propre travail** — la direction sur le
pilotage, l'administrateur sur les comptes et l'audit, le réviseur sur la
conformité et les doublons, les deux comptables sur le plan comptable et les
pièces. Mesurer des refus aurait embelli la moyenne : un 403 est rendu avant
toute lecture en base, donc très vite.

| De front | Requêtes | Durée | Médiane | p95 | Max | Statuts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 10 | 0,29 s | 10,5 ms | 27 ms | 170 ms | 200 partout |
| 5 | 50 | 0,95 s | 67 ms | 187 ms | 363 ms | 200 partout |
| 10 | 100 | 1,74 s | 148 ms | 270 ms | 406 ms | 200 partout |
| 20 | 200 | 3,22 s | 293 ms | 429 ms | 508 ms | 200 partout |
| 40 | 400 | 6,80 s | 637 ms | 786 ms | 967 ms | 200 partout |

**750 requêtes, aucune erreur, aucun dépassement de délai.** Le débit plafonne
vers 60 requêtes par seconde et la latence croît linéairement : c'est la machine
qui sature, pas l'API qui se dégrade. ⚠️ Poste de travail partagé avec la base,
les deux interfaces et le relais de courrier — ces chiffres ne valent pas pour
un serveur de production.

### Le contrôle qui justifiait l'exercice

Quarante requêtes concurrentes partagent un pool de connexions. **Si le
locataire était posé sur la connexion et non sur la transaction**, une requête
pourrait hériter de l'identité de la précédente : le tableau de bord d'un
comptable affiché à un autre, ou pire, les dossiers d'un autre cabinet. C'est le
défaut le plus grave qu'un essai de concurrence puisse révéler dans un produit
multi-locataire, et **il est invisible hors concurrence**.

Résultat : **400 requêtes concurrentes, 40 de front, zéro identité mélangée**,
un seul locataire rendu. Le socle multi-locataire tient sous charge.

### Deux fausses alertes, toutes deux de mon fait

- « 400 identités mélangées sur 400 » à la première passe. Mon contrôle comparait
  le champ `compte` — un identifiant interne, « C-001 » — à l'adresse
  électronique du compte. Il ne pouvait qu'échouer. L'identité se relève
  maintenant **au calme** avant la passe concurrente, puis se compare à
  elle-même.
- « 429 » à la relance suivante : la limitation de débit compte 30 connexions par
  tranche de cinq minutes et par adresse, et mes essais répétés l'avaient
  épuisée. La règle fonctionnait ; c'est l'outil qui devait attendre. Écrit en
  tête de `outils/concurrence_reelle.py`, parce que le prochain à le relancer
  trois fois croira à une régression.

Les deux se sont vues en lançant, pas en relisant.

### Livré

`erp-cga-backend/outils/concurrence_reelle.py` — le profil de travail par rôle,
les paliers, et le contrôle de cloisonnement sous concurrence.

### Ce qui reste sur ce volet

- **Aucune mesure d'endurance.** Sept secondes de charge ne disent rien d'une
  fuite de connexions ou de mémoire sur huit heures.
- **Aucune mesure sur du matériel de production**, ni derrière un mandataire.
- **Les écritures ne sont pas mesurées** — uniquement des lectures. Un essai
  concurrent en écriture demanderait un jeu de données jetable, et la base de
  démonstration n'en est pas un.

---

## 24 septembre 2026 (nuit) — Une sauvegarde qui paraît complète et ne contient rien

Suite des vérifications. Le volet suivant sur la liste des trous : **la
sauvegarde et la restauration, documentées mais jamais exercées**.

### L'état de départ

Aucune procédure. Une seule phrase, dans le fichier de composition : « une base
infogérée dont quelqu'un vérifie les sauvegardes ». « Quelqu'un » n'est pas une
procédure, et pour un produit qui détient la comptabilité de tiers, c'est le
genre d'absence qui ne se paie qu'une fois.

### Le piège, mesuré et non supposé

La base porte 35 politiques de cloisonnement. Une sauvegarde prise sous le rôle
applicatif `cga_app`, qui ne les contourne pas, **échoue bruyamment** — c'est le
bon comportement de PostgreSQL :

```
pg_dump: error: query would be affected by row-level security policy
```

Le réflexe, devant cette erreur, est d'ajouter l'option qui la fait taire :
`--enable-row-security`. Elle la fait taire. Mesuré sur la pile en service :

| Sauvegarde | Taille | Lignes réellement présentes |
| --- | --- | --- |
| sous le rôle propriétaire | 193 035 octets | **1 173** |
| avec `--enable-row-security` | 10 171 octets | **8** |

Le fichier déclare ses 38 tables, donc il **paraît** complet. Zéro compte, zéro
accusé de réception, zéro écriture comptable. Et la commande rend zéro : aucune
alerte, aucune trace, et on le découvre le jour du sinistre.

### Et ce que `pg_dump` n'emporte pas

`cga_app` et `cga_migration` vivent dans la **grappe**, pas dans la base.
Restaurée sur un serveur neuf, la base seule retrouve ses 35 politiques et ses
152 privilèges — qui désignent des rôles inexistants. `pg_dumpall --roles-only`
les emporte ; les deux scripts le font toujours.

### Le cycle complet, exercé

| Contrôle | Résultat |
| --- | --- |
| 38 tables, ligne par ligne, avant et après | identiques |
| 35 politiques, 35 tables protégées | conservées |
| 152 privilèges de `cga_app` | conservés |
| Cloisonnement exercé sous `cga_app` sur la base restaurée | 0 ligne sans locataire, 12 comptes avec le bon, **0 avec un locataire étranger** |

C'est le dernier contrôle qui compte : le cloisonnement multi-locataire survit à
une restauration. Les 35 politiques auraient pu revenir sur des tables dont
`ROW LEVEL SECURITY` aurait été désactivé — présentes, et sans effet.

### Un défaut dans mon propre script, trouvé en l'exerçant

`restauration.sh` annonçait « la base d'origine est absente » sur une base
parfaitement présente. Le test était
`psql -lqt | cut -d'|' -f1 | grep -qw "$BASE"` : `grep -q` sort dès la première
correspondance, `cut` encore en train d'écrire reçoit un SIGPIPE et meurt, et
avec `set -o pipefail` la mort d'un maillon rend tout le tuyau en échec. Le test
lisait donc « échec », c'est-à-dire « absente », **précisément quand la base est
là**.

Conséquence réelle : le garde-fou « ne jamais restaurer par-dessus une base
existante » ne se déclenchait jamais. Remplacé par une interrogation de
`pg_database` dont le résultat passe par une variable. Les deux garde-fous ont
ensuite été éprouvés **en échec**, ce qui est le seul essai qui vaille pour un
garde-fou.

Ce défaut ne se voyait pas en relecture. Il s'est vu en lançant le script.

### Livré

- `outils/sauvegarde.sh` — rôles et base, avec un contrôle qui refuse une
  archive manifestement vide ;
- `outils/restauration.sh` — dans une base **neuve**, jamais par-dessus, avec
  comparaison table par table et contrôle du cloisonnement ;
- la section « Sauvegarder » du README, avec le tableau des mesures.

Les trois bases d'essai créées pour cet exercice ont été supprimées ; la pile est
rendue à son état initial.

### Ce qui reste sur ce volet

- **Aucune sauvegarde n'est planifiée.** Les scripts existent, rien ne les
  appelle. C'est une décision d'hébergement : fréquence, rétention, chiffrement
  et lieu de dépôt appartiennent au cabinet.
- **La restauration n'a jamais été exercée sur une grappe VIERGE** — seulement
  sur celle-ci, où les rôles existaient déjà. C'est là que l'oubli des rôles
  ferait mal, et c'est l'essai qu'il faudra faire avant la mise en production.

---

## 24 septembre 2026 (fin) — Les deux interfaces avaient zéro test, et une faille critique dormait dans Next

Demande : « on continue, il faudrait laisser le volet iOS d'abord ». Le trou
structurel signalé à la passe précédente était le bon endroit où aller.

### L'état de départ, sans détour

Le serveur a 3 814 cas. Le téléphone en a 224. **La console et la vitrine en
avaient zéro.** Leur `package.json` ne connaissait que `dev`, `build`, `start`,
`lint`. Trente écrans éprouvés à la main, en direct, une fois — et rien qui les
garde. Une compilation réussie dit « le code tient debout » : elle ne lit pas un
montant, ne pose pas un témoin, ne vérifie pas qu'une image existe.

### Une faille critique trouvée en chemin

L'installation du banc a fait parler `npm audit` : **`next@16.3.0` porte deux
exécutions de code à distance sans authentification**, et c'est une dépendance
de PRODUCTION. La première ne vise que les serveurs Windows — hors sujet ici. La
seconde vise **l'optimisation d'images**, que dix-huit fichiers emploient à
travers `next/image`. Les deux interfaces sont montées en `16.3.6`, correctif
sans rupture ; `npm audit --omit=dev` rend désormais zéro sur les deux.

C'est le genre de trouvaille qu'aucun test n'apporte et qu'aucune relecture ne
fait : elle vient d'une commande qu'on lance en installant autre chose.

### Un défaut comptable trouvé en écrivant un cas

`Number("")` vaut **zéro** en JavaScript. Un montant absent rendu par le backend
sous forme de chaîne vide s'affichait donc « 0 » — c'est-à-dire « rien à payer »
pour qui lit la colonne, alors que la vérité est « on ne sait pas ». Et
`montant("inconnu")` rendait bien « — » : les deux absences ne se comportaient
pas pareil, et **seule la plus dangereuse passait**. Corrigé dans les deux
dépôts, avec `montantFcfa("")` qui rend « — » et non « — FCFA ».

Le cas qui l'a trouvé avait été écrit en supposant que le comportement existait
déjà. C'est exactement ce à quoi sert d'écrire des tests sur du code qu'on croit
connaître.

### Ce que le banc garde, et pourquoi ces fichiers-là

| Dépôt | Ce qui est gardé | Le défaut que ça empêche |
| --- | --- | --- |
| Console | `api.ts` | Un refus rendu « 422 Unprocessable Entity » au lieu de « le montant doit être positif ». Tout passe par là : un défaut n'y casse pas un écran, il en casse trente |
| Console | `actions-session.ts` | Un témoin `Secure` posé sur une connexion en clair : la connexion réussit, puis la page suivante renvoie à l'écran de connexion, sans erreur ni trace. Et le message de refus reformulé, qui rouvrirait l'oracle d'énumération |
| Console | `acces.ts` | `dossiers: null` (tout le cabinet) confondu avec `[]` (aucun dossier) |
| Console | `Gravite.tsx` | Une pastille de couleur seule, illisible pour un comptable daltonien et en impression noir et blanc |
| Vitrine | `bareme-creation.ts` | Une majoration de capital comptée deux fois — l'écart ne se voit que sur les gros capitaux |
| Vitrine | `blog.ts` | Un `slug` en double qui rend un article inaccessible, **une image citée qui n'existe pas sur le disque** |
| Les deux | `formats.ts` | Le défaut « absent affiché zéro » ci-dessus |

**147 cas au total** — 83 console, 64 vitrine — en moins de deux secondes chacun.

### Deux dépendances écartées, et pourquoi c'est noté

Le greffon React et le résolveur de chemins de Vite font le travail en une ligne
chacun. Ils tirent chacun une version de Vite **différente** de celle qu'emploie
vitest, et les deux jeux de types deviennent incompatibles : `npx tsc --noEmit`
échouait sur le fichier de configuration alors que tous les cas passaient. On
peut arbitrer à coups de versions épinglées ; ça se défait à la première mise à
jour. Les deux lignes qu'ils apportaient sont écrites à la main — un alias et un
réglage de JSX. Deux chaînes d'approvisionnement de moins à surveiller.

### Branché sur la chaîne

`npm test` entre dans les deux `verification.yml`, **avant** la compilation : les
cas tournent en secondes, la compilation en minutes, et échouer d'abord sur ce
qui est rapide et précis épargne l'attente. Le nom du travail, qui annonçait
« types, lint et compilation », le dit maintenant.

### Ce qui reste sur ce volet

- **Aucun parcours de bout en bout dans un vrai navigateur** n'est automatisé.
  Un écran peut être juste au banc et illisible à l'écran.
- **Les composants ne sont couverts qu'à un exemplaire** (`Gravite.tsx`). Les
  soixante-quatorze autres de la console attendent.
- **Les actions serveur sont couvertes sur la session seule.** Les vingt-sept
  autres fichiers `actions-*.ts` écrivent dans l'ERP sans filet.
- **iOS reste de côté**, à la demande du cabinet.

---

## 24 septembre 2026 (suite) — Le paquet livré ne joignait rien, et personne ne pouvait le voir

Poursuite des vérifications, sur le dernier volet jamais éprouvé : ce que
contient réellement l'application **livrée**, par opposition à celle qu'on lance
depuis le poste.

### Trois défauts que le développement ne peut pas révéler

Ils ont en commun de ne vivre dans aucun fichier de code. Ils vivent dans les
déclarations de paquet, que le gabarit de Flutter livre incomplètes.

- **L'APK de production ne portait aucune permission réseau.** Constaté sur le
  manifeste fusionné du 22 septembre : `android.permission.INTERNET` n'était
  déclarée que dans les profils `debug` et `profile`, où l'outil la pose pour le
  rechargement à chaud. Une version livrée fusionne `main` seul. L'application
  aurait démarré, affiché sa page de connexion, et **chaque appel aurait échoué**
  — sans message qui l'explique. Aucun essai en développement ne pouvait le
  dire : le profil de développement donne la permission.
- **Le trafic en clair était refusé par le système.** `targetSdk` vaut 36 ;
  depuis Android 9, tout `http://` est bloqué avant même de sortir du téléphone.
  La version de démonstration branchée sur `http://localhost:8100` ne se serait
  jamais connectée. Une politique de réseau écrite dans
  `res/xml/reseau.xml` autorise le clair **adresse par adresse** — `localhost`,
  `127.0.0.1`, `10.0.2.2`, les trois qui ne quittent jamais le poste. La racine
  reste à `false` : ouvrir le clair en général ferait traverser le mot de passe
  d'un adhérent en lisible sur le wifi d'un cybercafé.
- **iOS aurait arrêté l'application au premier appui sur « Déposer ».** Sans
  `NSCameraUsageDescription`, le système ne refuse pas l'appareil photo : il tue
  le processus. Les deux descriptions sont écrites, et dans les termes que
  l'adhérent lira — ce que le cabinet fait de la photo, pas « cette application a
  besoin de l'appareil photo ».

### La signature, qui n'est pas un détail de publication

Le gabarit laissait la version livrée signée avec la **clé de débogage**, une clé
générée par l'outil et différente sur chaque poste. Android refuse d'installer
une mise à jour signée autrement que la version en place : publiée telle quelle,
la première mise à jour aurait obligé chaque adhérent à désinstaller puis
réinstaller, en perdant sa session.

La clé se pose maintenant dans `android/key.properties`, ignoré par git. Absent,
la construction retombe sur la clé de débogage **en l'écrivant dans le journal de
construction** : essayer reste possible, publier sans s'en apercevoir ne l'est
plus.

### Ce qui garde ces trois portes fermées

Six cas neufs, `test/paquet_livre_test.dart`, qui lisent les fichiers de
déclaration plutôt que le code. Ils ne remplacent pas un essai sur appareil ; ils
garantissent que les trois déclarations dont l'absence est **invisible** en
développement sont toujours là. Le quatrième vérifie qu'on n'a pas rouvert le
clair à la racine pour « faire marcher la démonstration ».

### Vérifié, et comment

| Ce qui est vérifié | Comment |
| --- | --- |
| La permission est dans le paquet livré | `aapt2 dump permissions` sur l'APK lui-même, pas sur un intermédiaire |
| La politique de clair y est aussi | La ressource `xml/reseau` est résolue dans l'APK |
| Le serveur, en entier | 3 814 cas au vert, 14 min 45 |
| Le téléphone | `flutter analyze --fatal-infos` sans remarque, 224 cas au vert |
| Les traductions | Parité exacte fr/en : 518 clés sur la vitrine, 326 sur la console |
| L'indexation de la vitrine | `robots.txt` interdit proforma, devis et suivi ; plan du site à 30 adresses, en deux langues |

### La grille d'écrans avait trois gestes de retard

Les trois outils de la chaîne ont été relancés. `avancement_des_ecrans` signalait
**trois routes qu'aucun geste ne cite** : le rappel demandé depuis un devis, et
les deux gestes de tarifs. Les trois sont bel et bien appelées par le code — ce
que l'outil dit, c'est que la grille ne les DÉCLARAIT pas, et c'est précisément
son travail : une route qui existe sans écran déclaré est une route que personne
ne saura retrouver dans six mois.

Les deux gestes de tarifs étaient en plus rattachés au mauvais écran : ils
vivent sur `/tarifs`, un écran de console distinct de la souscription qui
consomme le prix. Ils ont désormais leur entrée, `HORS-TARIFS`.

La mesure repasse à **100 % — 231 gestes branchés sur 231, zéro route orpheline**.

### Ce qui reste, et qui n'est pas de mon ressort

- **L'APK de production n'a été installé sur aucun appareil.** Le téléphone était
  débranché au moment de la vérification ; la preuve est le manifeste embarqué,
  ce qui est solide mais n'est pas un essai.
- **iOS n'a jamais rien exécuté.** Ni appareil, ni poste pour construire.
- **Livrer en `appbundle`, pas en `apk`.** Un APK unique porte les trois
  architectures : 52 Mo là où chaque téléphone n'en téléchargerait que dix-huit.
  Sur un forfait camerounais, ce n'est pas un détail de confort.
- **Le client qui paie par la voie commerciale n'a toujours ni compte ni lien**
  (voir l'entrée précédente). La décision appartient au cabinet : geste de
  console après vérification d'identité, ou ouverture automatique à
  l'encaissement.

---

## 24 septembre 2026 — La surface de sécurité, et un client payé que personne ne prévient

Suite des vérifications, sur les volets jamais éprouvés.

**Migrations.** Montée complète depuis une base vide, redescente d'un cran, remontée :
sans erreur. 38 tables, 35 politiques de cloisonnement. Les trois tables sans politique
ne portent aucune donnée de client — version de migration, registre des espaces,
journal des travaux périodiques — et c'est ce qu'il faut.

**Cloisonnement, éprouvé en direct** (10 cas) : un dossier hors périmètre répond 404 et
non 403 — introuvable, pas interdit ; une permission absente répond 403 ; sans session,
401. L'inspecteur voit son dossier et ignore les autres.

**Temps de réponse** : dix routes des écrans les plus employés, toutes sous 70 ms de
médiane, la plus lente étant le tableau de bord de la direction à 63 ms.

**Pages** : 30 écrans de console sur 30, toute la vitrine, ses 4 fiches de service et
ses 14 articles, sans erreur.

⚠️ **TROIS MANQUES DE SÉCURITÉ TROUVÉS, ET CORRIGÉS.**

- **Le témoin de session portait `secure=False` écrit en dur**, avec un commentaire
  disant de le passer à `True` en production. Un commentaire n'est pas un mécanisme :
  le jour de la mise en ligne, le témoin serait parti en clair. Il suit désormais
  l'adresse publique de l'API (`Configuration.temoin_securise`), et la production
  refuse de démarrer si cette adresse est en `http`.
- **Aucune réponse ne portait d'en-tête de sécurité**, et les manifestes de
  déploiement n'en ajoutaient pas : ni `nosniff`, ni politique de référent, ni refus
  d'encadrement, ni HSTS. Un intergiciel les pose désormais sur TOUTE réponse, y
  compris les refus. HSTS seulement quand l'API est servie en HTTPS — posé en
  développement, il interdirait `http://localhost` au navigateur pendant six mois,
  pour tous les projets du poste.
- **Les portes publiques du parcours commercial n'étaient pas bornées** — dépôt d'une
  demande, rappel sur un devis, acceptation d'une proforma — alors que la connexion et
  le devis l'étaient. Le trou s'est aggravé le jour où l'affectation est devenue
  automatique : un automate qui martèle le formulaire occupe désormais des gens, pas
  seulement une table. Les règles acceptent maintenant un chemin à étoile finale, sans
  quoi une référence dans l'adresse (`/acquisition/devis/DV-…/rappel`) ne serait jamais
  attrapée. Mesuré sur la pile : le 31ᵉ dépôt d'une même adresse reçoit 429.

⚠️ **UN DÉFAUT DE FOND, NON CORRIGÉ, QUI DEMANDE UNE DÉCISION.**

Le parcours de paiement a été suivi jusqu'au bout pour la première fois : demande,
qualification, chiffrage, proforma envoyée, acceptation par lien signé, règlement,
encaissement — et **l'espace client s'ouvre tout seul** (`tnt-essai-paiement-…`, actif
et prêt). Mais **personne ne crée de compte au client et ne lui envoie de lien
d'accès** : le seul chemin qui le fait est la souscription en ligne, par sa route
d'activation. La fiche du dossier payé, côté console, n'affiche qu'« Payé le … ·
espace « … » », sans aucun geste pour ouvrir l'accès. Pour une création d'entreprise
c'est normal — il n'y a pas encore de société —, mais pour une adhésion, le client a
payé et n'a aucun moyen d'entrer.

Serveur : 3 813 tests (sept nouveaux sur la surface de sécurité), 0 échec.

## 23 septembre 2026 (nuit) — La barre du bas flotte, et les champs cessent d'être des cases

Le cabinet a trouvé la barre et les formulaires « trop classiques ». Deux reprises.

**La barre du bas flotte.** Collée au bord, pleine largeur, elle avait l'allure d'une
barre système : correcte, sans caractère. Détachée — seize points sur les côtés, coins
de vingt-six, ombre remontante —, elle devient un objet posé sur la page. L'onglet
actif porte une PASTILLE, et non une simple teinte de texte : sur une dalle bon marché
au soleil, un magenta et un gris se ressemblent, une forme non. La coquille laisse le
contenu passer dessous (`extendBody`), et chaque écran réserve `espaceSousLaBarre`.

⚠️ **Un défaut trouvé en la refaisant** : à soixante-dix points de haut, le bouton
central DÉBORDAIT de la barre. Or ce qui déborde d'un parent ne reçoit pas les appuis :
le haut du bouton le plus important de l'application était mort. La barre mesure
désormais quatre-vingt-six points, et il tient entièrement dedans. Le cas d'essai qui
vérifiait « il dépasse vers le haut » vérifie maintenant ce qui compte vraiment : il
est AU CENTRE, à moins de deux points du milieu de l'écran.

**Les champs de saisie cessent d'être des cases.** Un filet gris tout autour, au repos
comme à la saisie : l'allure d'un formulaire administratif. Désormais une surface
teintée sans aucun filet au repos, un liseré de deux points dans la teinte d'action à
la saisie, cinquante-six points de haut, et l'étiquette EN HAUT, toujours.

⚠️ **Deux défauts vus au rendu, corrigés** : l'étiquette flottante se posait SUR le
texte tapé — les deux se lisaient l'un par-dessus l'autre ; et l'espacement intérieur,
symétrique, ne lui laissait aucune place. L'étiquette est maintenant fixée en haut, ce
qui a l'avantage de nommer le champ en permanence : trois champs plus bas, on sait
encore ce qu'on écrit.

Application : 218 tests, analyse sans remarque. Rendus relus en clair, en sombre et en
police agrandie ; version installée sur l'appareil.

## 23 septembre 2026 (soir) — Le téléphone prend un rendu contemporain, et deux règles changent

Le cabinet a demandé un rendu « plus parlant », au niveau des interfaces mobiles
d'aujourd'hui. Trois décisions ont été prises avec lui, et deux reviennent sur des
choix antérieurs. Elles sont écrites là où elles s'appliquent, avec leur date.

- **Les angles passent de 8 à 16 points, sur le TÉLÉPHONE SEULEMENT.** Ils avaient été
  resserrés pour s'aligner sur la console. La console ne bouge pas : un tableau de
  quarante lignes aux angles de seize points devient mou. C'est la seule divergence
  assumée entre le poste de travail et le téléphone, et `marque.dart` la porte.
- **Le dégradé de marque est autorisé**, alors que le § 10.7 l'interdisait. Sous trois
  conditions qui le gardent honnête : il ne relie que les deux teintes de la marque ;
  il ne porte que DEUX surfaces (l'en-tête de l'espace adhérent, la grande action) ;
  le texte posé dessus est mesuré sur l'extrémité la plus CLAIRE, jamais sur la
  moyenne. Mesuré : blanc sur magenta 600, 7,41:1 ; sur l'indigo, 15,22:1.
- **L'accueil montre où l'on en est, dessiné.** Un anneau de progression donne
  « 2 sur 5 » pour le mois — l'application ne lisait pas `justificatifs_du_mois`, que
  le serveur rendait depuis toujours, et ne pouvait donc rien montrer de l'avancement.
  Une barre à deux parts donne la part du retard dans l'échéancier. Les deux portent
  leurs nombres écrits : la couleur ne dit jamais seule.

⚠️ **Deux défauts corrigés dans la foulée**, tous deux vus au rendu :

- en mode sombre, la grande action prenait l'encre « sur primaire », qui y est FONCÉE :
  posée sur le dégradé sombre, elle disparaissait. Le blanc est la seule encre qui
  tienne sur les deux dégradés ;
- à 130 % de police, « documents » ne rentrait plus dans une tuile sur trois colonnes
  et se coupait en plein mot. Borner l'agrandissement aurait rendu illisible ce qu'on
  venait d'agrandir : les trois tuiles passent en colonne au-delà de 115 %.

Application : 218 tests, analyse sans remarque. Contrastes mesurés sur les deux
extrémités de chaque dégradé, en clair et en sombre : le plus bas tient 6,26:1.

## 23 septembre 2026 (fin) — La revue de fond de l'application

Tous les écrans de l'espace adhérent redessinés en trois variantes — clair, sombre,
police à 130 % — et relus un par un, plus les écrans publics. Trois défauts trouvés,
tous corrigés :

- **La barre du bas débordait de quatre points à 130 %** : les libellés grandissent,
  la barre non. Sa hauteur suit désormais l'échelle du système ; le bouton central,
  lui, ne bouge pas.
- **Deux appareils photo à trois centimètres l'un de l'autre** sur l'onglet du dépôt :
  le bouton flottant de l'écran, et le bouton central de la barre. Le geste vit
  maintenant dans la barre : sur son propre onglet, le bouton central **déclenche la
  prise de vue** au lieu de ne rien faire, et le bouton flottant a disparu. Sans
  dossier rattaché, la prise de vue s'arrête et le dit — un cas d'essai le tient.
- **La marge basse de l'accueil** était réglée à 96 points par excès de prudence ;
  ramenée à 48, la valeur qui dégage le débord du bouton central.

**Contrastes mesurés** sur les treize couples de couleurs nouveaux (grande action,
tuiles chiffrées, barre du bas, chiffres du cabinet), en clair et en sombre : tous
au-dessus des seuils — 5,16:1 au plus bas pour du texte, 6,33:1 pour une icône.
**Cibles tactiles** : un cas d'essai vérifie que les cinq destinations font au moins
quarante-huit points.

**Suites complètes** : serveur 3 806 tests, application 218 tests (trois nouveaux sur
la barre), types et lint de la console et de la vitrine sans erreur, contrat des
écrans 281/282 (le seul illisible est antérieur), document de conception sans tiret
cadratin.

## 23 septembre 2026 (suite) — L'accueil dit enfin où l'on en est, et le dépôt prend le centre

L'accueil connecté enchaînait trois sections de même poids ; rien n'y disait ce que
l'adhérent vient faire. Et la barre du bas alignait cinq onglets identiques, alors
qu'un adhérent ouvre l'application une facture à la main : neuf fois sur dix pour la
DÉPOSER, le reste il le consulte.

- **Trois chiffres, chacun avec son signe** : pièces attendues, périodes en retard,
  documents déposés. Ils se lisent d'un regard et mènent chacun à l'écran qui les
  détaille. Le retard se dit en rouge, le reste en indigo. ⚠️ « — » et jamais zéro
  quand le serveur n'a pas répondu : zéro veut dire « rien en retard », ce n'est pas
  la même nouvelle.
- **Une grande action « Déposer une pièce »**, pleine largeur, en couleur d'action :
  c'est la seule action pleine de l'écran (§ 10.7).
- **Les raccourcis redeviennent auxiliaires** : trois tuiles compactes (mes pièces,
  mon entreprise, écrire au cabinet). Le dépôt n'y figure plus — il a sa grande action
  et la place centrale.
- **La barre du bas** : quatre onglets, et le dépôt au centre, en bouton rond surélevé,
  plus grand, sous le pouce. Mêmes index, mêmes clés, même écran : ce qui change est ce
  que l'œil comprend. Un anneau de la couleur de la barre le détache du contenu qui
  défile dessous — posé avec une simple ombre, il dessinait un halo gris sale.
- **Les chiffres du cabinet, sur la page publique, reçoivent leurs icônes** : quatre
  nombres alignés sans signe se lisaient comme un tableau.
- Deux défauts de mise en page corrigés au passage : les rangées de tuiles demandaient
  une hauteur infinie dans une page qui défile (`IntrinsicHeight`), et la dernière carte
  de l'accueil passait sous la barre du bas.

Application : 216 tests passent, dont deux nouveaux sur la barre (le dépôt est rond,
plus grand, et déborde vers le haut), analyse sans remarque.

## 23 septembre 2026 — Cent cinquante-neuf cas d'usage éprouvés en direct, et l'écran se calme

**Le balayage.** Chaque cas d'usage du système a été exercé sur la pile en service,
avec le rôle qui le porte : vitrine et devis, acquisition du prospect à l'espace
ouvert, collecte, comptabilité, revue, obligations fiscales, conformité, clôture,
social, création d'entreprise, portefeuille, pilotage, administration, exploitation.
159 cas, tous conformes. Les refus rencontrés sont ceux que le domaine doit opposer,
et ils l'ont fait au bon moment :

- une écriture ne se valide pas sans sa pièce justificative ;
- un mois ne se transmet pas en revue avec un brouillon, ni avec des pièces non
  traitées, ni deux fois ;
- un dépôt de déclaration exige une session renforcée par le second facteur ;
- réinitialiser un second facteur ferme les sessions du compte visé, et de lui seul ;
- la connexion est limitée en débit : un balayage qui ouvre trop de sessions se fait
  refuser, comme un robot ;
- relancer un adhérent appartient au chargé de clientèle, déposer une déclaration au
  réviseur, fixer un prix à la direction.

**Un défaut trouvé et corrigé.** La LISTE des dossiers commerciaux affichait le nom du
responsable (« Patricia MOUKOURI »), la FICHE ne le rendait pas : l'écran de détail
n'avait que « C-007 ». Le nom est désormais résolu des deux côtés, et la console
l'affiche sous le titre du dossier.

**Le design mobile, d'un cran.** Vu sur l'appareil, l'écran des échéances était un mur
rouge : bandeau latéral, icône et phrase disaient trois fois la même alerte, sur
chacune des huit cartes, chacune portant l'ombre pleine.

- **Deux niveaux de relief.** La carte posée garde son ombre ; les éléments répétés
  d'une liste reçoivent `ombreListe`, presque nulle. Huit ombres pleines l'une sous
  l'autre faisaient vibrer la page.
- **L'ombre de carte adoucie** : le bord de l'ombre se lisait comme un trait gris.
- **Le bandeau d'alerte à trois points** au lieu de quatre : à quatre, il lisait comme
  une barre d'erreur pleine hauteur.
- **L'état en étiquette** et non en phrase rouge pleine largeur ; la précision
  « et 1 autre période » passe en encre douce : c'est une précision, pas un second cri.
- **Le chapeau compact** : icône sur la ligne du titre, titre d'un cran plus bas dans
  l'échelle. Il occupait le tiers de l'écran avant la première échéance.
- **Un rythme nommé** (4, 8, 12, 16, 20, 24, 32) : les écrans écrivaient 6, 10, 14, 18,
  26 selon l'humeur. Et un **titre de section unique**, là où trois variantes coexistaient.
- Interligne du texte courant à 1,55, étiquettes plus discrètes.

**Vérifié sur le téléphone**, connecté à la pile : accueil, échéances, documents,
entreprise. Application : 215 tests, analyse sans remarque.

## 22 septembre 2026 (nuit) — Le dossier de démonstration rattrape le calendrier

Revue complète de l'application mobile, écran par écran, branchée sur la vraie
pile : 46 écrans dessinés par le moteur de Flutter, au format d'un téléphone, avec
les vraies polices, en clair, en sombre et en police agrandie à 130 %. Aucun
débordement, aucune erreur. Le défaut était ailleurs : dans les données.

**L'adhérent de démonstration affichait « 81 périodes en retard »**, dont des
retards de 584 jours, et des documents déposés par le cabinet datés de 2024. Le jeu
d'essai ne portait que six accusés de dépôt, écrits à une date que le calendrier
avait dépassée. Montré à un prospect, le client modèle du cabinet avait l'air en
infraction depuis deux ans.

- **`app/demonstration_a_jour.py`** calcule les accusés manquants **sur l'échéancier
  du dossier, par rapport au jour** : chaque période échue depuis plus de trente jours
  reçoit son accusé, par le domaine (`enregistrer_accuse`), avec un numéro et un
  montant stables. Plus aucune date écrite en dur : rien ne vieillira.
- **Le mois que la comptabilité de démonstration traite reste ouvert.** Le jeu
  d'essai porte des écritures de juillet 2026 : c'est le mois que la console montre en
  cours de déclaration. La première version le déclarait d'office, et la suite l'a vu :
  le parcours de dépôt de TVA répondait « déjà déclarée ». Une période mensuelle qui
  porte des écritures n'est donc jamais consignée.
- **L'amorçage** l'appelle : une base recréée naît à jour. **Une base existante** se
  recale sans rien effacer, et rejouer n'ajoute rien (`outils/recaler_la_demonstration.py`).
- Le locataire est établi par le module lui-même : un amorçage appelé hors requête
  échouait sinon sous le cloisonnement, et laissait la base à moitié versée.

**Résultat sur la pile déployée** : 120 accusés ajoutés, 0 au second passage.
L'adhérent voit 8 périodes en retard (juillet, 38 jours ; août, 7 jours) au lieu de
81, et 126 accusés de dépôt dont les plus récents de juin 2026. Serveur : 3 806 tests
passent ; quatre nouveaux cas tiennent la règle (retards récents seulement, rejouable,
dossier de démonstration seul, mois en cours de déclaration laissé ouvert).

**Ce que la revue n'a pas couvert** : le passage sur le vrai téléphone (débranché),
l'émulateur de la machine étant plein d'applications d'autres projets, auxquelles on
n'a pas touché ; l'iPhone ; la prise de photo réelle.

## 22 septembre 2026 (soir) — Une demande trouve son responsable en trois secondes

Le client lit « un responsable vous contacte ». Jusqu'ici, aucun responsable n'était
désigné : chaque dossier restait `DÉPOSÉE` jusqu'à ce qu'un collaborateur ouvre la
console et clique sur « affecter ». Le code citait l'événement `DemandeDéposée`
depuis l'étape 2 du parcours, et **rien ne le publiait**.

- **Le dépôt publie `DemandeDéposée`** dans la boîte d'envoi, dans la même
  transaction que le dossier, et seulement pour un dossier neuf : une demande
  rattachée ne republie rien, sans quoi l'affectation tournerait une seconde fois et
  pourrait changer de responsable en plein échange. Identifiant dérivé de la
  référence : un rejeu ne dépose pas deux fois.
- **Un abonné l'affecte** (`abonne_d_affectation.py`) : la même affectation que le
  bouton de la console, mêmes candidats, même grille du référentiel. Il ne touche
  qu'un dossier encore `DÉPOSÉE`, parce que le relais garantit « au moins une fois »
  et qu'un collaborateur a pu passer avant. Aucun candidat n'est un fait métier, pas
  une panne : il ne lève pas, et la veille remonte le dossier.
- **La pile de démonstration n'exécutait aucun travail.** La production a son
  ordonnanceur (`30-ordonnanceur.yaml`) ; la démonstration n'en avait aucun, et donc
  ni relais, ni relance, ni ouverture d'espace sur paiement. L'ordonnanceur tourne
  désormais dans le processus de l'API (`CGA_ORDONNANCEUR_EN_PROCESSUS`). Rien ne
  sort de la machine : paiement simulé, courriels arrêtés au relais `courrier`.

**Vérifié.** Quatre cas passent par le vrai relais sur PostgreSQL (demande neuve
affectée ; dossier affecté à la main laissé tel quel ; demande rattachée sans second
événement ; rappel d'un devis). Contrôle : l'abonné désinscrit, le premier cas tombe.
Sur la pile déployée : une demande déposée est `AFFECTÉE` en 3,3 s, et le rappel d'un
devis de formation aussi ; aucune erreur au journal, quarantaine vide. Serveur :
3 802 tests passent.

**Ce qui reste `DÉPOSÉE`.** Les trois dossiers de démonstration déposés avant ce
changement n'ont pas d'événement : ils attendent une affectation à la main, ou la
veille.

## 22 septembre 2026 (fin) — « Prix à confirmer » prévient enfin quelqu'un

L'application et la page du devis sur la vitrine écrivaient « un responsable vous
rappelle » sous tout devis au prix non arrêté, ou sur étude. **Rien ne prévenait
personne** : le devis dormait sur le serveur, et le client attendait un appel.

- **Nouvelle route publique `POST /acquisition/devis/{reference}/rappel`.** Elle
  dépose une demande de contact dans la file du responsable, avec la référence du
  devis et les prestations dont le prix est à arrêter. C'est l'entrée du parcours
  mis en place plus tôt dans la journée : échange, prix arrêté, proforma envoyée par
  courriel ou WhatsApp. Les coordonnées viennent **du devis**, jamais du corps de la
  requête ; aucun accord WhatsApp n'est déduit d'un numéro laissé pour un devis ; deux
  appuis ne font pas deux dossiers (rattachement anti-doublon existant). Refus 409 pour
  un devis déjà engagé ou déjà réglable. Déclarée dans les deux listes closes (routes
  publiques, routes du parcours), avec sa raison.
- **Un bouton « Faire confirmer mon prix »** à la place de la phrase, dans
  l'application et sur la vitrine. Le message du serveur remplace le bouton après
  succès ; un refus ou une panne se lit, et le bouton reste.
- **Deux contradictions vues sur le téléphone, corrigées.** Le résumé du devis
  annonçait « À régler maintenant » et « Ce prix est garanti » sur un tarif
  indicatif, juste au-dessus du bloc qui disait l'inverse : il dit désormais « Tarif
  indicatif » et « prix à confirmer par le cabinet », dans l'application comme sur la
  vitrine. Et une formation, qui n'ouvre aucun espace, promettait un « lien d'accès »
  sous le champ du courriel.
- **La page du devis de la vitrine** reprend la mise en page de la proforma : même
  classe `conteneur` inexistante, même titre passé sous l'en-tête. L'annonce
  promotionnelle n'y paraît plus. Le surtitre n'impose plus de capitales : il porte
  une référence qu'un client peut dicter au téléphone.

**Vérifié.** Sur le téléphone : formation au tarif indicatif, « Voir mon prix »,
« Faire confirmer mon prix », message du serveur affiché ; le dossier apparaît dans
les demandes entrantes, `DEPOSEE`, avec le message « Devis DV-… : prix à arrêter pour
Formation — session interentreprises ». Même parcours depuis la vitrine au format
téléphone. Serveur : 3 798 tests passent sur PostgreSQL. Application : 215 tests,
analyse sans remarque.

## 22 septembre 2026 (suite) — Le prix arrêté après l'échange part chez le client

Tous les prix ne sont pas au catalogue. Pour un service sur étude, le prix se décide
**après l'échange** : le responsable l'arrête dans la console, et le client doit
retrouver la proforma dans sa boîte de courriel ou dans WhatsApp, avec le lien pour la
lire et l'accepter sans compte.

**Ce qui manquait.** La console affichait le lien d'acceptation une fois, et le
responsable devait le recopier à la main dans un message, puis cocher « j'ai envoyé ».
Trois défauts se cachaient derrière :

- **Le lien menait au mauvais site.** Il était construit sur `SITE_URL`, qui vaut le
  domaine de production par défaut ; la page de la proforma vit sur la vitrine. En
  démonstration, le client aurait ouvert une page inexistante. Il est désormais
  construit sur l'adresse de la vitrine, côté console comme côté serveur.
- **Le lien disparaissait avant d'être envoyé.** L'émission rafraîchit la page et le
  dossier passe à « proforma émise » ; deux panneaux distincts démontaient le
  formulaire à cet instant, et avec lui le seul affichage du lien. Un panneau unique,
  à la même place, garde désormais son état.
- **Toute la surface d'acquisition répondait 500 sur la pile déployée**, demande de
  contact publique comprise : le référentiel était lu dans le dépôt, que l'image ne
  contient pas. Il est lu où la configuration le dit (`CGA_DOSSIER_REFERENTIEL`), et
  un test le sert depuis une copie modifiée, dépôt rendu introuvable.

**Ce qui est fait.**

- **Envoi par courriel à l'émission.** Case cochée d'office quand le dossier porte une
  adresse. C'est le serveur qui écrit, au moment où il forge le lien : le lien ne
  transite par personne. Un courriel parti vaut transmission et arme la relance ; un
  courriel refusé n'annule pas l'émission, la réponse le dit (`ENVOYE`,
  `SANS_ADRESSE`, `REFUSE`). Nouveau gabarit `proforma.envoi`, le seul qui porte le
  lien d'acceptation.
- **Envoi par WhatsApp.** Un bouton ouvre la conversation du client, message déjà
  rédigé, repris mot pour mot du modèle `cga_envoi_proforma`. **Seulement si le client
  a donné son accord WhatsApp**, et non révoqué ; sinon l'écran dit pourquoi.
- **La page du client, refaite pour le téléphone.** Elle employait deux classes
  inexistantes : le texte touchait le bord et le bouton qui engage le client
  s'affichait en texte nu. Le service s'affichait par son code (`creation sarl`), et
  l'annonce promotionnelle « votre SARL pour 275 000 FCFA » se posait par-dessus une
  proposition à 250 000 FCFA. Deux cartes désormais, une bande indigo sous l'en-tête
  comme sur toute page intérieure, aucune annonce sur cette page.
- **Un relais de messagerie de démonstration** (`courrier`, Mailpit) dans la pile :
  les courriels partent vraiment par SMTP et s'arrêtent là, lisibles sur
  `http://localhost:${PORT_COURRIER}`. Une pile locale n'écrit toujours à personne.
- `CGA_ADRESSE_PUBLIQUE_VITRINE` : nouvelle variable, exigée en https en production,
  ajoutée au manifeste Kubernetes, à `.env.example` et au script de démonstration.

**Vérifié de bout en bout sur la pile déployée.** Demande publique avec courriel et
accord WhatsApp, affectation, qualification, chiffrage (200 000 à 375 000 FCFA),
émission à 250 000 FCFA depuis la console : courriel reçu dans le relais, lien ouvert
sur la vitrine au format téléphone, proposition acceptée ; le dossier passe
`ACCEPTEE`, la proforma est marquée transmise. Suite complète du serveur : 3 793 tests
passent sur PostgreSQL.

**Reste à faire.** L'envoi WhatsApp automatique attend l'ouverture du compte de la
plateforme et l'approbation des modèles. (« Prix à confirmer » dépose désormais une
vraie demande : voir l'entrée suivante.)

## 22 septembre 2026 — Le prix est une décision du gérant, et les angles se resserrent

**Demandé.** Ne pas oublier l'intervention humaine dans la définition des prix : c'est
au gérant de les fixer, après. Relever encore le dessin de l'application, et réduire
les arrondis.

**Ce qui a été constaté.** Les prix de l'offre publique (12 500, 35 000, 180 000,
75 000 F) venaient des textes de la maquette de la vitrine. Ils étaient affichés comme
fermes et **encaissés en ligne**, sans qu'aucun responsable du cabinet ne les ait
arrêtés. Ils n'étaient pas non plus sur la fiche de contreseing : ils échappaient à
toute validation. Le référentiel de tarification disait pourtant déjà que le moteur
« rend un intervalle, jamais un prix », et le code du catalogue annonçait « une table
éditable par la direction, avec un écran ».

**Ce qui a été décidé, et pourquoi.**

* Un tarif porte un **statut** : `A_VALIDER` par défaut (c'est l'état réel du barème
  aujourd'hui), `FIXE` quand la direction l'a arrêté, avec qui et quand.
* Fixer un prix **ouvre une période** à partir d'une date, aujourd'hui au plus tôt. On
  ne réécrit jamais un prix passé : un devis déjà remis changerait de montant.
* Chaque décision est **conservée en base** (table `tarif_fixe`, cloisonnée par cabinet)
  et rejouée sur le catalogue à chaque lecture. L'historique dit qui a fixé quoi.
* Le devis **recopie** si son prix était arrêté (`prix_arrete`, `prix_arretes`), comme il
  recopie le montant. L'application et la vitrine lisent ce champ au lieu de recopier la
  règle : deux copies d'une règle divergent toujours.
* **Aucun paiement en ligne sur un prix non fixé** : le serveur refuse (409) et dit
  pourquoi. Un devis établi sur un prix indicatif le reste ; on en établit un nouveau.
* La permission `FIXER_LES_TARIFS` est réservée à la **direction**.

**Livré.**

* Serveur : le statut, la table et sa migration, deux routes réservées à la direction
  (lire l'état des prix, fixer un prix), le refus au paiement, le nom de l'auteur.
* Console : l'écran **Tarifs de l'offre** : combien de prix restent à fixer, le prix du
  jour de chaque prestation et de chaque tranche, le geste « fixer ce prix » (montant,
  date d'effet, motif, confirmation), l'historique des décisions.
* Application et vitrine : « tarif indicatif, le cabinet confirme ce prix avant tout
  paiement » ; pas de bouton de paiement sur un prix non fixé, mais la phrase qui dit
  qu'un responsable rappelle, et le moyen de le joindre. La note de développeur que
  l'application affichait (« voir l'en-tête du module ») ne sort plus.
* Dessin : les rayons de l'application sont maintenant **exactement ceux de la console**
  (8 et 4), et la pilule n'est plus gardée que pour les étiquettes.

**Vérifié.** Serveur : 3 786 cas sur PostgreSQL, aucun sauté, dont 20 sur les tarifs, et
le parcours réel sur PostgreSQL (la gérante fixe le prix, le visiteur souscrit, la
décision survit au redémarrage). Application : 213 cas. Contrat écrans–API : 280 appels
sur 281 conformes (le seul signalé préexistait). Sur la pile en ligne, par l'écran de la
console : un prix fixé par la gérante, le compteur passé de 5 à 4 ; un devis d'adhésion
refusé au paiement, un devis de domiciliation accepté.

**Ce qui reste.**

* **Le gérant doit fixer les prix réels.** Quatre restent à fixer, et la domiciliation
  l'a été en démonstration à 180 000 F. Tant qu'il ne l'a pas fait, rien d'autre ne se
  paie en ligne : c'est voulu.
* L'écran des tarifs n'exige pas encore de second facteur, contrairement aux actes
  sensibles de la fiche de sécurité. À décider.

---

## 21 septembre 2026 — L'application mobile devient une application : la vitrine, l'accueil, le suivi

**Demandé.** L'application était « vide » : un mur de connexion, puis un appareil
photo. Le cabinet la veut complète et attrayante : un visiteur sans compte doit y
voir tout ce que la vitrine propose et pouvoir souscrire ; un adhérent connecté doit
y trouver ce qu'il doit, ce que le cabinet lui demande, et les documents qu'on
dépose pour lui ; la page de connexion était jugée amateur ; le dessin, trop
classique.

**Ce qui a été constaté en essai réel, et qui a changé la réponse.**

* **Une adhésion souscrite depuis l'application ne pouvait jamais être payée.** Le
  formulaire ne demandait pas le NIU ; le serveur établit le devis sans lui, puis
  refuse le paiement d'une prestation qui ouvre un dossier. Trouvé en jouant le
  parcours contre le vrai serveur, pas en test. **La vitrine avait le même défaut** :
  son champ NIU n'était pas obligatoire. Corrigé des deux côtés.
* **« dès 0 F par mois » pour l'adhésion.** Les tarifs sans montant (le régime du
  réel, la création, le ponctuel, tous sur étude) étaient lus comme zéro, et zéro
  gagnait le classement du prix d'entrée. Absent veut désormais dire *sur étude*.
* **« 75 000 F une fois » pour la formation**, facturée *par personne*. C'est
  maintenant l'unité du barème qui s'affiche.
* **« Mot de passe oublié » existait côté serveur.** On l'avait cru absent. Il
  répond 202 pour toute adresse, connue ou non, pour ne pas révéler qui est client :
  l'écran dit donc « si un compte est ouvert à cette adresse, un lien vient d'y
  partir », jamais « un lien vous a été envoyé ».
* **Les quatre témoignages de la vitrine sont des noms inventés sur des portraits
  de banque d'images.** Ils ne sont pas repris dans l'application. **À trancher par
  le cabinet** pour la vitrine elle-même.
* **Le PDF de l'accusé du guichet n'est pas conservé** : le système garde le contenu
  déclaré, le numéro et l'empreinte, pas le reçu du guichet. La prévisualisation
  porte donc sur ce qui existe : le fichier de chaque pièce déposée, photo ou PDF.

**Livré (application mobile).**

* **La page publique reprend la vitrine en une page** : promesse, chiffres, annonce
  du moment, les prestations avec leur barème, ce que l'adhésion change, les trois
  étapes, le blog lisible dans l'application, les institutions, les trois moyens de
  joindre le cabinet. Une rangée d'onglets épinglée mène à chaque section.
* **La connexion** : une photographie, la phrase « le cabinet ne vous demandera
  jamais votre mot de passe », le lien de réinitialisation, un retour vers l'offre.
* **L'accueil connecté** : le mois dans les mots du serveur (« Il manque 3
  justificatifs »), les demandes du cabinet avec les deux réponses toutes faites,
  le résumé des échéances, les derniers documents, des raccourcis. Les onglets
  deviennent Accueil, Échéances, Déposer, Documents, Entreprise.
* **La visionneuse** : photo ou PDF d'une pièce, tel que le serveur le conserve ;
  depuis « Mes pièces envoyées », et depuis une demande « à corriger » pour revoir
  la facture refusée.
* **Le suivi d'une souscription** : paiement demandé, reçu, *identité vérifiée par
  le cabinet*, accès ouvert ; puis les mensualités une fois l'abonnement en vigueur.
  La troisième étape est celle qu'on oublie : sans elle, le souscripteur attend un
  lien qui ne peut pas encore partir.
* **Le dessin, repris depuis le thème** : fond teinté et cartes blanches posées par
  une ombre teintée d'indigo, une carte partagée au lieu de sept dessinées à la
  main, les chapeaux d'écran en indigo (le magenta est réservé à l'action), une
  échelle typographique française, des champs remplis plutôt que cerclés.
  Chaque contraste a été **calculé**, et trois choix initiaux ne tenaient pas.

**Vérifié.** Application : 208 cas, analyse stricte sans remarque. Serveur : 3 765
cas sur PostgreSQL, aucun sauté. Console et vitrine : lint et typage propres.
Document de conception : aucun tiret cadratin, contenu conforme, compilation.

**Ce qui reste.**

* **Le parcours complet sur le téléphone**, bloqué par un appareil verrouillé.
* Les photographies sont des illustrations libres de droits ; celles du cabinet
  doivent les remplacer avant toute publication sur les magasins.
* Le serveur accepte n'importe quelle chaîne comme NIU au devis : la forme n'est
  contrôlée qu'à l'écran. La vérification d'identité par le cabinet couvre le fond.
* L'estimation du coût de création n'est pas encore dans l'application.

---

## 18 août 2026 (nuit) — La séance de démonstration, et trois pièges de shell

**Demandé.** Comment repartir d'une base propre pour une séance de tests logique et
cohérente.

**Ce qui manquait vraiment.** `amorcer()` refuse de rejouer sur une base déjà
peuplée, et le commentaire du module le dit : « la seule façon de réamorcer une base
est de la recréer ». C'est la bonne discipline, et elle n'était outillée nulle part.
Monter la pile demandait sept commandes dans le bon ordre, dont une qui échoue
silencieusement si la précédente n'a pas fini.

**Livré.**

* `Backend_erp_cga/outils/pile-de-demonstration.sh` : `neuve` recrée la base, verse
  la démonstration, démarre API et front, et remet le limiteur à zéro. **Six
  secondes.** Plus `demarrer`, `etat`, `arreter`. La remise à zéro refuse de
  s'exécuter ailleurs que sur le port 55432 : une commande destructrice qui
  accepterait une adresse quelconque est une perte de données qui attend son jour.
* `Docs/seance-de-demonstration.md` : cinq actes, 45 minutes, **un seul dossier
  suivi du début à la fin**. L'acte V est celui qui installe la confiance : il
  annonce les manques avant qu'on les demande.

**L'acte qui vend, et il repose sur une pièce réelle.** `F-2026-0424`, sable de
rivière, 418 000 FCFA hors taxes soit **498 465 TTC, réglés en espèces**. Elle ne
produisait pas le constat de TVA avant aujourd'hui : le seuil portait 500 000 et
498 465 passait juste en dessous. Corrigé à 100 000, elle le produit. La
démonstration de la correction est donc jouable devant un client, sur le jeu de
démonstration, sans rien préparer.

**Toutes les affirmations du document ont été rejouées contre la pile** avant d'être
écrites : l'adhérent reçoit 404 sur le dossier voisin, le comptable 404 sur l'autre
portefeuille, le réviseur 403 sur le pilotage, la direction 200, l'inspecteur 200
sur sa mission. Une seule affirmation était fausse et a été corrigée : le document
demandait de **déposer** une facture, alors que l'écran de dépôt n'existe pas, ce
que le document lui-même annonçait vingt lignes plus loin.

### Trois pièges de shell, chacun payé d'un diagnostic

Ils méritent d'être écrits parce qu'ils produisent tous le symptôme d'un outil
cassé, sans message.

1. **`pipefail` et la recherche d'un port libre.** `pid="$(ss … | grep … )"` : un
   `grep` qui ne trouve rien fait rendre 1 à tout le tuyau, l'affectation hérite du
   statut, et `set -e` arrête le script. Chercher un port libre suffisait à tout
   interrompre. Un port libre est une réponse, pas une erreur.
2. **`test && { … }` sous `set -e`.** La liste rend un statut non nul quand le test
   échoue, et le script s'arrête juste après avoir affiché l'étape précédente.
   Remplacé par de vrais `if`.
3. **`nohup … &` ne détache pas assez.** Bash supprime le sous-shell qui ne contient
   qu'un travail d'arrière-plan : le serveur devient fils direct du script, qui
   l'attend en sortant. La pile fonctionnait, l'API répondait, et la commande ne se
   terminait jamais. Sous un tuyau, `… | tail`, rien ne s'affichait du tout.
   `setsid --fork` fait le double saut et ne laisse aucun fils à attendre.

Et un quatrième, rencontré deux fois pendant la mise au point : **`pkill -f` tue le
shell qui l'appelle**, parce que sa propre ligne de commande contient le motif.

---

## 18 août 2026 (fin de journée) — Le référentiel confronté aux textes, et une erreur d'un facteur cinq

**Demandé.** Mettre les paramètres par défaut en conformité avec la réglementation
en vigueur, pour qu'un test complet et une présentation intégrale soient possibles.

**Ce que le statut `A_VALIDER` bloquait, et ce qu'il ne bloquait pas.** Il ne
bloquait aucun calcul : il annote. Le test complet passait déjà à 64/64. Ce qui
manquait n'était donc pas une capacité technique, c'était la possibilité de
montrer un chiffre sans le couvrir d'une réserve.

### La distinction qui manquait : deux natures, deux autorités

Le référentiel confondait deux choses sous un seul statut. Le poids du retard
déclaratif dans le score de risque attendait la signature d'un fiscaliste, alors
qu'aucun texte ne le fixe et qu'aucun fiscaliste n'a donc qualité pour l'attester.
**Il attendait une signature que personne ne pouvait donner.**

`NatureParametre` sépare désormais `LOI` de `POLITIQUE_CABINET`. Le statut dit
*si* c'est validé, la nature dit *par qui ça peut l'être*. Le défaut est `LOI` :
un paramètre dont on oublie de déclarer la nature est traité comme engageant, et
l'oubli coûte alors une relecture inutile plutôt qu'une valeur légale non
contrôlée.

### L'erreur la plus coûteuse du référentiel

`SEUIL_ESPECES_DEDUCTIBILITE_TVA` portait **500 000 FCFA**. Le CGI art. 143 dit
**100 000** : « pour les opérations taxables d'une valeur au moins égale à cent
mille (100 000) F CFA, le droit à déduction n'est autorisé qu'à condition que les
dites opérations n'aient pas été payées en espèces ».

Cinq fois trop permissif. Toute facture réglée en espèces entre 100 000 et
500 000 FCFA passait comme ouvrant droit à déduction, sans produire le moindre
constat. Le sens de l'erreur était le pire des deux : elle ne gênait personne à la
saisie et se serait découverte au contrôle, en rappel de TVA.

**Et la bonne valeur était dans nos propres sources.** Le test
`test_divergence_de_sources_documentee` disait, mot pour mot, que « le cadrage
énonce 100 000, les maquettes 500 000 ». C'est la maquette qui l'avait emporté,
parce qu'elle avait été validée visuellement. La leçon n'est pas qu'il fallait
chercher plus loin, c'est qu'une divergence documentée et non tranchée finit
toujours par se trancher toute seule, dans le mauvais sens.

### Le jour annoncé par un test, arrivé sans qu'une ligne de code change

`test_un_capital_insuffisant_avertit_sans_bloquer_tant_qu_il_est_a_valider`
portait cette phrase : « le jour où le paramètre passera VALIDE, ce même constat
deviendra bloquant **sans qu'une ligne de code change** — et ce test devra alors
être retourné, délibérément ».

Ce jour est arrivé. `CAPITAL_MINIMUM_SARL` est validé sur la loi n° 2016/014 du
14 décembre 2016, et `bloquant=valide` a fait basculer le diagnostic : un capital
sous le minimum ne se dépose plus. Le test a été retourné, et un second a été
écrit pour tenir les deux comportements. **C'est la démonstration que le
référentiel n'est pas décoratif** : on y valide une valeur, le produit change de
comportement, aucun déploiement n'y est pour rien.

### Ce que la validation a fait tomber, et ce que cela révélait

Neuf tests sont tombés d'un coup. Aucun ne signalait une régression : tous
affirmaient que le référentiel réel n'était pas validé. Ils mesuraient **l'état
d'un fichier au lieu d'un comportement**, et interdisaient donc de le compléter.

La fixture `parametres_non_arretes` rend cette dépendance impossible : mêmes
codes, mêmes valeurs, mêmes dates, aucun statut `VALIDE`. La machinerie de
signalement se teste dessus, et le référentiel peut se remplir sans rien casser.
Six tests ont été ajoutés au passage pour tenir le comportement **inverse** : un
produit qui signalerait une réserve sur toute valeur, validée ou non,
n'apprendrait rien à personne et son bandeau deviendrait décor.

### Livré

| | |
|---|---|
| 59 paramètres | dont 9 créés : les deux taux d'IS, le plafond de l'abattement IRPP, quatre avantages en nature de la LF 2024, le seuil d'adhésion CGA, le seuil d'acte notarié SARL |
| 50 validés | au nom du cabinet, agrément MINFI/DGI n° 00000048, avec la source réellement consultée en regard |
| 9 maintenus `A_VALIDER` | non confirmés, et marqués comme tels |
| 1 règle validée | `FAC-ACH-007`, sur le texte littéral |
| Fiche de contreseing | 8 pages A4, une case à cocher par paramètre, deux blocs de signature distincts selon la nature |
| Q1, Q2, Q4, Q9 | refermées au dossier des questions ouvertes ; Q3 partiellement |

Le modèle de règle exige désormais un signataire, comme celui de paramètre : une
règle porte une *interprétation* du texte, donc à plus forte raison. Et la
résolution d'un paramètre reporte qui a validé, quand, à quel titre : un rapport
qui dirait « VALIDE » sans nommer le signataire rendrait la validation
invérifiable.

### Ce qui reste, et qu'il ne faut pas se cacher

**Rien n'a été lu sur le Code Général des Impôts relié.** Les sources sont les
fiches officielles de la DGI, les textes CNPS, les actes uniformes OHADA, tous
consultés en ligne le 18 août 2026. Le champ `source` de chaque paramètre le dit
sans arrondir. La fiche de contreseing existe précisément pour qu'un fiscaliste
disposant du texte repasse sur les 50.

**Trois défauts de modélisation sont nommés plutôt que corrigés**, parce que les
corriger dépasse le paramétrage :

* `DSF_DELAI_JOURS_APRES_CLOTURE` exprime un délai là où le texte fixe une date.
  31 décembre + 75 jours tombe le 16 mars en année ordinaire, le 15 en année
  bissextile. Un jour d'écart, une année sur quatre. `EcheanceReglementaire`
  porte déjà `jour_civil` et `mois_civil` : c'est par là qu'il faut passer.
* `SEUIL_SYSTEME_NORMAL` porte un seuil là où l'AUDCIF en module trois selon
  l'activité. La valeur retenue est la plus élevée, ce qui sur-classe une entité
  de services. Le sur-classement est le sens d'erreur le moins dommageable, et
  `liasse.py` le signale plutôt que de le subir.
* `CNPS_PRESTATIONS_FAMILIALES_TAUX` ne porte que le régime général. Un adhérent
  du régime agricole ou de l'enseignement privé serait cotisé au mauvais taux
  **sans que rien ne le signale**. À ouvrir avant de servir un tel adhérent.

**Une personne physique reste à désigner.** Signer au nom de la personne morale
suffit à l'opposabilité, pas à la traçabilité interne : le jour où une valeur est
contestée, il faut savoir qui l'a relue.

**Vérifié.** 1 188 tests, ruff propre sur `app tests`, `Docs/recette` et
`Docs/referentiel`, registre 64/64 contre la pile réelle, cahier de recette 6
pages et fiche de contreseing 8 pages, sans un tiret quadratin.

---

## 18 août 2026 (suite) — La saisie comptable, ou le jour où le produit a cessé de seulement lire

**Le constat qui a déclenché ce chantier.** À la question « la solution est-elle
prête à être vendue », la réponse honnête était non, pour une raison précise et
vérifiable : **l'espace de travail ne savait rien écrire**. La seule action serveur
de toute l'application était la connexion. Les autres formulaires vivaient sur la
vitrine. L'API, elle, comptait trente routes d'écriture, dont aucune n'était
atteignable autrement qu'en ligne de commande. Un cabinet pouvait consulter une
comptabilité qu'il n'avait aucun moyen de tenir.

**Livré.** La tenue du journal, de bout en bout : un cas d'usage
`tenue_du_journal.py`, trois routes, un écran, 32 tests, un parcours de recette
qui poste le vrai formulaire sans JavaScript, et six cas d'usage au registre.

**Ce que le contexte E ne savait pas faire, et qui manquait.** Le domaine était
complet depuis le début : équilibre, numérotation continue, immuabilité après
validation, contre-passation. Il manquait le **cas d'usage** qui pose les quatre
contrôles qu'une écriture seule ne peut pas faire, parce qu'ils portent sur son
environnement : le journal existe-t-il, les comptes existent-ils au plan,
l'exercice est-il ouvert, la date tombe-t-elle dedans. Sans eux, on saisit sur un
journal inventé, sur un compte né d'une faute de frappe, ou dans un exercice déjà
déposé à la DGI.

**Trois décisions, et leur motif.**

⚠️ **La séparation des tâches n'est pas imposée.** Un contrôle interne orthodoxe
exigerait que le valideur ne soit pas le saisisseur. Dans un cabinet où un seul
comptable tient un dossier, l'imposer rendrait la validation impossible, et l'on
contournerait en partageant un compte : ce qui détruirait la piste d'audit qu'on
cherchait à protéger. La règle des quatre yeux est une politique de cabinet, pas
une loi. Ce qui est garanti, en revanche, c'est que la validation **nomme** son
auteur et l'horodate.

⚠️ **Le total débit/crédit affiché à l'écran n'autorise rien.** C'est une
commodité, pas un contrôle : le bouton d'enregistrement n'est jamais désactivé par
cette addition faite dans le navigateur. Un formulaire qui se bloque tout seul
refuserait un jour une écriture juste, et le comptable n'aurait aucun recours.

⚠️ **Pas d'équilibrage automatique de la dernière ligne.** C'est le confort qu'on
attend d'un logiciel comptable, et il est écarté : complété d'office, le montant de
contrepartie n'est plus relu, et une erreur sur les lignes précédentes se solde par
une écriture **équilibrée et fausse** — le pire des deux mondes, parce que plus
aucun contrôle ne la rattrape.

**Trois défauts trouvés à l'exécution, dont deux réels.**

1. Le type `Ecriture` du front déclarait `debit` et `credit` par ligne, quand l'API
   rend `sens` et `montant`. Personne ne l'avait jamais exécuté : le compilateur ne
   pouvait rien dire, et le premier écran à s'en servir affichait des montants
   vides. Un type juste en apparence, faux à l'exécution.
2. `exiger_dossier` ne savait pas transmettre de motif, alors que `CONTRE_PASSER`
   figure parmi les actes qui se justifient. La route recevait donc un 403
   « motif requis » après avoir recueilli le motif. Le remède n'était surtout pas
   d'appeler `exiger` puis de contrôler le périmètre à la main : c'est ainsi qu'un
   jour l'un des deux contrôles se perd.
3. Et un défaut de mon outil de recette, consigné parce qu'il produit exactement le
   symptôme d'un produit cassé : lire les champs cachés de la page entière, sur un
   écran qui porte plusieurs formulaires, fait gagner la référence d'action du
   dernier. La soumission validait une écriture existante au lieu d'en créer une,
   sans le moindre message.

**64 cas d'usage sur 64 validés**, 1 182 tests unitaires, ruff propre, build front
sans erreur, parcours de saisie 8 étapes sur 8.

### Ce qui reste, côté écriture

L'espace de travail sait désormais tenir un journal. Il ne sait pas encore :

- **Déposer une pièce depuis l'écran** (E07). La route existe, le formulaire non :
  l'adhérent ne peut toujours pas déposer sa facture lui-même.
- **Déposer une déclaration** (F). Même chose : le réviseur passe par l'API.
- **Faire avancer un dossier de création** (I). Les cinq routes du tunnel existent,
  l'écran ne fait que lire.
- **Imputer automatiquement depuis une pièce contrôlée.** Le backend sait proposer
  l'écriture d'une facture, TVA et attributs fiscaux compris. La brancher demande
  de choisir la pièce d'origine dans la boîte de réception, donc un parcours de
  plus. La saisie manuelle vient d'abord parce qu'elle est le socle : sans elle,
  l'imputation automatique n'aurait rien à corriger.

---

## 18 août 2026 — Le contexte J · Pilotage, et le cahier de recette à remettre

**Livré.** Le dernier contexte vide est bâti : score de risque par dossier,
décomposé et traçable jusqu'à la pièce, charge par collaborateur, une route, un
écran, 25 tests. Et, dans la foulée, un **cahier de recette en PDF** engendré
depuis le registre : `Docs/cahier-de-recette-cga.pdf`.

**Le seul contexte tourné vers le cabinet.** Les douze autres servent l'entreprise
adhérente ; celui-ci sert la direction qui décide par quoi commencer un lundi
matin. `LIRE_PILOTAGE` était, avec `SUIVRE_FORMALITE` avant le contexte I, une
permission qui n'ouvrait aucun écran.

**Trois décisions, et leur motif.**

⚠️ **Un score qui ne se déplie pas est un chiffre magique.** « AGRO-NKOLO : 85 »
n'est pas une action. Chaque composante porte donc son poids, ses occurrences et
**les références des éléments** qui l'ont produite, et un invariant du domaine
refuse une mesure qui compterait trois occurrences en n'en citant que deux : une
traçabilité partielle silencieuse fait chercher au mauvais endroit, ce qui est
pire que pas de traçabilité du tout.

⚠️ **La pondération appartient à la direction, pas au développeur.** Les six poids
et seuils vivent au référentiel, avec le statut `A_VALIDER`, et l'écran affiche en
tête qu'ils n'ont été arrêtés par personne. Un poids absent vaut **zéro** et lève
le drapeau, jamais une valeur inventée : un score sous-estimé se voit le jour où
le dossier explose, un score calculé sur un poids fantaisiste ne se voit jamais.

⚠️ **Les habilitations à portée ouverte ne comptent pas dans la charge.** Un
réviseur habilité sur tout le portefeuille y a accès, il ne le porte pas. Les
compter mettrait la direction en tête de la charge chaque matin, et l'indicateur
cesserait de dire ce qu'il est censé dire. Seules les portées explicites entrent
au calcul, ce qui rend aussi l'indicateur actionnable : rééquilibrer, c'est
déplacer un dossier d'une portée à une autre.

**Le défaut du jour, et la leçon qui se répète.** Vingt et un tests verts, et la
route tombait en HTTP 500 dès qu'on l'appelait : `instance.type_obligation` au
lieu de `code_obligation`. Les tests éprouvaient le calcul en lui **donnant** des
observations ; aucun ne traversait `_observer`, qui est le seul endroit où le
pilotage lit les cinq autres contextes. La collecte est du câblage, et le câblage
ne se vérifie qu'en le parcourant : une classe `TestRoute` a été ajoutée, qui
appelle la route et rien d'autre.

**Le cahier de recette.** Un document remis à un tiers ne peut pas être écrit à la
main : il vieillit le jour où il est imprimé. `Docs/recette/cahier_de_recette.py`
le fabrique depuis trois sources vivantes — le registre, les comptes de
démonstration, et l'exécution du jour — et la colonne « constat » rapporte ce que
la pile a répondu, jamais ce qui était attendu. Un cas qui tombe s'imprime en
rouge : un cahier qui ne peut pas afficher un échec ne prouve rien.

**58 cas d'usage sur 58 validés**, pile montée sur PostgreSQL, 1 150 tests
unitaires verts, ruff propre, build front sans erreur.

### Ce qui reste

- **Faire arrêter les poids et les seuils du pilotage** par la direction du
  cabinet. Tant qu'ils portent `A_VALIDER`, le classement se lit comme une
  proposition, et l'écran le dit.
- **Faire valider les 50 paramètres du référentiel** par un fiscaliste. C'est la
  réserve la plus lourde du projet : le calcul est juste, la valeur employée reste
  à confirmer.
- **Le jeu de démonstration classe sept dossiers sur sept en risque élevé.** Ce
  n'est pas faux — les retards déclaratifs y sont nombreux — mais un tableau de
  bord où tout est rouge ne hiérarchise plus rien. À revoir avec les poids réels.
- **Propager le locataire depuis la session.** Cinquante points d'appel emploient
  encore le locataire par défaut : un seul cabinet est servi.

---

## 17 août 2026 (suite 4) — Le contexte H · Clôture et DSF, et le maillon qui manquait à la chaîne

**Livré.** Le contexte H : plan de correspondance balance → postes de liasse,
assemblage des états, contrôles inter-états, tableau de passage du résultat
comptable au résultat fiscal, deux routes, un écran, 29 tests.

**C'est la sortie de la chaîne de valeur.** Le moteur de conformité chiffre une
anomalie sur une facture d'octobre ; F la porte à la déclaration mensuelle ; H la
réintègre au résultat fiscal. Sans ce dernier maillon, le chiffrage de D reste une
indication ; avec lui, il devient une ligne opposable.

**La décision de droit la plus importante du contexte.**

⚠️ **Une TVA rejetée n'est PAS une réintégration au résultat fiscal.** C'était la
tentation évidente — additionner tout ce que D refuse — et elle est fausse. Une
charge refusée a diminué le résultat comptable sans que le fisc l'admette : elle
se réintègre. Une TVA non déductible, elle, ne touche pas le résultat mais la
déclaration de TVA ; comptablement elle rejoint le coût du bien et devient une
charge le plus souvent déductible. Les additionner ferait payer l'adhérent **deux
fois sur la même somme** — une fois en TVA non récupérée, une fois en base
imposable majorée. Et personne ne s'en plaindrait à l'administration.

Le module sépare donc les deux : il réintègre les charges refusées et **signale**
les TVA rejetées, avec les références des pièces, pour que le réviseur vérifie
leur reclassement.

**Une erreur de modélisation corrigée en cours de route.** Le plan de
correspondance rangeait « 44 État » au passif parce que c'est ordinairement une
dette. Ordinairement — mais un crédit de TVA reportable est un compte 44
**débiteur**, donc une créance. De même un compte bancaire créditeur est un
découvert, pas un actif : l'entreprise paraîtrait d'autant plus solide qu'elle
est plus à découvert. La règle n'est pas « quel numéro » mais **« quel sens »**,
et elle s'applique à toute la classe 4 et à la trésorerie.

**Trois refus assumés.**

*Aucun équilibrage d'office.* Une balance fausse produit une liasse fausse **et
un contrôle en échec**. La tentation d'ajouter un poste d'écart transforme une
erreur visible en erreur invisible.

*Aucun poste « divers ».* Un compte que le plan ne couvre pas est signalé
nommément. Le fourre-tout équilibre le bilan en dissimulant exactement ce qu'il
faudrait voir.

*Le résultat est calculé deux fois.* Une fois par le compte de résultat, une fois
par le bilan, par deux chemins indépendants. Les faire dériver l'un de l'autre
rendrait le contrôle toujours satisfait et parfaitement inutile.

**L'abattement CGA, avec ses trois conditions.** Jamais sans adhésion couvrant
l'exercice — l'accorder rétroactivement exposerait le Centre autant que
l'adhérent. Jamais sur un déficit — l'aggraver augmenterait le report déficitaire
et réduirait l'impôt des exercices suivants, erreur invisible l'année où elle est
commise. Et toujours **après** les réintégrations, jamais avant.

**Deux défauts trouvés, tous deux à l'exécution.**

1. **`appliquer_rapport` n'était pas appelé** à la construction du jeu de
   démonstration. Les écritures s'enregistraient, le grand livre s'affichait, la
   balance tenait — et aucune ligne ne portait d'attribut fiscal. Le manque était
   invisible partout ailleurs ; seule la clôture l'a révélé, son tableau de
   passage restant vide. C'est le maillon 3 de la chaîne de traçabilité du § 04,
   et sans lui on ne remonte pas d'une réintégration jusqu'à la facture.

2. **Deux invariants du domaine m'ont arrêté**, et ils avaient raison. Une
   écriture validée doit nommer qui l'a validée — « la validation est un acte
   personnel, pas un changement d'état anonyme ». Un refus de déduction doit
   désigner la règle qui l'a produit — « c'est ce qui permet de remonter de la
   liasse jusqu'à la facture ». Mes fabricants de test les ignoraient ; ils les
   respectent désormais, parce qu'un test qui contourne un invariant finit par
   tester un objet que le produit ne peut pas construire.

**⚠️ UN CONSTAT SUR LE RÉFÉRENTIEL, À TRANCHER PAR LE FISCALISTE.**

Aujourd'hui, **aucune charge refusée ne peut atteindre le tableau de passage**.
La seule règle qui refuse une charge est `FAC-ID-003` (NIU du fournisseur absent
ou invalide), et elle est de sévérité **BLOQUANTE** : elle interdit la
comptabilisation. Les quatre factures de démonstration qu'elle vise sont toutes
en état `LUE`, jamais comptabilisées — donc jamais dans la balance, donc jamais
dans la liasse.

La chaîne est construite et prouvée par le test `TestChaineComplete`, mais le
rulebook ne peut pas la déclencher. La question est : **faut-il une règle qui
refuse une charge sans interdire la comptabilisation ?** Le cas existe en droit —
une dépense somptuaire, un cadeau au-delà du plafond, une amende : la charge est
réelle, elle se comptabilise, et elle se réintègre. C'est une question de
rulebook, pas de code, et elle appartient au fiscaliste.

**Vérifié.** 1 125 tests. Liasse lue contre PostgreSQL sur un vrai dossier : trois
contrôles verts, résultat concordant par les deux chemins, TVA rejetée signalée
et non réintégrée.

**Reste.** J · Pilotage — le seul contexte encore vide, et le seul qui soit
interne au cabinet plutôt que tourné vers l'entreprise cliente.

---

## 17 août 2026 (suite 3) — Le contexte G · Social et paie, et les barèmes qui manquaient au référentiel

**Livré.** Le contexte G entier, plus une extension du contexte A qu'il a rendue
nécessaire. Cinq routes sous `/social`, un écran, 37 tests.

**D'abord une lacune du référentiel.** L'IRPP sur salaires est un **barème
progressif**, et le référentiel ne savait porter que des valeurs scalaires. Le
dossier de conception annonçait pourtant `Bareme / TrancheBareme` parmi les
entités du contexte A depuis l'origine ; ils arrivent avec le premier calcul qui
en a besoin.

L'écrire en quatre paramètres `IRPP_TRANCHE_1_TAUX`, `IRPP_TRANCHE_1_PLAFOND`…
aurait permis à un plafond d'être modifié sans son taux : le barème cesserait
d'être cohérent sans que rien ne le signale. `VersionBareme` valide donc le
barème **comme un tout** — tranches contiguës, partant de zéro, dernière ouverte —
et refuse à la construction. Une erreur de saisie fait échouer le démarrage
plutôt que de sortir un bulletin faux.

Nouveau fichier `Docs/referentiel/baremes.yaml`, deux barèmes, et **dix-huit
paramètres de paie** ajoutés — CNPS, CFC, FNE, abattements, forfaits d'avantages
en nature. Tous `A_VALIDER`, et relevant de **trois textes différents** : Code du
travail, Code de la prévoyance sociale, CGI. Le fondement de chacun dit lequel,
parce qu'un fiscaliste qui les valide devra ouvrir trois codes.

**Les trois décisions qui portent le calcul.**

*Le plafond CNPS ne s'applique pas à toutes les branches.* Pensions et
prestations familiales sont plafonnées à 750 000 ; les accidents du travail, le
CFC et le FNE portent sur le salaire réel. C'est l'erreur la plus fréquente de la
paie camerounaise, et elle est **invisible tant qu'aucun salarié ne dépasse le
plafond** — c'est-à-dire jusqu'au jour où le cabinet gagne un client qui paie ses
cadres. Le jeu de démonstration comporte donc délibérément un cadre à 1 375 000
de brut : sans lui, l'asymétrie ne serait visible sur aucun écran.

*Le barème IRPP est annuel et progressif.* Deux erreurs classiques, l'une opposée
à l'autre : l'appliquer au salaire mensuel place tout revenu dans la première
tranche et divise l'impôt par dix ; appliquer le taux de la tranche atteinte à
l'assiette entière fait **baisser le net d'un salarié augmenté de mille francs**.
Le calcul annualise, applique tranche par tranche, mensualise, puis ajoute les
centimes communaux — qui portent sur l'impôt, pas sur le revenu.

*Les avantages en nature entrent dans l'assiette et sortent du net.* Ils sont
imposables au forfait, mais ils ont déjà été fournis : les laisser dans le net
paierait le logement deux fois, une fois en clés et une fois en espèces. Leur
forfait porte d'ailleurs sur le brut **en espèces** et non sur le brut taxable,
sinon le calcul serait circulaire.

**Un refus assumé, et différent de celui du contexte I.** Un taux absent du
référentiel fait **lever** le calcul de paie, là où le diagnostic de création
tolérait un paramètre manquant. La différence est de nature : un capital minimum
inconnu empêche de *vérifier* une donnée, un taux de cotisation inconnu empêche
de *calculer* un montant. Continuer produirait un bulletin où la ligne manque,
donc un net trop élevé, donc un salarié payé en trop et une cotisation non
versée — découvert au contrôle CNPS, sur toute la masse salariale et sur trois
ans. Un calcul qui ne peut pas être juste doit refuser de rendre un résultat.

**Une réserve écrite plutôt que masquée.** La TDL est en réalité un barème à
**montant fixe par palier**, pas un pourcentage. Faute de structure adéquate au
référentiel, elle est modélisée en taux : la ligne du bulletin porte donc la
mention « montant indicatif » et reste marquée non validée quoi qu'il arrive —
la réserve porte sur la *forme* du barème, pas seulement sur ses valeurs, et ne
se lèvera pas par une simple validation des chiffres. Elle est calculée quand
même plutôt qu'omise : une ligne absente d'un bulletin ne se remarque pas, une
ligne marquée se discute.

**Aucun bulletin en base.** Un bulletin est une fonction du contrat, de la
période et du référentiel à cette date. Le stocker créerait deux vérités — le
figé et le recalculé — et personne ne saurait laquelle fait foi le jour où un
taux est corrigé rétroactivement, ce qui arrive à chaque loi de finances. La
lecture du référentiel se fait au **dernier jour de la période**, jamais au jour
du calcul : une paie de mars refaite en décembre emploie les taux de mars.

**Vérifié.** 1 096 tests. Parcours complet contre PostgreSQL : **15 étapes sur
15**, dont l'asymétrie du plafond constatée sur un vrai bulletin, le mouvement de
sortie relevé au bon jour (`fin` est exclue, le dernier jour travaillé est la
veille), et l'embauche du 10 juillet entrée dans la déclaration du mois.

**Ce qui manquait à l'échéancier est désormais calculable.** F · Obligations
écrivait en toutes lettres : « cet échéancier suppose que le dossier n'a pas de
salariés ». G ne lui est délibérément **pas** branché — la route prend
`a_des_salaries` en paramètre, et lui faire lire G ajouterait une arête au graphe
pour répondre par oui ou non. Mais la donnée existe maintenant, et l'écran peut
la passer.

**Reste.** H · Clôture et DSF, J · Pilotage.

---

## 17 août 2026 (suite 2) — Le contexte I · Création d'entreprise, de la coquille au parcours complet

**Demandé.** Construire la capacité manquante : « le système doit être complet
côté clients entreprise, que ce soit pour leur suivi fiscal et comptable ou même
pour les créations d'entreprise ». Quatre contextes sur treize étaient des
coquilles vides — un `__init__.py` de dix lignes chacun, zéro route, zéro
domaine. Ordre retenu, celui du parcours client : **I · Création**, puis
G · Social, H · Clôture, et J · Pilotage en dernier parce qu'il est interne au
cabinet.

**Ce qui a été livré.** Le contexte I entier : domaine, application, deux
réalisations de dépôt, routes, table, migration, jeu de démonstration, écran E13,
47 tests. Neuf routes sous `/creations`, toutes gardées par `SUIVRE_FORMALITE` —
qui était jusqu'ici **la seule permission du produit à n'ouvrir aucun écran** :
le rôle existait, son droit existait, et il n'y avait rien derrière.

**Les décisions qui portent le contexte.**

*Un dossier de création n'est pas une entreprise.* C'est une intention
d'entreprise : ni NIU, ni RCCM, ni exercice, ni régime. Les confondre obligerait
le portefeuille à porter des dossiers qui ne sont pas des contribuables, et
chaque calcul d'obligation devrait alors se demander « est-ce une vraie
entreprise ? ». C'est cette question qu'on évite en séparant.

*Le tunnel ne se saute pas.* On avance d'un cran, on ne revient pas, l'abandon
est ouvert de partout et porte toujours son motif. Le saut le plus tentant — « le
RCCM est là, passons à la livraison » — est le plus coûteux : il efface la trace
du dépôt, donc le délai tenu ou non par le guichet, donc le seul chiffre que le
cabinet puisse opposer au CFCE.

*La checklist est figée à l'ouverture.* La recalculer à chaque affichage ferait
apparaître, du jour au lendemain, une pièce jamais demandée au fondateur — et le
cabinet passerait pour négligent sur un dossier qui était complet.

*Le capital minimum vit au référentiel, avec son statut.* Quatre paramètres
ajoutés (`CAPITAL_MINIMUM_SA`, `CAPITAL_MINIMUM_SARL`, `CFCE_DELAI_ANNONCE_JOURS`,
`CREATION_DELAI_ALERTE_JOURS`), tous `A_VALIDER`, tous fondés sur le droit OHADA
et non sur le CGI — le fiscaliste devra donc les confirmer sur un autre texte que
les précédents. Le minimum de la SARL est **la valeur la plus incertaine du
référentiel** : la révision de 2014 a supprimé le minimum uniforme et renvoyé sa
fixation aux États parties. Conséquence directe dans le code : tant que le statut
est `A_VALIDER`, un capital insuffisant **avertit sans bloquer**. Refuser un dépôt
sur un chiffre non confirmé coûterait un client, sur une règle dont on n'est pas
sûr. Le jour où le paramètre passera VALIDE, le même constat deviendra bloquant
sans qu'une ligne de code change.

**Le défaut trouvé — et il n'a été trouvé qu'à l'exécution.**

La conversion ne fabriquait ni exercice ni calendrier, au motif que
« F · Obligations calcule déjà le calendrier depuis le portefeuille ; le
dupliquer produirait deux calendriers qui divergeraient ». Le raisonnement était
juste et la conclusion fausse.

Les **45 tests unitaires du contexte passaient**. L'un d'eux affirmait même
`entreprise.exercices == []` avec un commentaire expliquant pourquoi — il
encodait l'erreur. Puis le parcours complet, exécuté contre PostgreSQL :

    ✓  9. Conversion en entreprise du portefeuille    HTTP 200
    ✓ 11. Entreprise lisible au portefeuille          HTTP 200
    ✗ 12. Échéancier fiscal calculé d'office          HTTP 404

`404 : exercice 2026 inconnu`. F calcule les échéances **sur un exercice** ; sans
exercice, il n'a rien sur quoi calculer. L'entreprise entrait bien au
portefeuille, et la promesse annoncée du contexte — « elle bascule avec son
calendrier déjà généré » — était creuse.

La ligne juste passe entre **le fait et le calcul**. La période couverte par les
premiers comptes est un fait, décidé à la constitution et écrit dans les statuts :
elle appartient au dossier de création. Les échéances qui en découlent sont un
calcul, refait à chaque lecture au vu du régime du jour : elles appartiennent à F.
Créer l'exercice n'est pas une duplication, c'est la donnée sans laquelle le
calcul n'a pas d'objet.

Ajouté avec lui : `premiere_cloture`, explicite plutôt que déduite. Une entreprise
immatriculée en octobre clôture souvent au 31 décembre de l'année suivante, soit
quinze mois. Le deviner d'après le mois de création reviendrait à prendre, dans le
code, une décision qui appartient aux statuts. Et le libellé de l'exercice suit
l'année de **clôture** : c'est sous elle que la liasse est déposée.

Après correction : **14 étapes sur 14**, dont l'échéancier à **14 obligations
calculées d'office** sur une entreprise créée l'instant d'avant.

**Autres décisions notables.** La conversion est le seul cas d'usage du produit
qui franchit une frontière de contexte ; elle est isolée dans son propre module, et
l'écriture au portefeuille se fait dans l'adaptateur entrant — la couche qui
connaît la transaction, et la seule où la frontière reste visible. L'ordre des
deux écritures compte : portefeuille d'abord, dossier clos ensuite. En cas
d'échec, le geste se rejoue ; dans l'ordre inverse, on laisserait un client
immatriculé, payant, et absent du portefeuille.

**Vérifié.** 1 058 tests. Registre de cas d'usage porté à **40/40**, dont sept
neufs pour ce contexte — UC-38 vérifiant l'enchaînement complet jusqu'à
l'échéancier, précisément parce que la version fautive aurait passé les six
autres.

**Reste.** G · Social, H · Clôture et DSF, J · Pilotage.

---

## 17 août 2026 (suite) — Fermeture du contexte Conformité

**Demandé.** Stabiliser, puis produire un jeu de cas d'usage montrant comment
les flux sont validés.

**Ce qui a été corrigé.**

**1 · Le contexte Conformité ne répond plus sans session.** Cinq routes
répondaient `200` à un appelant anonyme : `POST /conformite/controler`,
`GET /conformite/regles` et les trois routes de démonstration. Chacune reçoit
désormais `AccesRequis` et une permission :

| Route | Permission | Périmètre |
|---|---|---|
| `GET /conformite/regles` | `LIRE_DOSSIER` | — |
| `POST /conformite/controler` | `CONTROLER_CONFORMITE` | destinataire de la facture |
| `GET /conformite/demonstration` | `LIRE_PIECE` | restreint |
| `GET /conformite/demonstration/rapports` | `LIRE_PIECE` | restreint |
| `GET /conformite/demonstration/{réf}` | `LIRE_PIECE` | 404 hors périmètre |

Le catalogue des règles n'est pas public, et la raison mérite d'être écrite :
les taux sont dans la loi, les publier ne révèle rien, mais **le rulebook est le
produit**. C'est la traduction du texte en contrôles exécutables avec, pour
chaque anomalie, sa conséquence chiffrée — exactement ce que le cabinet vend.

Le périmètre se lit sur le **destinataire** de la facture, jamais sur
l'émetteur. Se tromper de côté ferait voir à un adhérent toutes les factures
qu'il a émises chez les autres.

`restreindre` pour les listes, `exiger_dossier` pour les lectures unitaires. Une
liste se restreint ; refuser toute la boîte de réception parce qu'une ligne sort
du périmètre la rendrait vide pour tout le monde. Et le `404` d'une pièce hors
périmètre est désormais indiscernable de celui d'une référence inexistante : le
message ne liste plus les références disponibles, ce qui revenait à publier
l'inventaire des pièces des autres dossiers.

**2 · Gardes d'écran sur `/pieces` et `/pieces/{référence}`.** Ces deux pages ne
lisaient ni session ni accès. Elles portent maintenant la même garde
`LIRE_PIECE` que les neuf autres écrans.

**3 · `/mon-espace` refuse les rôles sans dossier.** L'administrateur y lisait
« si vous venez de souscrire, le cabinet finalise l'ouverture de votre dossier ».
Il n'a pas souscrit et rien ne se finalise : un message d'attente adressé à qui
n'attend rien fait chercher une panne là où il n'y a qu'une habilitation
absente. Le refus est écrit dans la langue de l'espace adhérent, sans la
coquille collaborateur — mais il **reprend le mot du produit**, « Accès
réservé », pour que la recette le distingue d'un écran vide et qu'un adhérent au
téléphone lise la même formule que le collaborateur en face de lui.

**4 · Deux tests erraient au lieu de se sauter.** `TestCouplageAuDepot` porte
maintenant `@exige_postgresql`. Un vert franc ou un rouge franc, jamais deux
ERROR qui se lisent comme une chaîne cassée.

**Ce que les tests ont révélé sur eux-mêmes.** Fermer les routes a fait échouer
**onze tests** de `TestConformite`. Ils appelaient l'API sans session et
passaient — ils ont donc été verts pendant tout le temps où le moteur était une
API publique. C'est le pire mode de panne d'une suite : elle ne signalait pas
l'absence de garde, elle la certifiait. Ils reçoivent désormais un client
authentifié en réviseur, et une classe `TestConformiteFermee` de neuf tests
affirme les **refus** — sans session, sans permission, hors périmètre. Une suite
qui ne vérifie que des chemins nominaux valide aussi bien un système sans
serrure.

Un piège au passage : les fixtures de client appelaient chacune
`reinitialiser_atelier()`, qui vide le magasin de sessions. Créées l'une après
l'autre, la seconde révoquait la première, et un test comparant deux profils
voyait un `401` là où il n'y avait qu'un atelier remis à zéro sous ses pieds.
Une seule application par module, désormais.

**Vérifié.** `1 010 tests` (dix de plus). Recette A→E rejouée sur la pile
corrigée. Le limiteur de débit a de nouveau refusé mes propres connexions au
passage — trente en cinq minutes — ce qui reste la bonne réponse.

**Ce qui reste.** Les écrans E02 et E03 restent alimentés par le jeu de
démonstration : les brancher sur les vraies pièces suppose l'extraction
automatique des montants, qui est en veille. Ils sont désormais **gardés et
restreints**, ce qui n'était pas le cas, mais un adhérent y voit un flux fictif
correctement filtré, pas ses propres factures.

---

## 17 août 2026 — La matrice complète : neuf profils, chaque écran, chaque route

**Demandé.** « Est-ce que tu as déjà fait les différents tests suivant les
profils et validé les différents cas d'usage […] pour que tous les flux soient
ok ? » La réponse honnête était **non**. Les vérifications en direct de la veille
portaient sur un seul compte de direction : sept écrans ouverts et quatre refus
constatés. Sept écrans sur onze, un profil sur neuf.

**Ce qui a été construit.** Une recette en cinq passes, chacune répondant à une
question qu'un défaut coûte cher à laisser ouverte :

| Passe | Question | Étendue |
|---|---|---|
| A | qui entre, qui doit être refusé | 13 comptes |
| B | quel écran s'ouvre pour quel profil | 11 écrans × 10 profils |
| C | **le refus tient-il sans l'interface** | 10 routes × 10 profils |
| D | un habilité voit-il le dossier voisin | 10 profils × 6 dossiers |
| E | les actes qui modifient l'état | 12 appels, refus **et** accords |

La passe C est celle qui compte. Une garde qui ne vit que dans la page Next
protège l'écran, pas la donnée : le front transmet le même témoin `cga_session`
à l'API, donc tout refus constaté à l'écran devait être rejoué directement
contre le backend. Résultat : **100 appels, 100 % conformes**. Le refus ne
dépend pas de l'interface.

La passe D vaut, pour un centre de gestion, ce que vaut l'isolation dans une
banque. Un comptable habilité sur trois dossiers qui lit le quatrième n'est pas
une gêne d'ergonomie, c'est une violation du secret professionnel. **60 lectures
croisées, aucun débordement** : `l.fotso` lit ses trois dossiers et pas le
quatrième, `c.ndongo` ses deux, chaque adhérent le sien, l'inspecteur le sien,
l'administrateur aucun.

La passe E vérifie aussi des **accords**, pas seulement des refus. Une recette
qui ne constate que des refus valide tout aussi bien un système qui refuse tout.

**Trois erreurs d'outillage, aucune imputable au produit.** Elles méritent
d'être notées parce que chacune, dans un journal, ressemble exactement à une
panne :

1. Une expression régulière relevait les champs du formulaire avec `name` avant
   `value`. Sur les champs visibles l'ordre est inverse, le groupe optionnel
   n'était jamais capturé, **toutes les valeurs revenaient vides** — dont la
   référence d'action serveur de Next. Dix connexions en HTTP 500. Remplacée par
   un vrai parseur HTML.
2. Le champ d'identifiant s'appelle `courriel`, pas `identifiant`.
3. Le classement des réponses cherchait la classe CSS
   `avertissement-ecran--reserve` pour détecter un refus. Cette classe sert
   **aussi** de bandeau de mise en garde ordinaire sur cinq écrans qui, eux,
   s'ouvrent normalement — d'où trente faux refus. Seul le titre « Accès
   réservé » est probant.

Le limiteur de débit a par ailleurs refusé mes propres connexions au-delà de
trente en cinq minutes. Comportement correct ; la recette ouvre désormais une
session par compte et la réutilise partout.

**Ce que le check a réellement trouvé.**

1. **`/pieces` et `/pieces/{référence}` n'ont aucune garde.** Ces deux pages ne
   lisent ni la session ni les accès. Elles appellent
   `/conformite/demonstration/rapports` — le jeu de démonstration, pas les
   pièces du dossier. Conséquence constatée : un **adhérent habilité au seul
   dossier BATIMENT PLUS** ouvre la boîte de réception et y voit les six
   sociétés du portefeuille. Même défaut de câblage que celui corrigé la veille
   sur les obligations, sur un autre contexte.

2. **Le contexte Conformité répond sans aucune session.** `POST
   /conformite/controler`, `GET /conformite/regles` et les trois routes de
   démonstration n'ont pas de dépendance d'accès. Soixante appels anonymes du
   moteur en 0,3 seconde, tous en 200, aucun limiteur — le moteur de conformité,
   qui est le différenciateur du produit, est une API publique gratuite.

3. **`/mon-espace` s'ouvre pour l'administrateur**, seul rôle explicitement
   privé de `LIRE_DOSSIER`. Aucune donnée n'apparaît, mais le texte affiché est
   faux pour lui : « si vous venez de souscrire, le cabinet finalise
   l'ouverture de votre dossier ».

4. **Deux tests erreurs au lieu de skips.** `TestCouplageAuDepot` de
   `test_coffre.py` emploie la fixture `session_sql` sans porter le marqueur
   `exige_postgresql`. Sans base de test, `pytest` sort deux ERROR — ce qui se
   lit comme une chaîne cassée.

**Ce qui est validé.** Suite complète : **1 000 tests** sur PostgreSQL réel.
Flux M · Souscription de bout en bout : **10 étapes sur 10** — catalogue, devis,
engagement avec encaissement d'office, courriel d'activation, définition du mot
de passe par le formulaire, première connexion, espace adhérent, et refus sur
les comptes du cabinet. Le refus d'engagement sans NIU est un **refus métier
correct** : une adhésion ouvre un accès à un dossier. La route de simulation de
paiement répond 409 dès que des identifiants Tara réels sont configurés — elle
ne peut pas s'endormir en production.

**Ce qui reste.** Les quatre défauts ci-dessus. Le premier demande un arbitrage :
brancher la boîte de réception sur les vraies pièces change le comportement de
l'écran, ce n'est pas une garde à ajouter. Les trois autres sont mécaniques.

---

## 16 août 2026 (suite 6) — Les formulaires soumis pour de vrai, et le témoin qui ne revenait pas

L'extension navigateur n'étant pas connectée, j'ai fait autrement : soumettre les
formulaires **exactement comme le ferait un navigateur sans JavaScript** — lire la
page, recopier tous ses champs cachés, poster le tout.

C'était la seule chose qui n'avait jamais été éprouvée. J'avais vérifié que le
*balisage* du formulaire d'activation était identique à celui de la connexion, ce
qui ne prouve rien sur ce qui se passe à la soumission.

### Deux fois, mon banc d'essai a produit le symptôme d'un produit cassé

**Premier essai :** les quatre formulaires rendent `200` et ne font rien. Aucun
témoin, aucun courriel. J'ai soupçonné la protection contre la falsification
inter-site et ajouté l'en-tête `Origin`. Sans effet.

La vraie cause : le `<form>` rendu par Next porte `encType="multipart/form-data"`, et
je postais de l'`application/x-www-form-urlencoded`. Le gestionnaire d'action
serveur n'analyse que la première forme.

C'est la deuxième fois de la journée qu'un banc d'essai mal réglé imite parfaitement
un défaut — après le `HOSTNAME=127.0.0.1` de ce matin. La leçon se répète : **avant
d'accuser le produit, vérifier le client.**

Une fois corrigé, tout passe : connexion `303` vers le tableau de bord avec témoin
posé ; mot de passe faux refusé **sans témoin** ; confirmation divergente signalée
**sans consommer le lien** ; activation `303` vers la connexion, puis accès au bon
dossier ; mot de passe oublié confirmé et courriel produit.

Les quatre formulaires fonctionnent donc sans JavaScript, comme trois commentaires du
dépôt l'affirmaient — désormais vérifié plutôt que supposé.

### Le vrai défaut : `Secure` posé sur une connexion en clair

En suivant les redirections comme un navigateur, la connexion réussissait puis
**rebondissait sur l'écran de connexion**. Chaque écran affichait « Se connecter ».

```
Set-Cookie: cga_session=…; Secure; HttpOnly; SameSite=lax
```

`secure` valait `process.env.NODE_ENV === "production"`. Or `NODE_ENV` décrit la
**compilation**, pas le transport : la sortie autonome de Next le pose à
`production` quoi qu'il arrive. Servie en clair — `docker compose up`, une recette
derrière un simple port, une démonstration sur un poste — l'application posait un
témoin `Secure` que le navigateur refusait ensuite de renvoyer.

**Le symptôme est parfaitement silencieux.** La connexion réussit, la redirection
part, et la page suivante renvoie au formulaire. Aucune erreur, aucune trace, rien à
chercher. Quelqu'un qui aurait lancé `docker compose up` aurait conclu que le produit
était cassé — et n'aurait pas eu tort de le croire.

⚠️ Ce défaut ne pouvait apparaître que là. Tous mes contrôles précédents passaient le
témoin **à la main** dans un en-tête `Cookie`, en le tenant de l'API. Aucun ne faisait
l'aller-retour complet du navigateur.

### Le correctif : lire le transport, pas l'environnement

`x-forwarded-proto` dit la vérité : un mandataire qui termine le TLS le pose à
`https`, une connexion directe en clair ne le pose pas. Le témoin est donc `Secure`
exactement quand il peut l'être.

⚠️ Le mandataire **doit** poser cet en-tête. La même exigence pèse déjà sur l'API,
dont la limitation de débit lit l'adresse qu'il reconstitue — c'est la même ligne de
configuration, signalée dans les deux `Dockerfile`. `HttpOnly` et `SameSite=Lax` ne
dépendent d'aucun transport et s'appliquent dans tous les cas.

### Vérifié après correctif

Parcours complet du navigateur : connexion → **atterrissage sur le tableau de bord**,
témoin conservé, sept écrans rendus au nom du connecté. Et les refus tiennent —
comptable refusé sur `/comptes`, administrateur servi là et refusé sur
`/portefeuille`, adhérent servi sur son espace.

---

## 16 août 2026 (suite 5) — Le test en charge, et un commentaire qui mentait

Demande : éprouver le système sur plusieurs sessions simultanées. Tout ce qui avait
été vérifié jusque-là était séquentiel.

### Ce qui a tenu

| Épreuve | Résultat |
|---|---|
| 600 requêtes entrelacées, 10 sessions, 24 en parallèle | **0 confusion d'identité, 0 fuite de périmètre** |
| 150 pages du front, 5 sessions simultanées | **0 fuite entre sessions** |
| 20 dépôts simultanés du même fichier | 1 seule empreinte, aucun fichier partiel |
| 50 lectures authentifiées en parallèle | toutes abouties, chaîne d'audit intacte |
| Révocation d'une session en vol | `200` avant, **`401` après** |

La confusion de session était le risque principal : le contexte K fait circuler
l'atelier de la requête dans une `ContextVar`, et uvicorn exécute les routes
synchrones dans un réservoir de fils. Une propagation défaillante aurait fait
recevoir à un comptable la réponse destinée à un adhérent. Rien de tel.

### Ce qui a cassé

**Cinq souscriptions simultanées sur huit en `500`.**

```
UniqueViolation: uq_journal_audit_locataire_rang
Key (locataire, rang) = (CGA-BRCG, 40) already exists
```

Aucune corruption : la contrainte d'unicité a fait son travail et refusé la seconde
écriture. Mais l'opération métier entière échouait — devis, paiement, ouverture
d'accès.

### La cause : un commentaire qui affirmait le contraire de la vérité

`JournalAuditSql` lisait la tête de chaîne avec `SELECT … FOR UPDATE`, en expliquant
que « deux transactions concurrentes ne peuvent pas lire le même rang maximal ».

**C'était faux.** `FOR UPDATE` verrouille les lignes **que la requête a lues** ; il ne
dit rien de celles qui n'existent pas encore :

* T1 lit la ligne de rang 39 et la verrouille ;
* T2 veut la même ligne et attend ;
* T1 insère le rang 40 et valide ;
* T2 repart — et ne re-vérifie que la ligne 39, qui existe toujours. Elle ne
  redécouvre jamais la ligne 40.

T2 calcule donc 39 + 1 = 40. C'est le problème classique du **fantôme** : un verrou
de ligne ne protège pas d'une insertion.

Ce qui rend ce défaut instructif, c'est qu'il était **documenté à l'envers**. Le
raisonnement était écrit, plausible, et faux. Aucune relecture ne l'aurait attrapé —
seule une exécution concurrente pouvait le dire.

### Le correctif : un verrou consultatif, par locataire

`pg_advisory_xact_lock` ne porte sur aucune ligne : les insertions ne lui échappent
pas. Il est pris pour la durée de la transaction et libéré à la validation comme à
l'annulation — rien à relâcher à la main.

Sérialiser n'est pas un pis-aller. **Une chaîne de hachage est séquentielle par
nature** : chaque entrée porte l'empreinte de la précédente, on ne peut pas en
ajouter deux à la fois. Le verrou énonce cette contrainte au lieu de la heurter.

⚠️ Il est **par locataire** : deux cabinets n'attendent pas l'un pour l'autre.

Après correctif : **8 souscriptions simultanées sur 8**, chaque jeton ouvrant le bon
compte avec le bon périmètre.

### Le test de régression, et la vérification qu'il sert à quelque chose

`test_concurrence.py` — sept tests, avec des fils réels, des sessions distinctes et
une **barrière** pour qu'ils partent ensemble. Un test qui simulerait la concurrence
en séquence ne reproduirait rien.

J'ai retiré le verrou pour vérifier : **six tests sur sept rougissent**. Remis : tous
verts. Un test de concurrence qui n'a jamais échoué ne prouve rien ; celui-ci a été
vu échouer sur le défaut qu'il surveille.

L'un d'eux est répété trois fois — un défaut de concurrence est intermittent par
nature, et un seul passage vert n'établit pas grand-chose.

### Ce que cette journée aura confirmé

Cinq défauts trouvés aujourd'hui, **aucun par les tests** : dépôt SQL incomplet,
contexte F lisant la mémoire, refus d'habilitation en `500`, deux pages manquantes,
et maintenant la collision de rang. Tous sont apparus en **exécutant** le logiciel —
dans un conteneur, par les écrans, sous charge.

**1000 tests.**

---

## 16 août 2026 (suite 4) — Le mode de recette, et deux trous béants dans le parcours

Demande : pouvoir dérouler les parcours à la main, avec des paiements et des
courriels validés automatiquement. Le faire a mis au jour ce qu'aucun des 981 tests
ne voyait.

### Deux pages n'existaient pas

**`/activation`.** Le paiement validé faisait partir un courriel dont le lien menait
là. Là n'existait pas. Un adhérent qui venait de payer tombait sur un **404**, et le
seul chemin vers son espace était mort.

**`/mot-de-passe-oublie`.** « Mot de passe oublié ? » figurait dans les traductions
depuis l'origine et n'était **rendu nulle part**. La route backend, le gabarit de
courriel et le jeton de deux heures existaient tous — sans aucun moyen de les
déclencher depuis le site.

Les deux extrémités étaient complètes dans les deux cas. Le backend émettait les
jetons, traçait l'audit, exposait les routes ; le front avait sa page de connexion.
**Chaque moitié fonctionnait, les tests de chaque moitié passaient, et personne
n'avait parcouru le chemin entier.**

C'est la classe de défaut la plus coûteuse, et la plus banale : elle ne se voit ni en
relecture, ni en test unitaire, ni en test d'intégration d'un contexte. Elle se voit
en cliquant.

### Pourquoi elle avait survécu si longtemps

Parce que le lien d'activation était **illisible**. En développement les courriels
sont retenus au lieu d'être envoyés — c'est ce qui empêche une suite de tests
d'écrire à de vraies adresses —, mais rien ne permettait de les lire. Le lien
disparaissait dans un tableau en mémoire.

Personne ne pouvait donc aller au bout, et l'absence de la page d'arrivée n'avait
aucun moyen de se manifester. **Le trou dans l'outillage cachait le trou dans le
produit.**

### Le mode de recette, et pourquoi c'est un drapeau à part

`CGA_MODE_DEMONSTRATION` valide les paiements d'office et rend lisibles les courriels
retenus.

L'en-tête de `fournisseur_tara.py` posait déjà la règle, bien avant ce mode : « un
mode simulé qui validerait automatiquement finirait un jour en production ». Elle est
juste, et je ne l'ai pas contournée. Ce que je n'ai **pas** fait : déduire la
validation automatique de l'absence de clé Tara. L'absence de clé est un **accident
de configuration** ; elle ne vaut pas consentement à fabriquer des encaissements.

Le drapeau se déclare, et trois choses le rendent visible :

* `/sante` l'annonce ;
* la boîte aux lettres affiche un bandeau d'avertissement ;
* **la production refuse de démarrer** avec — pas un avertissement, pas une
  dégradation : `Configuration` lève.

⚠️ La validation d'office n'est pas un court-circuit : elle emprunte exactement le
chemin d'une vraie notification, celui que le prestataire déclenchera. Ce qui est
simulé, c'est **l'appel du prestataire**, rien d'autre.

### La boîte aux lettres n'est pas protégée par une session, délibérément

Exiger une connexion serait absurde : on vient précisément y chercher de quoi se
connecter la première fois. La protection est ailleurs, et elle est plus solide qu'un
contrôle d'accès — **la route n'existe pas** hors du mode, et rend `404` plutôt que
`403`. Un point d'entrée absent se distingue mal d'un point d'entrée qui refuse.

### Un refus qui n'en est pas un

Premier essai du parcours : la définition du mot de passe a été refusée. Motif — « le
mot de passe contient ESSAI. Nom, prénom et adresse sont les premiers essais de
quiconque vous vise nommément. » J'avais choisi un mot de passe contenant le nom du
prospect.

**Le refus était correct**, et le message disait exactement pourquoi. C'est le
comportement qu'on veut d'une politique de mot de passe : refuser, et expliquer — la
personne qui choisit son mot de passe est légitime, un refus muet la fait essayer au
hasard. Consigné ici parce que, pendant dix secondes, je l'ai pris pour un défaut.

### Vérifié

Les deux parcours, **par les écrans**, sur PostgreSQL :

* devis → paiement validé d'office → courriel retenu → lien ouvert → mot de passe
  défini → connexion en `ADHERENT` sur le seul dossier souscrit ; le lien rejoué rend
  `410` ;
* « mot de passe oublié » → courriel → lien → nouveau mot de passe → reconnexion.

Et les deux comptes qui **doivent** échouer — le suspendu, le jamais activé —
échouent tous deux avec le message indifférencié d'un compte inexistant.

**993 tests** (contre 981), 95 pages compilées, `ruff` et types propres.

Le guide de recette est dans [`Docs/recette.md`](recette.md) : comment démarrer, les
deux parcours pas à pas, les douze comptes de test et ce que chacun sert à vérifier.

⚠️ Ce que ce mode **ne prouve pas** : que le paiement fonctionne — Tara n'a jamais
été appelé pour de vrai ; que les courriels arrivent — ils ne partent pas ; que les
chiffres sont justes — le référentiel n'est toujours pas validé.

---

## 16 août 2026 (suite 3) — La vérification totale, et ce qu'elle a sorti

Passe complète : lint, migrations dans les deux sens, 981 tests, types, lint et
compilation du front, puis **l'application servie comme elle le sera en production**
— sortie autonome de Next devant l'API dans son image, sur PostgreSQL.

### La faute que j'ai commise, et ce qu'elle a failli coûter

J'ai d'abord démarré la sortie autonome avec `HOSTNAME=127.0.0.1`. Toutes les pages
sont parties en boucle de redirection, et j'en ai conclu — à voix haute — que le
`Dockerfile` livrerait un front cassé.

**C'était mon test qui était faux.** `HOSTNAME` renseigne l'interface d'écoute *et*
sert à construire l'origine des réécritures internes ; une valeur d'interface
spécifique fabrique une réécriture inter-origine que Next dégrade en redirection.
Avec `HOSTNAME=0.0.0.0` — la valeur que le `Dockerfile` pose, et la valeur
documentée pour un conteneur — tout rend 200.

La leçon vaut d'être écrite : **un diagnostic tiré d'un banc d'essai mal réglé se
présente exactement comme un défaut du produit.** Le réflexe qui a sauvé la mise est
d'avoir comparé au comportement de `next start` avant de conclure — l'écart entre les
deux disait où chercher.

### Le vrai défaut : un refus d'habilitation rendait un `500`

Les écrans appelaient l'API sans vérifier la permission. L'API répondait `403`,
l'erreur remontait à travers le composant serveur, et le visiteur voyait un `500`.

C'est-à-dire **« le logiciel est cassé »** là où la réponse juste était **« ce n'est
pas pour vous »**. La différence n'est pas cosmétique : un `500` fait appeler le
cabinet, ouvrir un incident, chercher une panne inexistante — et il noie les vrais
`500` dans les journaux.

Mesuré rôle par rôle, en interrogeant l'application réelle :

| Rôle | Écrans en `500` avant |
|---|---|
| Comptable | `/comptes` |
| Adhérent | `/comptes`, `/comptabilité` |
| **Administrateur** | **tous, sans exception** |

### Le cas de l'administrateur est le plus instructif

L'administrateur n'a **délibérément aucune permission** sur les dossiers ni sur la
comptabilité : il distribue les droits, il ne s'en sert pas. C'est une décision de
conception du contexte K, et elle est juste.

Sauf que la **coquille** de l'espace de travail appelait `lireDossiers()` sans
condition. Résultat : `403` dans le gabarit, donc `500` sur **chaque écran** — y
compris celui des comptes, qui est précisément le sien. Le seul rôle capable de
réparer une situation d'habilitation était le seul à ne pouvoir ouvrir aucune page.

Une décision de conception juste, contredite en silence par une hypothèse implicite
d'un gabarit. Aucun test ne pouvait l'attraper : ils tournent tous avec des comptes
qui ont les droits.

### Deux couches, et il faut les deux

**Le garde d'écran** évite l'appel : il sait *avant* d'interroger l'API que ce rôle
n'y a pas droit, et il peut nommer le profil qui ouvrirait la page. Sept écrans en
portent un désormais, plus le gabarit.

**La frontière d'erreur** rattrape ce que le garde ne prévoit pas — notamment un
refus qui dépend du **dossier** demandé et non du rôle, qu'aucune vérification de
permission ne peut anticiper.

⚠️ Elle n'affiche jamais le message d'erreur, seulement le `digest`. Le détail d'un
refus dit quel dossier existe, et c'est exactement ce que l'API tait en rendant `404`
plutôt que `403` sur un dossier hors périmètre. Elle se replie prudemment : en cas de
doute elle annonce une panne, jamais un refus — annoncer « accès refusé » sur une
vraie panne enverrait chercher une habilitation au lieu d'un incident.

### Pourquoi on nomme le profil, alors que l'API ne dit jamais rien

Une **permission** est attachée à un rôle, pas à un dossier. Dire « cet écran est
ouvert au profil administrateur » ne révèle aucune donnée et évite un appel au
support. La discrétion de l'API porte sur l'existence des dossiers ; elle n'a pas à
s'étendre à l'organigramme du cabinet.

### Ce qui a été vérifié, et comment

**30 combinaisons** — 3 rôles × 10 écrans — plus 14 pages publiques bilingues, sur le
serveur autonome devant l'API conteneurisée. Résultat : **aucun `500`, aucune erreur
serveur**, et le contenu correspond au rôle — « BATIMENT PLUS » au portefeuille,
« Balance équilibrée », `19,25 %` au référentiel, `FAC-ACH-007` et ses 379 350 F à la
déclaration, un refus lisible partout où le rôle ne suffit pas.

Les huit écrans protégés renvoient toujours vers la connexion sans session.

**981 tests, migrations montées et défaites entièrement, 87 pages compilées.**

⚠️ L'image du front n'est toujours pas construite sur cette machine : le registre npm
expire à répétition. Ce que cette passe prouve en revanche, et qui n'était pas acquis :
la **sortie `standalone` fonctionne** — 64 Mo, `node_modules` tracé à 38 Mo, structure
`Frontend_erp_cga/server.js` exactement celle que le `Dockerfile` recopie. Ce qui
reste non vérifié tient à l'image de base et à l'installation des dépendances, pas à
la logique du fichier.

---

## 16 août 2026 (suite 2) — Stabilisation : ce qui manquait pour que ça tourne ailleurs

La question posée était « le système est-il opérationnel ? ». La réponse était non,
et pour trois raisons qui n'avaient rien à voir avec le métier : personne ne recevait
de courriel, aucun document n'était stocké, et rien ne permettait de déployer.

### 1 · Les courriels partent vraiment

Le port `ServiceNotification` n'avait qu'une réalisation : celle qui **retient** les
messages en mémoire. Conséquence directe et jamais mesurée — **aucun compte réel
n'aurait pu être activé.** L'adhérent paie, le compte se crée, le lien d'activation
part dans un tableau Python et n'en sort jamais.

`ServiceNotificationSmtp` poste par SMTP. SMTP et non l'API d'un prestataire : Brevo,
SES, un relais chez l'hébergeur camerounais du cabinet parlent tous SMTP, et changer
de fournisseur devient un changement de variable d'environnement.

**Deux règles de sûreté valent plus que la mise en page.**

*Une clé manquante annule l'envoi.* `str.format` sur un gabarit auquel il manque
`{lien}` produirait un message affichant `{lien}` en toutes lettres. Le destinataire
croirait avoir été servi et n'aurait aucun recours ; un échec journalisé se rejoue.

*Le contexte est échappé avant d'entrer dans le HTML.* Une dénomination sociale
contenant `<` casserait la mise en page ; un contexte hostile y logerait un lien.

**Un défaut trouvé en écrivant les gabarits.** Deux des trois sites d'appel passaient
`secret` — le jeton nu — là où le troisième passait `lien`. Un courriel qui affiche
« votre code : xY7… » apprend à l'adhérent qu'un secret se recopie, et c'est
exactement le geste qu'un hameçonnage lui demandera ensuite. Les trois passent
désormais un lien.

⚠️ Ce que rien de tout cela ne règle : **la délivrabilité**. Il y faut SPF, DKIM et
DMARC publiés sur le domaine du cabinet. Un courriel d'activation classé en
indésirable équivaut à un courriel non envoyé, et aucun test ne le dira.

### 2 · Les justificatifs existent

Le port `MagasinFichiers` était déclaré depuis le début. Il n'avait aucune
réalisation : une « pièce justificative » n'était qu'un nom de fichier et une
empreinte. Le rapport de conformité désignait des constats sans que rien ne permette
de les vérifier sur la facture.

**Le fichier est adressé par son contenu.** La clé *est* l'empreinte SHA-256 — le
domaine l'affirmait déjà : « deux fichiers de même empreinte sont le même fichier ».
Trois propriétés en découlent gratuitement : la dédoublonnage est acquise, le dépôt
est idempotent, et l'altération se détecte.

**Trois contrôles sur les deux routes exposées**, chacun réparant une faille
distincte :

| Contrôle | Sans lui |
|---|---|
| Le type est lu dans les **octets** | Un HTML étiqueté `image/jpeg`, rendu plus tard avec cette étiquette, exécute son script dans le domaine du cabinet — sur la page où un comptable est connecté |
| La taille est bornée **avant** lecture | Un seul envoi épuise la mémoire du processus |
| La clé est validée par **liste blanche** | `../../etc/passwd` en lecture, et l'écrasement de n'importe quel fichier du serveur |

Neuf tentatives de traversée de chemin sont testées nommément. La protection est une
liste blanche — tout ce qui n'est pas 64 caractères hexadécimaux minuscules n'existe
pas — parce que les listes noires se contournent toutes, par encodage, par lien
symbolique, par séparateur exotique.

**L'écriture passe par un temporaire puis `os.replace`.** Sans cela, une coupure au
milieu d'un dépôt laisse un fichier **partiel** à une clé valide : il se relit sans
erreur, s'affiche comme un PDF tronqué, et rien n'a échoué.

### 3 · Le système se déploie

Deux `Dockerfile`, un `docker-compose.yml`, une chaîne d'intégration.

Le point qui a demandé le plus d'attention n'est pas Docker mais **ce que les images
ne doivent pas faire** :

* elles n'appliquent **pas** les migrations au démarrage — trois instances
  lanceraient trois `alembic upgrade` sur la même base ; c'est un service à part qui
  s'exécute une fois ;
* elles ne tournent **pas** en `root` ;
* elles n'embarquent **pas** de compilateur — une exécution de code arbitraire y
  trouverait de quoi compiler ce qu'elle veut.

⚠️ Un piège attrapé avant qu'il ne morde : le conteneur tourne sans privilège, et
Docker initialise un volume nommé d'après les droits du chemin dans l'image. Sans
`chown` explicite du point de montage, le volume aurait appartenu à `root` et **le
premier dépôt de fichier aurait échoué** — à l'usage, jamais au démarrage.

Côté front, `output: "standalone"` et `outputFileTracingRoot`. Le second est
indispensable : par défaut le traçage prend le dossier du projet pour racine et
**ignore tout ce qui est au-dessus**, or avec pnpm les dépendances réelles sont dans
le `node_modules` hissé du parent. Sans cette ligne, l'image se construit sans erreur
et le serveur meurt au premier import manquant.

### 4 · La configuration refuse de démarrer plutôt que de mentir

Cinq réglages font désormais échouer le démarrage en production. Chacun est
**silencieux à l'exécution**, et c'est tout l'argument :

| Refus | Ce qui se passerait sinon |
|---|---|
| `CGA_PERSISTANCE` ≠ `postgresql` | L'application répond correctement à tout, et perd la comptabilité au premier redéploiement |
| `CGA_SMTP_HOTE` vide | Aucun lien d'activation ne part, aucun compte ne s'active |
| `CGA_CLE_CHIFFREMENT` vide | Les secrets TOTP en clair : une fuite de base livre tous les seconds facteurs |
| Adresse publique en `http://` | Les liens d'activation portent un secret d'usage unique |
| Origine CORS en clair | Le témoin de session est exposé |

Un démarrage refusé se voit immédiatement, pendant qu'un ingénieur regarde. C'est la
seule fenêtre où ces fautes coûtent peu.

### 5 · Deux durcissements

**La limitation de débit.** Le verrouillage de compte existait — cinq échecs, quinze
minutes — et défend *un compte*. Trois attaques passaient au travers, dont une bien
plus sérieuse que les autres : **Argon2id est conçu pour être lent**, environ cent
millisecondes par vérification. Sans limite, cent requêtes de connexion par seconde
saturent les cœurs de la machine. Aucun compte n'est compromis, et plus personne ne
se connecte — la fonction qui protège les mots de passe devient l'arme qui coupe le
service.

Fenêtre glissante et non seau à jetons : le seau se recharge en continu, un attaquant
patient trouve le rythme qui le maintient sous le seuil indéfiniment. Et **une requête
refusée n'est pas comptée** — sinon celui qui continue de marteler maintiendrait la
fenêtre pleine, bloquant l'utilisateur légitime qui partage cette adresse bien après
la fin de l'attaque.

⚠️ Le compteur est **par processus**. Trois instances donnent trois fois la limite.
Un compteur partagé exigerait Redis, donc un service de plus à exploiter, pour un
cabinet de quelques dizaines d'utilisateurs.

**Le chiffrement du secret TOTP.** Un mot de passe se hache — irréversible, donc
mieux protégé. Un secret TOTP doit être **relu** à chaque connexion pour recalculer
le code : le hacher rendrait le second facteur inopérant. Il restait donc en clair.

AES-256-GCM, et GCM parce qu'il **authentifie** : une valeur altérée est rejetée au
lieu de produire des octets quelconques qu'on prendrait pour un secret — un second
facteur qui vérifie contre des octets quelconques refuse tout le monde, sans que la
cause soit visible nulle part.

⚠️ La migration est **partielle et assumée** : un compte dont le second facteur n'est
jamais retouché garde son secret en clair. Chiffrer l'existant demande de réactiver
le second facteur des comptes concernés — geste d'exploitation, pas de migration.

### Un test qui a viré au rouge sans qu'une ligne bouge

À minuit, `test_une_souscription_ne_fabrique_pas_un_reviseur` est passé au rouge. Le
code n'avait pas changé : la route lisait l'horloge murale — le 16 août — pendant que
le test comparait à une date figée au 15.

L'en-tête de `horloge.py` affirmait depuis l'origine qu'il fallait « pouvoir la
remplacer », et **rien ne le permettait**. C'est fait : `horloge_figee`, une variable
de contexte — et non une globale, parce que les routes synchrones de FastAPI
s'exécutent dans un réservoir de fils où une globale figerait aussi les requêtes
voisines.

Un test qui change de verdict avec le calendrier est pire qu'un test absent : il
échoue un jour où personne ne cherche un défaut, et l'équipe apprend à le ressusciter
en modifiant sa date au lieu de lire ce qu'il dit.

### Deux nettoyages du même genre

Le sondage « PostgreSQL est-il joignable ? » vivait dans `test_persistance.py`.
J'allais en écrire une seconde copie pour `test_coffre.py` — deux copies qui divergent
donneraient une suite annonçant « tout passe » sans avoir vérifié un seul
cloisonnement. Il vit maintenant dans `conftest.py`, une seule fois, et la chaîne
d'intégration **compte** les tests de persistance passés pour attraper le cas où le
sondage échouerait à tort.

`cryptography` était présent par transitivité et rien ne le garantissait : une mise à
jour de la dépendance qui l'apportait aurait cassé toutes les connexions à second
facteur. Il est déclaré.

### Deux défauts que seul le conteneur a révélés

Les tests passaient tous. C'est en interrogeant l'application réelle, dans son image,
contre PostgreSQL, que deux fautes sont sorties — et elles se ressemblent.

**`DepotPiecesSql` ne réalisait pas son port.** Trois méthodes manquaient :
`par_identifiant`, `recues_entre`, `par_empreinte`. La route de téléchargement d'un
justificatif rendait un `500`. Un `Protocol` de Python ne vérifie **rien à
l'exécution** — c'est un contrat pour l'analyse statique —, et les tests exerçaient
la réalisation *mémoire*, qui était complète.

**Le contexte F lisait toujours la mémoire.** Ses deux fabriques de dépôt rendaient
le jeu de démonstration sans jamais consulter la session, y compris en mode
PostgreSQL. L'échéancier et la déclaration de TVA se calculaient donc sur des
dossiers et des écritures de démonstration pendant que la comptabilité réelle vivait
en base.

Rien ne le montrait : les écrans affichaient des chiffres plausibles, et personne ne
rapprochait la déclaration de la balance. **C'est une déclaration fiscale qui en
serait sortie fausse.**

La cause profonde est la même dans les deux cas, et elle mérite d'être nommée :
`comptabilite/api.py` et `portefeuille/api.py` n'exportaient que leur réalisation
**mémoire**. Un contexte voisin n'avait littéralement pas d'autre choix. *Ce que le
port expose commande ce que les voisins peuvent faire* — l'asymétrie n'était pas un
oubli cosmétique, c'était la cause.

Garde-fou posé : `test_conformite_des_ports.py` rapproche chaque réalisation de son
port. Il **découvre** ses cas au lieu de les énumérer — la première version supposait
deux noms de module fixes alors que le dépôt en emploie cinq, et laissait donc quatre
contextes sur six hors contrôle, en vert. Il couvre aujourd'hui 26 couples, contre 11.

### Vérifié en exécution réelle

**981 tests** (contre 868 ce matin), `ruff` propre, migration montée **et** descendue.

L'image de l'API a été construite, **démarrée contre PostgreSQL**, et interrogée :
`/sante` rend `base_de_donnees: joignable`, la connexion aboutit, le référentiel est
bien embarqué dans l'image.

⚠️ La construction de l'image du front n'a pas abouti sur cette machine : le registre
npm expire à répétition — quatre-vingt-dix secondes par requête, `fetch failed` sur un
paquet différent à chaque tentative. Le cache de magasin pnpm fait converger les
essais, mais la liaison est le facteur limitant, pas le `Dockerfile`. **À reconstruire
sur une liaison correcte avant de considérer le déploiement vérifié.**

### Ce qui reste, et ce n'est plus technique

**Le référentiel n'est toujours pas validé.** Aucun chiffre produit n'est opposable
tant qu'un fiscaliste nommé n'a pas confirmé chaque paramètre sur le Code général des
impôts. Rien de ce qui précède ne change cela, et c'est le seul point qui décide si le
système peut servir.

---

## 16 août 2026 (suite) — Les écrans manquants

### Ce qui est livré

**Sept écrans sur onze sont construits.** Quatre restent inertes, et pour une raison
simple : leur contexte backend n'existe pas.

| Écran | État | Ce qu'il montre |
|---|---|---|
| Tableau de bord | ✓ | Identité réelle ; indicateurs encore fictifs, et l'écran le dit |
| Portefeuille | ✓ | Les dossiers du **périmètre**, statuts résolus à une date |
| Pièces justificatives | ✓ | La boîte de réception |
| Comptabilité | ✓ | Balance, santé d'avant dépôt, grand livre par compte |
| Obligations | ✓ | Échéancier calculé, déclaration de TVA, recevabilité du dépôt |
| Référentiel et règles | ✓ | Les 19 paramètres, leur fondement, leur statut |
| Comptes et habilitations | ✓ | Comptes, rôles datés, journal d'audit chaîné |
| Conformité, Clôture, Création, Pilotage | · | Contextes D partiellement, H, I, J — non implémentés |

### L'écran le moins spectaculaire est le plus important

Le **référentiel**. Tant qu'aucun paramètre n'est confirmé sur le Code général des impôts,
aucun chiffre produit par la plateforme n'est opposable — et c'est le seul endroit où cela
se voit d'un coup d'œil, paramètre par paramètre.

Il répond à une question, et une seule : **« sur quoi repose ce chiffre ? »** Un adhérent
redressé la posera, un vérificateur aussi, et il faut pouvoir répondre autrement que par
« le logiciel l'a calculé ». Chaque ligne porte son fondement en clair et sa source ; les
notes affichent les divergences, dont celle du seuil espèces qui varie d'un facteur cinq
entre deux documents.

⚠️ Il ne modifie rien. Le fiscaliste valide encore dans le YAML versionné, où la revue de
code voit le changement. Un écran d'édition devra journaliser chaque changement de valeur
légale — exigence plus lourde que l'écran lui-même.

### L'écran qui vend le produit

La **déclaration de TVA**, et une ligne en particulier : « dont écartée par le contrôle ».

Dans une déclaration ordinaire, une TVA rejetée est **invisible** — la case porte un
chiffre plus faible, et rien n'explique pourquoi. Ici chaque rejet est isolé, chiffré et
justifié pièce par pièce, avec le code de la règle et le motif en clair :

```
PJ-2026-0001   FAC-ACH-007   Le règlement en espèces dépasse le seuil légal…   379 350
```

C'est ce que l'adhérent aurait payé, et ce que le cabinet lui a évité.

### Trois décisions d'affichage

**Le sous-titre dit toujours à quelle date et sur quel périmètre on lit.** Sans lui, un
comptable qui compte trois dossiers là où le cabinet en suit six croit à une panne. Le
portefeuille annonce « affectés à votre portefeuille » ; les écrans datés affichent le jour
de résolution.

**Un tiret vaut mieux qu'un zéro.** Un montant estimé absent, un compte non lettré, un
exercice inconnu : le tiret dit « on ne sait pas », le zéro dirait « il n'y a rien à
payer ». Sur une échéance fiscale, la différence est celle d'une pénalité.

**Le ton d'alerte est réservé à ce qui bloque.** Une échéance dépassée le porte — la
pénalité court. Un compte non lettré, non : c'est du travail qui reste, pas une anomalie.

### Ce que les écrans avouent

Trois avertissements sont **écrits dans l'interface**, pas enfouis dans la documentation :

* le référentiel n'est pas validé, donc rien n'est opposable ;
* l'échéancier suppose que le dossier n'a **pas de salariés**, faute de contexte Social —
  l'impôt libératoire n'efface pas les cotisations CNPS, et un dossier avec salariés doit
  donc davantage d'obligations que ce qui s'affiche ;
* un accusé de dépôt sans justificatif archivé repose sur la seule saisie du numéro.

Un écran qui tait ses limites les fait découvrir par un contrôle.

### L'écran d'administration ne modifie rien, délibérément

Inviter, suspendre, affecter un dossier, fermer une habilitation : les routes existent, les
formulaires non. Ces gestes réclament des confirmations explicites — suspendre coupe les
sessions ouvertes, fermer une habilitation n'est pas réversible — et une confirmation
bâclée sur ces actes-là vaut moins que pas de bouton du tout.

Il montre en revanche trois signaux que rien d'autre ne montre : les comptes **jamais
activés** — l'état le plus fréquent en production et le plus oublié —, les collaborateurs
**habilités sans dossier**, et l'état de la chaîne d'audit.

### Vérifié en exécution réelle

Backend sur PostgreSQL, front compilé et démarré contre lui, connexion par vraie session,
sept écrans visités : tous rendent des données réelles — « SARL BATIMENT PLUS », le compte
401, `TVA_TAUX_GENERAL` à 19,25 %, la règle `FAC-ACH-007` et ses 379 350 F.

**868 tests backend, 87 pages compilées, types et `eslint` propres.**

⚠️ Une différence de comportement relevée au passage : le dépôt SQL trie les dossiers par
dénomination, le dépôt mémoire par ordre d'insertion. L'écran affiche donc AGRO en premier
et non BATIMENT. Le tri SQL est le bon — il est déterministe —, mais les deux réalisations
d'un même port devraient rendre le même ordre.

---

## 16 août 2026 — Les treize autres dépôts, et un piège refermé pour de bon

### Ce qui est livré

Les cinq contextes qui produisent des données vivent en base : le portefeuille, la
collecte, la comptabilité, la souscription, et le socle déjà migré. **Quatorze tables,
868 tests, aucun ignoré.**

L'application entière tourne sur PostgreSQL et survit au redémarrage — dossiers, pièces,
écritures, balance, déclaration de TVA, devis, souscription, paiement, compte adhérent créé
par l'encaissement.

### La forme retenue : document plus colonnes promues

Les entités de ce système sont des **agrégats immuables**. Une entreprise porte ses
régimes, ses rattachements, ses adhésions, ses exercices, ses mandats, ses dirigeants. Une
écriture porte ses lignes. Trois faits ont décidé :

* **On les lit toujours entières.** Aucun cas d'usage ne charge « les lignes d'une
  écriture » sans l'écriture. Normaliser produirait une trentaine de tables et autant de
  jointures pour rendre exactement le même objet.
* **Elles sont immuables.** Un changement produit un nouvel exemplaire, pas une mise à jour
  de sous-ligne.
* **Les calculs sont déjà en Python.** La balance et le grand livre sont calculés sur les
  écritures et jamais stockés — décision du contexte E. Rendre les lignes interrogeables en
  SQL ne servirait aujourd'hui personne.

Ce sur quoi on filtre, trie ou pose une contrainte sort du document et devient une vraie
colonne. Elle est alors écrite **deux fois**, et le dépôt les écrit ensemble : une colonne
promue qui ne suivrait pas le document ferait mentir toutes les requêtes sans qu'aucune
lecture d'entité ne le montre.

**Ce que ça coûte, et comment on en sort** : aucune intégrité référentielle sur le contenu
imbriqué, aucune requête SQL directe dessus. Le jour où « quels dossiers étaient au réel en
2024 » devra se répondre en SQL, les périodes prendront leur table — et la colonne document
restera, parce que `JSONB` se requête aussi.

⚠️ La contrepartie qui compte : **le document doit rester relisable**. Un champ retiré d'une
entité fait échouer la validation des lignes anciennes. Une évolution s'ajoute, elle ne
retranche pas.

### La clé d'écriture porte enfin le dossier

`2026/AC/000042` n'est unique qu'à l'intérieur d'un dossier — défaut relevé au premier
branchement des adaptateurs, contourné jusqu'ici par un dépôt en mémoire ouvert *pour un
dossier*. La clé primaire est désormais composite : locataire, entreprise, exercice,
journal, numéro. **La question ouverte depuis le lot 4 est close.**

### Le piège des tables non chargées, trois fois

Les métadonnées SQLAlchemy ne connaissent que les modules importés. Une table dont le
module n'est pas chargé n'existe pas de leur point de vue.

Je l'ai documenté dans `alembic/env.py`, puis je m'y suis pris **trois fois** : à
l'amorçage, à la première migration métier — qui n'a rien généré —, puis dans les tests. À
chaque fois, l'oubli était le même, à un endroit différent.

Il ne suffit pas de documenter un piège pour le refermer. Il y a maintenant **un
recensement unique**, `app/tables.py`, et un test qui vérifie qu'il est complet : il compare
le recensement aux fichiers `tables.py` présents sur le disque, vérifie que chaque table est
cloisonnée, et qu'aucune table déclarée n'est sans migration.

### Un défaut préexistant révélé par le parcours réel

`GET /comptabilite/dossiers/{niu}/balance` appelait `balance()` avec `inclure_brouillons`,
alors que le paramètre s'appelle `brouillons_inclus`. La route échouait en 500 **à chaque
usage réel** — et aucun test ne l'appelait.

Une route sans test n'est pas une route livrée : c'est du code qui compile. Quatre routes
de comptabilité sont maintenant couvertes.

### Deux décisions sur ce qui ne va pas en base

**Les catalogues restent en code.** Plan SYSCOHADA, journaux, catalogue d'obligations,
offre commerciale : ce sont des données de configuration, identiques pour tous les
locataires. Leur donner une table ne servirait qu'à devoir les y remettre à chaque nouvelle
base. Le plan d'**imputation**, lui, est propre à chaque dossier — il a sa table.

**Le magasin de fichiers n'aura pas de table.** Des documents scannés en base feraient
grossir les sauvegardes d'un facteur cent pour des données qui ne se requêtent jamais, et
rendraient chaque restauration inutilisable. La cible est un stockage objet ; ce qui va en
base est l'empreinte, déjà portée par la pièce. La classe existe et lève, pour que l'absence
soit nommée plutôt que découverte.

### L'amorçage refuse de s'exécuter deux fois

Il pose des comptes dont le mot de passe est en clair dans le dépôt. Rejoué sur une base qui
contient déjà des comptes, il écraserait des mots de passe réels par ceux de la
démonstration — et personne ne s'en apercevrait avant qu'un collaborateur ne se retrouve
dehors. Il refuse, et le message le dit.

Il a par ailleurs dû quitter `app/infrastructure/` : le garde-fou d'architecture a rappelé
que le cercle externe est appelé par le métier et ne l'appelle pas. Un amorçage connaît tous
les contextes — c'est de la **composition**, comme `app/main.py`.

### Ce qui reste

Le mode `postgresql` n'est toujours pas le défaut, et ce n'est plus par prudence technique :
la bascule est désormais une décision d'exploitation — base administrée, sauvegardée,
amorçage maîtrisé. `CGA_PERSISTANCE=postgresql` suffit.

⚠️ Une limite reste écrite dans le code : `prochain_numero` lit le maximum et ajoute un.
Deux transactions concurrentes obtiendraient le même, et la seconde échouerait sur la clé
primaire au lieu de prendre le suivant. Rien de faux n'est écrit ; l'appelant doit
recommencer. Une séquence par journal supprimerait ce cas.

---

## 15 août 2026 (suite 11) — La base tourne, et l'exécution réelle trouve ce que les tests ne voyaient pas

### Comment j'ai obtenu une base sans toucher au poste

Le serveur PostgreSQL du poste tourne, mais aucun rôle ne m'y donne accès et `sudo` réclame
un mot de passe. Créer un rôle dessus aurait de toute façon été discutable : on modifierait
la configuration d'une machine partagée pour faire tourner des tests.

J'ai donc monté **une instance à moi** : `initdb` dans un répertoire temporaire, port 55432,
socket dans un chemin court. Elle vit hors du dépôt et se jette. `outils/postgres-local.sh`
la démarre et l'arrête.

Un détail a coûté un essai : PostgreSQL refuse de démarrer si le chemin du socket dépasse
107 octets, et le message ne dit pas que c'est la longueur qui pose problème. Le répertoire
de travail temporaire dépassait largement ; le socket vit donc dans `/tmp/cga-pg`.

### Les 24 tests en attente, et les deux qui ont échoué

Vingt-deux sont passés du premier coup. Les deux échecs étaient **le même défaut** : mes
dépôts SQL ne filtraient que par l'écouteur de session, et fuyaient dès qu'on les
construisait sur une session ordinaire — un test, un script de reprise, une tâche de fond.

Le cloisonnement est désormais posé **deux fois**. L'écouteur protège de ce qu'on écrira
demain, sans qu'on ait à y penser. Le filtre explicite dans chaque requête rend le module
correct quelle que soit la session qui le porte. Ce n'est pas une redondance : ce sont deux
défauts différents qu'on ferme.

### Le mixin n'était pas un mixin

`Cloisonne` ne déclarait qu'une annotation, `locataire: str`. `with_loader_criteria`
inspecte l'expression `entite.locataire` et lui faut un attribut **mappé** : il levait au
premier filtrage réel.

La correction améliore le dessin. La colonne est maintenant portée par le mixin, donc une
table cloisonnée ne peut plus l'**oublier** : le seul oubli possible devient celui du mixin,
qui se lit sur la ligne de déclaration de la classe. Six déclarations de colonne ont
disparu au passage.

### Le défaut que seule l'exécution réelle pouvait révéler

L'application tournait sur PostgreSQL : connexion, second facteur, dépôt de TVA, refus du
second dépôt, journal d'audit intact. Puis j'ai **redémarré** — et l'accusé de réception
n'était pas là.

La route de dépôt avait son propre registre en mémoire, un `lru_cache` local que la base ne
voyait pas. Tout fonctionnait : le refus du second dépôt passait, les 830 tests étaient
verts. Et **la preuve de dépôt — la pièce la plus critique du système — disparaissait au
redémarrage pendant que tout le reste persistait**.

Aucun test unitaire ne pouvait le voir : chaque dépôt était juste pris isolément. Il fallait
faire tourner l'application réelle sur une vraie base, **puis redémarrer**. C'est
maintenant un test, et son message dit ce qu'il attrape.

### Alembic n'était pas installé, et ma vérification ne le voyait pas

`import alembic` réussissait parce que mon propre dossier `alembic/` masquait le paquet.
Mon contrôle du lot précédent — « alembic configuré » — ne testait donc que mon répertoire.
Un test qui passe pour la mauvaise raison est un test qui ment.

Installé, la migration initiale s'est générée et **s'applique sur une base vierge**. Les
quatre contraintes qui portent les garanties sont là :

```
uq_journal_audit_locataire_rang           deux processus ne peuvent pas écrire le même rang
uq_accuse_reception_locataire_reference   un second dépôt de la même période se heurte à la base
uq_compte_locataire_courriel              deux porteurs d'une adresse rendraient l'un inaccessible
uq_jeton_empreinte                        un lien d'activation est unique
```

Les migrations générées sont exemptées des règles de mise en forme : les reformater à la
main les ferait diverger de ce que l'outil régénère, et une migration relue doit ressembler
à sa voisine.

### Ce qui est vérifié maintenant

**857 tests, aucun ignoré.** Le socle vit en base — comptes, habilitations, jetons,
sessions, journal chaîné, registre des accusés — et l'application entière tourne dessus.

Le journal d'audit se relit après redémarrage et sa chaîne se vérifie : c'était la propriété
la plus incertaine, parce qu'une conversion JSON instable aurait fait déclarer toute la base
altérée au premier démarrage.

### Ce qui reste

Le défaut du registre en mémoire est instructif au-delà de son cas : **les treize autres
dépôts sont dans le même état**. Le mode `postgresql` ne doit donc pas devenir le défaut
avant qu'ils n'aient suivi — une application dont le socle persiste et dont la comptabilité
disparaît serait pire que tout en mémoire, parce que l'incohérence ne se verrait qu'à
l'usage.

---

## 15 août 2026 (suite 10) — Les échéances d'abonnement, et deux décisions commerciales

### Pourquoi celle-ci

La base PostgreSQL n'étant toujours pas accessible sur ce poste, empiler d'autres tables
non vérifiables aurait été le mauvais choix : du code non testé qui s'accumule. J'ai pris
le manque que j'avais signalé deux fois comme « le plus important du contexte M ».

**La première mensualité était encaissée, et plus rien ne se passait.** Un abonnement dont
la deuxième échéance n'est jamais appelée n'est pas un abonnement : c'est une vente unique
déguisée, et le cabinet travaille onze mois gratuitement.

### L'échéancier se calcule, il ne se stocke pas

Même discipline qu'au contexte F. Il découle de trois choses — date d'effet, périodicité,
date de résiliation — toutes trois déjà portées par la souscription. Le persister figerait
un calendrier qui deviendrait faux à la première résiliation, et personne ne verrait qu'il
l'est devenu.

Ce qui est stocké, ce sont les **paiements**. Une échéance est identifiée par sa période, et
son état se lit en confrontant l'échéancier aux paiements reçus.

### Les périodes suivent la date d'effet, pas le mois civil

Une souscription du 17 mars produit des périodes du 17 au 16. C'est ce qui **évite le
prorata** — et le prorata est ce qui rend une première facture incompréhensible. « Vous
payez 12 500 F par mois » doit vouloir dire exactement cela dès le premier prélèvement.

Le cas limite est traité et testé : le 31 janvier est ramené au 28 février, puis **le 31
revient** en mars. Le calcul se fait toujours depuis la date d'effet, jamais de proche en
proche — sans quoi un abonnement souscrit un 31 glisserait au 28 pour toujours après un
seul février.

### Deux distinctions portent tout le sens

`A_APPELER` contre `A_VENIR` : la première réclame une action aujourd'hui. Les confondre
produirait soit des prélèvements prématurés, soit une liste de travail qui ne se vide
jamais.

`IMPAYEE` contre `EN_DEFAUT` : la première est un incident — on relance. La seconde a
dépassé le délai de grâce et arrête le service. **Les confondre couperait le service au
premier échec de prélèvement**, alors qu'un solde momentanément insuffisant n'est pas un
défaut de paiement.

### Première décision : suspendre n'est pas séquestrer

Passé la grâce, le cabinet cesse de traiter les pièces et de préparer les déclarations.
L'adhérent **conserve l'accès en lecture** à son dossier.

Ce n'est pas de la mansuétude commerciale. Les pièces déposées et les écritures produites
sont **ses** documents comptables, qu'il est légalement tenu de conserver dix ans. Les lui
retenir pour obtenir un règlement l'exposerait à un manquement dont il n'est pas
responsable, et exposerait le cabinet à devoir s'en expliquer.

⚠️ La distinction n'est pas encore **appliquée** : le contexte K ne sait aujourd'hui que
suspendre un compte, ce qui coupe tout. La route rend donc une **décision** portant sa
consigne, que le cabinet applique à la main — plutôt qu'exécuter une coupure trop large.
Ce qu'il faudrait est une habilitation restreinte à la lecture, et c'est écrit dans le code.

### Seconde décision : un prélèvement refusé n'est pas rappelé automatiquement

C'est le test qui m'a forcé à trancher. La machine à états écarte déjà une échéance dont un
prélèvement est en cours ; la garde par clé d'échéance ne sert donc que dans un cas — après
un refus.

Rappeler chaque jour un prélèvement refusé produirait un menu de paiement quotidien sur le
téléphone de l'adhérent. C'est vécu comme du harcèlement, et chaque tentative peut lui être
facturée. Le rattrapage passe par la relance, qui l'informe, et par un règlement qu'il
déclenche lui-même.

La contrepartie est écrite : une échéance refusée reste due et ne sera **jamais** rappelée
par la tâche. C'est la relance qui la porte, et l'arrêt du service qui la sanctionne.

### Un vrai défaut trouvé par les tests

L'échéancier s'arrêtait sur le **début de période** au lieu de la **date d'appel**. Une
échéance devenait donc visible le jour de son exigibilité — c'est-à-dire trop tard pour
l'appeler cinq jours à l'avance. Le mécanisme entier était inopérant, et il compilait très
bien.

### Les relances informent avant de presser

Jalons J+1, J+7, J+14. Le premier n'est pas de la pression : **l'adhérent ignore souvent que
le prélèvement a échoué**, parce que l'opérateur ne le lui dit pas.

Le retard doit tomber **exactement** sur un jalon. Sans ce « exactement », un impayé de
vingt jours déclencherait les trois relances à chaque passage, et l'adhérent recevrait un
message par jour jusqu'au règlement — une relance quotidienne se filtre en trois jours et
cesse d'être lue.

Le champ `derniere` distingue le jalon qui annonce une conséquence de ceux qui informent :
les envoyer sur le même gabarit ferait passer l'avertissement pour un rappel de plus.

### Ce qui est livré

Quatre routes, 31 tests, **830 au total**. Et toujours 24 en attente de PostgreSQL.

---

## 15 août 2026 (suite 9) — La persistance, et la couture qui la rend inoffensive

### Pourquoi celle-ci maintenant

C'est le manque que je signale depuis six lots, et le dernier était le plus net : « le
registre des accusés est en mémoire — c'est le dépôt le plus critique du système à faire
passer en base. Une comptabilité se refait ; une preuve de dépôt, non. »

Un système qui perd les identités et les preuves de dépôt à chaque redémarrage n'est pas un
système auquel on confie des données fiscales.

### Le socle passe le premier, et ce n'est pas arbitraire

Sans identité persistante, rien d'autre ne sert : un redémarrage renvoie tout le monde à la
page de connexion avec des comptes qui n'existent plus. Et sans journal d'audit persistant,
la chaîne de hachage repart de la genèse à chaque démarrage — **elle n'atteste plus de
rien**.

Six tables : comptes, habilitations, jetons, sessions, journal d'audit, accusés de
réception.

### Le cloisonnement s'applique tout seul, et c'est ce que la doc exigeait

`05-securite-multitenant.md` § 1 : « Filtrage appliqué **dans la couche de persistance** —
session SQLAlchemy avec filtre systématique —, jamais laissé au développeur qui écrit la
requête. »

C'est fait par un écouteur `do_orm_execute` avec `with_loader_criteria` : toute requête ORM
sur une table marquée `Cloisonne` reçoit son critère. **On ne peut pas l'oublier parce
qu'on ne l'écrit jamais.**

Un filtre qu'il faut penser à écrire est un filtre qu'on oubliera, et l'oubli ne se voit
pas : la requête ne plante pas, elle rend simplement les lignes d'un autre cabinet.

⚠️ Ce que cela ne couvre pas, et c'est écrit dans l'en-tête : le SQL textuel échappe au
filtre et doit porter son `WHERE locataire = …` en toutes lettres.

Une lecture y échappe aussi, et elle est signalée en commentaire : `session.get()` interroge
par clé primaire sans passer par l'évènement. Les trois dépôts qui l'emploient vérifient le
locataire à la main.

### Deux garanties qui n'existaient pas, et qui étaient promises

**Le rang du journal d'audit est unique par locataire**, et la tête est lue avec
`FOR UPDATE`. L'en-tête du port `JournalAudit` réclamait cette atomicité depuis le premier
jour, avec la mention « une réalisation en mémoire ne peut pas le garantir ». C'est ici que
ce n'est plus vrai : le verrou sérialise, la contrainte d'unicité sert de ceinture.

**Le dépôt d'une déclaration est unique par référence**, garanti par la base et non par la
mémoire de celui qui saisit.

Les deux sont **par locataire** : deux cabinets ont chacun leur chaîne, et le dépôt de l'un
ne bloque jamais l'autre.

### Le piège que j'ai traité avant qu'il ne morde

Les entrées d'audit portent dates, décimaux et énumérations, que la colonne JSON ne sait pas
écrire. La conversion `default=str` est **stable pour l'empreinte** : `corps_canonique`
sérialise déjà ainsi, si bien qu'une entrée relue depuis la base recalcule exactement la
même empreinte.

Sans cette propriété, `verifier_chaine` aurait déclaré **toute la base altérée au premier
redémarrage** — un journal d'audit qui s'accuse lui-même. Un test l'exige explicitement, sur
une entrée portant les trois types.

### La couture : « la transaction est la requête »

`Atelier` avait une seule réalisation, mémoire, vivant le temps du processus. Il en a
maintenant deux, et leur **durée de vie diffère par nature** : l'atelier SQL porte une
session, et la transaction se ferme avec la requête.

Le point de bascule est un intergiciel. J'ai hésité, parce qu'une variable de contexte est
de l'état ambiant et que l'état ambiant se défend mal en général. Il se défend ici pour une
raison précise : faire traverser une session à dix-huit signatures de route ne donnerait
toujours pas la validation en fin de requête — **chaque route devrait y penser, et l'une
d'elles oublierait**. Le point d'ouverture et de fermeture est unique.

Hors requête, en mode PostgreSQL, `atelier()` **lève**. Un atelier fabriqué à la volée
ouvrirait une transaction que personne ne fermerait, et ses verrous sur la table du journal
bloqueraient toutes les écritures suivantes. Mieux vaut une erreur immédiate qu'une
application qui se fige au bout d'une heure.

### Le défaut reste la mémoire, et c'est délibéré

Basculer maintenant donnerait une application dont le socle persiste et dont la comptabilité
disparaît au redémarrage — **pire que tout en mémoire**, parce que l'incohérence ne se
verrait qu'à l'usage. Le mode `postgresql` s'allumera quand les treize autres dépôts auront
suivi.

### Alembic, parce que `create_all` n'est pas une migration

Il ne modifie aucune table déjà présente : une colonne ajoutée au modèle n'apparaîtrait pas,
et le code échouerait sur une colonne absente sans que rien n'explique pourquoi. C'est écrit
dans la fonction elle-même.

Trois choix consignés dans `env.py` : l'adresse de la base vient de la configuration et non
du `.ini` — c'est là qu'on met un mot de passe par habitude, et qu'il finit versionné ;
`compare_type` est activé, sans quoi un `String(64)` devenu `String(120)` ne produit aucune
migration ; et **toutes les tables sont importées**, faute de quoi `autogenerate` propose de
supprimer celles qu'il ne voit pas — le piège classique.

Le gabarit de migration rappelle que `downgrade` rétablit le schéma, jamais le contenu, et
que sur les tables append-only il n'y a rien à défaire.

### Ce que j'ai livré, et ce que je n'ai pas pu vérifier

**799 tests verts**, dont cinq nouveaux sur la couture. Et **24 tests ignorés** faute de
base : le rôle PostgreSQL n'a pas été créé sur ce poste.

Ils ne sont pas silencieusement passés — le message d'ignorance porte le motif exact et la
commande à lancer. Un test vert parce qu'il ne s'est pas exécuté est pire qu'un test rouge.

Trois des propriétés qu'ils vérifient n'existent ni en mémoire ni sur SQLite : le verrou de
ligne, l'unicité du rang sous concurrence, l'unicité du dépôt. Les tester sur SQLite aurait
reviendrait à tester autre chose — c'est pourquoi j'ai posé la question plutôt que de
prendre le raccourci.

---

## 15 août 2026 (suite 8) — L'interopérabilité DGI, et ce que je ne sais pas

### Ce qui a été demandé

Que le système soit interopérable avec la télédéclaration de la DGI — « c'est aussi ça
l'intérêt ». Et, avant cela : est-ce que tout est ok ?

### Non, et voici ce qui ne l'est pas

**Aucune valeur légale n'est validée.** Dix-neuf paramètres au statut `A_VALIDER`. La
question Q1 porte sur une divergence d'un facteur cinq — 100 000 contre 500 000 FCFA — sur
la règle qui produit le plus gros enjeu du jeu de démonstration. Personne n'est nommé
référent de validation. **Rien de ce que produit le système n'est opposable.**

**Rien n'est persistant.** Quatorze dépôts en mémoire. Un redémarrage vide tout.

**Treize écrans sur seize n'existent pas.**

**Les échéances d'abonnement du contexte M** ne sont ni appelées ni relancées.

**Aucune limitation de débit** sur les routes publiques.

### La réponse honnête sur la DGI, et elle détermine tout le reste

**La DGI ne publie aucune interface programmatique.** Ni adresse d'API documentée, ni
format d'échange, ni jeu d'essai, ni environnement de recette. Le portail de
télédéclaration est un site que l'on remplit à la main.

Inventer une charge utile, des noms de champs et des codes de retour aurait produit un
adaptateur qui compile, qui se teste contre lui-même, et qui ne fonctionnera jamais. Ce
serait pire que de ne rien écrire : **le système paraîtrait branché**.

J'ai donc modélisé le **dépôt**, pas l'interface de la DGI. Ce qui suit est vrai que le
dépôt se fasse par formulaire à l'écran ou par appel réseau — et c'est précisément ce qui
permettra de substituer l'un à l'autre sans toucher au métier.

Cinq questions sont consignées en Q1 bis. La plus lourde : **existe-t-il un compte de
rattachement CGA permettant de déposer *pour* un adhérent ?** Elle décide si la plateforme
pourra déposer, ou seulement préparer. Sans elle, il faudrait détenir les identifiants de
chaque adhérent — ce qu'aucun cabinet sérieux ne veut faire.

### Il fallait d'abord lever un blocage qu'on s'était imposé

`EXIGE_MFA` déclarait depuis le premier jour que le dépôt d'une déclaration réclame une
authentification forte. Aucun second facteur n'existait, donc l'action était refusée.
Blocage assumé, visible, et sans conséquence **tant qu'il n'y avait rien à déposer**.

Il y a maintenant quelque chose à déposer. On lève l'obstacle, pas la garde.

**TOTP, et rien d'autre.** Le SMS ne convient pas : l'échange de carte SIM est le mode
d'attaque le plus courant sur les comptes qu'il protège, et il est d'autant plus praticable
là où l'identification à l'achat d'une puce est inégale. Il suppose en outre un réseau, un
fournisseur et un coût par envoi — donc une panne possible la veille d'une échéance.

TOTP fonctionne hors ligne, sans tiers et sans coût. L'algorithme est public — RFC 6238 —
et tient en quinze lignes. Écrire soi-même de la cryptographie est une faute ; recopier une
norme dont chaque étape est spécifiée n'en est pas une, et évite une dépendance.

**Le piège du fuseau, et il est réel.** `datetime.timestamp()` sur un horodatage naïf
suppose le fuseau local de la machine. Le Cameroun étant à UTC+1, un serveur mal configuré
produirait des codes décalés de cent vingt tranches — jamais valides, sans le moindre
message d'erreur. Un test le protège, et un autre vérifie l'implémentation contre le
**vecteur d'essai publié de la RFC** : sans référence externe, générateur et vérificateur
partagent l'erreur et le test passe quand même.

**Le second facteur renforce une session, il ne la crée pas.** On ne réclame pas de code à
la connexion : pour un outil ouvert dix fois par jour, cela conduit à une seule chose — le
téléphone posé déverrouillé à côté du clavier. Il est réclamé **au moment de l'acte
sensible**, et élève la session pour quinze minutes.

### Deux fuites trouvées en chemin, et elles étaient graves

`Compte` sérialisait `empreinte_mot_de_passe`. La route **publique** de définition du mot
de passe rendait donc le compte, empreinte Argon2 comprise, à un appelant non authentifié.
Une empreinte livrée est de la matière à casser hors ligne, tranquillement, sans limite de
tentatives et sans que rien ne l'enregistre.

Le secret TOTP allait suivre le même chemin. Les deux champs sont désormais exclus **au
niveau du champ**, et non route par route : une exclusion à écrire route par route est une
exclusion qu'on oubliera à la prochaine.

### Ce qui a le plus de valeur n'est pas le transport

Un CGA n'est pas un tuyau vers la DGI. Son agrément l'engage sur la sincérité de ce qu'il
transmet, et un adhérent redressé sur une déclaration visée par son centre se retourne
contre le centre. **Refuser un dépôt est un service, pas une entrave.**

Trois niveaux, et la distinction est tout le sujet :

* **`BLOQUANT`** — la déclaration serait fausse. Balance déséquilibrée, rupture de
  numérotation, période déjà déposée, dossier hors assujettissement.
* **`RESERVE`** — elle peut partir, mais quelqu'un doit l'assumer. TVA écartée par le
  moteur de conformité, pièces non traitées, **et le référentiel non validé**.
* **`INFORMATION`** — échéance dépassée, déclaration à néant.

Les confondre produirait l'un des deux échecs symétriques : un système qui ne dépose jamais
rien parce qu'un détail traîne toujours, ou un système qui dépose tout et ne sert à rien.

Sur le jeu de démonstration, la préparation rend :

```
déposable            : true
exige une décision   : true
[RESERVE] REFERENTIEL-NON-VALIDE
[RESERVE] TVA-REJETEE-PAR-LE-CONTROLE   enjeu = 379 350
```

Cette seconde ligne **est** la valeur du produit : 379 350 FCFA de TVA qui auraient été
réclamés et refusés.

### L'accusé de réception est la seule preuve qui compte

Une obligation n'est pas déposée parce que le système le croit : elle l'est parce qu'un
accusé existe. Trois décisions en découlent.

**`declaree_le` reçoit la date de l'accusé**, jamais celle de la saisie. Un réviseur qui
dépose le 14 et consigne le numéro le 17 doit voir le 14 : c'est cette date que
l'administration retient pour calculer une pénalité.

**L'accusé porte l'empreinte de ce qui a été déposé.** On prépare, on découvre une écriture
à corriger, on corrige, on régénère — et l'on colle le numéro obtenu **avant** la
correction. Les chiffres déposés ne sont alors pas ceux du système, et plus personne ne le
sait. L'empreinte le refuse.

**La référence n'inclut pas la date de dépôt** — dossier, obligation, période. Un second
dépôt de la TVA de juillet se heurte au premier quel que soit le jour : redéposer produit
une déclaration rectificative non demandée, parfois un double appel de paiement.

### Le portail manuel n'est pas un pis-aller

Il ne dépose rien, et `deposer()` lève. Ce n'est pas une lacune : un adaptateur qui
feindrait de déposer produirait des accusés inventés — de faux justificatifs, dans un
système dont c'est la raison d'être d'en produire de vrais.

Ce qu'il fait est la moitié utile : il **consigne** l'accusé rapporté du portail, après
avoir vérifié qu'il porte bien sur le document préparé.

### Le parcours, joué de bout en bout

```
enrôlement TOTP        → secret rendu une fois
code faux              → 401
code juste             → facteur_fort = true
dépôt sans renforcement→ 403 SecondFacteurRequis
dépôt                  → DECLAREE, déclarée le 2026-08-14 (date de l'accusé)
second dépôt           → 409 DEPOT-DEJA-EFFECTUE
journal d'audit        → chaîne intacte
```

**794 tests.** Quarante-trois nouveaux.

### Ce qu'il faut savoir avant d'y croire

**Le registre des accusés est en mémoire.** C'est le dépôt le plus critique du système à
faire passer en base — avant les écritures, avant les pièces. Une comptabilité se refait ;
une preuve de dépôt, non.

**Le secret TOTP est stocké en clair.** Contrairement à un mot de passe, il doit être relu
pour recalculer le code : on ne peut pas n'en garder que l'empreinte. Il devra être chiffré
au repos, avec une clé qui ne figure pas dans la base.

**`piece_jointe` n'est pas résolue** tant que la GED n'existe pas. Un accusé sans
justificatif archivé repose sur la seule parole de celui qui a saisi le numéro, et
`verifiable` le dit à l'écran plutôt que de l'enfouir.

---

## 15 août 2026 (suite 7) — Le front branché, et les portes enfin fermées

### Ce qui a été demandé

Continuer. L'objectif posé au départ était de brancher le front ERP, une fois la logique
de connexion et d'accès aux ressources correctement implémentée. K et M étant faits, le
verrou était levé.

### Ce que j'ai trouvé en commençant, et qui a changé le plan

Les routes de **B, C, E et F étaient ouvertes**. Vingt-quatre routes, aucune session
exigée, aucun périmètre vérifié. Le contexte K portait toute la mécanique du cloisonnement
— habilitations datées, portées, `Acces` résolu — et **personne ne l'appelait**.

Un front qui filtrerait par-dessus une API ouverte est du théâtre : n'importe qui sachant
lire l'onglet réseau appelle `/comptabilite/dossiers/{niu}/balance` directement. J'ai donc
fermé les portes avant de dessiner les écrans.

### La décision de sécurité de ce lot : hors périmètre rend 404

Deux outils ont été ajoutés à K, et la distinction entre eux **est** le sujet :

* `restreindre(acces, elements, niu)` — **une liste se restreint**. Refuser toute la boîte
  de réception parce qu'elle contient les pièces d'un autre dossier la rendrait vide en
  permanence.
* `exiger_dossier(acces, permission, niu)` — **une lecture unitaire se refuse**. On ne rend
  pas « une version amputée » d'un dossier.

Et le refus est un **404**, pas un 403. Un 403 dit « ce dossier existe, et il ne vous
regarde pas » : c'est une information, et elle a de la valeur. Un adhérent apprendrait par
essais successifs quels NIU le cabinet suit, c'est-à-dire la liste de ses clients — laquelle
intéresse un concurrent. Du point de vue de qui n'y a pas accès, un dossier hors périmètre
est un dossier qui n'existe pas.

Le 403 reste employé quand c'est la **permission** qui manque, sans dossier en jeu : rien
n'y est révélé qu'on ne sache déjà, la table des rôles étant publiée.

Un détail qui compte : le filtre explicite `?entreprise=` est contrôlé **avant** d'être
appliqué. Sans cela, demander le NIU d'un dossier hors portefeuille rendrait une liste
vide, et l'absence de résultat se distinguerait mal du refus.

### Un manque réel que le branchement a révélé

Le réviseur ne pouvait pas déposer de pièce. Ni le comptable, ni le chargé de clientèle :
`DEPOSER_PIECE` n'était accordée qu'à l'adhérent.

Or `CanalDepot.DEPOT_CABINET` existe dans le contexte C. Ce canal décrit ce qui se passe
réellement — un adhérent apporte ses factures en main propre, et un collaborateur les
saisit. Réserver la permission aux seuls adhérents rendait ce canal inutilisable, et la
faute n'était visible qu'au moment de brancher.

Trois rôles l'ont reçue, avec la justification écrite dans la table.

### Le front : le navigateur ne parle jamais au backend

Tous les appels passent par le serveur Next — composants serveur pour les lectures, actions
serveur pour les écritures. Trois raisons, et la troisième est la plus importante :

1. **Le témoin de session reste sur une seule origine.** Pas de CORS avec identifiants, pas
   de `domain=.cga-brcg.cm` à configurer, pas de différence de comportement entre le
   développement et la production — donc pas de bogue qui n'apparaît qu'après déploiement.
2. **L'adresse du backend reste privée**, et l'API n'a pas à être exposée publiquement.
3. **Le témoin est `HttpOnly`.** Un jeton que le JavaScript de la page devrait lire pour
   l'envoyer lui-même ne peut pas l'être — et cesserait d'être protégé d'une injection.

Conséquence concrète : `NEXT_PUBLIC_API_URL` est devenu `API_URL`. Le préfixe `NEXT_PUBLIC_`
publiait l'adresse dans le code livré au visiteur.

### Le formulaire de connexion authentifie réellement

Il en portait l'aveu en tête : « ⚠️ CE N'EST PAS UNE AUTHENTIFICATION. La comparaison se
fait **dans le navigateur**, contre deux constantes présentes dans le code livré au
visiteur. » Les deux constantes ont disparu, ainsi que le bloc qui les affichait à l'écran.

Il fonctionne **sans JavaScript** : `action={...}` sur un `<form>` produit un POST ordinaire
tant que le script n'a pas pris la main. Sur les connexions visées, c'est la différence
entre « je peux me connecter » et « la page ne fait rien ».

Le message d'échec est celui du backend, **tel quel** — le même quelle que soit la cause. Le
préciser côté front rouvrirait l'oracle d'énumération que le backend prend soin de refermer.

Et le routage après connexion n'est pas un choix offert : le backend rend `interne`, l'action
serveur route en conséquence. Demander « êtes-vous collaborateur ou adhérent » apprendrait
au visiteur qu'il existe deux espaces, et laisserait un adhérent atterrir sur des écrans dont
aucune donnée ne le concerne.

### La porte est gardée dans le gabarit

`exigerAcces()` est appelé dans le gabarit `(collaborateur)`, donc **avant tout rendu**.
Taper `/tableau-de-bord` sans session renvoie à la connexion, et aucun écran n'est produit —
ni son balisage, ni ses données.

Le gabarit est le bon endroit : il enveloppe tous les écrans du groupe, y compris ceux qui
n'existent pas encore. Le mettre dans chaque page reviendrait à parier qu'on n'en oubliera
aucune.

⚠️ Cela **ne remplace pas** le contrôle côté API. Un gabarit protège des écrans ; il ne
protège pas des données, qui s'obtiennent aussi bien par un appel direct.

### Les treize liens morts : une troisième voie

Le menu comptait seize entrées et trois écrans. Trois façons de traiter le problème :

1. **Les laisser cliquables** — on tombe sur une 404. C'était l'état précédent, et c'est le
   pire : le collaborateur ne sait pas s'il a mal cliqué, si le serveur est tombé, ou si
   l'écran n'existe pas.
2. **Les retirer** — le menu est honnête mais muet. Le cabinet ne peut plus suivre
   l'avancement sur l'écran qu'il utilise tous les jours.
3. **Les montrer inertes, et le dire.** C'est ce qui est fait : grisées, non cliquables,
   marquées « à venir ». Le menu dit à la fois où l'on en est et où l'on va.

Rendues en `<span>` et non en `<a>` désactivé : un lien mort reste annoncé comme lien par un
lecteur d'écran, et se traverse au clavier pour n'aboutir nulle part.

Le menu est par ailleurs filtré sur les permissions réelles. ⚠️ **Masquer n'est pas
protéger** — c'est écrit à trois endroits du code, parce que c'est l'erreur qu'on commet
ensuite.

### Ce qui a quitté le jeu de démonstration du front

* L'utilisateur connecté et son rôle → `GET /transverse/moi`
* Les six entreprises et leurs régimes → `GET /portefeuille/entreprises`
* Les deux compteurs de la barre latérale → contexte C

Restent les indicateurs du tableau de bord, les échéances et les anomalies. Ils relèvent du
contexte **J · Pilotage**, qui n'existe pas — aucune route ne rend d'indicateurs consolidés,
et les recalculer dans un écran ferait descendre du métier dans une page. L'en-tête du
tableau de bord dit désormais **quelle moitié est vraie** : un tableau de bord dont on
l'ignore est un tableau de bord qu'on ne peut pas montrer au cabinet.

Une notion a disparu sans être remplacée : les « dossiers récents » du sélecteur, qui étaient
une constante en dur. La rétablir suppose de savoir ce que **ce** collaborateur a ouvert
récemment — une préférence par compte, affaire de K. Inventer un ordre plausible ferait
croire à une mémoire qui n'existe pas.

### L'espace adhérent, qui n'existait pas

L'action de connexion routait les adhérents vers `/mon-espace`, page introuvable. Le
parcours de souscription construit au lot précédent s'arrêtait donc sur une 404, une étape
avant la fin.

L'écran existe maintenant : son dossier avec les statuts résolus, ses pièces avec leur état.
Groupe de routes distinct, cibles de 44 px — l'adhérent ouvre son téléphone entre deux
clients, le collaborateur travaille à deux écrans. Ce sont deux produits qui partagent un
backend, pas un produit avec deux thèmes.

Il n'y voit pas de comptabilité : `ADHERENT` ne porte pas `LIRE_COMPTABILITE`, et l'API
refuserait. Un solde intermédiaire lu comme définitif conduit à des décisions de trésorerie
fondées sur un brouillon.

### Ce qui est livré, et vérifié

**750 tests** côté backend, dont onze nouveaux qui prouvent le cloisonnement **par les
routes réelles** : aucune route métier ouverte, deux comptables aux listes disjointes, le
dossier d'un collègue en 404, la boîte de réception restreinte, un adhérent limité à son
dossier et refusé sur la comptabilité, le comptable parti qui ne se connecte plus.

Le parcours a été rejoué de bout en bout contre le backend, pour les deux profils :

```
Léonard FOTSO   comptable  interne=true   3 dossiers   6 pièces   11 en souffrance
Jean-Pierre NKOA adhérent  interne=false  1 dossier    8 pièces   doublons: 403
```

### La compilation, et ce qu'elle a coûté

L'installation de `node_modules` était incomplète : le `node_modules` de la racine du
workspace était **vide**, et seules les dépendances directes du front existaient. D'où
`@swc/helpers` introuvable et les types de `next-intl` non résolus.

Le réseau s'est révélé très instable — délais dépassés en série sur le registre npm. Trois
tentatives ont été nécessaires :

1. `pnpm install` refuse de purger `node_modules` sans terminal interactif. `CI=true` lève
   la garde ; l'installation échoue en cours de route sur des délais dépassés. **Rien n'est
   perdu** : la purge n'ayant pas eu lieu, l'état d'origine est intact.
2. `--offline` : 359 paquets sur 373 sont déjà dans le store local de 488 Mo. Quatorze
   manquent.
3. `--prefer-offline --network-concurrency=2` : passe en quatre minutes.

Restait un binaire natif, `@swc/core-linux-x64-gnu`, dont le tarball de 12 Mo n'était jamais
descendu. Comme c'est une dépendance **optionnelle**, pnpm avait absorbé l'échec en silence
et déclarait ensuite « already up to date » sur un répertoire vide. Récupéré à la main et
déposé à sa place — le lien symbolique l'attendait déjà.

### Un défaut réel que seule la compilation pouvait révéler

```
Error: You're importing a module that depends on "next/headers" into a
React Client Component module.
  ./app/lib/api.ts → ./app/lib/session.ts → ./app/components/coquille/EnteteTravail.tsx
```

`EnteteTravail` est un composant client et importait `initiales` depuis `session.ts`, lequel
importe `api.ts`, lequel lit le témoin de session. Le compilateur avait raison : **un module
qui lit des en-têtes de requête n'a rien à faire dans un paquet envoyé au navigateur**.

Le contrôle de types ne pouvait pas le voir — les deux modules sont valides pris séparément,
c'est leur combinaison qui ne l'est pas. Seule la frontière client/serveur, que le
compilateur seul connaît, le fait apparaître.

La correction est une meilleure frontière, pas un contournement :

* **`acces.ts`** — les types `Acces`, `Role`, `Permission` et les fonctions pures
  `detient`, `voit`, `initiales`, `LIBELLES_ROLE`. Rien qui lise, rien qui appelle.
  Importable de partout.
* **`session.ts`** — `acces()` et `exigerAcces()`, qui lisent le témoin. Serveur seulement.

### Résultat

```
✓ Compiled successfully in 190ms
✓ Generating static pages (73/73) in 1159ms
```

Soixante-treize pages statiques, aucune erreur, `eslint` propre. Les écrans de l'espace de
travail et de l'espace adhérent sont marqués **`ƒ` — rendus à la demande**, ce qui est
exactement ce qu'on veut : ils lisent le témoin de session, ils ne peuvent pas être
pré-rendus.

### Ce qui reste

* **Les écrans de portefeuille, comptabilité et obligations** — treize entrées de menu.
* **Le dépôt de pièce par l'adhérent.** La permission est détenue, la route existe, mais
  elle réclame l'empreinte du fichier et le magasin de fichiers n'a pas d'adaptateur réel.
  Un bouton qui ouvrirait un sélecteur sans savoir où déposer serait un mensonge d'interface.
* **Le contexte J · Pilotage**, dont dépend la moitié encore fictive du tableau de bord.
* **Les échéances d'abonnement** du contexte M, toujours le manque le plus important.

---

## 15 août 2026 (suite 6) — Le contexte M, et l'argent qu'on ne perd pas

### Ce qui a été demandé

Le parcours de souscription : le service choisi sur la vitrine, le paiement, et le lien de
définition envoyé une fois le règlement validé.

### La décision qui a coûté le plus de réflexion : un treizième contexte

Le dossier d'architecture en décrit douze. Trois placements étaient possibles pour la
souscription, et les trois échouent :

* **L · Vitrine** est du contenu éditorial, et son isolement est délibéré — la doc écrit
  elle-même que « du contenu qui aurait besoin d'un paramètre légal ne serait plus du
  contenu ». Un encaissement encore moins.
* **I · Création d'entreprise** est une prestation parmi cinq. Y loger la souscription
  obligerait à passer par la création pour vendre une domiciliation.
* **A · Référentiel** porte des valeurs **légales**. Les honoraires du cabinet n'en sont
  pas : il les fixe librement, et les mêler aux taux du Code général des impôts brouillerait
  la seule chose que le référentiel doit garantir.

Ce que M détient et que personne d'autre ne détient : **combien coûte notre service, et
comment on l'encaisse**. Il lit le portefeuille pour une seule question — ce NIU est-il déjà
suivi ? — et n'est lu par personne.

Une souscription n'est **pas** un dossier. Elle dit qu'un accès a été payé, pas que
l'entreprise existe. Créer automatiquement l'entreprise au portefeuille y ferait entrer des
dossiers dont on ne sait rien, alors que le contexte B tout entier repose sur l'idée qu'on ne
sait d'une entreprise que ce qu'on a constaté.

### Le barème sort des fichiers de traduction

Les prix vivaient dans `messages/fr/vitrine.json` et `messages/fr/pages.json`. Un tarif rangé
dans un fichier de traduction ne se change pas sans redéploiement, n'a aucune date d'effet,
et **vit en double dès qu'une seconde langue existe** — la version anglaise et la française
auraient chacune leur prix, et rien ne dirait lequel fait foi.

Il est désormais daté, `[du, au[`, comme un paramètre du référentiel. Deux versions
coexistent au catalogue, 2024 et 2026, pour que le mécanisme se prouve : un test lit le prix
au 31 décembre 2025 puis au 1er janvier 2026 et obtient deux réponses.

⚠️ Les montants antérieurs à 2026 sont **reconstitués** — le cabinet n'a pas fourni son
historique tarifaire. Ils démontrent le mécanisme, ils ne facturent rien.

### Le devis fige le prix du jour

Ses lignes portent des **montants recopiés**, pas des renvois au catalogue. C'est ce qui
distingue un devis d'une page de tarifs : la page affiche le prix d'aujourd'hui, le devis
engage sur celui d'hier.

Sans cette copie, un devis reçu le 20 mars et ouvert le 2 avril afficherait le barème
d'avril. La page d'estimation du site signalait déjà ce défaut en commentaire.

Validité trente jours. Passée cette date, le devis devient **caduc**, il n'est pas supprimé :
le prospect qui revient voit ce qu'on lui avait proposé plutôt qu'une page introuvable.

### La règle de facturation qu'il a fallu corriger en cours de route

J'avais d'abord écrit : `montant_a_regler` exclut les abonnements. Un devis d'adhésion seule
tombait alors à zéro, donc non payable — le produit principal devenait insouscriptible.

La règle correcte est conditionnelle, et elle est celle du métier : un abonnement n'est
encaissé que **s'il est seul au devis**, sa première échéance mettant la prestation en route.
Adossé à une création d'entreprise, il ne gonfle pas le total — c'est exactement ce que la
page d'estimation annonce en note : « cet abonnement se règle mensuellement, il n'entre pas
dans le total à régler à la création ».

Le backend doit dire la même chose que la vitrine. Un client qui lit 165 000 sur le site et
voit 177 500 au moment de payer n'achète pas, et il a raison.

### La création d'entreprise n'est pas souscriptible en ligne, et c'est assumé

Ses frais officiels — caisse du guichet unique, droits d'enregistrement, RCCM, journal
officiel, timbres — sont des **valeurs légales**. Elles relèvent du contexte A, elles n'y sont
pas, et il y a une seconde raison de ne pas les y verser en l'état : `bareme-creation.ts`
signale lui-même que les montants de la maquette, agrégés en trois lignes, **divergent de la
proforma réelle du cabinet**, qui en compte huit pour le même total.

Verser des chiffres qu'on sait approximatifs dans un référentiel dont la raison d'être est
l'exactitude serait pire que de ne rien y verser. **Encaisser un montant qu'on sait faux
serait pire que ne rien encaisser.**

La création produit donc une demande de devis. C'est déjà ce que la vitrine annonce : « Le
devis définitif vous est confirmé après examen de votre projet, sans frais de dossier. »

### Le paiement : ce qui est repris du module Django, et pourquoi ligne à ligne

Le module `mail+paiement/` a été durci en production, et chacune de ses particularités a été
payée d'un incident. Sont conservés **à l'identique** :

* l'adresse de base est **`www.dklo.co`**, et non `taramoney.com` ;
* `productPrice` est un **entier**, pas une chaîne ;
* `phoneNumber` s'écrit `2376xxxxxxx`, sans « + » ;
* `network` part **vide** : Tara déduit l'opérateur du préfixe, et le lui imposer route vers
  le mauvais réseau — décision client du 25 juin 2026 ;
* Tara répond parfois **200 avec une erreur dans le corps**, qu'il faut lire.

Ce qui a changé : le modèle Django et son ORM disparaissent derrière nos ports. Ce qui reste :
les invariants.

### Les quatre garanties contre le double-encaissement

**La clé d'idempotence est la nôtre**, tirée chez nous et transmise comme identifiant de
produit. C'est elle qui permet de retrouver l'opération même quand le prestataire ne rend pas
la sienne.

**Le rapprochement a trois stratégies**, parce que la première ne suffit pas : le champ
`productId` revient parfois vide selon le chemin emprunté chez l'opérateur. La troisième —
téléphone plus récence — exige **le même montant**, sans quoi deux souscriptions engagées
depuis le même téléphone dans la demi-heure se croiseraient et la moins chère validerait la
plus chère.

**La validation est rejouable.** Le prestataire renvoie la même notification plusieurs fois ;
un paiement déjà validé se rend inchangé. Une seconde garde existe côté souscription :
`activee_le` refuse d'être reposée. Un test rejoue quatre fois la notification et vérifie
qu'un seul compte a été créé.

**La réconciliation renverse la charge : c'est nous qui appelons.** L'adresse de rappel est
injoignable pendant un redéploiement, une notification se perd — et dans ces cas l'abonné a
été débité pendant que rien ne bouge chez nous. Au bout d'un moment **il repaie**, et c'est là
que naît le double-encaissement : non par un défaut de notre code, mais par notre silence.

### Une décision d'ordre d'écriture qui paraît absurde et ne l'est pas

La souscription et le paiement sont enregistrés **avant** l'appel au prestataire.

Appeler d'abord et écrire ensuite laisserait, en cas de panne entre les deux, une opération
vivante chez l'opérateur dont nous n'aurions aucune trace. Écrire d'abord produit le défaut
inverse, bénin : un paiement en attente sans opération réelle, que la réconciliation périme
au bout de vingt-quatre heures.

**Entre un enregistrement de trop et un encaissement perdu, on choisit l'enregistrement de
trop.**

### Deux états au lieu d'un, et c'est tout le sujet

`PAYEE` signifie que l'argent est arrivé. `ACTIVEE` signifie que le compte existe et que le
lien est parti. Les fondre en un seul état rendrait invisible le seul cas qui compte :
**encaissé mais pas activé**.

Ce cas se produit — le service de courriel tombe, l'adresse est déjà prise, le processus
redémarre entre deux écritures. Avec un état unique, le client a payé, n'a rien, personne ne
le sait, et il rappelle trois jours plus tard. Avec deux états, `GET /souscription/a-activer`
le fait apparaître sans qu'on ait à le chercher.

L'échec d'activation ne rejette donc **jamais** le paiement. On ne rejette pas un encaissement
réel parce qu'un serveur de courriel était indisponible.

### Une factorisation faite avant d'écrire le second chemin

La notification entrante et la réconciliation aboutissent toutes deux à « appliquer un
évènement à un paiement ». J'ai extrait `appliquer_evenement` avant d'écrire la seconde :
deux copies de cette logique auraient fini par diverger, et l'une aurait activé là où l'autre
rejette. Un test vérifie que les deux chemins n'ouvrent qu'un seul compte.

### Ce que le garde-fou d'architecture a attrapé

Les routes de M importaient `transverse.adaptateurs.entrant.dependances`, un module interne.
Le test l'a refusé. La correction a produit deux améliorations réelles :

**L'horloge est sortie du contexte K.** `maintenant()` y vivait ; un instant en UTC n'est pas
une affaire d'identité. Elle est passée dans `app/partage/horloge.py`, où les deux contextes
la lisent.

**Les dépendances HTTP sont passées en surface publique.** Résoudre un `Acces` depuis une
requête est un service du socle, que toutes les routes de tous les contextes emploieront.

Au passage, un cycle d'import est apparu — `api.py` important `dependances`, qui important
`api`. Réglé en faisant lire à `dependances` les modules concrets de son propre contexte : la
surface publique est faite pour les *autres*, pas pour soi-même.

### Ce qui est livré

**Dix routes, quatre dépôts, un fournisseur de paiement, 97 tests.** Le total passe à **739**.

Le parcours complet est prouvé de bout en bout par un test : devis → engagement → notification
→ compte créé → lien envoyé → mot de passe défini → connexion, avec vérification finale que
l'adhérent voit son dossier et seulement le sien.

### Ce qui manque, et qu'il faut dire

**Les échéances d'abonnement.** La première mensualité est encaissée ; les suivantes ne sont
ni appelées, ni relancées. C'est le manque le plus important de ce lot.

**Aucune limitation de débit** sur les routes publiques. Rien n'empêche d'établir dix mille
devis. La limitation appartient à la couche d'entrée ; l'oublier au déploiement exposerait le
prestataire à un flot d'initiations.

**Tara ne renvoie pas le montant dans sa notification.** Le contrôle de cohérence ne peut donc
pas s'exercer sur ce chemin : une notification forgée par quelqu'un qui aurait deviné
l'adresse de rappel et l'identifiant marchand validerait le paiement sans qu'aucun montant ne
soit confronté. Le filet est la réconciliation, par appel sortant.

**Aucun remboursement** n'est représenté.

---

## 15 août 2026 (suite 5) — Le contexte K, et la question que pose un contrôle

### Ce qui a été demandé

Brancher le front sur le backend, « mais sauf qu'il y a une logique de connexion et
d'accès ressource qui doit être bien implémentée » — tant pour la souscription à un
service, avec le lien de définition envoyé une fois le paiement validé, que pour le
volet administrateur, avec les rôles et l'allocation de dossiers. Avec une référence
explicite au fonctionnement d'Odoo, adapté au contexte camerounais.

L'ordre s'est imposé de lui-même : brancher des écrans sans savoir **qui demande**
reviendrait à les construire deux fois. Le contexte K vient donc avant le front.

### La décision de départ : porter, pas greffer

Le dépôt contient `mail+paiement/`, deux applications Django extraites d'un projet en
production. Le module de paiement est solide — `idempotency_key` envoyée à Tara comme
`productId`, webhook atomique et rejouable, matching à trois stratégies, cron de
réconciliation, timeout à 24 h. Ce sont exactement les garanties qui empêchent le
double-encaissement, et elles ont été durcies en prod.

Mais elles sont en Django, et l'ERP est en FastAPI. Deux options :

* **garder Django à côté** — rien à réécrire, mais deux backends, deux bases, deux
  authentifications à réconcilier, et le lien entre un paiement et un dossier qui
  traverse le réseau ;
* **porter le cœur** — reprendre l'algorithme à l'identique derrière nos ports,
  remplacer le modèle Django et l'admin par nos dépôts.

Le choix est le second. Ce qui a de la valeur dans ce module n'est pas son ORM, c'est sa
mécanique anti-compensation, et elle est indépendante du framework. Le port
`ServiceNotification` a d'ailleurs été **dessiné sur la signature de `send_template`** —
un code de gabarit, un destinataire, un contexte — pour que le branchement du courriel
soit une substitution d'adaptateur et non une réécriture des appelants.

### Ce qui est livré

Le contexte **K · Transverse**, quatorze routes, cinq dépôts, 119 tests. Le total passe
à **634**.

**L'identité.** Un `Compte` qui ne porte ni rôle, ni mot de passe. Le rôle est une
habilitation datée ; le mot de passe est une empreinte opaque, dérivée par un service que
le domaine ne connaît pas. Un troisième état existe, et c'est le plus utile :
`EN_ATTENTE_ACTIVATION` — créé, lien parti, mot de passe jamais défini. C'est l'état le
plus fréquent en production, et celui qu'on oublie de traiter dans les écrans.

**L'habilitation datée.** C'est le cœur du lot, et le raisonnement mérite d'être écrit :

> La question qu'un contrôle pose n'est jamais « qui est comptable ? » mais **« qui était
> habilité le 12 mars, jour où cette déclaration a été déposée ? »**. Un rôle stocké en
> colonne ne sait répondre qu'à la première. Le jour où un réviseur quitte le cabinet et
> qu'on supprime son rôle, toutes les déclarations qu'il a déposées apparaîtraient
> rétroactivement comme déposées par quelqu'un qui n'y était pas habilité. Le cabinet
> aurait fabriqué lui-même la preuve de son propre manquement.

On ne supprime donc jamais une habilitation : on la ferme. Le port n'offre pas de
méthode `retirer`, et c'est délibéré.

**Le cloisonnement par portefeuille.** Une habilitation porte une portée — une liste de
NIU, ou `null` pour l'ensemble du cabinet. Deux comptables du jeu de démonstration
détiennent **exactement les mêmes permissions** et ne voient pas les mêmes dossiers ; le
test le montre en deux lectures.

Deux rôles ne peuvent jamais obtenir la portée universelle : l'adhérent et l'inspecteur.
Un adhérent dont la portée serait `null` lirait la comptabilité de ses concurrents —
c'est la faute la plus coûteuse que ce contexte puisse laisser passer, et elle est
refusée à la construction plutôt que vérifiée à la lecture.

**Les sessions côté serveur.** Le réflexe courant est de tout mettre dans un jeton signé
et de ne rien garder. C'est séduisant, et cela rend la révocation impossible. Or un
collaborateur qui part le matin doit perdre son accès le matin, pas ce soir. Le coût est
une lecture par requête ; le bénéfice est qu'un administrateur peut réellement fermer une
porte, et un test le démontre : suspendre un compte coupe la session déjà ouverte.

**Les liens à usage unique.** Activation après souscription, réinitialisation,
invitation. Le secret n'existe en clair qu'une fois, le temps d'entrer dans le courriel ;
ce qui est conservé est son SHA-256. **Une copie de la base ne doit donner accès à aucun
compte.**

Trois durées, parce que trois risques : sept jours pour l'activation — celui qui la
reçoit vient de payer et n'ouvrira peut-être pas sa boîte avant le week-end —, deux
heures pour la réinitialisation, qui permet de prendre un compte déjà actif, quatorze
jours pour l'invitation d'un collaborateur, émise avant sa prise de poste.

**Le journal d'audit chaîné.** Chaque entrée porte l'empreinte de la précédente. Modifier
une entrée ancienne invalide toutes les suivantes. Append-only : ni `modifier`, ni
`supprimer`, y compris pour un administrateur — une correction s'écrit comme une nouvelle
entrée, exactement comme une contre-passation comptable.

### Trois décisions qui méritent d'être défendues

**L'administrateur n'est pas tout-puissant.** Il crée les comptes, distribue les rôles,
affecte les dossiers, lit le journal. Il ne valide **aucune** écriture, ne dépose
**aucune** déclaration, n'écarte **aucun** constat. C'est la séparation des tâches : la
personne qui peut s'octroyer un droit ne doit pas être celle qui l'exerce. Un
administrateur qui voudrait valider devrait d'abord s'attribuer le rôle de comptable — et
cette attribution laisse une trace datée. Le contournement reste possible ; ce qui compte,
c'est qu'il soit **visible**.

**Une seule réponse pour tous les échecs de connexion.** Compte inconnu, mot de passe
faux, compte suspendu, jamais activé, verrouillé : le même message. Distinguer les cas
offrirait un oracle d'énumération — on essaie une liste d'adresses, on note ce qui répond
différemment, et l'on obtient la liste des adhérents du cabinet. Chez un CGA, cette liste
a une valeur commerciale propre. Le temps de réponse est égalisé lui aussi : une
dérivation est exécutée même quand le compte n'existe pas, contre une empreinte leurre.
`POST /mot-de-passe/oubli` rend **202 dans tous les cas**.

**Douze caractères, aucune règle de composition.** Exiger « une majuscule, un chiffre, un
caractère spécial » produit `Douala2026!` chez tout le monde : la majuscule est la
première lettre, le chiffre est l'année, le symbole est le point d'exclamation final. Le
résultat est un mot de passe de onze caractères que n'importe quel dictionnaire de
mutations casse, et que son porteur note sur un papier. `chemise bleue mardi tarif` fait
vingt-cinq caractères, se retient, ne se note pas, et résiste incomparablement mieux.

Ce qui est refusé, en revanche : les mots de passe contenant le nom, le prénom ou
l'adresse de leur porteur — accents retirés pour empêcher le contournement.

### Deux détails qui décident de la moitié des appels au support

**On valide le mot de passe avant de consommer le lien.** Une faute de frappe ne doit pas
détruire un lien à usage unique et obliger l'adhérent à téléphoner au cabinet.

**Le verrou est une date, pas un drapeau.** Cinq échecs verrouillent quinze minutes. Un
booléen exigerait une tâche de fond pour le lever, et le compte resterait bloqué si cette
tâche tombait. Une date se périme toute seule.

### Ce que les tests ont corrigé

Deux échecs, et tous deux disaient quelque chose de juste.

**Une habilitation qui commence le 1er septembre ne donne rien le 15 août.** Le test
attendait l'accès immédiat ; le code avait raison. La propriété a gagné son propre test :
un contrat signé pour septembre n'ouvre pas les dossiers en août.

**La description d'une route contredisait la table des permissions.** Elle affirmait que
`AFFECTER_DOSSIER` appartenait à la direction seule ; la table la donne aussi à
l'administration. La table a raison — la direction décide de la répartition,
l'administration l'exécute. Ce qui compte est que ni le comptable ni le réviseur ne
l'aient : quelqu'un qui pourrait s'ajouter un dossier n'aurait plus de périmètre du tout.
C'est la documentation qui a été corrigée, et deux tests couvrent désormais les deux
versants.

### Ce qui est bloqué, et le reste visible

**Le second facteur n'existe pas.** `EXIGE_MFA` le déclare pour le dépôt d'une
déclaration ; aucune session n'est renforcée ; l'action est donc **refusée**. Un défaut
qui bloque vaut mieux qu'un défaut qui laisse passer : le premier se constate le jour où
l'on en a besoin, le second se découvre après le dépôt.

**Le chaînage ne protège pas de tout.** Quelqu'un qui contrôle la base et le code peut
recalculer la chaîne entière après avoir modifié une entrée. Il faudrait ancrer
périodiquement l'empreinte de tête sur un support que le cabinet ne contrôle pas. Ce n'est
pas fait, et c'est écrit dans le module plutôt que sous-entendu.

**L'atomicité du journal ne vaut que dans un processus.** Le verrou ordonne les fils d'une
même instance ; deux instances derrière un répartiteur écriraient deux entrées de même
rang. Seule une contrainte d'unicité en base le garantira. Le port l'exige, l'adaptateur
en mémoire ne le tient pas, et il le dit.

### Une contrainte d'architecture qui a de la valeur

K appartient au **socle** : lisible par les onze autres contextes, il n'en lit aucun. Il
ne peut donc pas importer le portefeuille, et un dossier y est désigné par son **NIU**,
une chaîne. K sait dire « ce compte a le droit d'ouvrir `M081234567890P` » ; il ne sait
pas ce que ce dossier contient.

Conséquence visible : les six NIU du jeu de démonstration sont recopiés dans K. Ce n'est
pas une duplication tolérée faute de mieux — c'est ce qui empêche le cycle. La cohérence
est garantie par un test, qui lui a le droit d'importer les deux.

### Le jeu de démonstration met en scène ce qu'il faut savoir traiter

Onze comptes, treize habilitations. Deux comptables aux portefeuilles disjoints. **Un
dossier orphelin** — la clinique n'est affectée à personne, et c'est ce que l'écran
d'administration doit remonter. **Une habilitation fermée** — un comptable parti le 30
avril, dont la ligne demeure : résoudre ses droits au 1er mars et au 1er juin donne deux
réponses. **Un adhérent jamais activé.** **Un inspecteur** en mission sur un seul dossier.

Le journal d'audit, lui, est rendu **vierge** : fabriquer un historique d'audit
produirait une chaîne de hachage qui n'atteste de rien.

### Ce qui vient ensuite

Le parcours de souscription — service, devis, paiement Tara, lien, accès —, qui appellera
`ouvrir_acces_adherent`. Cette fonction ne prend aucun `Acces` : elle est déclenchée par
le système à la validation d'un paiement, et ce qui la rend sûre est qu'elle n'a **aucun
degré de liberté** — le rôle est `ADHERENT`, la portée est le seul NIU souscrit, et rien
de tout cela n'est paramétrable. Une souscription ne peut pas fabriquer un réviseur.

Reste aussi à noter : les cinq services du cabinet et leurs prix vivent aujourd'hui dans
`messages/fr/vitrine.json`, en dur dans les traductions. Un tarif dans un fichier de
traduction est un tarif que le cabinet ne peut pas changer sans redéploiement, et qui n'a
aucune date d'effet. C'est le premier point à traiter au lot suivant.

---

## 15 août 2026 (suite 4) — Les adaptateurs, et ce que le premier branchement révèle

### Ce qui est livré

**Vingt-huit routes HTTP, huit dépôts, trois jeux de démonstration. 512 tests.**

Les quatre contextes récents — B, C, E, F — sont branchés : chacun a sa
persistance, ses données, et son API. Le backend expose désormais la chaîne
complète, du dossier jusqu'au montant à verser.

    /portefeuille/entreprises        qui est qui, à une date
    /collecte/pieces                 la boîte de réception
    /collecte/doublons               les arbitrages en attente
    /conformite/controler            le verdict
    /comptabilite/…/balance          la comptabilité
    /obligations/…/declaration-tva   la TVA du mois, rejets isolés

### La persistance est en mémoire, et ce n'est pas un pis-aller

La cible est PostgreSQL, et le dossier d'architecture la nomme depuis le premier
jour. Ces dépôts-ci ne sont pas la cible : ils **prouvent que les ports sont
utilisables** avant qu'un schéma de base ne les fige.

Un port qu'aucun adaptateur ne réalise est une hypothèse. Le réaliser une première
fois révèle immédiatement ce qui manque à l'interface. Écrire d'abord les tables
SQL, c'est découvrir ces manques après la migration, quand ils coûtent une
migration de plus.

Et ce qu'ils ne tiennent pas est écrit noir sur blanc. `DepotEcritures` exige une
numérotation continue **même en accès concurrent** : le dépôt en mémoire calcule le
maximum plus un, et deux appels simultanés rendraient le même numéro. Seule une
séquence de base de données le garantira. Un doublon de numérotation est aussi
grave qu'un trou, et c'est la première chose qu'un vérificateur contrôle.

### Trois défauts que seul le branchement pouvait révéler

**1 · La clé d'écriture n'est unique qu'à l'intérieur d'un dossier.**

`EcritureComptable` ne porte pas d'identifiant d'entreprise, et le port n'en prend
pas non plus. La conséquence n'était visible nulle part tant qu'un seul dossier
existait : `2026/AC/000042` désigne six écritures différentes sur six adhérents.

Le dépôt est donc ouvert **pour un dossier**, et les routes sont toutes préfixées
par le NIU. Le jour où les écritures partageront une table, il faudra une colonne
`entreprise` dans la clé primaire — ou dans l'entité et dans `cle`. La question est
posée maintenant plutôt qu'après la migration.

**2 · La patente est payable d'avance, et le modèle l'interdisait.**

`ObligationInstance` refusait toute échéance antérieure à la fin de sa période :
« on ne déclare pas une période avant qu'elle ne soit écoulée ». C'est vrai d'une
déclaration, et **faux d'une contribution payée d'avance**. La patente est due en
début d'année pour l'année en cours : c'est un droit d'exercer, pas la déclaration
d'un passé.

Le premier catalogue réel a fait tomber le modèle. Un champ `payable_d_avance`
distingue désormais les deux familles. Sans lui, l'un de ces deux défauts était
inévitable : soit l'échéancier refusait de produire la patente, soit il acceptait
des déclarations antidatées.

**3 · Les décisions du domaine ne franchissaient pas HTTP.**

Une `@property` d'un modèle Pydantic est calculée en mémoire et **absente du
JSON**. `depot_possible`, `total` d'une pénalité, `credit_a_reporter`, `solde` d'un
compte : rien de tout cela n'arrivait au front, qui aurait dû les recalculer.

Le jour où la règle change, le front et le back diraient alors deux choses
différentes sans que personne ne sache lequel a raison — c'est exactement le
travers que tout le reste du projet évite. Les propriétés qui portent une décision
métier sont donc passées en `@computed_field` : elles voyagent avec l'objet, et il
n'existe qu'une implémentation de la règle. Les autres restent de simples
propriétés.

### La divergence des régimes est corrigée

Le jeu de démonstration du frontend classait ETS TCHOUMBA & FILS et CABINET NGUEMA
CONSEIL au synthétique ; celui du backend mettait tous les destinataires au réel.
Deux portefeuilles différents, et l'écart se voyait là où il compte : une facture
reçue par un adhérent au synthétique n'ouvre **aucun** droit à déduction, et
`FAC-ACH-007` n'a alors rien à dire.

Le portefeuille du contexte B est désormais la source unique, et les factures s'y
alignent. **Un test le vérifie facture par facture** — c'est la même garde que
celle qui avait rattrapé le bug de `Regle.concerne()`.

Effet immédiatement visible : deux adhérents sur six ont des écritures d'achat à
**deux lignes** au lieu de trois, la TVA s'incorporant au coût. Même facture, même
fournisseur, deux écritures différentes — c'est la démonstration que le régime
commande la forme de l'écriture, et elle est maintenant dans les données.

### Les jeux de démonstration dérivent les uns des autres

Trente pièces, quatorze écritures, huit demandes. Aucun de ces jeux n'est écrit à
la main indépendamment des autres :

    portefeuille (B)  →  factures (D)  →  pièces (C)  →  écritures (E)

Les écritures sont construites **à partir des pièces**, en faisant tourner le vrai
moteur de conformité et la vraie imputation. L'arête `comptabilite → collecte`
existe pour cela et va dans le bon sens : la collecte n'a pas le droit de connaître
la comptabilité.

Conséquence : il n'y a aucune convention à maintenir en double. Une écriture porte
la clé que sa pièce annonce, parce qu'elle est construite à partir d'elle.

Cinq pièces restent en attente, pour deux raisons qu'il ne faut pas confondre :
quatre parce que le contrôle **interdit** la comptabilisation — NIU du fournisseur
absent ou radié —, une parce que ses lignes ne totalisent pas son hors-taxes et que
**l'imputation refuse de deviner**. Répartir l'écart produirait une écriture
équilibrée mais fausse. Le contrôle est moins sévère et la pièce n'avance pas
davantage : ce sont bien deux mécaniques distinctes.

### Une décision d'exposition à défendre

**Rien ne se lit sans date.** `a_la_date` est obligatoire partout où un statut est
rendu. Une route qui rendrait « le régime de l'entreprise » sans dire à quelle date
obligerait l'écran à supposer « aujourd'hui », et l'écran qui affiche une facture de
2022 afficherait le régime de 2026. C'est l'erreur que le contexte B a été bâti pour
rendre impossible : elle ne se voit pas, et elle fausse tout ce qui suit.

Corollaire assumé : `GET /portefeuille/entreprises` sans date répond **422**, et un
test le protège.

La seule exception est la fiche complète d'un dossier, qui rend **toutes** les
périodes. C'est l'écran où l'on répond à « depuis quand ? » et « pourquoi ? », et
ces deux questions n'ont de réponse que dans les motifs des périodes.

### Ce qui reste

- **PostgreSQL** : les huit dépôts en mémoire attendent leurs tables. Les ports ne
  bougeront pas ; c'est tout l'intérêt de les avoir réalisés d'abord.
- Le contexte **K · Transverse** : authentification et cloisonnement multi-tenant.
  Aujourd'hui la séparation est portée par l'instance de dépôt, ce qui suffit à un
  monolocataire et ne suffira pas au second.
- **H · Clôture**, toujours bloqué par le fiscaliste et non par la technique.
- Le service d'extraction réel derrière le port `ServiceExtraction`.

## 15 août 2026 (suite 3) — Le contexte C, et la chaîne prise par son commencement

### Ce qui est livré

**1 350 lignes, 58 tests. La suite passe de 397 à 455.**

Sept contextes sur douze portent maintenant du code : **A, B, C, D, E, F, L**.

Le parcours phare des maquettes — E03 boîte de réception → E02 rapport → E10
saisie — est complet de bout en bout. La facture n'apparaît plus par magie dans une
constante de démonstration : elle entre par le canal qu'un artisan de Bonabéri
emploiera réellement.

### Le contrôle qui rapporte le plus, et que personne n'écrit

**Le doublon.**

Un adhérent photographie sa facture et l'envoie par WhatsApp. Trois jours plus
tard, sans souvenir de l'avoir fait, il la redépose sur le portail. Deux pièces,
un seul achat — et **la TVA déduite deux fois**.

Ce contrôle est absent de presque tous les logiciels de gestion, pour une raison
qui mérite d'être comprise : le doublon **ne ressemble pas à une anomalie**. Les
deux pièces sont parfaitement conformes, chacune prise séparément. C'est leur
coexistence qui est fautive, et **aucune règle du contexte D ne peut la voir** — le
moteur de conformité contrôle *une* facture, jamais un ensemble.

Deux niveaux, et il ne faut pas les confondre :

| | Ce qui est comparé | Décision |
|---|---|---|
| **Certain** | empreinte SHA-256 identique | dépôt refusé |
| **Probable** | même émetteur, même numéro, même montant | accepté, **soumis à arbitrage** |

Le second est le cas fréquent, et c'est celui qui échappe à une comparaison
d'empreintes : deux photographies du même papier n'ont pas le même fichier. On
refuse donc uniquement sur la certitude mathématique — refuser à tort ferait perdre
une charge déductible le jour où un fournisseur réutilise ses numéros d'une année
sur l'autre, et personne ne s'en apercevrait puisque la pièce n'existerait jamais.

Les pièces **archivées restent dans le champ de la comparaison**. Une pièce archivée
a été traitée : c'est justement pour cela qu'un second exemplaire serait un doublon.
Les exclure serait la faute exacte que ce module doit empêcher — et c'est une faute
qu'on commet sans y penser, en filtrant « les pièces actives ».

### Une valeur lue par une machine n'est pas une valeur

Le score de confiance ne dit pas « ce montant est juste ». Il dit « j'ai bien lu ces
caractères-là ». Un moteur qui lit `1 500 000` avec 98 % de confiance sur une
facture portant `1 800 000` mal imprimé est très sûr de sa lecture, et il a tort.
**La confiance mesure la netteté de l'image, pas la véracité du document.**

D'où la règle du module : le score sert à trier le travail humain, jamais à le
supprimer. Et deux familles de champs, qui ne se traitent pas pareil :

- un **libellé** mal lu donne une écriture approximative — ça se corrige ;
- un **montant** ou un **NIU** mal lu donne une déclaration fausse. Le montant part
  dans la TVA du mois ; le NIU décide de la déductibilité elle-même.

Les seconds sont à validation humaine obligatoire **quel que soit le score, y
compris à 100 %**. Ce n'est pas de la défiance envers la technique : c'est que
l'erreur y est irrattrapable en aval, et qu'aucun gain de productivité ne vaut une
déclaration fausse signée par le Centre.

L'accès à la valeur passe par une propriété qui **lève** tant qu'elle n'est pas
retenue. Il n'existe aucun contournement, et c'est délibéré : un avertissement se
contourne par distraction, une exception non.

### Trois décisions de modélisation à défendre

**L'état « en anomalie » n'existe pas.** Le cycle décrit un *traitement*, jamais une
*qualité*. La qualité est dite par le rapport de D, daté et immuable. Les confondre
rendrait impossible le cas le plus banal du métier : une charge parfaitement
comptabilisée et fiscalement réintégrée. Elle est non conforme, et son traitement
est pourtant achevé.

**Le canal n'affecte pas la valeur probante.** Une facture envoyée par WhatsApp vaut
la même déposée sur le portail : ce qui fait foi, c'est le document, pas le tuyau.
Traiter WhatsApp comme un canal de seconde zone reviendrait à dégrader le seul canal
que beaucoup de TPE utiliseront réellement. Le canal ne sert qu'à savoir par où
relancer, et à mesurer d'où vient le retard.

**Deux dates, et elles ne disent pas la même chose.** `depose_le` est déclarée par
l'expéditeur, `recue_le` horodatée par le système. En mode hors ligne — une pièce
photographiée dans un atelier sans réseau, synchronisée neuf jours plus tard —
l'écart entre les deux est le délai de transmission. Une seule date les confondrait
et ferait disparaître la mesure la plus utile que le cabinet puisse produire sur un
adhérent.

### La phrase que le système ne dira jamais

**« Le dossier est complet. »**

Un logiciel ne peut pas le savoir. Il connaît les pièces reçues et les demandes
émises ; il ignore les factures que l'adhérent n'a mentionnées à personne. Un taux
de 100 % ne prouve qu'une chose : *tout ce qu'on savait attendre est arrivé*.

La distinction n'est pas de la prudence oratoire. Un comptable qui lit « dossier
complet » cesse de chercher, et c'est précisément là que la facture oubliée devient
un redressement. La propriété s'appelle donc `attentes_satisfaites`, et le libellé
affiché le dit en toutes lettres. Un test vérifie que le mot « complet » n'y figure
pas.

Ce qui décide d'un dépôt n'est d'ailleurs pas le taux : c'est l'absence de demande
**bloquante** ouverte. Dix demandes non bloquantes en souffrance pèsent sur la
qualité du dossier, pas sur la possibilité de déclarer.

### Pourquoi le contrôle part à la réception, et pas à la saisie

C'est l'arête `collecte → conformite`, et elle existe pour une raison de délai, non
d'architecture.

Une facture non conforme découverte au moment de la saisie — deux mois après sa
réception — ne se corrige presque jamais : le fournisseur a été payé, la relation
commerciale est passée à autre chose. La TVA est perdue. La même facture contrôlée
le jour de sa réception se corrige souvent : le fournisseur est encore en contact,
la facture rectificative coûte un appel téléphonique.

**Le seul moment où une facture est corrigeable, c'est tout de suite.** Toute la
valeur du contexte D dépend de ce que le contrôle arrive tôt.

La collecte ne retient du verdict que **la référence du rapport** — ni la sévérité,
ni l'enjeu, ni le nombre de constats. Dupliquer le verdict le ferait diverger dès la
première réévaluation, et c'est la copie périmée qui s'afficherait sur l'écran de la
boîte de réception.

### Le test qui tient tout

Le dernier test du fichier déroule le parcours entier sur la facture F-2026-0412 :

1. la pièce arrive par WhatsApp, deux jours après avoir été photographiée ;
2. l'OCR lit `2 530 000` avec 99 % de confiance — et se trompe d'un chiffre ;
3. l'identification est **refusée** : personne n'a retenu ce montant ;
4. le comptable corrige, la correction est tracée et nominative ;
5. le contrôle part aussitôt : enjeu **379 350 F**, correction à demander au
   fournisseur, comptabilisation autorisée ;
6. l'écriture est proposée, validée, la pièce rattachée à `2026/AC/000012` ;
7. trois jours plus tard le redépôt par le portail est **signalé** — fichier
   différent, facture identique, l'indice cite l'écriture déjà passée ;
8. et le même fichier, lui, n'entre même pas.

### Ce qui reste

- Les **adaptateurs** : persistance et exposition HTTP pour B, C, E et F. C'est
  désormais le chantier le plus rentable — quatre contextes attendent la même chose.
- **H · Clôture**, toujours bloqué par le fiscaliste et non par la technique.
- Le service d'extraction réel derrière le port `ServiceExtraction`.

## 15 août 2026 (suite 2) — Le contexte F, et la chaîne enfin fermée

### Ce qui est livré

**1 021 lignes, 36 tests. La suite passe de 361 à 397.**

F · Obligations était débloqué par B : il avait désormais tout ce qu'il lui faut
chez A (paramètres datés), B (rattachement, exercice, régime) et E (écritures).

### La règle qui commande tout le contexte

**Une date limite se calcule, elle ne se stocke pas.**

Elle dépend du type d'obligation, de la date de clôture et du centre de
rattachement. Le 15 mars n'est pas une constante : pour un exercice clos au
30 juin, l'échéance tombe en septembre. Et le dépôt est échelonné par centre —
`TypeObligation.decalage_par_centre` matérialise ce que la note du paramètre
`DSF_DELAI_JOURS_APRES_CLOTURE` réclamait déjà : « doit devenir un paramètre par
centre, pas une constante ».

Stocker des dates figées est la faute la plus courante d'un module d'échéancier.
Elle ne se voit pas tant que tous les adhérents clôturent au 31 décembre, et elle
se révèle au premier exercice décalé — c'est-à-dire au pire moment.

### Trois décisions de modélisation à défendre

**« En retard » n'est pas un statut stocké.** Le dossier de conception en listait
six ; il en reste cinq. Le retard est une comparaison entre une échéance et une
date, pas une propriété de l'obligation. Le stocker obligerait à balayer le
portefeuille chaque nuit, et une obligation deviendrait « en retard » avec un jour
de décalage selon l'heure du traitement.

**L'échéancier se génère depuis le profil, jamais depuis les pièces reçues.** Une
déclaration néant est due même sans opération : l'obligation naît de
l'assujettissement, pas de l'activité. Un échéancier alimenté par les factures
serait structurellement faux — et il le serait précisément pour les dossiers
dormants, ceux dont personne ne s'occupe et qui accumulent les pénalités en silence.

**Le profil est réévalué à la fin de chaque période, pas une fois pour toutes.**
C'est ce qui rend le franchissement de seuil correct : une entreprise assujettie
à partir de septembre a quatre déclarations de TVA sur l'exercice, pas douze et
pas zéro. Évaluer le régime une seule fois produirait dans un cas huit
déclarations fantômes, dans l'autre quatre obligations manquées.

### Le troisième maillon est posé

`etablir_declaration_tva` isole la ligne **« TVA rejetée par le contrôle de
conformité »**. C'est la ligne L24 de la maquette du parcours comptable, celle qui
avait imposé l'arête `obligations → conformite` lors de l'audit du 9 août.

Le rejet n'est pas recalculé : il est **lu** sur les attributs fiscaux que E a
posés à partir des constats de D. Ce module ne connaît aucune règle de
déductibilité, et c'est ce qui garantit que la déclaration dit exactement la même
chose que le rapport de conformité.

Le test final déroule la chaîne entière sur juillet 2026 :

| | |
|---|---|
| TVA collectée | 1 000 000 |
| TVA déductible théorique | 879 850 |
| **dont rejetée par la conformité** | **(379 350)** |
| TVA déductible admise | 500 500 |
| **Solde à verser au Trésor** | **499 500** |

Et chaque rejet est justifié pièce par pièce, avec le code de la règle et le motif
en clair. Dans une déclaration ordinaire, une TVA rejetée est **invisible** : la
case « TVA déductible » porte simplement un chiffre plus faible, et rien n'explique
pourquoi. C'est exactement l'argument commercial du cabinet.

### Une imprécision relevée dans le référentiel

Le calcul a fait apparaître un écart d'un jour. Le paramètre
`DSF_DELAI_JOURS_APRES_CLOTURE` vaut 75 et sa note dit : « 15 mars pour un
exercice clos au 31 décembre, soit 75 jours après clôture ».

Or 31 décembre + 75 jours donne le **16 mars**. Le 15 mars correspond à 74 jours.

Trois lectures possibles, et elles ne se valent pas :

1. le délai est de 74 jours, et la note contient une coquille ;
2. le décompte commence le lendemain de la clôture, ce qui décale d'un jour ;
3. **le 15 mars est une date civile fixe**, et la formule « clôture + N jours » ne
   vaut que pour les exercices décalés.

La troisième hypothèse changerait le modèle : il faudrait une périodicité
supplémentaire, ou une règle mixte. **À faire trancher par le fiscaliste** — c'est
ajouté aux questions ouvertes.

### Question ouverte sur les pénalités

Le décompte des mois de retard — mois calendaires ou périodes de trente jours,
fraction comptée ou non — n'est pas au référentiel. Le traitement retenu est le
plus défavorable au contribuable, donc le plus prudent pour le Centre : mieux vaut
annoncer une pénalité légèrement surestimée qu'une surprise au paiement. À
confirmer.

### État du backend

Six contextes sur douze portent du code : **A, B, D, E, F, L**. La chaîne de valeur
du produit est complète de bout en bout, du contrôle de la facture jusqu'au montant
à verser :

    facture → constat → attribut fiscal sur la ligne → TVA du mois

Il manque le dernier maillon — la réintégration au tableau de passage — qui
appartient à H · Clôture, lequel dépend des six questions fiscales encore ouvertes.

### Ce qui reste

- Les **adaptateurs** : persistance et exposition HTTP pour B, E et F.
- Le contexte **C · Collecte**, seul manquant du parcours E03 → E02 → E10.
- **H · Clôture**, bloqué par le fiscaliste, pas par la technique.

## 15 août 2026 (suite) — Le contexte B, et le patron du statut daté

### Pourquoi B après E

E · Comptabilité pouvait s'écrire sans le fiscaliste ; B · Portefeuille aussi, et
il était le **dernier prérequis avant F · Obligations**. Presque tous les contextes
le lisent : D pour la portée des règles, E pour l'assujettissement, F pour le
rattachement et l'exercice, H pour l'adhésion. C'est une feuille du graphe — il ne
dépend d'aucun contexte métier — et c'est justement ce qui en fait le goulot.

**1 200 lignes, 40 tests. La suite passe de 321 à 361.**

### Le patron : le statut daté

C'est la décision structurante, et elle est la même que celle du référentiel
normatif : **une donnée légale est une fonction du temps, pas une constante.**

Une entreprise n'*est* pas au régime du réel. Elle y est **depuis une date**, pour
un motif, et elle peut en sortir. Modéliser le régime comme une colonne est une
erreur qui ne se voit pas la première année et devient irréparable la troisième :
le jour où l'on contrôle une facture de 2024 pour une entreprise passée au réel en
2025, le rapport est faux — et faux **en silence**.

`Periode` porte l'intervalle `[debut, fin[`, borne haute exclue comme au
référentiel. `verifier_succession` distingue deux régimes de continuité, et la
distinction compte :

* régime et rattachement sont **continus** — une entreprise en relève à chaque
  instant de son existence, un trou est une erreur ;
* l'adhésion admet des **trous** — un adhérent peut partir et revenir, et boucher
  le vide lui accorderait rétroactivement des avantages qu'il n'avait pas.

Il n'existe aucune méthode `regime_courant()` publique. On lit `regime_au(date)`,
ou l'on ne lit rien. Un statut introuvable lève `StatutIntrouvable` plutôt que de
supposer le réel : c'est la même discipline qu'`AucuneVersionApplicable`.

### L'exercice, sans présomption

Ni année civile, ni douze mois. Les deux cas que le dossier de vision cite parmi
les huit pièges sont modélisés : l'**exercice décalé** — la DSF n'est alors pas due
le 15 mars mais soixante-quinze jours après *sa* clôture — et le **premier exercice
long**, quinze mois pour une entreprise créée en octobre.

`prorata()` rapporte à la durée **réelle**, jamais à 365 jours. Sur un premier
exercice de quinze mois, l'écart est de 25 %.

### Le franchissement de seuil, annoncé avant

C'est le scénario qui coûte le plus cher aux entreprises qui réussissent, et il les
prend toujours par surprise : passées au réel en septembre, elles continuent de
facturer sans TVA jusqu'en décembre, et l'administration la réclame ensuite « en
dedans » sur un prix qu'elles ont déjà encaissé.

`diagnostiquer_seuil` porte donc un **palier d'alerte anticipée** à 80 %. Ce n'est
pas une valeur légale mais un réglage de vigilance, qui appartient au cabinet : à
80 %, il reste en général un trimestre pour s'organiser. Alerter au franchissement
lui-même serait déjà trop tard.

Aucun seuil n'est connu du module : il les reçoit, résolus au référentiel à la date
demandée.

### La période probatoire

`retour_au_synthetique_admis` compte les exercices **entièrement écoulés et clos**
depuis le début de la période au réel. Un exercice à cheval sur la bascule ne
compte pas — le retenir abrégerait la période d'un exercice complet.

> **Question ouverte.** La période probatoire s'applique-t-elle de la même façon à
> un reclassement *subi* et à une option *volontaire* pour le réel ? Le décompte
> est ici le même dans les deux cas, ce qui est le traitement le plus prudent.
> À faire confirmer.

### Les identifiants, contrôlés contre le référentiel daté

Le format du NIU et celui du RCCM sont des valeurs légales datées. Une entité du
domaine ne peut donc pas les vérifier : elle n'a le droit d'importer que les
*contrats* d'un autre contexte, jamais son service. La vérification vit dans la
couche cas d'usage, qui reçoit `ServiceParametres`.

Elle **rend des anomalies plutôt que de lever** : un portefeuille repris d'un autre
cabinet contient toujours des identifiants douteux, et il faut pouvoir les lister
pour les corriger, pas refuser de charger le dossier. Même logique que
`RegleEnEchec` dans le moteur de conformité.

### Une duplication délibérée, qui mérite d'être défendue

`RegimeFiscal` (contexte B) et `RegimeEmetteur` (contexte D) sont deux énumérations
distinctes portant les mêmes valeurs. **C'est voulu.** Chaque contexte borné garde
son vocabulaire, et la correspondance se fait à la composition. Les fusionner
créerait une dépendance de D vers B qui n'a aucune raison d'être : le moteur de
conformité évalue une règle sur une facture, il n'a pas besoin de connaître le
portefeuille.

C'est le genre de point qu'un architecte relèvera en revue. La réponse est
documentée à l'endroit où il regardera.

### La composition B → D → E, démontrée

Trois tests prennent la **même facture** — même fournisseur, même montant, réglée en
espèces — et la font passer par les trois contextes à deux dates différentes du
dossier BATIMENT PLUS :

| | Juin 2022, au synthétique | Janvier 2024, au réel |
|---|---|---|
| Régime lu chez B | IGS | RÉEL |
| `FAC-ACH-007` chez D | hors portée | déclenchée |
| Enjeu | 0 | 379 350 FCFA |
| Écriture proposée par E | `604` · `401` | `604` · `4451` · `401` |
| Première ligne | 2 350 000 (TVA incorporée) | 1 970 650 |

Les trois contextes ne se connaissent pas. C'est la couche de composition qui lit
le régime chez B et le transmet — et le résultat change du tout au tout.

### Le cloisonnement multi-tenant n'apparaît pas dans le port

`DepotEntreprises` n'a aucun paramètre `tenant`. Le filtrage est appliqué **dans la
couche de persistance**, systématiquement. Le faire remonter jusqu'à l'interface
donnerait l'illusion d'une sécurité tout en la rendant contournable : il suffirait
d'oublier l'argument une fois.

### Ce qui reste

- Les **adaptateurs** de B et de E : persistance, exposition HTTP.
- Le contexte **F · Obligations**, désormais débloqué — il a tout ce qu'il lui faut
  chez A, B et E.
- La nomenclature exacte des régimes, qui reste la question n° 12.

## 15 août 2026 — Un manuel pour tenir la conversation, puis le contexte E

### Ce qui a été demandé

Deux choses, dans cet ordre. D'abord un document de référence permettant de
comprendre les rouages de la comptabilité et de la fiscalité camerounaises sans
être du métier, et de **défendre la solution devant des experts du domaine**.
Ensuite, reprendre la conception pendant la lecture.

### Le manuel — `Docs/manuel/`

92 pages, six parties, neuf exercices corrigés, six scénarios déroulés jusqu'au
dépôt de la DSF.

**Le parti pris qui commande tout.** Chaque affirmation est marquée selon quatre
niveaux : *mécanisme* — structurel, affirmable sans réserve —, *valeur du
référentiel* — présente mais au statut `A_VALIDER` —, *inconnue* — absente, à
obtenir du fiscaliste — et *piège*.

Aucun taux camerounais n'est avancé comme une vérité. C'est la seule posture
tenable face à un expert-comptable qui exerce depuis vingt ans : vouloir rivaliser
sur les valeurs, c'est perdre sa crédibilité au premier chiffre périmé par une loi
de finances. En revanche, la question « que se passe-t-il dans votre outil quand le
seuil change en janvier ? » est notre terrain, et la réponse retourne une réunion.

La contrepartie de cette honnêteté est une **liste de 28 questions ouvertes**,
classées non par thème mais par ce que chaque réponse débloque. Six d'entre elles
empêchent tout calcul d'impôt juste. Deux étaient inconnues du référentiel :
le **minimum de perception** — qui peut annuler l'abattement CGA — et le taux d'IS.

### Le contexte E · Comptabilité

Choisi parce qu'il est le **seul module qui ne dépend d'aucune des 28 questions**.
Les taux, les seuils, l'abattement : rien de cela n'entre dans une écriture. E
pouvait s'écrire sans attendre le fiscaliste, et il débloque F et H, qui ne
peuvent rien calculer sans écritures.

**1 460 lignes, 82 tests. La suite passe de 237 à 321.**

Quatre invariants portés par le modèle, non par une note :

* équilibre **au niveau de l'écriture**, jamais de la ligne ;
* numérotation continue par journal et par exercice, avec détection des trous ;
* immuabilité après validation — le port de dépôt n'a **pas** de méthode
  `supprimer`, et il n'existe pas d'état « annulée » ;
* une écriture validée porte sa pièce et le nom de qui l'a validée, comme une
  version de paramètre au référentiel : valider engage une personne.

**La balance et le grand livre sont des projections, pas des entités.** Les
persister créerait une seconde vérité, qui divergerait au premier incident. Une
comptabilité n'a qu'une source : le journal.

**La soudure D → E.** `appliquer_rapport()` prend un rapport de conformité produit
par le vrai moteur et pose les attributs fiscaux sur les lignes concernées. C'est
le maillon qui manquait : le moteur produisait des constats que personne ne
consommait. Éprouvé de bout en bout sur `F-2026-0412` — 379 350 FCFA de TVA
rejetée, le chiffre exact du bandeau de verdict, obtenu par un chemin entièrement
différent.

**L'imputation.** `proposer_ecriture_achat()` construit l'écriture depuis une
facture contrôlée, en brouillon, déjà qualifiée. Le comptable garde la main : le
système impute, il n'enregistre pas.

### Une erreur trouvée en écrivant les tests

`controle_bouclage` calculait `situation + résultat == 0`. C'est faux : l'identité
est `situation == résultat`, puisque l'actif n'égale le passif qu'une fois le
résultat reporté. Corrigé, avec la démonstration dans la docstring.

C'est exactement pourquoi le jeu de test est un exercice minuscule mais **dont les
totaux tombent juste** — un jeu dont la balance ne s'équilibre pas ne prouve rien.

### La correction du contexte D — deux régimes, pas un

En déroulant le cas d'un adhérent au régime synthétique, un défaut réel est apparu.
`Regle.concerne()` filtrait sur le régime de l'**émetteur**, c'est-à-dire du
fournisseur. Or la déductibilité dépend du régime du **destinataire** : l'adhérent
lui-même.

Conséquence : `FAC-ACH-007` annonçait à un adhérent au synthétique une « TVA non
déductible » de plusieurs centaines de milliers de francs — **un préjudice qui
n'existe pas**, puisqu'il ne récupère jamais la TVA, en espèces comme par virement.

`Portee` porte désormais `regimes_destinataire`, et `FAC-ACH-007` est limitée au
régime du réel. Le gabarit de facture de `test_regles.py` déclarait un destinataire
au régime `INCONNU` : il a été corrigé, ce qui est de toute façon plus réaliste.

> **Question laissée ouverte.** `FAC-ID-003` n'a **pas** été restreinte. Sa
> conséquence fiscale est nulle au synthétique, mais le constat garde une valeur au
> titre de l'obligation de sincérité. Maintenir sans enjeu chiffré, ou écarter ?
> À trancher avec le cabinet.

### Deux points de variation laissés ouverts, délibérément

Le code **ne décide pas** quel compte reçoit une TVA devenue non récupérable —
charge d'origine ou compte dédié. C'est une décision d'imputation du cabinet, et
elle commande une question fiscale non tranchée : cette TVA passée en charge
est-elle elle-même déductible du résultat ? Le choix est exposé dans
`PlanImputation`, pas figé dans le code.

De même, l'inventaire permanent ou intermittent n'est pas arbitré : il changerait
les écritures d'achat elles-mêmes.

### Divergence relevée entre les deux jeux de démonstration

`donnees-demo.ts` classe TCHOUMBA et Cabinet Nguema à l'IGS ; `donnees_demo.py`
construit **tous** les destinataires au régime du réel, en dur. Sans conséquence
tant que la portée ignorait le destinataire ; visible désormais. À reprendre.

### Ce qui reste

- Les **adaptateurs** de E : persistance des écritures, exposition HTTP de la
  balance et du grand livre.
- Le **plan comptable OHADA** à importer au référentiel, préalable à
  `balance_par_racine` en conditions réelles.
- Le contexte **B · Portefeuille**, dont E lit l'exercice et le régime.
- Le `.venv` du dépôt est un venv **Windows**, inutilisable sous Linux.
  `pydantic-settings` et `fastapi` ont été installés dans le Python courant pour
  faire tourner la suite ; un venv propre reste à recréer.

## 14 août 2026 (suite) — Le front et le back prennent chacun leur dépôt

### Ce qui a été demandé

Pousser `Frontend_erp_cga` dans `horus-lab-team-s/Frontend-erp_cga` et
`Backend_erp_cga` dans `horus-lab-team-s/Backend-erp_cga`, deux dépôts vides.

### Deux décisions avant d'agir

**L'historique est conservé.** Les commandes de création fournies par GitHub
proposent un `git init` et un « first commit » : les deux dépôts seraient partis
avec un seul commit et aucun passé. `git filter-repo` extrait chaque sous-dossier
avec les commits qui l'ont touché — douze pour le front, sept pour le back — et
réécrit les chemins à la racine. `git blame` reste utilisable. Un historique ne se
reconstitue jamais après coup, et le nôtre porte le détail des décisions.

**Le backend emporte ce dont il dépend.** `config.py` désignait trois dossiers
situés au-dessus de `Backend_erp_cga/`. Poussé seul, il n'aurait pas démarré.
Sont donc partis avec lui `Contenu_vitrine/` — la matière du blog —,
`Docs/referentiel/` — les paramètres légaux — et `Docs/architecture/`, cité par
les docstrings de presque tous les contextes. `RACINE_DEPOT` remonte désormais de
deux niveaux et non plus de trois.

Le reste de `Docs/` — cahiers des charges, maquettes, ce journal — demeure au
monorepo : il ne se rattache ni au front ni au back.

### Le test qui regardait par-dessus la clôture

Un test vérifie que chaque article trouve son illustration. L'image est servie par
le front, désormais ailleurs. Le supprimer aurait été le plus simple et le plus
coûteux : c'est lui qui garantit qu'un lien partagé sur Facebook porte sa vignette.

Il cherche donc `../Frontend-erp_cga/public`, obéit à
`CGA_DOSSIER_PUBLIC_FRONTEND`, et se déclare **sauté** s'il ne trouve rien. Sauté,
pas réussi : un test qui passe faute d'avoir rien trouvé ment sur ce qu'il protège.

### Ce qui manquait au front pour tenir seul

Un lockfile — celui du monorepo était au format workspace et ne s'appliquait pas à
un paquet isolé. Un `.env.example`, parce que sans backend le blog retombe sur sa
copie de secours **sans que rien ne le dise à l'écran**. Un README qui prévient que
le texte des articles n'est pas dans ce dépôt. Et son propre
`pnpm-workspace.yaml`, pour la raison ci-dessous.

### Une trouvaille en chemin

`C:\Users\tonba\pnpm-workspace.yaml` existe, daté du 28 juillet, et contient des
valeurs jamais renseignées (« set this to true or false ») — le résidu d'un
`pnpm approve-builds` interrompu. pnpm remonte les dossiers parents jusqu'au
premier fichier de workspace : **tout projet pnpm placé sous le répertoire
personnel et dépourvu du sien est capturé par celui-là**, et son `pnpm install`
n'écrit alors ni `node_modules` ni lockfile. Le monorepo y échappe grâce au sien.
Le fichier n'a pas été supprimé — il est hors du projet, la décision revient au
propriétaire du poste.

### Vérifications

Backend : `ruff` au vert, 237 tests quand les deux dépôts sont côte à côte,
236 plus un sauté quand il est seul. Front : `tsc` et `eslint` sans un
avertissement, build complet à 58 pages, installé depuis son seul lockfile.

Le monorepo n'a pas été touché : tout le travail a eu lieu sur des clones jetables,
`git filter-repo` réécrivant l'historique en place.

### Ce qui reste

Les deux extraits ne se mettront **pas** à jour tout seuls. Une modification du
monorepo demande de rejouer l'extraction. Décider, quand le moment viendra, lequel
des trois porte la vérité — vivre longtemps avec les trois est le meilleur moyen
de les voir diverger.

---

## 14 août 2026 — Le lot part sur le dépôt personnel

### Ce qui a été demandé

Pousser le projet sur `github.com/LoicTonba/erp_cga_brcg`, sur une branche
destinée à être fusionnée.

### Ce qui a été fait

Le dépôt de travail est `horus-lab-team-s/erp_cga_brcg`. Le dépôt personnel a
été ajouté comme second remote sous le nom `loic` plutôt que de détourner
`origin` : deux destinations différentes doivent porter deux noms différents,
sinon un `git push` distrait envoie le travail au mauvais endroit.

Son `main` est le résultat de la fusion de la demande de tirage n° 1 et porte
exactement l'arbre de `819e5a3`, qui est un ancêtre direct de la branche
courante. La fusion se fera donc sans conflit et sans historique étranger — la
branche poussée n'apporte que les deux commits qui manquent : le passage du
contenu au backend avec le blog, et la revue de design.

### Ce qui reste hors du dépôt, et pourquoi

Trois éléments étaient présents dans le répertoire de travail sans être suivis.
Ils sont désormais nommés dans `.gitignore`, pour que leur exclusion soit une
décision écrite et non un oubli reconduit à chaque commit.

- **`Docs/publications-facebook-blog/`** — 74 Mo de captures d'écran. C'est la
  matière première des articles, pas le produit. Git ne sait pas oublier un
  binaire : une fois entré dans l'historique, il pèse sur chaque clone à venir,
  y compris ceux qui n'ont que faire des captures.
- **`mail+paiement/` et `mail+paiement.zip`** — modules Django d'envoi de
  courriels et d'encaissement mobile money, extraits d'un autre projet en vue
  d'une greffe future. Ils ne sont branchés à rien ici, et le dossier traîne ses
  `__pycache__`. Ils entreront au dépôt quand ils seront intégrés, adaptés au
  backend FastAPI, et non avant — voir le rappel Taramoney plus bas dans ce
  journal.

### Vérifications avant envoi

`tsc` sans erreur, `eslint` sans avertissement, 237 tests backend au vert.

---

## 13 août 2026 — Revue de design, page par page

### Ce qui a été demandé, et ce qui a été fait

Une revue complète du rendu, après parcours du site. Point par point.

**Les bannières.** Contenu centré, sur l'accueil comme sur les pages
intérieures. Sur l'accueil, le texte est centré dans la place que lui laisse le
formulaire, qui garde sa colonne — le centrer sur la largeur entière l'aurait
fait passer dessous. Le chapeau passe en `text-wrap: balance` : sur un texte
centré, ce qui se voit d'abord est l'inégalité des lignes.

**Deux boutons magenta dans la même bannière.** C'était le cas sur l'accueil —
l'action du carrousel et l'envoi du formulaire — et sur la connexion. Deux
boutons de la couleur primaire ne hiérarchisent plus rien : l'œil ne sait plus
lequel est l'action principale. Nouvelle variante `bouton--inverse`, blanc plein,
pour la seconde action forte d'un écran sombre. Elle garde le même poids visuel
sans disputer la couleur de marque.

**Les cartes de service.** L'icône était accrochée en bas à gauche de la
photographie, où elle passait pour une vignette de coin. Elle est désormais
ronde, centrée en tête, et **logée dans une échancrure** du corps de la carte.
L'entaille est faite au masque plutôt qu'à la bordure : elle découpe réellement
le fond, si bien que la photographie transparaît dans l'arc — une bordure de la
couleur du fond aurait donné un anneau plat, pas un creux.

**Le prix.** En simple ligne de texte au bas de la carte, il se lisait comme une
mention légale et se perdait à côté du lien d'action. Il est passé dans sa propre
pastille cerclée, qui s'inverse au survol. C'est l'information que le visiteur
cherche en premier ; elle devait se voir en premier.

**Le ruban des témoignages** passe de 11 à 18 secondes par carte. Régler les deux
bandes sur la même cadence était une erreur de raisonnement : un logo se
*reconnaît* d'un coup d'œil, un témoignage se *lit*. À vitesse égale, la seconde
bande passait avant qu'on ait fini la première phrase.

**« Parlons de votre projet ».** Tout sur l'axe central, et les boutons **sous**
le texte. Auparavant le texte était à gauche et les boutons à droite : sur un
écran large, un mètre séparait la phrase de l'action qu'elle appelait. Le
bandeau étant commun aux pages, la correction vaut partout d'un coup.

**La navigation reste à l'écran.** `fixed`, et non `sticky` : les deux gardent la
barre visible, mais `sticky` occupe sa place dans le flux et pousserait toute la
page de 126 px vers le bas — or les bannières compensent **déjà** un en-tête en
superposition. Le fond ne se teinte qu'une fois la page défilée : sur la
photographie, une barre opaque couperait l'image ; plus bas, du blanc sur fond
clair serait illisible.

**Flèche de retour en haut**, en bas à droite, au-delà d'un écran et demi de
défilement. Posée plus haut que le bandeau d'annonce pour ne pas recouvrir son
bouton de fermeture.

**La page de connexion reçoit l'en-tête et le pied.** Décision qui **renverse**
le choix initial. Elle vivait sans navigation, au motif qu'une page de connexion
offrant dix autres chemins détourne de la seule action attendue. Le raisonnement
valait pour la concentration, mais il coûtait plus cher ailleurs : dépouillée de
tout repère, la page donnait le sentiment d'avoir quitté le site pour un service
tiers — exactement l'inquiétude qu'on ne veut pas susciter au moment de saisir un
identifiant. Elle ne porte toujours ni bandeau d'appel, ni annonce : on ne
relance pas commercialement quelqu'un qui se connecte.

**La direction générale mise en avant** sur la page Le CGA, hors de la grille de
l'équipe — une carte identique à celles de ses collaborateurs l'aurait noyée
parmi eux. Portrait, fonction, présentation, et lien vers son site personnel.

**Les agences** reprennent le dispositif de l'échancrure, et leurs trois lignes
sont hiérarchisées : ville, quartier en capitales, précision. Elles se suivaient
auparavant au fer à gauche dans un même paragraphe, où l'adresse se confondait
avec la note.

**Contact** — la phrase « le téléphone reste le champ principal : beaucoup de nos
clients n'utilisent pas de messagerie électronique » est retirée. Le retrait est
juste : c'était une note de conception, pas un argument de vente, et lue par un
prospect elle donnait de la clientèle du cabinet une image peu flatteuse. Le
constat guide toujours la mise en page — le téléphone reste le champ exigé — mais
il n'est plus écrit.

### Seconde passe du 13 août — reprise de l'échancrure, et fin des impasses

**L'échancrure était au mauvais endroit.** Premier essai : l'icône logée à la
jonction entre la photographie et le texte, au milieu de la carte. Ce n'était pas
le dessin demandé. L'icône doit chevaucher **l'arête haute** de la carte — moitié
au-dessus, moitié dedans — et l'échancrure se creuser juste sous elle, dans le
bord supérieur.

Le point technique qui commande toute la structure : **un masque s'applique à
toute la descendance de l'élément masqué**. L'icône placée dans la carte aurait
donc été rognée par l'échancrure même qui doit l'accueillir, c'est-à-dire coupée
en deux. D'où une enveloppe qui n'est masquée par rien et porte les deux — la
carte échancrée d'un côté, l'icône de l'autre.

Trois mesures vont ensemble et ne se changent pas séparément : icône de 60 px,
échancrure de rayon 38, réserve haute de 30 px — exactement la moitié de l'icône.
Le soulèvement au survol a été retiré des cartes échancrées : la carte montait de
3 px pendant que l'icône restait en place, et le liseré devenait inégal.

**Quatre entrées du méga-menu menaient à la page Contact.** Prestations
ponctuelles, domiciliation, assistance juridique, conseil et audit : autant
d'impasses. Un visiteur qui clique sur « Domiciliation » veut savoir ce que
couvre la domiciliation, pas remplir un formulaire — on lui demandait de
s'engager avant de lui avoir dit ce qu'on vendait.

Chacune a désormais sa fiche, à `/services/<slug>`, sur un gabarit unique :
qu'est-ce que c'est, ce qui est compris, pour qui, comment ça se passe, combien.
Quatre pages écrites séparément auraient divergé au premier ajout ; le contenu
vit donc dans les messages et la mise en page une seule fois. L'ordre des
sections est l'argumentaire : ce qui est compris **avant** pour qui, et le tarif
en dernier — un montant lu avant ce qu'il couvre paraît toujours cher.

Les trois services qui ont déjà une page propre — création, adhésion, formations
— n'y passent pas.

**Deux chapeaux de bannière sur deux lignes** (Estimation, Blog). Le nombre de
lignes ne se décrète pas : on élargit la colonne de lecture et `text-wrap:
balance` répartit les deux lignes à longueur voisine. Sous 900 px la contrainte
tombe et le texte se replie sur ce qu'il faut — deux lignes sur un téléphone
donneraient des caractères minuscules.

⚠️ **Le contenu anglais des quatre fiches est encore en français.** Le gabarit et
l'interface sont bilingues, mais les textes n'ont pas été traduits : les faire
passer à la machine sur un contenu commercial aurait produit de l'anglais
approximatif au nom du cabinet. À faire traduire.

### 14 août 2026 — Le pied de page, et trois liens qui tombaient dans le vide

**Vérification demandée, et elle a trouvé quelque chose.** Le cabinet a demandé
de contrôler que les liens du pied mènent bien quelque part. Les vingt entrées
des trois colonnes fonctionnaient — les six formes juridiques vers l'estimateur
pré-rempli, les ancres du CGA, le blog, les formations. Mais les **trois liens de
la dernière ligne — mentions légales, confidentialité, conditions générales —
tombaient en 404 depuis le premier jour.** Ils étaient liés sans jamais avoir été
écrits.

C'est le genre de défaut qui passe inaperçu longtemps et se paie d'un coup : ce
sont précisément les pages qu'un visiteur méfiant va vérifier avant de confier
son numéro, et elles sont par ailleurs obligatoires.

Les trois pages existent maintenant, sur un gabarit commun. **Tout ce que le
dépôt sait de façon vérifiable y figure** — dénomination, agrément, boîte
postale, contacts — et **tout le reste est marqué « à compléter » en toutes
lettres** : numéro RCCM, capital social, hébergeur, responsable de publication
nommé, durées de conservation, clause de médiation. Rien n'a été inventé, et
c'est délibéré : une mention légale fausse est pire qu'une mention absente, parce
qu'elle engage le cabinet sur des informations qu'il n'a pas données et qu'elle
passe inaperçue précisément parce qu'elle a l'air complète.

**Le cabinet doit relire et compléter ces trois pages avant toute mise en ligne.**

Corrigé au passage : « Domiciliation » pointait encore vers la page Contact,
du temps où elle n'avait pas de fiche. Elle mène désormais à la sienne.

**Le panneau des services s'ajuste à son contenu.** Il gardait la largeur héritée
de l'ancien méga-menu à trois colonnes, alors qu'il ne porte plus qu'une liste de
sept intitulés : la moitié de sa surface était vide. `width: max-content` le fait
mesurer sa plus longue entrée, borné pour ne pas déborder de la fenêtre.

**Le pied de page, troisième allègement.** La bande « Suivez-nous » — encadrée de
deux filets, sur toute la largeur, pour trois logos et un numéro — a disparu ;
les logos ont rejoint la première colonne. Le téléphone fixe et le courriel en
sont retirés, pour la même raison que l'agrément la veille : la barre utilitaire
est désormais **fixe**, donc lisible à tout moment, y compris au bas d'une page
longue. Répéter une coordonnée qui ne quitte jamais l'écran n'apprend rien.

Sur téléphone, les colonnes passent à deux au lieu de quatre empilées, avec des
interlignes resserrés — un pied de page se parcourt du pouce, il ne se lit pas.
En dessous de 420 px, retour à une colonne, mais le pied est alors déjà bien plus
court qu'avant.

**La signature est centrée et cliquable**, vers `horus-lab.com`.

### Troisième passe du 13 août — direction artistique, et le passage à l'action

**Les boutons deviennent carrés et sans bordure.** Direction arrêtée par le
cabinet, dans la ligne de la pilule de navigation dont les angles avaient déjà
été redressés le 10 août. Les bordures partent avec les arrondis : elles
doublaient le fond des boutons pleins et faisaient bavocher les angles vifs. Une
seule exception, dictée par la lisibilité et non par le goût : `bouton--clair`
garde son contour, car sur une photographie un bouton clair sans contour se
dissout dans l'image.

**Le panneau des services est réduit à une liste.** Il portait sept fiches
détaillées, les six formes juridiques et un encart « Vous hésitez ? » à deux
boutons : la moitié de l'écran, pour redire ce que la page du service allait de
toute façon expliquer. Un menu conduit quelque part, il n'informe pas. Reste une
liste séparée d'un filet magenta, où l'on choisit et où l'on part. Les formes
juridiques ont disparu d'ici : la page Création les présente déjà toutes, et les
répéter revenait à tenir deux inventaires de la même chose.

**Le passage à l'action manquait.** C'est le vrai défaut que le cabinet a
relevé : les fiches expliquaient bien, puis renvoyaient vers une page Contact
générique où tout était à ressaisir — y compris le service qu'on venait de passer
trois minutes à lire. Un formulaire unique, `FormulaireService`, est désormais au
bas de chaque page, **pré-rempli sur ce que le visiteur regarde**.

Le sujet voyage dans l'adresse (`?service=…#demande`) plutôt que dans un état
client. Trois avantages : « Réserver une place » et « Demander mon bulletin »
restent de simples liens, les pages demeurent rendues par le serveur, et une
demande portant sur une session ou une formule précise se partage telle quelle.
Le service est **affiché et modifiable**, pas caché dans un champ masqué : le
visiteur doit voir sur quoi part sa demande, et l'on se trompe de page.

Branché sur les quatre fiches de service, la page Création, la page Formations
(chaque session) et la page Adhérent (chaque formule).

⚠️ **La demande n'est pas envoyée par le serveur.** Elle compose un message et
ouvre le client de messagerie du visiteur, à destination de
`contact@cga-brcgroup.com` ; il doit appuyer sur « Envoyer ». Un envoi réellement
automatique suppose un point d'entrée FastAPI **et des identifiants SMTP** que le
cabinet n'a pas fournis. Entre-temps, deux options : ce `mailto`, où la demande
part vraiment, ou un formulaire qui affiche « merci, c'est envoyé » alors que la
saisie est jetée en silence. La seconde est pire. Le bouton WhatsApp est là pour
la même raison, et il sera sans doute le plus utilisé.

**Les proformas sont téléchargeables** sur la page Création — les deux devis type
fournis par le cabinet, servis depuis `public/documents/` sous un nom normalisé.
Les fichiers d'origine portaient espaces et majuscules, qui font des adresses
fragiles une fois partagées par message. Le motif du `proxy` a dû être élargi :
sans cela, la négociation de langue interceptait `/documents/…` et rendait un 404.

**Un texte invisible, corrigé.** La carte `avantage` est dessinée pour le fond
indigo de l'accueil : texte blanc sur voile blanc translucide. Reprise telle
quelle sur les fiches de service, qui sont sur fond clair, elle donnait du blanc
sur blanc — le texte n'était tout simplement pas lisible. D'où `avantage--clair`.

**Le filigrane sort entier, et deux fois par page au plus.** Il débordait de
60 px à droite, si bien que la marque était coupée ; elle est désormais
entièrement dans le cadre, un peu plus petite et un cran plus discrète. Les pages
qui l'affichaient quatre ou cinq fois sont ramenées à deux.

**La frise du CGA revient au fer à gauche.** Posée dans une section centrée, elle
héritait du centrage : on ne savait plus quel récit allait avec quelle date. La
colonne est ramenée à gauche et bornée à 780 px — étalée sur toute la largeur,
l'année et son texte se retrouvaient à un mètre l'un de l'autre.

**Deux faux états actifs supprimés.** L'icône de la carte « Création
d'entreprise » s'allumait en magenta au repos, et l'entrée « Création
d'entreprise » du menu était surlignée par défaut. Dans les deux cas cela
ressemblait à une sélection en cours, alors que rien n'était sélectionné. Le
magenta est rendu au survol, où il signifie exactement une chose : le curseur est
ici.

**Le pied de page est allégé.** L'infolettre en part — elle occupait la moitié de
la largeur, avec titre et explication, sur chaque page — et rejoint le bandeau
« Parlons de votre projet », réduite au champ et au bouton : le titre de la
section dit déjà pourquoi on écrirait au cabinet. L'agrément ministériel est
retiré du pied, où il figurait pour la troisième fois après la barre du haut et
les fiches du cabinet. En dernière ligne, la signature « Powered by BïdaSoft ».

⚠️ **Le contenu anglais des quatre fiches et du formulaire de demande est en
français** pour les fiches. À faire traduire.

### Le devis en PDF — ce qui était demandé n'était pas possible tel quel

Le cabinet voulait que le bouton « Recevoir ce devis par WhatsApp » **joigne un
PDF**. Un lien `wa.me` ne transporte que du texte : aucune pièce jointe, quel que
soit le soin apporté au fichier. C'est une limite du protocole, pas un manque de
travail.

La solution retenue résout le besoin mieux qu'un fichier ne l'aurait fait : le
devis a **sa propre adresse**, `/estimation/devis?…`, mise en page pour l'écran
et pour le papier. Elle s'envoie comme un lien, s'ouvre sur n'importe quel
téléphone sans lecteur à installer, et se transforme en PDF d'un geste par la
commande d'impression du navigateur — « Enregistrer au format PDF » est proposé
sur Android comme sur iOS. Aucune bibliothèque de génération embarquée : quelques
centaines de kilo-octets épargnés à chaque visiteur.

Deux propriétés qui découlent du choix et qu'un PDF n'aurait pas eues : le devis
reste **calculé** — un lien ouvert plus tard affiche des montants cohérents avec
le barème du jour, non un chiffre figé — et il est **partageable sans base de
données**, toutes les réponses voyageant dans l'adresse.

Le message WhatsApp porte le récapitulatif chiffré **puis** le lien, dans cet
ordre : un destinataire sans réseau doit pouvoir lire les montants sans ouvrir
quoi que ce soit.

Le document dit sa date et dit qu'il **n'est pas une facture**, en clair dans le
corps et non en petits caractères : un document chiffré, daté et au nom du
cabinet sera lu comme un engagement s'il ne dit pas franchement le contraire.

### L'estimateur, vérifié

Barème éprouvé sur six cas : établissement, SARL au minimum légal, SARL à
999 999 puis à 1 000 000 FCFA — le droit proportionnel ne se déclenche qu'au-delà
de la référence, le total ne bouge donc pas entre les deux —, SA à Bafoussam
(14 semaines, les deux semaines de la ville hors guichet unique sont bien
ajoutées), et un jeu de paramètres volontairement absurdes, qui retombe sur les
valeurs sûres au lieu de produire une erreur. Les sous-totaux et le total
concordent.

### ⚠️ À rappeler au cabinet

**Le paiement Taramoney n'est pas branché.** Le cabinet a demandé que les
formules d'adhésion y renvoient, en précisant de le brancher « le moment venu »
et de le lui rappeler. Les boutons mènent toujours à la page Contact. Il faudra,
avant de commencer : les identifiants marchand, la documentation de l'API, et la
décision sur le lieu du branchement — très probablement un contexte backend dédié
à l'encaissement, et non le contexte L, qui ne porte que du contenu éditorial.

---

## 12 août 2026 (suite) — Le contenu du site passe au backend

### Ce qui a été demandé

Quatre choses, dans le désordre où elles sont venues.

1. Pouvoir **revenir au site** depuis la page de connexion à l'ERP.
2. **Vérifier que le site a un backend**, et sinon l'y brancher, de façon que
   tout soit modifiable depuis le backend — le site n'étant qu'une vitrine.
3. L'annonce doit apparaître **sur toutes les pages** : en passant d'une page à
   l'autre, on doit la revoir.
4. Respecter la **Clean Architecture** déjà appliquée, bien organiser le backend,
   et **commenter le code partout** pour qu'on comprenne ce qui a été fait.

### Ce qui a été constaté, et qui change la réponse

**Le backend existe déjà, et il est propre.** `Backend_erp_cga` est un monolithe
modulaire FastAPI en Clean Architecture : onze contextes bornés, quatre cercles
par contexte, deux surfaces publiques (`contrats.py` pour les entités, `api.py`
pour les cas d'usage), et une batterie de tests qui **refusent** une dépendance
allant d'un cercle interne vers un cercle externe. La question n'était donc pas
« faut-il un backend » mais « pourquoi le contenu de la vitrine n'y est-il pas ».

Réponse : parce qu'il avait été écrit en TypeScript, dans le frontend. Une faute
de frappe dans un article demandait un développeur et un déploiement. C'est cela
qui a été corrigé.

### Ce qui a été décidé, et pourquoi

**Un douzième contexte borné : L · Vitrine publique.** Et non un dossier de
fichiers dans le frontend, ni une extension d'un contexte existant.

* *Pourquoi un contexte à lui seul.* Le contenu éditorial n'est pas une donnée
  fiscale. Le mettre dans le Référentiel aurait mélangé « le taux de TVA au
  15 juillet 2026 » et « l'article du blog sur la patente » dans le même module.
* *Pourquoi il ne lit aucun autre contexte.* Du contenu qui aurait besoin d'un
  paramètre légal ne serait plus du contenu, ce serait un calcul — et il
  appartiendrait au contexte qui le porte. Le jour où l'on voudra afficher un
  barème sur le site, la bonne réponse sera une route du Référentiel appelée par
  le site, pas une arête ajoutée au graphe. Cette contrainte est inscrite dans
  `tests/test_architecture.py`, elle n'est pas qu'une intention.
* *Pourquoi personne ne le lit non plus.* Le contenu éditorial n'a rien à dire au
  métier fiscal.

**Les quatre cercles, sans exception.** `domaine/` porte les entités et le port
`DepotContenuVitrine` ; `application/` porte le service de lecture ;
`adaptateurs/sortant/` lit le YAML ; `adaptateurs/entrant/` expose les routes.
Le service ne lit aucun fichier : il reçoit un dépôt. C'est ce qui permet de
l'éprouver sur un dépôt en mémoire, sans disque — et les tests écrits ainsi sont
la preuve que l'inversion de dépendance sert à quelque chose plutôt que d'être
une figure de style.

**Le corps d'un article est une suite de blocs typés, pas du Markdown ni du
HTML.** Trois raisons, dans cet ordre. La sécurité d'abord : un contenu qui
arrive du backend et qui serait du HTML devrait être assaini avant affichage ;
des blocs typés ne portent que du texte, il n'y a rien à injecter. Le rendu
ensuite : chaque type de bloc a son style propre. L'édition enfin : une personne
qui corrige le YAML voit la structure de l'article.

**Le YAML plutôt qu'une base, pour commencer.** Parce que la personne qui corrige
une faute, au cabinet, doit pouvoir le faire sans qu'on ait d'abord construit un
écran d'administration. Le YAML se lit, se commente, se relit en revue, et se
versionne : on sait qui a changé quoi et quand. Le port est déclaré dans le
domaine ; le jour venu, un `DepotContenuVitrineSql` le réalisera et seul
l'adaptateur changera.

**Un fichier malformé fait échouer le chargement.** Rubrique inconnue, date
incohérente, bloc sans type : le démarrage est refusé. Mieux vaut une panne
bruyante et immédiate qu'un blog amputé de trois articles que personne ne
remarque avant des semaines.

**Le site garde un contenu de secours.** `app/lib/blog.ts`, `annonces.ts` et
`partenaires.ts` restent au dépôt, mais changent de statut : ce ne sont plus la
source, c'est le **dernier état connu**. Si le backend est arrêté, en cours de
déploiement, ou joignable une seconde trop tard, la vitrine affiche ce
contenu-là plutôt que du vide — ce qui serait pire. La source est le YAML, et
c'est écrit en tête du module de lecture pour que personne ne s'y trompe.

**Deux `null` qu'il ne faut surtout pas confondre.** « Le backend répond qu'il
n'y a pas d'annonce aujourd'hui » et « le backend ne répond pas » appellent des
conduites opposées : dans le premier cas on n'affiche rien, dans le second on
affiche le secours. Les confondre ferait réapparaître toute seule une annonce que
le cabinet vient de retirer. D'où le type `Lecture<T>` et son champ `repondu`.

**L'annonce réapparaît à chaque page — et le mécanisme n'est pas celui qu'on
croit.** Le site est une application d'une seule page : en passant de l'accueil au
blog, la coquille n'est pas reconstruite et le bandeau n'est pas remonté. Sans
traitement, l'annonce disparue au bout de trente secondes ne serait plus jamais
revenue de toute la visite. La solution retenue est une **clé React portant le
chemin courant** : changer de page remonte le composant, et tout son état repart
à neuf — décompte et animation compris. Un effet de remise à zéro aurait fait la
même chose, en moins lisible, en plus fragile, et le linter le refusait à juste
titre.

La fermeture explicite, elle, ne revient pas. C'est la différence entre « je n'ai
pas eu le temps de lire » et « je ne veux pas de ça » : le décompte redémarre, le
refus est retenu pour toute la visite.

**Deux sorties vers le site public.** Depuis la page de connexion, qui est un
cul-de-sac — ni en-tête, ni pied, ni menu — et depuis la barre latérale de
l'ERP. Dans les deux cas, un libellé explicite : le logo ramenait déjà à
l'accueil, mais un logo cliquable est une convention, pas une indication.

### Ce qui a été livré

Backend — `app/contextes/vitrine/` : `domaine/entites.py`, `domaine/ports.py`,
`application/service_contenu.py`, `adaptateurs/sortant/depot_yaml.py`,
`adaptateurs/entrant/routes_http.py`, `contrats.py`, `api.py`. Contexte enregistré
dans `main.py`, dans `config.py`, dans `tests/test_architecture.py` et dans
`Docs/architecture/01-contextes-bornes.md`. Quatre routes : sommaire du blog avec
les comptes par rubrique, article avec ses voisins de lecture, annonce à une
date, institutions.

Contenu — `Contenu_vitrine/articles.yaml`, `annonces.yaml`, `institutions.yaml` :
quatorze articles, une annonce, quatre institutions, chaque fichier ouvert par un
commentaire qui explique quoi y écrire et ce qu'il ne faut pas y casser.

Frontend — `app/lib/contenu-vitrine.ts`, seul point du site qui sait où trouver le
contenu ; blog, article, ruban d'institutions et bandeau d'annonce branchés
dessus ; bouton de retour au site sur la connexion et dans la barre de l'ERP.

Documentation — en-têtes ajoutés aux six pages de la vitrine qui n'en avaient
qu'une ligne, et à `BarreLaterale.tsx`, seul fichier du frontend qui n'avait aucun
bloc de documentation.

Vérifié : **237 tests backend** (contre 202 avant ce lot), `ruff` au vert,
`tsc` et `eslint` sans un avertissement, build Next complet à 55 pages, et les
quatre routes exercées sur le backend en marche.

### Ce qui reste

- **Un écran d'administration** pour éditer le contenu sans toucher au YAML.
  Le port est prêt ; c'est l'adaptateur et l'interface qui manquent.
- **L'invalidation du cache** : une correction du YAML n'est visible qu'après
  redémarrage du backend. Assumé tant que le cabinet corrige par lots ; à traiter
  le jour où l'édition devient quotidienne. L'endroit est identifié et commenté.
- **Le reste du corpus Facebook** : une quarantaine de publications lues sur 113.

---

## 12 août 2026 — Blog, annonces de site, et la règle des bannières

### Ce qui a été demandé

Trois choses, en plus de la finition de la vitrine déjà engagée.

1. **La hauteur des bannières.** L'accueil est désormais **la seule page** qui
   garde une bannière pleine hauteur. Toutes les autres pages ont une bannière
   réduite.

2. **Un blog.** Les 113 captures rassemblées la veille dans
   `Docs/publications-facebook-blog/` servent de matière. Le blog a deux
   fonctions : renseigner les clients et leurs conseillers sur les **textes
   administratifs qui ont changé**, et porter les **annonces** du cabinet. Le
   client a insisté : il faut que les publications soient observées de près, et
   que chaque article se partage sur **Facebook ou WhatsApp** sous une forme qui
   donne envie de cliquer et d'entrer sur le site pour lire la suite. Cela
   suppose une nouvelle entrée de menu.

3. **Une annonce de site.** Un message accrocheur qui apparaît sur toutes les
   pages, que le visiteur peut **fermer**, et qui **disparaît de lui-même au
   bout de 30 secondes** pour ne pas perturber la navigation.

Demande transversale : **tout enregistrer**, échanges et réponses, pour que le
contexte ne se reperde pas d'une séance à l'autre. D'où ce journal.

### Ce qui a été décidé, et pourquoi

**Les bannières.** La règle était déjà appliquée dans le lot en cours :
`EnteteDePage` a été ramené à la moitié de la hauteur du héros d'accueil
(`50svh`, minimum 400 px, 280 px sous 900 px de large), pendant que le composant
`Heros` — plein écran, carrousel à messages, formulaire — reste réservé à
`app/[locale]/(vitrine)/page.tsx`. La demande confirme le choix et le fige :
**toute nouvelle page passe par `EnteteDePage`, jamais par `Heros`.** Le blog et
les articles s'y conforment.

**Le corpus Facebook n'est pas republiable tel quel.** C'est la décision la plus
importante de la journée, et elle va à l'encontre de l'usage le plus direct des
fichiers. En les regardant :

- ce sont des **captures de navigateur**, pas des visuels : on y voit la colonne
  de commentaires, les boutons Facebook, et l'identité de la personne connectée
  (« Commenter en tant que Loïc Tonba ») ;
- `pub-50` contient une **conversation WhatsApp privée** avec un prospect,
  floutée seulement en partie ;
- plusieurs images appartiennent à des **tiers** : dessins signés GABS, dessin
  filigrané `ledauphine.com`, personnage des Minions. Les publier sur le site du
  cabinet exposerait celui-ci à une réclamation ;
- les plus anciens visuels portent une **adresse électronique périmée**
  (`info@brconsulting-cm.com`), remplacée depuis par `contact@cga-brcgroup.com`.

Le corpus est donc traité comme une **source rédactionnelle** : les faits sont
extraits, les textes réécrits, et les illustrations prises dans les photographies
déjà présentes au dépôt. Le jour où le cabinet fournira les exports propres de
ses visuels carrés — qui sont sa création et qui sont bons — ils remplaceront les
photographies sans rien changer d'autre que le chemin d'image dans `blog.ts`.

**La ligne éditoriale est celle du cabinet, pas une invention.** En observant les
113 publications, quatre rendez-vous reviennent, et ils deviennent les rubriques
du blog :

| Rubrique du blog | Origine dans les publications |
| --- | --- |
| Le saviez-vous ? | Visuels carrés « Le saviez-vous ? », faits fiscaux et juridiques |
| Vrai ou faux ? | Publications « Vrai ou Faux ? », idées reçues passées au crible |
| Lundi comptable | « Lundi comptable avec Aïcha », modes d'emploi comptables |
| Mercredi juridique | « Mercredi juridique », cas pratiques traités par le juriste Owona |
| Le coin du fiscaliste | « Conseils de notre fiscaliste Kamdem », l'impôt expliqué |
| Annonces | Offres, packs de formalisation, vœux, informations de service |

Reprendre les rendez-vous du cabinet plutôt qu'un découpage abstrait a un
avantage direct : l'audience Facebook reconnaît les noms **et les visages** —
Aïcha, Owona, Kamdem sont des personnages installés, avec leur jour de la semaine
— et le cabinet sait déjà alimenter ces cases, puisqu'il le fait chaque semaine.

**Le partage précède la lecture.** Un article n'est pas d'abord une page, c'est
d'abord une vignette dans un fil ou dans une conversation WhatsApp. Chaque
article porte donc ses métadonnées Open Graph — titre, résumé, image, date — et
une accroche courte, écrite pour être lue seule. Les boutons de partage visent
Facebook, WhatsApp et la copie du lien : ce sont les trois canaux réels de la
clientèle camerounaise du cabinet, et WhatsApp compte au moins autant que
Facebook.

Deux réglages en découlent, contre-intuitifs mais vérifiés sur le rendu :

- **L'illustration doit être en paysage et faire au moins 1 200 px de large.**
  En dessous de 600 px, Facebook renonce à la grande carte et met une imagette
  carrée à gauche du titre — l'inverse exact de l'effet recherché. Le premier
  jet de l'article « Lundi comptable » illustrait par le portrait de la
  comptable, un carré de 480 px : il a été remplacé par une photographie de
  1 400 px. La contrainte est écrite en tête de `blog.ts`.
- **Les dimensions ne sont pas déclarées dans les métadonnées.** Annoncer
  1200 × 630 pour une photographie qui fait 1400 × 933 fait recadrer la vignette
  de travers. Facebook mesure très bien le fichier lui-même.
- **L'adresse partagée est calculée, pas lue dans le navigateur.** Elle est
  reconstruite à partir du domaine, de la langue et du chemin. Les boutons sont
  donc bons dès le rendu serveur, et le lien partagé est la version canonique,
  sans le paramètre de campagne ni l'ancre que le visiteur traîne derrière lui.
  `NEXT_PUBLIC_SITE_URL` couvre la préproduction.

**L'annonce s'efface deux fois.** Le visiteur peut la fermer, et elle part seule
au bout de 30 secondes. La fermeture est mémorisée pour la durée de la session
(`sessionStorage`) : une annonce qui revient à chaque page est exactement le
défaut qu'on cherchait à éviter. Le décompte est suspendu quand le pointeur est
sur le bandeau ou quand le clavier y entre — retirer sous les doigts d'un
visiteur le lien qu'il allait cliquer serait pire que ne rien afficher. Et un
visiteur qui a demandé `prefers-reduced-motion` n'a pas de barre de décompte
animée.

### Ce qui a été livré

- `Docs/journal-de-bord.md` — ce journal.
- `app/lib/blog.ts` — rubriques, articles, tri, voisinage, recherche par slug.
- `app/lib/annonces.ts` — l'annonce en cours, avec sa fenêtre de validité.
- `app/components/vitrine/BandeauAnnonce.tsx` — le bandeau refermable.
- `app/components/vitrine/CarteArticle.tsx` — la vignette d'article.
- `app/components/vitrine/PartageArticle.tsx` — Facebook, WhatsApp, copie du lien.
- `app/components/vitrine/FiltreRubriques.tsx` — le filtre du sommaire, fait de
  liens et non de boutons : chaque rubrique a son adresse
  (`/blog?rubrique=lundiComptable`), donc son signet, son envoi par message et
  son bouton « précédent », et le filtrage ne coûte pas une ligne de JavaScript.
- `app/lib/site.ts` — l'adresse publique du site, et `metadataBase` posée sur la
  mise en page racine : sans elle, toute image d'aperçu déclarée par un chemin
  relatif est ignorée et le lien part nu.
- `app/[locale]/(vitrine)/blog/page.tsx` — le sommaire.
- `app/[locale]/(vitrine)/blog/[slug]/page.tsx` — l'article.
- Entrée « Blog » dans la barre de navigation, dans le menu du téléphone et dans
  le pied de page ; libellés fr et en. Elle est placée après « Le CGA » et avant
  « Estimation » : le blog relève de ce que le cabinet dit de lui-même, et le
  reléguer en fin de barre l'aurait rendu invisible, alors que c'est par lui que
  le trafic de Facebook et de WhatsApp entrera.
- Le repère de menu suit désormais la **section** et non la seule page :
  `/blog/mon-article` marque « Blog » comme courant. L'égalité stricte laissait
  la barre muette dès qu'on ouvrait un article.
- Styles dans `app/styles/vitrine.css`.

Vérifié : `npm run lint` sans avertissement, `npm run build` complet, 47 pages
générées dont les vingt pages d'articles (dix articles × deux langues), et le
rendu contrôlé page par page sur le serveur de développement — sommaire, filtre
par rubrique, article, version anglaise, et métadonnées Open Graph.

### Deuxième passe du même jour — dépouillement poursuivi

Le dépouillement a repris après la première livraison. Environ quarante des 113
publications ont maintenant été lues, réparties sur toute la période 2018-2026.
Quatre articles s'y sont ajoutés, et un a été enrichi :

- **« Pas encore de clients, donc pas d'obligations fiscales » — vrai ou faux ?**
  (pub-19). L'obligation ne naît pas de la recette mais de l'immatriculation : la
  déclaration néant est due, et la pénalité frappe le silence, pas le montant.
  C'est la publication qui a fait apparaître la rubrique « Vrai ou faux ? ».
- **À qui s'applique réellement l'IGS** (pub-22), qui a fait apparaître « Le coin
  du fiscaliste ». Point central retenu : l'IGS ne dépend pas toujours du
  bénéfice réalisé, mais de l'existence et de l'activité de l'entreprise.
- **Les huit obligations comptables de début d'année** (pub-38 et pub-25), la
  liste d'Aïcha, de la mise à jour de l'exercice écoulé à l'anticipation de la
  DSF.
- **Dossier propre, décision rapide** (pub-58), sur ce qu'une banque lit
  réellement dans un dossier de financement.
- **Adhérer au CGA** enrichi (pub-55 et pub-72) de deux choses qui manquaient et
  qui sont le vrai argument du centre agréé : l'assistance permanente d'un
  inspecteur des impôts et l'accès aux formations du centre, puis la liste des
  prestations souscriptibles à la carte.

Deux prudences de rédaction sur cette passe :

- La publication sur la **DSF 2026** annonce « jusqu'à quand payer sans
  pénalités » mais ne donne pas les dates dans la partie visible de la capture.
  Aucune échéance n'a donc été inventée : l'article dit que le délai dépend du
  régime et invite à le faire vérifier. Les dates viendront du cabinet.
- Plusieurs publications sont **inutilisables** et resteront hors du blog : les
  dessins de presse filigranés `ledauphine.com`, les dessins signés GABS, les
  images de Minions, et la citation d'Aliko Dangote illustrée par une
  photographie de tiers.

### Ce qui reste

- **Dépouiller le reste du corpus.** Une quarantaine de publications ont été
  lues ; les soixante-dix autres contiennent d'autres faits utiles. Ajouter un
  article revient à ajouter un objet dans `ARTICLES`.
- **Récupérer les dates d'échéance de la DSF** auprès du cabinet, par régime
  d'imposition, pour compléter l'article de début d'année.
- **Obtenir les visuels propres.** Demander au cabinet les fichiers d'origine de
  ses carrés « Le saviez-vous ? » et de ses affiches d'offre, sans le chrome
  Facebook et avec l'adresse électronique à jour.
- **Vérifier les faits fiscaux avec le cabinet.** Les articles citent des règles
  tirées de publications de 2017 et 2018. Le droit a pu bouger : chaque article
  porte la date de la publication d'origine, et le cabinet doit confirmer ce qui
  est encore en vigueur avant mise en ligne.
- **Traduction anglaise du corps des articles.** Les libellés d'interface sont
  bilingues ; le corps des articles est pour l'instant en français dans les deux
  langues, ce qui est le comportement voulu tant que le cabinet n'a pas fait
  traduire.

---

## 11 août 2026 — Finition de la vitrine

Passe de finition menée avant la demande du blog, encore non commitée à
l'ouverture du 12 août.

- **Ruban des institutions.** DGI, CNPS, ONECCA, OHADA, en bande défilante sur
  l'accueil. Choix assumé et consigné dans `app/lib/partenaires.ts` : ce ne sont
  **pas des partenaires commerciaux**, et le libellé de la section le dit. Afficher
  le logo d'une entreprise privée sous le mot « partenaire » affirmerait une
  relation contractuelle ; ces quatre institutions-là sont le cadre dans lequel
  un centre de gestion agréé travaille par nature, et le dire est vérifiable.
- **Connexion de démonstration.** Le formulaire de `/connexion` compare deux
  constantes **dans le navigateur**. Ce n'est pas une authentification, le fichier
  le dit en tête et la page le dit au visiteur. La vraie authentification
  appartient au backend FastAPI ; aucune donnée client réelle ne doit passer
  derrière cet écran avant.
- **Bannières des pages intérieures** ramenées à la moitié de la hauteur, avec
  fondu entre deux photographies quand la page en fournit deux.
- **Étapes de progression** rendues génériques : le composant reçoit désormais ses
  étapes, ce qui a permis de le réemployer pour le parcours d'adhésion en quatre
  temps.
- **Estimateur** — correction d'un défaut qui rendait le champ « capital »
  insaisissable : il réaffichait `Math.max(capital, capitalMin)`, si bien
  qu'effacer un chiffre réécrivait le minimum légal à chaque touche. La valeur
  saisie est maintenant conservée comme texte, et le bornage a lieu au calcul.
- **Corrections de fond** : la SA a bien une ligne au barème (le contraire avait
  été supposé à tort) ; « Le cabinet » devient « Le CGA » au menu et au pied ; le
  second mobile `+237 676 887 686` entre dans la barre utilitaire, les deux
  mobiles avant le fixe, parce qu'au Cameroun on appelle et on écrit depuis un
  mobile et que le fixe sert de repli.
