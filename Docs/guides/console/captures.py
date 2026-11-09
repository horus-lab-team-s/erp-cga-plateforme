#!/usr/bin/env python3
"""Photographie la console du cabinet pour le guide d'utilisation.

    python3 Docs/guides/console/captures.py            # tout
    python3 Docs/guides/console/captures.py 08 31      # seulement les captures dont le nom commence ainsi

Contre la pile qui tourne (console CGA_CONSOLE, par défaut http://localhost:3011 ;
API CGA_API, par défaut http://127.0.0.1:8010), en 1440 x 900, une session par profil
(voir sessions.py : le limiteur retient 30 connexions par cinq minutes pour toute la pile).

Préparation idempotente, faite au premier passage seulement :
  - une demande de création déposée sur la vitrine (NGO Mireille), qualifiée par la direction ;
  - le second facteur de la réviseure et du super administrateur, enrôlé par le lien
    que la pile de démonstration retient (/transverse/courriels) ; le secret est gardé
    dans le dossier des sessions, jamais dans le guide ;
  - une prestation ponctuelle ouverte par la chargée de formalités ;
  - une offre de poste en BROUILLON (elle ne paraît pas sur le site).
Rien n'est encaissé, aucune DSF n'est préparée, aucune déclaration n'est consignée :
les autres guides photographient la même pile.

Les repères numérotés posés sur les captures sont dessinés dans la page (CSSOM, la
console sert une politique de contenu stricte) juste avant la prise.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

ICI = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(ICI))
from sessions import CONSOLE, DOSSIER, PROFILS, code_totp, contexte, garder_secret, secret_totp  # noqa: E402

API = os.environ.get("CGA_API", "http://127.0.0.1:8010")
VITRINE = os.environ.get("CGA_VITRINE", "http://localhost:3012")
SORTIE = ICI / "captures"
PIECES = ICI.parents[2] / "outils" / "tournage" / "pieces"
FILTRE = sys.argv[1:]
JOURNAL: list[str] = []

BATIMENT, AGRO, NGUEMA = "M081234567890P", "M065544332211L", "P027788990011M"


# ── outils de prise ───────────────────────────────────────────────────────────

def aller(page: Page, chemin: str, dossier: str | None = None) -> None:
    if dossier:
        page.context.add_cookies([{"name": "cga_entreprise", "value": dossier, "url": CONSOLE}])
    if dossier and "dossier=" not in chemin:
        chemin += ("&" if "?" in chemin else "?") + f"dossier={dossier}"
    page.goto(f"{CONSOLE}/fr{chemin}", wait_until="networkidle", timeout=45_000)
    page.wait_for_timeout(500)


def marquer(page: Page, reperes: list) -> None:
    """Pose un cadre et une pastille numérotée sur chaque repère (locator, numéro)."""
    boites = []
    for lieu, numero in reperes:
        try:
            b = lieu.first.bounding_box(timeout=3000)
        except Exception:  # noqa: BLE001
            b = None
        if b:
            boites.append({**b, "n": numero})
        else:
            JOURNAL.append(f"repère {numero} introuvable")
    page.evaluate(
        """(boites) => {
          for (const b of boites) {
            const c = document.createElement('div');
            Object.assign(c.style, {position:'fixed', left:(b.x-4)+'px', top:(b.y-4)+'px',
              width:(b.width+8)+'px', height:(b.height+8)+'px', border:'3px solid #8C2D86',
              borderRadius:'8px', zIndex:2147483646, pointerEvents:'none',
              boxShadow:'0 0 0 4px rgba(140,45,134,.18)'});
            const p = document.createElement('div');
            p.textContent = b.n;
            const gauche = b.x - 16 < 2 ? b.x + b.width - 14 : b.x - 16;
            Object.assign(p.style, {position:'fixed', left:gauche+'px', top:Math.max(2, b.y-16)+'px',
              width:'28px', height:'28px', borderRadius:'50%', background:'#8C2D86', color:'#fff',
              font:'700 15px/28px Inter, sans-serif', textAlign:'center', zIndex:2147483647,
              pointerEvents:'none', boxShadow:'0 2px 6px rgba(0,0,0,.3)'});
            c.className = p.className = 'cga-repere';
            document.body.append(c, p);
          }
        }""",
        boites,
    )


def effacer(page: Page) -> None:
    page.evaluate("() => document.querySelectorAll('.cga-repere').forEach(n => n.remove())")


def voir(page: Page, lieu) -> None:
    """Amène un élément en haut de la fenêtre, sous l'en-tête."""
    try:
        lieu.first.evaluate("n => { n.scrollIntoView({block:'start'}); window.scrollBy(0, -96); }")
    except Exception:  # noqa: BLE001
        JOURNAL.append("défilement impossible")
    page.wait_for_timeout(350)


