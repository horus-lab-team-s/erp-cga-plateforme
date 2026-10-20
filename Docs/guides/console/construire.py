#!/usr/bin/env python3
"""Construit Guide-utilisation-console-CGA.pdf depuis guide-console.html.

    python3 Docs/guides/console/construire.py

1. Rend une première fois le HTML par Chrome sans en-tête ni pied, avec un repère
   invisible dans chaque titre de chapitre (h2) et de section (h3).
2. Lit le PDF, trouve la page de chaque repère, remplit le sommaire, rend à nouveau.
3. Ajoute le pied de page de la collection (sauf la couverture), les signets et les
   métadonnées, puis compresse (mise_en_page.py, commun aux trois guides).
"""

from __future__ import annotations

import html
import re
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader

ICI = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(ICI.parent))
from mise_en_page import Imprimante, finir  # noqa: E402

SOURCE = ICI / "guide-console.html"
SORTIE = ICI / "Guide-utilisation-console-CGA.pdf"
TITRE = re.compile(r'<h([23]) id="([a-z0-9-]+)">(.*?)</h\1>', re.S)


def repere(ident: str) -> str:
    return "ZQ" + ident.replace("-", "") + "QZ"


def rendre(imprimante: Imprimante, source_html: str, pdf: Path) -> None:
    with tempfile.NamedTemporaryFile("w", suffix=".html", dir=ICI, delete=False, encoding="utf-8") as f:
        f.write(source_html)
        temporaire = Path(f.name)
    try:
        imprimante.imprimer(temporaire, pdf)
    finally:
        temporaire.unlink()


def texte_brut(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def principal() -> int:
    source = SOURCE.read_text(encoding="utf-8")
    titres = [(int(n), ident, texte_brut(t)) for n, ident, t in TITRE.findall(source)]

    def avec_reperes(s: str) -> str:
        s = s.replace("</style>", ".mq{font-size:1px;color:#fff;letter-spacing:0}</style>", 1)
        return TITRE.sub(lambda m: f'<h{m[1]} id="{m[2]}">{m[3]}<span class="mq">{repere(m[2])}</span></h{m[1]}>', s)

    def sommaire(pages: dict[str, int]) -> str:
        lignes = []
        for niveau, ident, texte in titres:
            p = pages.get(ident, "")
            if niveau == 2:
                num = re.match(r"^(\d+)(.*)$", texte)
                n, t = (num[1], num[2].strip()) if num else ("", texte)
                lignes.append(f'<li class="chap"><span class="t"><span class="n">{n}</span>{html.escape(t)}</span><span class="p">{p}</span></li>')
            else:
                lignes.append(f'<li class="sec"><span class="t">{html.escape(texte)}</span><span class="p">{p}</span></li>')
        return "\n".join(lignes)

    def inserer(s: str, pages: dict[str, int]) -> str:
        return s.replace('<ol id="sommaire"><!-- rempli par construire.py --></ol>',
                         f'<ol id="sommaire">{sommaire(pages)}</ol>')

    with tempfile.TemporaryDirectory() as dossier, Imprimante() as imprimante:
        # Les captures entrent au PDF en JPEG : en PNG, le guide dépasse 30 Mo.
        from PIL import Image
        images = Path(dossier) / "images"
        images.mkdir()
        for png in sorted((ICI / "captures").glob("*.png")):
            im = Image.open(png).convert("RGB")
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
            im.save(images / (png.stem + ".jpg"), quality=80, optimize=True)
        source = re.sub(r'src="captures/([^"]+)\.png"', lambda m: f'src="{(images / (m[1] + ".jpg")).as_uri()}"', source)
        brouillon = Path(dossier) / "a.pdf"
        # Premier passage : sommaire à pages fictives (même largeur), pour la pagination.
        fictives = {ident: 88 for _, ident, _ in titres}
        rendre(imprimante, avec_reperes(inserer(source, fictives)), brouillon)
        pages = {}
        lecteur = PdfReader(str(brouillon))
        for i, page in enumerate(lecteur.pages):
            contenu = (page.extract_text() or "").replace(" ", "").replace("\n", "")
            for _, ident, _ in titres:
                if ident not in pages and repere(ident) in contenu:
                    pages[ident] = i + 1
        manquants = [ident for _, ident, _ in titres if ident not in pages]
        if manquants:
            print("repères introuvables :", manquants, file=sys.stderr)
        final = Path(dossier) / "b.pdf"
        rendre(imprimante, inserer(source, pages), final)
        signets = [(1, re.sub(r"^(\d+)", r"\1. ", texte), pages[ident]) if niveau == 2 else (2, texte, pages[ident])
                   for niveau, ident, texte in titres if ident in pages]
        nombre = finir(final, SORTIE, pied="CGA Broad Range Consulting Group · Guide de la console du cabinet · v1.1",
                       polices=ICI / "polices", signets=signets,
                       metadonnees={"/Title": "Guide d'utilisation de la console du cabinet",
                                    "/Author": "CGA Broad Range Consulting Group",
                                    "/Subject": "Version 1.1, 20 octobre 2026"})
    print(f"{SORTIE.name} : {nombre} pages, {SORTIE.stat().st_size // 1024} Ko")
    return 0


if __name__ == "__main__":
    raise SystemExit(principal())
