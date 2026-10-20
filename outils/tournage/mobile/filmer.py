"""LES FILMS DE L'APPLICATION MOBILE (18 octobre 2026), joués sur l'émulateur ou le téléphone.

Chaque film suit le fil des films web : ce qui arrive, ce que la plateforme en fait, le
résultat. L'écran est enregistré par `screenrecord` ; les légendes sont datées depuis le
début de l'enregistrement, et le studio (`studio.mjs`) les rejoue à côté de l'écran.

    python3 mobile/filmer.py mobile-1-deposer-une-piece

⚠️ Pile NEUVE, puis `preparer-cnps-appelee.mjs` (la CNPS de juillet arrêtée et appelée) ;
dans la galerie de l'appareil, la facture de la quincaillerie et l'état des stocks.
⚠️ LA CONFIRMATION DE L'OPÉRATEUR MOBILE MONEY EST SIMULÉE, par la route même qu'il
appellera, refusée en production : la démonstration n'a pas d'identifiants marchands.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import telephone as t

ICI = Path(__file__).parent
SORTIE = ICI.parent / "sortie" / "mobile"
API = "http://127.0.0.1:8010"
NKOA = "jp.nkoa@batimentplus.cm"
NGUEMA = "s.nguema@nguemaconseil.cm"


def simuler_la_confirmation(reference: str) -> int:
    identifiant = subprocess.run(
        ["psql", "-h", "127.0.0.1", "-p", "55432", "-U", "cga", "-d", "cga_dev", "-Atc",
         f"select identifiant from paiement where reference_reglee = '{reference}' "
         "order by donnees->>'initie_le' desc limit 1"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    demande = urllib.request.Request(
        f"{API}/souscription/paiements/{identifiant}/simulation",
        data=json.dumps({"reussi": True}).encode(), method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(demande) as reponse:
        return reponse.status


def jusqua(texte: str, essais: int = 6, de: int = 1750, a: int = 950):
    """Fait défiler jusqu'à ce que le texte paraisse."""
    for _ in range(essais):
        e = t.attendre(texte, 1.5)
        if e:
            return e
        t.glisser(de, a, 700, 1.0)
    raise RuntimeError(f"introuvable en défilant : {texte}")


def amener(element, cible: int = 1100):
    """Amène un élément vers le milieu de l'écran."""
    # ⚠️ Le geste part toujours au-dessus de la barre d'onglets : parti de plus bas, il
    # la touchait, et changeait d'écran au lieu de faire défiler.
    _, _, y, _, _ = element
    ecart = y - cible
    if abs(ecart) > 250:
        depart = 1700 if ecart > 0 else 600
        t.glisser(depart, max(300, min(1900, depart - ecart)), 900, 1.2)


def payer(numero: str = "677123456"):
    champ = t.champs()[0]
    t.tap(champ[1], champ[2], 0.6)
    for chiffre in numero:
        t.adb("shell", "input", "text", chiffre)
        time.sleep(0.12)
    time.sleep(1.0)


def choisir_dans_la_galerie(rang: int):
    """Le sélecteur de photos du système : la vignette au rang donné, puis OK."""
    t.attendre("Photos", 15)
    time.sleep(1.5)
    vignettes = sorted(
        (e for e in t.elements() if e[0].startswith("Photo prise")), key=lambda e: e[1]
    )
    _, x, y, _, _ = vignettes[rang]
    t.tap(x, y, 1.6)
    t.toucher("OK", pause=1.0)


# ── Film 1 : déposer une pièce ──────────────────────────────────────────────────────────


