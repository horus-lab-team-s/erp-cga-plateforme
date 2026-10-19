#!/usr/bin/env python3
"""Captures du guide « Site et espace adhérent », prises contre la pile de démonstration.

    python3 Docs/guides/vitrine/captures.py public        # site public (sans compte)
    python3 Docs/guides/vitrine/captures.py adherent      # espace adhérent (1 connexion)
    python3 Docs/guides/vitrine/captures.py creation      # demande, proposition, compte, suivi
    python3 Docs/guides/vitrine/captures.py souscription  # devis en ligne

Adresses par défaut : vitrine http://localhost:3012, console http://localhost:3011
(surchargeables par GUIDE_VITRINE et GUIDE_CONSOLE).

⚠️ LIMITEUR : 30 connexions par 5 minutes pour toute la pile. La phase « adherent »
ouvre UNE session et la garde dans `.etat-adherent.json` (supprimez ce fichier pour
en forcer une nouvelle). La phase « creation » ouvre trois sessions (chargée de
clientèle, caisse, nouvelle cliente). Ne lancez pas les phases en boucle.

⚠️ La phase « creation » dépose une demande FICTIVE (EXEMPLE Awa) et la fait avancer
côté cabinet comme dans `outils/tournage/flux-4-compte-et-suivi.mjs`. Elle se lance
une fois par pile neuve : relancée, elle crée une seconde demande du même nom.
Aucun paiement mobile money n'est déclenché ; le règlement est constaté au guichet.
"""

from __future__ import annotations

import os
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

ICI = Path(__file__).resolve().parent
SORTIE = ICI / "captures"
ETAT_ADHERENT = ICI / ".etat-adherent.json"
VITRINE = os.environ.get("GUIDE_VITRINE", "http://localhost:3012")
CONSOLE = os.environ.get("GUIDE_CONSOLE", "http://localhost:3011")
API = os.environ.get("GUIDE_API", "http://localhost:8010")
SECRET_DEMO = "cabinet brcg douala 2026"
ADHERENT = "jp.nkoa@batimentplus.cm"
CLIENTELE = "p.moukouri@cga-brcg.cm"
CAISSE = "n.essama@cga-brcg.cm"

BUREAU = {"width": 1440, "height": 900}
TELEPHONE = {"width": 390, "height": 844}

CLIENTE = {
    "nom": "EXEMPLE Awa",
    "telephone": "677000001",
    "courriel": "awa.exemple@exemple.cm",
    "mot_de_passe": "Exemple-Guide-Douala-2026",
}
PROJET = [
    ("denomination_souhaitee", "EXEMPLE BOUTIQUE SARL", None),
    ("associes", "2", None),
    ("capital_social", "1000000", None),
    ("apports_en_nature", "non", "select"),
    ("chiffre_affaires_prevu", "MOINS_10M", "select"),
    ("salaries_prevus", "1", None),
    ("region_siege", "LITTORAL", "select"),
    ("siege", "Akwa, Douala"),
    ("activite", "Vente de vêtements"),
]

journal: list[str] = []


def note(texte: str) -> None:
    print(texte)
    journal.append(texte)


def calme(page: Page, ms: int = 600) -> None:
    try:
        page.wait_for_load_state("networkidle", timeout=15_000)
    except Exception:  # noqa: BLE001
        pass
    page.wait_for_timeout(ms)


def fermer_bandeaux(page: Page) -> None:
    for sel in (".annonce__fermer", "button:has-text('Tout accepter')", "button:has-text('Accepter')"):
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=500):
                loc.click(timeout=1500)
        except Exception:  # noqa: BLE001
            pass


def aller(page: Page, url: str) -> None:
    page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    calme(page, 900)
    fermer_bandeaux(page)


def photo(page: Page, nom: str, *, plein: bool = False) -> None:
    cible = SORTIE / f"{nom}.png"
    page.screenshot(path=str(cible), full_page=plein)
    note(f"  ✓ {nom}.png")


def recadrer(nom: str, cadre: tuple[int, int, int, int]) -> None:
    """Recadre une capture en points CSS (x0, y0, x1, y1), quelle que soit sa densité."""
    from PIL import Image

    chemin = SORTIE / f"{nom}.png"
    im = Image.open(chemin)
    echelle = im.width / 1440 if im.width >= 1440 else im.width / 390
    x0, y0, x1, y1 = (round(v * echelle) for v in cadre)
    im.crop((x0, y0, min(x1, im.width), min(y1, im.height))).save(chemin)