def titre(page: Page, texte: str):
    return page.locator("h1, h2, h3", has_text=texte)


def prendre(page: Page, nom: str, reperes: list | None = None, plein: bool = False, element=None) -> None:
    if reperes:
        marquer(page, reperes)
    cible = SORTIE / f"{nom}.png"
    if element is not None:
        element.first.screenshot(path=str(cible))
    else:
        page.screenshot(path=str(cible), full_page=plein)
    effacer(page)
    print(f"  ✓ {nom}")


def voulu(nom: str) -> bool:
    return not FILTRE or any(nom.startswith(f) for f in FILTRE)


def masquer_cle(page: Page) -> None:
    """La clé du second facteur ne figure jamais en clair sur une capture."""
    page.evaluate("""() => { for (const n of document.querySelectorAll('p')) {
        if (/^([A-Z2-7]{4} ){3,}[A-Z2-7]{1,4}$/.test(n.textContent.trim())) n.textContent = 'XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX'; } }""")


def lien_d_enrolement(courriel: str) -> str | None:
    with urllib.request.urlopen(f"{API}/transverse/courriels?code=compte.second_facteur_confirmation") as r:
        messages = json.load(r)
    liens = [m["contexte"]["lien"] for m in messages if m["destinataire"] == courriel]
    return liens[0] if liens else None


def renforcer(page: Page, profil: str) -> bool:
    """Saisit le code du moment si l'écran le demande. Vrai si la session est renforcée."""
    secret = secret_totp(profil)
    champ = page.locator('input[name="code"]:not([type=hidden])')
    if not secret or not champ.count():
        return False
    champ.first.fill(code_totp(secret))
    page.get_by_role("button", name="Renforcer la session").first.click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1200)
    return True


# ── préparation (idempotente) ─────────────────────────────────────────────────

def enroler(navigateur, profil: str, chemin: str, prefixe: str | None) -> None:
    """Associe l'application d'authentification, comme un utilisateur, par le lien reçu."""
    if secret_totp(profil):
        return
    ctx = contexte(navigateur, profil)
    page = ctx.new_page()
    aller(page, chemin)
    bouton = page.get_by_role("button", name="Associer une application d’authentification")
    if not bouton.count():
        JOURNAL.append(f"{profil} : déjà enrôlé, secret inconnu ; réinitialiser depuis Comptes")
        ctx.close()
        return
    voir(page, bouton)
    if prefixe and voulu(prefixe):
        prendre(page, f"{prefixe}a-associer", [(bouton, 1)])
    bouton.first.click()
    page.wait_for_timeout(2500)
    if prefixe and voulu(prefixe):
        prendre(page, f"{prefixe}b-lien-envoye", [(page.get_by_text("Un lien vient d'être envoyé"), 1)])
    lien = lien_d_enrolement(PROFILS[profil])
    page.goto(f"{CONSOLE}/fr{lien}", wait_until="networkidle")
    if prefixe and voulu(prefixe):
        prendre(page, f"{prefixe}c-afficher-la-cle", [(page.get_by_role("button", name="Afficher ma clé"), 1)])
    page.get_by_role("button", name="Afficher ma clé").click()
    page.wait_for_timeout(2500)
    texte = page.inner_text("body")
    secret = re.search(r"((?:[A-Z2-7]{4} ){3,}[A-Z2-7]{1,4})", texte).group(1).replace(" ", "")
    garder_secret(profil, secret)
    masquer_cle(page)
    page.locator('input[name="code"]').fill(code_totp(secret))
    if prefixe and voulu(prefixe):
        prendre(page, f"{prefixe}d-cle-et-code", [
            (page.get_by_text("XXXX XXXX"), 1), (page.locator('input[name="code"]'), 2),
            (page.get_by_role("button", name="Activer"), 3)])
    # 19 octobre 2026 : le premier code ACTIVE la clé (il ne fait plus que renforcer).
    page.get_by_role("button", name="Activer").click()
    page.wait_for_timeout(2500)
    print(f"  · second facteur enrôlé : {profil}")
    ctx.close()


