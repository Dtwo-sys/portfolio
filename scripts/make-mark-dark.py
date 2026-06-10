"""One-off: dark-mode brand-colour marks for the header and footer.

The navy D vanishes on the near-black surfaces. Lighten the blue D, rays
and (footer) caption to a deep royal blue of the same hue so they read as
the brand blue on dark, keeping the tan '2' untouched.
"""
import numpy as np
from PIL import Image

BLUE = (18, 58, 115)  # closer to navy, still legible on #16181a dark surface
LOGO = r"g:\My Drive\claude_code\calibratedideas\public\images\logo"


def recolour(src, out):
    img = np.array(Image.open(src).convert("RGBA"))
    r, g, b = img[..., 0].astype(int), img[..., 1].astype(int), img[..., 2].astype(int)
    mask = (b > r + 8) & (img[..., 3] > 0)  # the blue D, rays and caption
    img[mask, 0], img[mask, 1], img[mask, 2] = BLUE
    Image.fromarray(img, "RGBA").save(out)
    print("recoloured", int(mask.sum()), "->", out)


recolour(LOGO + r"\d2-mark.png", LOGO + r"\d2-mark-dark.png")  # header
recolour(LOGO + r"\d2-logo-transparent.webp", LOGO + r"\d2-logo-transparent-dark.webp")  # footer
recolour(LOGO + r"\d2_logo-transp.png", LOGO + r"\d2_logo-transp-dark.png")  # hero
