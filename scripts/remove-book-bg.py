"""Remove baked-in checkerboard background from the Liminal Light book cover.

The JPG was exported from a 3D renderer with a transparent background that
got baked as a grey/white checkerboard when saved as JPG. Strategy:
- Sample the actual corner pixel values to get the exact checkerboard colours.
- Flood-fill outward from the four corners using only that tight colour range.
- This stops at the book's edge without eating the cover's own light areas.
"""
import numpy as np
from PIL import Image
from collections import deque

SRC = r"g:\My Drive\claude_code\calibratedideas\public\images\projects\liminal-light\liminal-light-book-cover.jpg"
DST = r"g:\My Drive\claude_code\calibratedideas\public\images\projects\liminal-light\liminal-light-book-cover.png"

COLOUR_THRESH_TIGHT = 18   # pass 1: match within ±18 of sampled corner colour
COLOUR_THRESH_WIDE  = 55   # pass 2: expand fringe from already-transparent pixels
SEED_RADIUS         = 12   # seed BFS from this many pixels in from each corner


def bfs(arr, bg, candidate, h, w, seeds):
    queue = deque(seeds)
    while queue:
        y, x = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and candidate[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))


def remove_bg(src, dst):
    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    # Sample colour from a small patch at each corner to characterise the bg.
    r = int(SEED_RADIUS)
    patches = [
        arr[:r, :r, :3],
        arr[:r, w-r:, :3],
        arr[h-r:, :r, :3],
        arr[h-r:, w-r:, :3],
    ]
    corner_pixels = np.concatenate([p.reshape(-1, 3) for p in patches]).astype(float)
    bg_colour = corner_pixels.mean(axis=0)
    print(f"Sampled background colour: R={bg_colour[0]:.0f} G={bg_colour[1]:.0f} B={bg_colour[2]:.0f}")

    rgb = arr[..., :3].astype(float)
    diff = np.abs(rgb - bg_colour).max(axis=-1)

    # --- Pass 1: tight threshold from corner seeds ---
    candidate1 = diff < COLOUR_THRESH_TIGHT
    bg = np.zeros((h, w), dtype=bool)
    seeds = []
    for sy in range(SEED_RADIUS):
        for sx in range(SEED_RADIUS):
            for (py, px) in [(sy, sx), (sy, w-1-sx), (h-1-sy, sx), (h-1-sy, w-1-sx)]:
                if candidate1[py, px] and not bg[py, px]:
                    bg[py, px] = True
                    seeds.append((py, px))
    bfs(arr, bg, candidate1, h, w, seeds)
    print(f"  Pass 1: {bg.sum():,} pixels")

    # --- Pass 2: looser threshold, bottom half only ---
    # The top is already clean from pass 1. The remaining fringe is at the base
    # where the rendered book shadow blends into the checkerboard. Constrain to
    # the lower 50% and require low saturation so we don't eat the blue-tinted cover.
    bottom_start = h // 2
    ch = arr[..., :3].astype(int)
    lo_sat = (ch.max(axis=-1) - ch.min(axis=-1)) < 20
    in_bottom = np.zeros((h, w), dtype=bool)
    in_bottom[bottom_start:, :] = True
    candidate2 = (diff < COLOUR_THRESH_WIDE) & lo_sat & in_bottom & ~bg
    border_seeds = []
    ys, xs = np.where(bg & in_bottom)
    for y, x in zip(ys.tolist(), xs.tolist()):
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and candidate2[ny, nx]:
                bg[ny, nx] = True
                border_seeds.append((ny, nx))
    bfs(arr, bg, candidate2, h, w, border_seeds)
    print(f"  Pass 2: {bg.sum():,} pixels total")

    arr[bg, 3] = 0
    Image.fromarray(arr, "RGBA").save(dst)
    print(f"Saved -> {dst}")


remove_bg(SRC, DST)