def photo_de(page: Page, selecteur: str, nom: str, *, marge_haut: int = 24, hauteur: int | None = None,
             marge_cote: int | None = None) -> None:
    """Photographie la page entière, puis la recadre sur l'élément.

    Prise depuis le haut de la page : l'en-tête fixe reste en haut et ne recouvre
    pas l'élément, comme il le ferait dans une capture de fenêtre défilée.
    """
    try:
        # La barre d'onglets fixe de l'espace adhérent se poserait au milieu du recadrage.
        page.add_style_tag(content=".adherent__onglets{visibility:hidden !important}")
        loc = page.locator(selecteur).first
        loc.scroll_into_view_if_needed(timeout=8000)
        page.wait_for_timeout(500)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(500)
        boite = loc.bounding_box()
        page.screenshot(path=str(SORTIE / f"{nom}.png"), full_page=True)
        largeur = page.viewport_size["width"]
        y0 = max(0, boite["y"] - marge_haut)
        y1 = boite["y"] + (hauteur if hauteur else boite["height"] + 24)
        if marge_cote is None:
            x0, x1 = 0, largeur
        else:
            x0, x1 = max(0, boite["x"] - marge_cote), min(largeur, boite["x"] + boite["width"] + marge_cote)
        recadrer(nom, (int(x0), int(y0), int(x1), int(y1)))
        note(f"  ✓ {nom}.png")
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ {nom} ({selecteur}) : {str(e)[:120]}")


def connecter(page: Page, courriel: str, secret: str = SECRET_DEMO) -> bool:
    aller(page, f"{CONSOLE}/fr/connexion")
    page.wait_for_timeout(1200)
    page.fill('input[name="courriel"]', courriel)
    page.fill('input[name="motDePasse"]', secret)
    page.click('button[type="submit"]')
    try:
        page.wait_for_url(lambda u: "connexion" not in u, timeout=25_000)
    except Exception:  # noqa: BLE001
        note(f"  ✗ connexion refusée pour {courriel} : {page.inner_text('body')[:300]!r}")
        return False
    calme(page)
    return True


# ── Phase 1 : le site public ─────────────────────────────────────────────────────
def phase_public(nav) -> None:
    ctx = nav.new_context(viewport=BUREAU, locale="fr-FR")
    p = ctx.new_page()
    aller(p, f"{VITRINE}/fr")
    photo(p, "p01-accueil")
    photo_de(p, "section.section:has-text('Nos services')", "p02-services")
    photo_de(p, "section:has-text('Trois étapes')", "p03-trois-etapes")
    aller(p, f"{VITRINE}/fr/creer-mon-entreprise")
    photo(p, "p04-creer-entete")
    photo_de(p, "section:has-text('Les pièces du dossier')", "p05-pieces-a-fournir")
    aller(p, f"{VITRINE}/fr/devenir-adherent")
    photo(p, "p06-adherent-entete")
    photo_de(p, "#formules", "p07-formules")
    aller(p, f"{VITRINE}/fr/estimation")
    photo_de(p, "section.section", "p08-estimation", hauteur=900)
    try:
        with p.expect_navigation(timeout=15_000):
            p.click("a:has-text('Télécharger le devis')")
        calme(p)
        photo(p, "p09-devis-estimatif")
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ devis estimatif : {str(e)[:120]}")
    aller(p, f"{VITRINE}/fr/blog")
    photo(p, "p10-blog")
    try:
        p.locator("a[href*='/blog/']").first.click()
        calme(p, 1000)
        photo(p, "p11-article")
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ article : {str(e)[:120]}")
    aller(p, f"{VITRINE}/fr/contact")
    photo(p, "p12-contact")
    photo_de(p, "section.section--teinte", "p13-contact-formulaire")
    aller(p, f"{VITRINE}/fr/formations")
    photo(p, "p14-formations")
    aller(p, f"{CONSOLE}/fr/connexion")
    photo(p, "a01-connexion")
    aller(p, f"{CONSOLE}/fr/mot-de-passe-oublie")
    photo(p, "a02-mot-de-passe-oublie")
    ctx.close()

    # Sur téléphone
    ctx = nav.new_context(viewport=TELEPHONE, locale="fr-FR", device_scale_factor=2, is_mobile=True, has_touch=True)
    p = ctx.new_page()
    aller(p, f"{VITRINE}/fr")
    photo(p, "m01-accueil")
    try:
        p.locator("button[aria-label*='enu'], .entete__burger, button.burger, button[aria-controls]").first.click(timeout=4000)
        p.wait_for_timeout(800)
        photo(p, "m02-menu")
        p.keyboard.press("Escape")
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ menu mobile : {str(e)[:120]}")
    aller(p, f"{VITRINE}/fr/estimation")
    photo_de(p, "section.section", "m03-estimation", hauteur=800)
    aller(p, f"{VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande")
    photo_de(p, "#demande", "m04-demande", hauteur=800)
    aller(p, f"{CONSOLE}/fr/connexion")
    photo(p, "m05-connexion")
    ctx.close()


