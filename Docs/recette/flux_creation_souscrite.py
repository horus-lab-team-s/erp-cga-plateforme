"""Le flux M→I · Une création d'entreprise SOUSCRITE, de bout en bout.

─────────────────────────────────────────────────────────────────────────────────
⚠️ POURQUOI CE FLUX EXISTE, ALORS QUE DEUX AUTRES COUVRENT DÉJÀ M ET I.

`flux_souscription.py` part d'un prospect qui souscrit une ADHÉSION : il entre
sans compte, il en sort adhérent. `flux_creation.py` part d'un dossier de
création **déjà ouvert par un collaborateur**, et le mène jusqu'au portefeuille.

Entre les deux, il manquait le cas que le site vend en première page : quelqu'un
qui n'a pas encore d'entreprise, qui lit « votre SARL immatriculée, statuts et
attestations compris », et qui veut l'acheter. Ce parcours-là traverse les deux
contextes, et **aucun des deux flux ne le jouait**.

Il compte trois particularités que ni M ni I ne rencontrent :

  · La création est une prestation SUR ÉTUDE. Le catalogue le dit et le serveur
    le tient : un devis de création sort sans montant, et le prospect **ne peut
    pas le régler lui-même**. Le prix passe par un examen humain.
  · Le prix affiché sur le site est ÉDITORIAL — une annonce datée, pas un
    tarif du référentiel. Ce flux vérifie donc ce que le serveur répond, pas ce
    que la page promet, et le rapprochement des deux est dit en fin de bilan.
  · Le règlement ouvre un ESPACE. Ce flux pose ensuite la question qui décide de
    tout : le dossier de formalité est-il ouvert, ou le client a-t-il payé une
    création que personne n'a commencée ?

Adresses réglables : `CGA_API_RECETTE`, `CGA_FRONT_RECETTE`.
─────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
import re
import uuid
from urllib.parse import quote
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verifier_profils import Client, champs_caches  # noqa: E402

API = os.environ.get("CGA_API_RECETTE", "http://127.0.0.1:8010")
FRONT = os.environ.get("CGA_FRONT_RECETTE", "http://localhost:3011")
JOUR = os.environ.get("CGA_JOUR_RECETTE", date.today().isoformat())
MOT_DE_PASSE = "cabinet brcg douala 2026"

#: Qui fait quoi. ⚠️ Des comptes DISTINCTS, et c'est volontaire : un parcours
#: joué sous un seul compte omnipotent ne prouve pas que les permissions
#: tiennent, et c'est dans ce parcours-là qu'elles comptent le plus — on y
#: encaisse de l'argent.
#: Les permissions relevées sur les routes, et qui les porte :
#:
#:   LIRE_PROSPECT       lire la file, les questionnaires, l'état d'un dossier
#:   AFFECTER_DOSSIER    désigner un responsable
#:   QUALIFIER_PROSPECT  qualifier, chiffrer, émettre et transmettre la proforma
#:   GERER_COMPTES       demander le règlement, confirmer l'encaissement
#:
#: ⚠️ QUATRE PERMISSIONS POUR UN SEUL PARCOURS, ET C'EST LE PROPOS.
#: Le tunnel commercial passe par trois mains différentes entre la demande et
#: l'encaissement. Joué sous un compte unique, il ne prouverait rien : c'est
#: précisément le parcours où l'on encaisse de l'argent.
DIRECTION = "b.mballa@cga-brcg.cm"
ADMIN = "s.onana@cga-brcg.cm"
CHARGE = "p.moukouri@cga-brcg.cm"
COMPTABLE = "l.fotso@cga-brcg.cm"


def session(adresse: str) -> Client:
    client = Client()
    _, page, _ = client.lire("/connexion")
    champs = champs_caches(page)
    champs["courriel"] = adresse
    champs["motDePasse"] = MOT_DE_PASSE
    client.soumettre("/connexion", champs)
    return client


def appeler(client: Client | None, methode: str, chemin: str, corps=None):
    donnees = json.dumps(corps).encode() if corps is not None else None
    entetes = {"Accept": "application/json"}
    if corps is not None:
        entetes["Content-Type"] = "application/json"
    if client is not None and client.temoins:
        entetes["Cookie"] = "; ".join(f"{c}={v}" for c, v in client.temoins.items())
    requete = urllib.request.Request(API + chemin, data=donnees, headers=entetes, method=methode)
    try:
        with urllib.request.urlopen(requete, timeout=30) as reponse:
            brut = reponse.read().decode()
            return reponse.status, (json.loads(brut) if brut else None)
    except urllib.error.HTTPError as erreur:
        brut = erreur.read().decode()
        try:
            return erreur.code, json.loads(brut)
        except json.JSONDecodeError:
            return erreur.code, brut[:250]


#: Le collecteur de courrier de la pile de démonstration — Mailpit.
#:
#: ⚠️ RELIRE LE MESSAGE, ET NON CROIRE LA RÉPONSE. La route rend « ENVOYE » dès
#: que le service de notification n'a pas levé. Entre ce constat et un message
#: réellement posé dans une boîte, il y a un serveur SMTP, un gabarit, une
#: adresse et un encodage — c'est-à-dire quatre façons de ne rien recevoir tout
#: en ayant l'air d'avoir envoyé.
COURRIER = os.environ.get("CGA_COURRIER_RECETTE", "http://localhost:8026")


def _courriel_pour(adresse: str) -> dict | None:
    """Le dernier message adressé à quelqu'un, tel que le collecteur le détient."""
    try:
        with urllib.request.urlopen(f"{COURRIER}/api/v1/messages?limit=60", timeout=15) as r:
            boite = json.loads(r.read().decode())
    except (urllib.error.URLError, OSError):
        return None
    for message in boite.get("messages", []):
        destinataires = [d.get("Address", "") for d in (message.get("To") or [])]
        if adresse in destinataires:
            # Le corps n'est pas dans la liste : il se lit par l'identifiant.
            try:
                with urllib.request.urlopen(
                    f"{COURRIER}/api/v1/message/{message['ID']}", timeout=15
                ) as r:
                    return json.loads(r.read().decode())
            except (urllib.error.URLError, OSError):
                return message
    return None


