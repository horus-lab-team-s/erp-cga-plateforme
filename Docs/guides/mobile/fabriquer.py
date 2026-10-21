"""Fabrique le PDF du guide mobile : deux passes de Chrome sans tête.

La première passe donne la page de chaque chapitre (lue avec pdftotext) ; la seconde
écrit ces numéros dans le sommaire. Puis pied de page de la collection, signets et
compression (../mise_en_page.py). Usage : python3 fabriquer.py
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(ICI.parent))
from mise_en_page import Imprimante, finir  # noqa: E402

POLICES = ICI / "../../../../erp-cga-mobile/assets/polices"
SOURCE = ICI / "guide-mobile.html"
PDF = ICI / "Guide-utilisation-application-mobile-CGA.pdf"
CHAPITRES = {
    1: "Installer et se connecter",
    2: "Découvrir l'accueil",
    3: "Déposer une pièce",
    4: "Suivre vos pièces",
    5: "Échéances et paiements",
    6: "Les documents du cabinet",
    7: "Vos honoraires",
    8: "Votre déclaration annuelle (DSF)",
    9: "Votre paie",
    10: "Mon entreprise",
    11: "Questions fréquentes",
    12: "Contacts",
}


def pages_des_chapitres(pdf: Path) -> dict[int, int]:
    total = int(re.search(r"Pages:\s+(\d+)", subprocess.run(
        ["pdfinfo", str(pdf)], capture_output=True, text=True).stdout).group(1))
    trouves: dict[int, int] = {}
    for p in range(3, total + 1):  # 1 : couverture, 2 : sommaire
        texte = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-layout", str(pdf), "-"],
                               capture_output=True, text=True).stdout
        tete = " ".join(texte.split()[:12])
        for n, titre in CHAPITRES.items():
            if n not in trouves and tete.startswith(f"{n}.") and titre.split()[0] in tete:
                trouves[n] = p
    return trouves


def main() -> None:
    html = SOURCE.read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory() as tmp, Imprimante() as imprimante:
        brouillon = ICI / ".brouillon.html"
        try:
            brouillon.write_text(html, encoding="utf-8")
            premier = Path(tmp) / "premier.pdf"
            imprimante.imprimer(brouillon, premier)
            pages = pages_des_chapitres(premier)
            manquants = set(CHAPITRES) - set(pages)
            if manquants:
                raise SystemExit(f"chapitres introuvables dans le PDF : {sorted(manquants)}")
            for n, p in pages.items():
                html = html.replace(f'data-chap="{n}"></span>', f'data-chap="{n}">{p}</span>')
            brouillon.write_text(html, encoding="utf-8")
            final = Path(tmp) / "final.pdf"
            imprimante.imprimer(brouillon, final)
        finally:
            brouillon.unlink(missing_ok=True)
        total = finir(final, PDF, pied="CGA Broad Range Consulting Group · Guide de l'application mobile adhérent · v1.1",
                      polices=POLICES.resolve(),
                      signets=[(1, f"{n}. {CHAPITRES[n]}", pages[n]) for n in sorted(pages)],
                      metadonnees={"/Title": "Guide d'utilisation de l'application mobile adhérent",
                                   "/Author": "CGA Broad Range Consulting Group",
                                   "/Subject": "Version 1.1, 20 octobre 2026"})
    print(PDF, total, "pages", pages)


if __name__ == "__main__":
    main()