# ── Phase 2 : l'espace adhérent ─────────────────────────────────────────────────
def contexte_adherent(nav, fenetre, **opts):
    if ETAT_ADHERENT.exists():
        ctx = nav.new_context(viewport=fenetre, locale="fr-FR", storage_state=str(ETAT_ADHERENT), **opts)
        p = ctx.new_page()
        aller(p, f"{CONSOLE}/fr/mon-espace")
        if "connexion" not in p.url:
            return ctx, p
        ctx.close()
    ctx = nav.new_context(viewport=fenetre, locale="fr-FR", **opts)
    p = ctx.new_page()
    if not connecter(p, ADHERENT):
        raise SystemExit("Connexion de l'adhérent refusée : voir le message ci-dessus.")
    ctx.storage_state(path=str(ETAT_ADHERENT))
    return ctx, p


def phase_adherent(nav) -> None:
    ctx, p = contexte_adherent(nav, BUREAU)
    aller(p, f"{CONSOLE}/fr/mon-espace")
    photo(p, "a03-accueil-espace")
    photo_de(p, "section:has-text('Ce qu’on attend de vous')", "a04-attendu", hauteur=760, marge_cote=24)
    photo_de(p, "section:has(h2:has-text('Envoyer un justificatif'))", "a05-envoyer-justificatif", hauteur=420, marge_cote=24)
    photo_de(p, "section:has-text('Mes derniers envois')", "a06-derniers-envois", hauteur=620, marge_cote=24)
    aller(p, f"{CONSOLE}/fr/mon-espace/justificatifs")
    photo(p, "a07-justificatifs")
    aller(p, f"{CONSOLE}/fr/mon-espace/echeances")
    photo(p, "a08-echeances")
    try:
        p.locator(".adherent__echeances li[data-etat='EN_RETARD'] a").first.click()
        calme(p, 900)
        photo(p, "a09-echeance-detail")
        photo_de(p, "section:has-text('Vous avez réglé')", "a10-envoyer-quittance", hauteur=520, marge_cote=24)
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ fiche d'échéance : {str(e)[:120]}")
    aller(p, f"{CONSOLE}/fr/mon-espace/honoraires")
    photo(p, "a11-honoraires")
    try:
        p.locator("button.honoraires__payer").first.click()
        p.wait_for_timeout(700)
        p.locator(".honoraires__formulaire").first.scroll_into_view_if_needed()
        p.evaluate("window.scrollBy(0, -260)")
        p.wait_for_timeout(400)
        photo(p, "a12-payer-mobile-money")
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ formulaire mobile money : {str(e)[:120]}")
    aller(p, f"{CONSOLE}/fr/mon-espace/honoraires")
    photo_de(p, "section:has(h2:has-text('Échéancier'))", "a13-echeancier-honoraires", hauteur=760, marge_cote=24)
    aller(p, f"{CONSOLE}/fr/mon-espace/documents")
    photo(p, "a14-documents")
    aller(p, f"{CONSOLE}/fr/mon-espace/dsf")
    photo(p, "a15-dsf")
    aller(p, f"{CONSOLE}/fr/mon-espace/paie")
    photo(p, "a16-paie")
    aller(p, f"{CONSOLE}/fr/mon-espace/entreprise")
    photo(p, "a17-entreprise")
    photo_de(p, "section:has-text('Signaler un changement')", "a18-signaler-changement", hauteur=640, marge_cote=24)
    photo_de(p, "section:has-text('Fiche de votre déclaration annuelle')", "a19-fiche-dsf", hauteur=820, marge_cote=24)
    aller(p, f"{CONSOLE}/fr/mon-espace/reglages")
    photo(p, "a20-reglages")
    ctx.storage_state(path=str(ETAT_ADHERENT))
    ctx.close()
    # L'espace adhérent tient dans une colonne centrale : on retire les marges vides.
    from PIL import Image

    for chemin in sorted(SORTIE.glob("a*.png")):
        if chemin.name[:3] in ("a01", "a02") or Image.open(chemin).width != 1440:
            continue
        recadrer(chemin.stem, (352, 0, 1088, 100_000))

    ctx, p = contexte_adherent(nav, TELEPHONE, device_scale_factor=2, is_mobile=True, has_touch=True)
    aller(p, f"{CONSOLE}/fr/mon-espace")
    photo(p, "m06-espace")
    aller(p, f"{CONSOLE}/fr/mon-espace/honoraires")
    photo(p, "m07-honoraires")
    aller(p, f"{CONSOLE}/fr/mon-espace/echeances")
    photo(p, "m08-echeances")
    ctx.close()


