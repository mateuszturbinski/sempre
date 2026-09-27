#!/usr/bin/env python3
"""
Wideo obrotu loda (turntable) → sekwencja klatek WebP z przezroczystym tłem dla <ConeSpin>.

  python3 scripts/make_cone_frames.py wideo.mp4 [--frames 72] [--start 0] [--end 0] [--width 648]

- bierze `--frames` klatek równo rozłożonych między --start a --end (sekundy; end=0 → koniec
  wideo). Przytnij tak, żeby odcinek był DOKŁADNIE jednym pełnym obrotem — wtedy obrót się zapętla.
- usuwa tło modelem rembg (isnet-general-use), więc tło wideo może być dowolne (najlepiej białe/jednolite),
- przycina wszystkie klatki do wspólnego obrysu loda i wpasowuje w proporcje ramki z Figmy 432×714
  (wyśrodkowane w poziomie, dosunięte do dołu),
- zapisuje public/cone/NNN.webp + public/cone/manifest.json.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from rembg import new_session, remove

BOX_W, BOX_H = 432, 714  # ramka stożka w Figmie (node 50:782)


def probe_duration(ffmpeg: str, video: Path) -> float:
    out = subprocess.run([ffmpeg, "-i", str(video)], capture_output=True, text=True).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit("Nie umiem odczytać długości wideo")


def clean_alpha(img: Image.Image, erode: int) -> Image.Image:
    """Zostawia tylko największy spójny kształt (lód) — usuwa plamki odblasków tła — i zdejmuje `erode` px krawędzi."""
    rgba = np.asarray(img).copy()
    alpha = rgba[:, :, 3]
    labels, n = ndimage.label(alpha > 12)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(alpha), labels, range(1, n + 1))
        keep = ndimage.binary_dilation(labels == (int(np.argmax(sizes)) + 1), iterations=2)
        alpha = np.where(keep, alpha, 0).astype(np.uint8)
    out = Image.fromarray(np.dstack([rgba[:, :, :3], alpha]).astype(np.uint8), "RGBA")
    if erode > 0:
        a = out.getchannel("A").filter(ImageFilter.MinFilter(erode * 2 + 1))
        out.putalpha(a)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--frames", type=int, default=72)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=0.0)
    ap.add_argument("--width", type=int, default=648, help="szerokość wyjściowa (1.5× ramki 432)")
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent.parent / "public" / "cone-v3")
    ap.add_argument("--model", default="isnet-general-use")
    ap.add_argument("--erode", type=int, default=1, help="ile px zdjąć z krawędzi maski (usuwa ciemną/jasną otoczkę tła)")
    a = ap.parse_args()

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    end = a.end or probe_duration(ffmpeg, a.video)
    span = end - a.start
    # Pełny obrót: klatka N byłaby = klatce 0, więc próbkujemy [start, end) bez końca.
    times = [a.start + span * i / a.frames for i in range(a.frames)]

    session = new_session(a.model)
    cut: list[Image.Image] = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(times):
            raw = Path(tmp) / f"{i:03d}.png"
            subprocess.run(
                [ffmpeg, "-v", "error", "-ss", f"{t:.4f}", "-i", str(a.video), "-frames:v", "1", str(raw)],
                check=True,
            )
            img = remove(Image.open(raw).convert("RGB"), session=session, post_process_mask=True).convert("RGBA")
            cut.append(clean_alpha(img, a.erode))
            print(f"\rklatki: {i + 1}/{a.frames}", end="", flush=True)
    print()

    # Wspólny obrys (żeby lód nie „skakał” między klatkami).
    boxes = [np.argwhere(np.asarray(im)[:, :, 3] > 12) for im in cut]
    ys = np.concatenate([b[:, 0] for b in boxes if len(b)])
    xs = np.concatenate([b[:, 1] for b in boxes if len(b)])
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    w, h = x1 - x0, y1 - y0

    # Płótno w proporcjach ramki: lód wyśrodkowany w poziomie, przy dolnej krawędzi.
    ratio = BOX_W / BOX_H
    cw, ch = (w, round(w / ratio)) if w / h > ratio else (round(h * ratio), h)
    out_w = a.width
    out_h = round(out_w / ratio)

    if a.out.exists():
        shutil.rmtree(a.out)
    a.out.mkdir(parents=True)
    for i, im in enumerate(cut):
        canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        canvas.paste(im.crop((x0, y0, x1, y1)), ((cw - w) // 2, ch - h))
        canvas.resize((out_w, out_h), Image.LANCZOS).save(a.out / f"{i:03d}.webp", "WEBP", quality=82, method=6)

    manifest = {"count": a.frames, "width": out_w, "height": out_h, "ext": "webp"}
    (a.out / "manifest.json").write_text(json.dumps(manifest))
    total = sum(p.stat().st_size for p in a.out.glob("*.webp"))
    print(f"OK: {a.frames} klatek {out_w}×{out_h} → {a.out} ({total / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
