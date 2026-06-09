"""One-off: crop a clean D2 glyph (no rays, no caption) from the full lockup."""
from PIL import Image
import numpy as np
from collections import deque

SRC = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2_logo-transp.png"
OUT = r"g:\My Drive\claude_code\calibratedideas\public\images\logo\d2-mark.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
alpha = arr[:, :, 3]

# Work only in the mark area (above the CALIBRATED IDEAS caption).
y0, y1, x0, x1 = 140, 500, 170, 770
region = alpha[y0:y1, x0:x1]
mask = region > 40

h, w = mask.shape
labels = np.zeros((h, w), dtype=np.int32)
sizes = {}
cur = 0
for sy in range(h):
    for sx in range(w):
        if mask[sy, sx] and labels[sy, sx] == 0:
            cur += 1
            q = deque([(sy, sx)])
            labels[sy, sx] = cur
            cnt = 0
            while q:
                cy, cx = q.popleft()
                cnt += 1
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and labels[ny, nx] == 0:
                            labels[ny, nx] = cur
                            q.append((ny, nx))
            sizes[cur] = cnt

big = max(sizes.values())
# Keep components that are a meaningful fraction of the largest (D and 2); drop ray dashes.
keep = {lbl for lbl, s in sizes.items() if s > big * 0.05}
print("components:", len(sizes), "| sizes:", sorted(sizes.values(), reverse=True)[:8], "| kept:", len(keep))

keep_mask = np.isin(labels, list(keep))

# Build output limited to the mark region, zeroing everything not kept.
out = np.zeros_like(arr)
sub = arr[y0:y1, x0:x1].copy()
sub[~keep_mask] = (0, 0, 0, 0)
out[y0:y1, x0:x1] = sub

# Tight bounding box of kept pixels, with padding.
ys, xs = np.where(keep_mask)
pad = 24
top = y0 + ys.min() - pad
bot = y0 + ys.max() + 1 + pad
left = x0 + xs.min() - pad
right = x0 + xs.max() + 1 + pad
cropped = out[top:bot, left:right]
Image.fromarray(cropped, "RGBA").save(OUT)
print("saved", OUT, cropped.shape[1], "x", cropped.shape[0])