# ── Phase 3 : la création, du côté du client ────────────────────────────────────
def contexte_compte(nav, courriel: str, secret: str, fichier: Path, fenetre=BUREAU, essai: str = "/fr", **opts):
    """Une session par compte, gardée sur disque : le limiteur est partagé par toute la pile."""
    if fichier.exists():
        ctx = nav.new_context(viewport=fenetre, locale="fr-FR", storage_state=str(fichier), **opts)
        p = ctx.new_page()
        aller(p, f"{CONSOLE}{essai}")
        if "connexion" not in p.url:
            return ctx, p
        ctx.close()
    ctx = nav.new_context(viewport=fenetre, locale="fr-FR", **opts)
    p = ctx.new_page()
    if not connecter(p, courriel, secret):
        ctx.close()
        return None, None
    ctx.storage_state(path=str(fichier))
    return ctx, p


def courriels_retenus(code: str) -> list[dict]:
    """La boîte de recette de l'API (mode démonstration), lue gabarit par gabarit.

    ⚠️ Sans filtre, la route rend 500 dès qu'un courriel « proforma.envoi.detaillee »
    est retenu (constaté le 19 octobre 2026) : on interroge donc code par code.
    """
    import json
    import urllib.request

    try:
        with urllib.request.urlopen(f"{API}/transverse/courriels?code={code}", timeout=10) as r:
            return json.loads(r.read())
    except Exception as e:  # noqa: BLE001
        note(f"  (boîte de recette, {code} : {e})")
        return []


def dossier_de_la_cliente(q: Page) -> bool:
    for _ in range(20):
        aller(q, f"{CONSOLE}/fr/acquisition")
        lien = q.locator(f"a:has-text('{CLIENTE['nom']}')")
        if lien.count():
            lien.first.click()
            calme(q, 1200)
            return True
        time.sleep(3)
    return False


def phase_creation(nav) -> None:
    """Demande déposée sur le site, puis qualification et proposition côté cabinet."""
    ctx = nav.new_context(viewport=BUREAU, locale="fr-FR")
    p = ctx.new_page()
    aller(p, f"{VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande")
    p.locator("#demande").scroll_into_view_if_needed()
    p.fill("#demande-nom", CLIENTE["nom"])
    p.fill("#demande-tel", CLIENTE["telephone"])
    p.fill("#demande-courriel", CLIENTE["courriel"])
    photo_de(p, "#demande", "c01-demande-coordonnees", hauteur=640, marge_cote=40)
    for code, valeur, *genre in PROJET:
        champ = f"#declaration-{code}"
        try:
            if genre and genre[0] == "select":
                p.select_option(champ, valeur)
            else:
                p.fill(champ, valeur)
        except Exception as e:  # noqa: BLE001
            note(f"  (champ {code} non rempli : {str(e)[:60]})")
    photo_de(p, ".formulaire-service__projet", "c02-demande-projet", marge_cote=40)
    p.locator('.formulaire-service__consentement input[type="checkbox"]').first.check()
    photo_de(p, ".formulaire-service__consentement", "c03-demande-envoi", hauteur=150, marge_cote=40)
    p.click('.formulaire-service button[type="submit"]')
    calme(p, 2500)
    photo_de(p, '.formulaire-service button[type="submit"]', "c04-demande-confirmee", hauteur=150)
    ctx.close()

    # Côté cabinet (hors champ du guide) : qualification et émission de la proposition.
    cab, q = contexte_compte(nav, CLIENTELE, SECRET_DEMO, ICI / ".etat-clientele.json")
    if not q or not dossier_de_la_cliente(q):
        note("  ✗ dossier de la cliente introuvable côté cabinet")
        return
    q.fill('input[name="commentaire"]', "Cliente jointe : projet confirmé (démonstration du guide).")
    q.click('form:has(input[name="commentaire"]) button[type="submit"]')
    calme(q, 900)
    q.click('form:has([name^="q_"]) button[type="submit"]')
    calme(q, 900)
    q.click('form:has([name="score_charge"]) button[type="submit"]')
    calme(q, 1200)
    q.fill('form.emission input[name="motif"]', "Formule proposée d'après la forme juridique.")
    q.click('form.emission button[type="submit"]')
    calme(q, 2500)
    cab.storage_state(path=str(ICI / ".etat-clientele.json"))
    cab.close()