def deposer_une_piece(f: t.Tournage):
    t.attendre("Bonjour", 30)
    time.sleep(1)
    f.dire("arrive", "La facture de la quincaillerie arrive sur WhatsApp. L'accueil le dit : "
           "le cabinet attend encore <b>trois justificatifs</b> de septembre.", 6.5)
    t.tap(540, 2230, 1.5)
    f.dire("arrive", "Le bouton du milieu, sous le pouce : <b>photographier</b> la pièce, ou la "
           "prendre <b>dans la galerie</b> quand elle est déjà arrivée en image.", 6)
    t.toucher("Choisir dans la galerie", pause=1.5)
    f.dire("traite", "Il la choisit. Aucun formulaire : le cabinet l'identifiera.", 2.5)
    choisir_dans_la_galerie(1)
    f.dire("traite", "Enregistrée sur le téléphone, puis partie d'elle-même. Sans réseau, elle "
           "<b>attend</b> et repart dès qu'il revient.", 5)
    t.attendre("Tout est parti", 25)
    f.dire("resultat", "« <b>Tout est parti</b> » : la pièce est au cabinet.", 4)
    t.toucher("Tout ce que j'ai envoyé", pause=3)
    f.dire("resultat", "Son historique : chaque pièce, et où elle en est. "
           "<b>Reçue</b>, lue, comptabilisée.", 6)
    e = jusqua("Comptabilisée")
    amener(e)
    f.dire("resultat", "Une facture de juillet est déjà <b>comptabilisée</b> : il la suit "
           "jusqu'à l'écriture, sans appeler le cabinet.", 5)
    t.toucher("Comptabilisée", pause=3.5)
    f.dire("resultat", "Et il la relit, telle que le cabinet l'a reçue.", 5)
    t.retour(1.0)


# ── Film 2 : régler sans capture ────────────────────────────────────────────────────────


def regler_sans_capture(f: t.Tournage):
    t.attendre("Bonjour", 30)
    t.onglet("Échéances", 2.5)
    t.glisser(700, 1800, 400, 3)
    f.dire("arrive", "La CNPS de juillet : la comptable l'a <b>arrêtée</b> d'après les bulletins, "
           "le cabinet l'a <b>appelée</b>. Le montant est déjà là : 110 618 F.", 7)
    f.dire("arrive", "Bâtiment Plus a confié au cabinet le paiement de sa CNPS : "
           "<b>rien à photographier</b>, rien à apporter au guichet.", 5)
    t.toucher("Régler par mobile money", pause=2)
    f.dire("traite", "Son numéro mobile money, MTN ou Orange. Le montant ne se retape pas.", 1)
    payer()
    time.sleep(2)
    t.retour(0.8)
    t.toucher("Envoyer la demande", pause=3)
    f.dire("traite", "La demande part chez l'opérateur ; il <b>valide avec son code</b>, sur ce "
           "même téléphone.", 5.5)
    statut = simuler_la_confirmation("AF-M081234567890P-CNPS-20260701")
    print(f"  confirmation simulée : {statut}")
    f.dire("traite", "La démonstration n'a pas d'opérateur : sa confirmation est <b>simulée</b>, "
           "par la route même qu'il appellera.", 4.5)
    t.toucher("J'ai compris", pause=1.5)
    time.sleep(3)
    t.glisser(700, 1800, 400, 3)
    e = jusqua("Fonds reçus")
    amener(e, 1000)
    f.dire("resultat", "« <b>Fonds reçus par le cabinet</b> » : il paie l'administration et garde "
           "la quittance. L'adhérent n'a rien envoyé.", 7)
    t.onglet("Accueil", 2.5)
    f.dire("resultat", "Une période en retard de moins, sans un pas hors de chez lui.", 5)


# ── Film 3 : documents et DSF ───────────────────────────────────────────────────────────