def _lien_dans(message: dict) -> str | None:
    """Le lien d'acceptation écrit dans le corps du message."""
    corps = f"{message.get('Text', '')} {message.get('HTML', '')}"
    trouve = re.search(r"https?://[^\s\"'<>]*proforma[^\s\"'<>]*", corps)
    return trouve.group(0) if trouve else None


ECHECS: list[str] = []


def etape(n, libelle, code, attendus, detail="") -> bool:
    ok = code in attendus
    print(f"  {'✓' if ok else '✗'} {n:>2}. {libelle:<52} HTTP {code:<4} {detail}")
    if not ok:
        ECHECS.append(f"{n}. {libelle} → HTTP {code} {detail}")
    return ok


def main() -> int:
    marque = uuid.uuid4().hex[:8]
    nom = f"Sylvie MBIDA {marque[:4].upper()}"
    courriel = f"sylvie.mbida+{marque}@exemple.cm"
    slug = f"couture-{marque[:6]}"
    # ⚠️ UN NUMÉRO NEUF À CHAQUE EXÉCUTION, ET C'EST LE PRODUIT QUI L'EXIGE.
    #
    # Deux demandes portant le MÊME téléphone sont rattachées au même dossier
    # commercial — comportement juste : c'est le même prospect qui relance, pas
    # un second client. Rejoué avec un numéro fixe, ce flux se greffait donc sur
    # le dossier de la veille, déjà chiffré, déjà payé, et se lisait comme une
    # régression alors que le produit avait raison.
    # Neuf chiffres commençant par 6 : le format qu'exige le serveur, et qu'il
    # explique en toutes lettres quand on se trompe.
    telephone = f"6{int(marque, 16) % 100_000_000:08d}"

    print("═" * 104)
    print("FLUX M→I · UNE CRÉATION D'ENTREPRISE SOUSCRITE — DU VISITEUR À L'IMMATRICULATION")
    print("═" * 104)
    print(f"  prospect {nom} · {courriel} · {telephone} · espace « {slug} »")
    print("─" * 104)

    # ══ Le visiteur ═══════════════════════════════════════════════════════════
    #
    # 1 · Le catalogue public annonce-t-il la création, et à quel prix ?
    code, services = appeler(None, "GET", f"/souscription/services?a_la_date={JOUR}")
    creation = None
    if isinstance(services, list):
        creation = next((s for s in services if s["code"] == "CREATION"), None)
    tarif = (creation or {}).get("tarifs")
    etape(1, "La création figure au catalogue public", code, (200,),
          f"nature {(creation or {}).get('nature', '—')}")

    # 2 · Il dépose sa demande depuis le site, sans compte.
    code, accuse = appeler(None, "POST", "/acquisition/demandes", {
        "nom": nom,
        "telephone": telephone,
        "courriel": courriel,
        "service_souhaite": "CREATION",
        "message": "Je veux créer ma SARL de couture à Douala.",
        "canal_prefere": "APPEL",
        "origine": "vitrine/offre-sarl",
    })
    etape(2, "Demande déposée depuis le site, sans compte", code, (200, 201),
          (accuse or {}).get("message", "")[:44])

    # ══ Le cabinet ════════════════════════════════════════════════════════════
    #
    # 3 · Le dossier arrive-t-il dans la file du cabinet ?
    charge = session(CHARGE)
    direction = session(DIRECTION)
    code, dossiers = appeler(charge, "GET", "/acquisition/dossiers")
    # ⚠️ Retrouvé par son TÉLÉPHONE, et non par son nom : c'est le téléphone qui
    # identifie un prospect dans ce contexte — deux demandes du même numéro ne
    # font qu'un dossier, et le nom rendu est celui de la PREMIÈRE demande.
    attendu = telephone.lstrip("0")
    mien = None
    if isinstance(dossiers, list):
        mien = next(
            (d for d in dossiers if attendu in (d.get("telephone") or "")), None
        )
    if not etape(3, "Le dossier arrive dans la file du cabinet", code, (200,),
                 f"référence {(mien or {}).get('reference', 'INTROUVABLE')}"):
        return bilan()
    if mien is None:
        ECHECS.append("le dossier déposé n'apparaît pas dans /acquisition/dossiers")
        return bilan()
    dossier = mien["reference"]

    # 4 · ⚠️ CE QU'ELLE REÇOIT, ELLE, DANS LA MINUTE. Le reste de ce flux se
    #     passe chez le cabinet ; ce pas-ci est le seul des quinze premiers qui
    #     regarde SA boîte. Avant le pas 134, elle n'y trouvait rien : sa
    #     proposition n'arrive qu'après l'échange avec l'expert, des jours plus
    #     tard, et entre les deux elle n'avait aucune trace de son geste.
    #
    #     ⚠️ On ATTEND le relais, on ne le suppose pas : il publie à sa cadence,
    #     et lire la boîte trop tôt ferait échouer un flux qui marche.
    # ⚠️ ON RECONNAÎT L'ACCUSÉ À LA RÉFÉRENCE, PAS À SA FORMULE.
    #
    # Ce pas cherchait « bien reçu » dans l'objet. Le 30 septembre, le cabinet a
    # proscrit le tiret cadratin de tous les messages ; l'objet est devenu
    # « Votre demande dos-… nous est bien parvenue », et le flux a déclaré qu'AUCUN
    # courriel n'était arrivé — alors qu'il était là.
    #
    # Une formulation se reprend, une référence non : c'est elle qui identifie le
    # message, et c'est aussi la seule chose que la cliente citera au téléphone.
    accuse = None
    for _ in range(12):
        recu = _courriel_pour(courriel)
        if recu and dossier in f"{recu.get('Subject', '')} {recu.get('Text', '')}":
            accuse = recu
            break
        time.sleep(2)
    porte_la_reference = bool(accuse) and dossier in (
        f"{accuse.get('Subject', '')} {accuse.get('Text', '')}"
    )
    etape(4, "Elle reçoit l'accusé de sa demande", 200 if porte_la_reference else 0,
          (200,), f"« {(accuse or {}).get('Subject', 'AUCUN COURRIEL')} »")
    if not porte_la_reference:
        ECHECS.append(
            "l'accusé de dépôt n'est pas arrivé, ou ne porte pas la référence "
            "du dossier — elle n'a rien à citer au téléphone"
        )

    # 4 · ⚠️ LE CONTRE-TEST. Un comptable n'a rien à faire dans l'acquisition.
    #     Sans lui, ce flux prouverait que le parcours marche, pas qu'il est
    #     fermé — et c'est un parcours où l'on encaisse de l'argent.
    code, _ = appeler(session(COMPTABLE), "POST",
                      f"/acquisition/dossiers/{dossier}/chiffrage",
                      {"score_charge": 1, "debours": []})
    etape(5, "Un comptable est refusé sur le chiffrage", code, (403,))

    # ══ LE POINT DE RUPTURE, NOMMÉ PLUTÔT QUE SUBI ═══════════════════════════
    #
    # ⚠️ TROIS VOCABULAIRES POUR UNE MÊME PRESTATION.
    #
    #   · le formulaire de la vitrine transmet   « creation »
    #   · le catalogue public publie             « CREATION »
    #   · le référentiel de qualification connaît « creation-sarl »
    #
    # Le README du référentiel énonce pourtant la règle : « le nom du fichier
    # est la clé du service au catalogue ». Les données l'ont perdue de vue.
    #
    # Conséquence, vérifiée ici même : un dossier né du VRAI formulaire ne peut
    # être ni qualifié, ni chiffré, ni transformé en proforma. Le tunnel
    # commercial est mort à l'arrivée pour tout le trafic public.
    #
    # Ce flux le CONSTATE et le nomme, au lieu de s'arrêter sur un code HTTP :
    # un parcours de recette doit expliquer ce qu'il a trouvé à celui qui le
    # lira demain.
    code, _ = appeler(charge, "GET", "/acquisition/questionnaires/CREATION")
    catalogue_qualifiable = code == 200
    code2, _ = appeler(charge, "GET", "/acquisition/questionnaires/creation")
    site_qualifiable = code2 == 200
    if not (catalogue_qualifiable or site_qualifiable):
        print()
        print("  ╭─ ÉCART DE VOCABULAIRE ───────────────────────────────────────────────╮")
        print("  │ Le formulaire du site transmet « creation ».                         │")
        print("  │ Le catalogue public publie     « CREATION ».                         │")
        print("  │ Le référentiel qualifie        « creation-sarl ».                    │")
        print("  │                                                                      │")
        print("  │ Aucun dossier né du formulaire public ne peut donc être qualifié,    │")
        print("  │ ni chiffré, ni transformé en proforma.                               │")
        print("  ╰──────────────────────────────────────────────────────────────────────╯")
        print()
        ECHECS.append(
            "vocabulaire : le site envoie « creation », le référentiel attend "
            "« creation-sarl » — le tunnel commercial public est sans issue"
        )

    # 5 · Un responsable prend le dossier.
    code, _ = appeler(direction, "POST", f"/acquisition/dossiers/{dossier}/affectation", {})
    etape(6, "Un responsable est désigné", code, (200, 201, 409))

    # 6 · Le questionnaire de la création, tel que le cabinet le pose.
    code, questionnaire = appeler(charge, "GET", "/acquisition/questionnaires/CREATION")
    questions = (questionnaire or {}).get("questions") or []
    etape(7, "Le questionnaire de création est publié", code, (200,),
          f"{len(questions)} questions")

    # 7 · La qualification, avec de vraies réponses.
    reponses = [
        {"code": q["code"], "valeur": _valeur_pour(q)}
        for q in questions
        if q.get("code")
    ]
    code, qualif = appeler(direction, "POST", f"/acquisition/dossiers/{dossier}/qualification",
                           {"reponses": reponses, "note": "SARL, deux associés, Douala."})
    etape(8, "La qualification est enregistrée", code, (200, 201),
          f"complète : {(qualif or {}).get('complete', '—')}")

    # 8 · Le chiffrage. ⚠️ C'est ici que le prix apparaît, et nulle part avant :
    #     la création est SUR ÉTUDE, et le serveur refuse de la tarifer seul.
    # ⚠️ LE CHARGÉ DE CLIENTÈLE CHIFFRE, LA DIRECTION ÉMETTRA.
    #
    # Ce n'est pas un détail d'affectation : `chiffre_par != valide_par` est ce
    # que le contrôle interne lit pour dire si la **séparation des tâches** est
    # respectée. Chiffrer et émettre sous le même compte la déclare violée — et
    # c'est ce que mon flux faisait jusqu'ici, sans le voir.
    #
    # ⚠️ LES DÉBOURS SONT LES FRAIS QUE LE CABINET AVANCE pour le compte du
    # client : greffe, publication légale. Ils ne sont pas des honoraires, ils
    # s'ajoutent au total et figurent à part sur la proposition — les fondre
    # dans le prix ferait passer une avance pour une marge.
    code, chiffrage = appeler(charge, "POST", f"/acquisition/dossiers/{dossier}/chiffrage",
                              {"score_charge": 2, "debours": [
                                  {"code": "GREFFE", "libelle": "Frais de greffe RCCM",
                                   "montant": "41500",
                                   "fondement": "Tarif du greffe du TPI de Douala"},
                                  {"code": "ANNONCE", "libelle": "Publication légale",
                                   "montant": "15000",
                                   "fondement": "Journal d'annonces légales"},
                              ]})
    # ⚠️ 404 est ACCEPTÉ ici, et 500 ne l'est pas. Tant que l'écart de
    # vocabulaire n'est pas tranché, le chiffrage ne peut pas aboutir — mais il
    # doit NOMMER ce qu'il ne connaît pas, jamais tomber. C'est la différence
    # entre un produit qui attend une décision et un produit cassé.
    etape(9, "Le chiffrage aboutit, ou nomme ce qui manque", code, (200, 201, 404, 409),
          f"référence {(chiffrage or {}).get('reference', '—')} · "
          f"intervalle {(chiffrage or {}).get('plancher', '—')}–{(chiffrage or {}).get('plafond', '—')} · "
          f"débours {(chiffrage or {}).get('total_des_debours', '—')}")
    if code == 200 and (chiffrage or {}).get("total_des_debours") in (None, "0"):
        ECHECS.append("les débours déclarés ne ressortent pas du chiffrage")

    # 8 bis · ⚠️ L'EXPERT SORT DE L'INTERVALLE, ET DOIT S'EN EXPLIQUER.
    #
    # Le barème propose une référence et des bornes. Le responsable peut vendre
    # en dessous — un geste commercial — mais alors le cabinet doit savoir
    # pourquoi : un rabais sans motif est un rabais que personne ne relit.
    sous_le_plancher = str(int((chiffrage or {}).get("plancher") or 200000) - 1)
    code, refus = appeler(direction, "POST", f"/acquisition/dossiers/{dossier}/proforma",
                          {"montant": sous_le_plancher, "score_charge": 2, "debours": []})
    etape(10, "Un prix hors intervalle sans motif est refusé", code, (409, 422),
          (refus or {}).get("detail", "")[:58] if isinstance(refus, dict) else "")
    # ⚠️ LE GARDE HÉRITÉ A DÛ ÊTRE DÉPLACÉ. Il lisait `code` après le chiffrage,
    # pour s'arrêter quand celui-ci n'aboutissait pas. Depuis qu'une étape
    # REFUSÉE À DESSEIN le précède, ce même `code` vaut 422, et le flux
    # s'arrêtait en se déclarant complet — le pire des deux mondes : vert, et
    # muet sur dix-neuf étapes jamais jouées.
    if not chiffrage or "reference" not in (chiffrage or {}):
        ECHECS.append("le chiffrage n'a pas abouti : la suite ne peut pas être jouée")
        return bilan()

    # ══ La proforma, et le client qui l'accepte ══════════════════════════════
    #
    # 9 · ⚠️ LE CABINET ÉMET LA PROFORMA **ET L'ENVOIE**, EN UN SEUL GESTE.
    #
    # C'est le chemin réel du produit, et il n'était pas joué. La console
    # affichait autrefois le lien une fois, et le responsable devait le recopier
    # dans un courriel à la main puis cocher « j'ai envoyé » : un lien mal
    # recopié menait le client à une page d'erreur, une case oubliée et personne
    # ne le relançait.
    #
    # ⚠️ Le serveur écrit lui-même le lien dans le courriel : il ne passe ni par
    # l'écran du responsable, ni par un copier-coller.
    montant = sous_le_plancher
    code, proforma = appeler(direction, "POST", f"/acquisition/dossiers/{dossier}/proforma",
                             {"montant": montant, "score_charge": 2,
                              "debours": [
                                  {"code": "GREFFE", "libelle": "Frais de greffe RCCM",
                                   "montant": "41500",
                                   "fondement": "Tarif du greffe du TPI de Douala"},
                                  {"code": "ANNONCE", "libelle": "Publication légale",
                                   "montant": "15000",
                                   "fondement": "Journal d'annonces légales"},
                              ],
                              "motif": "Première société de la cliente, geste commercial "
                                       "accordé par la direction.",
                              "envoyer_par_courriel": True})
    numero = (proforma or {}).get("numero")
    if not etape(11, "La proforma est émise ET envoyée au client", code, (200, 201),
                 f"{numero} · courriel {(proforma or {}).get('courriel', '—')} "
                 f"→ {(proforma or {}).get('courriel_masque', '—')}"):
        return bilan()

    # 10 · ⚠️ UN COURRIEL PARTI VAUT TRANSMISSION, et c'est elle qui arme la
    #      relance. Sans cela, le client a sa proposition et personne ne le
    #      relance jamais.
    # ─────────────────────────────────────────────────────────────────────────
    # ⚠️ LA SÉPARATION DES TÂCHES N'EST PAS ENCORE POSSIBLE, ET LE PRODUIT LE DIT.
    #
    # `separation_respectee` vaut `chiffre_par != valide_par`. Or les deux sont
    # renseignés au MÊME instant, par le MÊME compte : celui qui émet. Le geste
    # de chiffrage, lui, ne persiste rien — c'est une simulation qui rend un
    # intervalle.
    #
    # Ce n'est pas un oubli : le code le déclare en toutes lettres — « aucun
    # geste distinct de validation n'existe encore ; le contrôle interne le
    # verra, au lieu de lire une validation déclarée ». Le produit préfère
    # afficher « non respectée » plutôt que de simuler un contrôle que personne
    # n'a fait, et ce choix-là est le bon.
    #
    # ⚠️ Ce cas CONSTATE donc l'état réel, et ne le reproche pas. Il deviendra
    # un vrai contrôle le jour où la validation aura sa propre route. En
    # attendant, il empêche qu'on croie le contraire — notamment parce qu'un
    # prix SOUS LE PLANCHER vient d'être accordé, à l'étape précédente, sans
    # qu'aucun second regard ne se soit posé dessus.
    # ─────────────────────────────────────────────────────────────────────────
    separee = bool((proforma or {}).get("separation_respectee"))
    etape(12, "La séparation des tâches est dite telle qu'elle est", 200, (200,),
          f"chiffré par {(proforma or {}).get('chiffre_par', '—')}, "
          f"validé par {(proforma or {}).get('valide_par', '—')} → "
          f"{'respectée' if separee else 'NON respectée, et annoncée comme telle'}")
    envoye = (proforma or {}).get("courriel") == "ENVOYE"
    etape(13, "Le courriel parti vaut transmission", 200 if envoye else 0, (200,),
          f"état {(proforma or {}).get('etat', '—')} · "
          f"transmise le {str((proforma or {}).get('transmise_le'))[:19] or 'JAMAIS'}")
    if (proforma or {}).get("etat") != "TRANSMISE":
        ECHECS.append("le courriel est parti mais la proforma n'est pas transmise : "
                      "la relance ne partira jamais")

    # 10 bis · Le message est-il VRAIMENT dans la boîte du client ?
    message = _courriel_pour(courriel)
    etape(14, "Le message est dans la boîte du client", 200 if message else 0, (200,),
          f"« {(message or {}).get('Subject', '—')} »")
    lien_du_courriel = _lien_dans(message) if message else None
    etape(15, "Le courriel porte le lien de la proforma", 200 if lien_du_courriel else 0,
          (200,), (lien_du_courriel or "AUCUN LIEN")[:56])

    # 12 bis · ⚠️ ON OUVRE LE LIEN DU COURRIEL, et non celui de la réponse.
    #
    # C'est le seul chemin que la cliente emprunte réellement. Le sceau rendu à
    # l'émission prouve que le serveur sait en fabriquer un ; le lien du message
    # prouve que celui qu'elle a reçu ouvre bien SA proposition. Entre les deux
    # il y a un gabarit, un encodage et une adresse de site — trois façons
    # d'envoyer un lien mort sans s'en apercevoir.
    code_page = 0
    if lien_du_courriel:
        try:
            with urllib.request.urlopen(lien_du_courriel, timeout=20) as reponse:
                page = reponse.read().decode()
                code_page = reponse.status
        except urllib.error.HTTPError as echec:
            code_page, page = echec.code, echec.read().decode()
        except (urllib.error.URLError, OSError):
            code_page, page = 0, ""
        # ⚠️ Le montant est comparé à CELUI QUI A ÉTÉ ARRÊTÉ, et non à une
        # valeur écrite ici : le prix change d'une exécution à l'autre dès que
        # le barème bouge, et un nombre codé en dur ferait passer ce cas au vert
        # sur la mauvaise page. Les espaces fines de la mise en forme sont
        # retirées avant la comparaison.
        propre = (page.replace("\u202f", "").replace("&#x202f;", "")
                      .replace("&nbsp;", "").replace(" ", ""))
        montre = str(montant) in propre
    else:
        montre = False
    etape(16, "Le lien du courriel ouvre sa proposition", code_page, (200,),
          "le montant y figure" if montre else "⚠ la page ne montre pas le montant")
    if code_page == 200 and not montre:
        ECHECS.append("la page ouverte par le lien du courriel n'affiche pas le montant")

    # 11 · ⚠️ LE CLIENT LA LIT SANS COMPTE, par son lien signé. C'est le seul
    #      endroit du produit où quelqu'un d'extérieur au cabinet lit une pièce
    #      commerciale : le sceau et l'expiration tiennent lieu de session.
    #
    #      ⚠️ `lien_acceptation` NE CONTIENT PAS UN LIEN, mais le sceau seul.
    #      Le nom trompe : on croit tenir une adresse à ouvrir, on tient une
    #      signature à recomposer. Relevé le 27 septembre, à signaler.
    #
    #      ⚠️ `expire_le` est repris TEL QUEL. Le sceau signe cette date à la
    #      microseconde ; la recopier tronquée invalide la signature, et c'est
    #      la preuve qu'elle sert à quelque chose.
    # ⚠️ LE SCEAU VIENT DE L'ÉMISSION, PAS DE LA TRANSMISSION.
    #
    # La transmission ne fait que dater l'envoi — elle rend la proforma sans
    # sceau ni expiration. Piège relevé le 27 septembre : on cherche
    # naturellement le lien là où l'on marque « transmis au client ».
    sceau = (proforma or {}).get("lien_acceptation") or ""
    expire = (proforma or {}).get("expire_le") or ""
    version = (proforma or {}).get("version") or 1
    code, vue = appeler(
        None,
        "GET",
        f"/acquisition/proformas/{numero}/consultation"
        f"?sceau={sceau}&expire_le={quote(str(expire))}&version={version}",
    )
    etape(17, "Le client lit sa proforma, sans compte", code, (200,),
          f"{(vue or {}).get('montant', '—')} FCFA")

    # 12 · Il l'accepte.
    code, acceptee = appeler(None, "POST", f"/acquisition/proformas/{numero}/acceptation", {
        "sceau": sceau, "expire_le": expire, "version": version,
        "identite_declaree": nom,
    })
    if not etape(18, "Le client accepte sa proforma", code, (200, 201)):
        return bilan()

    # ══ Le règlement ═════════════════════════════════════════════════════════
    admin = session(ADMIN)
    code, _ = appeler(admin, "POST", f"/acquisition/proformas/{numero}/reglement",
                      {"slug": slug, "telephone": telephone})
    # ⚠️ 202 EST LA BONNE RÉPONSE, et non 200 : le cabinet demande un débit au
    # prestataire de paiement mobile, il ne le constate pas. Le client doit
    # encore taper son code sur son téléphone. Répondre 200 laisserait croire
    # que l'argent est arrivé.
    etape(19, "Le règlement est demandé au client", code, (200, 201, 202))

    code, encaisse = appeler(admin, "POST", f"/acquisition/proformas/{numero}/encaissement",
                             {"slug": slug, "reference_externe": f"TARA-{marque}"})
    if not etape(20, "L'encaissement est confirmé", code, (200, 201),
                 json.dumps(encaisse, ensure_ascii=False)[:50] if encaisse else ""):
        return bilan()

    # ══ CE QUE L'ARGENT A RÉELLEMENT DÉCLENCHÉ ═══════════════════════════════
    #
    # ⚠️ LES DEUX QUESTIONS QUI DÉCIDENT DE TOUT, ET QU'AUCUN AUTRE FLUX NE POSE.
    # ══ CE QUE L'ARGENT A RÉELLEMENT DÉCLENCHÉ ═══════════════════════════════
    #
    # ⚠️ AUCUN LOCATAIRE, ET C'EST LA BONNE RÉPONSE DEPUIS LE 28 SEPTEMBRE.
    #
    # Ce flux vérifiait ici que « l'espace du client s'ouvre et s'utilise ».
    # C'était le comportement, et il était faux : une entrepreneuse qui achète
    # la création de sa SARL recevait son propre espace de plateforme, isolé,
    # pendant que son entreprise entrait au portefeuille du cabinet.
    #
    # Elle est une **adhérente**. Son accès s'ouvrira plus bas, à
    # l'immatriculation, sur le dossier de SON entreprise.
    code, ouverture = appeler(charge, "GET", f"/acquisition/dossiers/{dossier}/ouverture")
    aucun = not (ouverture or {}).get("demarree")
    etape(21, "Aucun locataire n'est ouvert : c'est une adhérente",
          200 if aucun else 0, (200,),
          "démarrée : non" if aucun else "⚠ une saga d'ouverture a démarré")
    if not aucun:
        ECHECS.append("une prestation vendue a ouvert un locataire")

    formalite = f"CRE-{dossier}"
    code, fiche = 0, None
    for _ in range(12):
        code, fiche = appeler(charge, "GET", f"/creations/{formalite}")
        if code == 200:
            break
        time.sleep(5)
    # ⚠️ La fiche enveloppe le dossier : `{"dossier": {...}}`.
    ouvert = ((fiche or {}).get("dossier") or {})
    etape(22, "Le dossier de formalité s'ouvre tout seul", code, (200,),
          f"« {ouvert.get('denomination_souhaitee', '—')} » · étape "
          f"{ouvert.get('etape', '—')} · {len(ouvert.get('pieces') or [])} pièces")

    # 17 · ⚠️ ET LES FAITS SONT BIEN LÀ, et non des cases vides. Un dossier
    # ouvert sans sa dénomination ni son siège obligerait à tout redemander au
    # client qui vient de payer.
    attendus = {
        "denomination_souhaitee": REPONSES_TENUES["denomination_souhaitee"],
        "forme_juridique": REPONSES_TENUES["forme_juridique"],
        "activite": REPONSES_TENUES["activite"],
        "siege": REPONSES_TENUES["siege"],
    }
    ecarts = [c for c, v in attendus.items() if ouvert.get(c) != v]
    etape(23, "Il porte les faits de la qualification", 200 if not ecarts else 0,
          (200,), "tous repris" if not ecarts else f"manquent : {', '.join(ecarts)}")
    if code != 200 or ecarts:
        return bilan()

    # ══ DE L'ARGENT ENCAISSÉ À L'ENTREPRISE IMMATRICULÉE ═════════════════════
    #
    # ⚠️ C'EST ICI QUE LES DEUX MOITIÉS DU PRODUIT SE REJOIGNENT.
    #
    # `flux_creation.py` éprouve ce tunnel depuis un dossier ouvert à la main.
    # Ce qui suit l'éprouve depuis un dossier **né d'un paiement**, sur les
    # faits que le client a lui-même donnés au téléphone. Le tunnel n'a pas à
    # savoir d'où vient son dossier — et la seule façon de s'en assurer est de
    # le lui faire parcourir depuis l'autre bout.
    formalites = session(CHARGE)
    _, fiche = appeler(formalites, "GET", f"/creations/{formalite}")
    pieces = [p["code"] for p in ((fiche or {}).get("dossier") or {}).get("pieces", [])]

    appeler(formalites, "POST", f"/creations/{formalite}/etape", {"vers": "CONSTITUTION"})
    code, refus = appeler(formalites, "POST", f"/creations/{formalite}/etape",
                          {"vers": "DEPOT_CFCE"})
    etape(24, "Le dépôt est refusé, pièces manquantes nommées", code, (409,),
          "pièces citées" if isinstance(refus, dict) and refus.get("detail") else "refus muet")

    for piece in pieces:
        appeler(formalites, "POST", f"/creations/{formalite}/pieces", {"code": piece})
    code, fiche = appeler(formalites, "GET", f"/creations/{formalite}")
    etape(25, "Le dossier complet devient déposable", code, (200,),
          f"déposable={(fiche or {}).get('deposable')}")

    for vers in ("DEPOT_CFCE", "SUIVI_IMMATRICULATION"):
        code, _ = appeler(formalites, "POST", f"/creations/{formalite}/etape", {"vers": vers})
    etape(26, "Dépôt au CFCE, puis suivi d'immatriculation", code, (200,))

    # ⚠️ LE RCCM SEUL NE SUFFIT PAS. Sans NIU, il n'y a pas de contribuable, et
    # livrer une société qui ne peut pas déclarer serait livrer un problème.
    rccm = f"RC/DLA/2026/B/{marque[:4].upper()}"
    niu = f"M{marque.upper()[:6]}0011Q"[:14]
    appeler(formalites, "POST", f"/creations/{formalite}/identifiants",
            {"rccm": rccm, "rccm_obtenu_le": JOUR})
    code, _ = appeler(formalites, "POST", f"/creations/{formalite}/etape", {"vers": "LIVRAISON"})
    etape(27, "La livraison est refusée sans NIU", code, (409,))

    appeler(formalites, "POST", f"/creations/{formalite}/identifiants",
            {"niu": niu, "niu_obtenu_le": JOUR})
    code, _ = appeler(formalites, "POST", f"/creations/{formalite}/etape", {"vers": "LIVRAISON"})
    etape(28, "La société est livrée à sa fondatrice", code, (200,))

    code, converti = appeler(formalites, "POST", f"/creations/{formalite}/conversion",
                             {"regime": "REEL", "centre": "CDI", "adherent": True})
    etape(29, "Conversion en entreprise du portefeuille", code, (200,),
          f"NIU {(converti or {}).get('niu', '—')}")

    code, entreprise = appeler(formalites, "GET", f"/portefeuille/entreprises/{niu}")
    etape(30, "L'entreprise est lisible au portefeuille", code, (200,),
          f"« {(entreprise or {}).get('denomination', '—')} »")

    # ⚠️ LA QUESTION QUI VALIDE TOUT LE PARCOURS. Une société créée qui ne sait
    # pas ce qu'elle doit, et quand, n'est pas une société accompagnée.
    # ⚠️ `a_la_date` est EXIGÉ : l'échéancier se calcule au barème d'une date,
    # comme tout le reste du référentiel daté. Sans lui, 422.
    code, echeancier = appeler(
        formalites, "GET",
        f"/obligations/dossiers/{niu}/echeancier?exercice=2026&a_la_date={JOUR}",
    )
    if isinstance(echeancier, list):
        nb = len(echeancier)
    else:
        nb = len((echeancier or {}).get("obligations") or [])
    etape(31, "Son échéancier fiscal est calculé d'office", code, (200,),
          f"{nb} obligation(s), sans qu'on l'ait demandé")
    if code == 200 and nb == 0:
        ECHECS.append("l'échéancier est vide : la promesse du contexte n'est pas tenue")

    # 32 · ⚠️ UN ÉCHÉANCIER NON VIDE NE SUFFIT PAS : IL DOIT ÊTRE VRAI.
    #
    #      Le 28 septembre, cet échéancier-là comptait bien ses dix lignes, et
    #      la première que la fondatrice lisait sur son espace était :
    #
    #          Contribution des patentes — En retard de 212 jours
    #
    #      Sa société avait été immatriculée le jour même. Le pas précédent
    #      était vert, et le produit l'accueillait par une dette qu'elle ne
    #      devait pas. Ce produit s'interdit de tranquilliser à tort ; alarmer
    #      à tort est la même faute retournée.
    lignes = echeancier if isinstance(echeancier, list) else (echeancier or {}).get("obligations") or []
    fautives = []
    for ligne in lignes:
        obligation = ligne.get("obligation", ligne)
        echeance = obligation.get("echeance") or ""
        debut = obligation.get("periode_debut") or ""
        if echeance and debut and echeance < debut:
            fautives.append(f"{obligation.get('code_obligation')} échoit le {echeance}, période ouverte le {debut}")
        if ligne.get("en_retard"):
            fautives.append(f"{obligation.get('code_obligation')} annoncée EN RETARD le jour de l'immatriculation")
    etape(32, "Aucune échéance n'est antérieure à sa société", 200 if not fautives else 0,
          (200,), "aucune dette d'avant sa naissance" if not fautives else " · ".join(fautives))
    if fautives:
        ECHECS.extend(fautives)

    # 26 · ⚠️ ON NE CONVERTIT PAS DEUX FOIS. Une seconde conversion créerait une
    # seconde entreprise pour la même société, avec le même NIU.
    code, _ = appeler(formalites, "POST", f"/creations/{formalite}/conversion",
                      {"regime": "REEL", "centre": "CDI"})
    etape(33, "Une seconde conversion est refusée", code, (409,))

    # ══ ET SON ACCÈS À ELLE ══════════════════════════════════════════════════
    #
    # ⚠️ LA DERNIÈRE QUESTION, ET C'EST CELLE DE LA CLIENTE.
    #
    # Elle a payé, sa société existe, elle est au portefeuille. Peut-elle entrer ?
    #
    # Son accès s'ouvre ICI et pas au paiement : la portée d'une adhérente est le
    # dossier de SON entreprise, et au moment où elle paie, celle-ci n'existe
    # pas. Il s'ouvre en outre à deux conditions — l'entreprise, et le suivi.
    # La conversion ci-dessus a demandé `adherent: True`.
    acces = None
    for _ in range(12):
        acces = _courriel_pour(courriel)
        # ⚠️ Reconnu à son LIEN D'ACTIVATION, et non à un mot de son objet :
        # l'objet a changé le 28 septembre — « votre société est immatriculée »
        # et non « votre accès » —, et le flux s'est mis à dire qu'aucun
        # courriel n'arrivait alors qu'il était là, sous un autre titre.
        if acces and "activation?jeton=" in (acces.get("Text") or ""):
            break
        acces = None
        time.sleep(5)
    etape(34, "Elle reçoit son accès, une fois immatriculée",
          200 if acces else 0, (200,),
          f"« {(acces or {}).get('Subject', 'AUCUN COURRIEL')} »")

    # ⚠️ LE LIEN MÈNE-T-IL QUELQUE PART ? Un accès annoncé et un lien mort, c'est
    # pire que pas d'accès : elle croit pouvoir entrer, et appelle le cabinet.
    lien_acces = None
    if acces:
        trouve = re.search(r"https?://\S+activation\S*", acces.get("Text") or "")
        lien_acces = trouve.group(0) if trouve else None
    sur_le_site = bool(lien_acces and lien_acces.startswith(FRONT))
    etape(35, "Son lien mène à la console du cabinet",
          200 if sur_le_site else 0, (200,),
          (lien_acces or "AUCUN LIEN")[:60])
    if lien_acces and not sur_le_site:
        ECHECS.append(
            f"le lien d'activation ne pointe pas sur {FRONT} : « {lien_acces[:60]} »"
        )

    return bilan()