def deposer_demande(navigateur) -> None:
    """Une demande de création, déposée sur le site comme un visiteur."""
    ctx = contexte(navigateur, None)
    page = ctx.new_page()
    page.goto(f"{VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande", wait_until="networkidle")
    page.fill("#demande-nom", "NGO Mireille")
    page.fill("#demande-tel", "+237699554433")
    page.fill("#demande-courriel", "mireille.ngo@exemple.cm")
    for code, valeur in [("denomination_souhaitee", "NGO TRAITEUR SARL"), ("associes", "2"),
                         ("capital_social", "1000000"), ("apports_en_nature", "non"),
                         ("chiffre_affaires_prevu", "MOINS_10M"), ("salaries_prevus", "4"),
                         ("region_siege", "LITTORAL"), ("siege", "Bonapriso, Douala"),
                         ("activite", "Restauration et service traiteur"), ("statuts_apportes", "non")]:
        champ = f"#declaration-{code}"
        if page.eval_on_selector(champ, "e => e.tagName") == "SELECT":
            page.select_option(champ, valeur)
        else:
            page.fill(champ, valeur)
    page.locator('.formulaire-service__consentement input[type="checkbox"]').first.check()
    page.click('.formulaire-service button[type="submit"]')
    page.wait_for_timeout(6000)
    ctx.close()


# ── les écrans ────────────────────────────────────────────────────────────────

def anonyme(nav) -> None:
    ctx = contexte(nav, None)
    page = ctx.new_page()
    if voulu("01"):
        aller(page, "/connexion")
        prendre(page, "01-connexion", [
            (page.locator('input[name="courriel"]'), 1), (page.locator('input[name="motDePasse"]'), 2),
            (page.locator('button[type="submit"]'), 3), (page.get_by_role("link", name=re.compile("oubli", re.I)), 4)])
    if voulu("02"):
        aller(page, "/mot-de-passe-oublie")
        prendre(page, "02-mot-de-passe-oublie")
    ctx.close()