def phase_creation_suite(nav) -> None:
    """Chez la cliente : proposition, accord, règlement au guichet, compte, suivi."""
    # Le lien de la proposition ne se lit dans la fiche du cabinet que tant qu'elle n'est
    # pas réglée : on le garde à côté du script pour les reprises.
    garde = ICI / ".lien-proposition.txt"
    if garde.exists():
        lien = garde.read_text().strip()
    else:
        cab, q = contexte_compte(nav, CLIENTELE, SECRET_DEMO, ICI / ".etat-clientele.json")
        if not q or not dossier_de_la_cliente(q):
            note("  ✗ dossier de la cliente introuvable côté cabinet")
            return
        trouves = re.findall(r'https?://[^"\s<]*/proforma/[^"\s<]*', q.content())
        cab.close()
        if not trouves:
            note("  ✗ aucune proposition émise pour la cliente")
            return
        lien = trouves[0].replace("&amp;", "&")
        garde.write_text(lien)
    numero = re.search(r"/proforma/([^/?]+)", lien).group(1)
    note(f"  proposition {numero}")

    ctx = nav.new_context(viewport=BUREAU, locale="fr-FR")
    p = ctx.new_page()
    aller(p, lien)
    photo(p, "c05-proposition")
    photo_de(p, ".proforma__detail", "c06-proposition-detail", marge_cote=60)
    if p.locator('input[name="identite_declaree"]').count():
        p.fill('input[name="identite_declaree"]', "EXEMPLE Awa, gérante")
        p.check('input[name="engagement"]')
        photo_de(p, 'input[name="identite_declaree"]', "c07-accord", marge_haut=60, hauteur=220, marge_cote=60)
        p.click("button.proforma__valider")
        calme(p, 2500)
    photo_de(p, "#paiement", "c08-regler-proposition", marge_cote=60)

    # Au guichet (hors champ) : la caisse constate le versement de CETTE proposition.
    deja = [m for c in ("creation.dossier_ouvert_avec_compte", "creation.dossier_ouvert")
            for m in courriels_retenus(c) if m["destinataire"] == CLIENTE["courriel"]]
    if not deja:
        caisse, r = contexte_compte(nav, CAISSE, SECRET_DEMO, ICI / ".etat-caisse.json")
        if not r:
            return
        aller(r, f"{CONSOLE}/fr/caisse")
        # ⚠️ Jamais de repli sur « la première ligne » : ce serait constater le règlement d'un autre.
        ligne = r.locator(f"li.caisse__ligne:has-text('{numero}')").filter(has=r.locator("form.caisse__constat"))
        if not ligne.count():
            note(f"  ✗ caisse : aucune ligne à constater pour {numero}")
        else:
            forme = ligne.first.locator("form.caisse__constat")
            forme.locator('input[name="reference_externe"]').fill("Reçu de caisse n° GUIDE-0001")
            if forme.locator('input[name="rapproche"]').count():
                forme.locator('input[name="rapproche"]').check()
            forme.locator("button").first.click()
            calme(r, 3000)
        caisse.close()

    jeton, suivi = None, None
    for _ in range(20):
        for code in ("compte.activation_creation", "creation.dossier_ouvert_avec_compte", "creation.dossier_ouvert"):
            for m in courriels_retenus(code):
                if m["destinataire"] != CLIENTE["courriel"]:
                    continue
                texte = str(m["contexte"])
                jeton = jeton or (re.search(r"jeton=([A-Za-z0-9_\-\.]+)", texte) or [None, None])[1]
                jeton = jeton or m["contexte"].get("jeton")
                trouve = re.search(r"/mon-dossier/([^\s'\"?]+)\?s=([0-9a-f]+)", texte)
                if trouve:
                    suivi = f"{VITRINE}/fr/mon-dossier/{trouve.group(1)}?s={trouve.group(2)}"
        if jeton and suivi:
            break
        time.sleep(3)
    note(f"  jeton : {'oui' if jeton else 'non'} · suivi : {'oui' if suivi else 'non'}")
    aller(p, lien)
    photo_de(p, "#paiement, .proforma__carte:last-of-type", "c08b-proposition-reglee", marge_cote=60)

    if suivi:
        aller(p, suivi)
        photo(p, "c09-suivi-sans-compte")
        tel = nav.new_context(viewport=TELEPHONE, locale="fr-FR", device_scale_factor=2, is_mobile=True, has_touch=True)
        t = tel.new_page()
        aller(t, suivi)
        photo(t, "m09-suivi-telephone")
        tel.close()

    etat_cliente = ICI / ".etat-cliente.json"
    if jeton and not etat_cliente.exists():
        aller(p, f"{CONSOLE}/fr/activation?jeton={jeton}&parcours=creation")
        photo(p, "c10-choisir-mot-de-passe")
        p.fill('input[name="motDePasse"]', CLIENTE["mot_de_passe"])
        p.fill('input[name="confirmation"]', CLIENTE["mot_de_passe"])
        p.click('button[type="submit"]')
        calme(p, 2500)
        note(f"  après activation : {p.url}")
    ctx.close()

    ctx, p = contexte_compte(nav, CLIENTE["courriel"], CLIENTE["mot_de_passe"], etat_cliente, essai="/fr/ma-creation")
    if not p:
        return
    aller(p, f"{CONSOLE}/fr/ma-creation")
    photo(p, "c11-ma-creation")
    photo(p, "c11b-ma-creation-plein", plein=True)
    from PIL import Image, ImageDraw

    piece = ICI / ".specimen-piece.jpg"
    image = Image.new("RGB", (900, 600), "#F4F2F9")
    dessin = ImageDraw.Draw(image)
    dessin.rectangle((30, 30, 870, 570), outline="#2E1B4D", width=6)
    dessin.text((80, 260), "SPECIMEN : document fictif du guide d'utilisation", fill="#8C2D86")
    image.save(piece, quality=90)
    try:
        premier = p.locator(".creation__piece").first
        premier.locator('input[type="file"]').set_input_files(str(piece))
        photo_de(p, ".creation__piece", "c12-envoyer-piece", marge_cote=40)
        premier.locator("button.creation__envoyer").click()
        calme(p, 2500)
        p.reload()
        calme(p, 1200)
        photo_de(p, ".creation__progression", "c13-piece-recue", hauteur=640, marge_cote=40)
    except Exception as e:  # noqa: BLE001
        note(f"  ✗ dépôt de pièce : {str(e)[:120]}")
    finally:
        piece.unlink(missing_ok=True)
    ctx.storage_state(path=str(etat_cliente))
    ctx.close()


