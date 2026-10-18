"""Piloter l'application mobile sur un téléphone ou un émulateur, par adb.

Toucher par texte (l'arbre d'accessibilité), saisir, faire défiler, et filmer l'écran
avec `screenrecord`, en notant l'instant de chaque légende pour le studio.
"""
from __future__ import annotations

import json
import re
import signal
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

ADB = str(Path.home() / "Android/Sdk/platform-tools/adb")


def adb(*a: str, octets: bool = False):
    r = subprocess.run([ADB, *a], capture_output=True)
    return r.stdout if octets else r.stdout.decode(errors="replace")


def elements():
    # ⚠️ Un vidage peut revenir vide pendant une animation : on le redemande.
    for _ in range(5):
        adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        xml = adb("shell", "cat", "/sdcard/ui.xml")
        if "<?xml" in xml and "</hierarchy>" in xml:
            break
        time.sleep(0.8)
    else:
        return []
    racine = ET.fromstring(xml[xml.find("<?xml"):])
    out = []
    # ⚠️ Un émulateur à court de mémoire affiche « … ne répond pas » : on attend.
    if "ne répond pas" in xml or "isn't responding" in xml:
        for n in racine.iter("node"):
            if (n.get("text") or "") in ("Attendre", "Wait"):
                b = list(map(int, re.findall(r"\d+", n.get("bounds", ""))))
                adb("shell", "input", "tap", str((b[0] + b[2]) // 2), str((b[1] + b[3]) // 2))
                time.sleep(1.5)
                return elements()
    for n in racine.iter("node"):
        t = (n.get("text") or n.get("content-desc") or "").strip()
        b = list(map(int, re.findall(r"\d+", n.get("bounds", ""))))
        if len(b) == 4:
            out.append((t, (b[0] + b[2]) // 2, (b[1] + b[3]) // 2, n.get("class", ""), b))
    return out


def attendre(texte: str, delai: float = 20) -> tuple | None:
    fin = time.time() + delai
    while time.time() < fin:
        for e in elements():
            if texte.lower() in e[0].lower():
                return e
        time.sleep(0.7)
    return None


def toucher(texte: str, n: int = 0, delai: float = 20, pause: float = 1.2) -> bool:
    fin = time.time() + delai
    while time.time() < fin:
        trouves = [e for e in elements() if texte.lower() in e[0].lower()]
        if len(trouves) > n:
            _, x, y, _, _ = trouves[n]
            adb("shell", "input", "tap", str(x), str(y))
            time.sleep(pause)
            return True
        time.sleep(0.7)
    raise RuntimeError(f"introuvable : {texte}")


def onglet(nom: str, pause: float = 2.0):
    """Un onglet de la barre du bas, par son nom EXACT : « Plus » se confondait avec
    « SARL BATIMENT PLUS »."""
    fin = time.time() + 20
    while time.time() < fin:
        for e in elements():
            if e[0] == nom and e[2] > 2000:
                adb("shell", "input", "tap", str(e[1]), str(e[2]))
                time.sleep(pause)
                return
        time.sleep(0.7)
    raise RuntimeError(f"onglet introuvable : {nom}")


def tap(x: int, y: int, pause: float = 1.0):
    adb("shell", "input", "tap", str(x), str(y))
    time.sleep(pause)


def champs():
    return [e for e in elements() if e[3] == "android.widget.EditText"]


def saisir(texte: str):
    for morceau in re.split(r"( )", texte):
        if morceau == " ":
            adb("shell", "input", "keyevent", "KEYCODE_SPACE")
        elif morceau:
            adb("shell", "input", "text", morceau.replace("'", "\\'"))


def glisser(de: int = 1700, a: int = 900, duree: int = 600, pause: float = 1.2):
    adb("shell", "input", "swipe", "540", str(de), "540", str(a), str(duree))
    time.sleep(pause)


def retour(pause: float = 1.2):
    adb("shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(pause)


def relancer(paquet: str = "cm.cgabrcg.cga_mobile"):
    adb("shell", "pm", "clear", paquet)
    adb("reverse", "tcp:8010", "tcp:8010")
    adb("reverse", "tcp:3012", "tcp:3012")
    adb("shell", "monkey", "-p", paquet, "-c", "android.intent.category.LAUNCHER", "1")
    attendre("Se connecter", 90)


def se_connecter(courriel: str, mot_de_passe: str = "cabinet brcg douala 2026"):
    toucher("Se connecter")
    attendre("Accéder à votre dossier")
    # Le clavier remonte l'écran : la place du second champ change. On y passe par TAB.
    premier = champs()[0]
    tap(premier[1], premier[2], 0.5)
    saisir(courriel)
    adb("shell", "input", "keyevent", "KEYCODE_TAB")
    time.sleep(0.4)
    saisir(mot_de_passe)
    adb("shell", "input", "keyevent", "KEYCODE_ENTER")
    time.sleep(1)


class Tournage:
    """Un enregistrement de l'écran, et les légendes datées depuis son début."""

    def __init__(self, nom: str, sortie: Path):
        self.nom, self.sortie = nom, sortie
        self.legendes: list[dict] = []

    def __enter__(self):
        adb("shell", "rm", "-f", f"/sdcard/{self.nom}.mp4")
        self.processus = subprocess.Popen(
            [ADB, "shell", "screenrecord", "--size", "720x1600", "--bit-rate", "8000000",
             "--time-limit", "180", f"/sdcard/{self.nom}.mp4"]
        )
        time.sleep(1.0)
        self.debut = time.time()
        return self

    def dire(self, etape: str, texte: str, tenir: float = 0):
        self.legendes.append({"t": round(time.time() - self.debut, 2), "etape": etape, "texte": texte})
        if tenir:
            time.sleep(tenir)

    def __exit__(self, *_):
        time.sleep(1.5)
        self.legendes.append({"t": round(time.time() - self.debut, 2), "fin": True})
        adb("shell", "pkill", "-INT", "screenrecord")
        self.processus.wait(timeout=20)
        time.sleep(2)
        self.sortie.mkdir(parents=True, exist_ok=True)
        (self.sortie / f"{self.nom}.mp4").write_bytes(adb("exec-out", "cat", f"/sdcard/{self.nom}.mp4", octets=True))
        (self.sortie / f"{self.nom}.json").write_text(json.dumps(self.legendes, ensure_ascii=False, indent=1))
        duree = self.legendes[-1]["t"]
        if duree > 178:
            print(f"⚠️ {self.nom} : {duree:.0f} s, au-delà de la limite de screenrecord (180 s)")