def comptable(nav) -> None:
    ctx = contexte(nav, "comptable")
    page = ctx.new_page()
    if voulu("03"):
        aller(page, "/tableau-de-bord")
        prendre(page, "03-tableau-de-bord", [
            (page.locator(".selecteur__declencheur"), 1), (page.locator("nav").first, 2),
            (page.get_by_text("Recherche globale"), 3), (page.locator('a[href*="notifications"]'), 4),
            (page.get_by_text("Dossiers suivis", exact=False).first.locator(".."), 5)])
    if voulu("04"):
        aller(page, "/tableau-de-bord")
        page.locator(".selecteur__declencheur").click()
        page.wait_for_timeout(500)
        prendre(page, "04-selecteur-de-dossier")
    if voulu("05"):
        aller(page, "/plan-de-travail")
        prendre(page, "05-plan-de-travail")
    if voulu("06"):
        aller(page, "/portefeuille")
        prendre(page, "06-portefeuille-comptable", [(page.locator(".situations").first, 1)])
    if voulu("07"):
        aller(page, "/pieces")
        prendre(page, "07-boite-de-reception", [
            (page.get_by_role("link", name="Importer des pièces").or_(page.get_by_role("button", name="Importer des pièces")), 1),
            (page.get_by_text("Bloquant", exact=True).first.locator(".."), 2),
            (page.get_by_text("Entreprise : tous").first, 3)])
    if voulu("08"):
        aller(page, "/pieces/F-2026-0424")
        prendre(page, "08-rapport-de-conformite", [
            (page.get_by_text("Anomalie bloquante", exact=False).first, 1),
            (page.get_by_text("Données extraites").first, 2), (page.get_by_text("MAJEUR").first, 3)])
        voir(page, page.get_by_text("Trace du contrôle"))
        prendre(page, "08b-trace-du-controle", [
            (page.get_by_text("Trace du contrôle").first, 1),
            (page.get_by_role("button", name="Écarter un constat").or_(page.get_by_text("Écarter un constat")), 2)])
    if voulu("09"):
        aller(page, "/pieces/attendues")
        prendre(page, "09-pieces-attendues", [(page.get_by_text("Rattacher la pièce reçue").first, 1)])
    if voulu("10"):
        aller(page, "/pieces/relancer")
        prendre(page, "10-relancer-un-adherent")
        voir(page, titre(page, "Message"))
        prendre(page, "10b-message-de-relance", [(page.get_by_text("Canaux").first, 1),
                                                 (page.get_by_role("button", name="Envoyer maintenant"), 2)])
    if voulu("11"):
        aller(page, "/conformite/file")
        voir(page, page.get_by_text("À traiter (", exact=False))
        prendre(page, "11-file-d-anomalies")
    if voulu("12"):
        aller(page, "/comptabilite/saisie", AGRO)
        page.select_option('select[name="journal"]', "AC")
        page.fill('input[name="date_operation"]', "2026-09-12")
        page.fill('input[name="libelle"]', "IMPRIMERIE DU LITTORAL, facture du 12/09/2026")
        comptes = page.locator('[name^="compte-"]')
        libelles = page.locator('[name^="libelle-"]')
        sens = page.locator('[name^="sens-"]')
        montants = page.locator('[name^="montant-"]')
        for i, (c, l, s, m) in enumerate([("605", "Ramettes et cartouches", "D", "100000"),
                                          ("4451", "TVA récupérable", "D", "19250"),
                                          ("401", "IMPRIMERIE DU LITTORAL", "C", "119250")]):
            comptes.nth(i).fill(c)
            libelles.nth(i).fill(l)
            try:
                if sens.nth(i).evaluate("e => e.tagName") == "SELECT":
                    options = sens.nth(i).evaluate("e => [...e.options].map(o => o.value)")
                    choix = [o for o in options if o.upper().startswith(s)]
                    sens.nth(i).select_option(choix[0] if choix else options[0])
            except Exception:  # noqa: BLE001
                JOURNAL.append("12 : sens non réglé")
            montants.nth(i).fill(m)
        page.keyboard.press("Tab")
        page.wait_for_timeout(400)
        voir(page, page.get_by_text("Nouvelle écriture"))
        prendre(page, "12-saisie-d-ecriture", [
            (page.locator('select[name="journal"]'), 1), (comptes.nth(0), 2),
            (page.get_by_text("équilibrée", exact=True).first, 3),
            (page.get_by_role("button", name="Enregistrer en brouillon"), 4)])
        voir(page, page.get_by_text("Dernières écritures"))
        prendre(page, "12b-dernieres-ecritures", [(page.get_by_role("button", name="Contre-passer").first, 1)])
    if voulu("13"):
        aller(page, "/comptabilite", AGRO)
        prendre(page, "13-balance-et-livres", [
            (page.get_by_text("Livre-journal (PDF)"), 1), (page.get_by_text("Balance auxiliaire clients (Excel)"), 2),
            (page.get_by_text("Achats par fournisseur (MODELE FOURNISSEURS)"), 3)])
        voir(page, titre(page, "Balance").last)
        prendre(page, "13b-balance-generale")
    if voulu("14"):
        aller(page, "/comptabilite/immobilisations", BATIMENT)
        prendre(page, "14-immobilisations", [(page.get_by_text("Saisir une immobilisation").first, 1),
                                             (page.get_by_text("Passer la dotation", exact=False).first, 2)])
    if voulu("15"):
        aller(page, "/comptabilite/rapprochement", AGRO)
        prendre(page, "15-rapprochement-bancaire")
    if voulu("16"):
        aller(page, "/comptabilite/cloture", AGRO)
        prendre(page, "16-cloture-mensuelle")
        voir(page, page.get_by_text("Transmission au réviseur"))
        prendre(page, "16b-transmission", [(page.get_by_role("button", name="Transmettre au réviseur"), 1)])
    if voulu("17"):
        aller(page, "/comptabilite/echange", AGRO)
        prendre(page, "17-echange-logiciel")
    if voulu("18"):
        aller(page, "/social", AGRO)
        prendre(page, "18-paie-du-mois", [(page.get_by_text("Enregistrer le groupe").first, 1),
                                          (page.get_by_role("button", name="Arrêter les charges du mois").or_(page.get_by_text("Arrêter les charges du mois")).last, 2)])
        voir(page, page.get_by_text("Fichier du personnel"))
        prendre(page, "18b-fichier-du-personnel", [(page.get_by_text("Embaucher un salarié").first, 1),
                                                    (page.get_by_role("link", name="Bulletin").first, 2)])
    if voulu("19"):
        aller(page, f"/social?dossier={AGRO}&annee=2026&mois=9&bulletin=SAL-0002", AGRO)
        bulletin = titre(page, "Bulletin de ")
        if bulletin.count():
            voir(page, bulletin)
        prendre(page, "19-bulletin-de-paie")
    if voulu("20"):
        aller(page, "/obligations", AGRO)
        prendre(page, "20-echeancier")
    if voulu("21"):
        aller(page, "/obligations/declarations", AGRO)
        prendre(page, "21-declaration-de-tva", [(page.get_by_text("Étape 4").first.locator(".."), 1),
                                                (page.get_by_text("n’est pas en état d’être déposé", exact=False).first, 2)])
    if voulu("22"):
        aller(page, "/cloture", AGRO)
        prendre(page, "22-liasse-fiscale", [(page.get_by_text("Les trois contrôles", exact=False).first, 1),
                                            (page.get_by_text("Du résultat comptable au résultat fiscal").first, 2)])
        voir(page, titre(page, "Déclaration statistique et fiscale"))
        prendre(page, "22b-dsf", [(page.get_by_role("button", name="Préparer la DSF"), 1),
                                  (page.get_by_text("Télécharger la DSF au format DGI", exact=False).first, 2),
                                  (page.get_by_text("Pièces à joindre", exact=False).first, 3)])
    if voulu("23"):
        aller(page, "/referentiel")
        prendre(page, "23-referentiel")
    if voulu("24"):
        aller(page, "/obligations/veille-des-seuils")
        prendre(page, "24-veille-des-seuils")
    if voulu("25"):
        aller(page, "/notifications")
        prendre(page, "25-notifications")
    ctx.close()


