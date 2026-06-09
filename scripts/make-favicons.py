"""One-off: generate a clean D2 favicon set from the header mark.

Square paper background (#f5f2ec) with the D2 glyph centred, no caption.
Outputs the standard favicon set to public/ root, plus a self-contained
favicon.svg that embeds the high-res mark.
"""
import base64
from io import BytesIO
from PIL import Image

ROOT = r"g:\My Drive\claude_code\calibratedideas\public"
MARK = ROOT + r"\images\logo\d2-mark.png"

PAPER = (245, 242, 236, 255)  # --color-paper #f5f2ec
CANVAS = 512
PAD_RATIO = 0.14  # breathing room around the glyph

mark = Image.open(MARK).convert("RGBA")
mw, mh = mark.size

# Scale the mark to fit the padded inner box, preserving aspect.
inner = CANVAS * (1 - 2 * PAD_RATIO)
scale = min(inner / mw, inner / mh)
nw, nh = round(mw * scale), round(mh * scale)
mark_scaled = mark.resize((nw, nh), Image.LANCZOS)

# Master: paper square with the glyph centred.
master = Image.new("RGBA", (CANVAS, CANVAS), PAPER)
master.alpha_composite(mark_scaled, ((CANVAS - nw) // 2, (CANVAS - nh) // 2))

# --- Raster outputs ---
def save_png(size, name):
    master.resize((size, size), Image.LANCZOS).save(ROOT + "\\" + name)
    print("wrote", name)

save_png(16, "favicon-16x16.png")
save_png(32, "favicon-32x32.png")
save_png(180, "apple-touch-icon.png")
save_png(192, "android-chrome-192x192.png")
save_png(512, "android-chrome-512x512.png")

# Multi-resolution .ico
master.save(ROOT + r"\favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("wrote favicon.ico")

# --- Scalable favicon.svg: vector paper square + embedded high-res glyph ---
glyph_box = round(CANVAS * (1 - 2 * PAD_RATIO))
gscale = min(glyph_box / mw, glyph_box / mh)
gw, gh = round(mw * gscale), round(mh * gscale)
gx, gy = (CANVAS - gw) // 2, (CANVAS - gh) // 2

buf = BytesIO()
mark.resize((gw, gh), Image.LANCZOS).save(buf, format="PNG")
b64 = base64.b64encode(buf.getvalue()).decode("ascii")

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS} {CANVAS}">\n'
    f'  <rect width="{CANVAS}" height="{CANVAS}" fill="#f5f2ec"/>\n'
    f'  <image x="{gx}" y="{gy}" width="{gw}" height="{gh}" '
    f'href="data:image/png;base64,{b64}"/>\n'
    f'</svg>\n'
)
with open(ROOT + r"\favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote favicon.svg")
