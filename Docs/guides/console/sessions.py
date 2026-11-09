"""Une session par profil, ouverte une fois par le vrai formulaire, puis réutilisée.

Le limiteur de la pile retient 30 connexions par tranche de cinq minutes, pour toute
la pile. Chaque profil ouvre donc UNE session ; son témoin (storage_state) est gardé
dans CGA_GUIDE_SESSIONS (par défaut `.sessions/` à côté de ce fichier, à ne jamais
versionner) et resservi tant que la console l'accepte.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from playwright.sync_api import Browser, BrowserContext

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parents[1] / "recette"))
from verifier_profils import MOT_DE_PASSE  # noqa: E402

CONSOLE = os.environ.get("CGA_CONSOLE", "http://localhost:3011")
DOSSIER = Path(os.environ.get("CGA_GUIDE_SESSIONS", ICI / ".sessions"))
FENETRE = {"width": 1440, "height": 900}

PROFILS = {
    "comptable": "l.fotso@cga-brcg.cm",
    "comptable2": "c.ndongo@cga-brcg.cm",
    "reviseur": "a.bouba@cga-brcg.cm",
    "direction": "b.mballa@cga-brcg.cm",
    "administrateur": "s.onana@cga-brcg.cm",
    "superadmin": "h.kamga@cga-brcg.cm",
    "caisse": "n.essama@cga-brcg.cm",
    "clientele": "p.moukouri@cga-brcg.cm",
    "fiscaliste": "r.ebolo@cga-brcg.cm",
}


def contexte(navigateur: Browser, profil: str | None) -> BrowserContext:
    """Un contexte connecté sous `profil` (None : visiteur anonyme)."""
    options = dict(viewport=FENETRE, locale="fr-FR", timezone_id="Africa/Douala",
                   device_scale_factor=1.5)
    if profil is None:
        return navigateur.new_context(**options)
    DOSSIER.mkdir(parents=True, exist_ok=True)
    etat = DOSSIER / f"{profil}.json"
    if etat.exists():
        ctx = navigateur.new_context(storage_state=str(etat), **options)
        page = ctx.new_page()
        page.goto(f"{CONSOLE}/fr/tableau-de-bord", wait_until="domcontentloaded")
        if "/connexion" not in page.url:
            page.close()
            return ctx
        ctx.close()
    ctx = navigateur.new_context(**options)
    page = ctx.new_page()
    page.goto(f"{CONSOLE}/fr/connexion", wait_until="networkidle")
    page.fill('input[name="courriel"]', PROFILS[profil])
    page.fill('input[name="motDePasse"]', MOT_DE_PASSE)
    page.click('button[type="submit"]')
    page.wait_for_url(lambda u: "/connexion" not in u, timeout=25_000)
    page.wait_for_load_state("networkidle")
    ctx.storage_state(path=str(etat))
    print(f"  · session ouverte : {profil} ({PROFILS[profil]})", file=sys.stderr)
    page.close()
    return ctx


def secret_totp(profil: str) -> str | None:
    fichier = DOSSIER / "totp.json"
    if fichier.exists():
        return json.loads(fichier.read_text()).get(profil)
    return None


def garder_secret(profil: str, secret: str) -> None:
    fichier = DOSSIER / "totp.json"
    donnees = json.loads(fichier.read_text()) if fichier.exists() else {}
    donnees[profil] = secret
    fichier.write_text(json.dumps(donnees))


def code_totp(secret: str) -> str:
    """RFC 6238 : SHA-1, six chiffres, trente secondes, comme le serveur."""
    import base64
    import hashlib
    import hmac
    import struct
    import time

    cle = base64.b32decode(secret.upper() + "=" * (-len(secret) % 8))
    compteur = struct.pack(">Q", int(time.time() // 30))
    h = hmac.new(cle, compteur, hashlib.sha1).digest()
    depart = h[-1] & 0x0F
    return f"{(struct.unpack('>I', h[depart:depart + 4])[0] & 0x7FFFFFFF) % 1_000_000:06d}"