def reviseur(nav) -> None:
    enroler(nav, "reviseur", "/obligations", "26")
    ctx = contexte(nav, "reviseur")
    page = ctx.new_page()
    if voulu("27"):
        aller(page, f"/portefeuille/{BATIMENT}")
        prendre(page, "27-fiche-du-dossier")
        voir(page, titre(page, "Fiche signalétique de la DSF"))
        prendre(page, "27b-fiche-signaletique")
        voir(page, titre(page, "Honoraires"))
        prendre(page, "27c-honoraires-et-acces")
    if voulu("28"):
        aller(page, f"/obligations?dossier={BATIMENT}", BATIMENT)
        voir(page, titre(page, "Payées par le cabinet"))
        prendre(page, "28-fonds-confies", [(page.get_by_role("button", name="Arrêter le montant").first, 1)])
        voir(page, titre(page, "Constater un dépôt"))
        prendre(page, "28b-code-du-second-facteur", [(page.locator('input[name="code"]'), 1),
                                                      (page.get_by_role("button", name="Renforcer la session"), 2)])
        if renforcer(page, "reviseur"):
            voir(page, titre(page, "Constater un dépôt"))
            prendre(page, "28c-constater-un-depot")
    if voulu("29"):
        aller(page, f"/cloture?dossier={NGUEMA}&exercice=2025", NGUEMA)
        voir(page, titre(page, "Déclaration statistique et fiscale"))
        prendre(page, "29-dsf-a-preparer")
    if voulu("30"):
        aller(page, "/comptabilite/revues")
        prendre(page, "30-revue-des-dossiers")
    if voulu("31"):
        aller(page, "/conformite/qualite")
        prendre(page, "31-qualite-des-regles")
    ctx.close()


