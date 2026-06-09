"""One-off: header mark = D2 + rays from the clean lockup, without the caption.

Crops the left D2-and-rays cluster from the horizontal lockup, auto-detecting
the empty gutter before 'CALIBRATED IDEAS' so no rays are clipped. Stays navy;
the header recolours it white in dark mode via brightness-0 + invert, exactly
like the footer.
"""
import numpy as np
from PIL import Image

SRC = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-logo-transparent.webp"
OUT = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark.png"

img = Image.open(SRC).convert("RGBA")
a = np.array(img)
alpha = a[..., 3]
col_has = (alpha > 20).any(axis=0)  # columns containing ink

# Walk from the left: once ink starts, the first wide empty gutter is the
# boundary between the D2+rays cluster and the caption.
W = col_has.shape[0]
started = False
gap = 0
cut = W
for x in range(W):
    if col_has[x]:
        started = True
        gap = 0
    elif started:
        gap += 1
        if gap >= 30:          # wide blank gutter -> caption boundary
            cut = x - gap + 1
            break

# Tight bounding box of the left cluster, with padding.
left_region = a[:, :cut]
la = left_region[..., 3]
ys, xs = np.where(la > 20)
pad = 28
top, bot = max(ys.min() - pad, 0), ys.max() + 1 + pad
lft, rgt = max(xs.min() - pad, 0), xs.max() + 1 + pad
crop = left_region[top:bot, lft:rgt]
Image.fromarray(crop, "RGBA").save(OUT)
print("cut at x=", cut, "| mark size:", crop.shape[1], "x", crop.shape[0])