def phase_confirmation(nav) -> None:
    """Une seconde demande, minimale, pour photographier le message de confirmation."""
    ctx = nav.new_context(viewport=BUREAU, locale="fr-FR")
    p = ctx.new_page()
    aller(p, f"{VITRINE}/fr/creer-mon-entreprise?forme=SARL#demande")
    p.fill("#demande-nom", "EXEMPLE Paul")
    p.fill("#demande-tel", "677000003")
    p.locator('.formulaire-service__consentement input[type="checkbox"]').first.check()
    p.click('.formulaire-service button[type="submit"]')
    calme(p, 3000)
    statut = p.locator(".formulaire-service [role='status'], .formulaire-service [role='alert']")
    note("  message : " + (statut.first.inner_text() if statut.count() else p.locator(".formulaire-service").inner_text()[-400:]).replace("\n", " | "))
    photo_de(p, ".formulaire-service button[type='submit']", "c04-demande-confirmee", marge_haut=30, hauteur=150)
    ctx.close()


# ── Phase 4 : souscrire en ligne ─────────────────────────────────────────────────
def phase_souscription(nav) -> None:
    ctx = nav.new_context(viewport=BUREAU, locale="fr-FR")
    p = ctx.new_page()
    aller(p, f"{VITRINE}/fr/souscrire")
    photo(p, "s01-souscrire")
    champs = {
        "prenom": "Awa", "nom": "EXEMPLE", "courriel": "souscription.exemple@exemple.cm",
        "telephone": "677000002", "denomination": "EXEMPLE SERVICES SARL",
        "chiffre_affaires": "30000000", "niu": "M000000000001X",
    }
    for nom, valeur in champs.items():
        loc = p.locator(f"form:has(input[name='prenom']) input[name='{nom}']")
        if loc.count():
            try:
                loc.first.fill(valeur)
            except Exception:  # noqa: BLE001
                pass
    photo_de(p, "form:has(input[name='prenom'])", "s02-souscrire-formulaire", marge_cote=40)
    p.click("form:has(input[name='prenom']) button[type='submit']")
    try:
        p.wait_for_url(re.compile(r"/souscrire/devis/"), timeout=20_000)
    except Exception:  # noqa: BLE001
        note("  ✗ pas de devis : " + p.inner_text("main")[:400].replace("\n", " | "))
    calme(p, 1200)
    photo(p, "s03-devis-en-ligne")
    p.mouse.wheel(0, 600)
    p.wait_for_timeout(600)
    photo(p, "s04-devis-suite")
    note("  devis : " + p.url + " :: " + p.inner_text("main")[:500].replace("\n", " | "))
    ctx.close()