def direction(nav) -> None:
    ctx = contexte(nav, "direction")
    page = ctx.new_page()
    aller(page, "/acquisition")
    fiche = page.locator('a[href*="/acquisition/"]', has_text="NGO Mireille")
    if not fiche.count():
        deposer_demande(nav)
        aller(page, "/acquisition")
    if voulu("32"):
        prendre(page, "32-demandes-entrantes", [(fiche, 1)])
    if fiche.count():
        fiche.first.click()
        page.wait_for_url(re.compile(r"/acquisition/.+"))
        page.wait_for_load_state("networkidle")
        adresse = page.url
        if voulu("33"):
            prendre(page, "33-demande-et-premier-echange", [(page.get_by_text("Ce que le visiteur a écrit").first, 1),
                                                             (page.locator('input[name="commentaire"]'), 2)])
            voir(page, titre(page, "Qualification"))
            prendre(page, "33b-qualification-preremplie", [(page.get_by_text("dit par le client sur le site").first, 1)])
        if voulu("34"):
            if page.locator('input[name="score_charge"]').count():
                page.fill('input[name="score_charge"]', "3")
                page.click('form:has([name="score_charge"]) button[type="submit"]')
                page.wait_for_load_state("networkidle")
                page.goto(adresse, wait_until="networkidle")
            voir(page, titre(page, "Proforma"))
            prendre(page, "34-proforma-apercu", [(page.get_by_text("Aperçu avant émission").first, 1),
                                                 (page.get_by_text("+ Ajouter une ligne").first, 2)])
            voir(page, page.get_by_text("TOTAL GENERAL"))
            prendre(page, "34b-proforma-emission", [(page.get_by_text("TOTAL GENERAL").first.locator(".."), 1),
                                                    (page.get_by_role("button", name="Émettre la proforma"), 2)])
    if voulu("35"):
        aller(page, "/tableau-de-bord")
        prendre(page, "35-tableau-de-bord-direction")
    if voulu("36"):
        aller(page, "/pilotage")
        prendre(page, "36-pilotage-dossiers-a-risque")
    if voulu("37"):
        aller(page, f"/pilotage/{BATIMENT}")
        prendre(page, "37-pilotage-detail")
    if voulu("38"):
        aller(page, "/pilotage/charge")
        prendre(page, "38-charge-et-production")
    if voulu("39"):
        aller(page, "/pilotage/rapports")
        prendre(page, "39-rapport-mensuel")
    if voulu("40"):
        aller(page, "/tarifs")
        prendre(page, "40-tarifs", [(page.get_by_text("Fixer ce prix").first, 1)])
    if voulu("41"):
        aller(page, "/offres-de-poste")
        if not page.get_by_text("Comptable confirmé").count():
            page.get_by_role("button", name="Rédiger une offre").click()
            f = page.locator("form.offres__formulaire")
            f.locator("input[name=intitule]").fill("Comptable confirmé")
            f.locator("input[name=lieu]").fill("Douala, Akwa")
            f.locator("textarea[name=description]").click()
            page.keyboard.type("Rejoindre l'équipe de tenue comptable et fiscale.")
            f.locator("textarea").nth(1).click()
            page.keyboard.type("Trois ans d'expérience en cabinet, maîtrise du SYSCOHADA révisé.")
            page.wait_for_timeout(400)
            voir(page, f)
            prendre(page, "41-rediger-une-offre", [(f.locator("input[name=intitule]"), 1),
                                                   (f.get_by_role("button", name="Aperçu").last, 2),
                                                   (f.get_by_role("button", name="Rédiger en brouillon"), 3)])
            f.get_by_role("button", name="Rédiger en brouillon").click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
        aller(page, "/offres-de-poste")
        prendre(page, "41b-offres-du-cabinet", [(page.get_by_role("button", name="Publier sur le site").first, 1)])
    if voulu("42"):
        aller(page, "/caisse")
        prendre(page, "42-caisse-direction")
    if voulu("43"):
        aller(page, "/souscriptions")
        prendre(page, "43-souscriptions")
    if voulu("44"):
        aller(page, "/conformite")
        prendre(page, "44-journal-des-derogations")
    if voulu("45"):
        aller(page, "/creation-entreprise")
        prendre(page, "45-acces-reserve")
    if voulu("46"):
        aller(page, "/portefeuille")
        prendre(page, "46-portefeuille-direction", [(page.get_by_text("Résilier").first, 1)])
    ctx.close()