def documents_et_dsf(f: t.Tournage):
    t.attendre("Bonjour", 30)
    f.dire("arrive", "Sylvain NGUEMA, gérant de Cabinet Nguema Conseil. Sa <b>DSF 2025</b> reste "
           "à faire, et le cabinet lui demande des pièces.", 5.5)
    t.onglet("Plus", 2)
    t.toucher("Ma déclaration annuelle", pause=3.5)
    f.dire("arrive", "« Ma déclaration annuelle » : où elle en est, et les pièces du guide de la "
           "DGI qu'il détient lui-même.", 5)
    e = jusqua("État des stocks")
    amener(e, 900)
    e = t.attendre("État des stocks", 5)
    f.dire("traite", "L'état des stocks, arrêté au 31 décembre : il l'envoie <b>d'ici</b>.", 3)
    # ⚠️ Le bouton de CETTE pièce : le plus proche sous son libellé, et non le premier venu.
    boutons = sorted(
        (x for x in t.elements() if x[0] == "Envoyer la pièce" and x[2] > e[2]), key=lambda x: x[2]
    )
    t.tap(boutons[0][1], boutons[0][2], 1.8)
    f.dire("traite", "La photo, ou l'image déjà dans la galerie.", 1.5)
    t.toucher("Choisir dans la galerie", pause=1.5)
    choisir_dans_la_galerie(0)
    t.attendre("bien arrivée", 20)
    f.dire("traite", "« Bien arrivée au cabinet » : la comptable la voit, versée, dans les pièces "
           "de la DSF. Personne ne l'a ressaisie.", 5)
    e = t.attendre("Reçue :", 5)
    if e:
        amener(e, 1000)
    f.dire("resultat", "L'état des stocks est <b>reçu</b>, une pièce de moins à fournir. Il pourra "
           "le remplacer tant que la DSF n'est pas déposée.", 6)
    t.retour(1.2)
    t.toucher("Se déconnecter", pause=1.5)
    t.attendre("Se déconnecter ?", 10)
    bouton = [x for x in t.elements() if x[0] == "Se déconnecter"]
    t.tap(bouton[0][1], bouton[0][2], 3)
    f.dire("resultat", "Et quand la DSF est déposée ? Chez Bâtiment Plus, dont le cabinet a tout "
           "déposé.", 1)
    t.se_connecter(NKOA)
    t.attendre("Bonjour", 30)
    t.onglet("Documents", 3)
    f.dire("resultat", "<b>Mes documents</b> : chaque déclaration déposée en son nom, avec son "
           "numéro d'accusé.", 5.5)
    t.toucher("Voir le reçu", pause=4)
    f.dire("resultat", "Le reçu se <b>lit sur le téléphone</b> : de quoi répondre à "
           "l'administration, sans attendre le cabinet.", 5.5)
    t.retour(1.5)
    t.onglet("Plus", 2)
    t.toucher("Ma déclaration annuelle", pause=3.5)
    f.dire("resultat", "Et sa DSF 2025 : <b>déposée</b>, avec l'accusé de la DGI et sa date.", 6)


# ── Film 4 : l'accueil et « Plus » ──────────────────────────────────────────────────────


def accueil_et_plus(f: t.Tournage):
    t.attendre("Bonjour", 30)
    time.sleep(1)
    f.dire("arrive", "En ouvrant, une seule réponse : <b>où en est son mois</b>. Les pièces "
           "attendues, les retards, ce que le cabinet a déposé.", 6.5)
    # ⚠️ Pas de défilement de l'accueil : sur l'émulateur, son rendu logiciel (dégradés,
    # ombres) a fait tomber l'appareil trois fois de suite au même geste.
    f.dire("arrive", "Le geste principal sous le pouce, et ce qu'il doit au cabinet : "
           "<b>90 000 F d'honoraires</b>.", 4.5)
    t.toucher("d'honoraires à régler", pause=3)
    f.dire("traite", "Ses honoraires : septembre en retard, octobre à régler, et la "
           "<b>note</b> de chaque période.", 5)
    t.toucher("Payer par mobile money", pause=2)
    payer()
    time.sleep(1.5)
    t.retour(0.8)
    t.toucher("Envoyer la demande", pause=3)
    f.dire("traite", "Réglés de la même façon : par mobile money, validés par son code.", 4)
    statut = simuler_la_confirmation_honoraires()
    print(f"  confirmation simulée : {statut}")
    if t.attendre("J'ai compris", 3):
        t.toucher("J'ai compris", pause=1.5)
    time.sleep(3)
    t.glisser(700, 1800, 400, 3)
    f.dire("resultat", "Septembre passe en « <b>Réglée</b> », la caisse le voit d'elle-même ; "
           "le reçu se lit ici.", 6)
    t.retour(1.2)
    t.onglet("Plus", 2)
    f.dire("resultat", "« Plus » : ses honoraires, sa DSF, ses pièces, son entreprise, "
           "<b>sa paie</b>.", 4)
    t.toucher("Ma paie", pause=3.5)
    f.dire("resultat", "Ses bulletins du mois, et ce qu'il faut verser : la CNPS en tête.", 6)
    t.retour(1.2)


