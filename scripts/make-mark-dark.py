"""One-off: dark-mode header mark keeping brand colour.

The navy D (3,37,89) vanishes on the near-black header. Lighten the blue
D and rays to a cornflower blue of the same hue so they read as the brand
blue on dark, and keep the tan '2' untouched.
"""
import numpy as np
from PIL import Image

SRC = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark.png"
OUT = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark-dark.png"

LIGHT_BLUE = (90, 145, 220)  # same hue as the navy, raised for contrast on dark

img = Image.open(SRC).convert("RGBA")
a = np.array(img)
r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
blue = (b > r + 8) & (a[..., 3] > 0)  # the D and the rays
a[blue, 0], a[blue, 1], a[blue, 2] = LIGHT_BLUE

Image.fromarray(a, "RGBA").save(OUT)
print("recoloured", int(blue.sum()), "blue pixels ->", OUT)