def clientele(nav) -> None:
    ctx = contexte(nav, "clientele")
    page = ctx.new_page()
    if voulu("47"):
        aller(page, "/creation-entreprise")
        prendre(page, "47-pipeline-de-creation", [(page.get_by_text("Ouvrir un dossier de création").first, 1)])
    if voulu("48"):
        aller(page, "/creation-entreprise/CR-2026-0012")
        prendre(page, "48-dossier-de-creation", [(page.get_by_text("Ce qui bloque").first, 1),
                                                 (page.get_by_text("Passer à", exact=False).first, 2),
                                                 (page.get_by_text("Copier le lien").first, 3)])
        voir(page, titre(page, "Pièces de constitution"))
        prendre(page, "48b-pieces-de-constitution", [(page.get_by_text("Marquer reçue").first, 1),
                                                     (page.get_by_text("Joindre le document").first, 2)])
        voir(page, titre(page, "Identifiants délivrés"))
        prendre(page, "48c-identifiants-et-jalons")
    if voulu("49"):
        aller(page, "/missions")
        if not page.locator('a[href*="/missions/"]').count():
            page.fill('input[name="objet"]', "Bail du dépôt de Bonabéri, avant signature")
            page.fill('input[name="client"]', "SARL BATIMENT PLUS")
            page.fill('input[name="client_courriel"]', "jp.nkoa@batimentplus.cm")
            page.locator('input[name="fichier"]').set_input_files(str(PIECES / "contrat-bail-specimen.pdf"))
            prendre(page, "49-ouvrir-une-mission", [(page.locator('select[name="prestation"], select').first, 1),
                                                    (page.locator('input[name="objet"]'), 2),
                                                    (page.get_by_role("button", name="Ouvrir la mission"), 3)])
            page.get_by_role("button", name="Ouvrir la mission").click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1500)
        aller(page, "/missions")
        mission = page.locator('a[href*="/missions/"]').first
        if mission.count():
            mission.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)
            prendre(page, "49b-mission-ouverte")
            ajout = page.get_by_role("button", name="+ Ajouter un point à la main")
            if ajout.count():
                voir(page, ajout)
                prendre(page, "49c-points-d-analyse", [(ajout, 1)])
    ctx.close()


def caisse(nav) -> None:
    ctx = contexte(nav, "caisse")
    page = ctx.new_page()
    if voulu("50"):
        aller(page, "/caisse")
        prendre(page, "50-caisse")
        voir(page, titre(page, "Honoraires des adhérents"))
        prendre(page, "50b-encaisser-des-honoraires", [
            (page.get_by_text("Référence du reçu").first, 1), (page.get_by_role("button", name="Encaisser").first, 2)])
    ctx.close()


def administrateur(nav) -> None:
    ctx = contexte(nav, "administrateur")
    page = ctx.new_page()
    if voulu("51"):
        aller(page, "/comptes")
        prendre(page, "51-comptes-et-habilitations", [(page.get_by_text("Inviter un collaborateur").first, 1)])
        voir(page, titre(page, "Comptes").last)
        prendre(page, "51b-liste-des-comptes", [(page.get_by_role("button", name="Suspendre").first, 1)])
        voir(page, titre(page, "Habilitations du jour"))
        prendre(page, "51c-habilitations", [(page.get_by_text("Confier un dossier").first, 1),
                                             (page.get_by_text("Fermer ce rôle").first, 2)])
        aller(page, "/comptes")
        invite = page.get_by_text("Inviter un collaborateur").first
        invite.click()
        page.wait_for_timeout(600)
        voir(page, page.get_by_text("Inviter").first)
        prendre(page, "51d-inviter")
        aller(page, "/comptes")
        ligne = page.locator("[role=row]", has_text=PROFILS["reviseur"]).first
        bouton = ligne.get_by_role("button", name="Réinitialiser")
        if bouton.count():
            bouton.click()
            ligne.locator('textarea[name="motif"]').fill("Téléphone perdu signalé le 19/10/2026, vérifié par appel à la titulaire.")
            voir(page, ligne)
            page.evaluate("() => window.scrollBy(0, -200)")
            prendre(page, "51e-reinitialiser-second-facteur", [(ligne.locator('textarea[name="motif"]'), 1),
                                                                (ligne.get_by_role("button", name="Retirer le second facteur"), 2)])
    if voulu("52"):
        aller(page, "/roles")
        prendre(page, "52-matrice-lecture")
    if voulu("53"):
        aller(page, "/exploitation")
        prendre(page, "53-exploitation")
    ctx.close()