#: Ce qu'un vrai prospect répondrait, pour les questions dont la réponse ne se
#: devine pas d'après le type.
REPONSES_TENUES = {
    "denomination_souhaitee": "SYLVIE COUTURE SARL",
    "siege": "Bonabéri, Douala",
    "activite": "confection et vente de vêtements",
    "forme_juridique": "SARL",
}


def _valeur_pour(question: dict):
    """Une réponse plausible, selon ce que la question attend.

    ⚠️ Le serveur VALIDE les types à la saisie : un `ENTIER` reçu en texte, un
    `ENUM` hors liste, et la qualification est refusée en 422. Ce n'est pas une
    rigidité — c'est ce qui garantit que le chiffrage porte sur des faits
    comparables. Cette fabrique respecte donc le type déclaré, et pour les
    questions dont la réponse ne se devine pas, elle emploie ce qu'un vrai
    prospect dirait.
    """
    tenue = REPONSES_TENUES.get(question.get("code"))
    if tenue is not None:
        return tenue
    valeurs = question.get("valeurs") or []
    if valeurs:
        return valeurs[0]
    genre = (question.get("type") or "").upper()
    return {
        "ENTIER": 2,
        "DECIMAL": "1000000",
        "BOOLEEN": False,
        "LISTE": [],
        "TEXTE": "à préciser",
    }.get(genre, "à préciser")


def bilan(**contexte) -> int:
    print()
    print("═" * 104)
    if ECHECS:
        print(f"FLUX INTERROMPU — {len(ECHECS)} écart(s)")
        for e in ECHECS:
            print(f"  ⚠ {e}")
    else:
        print("FLUX COMPLET")
    print("═" * 104)
    return 1 if ECHECS else 0


if __name__ == "__main__":
    sys.exit(main())