# ── Film 5 (20 octobre 2026) : le nouvel accueil, et le scan PDF avec sa fiche ─────────


def remplir(rang: int, texte: str):
    """Le champ au rang donné : touché, rempli, puis le clavier rentré."""
    champ = t.champs()[rang]
    t.tap(champ[1], champ[2], 0.6)
    t.saisir(texte)
    time.sleep(0.6)
    t.retour(0.8)


def accueil_et_scan_pdf(f: t.Tournage):
    t.attendre("Bonjour", 30)
    time.sleep(1.5)
    f.dire("arrive", "Le nouvel accueil : son mois en un coup d'œil, puis <b>trois chiffres</b>, "
           "chacun sous son pictogramme.", 6)
    f.dire("arrive", "<b>3 pièces à envoyer</b>, 8 périodes en retard, 130 documents déposés : "
           "ce qui demande un geste est en rouge.", 6)
    f.dire("arrive", "Une facture de la quincaillerie arrive par courriel, <b>en PDF</b>. Jusqu'ici, "
           "seule une photo pouvait partir.", 4)
    t.toucher("Déposer une pièce", pause=2)
    f.dire("traite", "Trois façons de déposer : photographier, choisir dans la galerie, ou "
           "<b>importer un scan</b>.", 5)
    t.toucher("Importer un scan (PDF)", pause=3)
    # ⚠️ Le NOM du fichier, exactement : « Prévisualiser le fichier … » le contient aussi, et
    # ouvrait la visionneuse au lieu de choisir le fichier.
    t.attendre("facture-quincaillerie-specimen.pdf", 15)
    nom = [e for e in t.elements() if e[0] == "facture-quincaillerie-specimen.pdf"][0]
    t.tap(nom[1], nom[2], 3.5)
    t.attendre("Vérifier le scan", 15)
    f.dire("traite", "<b>Vérifier le scan</b> avant l'envoi : le cabinet le recevra tel quel, "
           "toutes ses pages comprises.", 5)
    f.dire("traite", "Et, s'il le veut, ce qu'il sait de la pièce. <b>Tout est facultatif</b> : ce "
           "qu'il dit ici, le comptable n'aura pas à le relire.", 4)
    t.toucher("achat", pause=1.2)  # ⚠️ l'apostrophe de l'écran est typographique
    remplir(0, "QUINCAILLERIE DU WOURI")
    remplir(1, "FA-2026-0815")
    f.dire("traite", "Le type, le fournisseur, le numéro, le montant : 178 875 F, taxes comprises.", 1)
    t.glisser(1800, 1100, 700, 1.5)
    remplir(2, "178875")
    # ⚠️ `input text` ne tape pas les accents : la note n'en porte pas.
    remplir(3, "Solde au comptant le 12/09")
    f.dire("traite", "Un mot pour le comptable : « Solde au comptant le 12/09 ».", 3.5)
    t.glisser(1800, 900, 700, 1.5)
    t.toucher("Envoyer la pièce", pause=2)
    t.attendre("Tout est parti", 30)
    f.dire("resultat", "« <b>Tout est parti</b> » : le scan est au cabinet, avec sa fiche.", 4.5)
    t.toucher("Mes pièces envoyées", pause=3)
    f.dire("resultat", "Dans son historique, la facture en PDF, <b>reçue</b> : il la suivra jusqu'à "
           "l'écriture.", 6)
    t.retour(1.0)