def superadmin(nav) -> None:
    enroler(nav, "superadmin", "/roles", None)
    ctx = contexte(nav, "superadmin")
    page = ctx.new_page()
    if voulu("54"):
        aller(page, "/roles")
        prendre(page, "54-matrice-des-roles", [(page.locator('input[name="code"]:not([type=hidden])'), 1)])
        renforcer(page, "superadmin")
        if page.get_by_text("Lire et régler").count():
            bouton = page.get_by_role("button", name="+ Créer un rôle du cabinet")
            if bouton.count():
                bouton.click()
                page.wait_for_timeout(500)
                libelle = page.locator('input[name="libelle"]').first
                libelle.fill("Ressources humaines")
                for droit in ["Éditer le site et les offres de poste", "Traiter les candidatures (CV, réponses)"]:
                    page.get_by_label(droit).last.check()
                voir(page, libelle)
                prendre(page, "54b-creer-un-role", [(libelle, 1),
                                                    (page.get_by_role("button", name="Créer le rôle"), 2)])
    if voulu("55"):
        aller(page, "/portefeuille")
        regle = page.locator("details.geste-reglement", has_text="règle de dépassement").first
        if regle.count():
            regle.locator("summary").click()
            page.wait_for_timeout(300)
            voir(page, page.locator(".situations").first)
            prendre(page, "55-regle-de-depassement", [(regle.locator('input[name="delai_jours"]'), 1)])
        aller(page, f"/portefeuille/{BATIMENT}")
        grace = page.locator("details.geste-reglement", has_text="Accorder une grâce").first
        if grace.count():
            grace.locator("summary").click()
            page.wait_for_timeout(300)
            voir(page, page.locator(".situation-dossier").first)
            prendre(page, "55b-accorder-une-grace", [(grace.locator('input[name="jusqu_au"]'), 1),
                                                     (grace.locator('input[name="motif"]'), 2)])
    ctx.close()


def fiscaliste(nav) -> None:
    ctx = contexte(nav, "fiscaliste")
    page = ctx.new_page()
    if voulu("56"):
        aller(page, "/referentiel")
        valider = page.get_by_role("button", name="Valider cette version").first
        voir(page, valider.locator("xpath=ancestor::*[self::tr or @role='row' or self::li or self::div][1]"))
        page.evaluate("() => window.scrollBy(0, -160)")
        prendre(page, "56-valider-une-valeur", [(valider, 1)])
        propose = page.get_by_role("button", name="Proposer une nouvelle version").or_(page.get_by_text("Proposer une nouvelle version")).first
        voir(page, propose)
        prendre(page, "56b-proposer-une-version", [(propose, 1)])
        construire = titre(page, "Règles construites par le cabinet")
        voir(page, construire)
        prendre(page, "56c-construire-une-regle", [(page.get_by_text("Éprouver sur les factures").first, 1)])
    ctx.close()


def principal() -> int:
    SORTIE.mkdir(exist_ok=True)
    DOSSIER.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        nav = p.chromium.launch(channel=os.environ.get("CGA_NAVIGATEUR", "chrome"), args=["--lang=fr-FR"],
                                env={**os.environ, "LANGUAGE": "fr_FR", "LANG": "fr_FR.UTF-8"})
        for etape in (anonyme, comptable, reviseur, direction, clientele, caisse, administrateur, superadmin, fiscaliste):
            try:
                etape(nav)
            except Exception as souci:  # noqa: BLE001
                JOURNAL.append(f"{etape.__name__} : {str(souci).splitlines()[0][:160]}")
                print(f"  ✗ {etape.__name__} : {str(souci).splitlines()[0][:160]}")
        nav.close()
    if JOURNAL:
        print("\nÀ revoir :\n  " + "\n  ".join(JOURNAL))
    return 0


if __name__ == "__main__":
    raise SystemExit(principal())
