"""Outils communs aux trois guides : impression par Chrome avec césure française,
pied de page de la collection, signets, métadonnées et compression.

Utilisé par console/construire.py, vitrine/captures.py (phase « pdf ») et
mobile/fabriquer.py. La charte visuelle partagée est dans collection.css.
"""
from __future__ import annotations

import glob
import io
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

MM = 72 / 25.4
MAGENTA = "#8C2D86"
GRIS = "#6b6480"
INDIGO = "#2E1B4D"

# Chrome sans tête ne césure le français que si son profil contient le dictionnaire
# « hyphen-data » (composant téléchargé par Chrome ou livré avec Chromium de Playwright).
_DICTIONNAIRES = [
    "~/.config/google-chrome/hyphen-data/*/hyph-fr.hyb",
    "~/.config/chromium/hyphen-data/*/hyph-fr.hyb",
    "~/.cache/ms-playwright/chromium-*/chrome-linux*/hyphen-data/hyph-fr.hyb",
    "~/.cache/ms-playwright/chromium_headless_shell-*/*/hyphen-data/hyph-fr.hyb",
]


class Imprimante:
    """Un profil Chrome temporaire, avec le dictionnaire de césure français s'il existe."""

    def __init__(self) -> None:
        self._dossier = tempfile.TemporaryDirectory(prefix="guide-chrome-")
        self.profil = Path(self._dossier.name)
        self.cesure = False
        for motif in _DICTIONNAIRES:
            trouves = sorted(glob.glob(str(Path(motif).expanduser())))
            if trouves:
                cible = self.profil / "hyphen-data" / "1.0"
                cible.mkdir(parents=True)
                shutil.copy(trouves[-1], cible / "hyph-fr.hyb")
                (cible / "manifest.json").write_text(
                    '{"manifest_version": 2, "name": "hyphens-data", "version": "1.0"}', encoding="utf-8")
                self.cesure = True
                break
        if not self.cesure:
            print("avertissement : dictionnaire de césure introuvable, texte justifié sans césure",
                  file=sys.stderr)

    def imprimer(self, source: Path, cible: Path, *, budget_ms: int | None = None) -> None:
        commande = ["google-chrome", "--headless=new", f"--user-data-dir={self.profil}",
                    "--no-first-run", "--no-default-browser-check", "--no-pdf-header-footer",
                    "--disable-gpu", "--allow-file-access-from-files"]
        if budget_ms:
            commande.append(f"--virtual-time-budget={budget_ms}")
        commande += [f"--print-to-pdf={cible}", source.as_uri()]
        subprocess.run(commande, check=True, capture_output=True, timeout=600)

    def __enter__(self) -> "Imprimante":
        return self

    def __exit__(self, *_exc) -> None:
        self._dossier.cleanup()


def _polices(dossier: Path) -> None:
    if "GuideInter" not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont("GuideInter", str(dossier / "Inter-Regular.ttf")))
        pdfmetrics.registerFont(TTFont("GuideInterDemi", str(dossier / "Inter-SemiBold.ttf")))


def _pied(largeur: float, hauteur: float, texte: str, numero: int, total: int) -> PdfReader:
    tampon = io.BytesIO()
    c = canvas.Canvas(tampon, pagesize=(largeur, hauteur))
    gauche, droite = 17 * MM, largeur - 17 * MM
    c.setStrokeColor(HexColor(MAGENTA))
    c.setLineWidth(.6)
    c.line(gauche, 12.6 * MM, droite, 12.6 * MM)
    c.setFillColor(HexColor(GRIS))
    c.setFont("GuideInter", 7.4)
    c.drawString(gauche, 8.4 * MM, texte)
    c.setFont("GuideInterDemi", 7.8)
    c.setFillColor(HexColor(MAGENTA))
    total_txt = f" / {total}"
    c.drawRightString(droite, 8.4 * MM, str(numero) + total_txt)
    c.save()
    tampon.seek(0)
    return PdfReader(tampon)


def finir(brut: Path, sortie: Path, *, pied: str, polices: Path, metadonnees: dict[str, str],
          signets: list[tuple[int, str, int]]) -> int:
    """Compresse le rendu de Chrome, puis ajoute le pied de page (sauf couverture), les
    signets et les métadonnées. Le pied vient après Ghostscript : passé avant, Ghostscript
    perd la correspondance Unicode de la police du pied (les accents ne se copient plus).

    signets : (niveau 1 ou 2, titre, page numérotée à partir de 1).
    Rend le nombre de pages.
    """
    _polices(polices)
    compresse = sortie.with_name("." + sortie.stem + ".gs.pdf")
    compresser(brut, compresse)
    lecteur = PdfReader(str(compresse))
    total = len(lecteur.pages)
    ecrivain = PdfWriter()
    for i, page in enumerate(lecteur.pages):
        if i > 0:
            page.merge_page(_pied(float(page.mediabox.width), float(page.mediabox.height), pied, i + 1, total).pages[0])
        ecrivain.add_page(page)
    for page in ecrivain.pages:  # la fusion du pied laisse les contenus décompressés
        page.compress_content_streams()
    ecrivain.compress_identical_objects(remove_identicals=True, remove_orphans=True)
    parent = None
    for niveau, titre, page in signets:
        if niveau == 1:
            parent = ecrivain.add_outline_item(titre, page - 1)
        else:
            ecrivain.add_outline_item(titre, page - 1, parent=parent)
    ecrivain.add_metadata(metadonnees)
    ecrivain.page_mode = "/UseOutlines"
    with open(sortie, "wb") as f:
        ecrivain.write(f)
    compresse.unlink(missing_ok=True)
    return total


def compresser(source: Path, cible: Path) -> None:
    """Ghostscript, réglage « printer » et images à 200 ppp. Garde le PDF de Chrome tel quel
    si Ghostscript manque, échoue ou ne fait pas gagner de place."""
    try:
        subprocess.run(["gs", "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sDEVICE=pdfwrite",
                        "-dCompatibilityLevel=1.6", "-dPDFSETTINGS=/printer",
                        "-dDownsampleColorImages=true", "-dColorImageDownsampleType=/Bicubic",
                        "-dColorImageResolution=200", "-dGrayImageResolution=200",
                        f"-sOutputFile={cible}", str(source)], check=True, capture_output=True, timeout=900)
        if cible.stat().st_size < source.stat().st_size:
            return
    except (OSError, subprocess.SubprocessError) as erreur:
        print(f"avertissement : compression impossible ({erreur})", file=sys.stderr)
    shutil.copy(source, cible)