# ── Film 6 (20 octobre 2026) : le mode sombre, et l'application sans réseau ────────────


def sombre_et_hors_ligne(f: t.Tournage):
    t.attendre("Bonjour", 30)
    time.sleep(1.5)
    f.dire("arrive", "Le soir, le téléphone de l'adhérent passe en <b>mode sombre</b>.", 2)
    t.adb("shell", "cmd", "uimode", "night", "yes")
    time.sleep(3)
    f.dire("traite", "L'application suit le téléphone, d'elle-même : fonds sombres, et des "
           "couleurs d'état qui restent lisibles.", 6)
    t.onglet("Échéances", 3)
    f.dire("traite", "Ses échéances, en retard en rouge, déposées en vert : même sens, même "
           "lisibilité.", 5)
    t.onglet("Documents", 3)
    f.dire("traite", "Ses documents. Il les a déjà ouverts une fois : l'application les "
           "<b>garde</b> pour les relire.", 5)
    f.dire("arrive", "Et quand le réseau tombe ? En chantier, à Bonabéri, plus de données.", 2)
    # ⚠️ Le mode avion ne coupe pas le tunnel d'adb : l'émulateur joignait encore le serveur.
    # Le tunnel coupé, l'application voit le cabinet injoignable, et le dit.
    t.adb("shell", "cmd", "connectivity", "airplane-mode", "enable")
    t.adb("reverse", "--remove", "tcp:8010")
    time.sleep(2)
    t.glisser(500, 1800, 400, 6)
    f.dire("resultat", "Un bandeau le dit, avec <b>l'heure de la dernière mise à jour</b> : ses "
           "documents restent lisibles, tels qu'il les a vus.", 6)
    t.onglet("Échéances", 2.5)
    t.glisser(500, 1800, 400, 5)
    f.dire("resultat", "Ses échéances aussi, datées : une copie d'hier ne se fait jamais passer "
           "pour celle du jour.", 6)
    f.dire("resultat", "Une pièce photographiée maintenant <b>attendra</b>, et partira au "
           "retour du réseau.", 4)
    t.adb("reverse", "tcp:8010", "tcp:8010")
    t.adb("shell", "cmd", "connectivity", "airplane-mode", "disable")
    time.sleep(4)
    t.glisser(500, 1800, 400, 4)
    f.dire("resultat", "Le réseau revient : il tire l'écran, tout se remet à jour.", 5)
    t.adb("shell", "cmd", "uimode", "night", "no")
    time.sleep(1)


def simuler_la_confirmation_honoraires() -> int:
    reference = subprocess.run(
        ["psql", "-h", "127.0.0.1", "-p", "55432", "-U", "cga", "-d", "cga_dev", "-Atc",
         "select reference_reglee from paiement where reference_reglee like '%M081234567890P%' "
         "and reference_reglee not like 'AF-%' order by donnees->>'initie_le' desc limit 1"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return simuler_la_confirmation(reference)


FILMS = {
    "mobile-1-deposer-une-piece": (NKOA, deposer_une_piece),
    "mobile-2-regler-sans-capture": (NKOA, regler_sans_capture),
    "mobile-3-documents-et-dsf": (NGUEMA, documents_et_dsf),
    "mobile-4-accueil-et-plus": (NKOA, accueil_et_plus),
    "mobile-5-accueil-et-scan-pdf": (NKOA, accueil_et_scan_pdf),
    "mobile-6-sombre-et-hors-ligne": (NKOA, sombre_et_hors_ligne),
}

if __name__ == "__main__":
    nom = sys.argv[1]
    courriel, jouer = FILMS[nom]
    t.relancer()
    t.se_connecter(courriel)
    with t.Tournage(nom, SORTIE) as f:
        jouer(f)
    print(f"{nom} : {f.legendes[-1]['t']:.0f} s · {SORTIE / (nom + '.mp4')}")
