"""One-off: light-coloured D2 mark for dark backgrounds (header dark mode).

The brand D is dark navy, which vanishes on the near-black dark header.
Recolour the blue D to paper while keeping the tan '2' as the accent.
"""
import numpy as np
from PIL import Image

SRC = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark.png"
OUT = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark-light.png"

PAPER = (245, 242, 236)  # --color-paper

img = Image.open(SRC).convert("RGBA")
a = np.array(img).astype(np.int16)
r, g, b, alpha = a[..., 0], a[..., 1], a[..., 2], a[..., 3]

# Blue-dominant pixels are the navy D (and its antialiased edges); warm pixels
# (red >= blue) are the tan '2' and the blend, which we leave untouched.
blue_d = (b > r + 8) & (alpha > 0)
out = np.array(img)
out[blue_d, 0] = PAPER[0]
out[blue_d, 1] = PAPER[1]
out[blue_d, 2] = PAPER[2]

Image.fromarray(out, "RGBA").save(OUT)
print("recoloured", int(blue_d.sum()), "D pixels ->", OUT)