# ── Phase 5 : le PDF ─────────────────────────────────────────────────────────────
PDF = ICI / "Guide-utilisation-site-et-espace-adherent-CGA.pdf"


def imprimer(source: Path, cible: Path) -> None:
    import subprocess

    subprocess.run(
        ["google-chrome", "--headless=new", "--no-pdf-header-footer", "--disable-gpu",
         "--virtual-time-budget=8000", f"--print-to-pdf={cible}", source.as_uri()],
        check=True, capture_output=True,
    )


def phase_pdf(_nav=None) -> None:
    """Deux passes : la première situe chaque chapitre, la seconde numérote le sommaire."""
    import html as h
    import subprocess

    source = ICI / "guide-vitrine.html"
    texte = source.read_text(encoding="utf-8")
    brouillon = ICI / ".brouillon.pdf"
    imprimer(source, brouillon)
    pages = int(re.search(r"Pages:\s+(\d+)", subprocess.run(
        ["pdfinfo", str(brouillon)], capture_output=True, text=True).stdout).group(1))
    contenus = [subprocess.run(["pdftotext", "-layout", "-f", str(i), "-l", str(i), str(brouillon), "-"],
                               capture_output=True, text=True).stdout for i in range(1, pages + 1)]
    numeros = {}
    for cible, titre in re.findall(r'<a href="#([^"]+)">([^<]+)</a>', texte):
        titre = " ".join(h.unescape(titre).split())
        for i, contenu in enumerate(contenus[2:], start=3):  # après la couverture et le sommaire
            if titre[:38] in " ".join(contenu.split()):
                numeros[cible] = i
                break
    manquants = [c for c in re.findall(r'data-cible="([^"]+)"', texte) if c not in numeros]
    if manquants:
        note(f"  ⚠️ chapitres non situés : {manquants}")
    numerote = re.sub(r'data-cible="([^"]+)"></span>',
                      lambda m: f'data-cible="{m.group(1)}">{numeros.get(m.group(1), "")}</span>', texte)
    temporaire = ICI / ".guide-numerote.html"
    temporaire.write_text(numerote, encoding="utf-8")
    imprimer(temporaire, PDF)
    temporaire.unlink()
    brouillon.unlink()
    note(f"  ✓ {PDF.name} : {pages} pages")


PHASES = {"public": phase_public, "adherent": phase_adherent, "creation": phase_creation, "creation-suite": phase_creation_suite,
          "confirmation": phase_confirmation, "pdf": phase_pdf,
          "souscription": phase_souscription}

if __name__ == "__main__":
    demandees = sys.argv[1:] or ["public", "adherent"]
    SORTIE.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pilote:
        nav = pilote.chromium.launch()
        for nom in demandees:
            note(f"── {nom}")
            PHASES[nom](nav)
        nav.close()
