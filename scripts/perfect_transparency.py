import os
from collections import deque
from PIL import Image

OUT_DIR = "frontend/src/assets/tryon"
os.makedirs(OUT_DIR, exist_ok=True)

ASSETS = [
    {
        "src": r"C:\Users\Priya\.gemini\antigravity-ide\brain\04662a5d-b5ce-4b38-86e7-a317f9975446\meridian_gold_front_1792927343207.jpg",
        "name": "meridian-gold-front.png",
        "is_sunglasses": False
    },
    {
        "src": r"C:\Users\Priya\.gemini\antigravity-ide\brain\04662a5d-b5ce-4b38-86e7-a317f9975446\aurelia_round_front_1792927365076.jpg",
        "name": "aurelia-round-front.png",
        "is_sunglasses": False
    },
    {
        "src": r"C:\Users\Priya\.gemini\antigravity-ide\brain\04662a5d-b5ce-4b38-86e7-a317f9975446\graphite_squareline_front_1792927382225.jpg",
        "name": "graphite-squareline-front.png",
        "is_sunglasses": False
    },
    {
        "src": r"C:\Users\Priya\.gemini\antigravity-ide\brain\04662a5d-b5ce-4b38-86e7-a317f9975446\solstice_aviator_front_1792927404558.jpg",
        "name": "solstice-aviator-front.png",
        "is_sunglasses": True
    },
    {
        "src": r"C:\Users\Priya\.gemini\antigravity-ide\brain\04662a5d-b5ce-4b38-86e7-a317f9975446\amber_cateye_front_1792927438184.jpg",
        "name": "amber-cateye-front.png",
        "is_sunglasses": True
    }
]

for item in ASSETS:
    im = Image.open(item["src"]).convert("RGBA")
    w, h = im.size
    pixels = im.load()
    
    # 1. Flood-fill from borders to clear outside background
    # A pixel is background if it is light (r > 225, g > 225, b > 225) or close to corner color
    c_r, c_g, c_b, _ = pixels[0, 0]
    visited = bytearray(w * h)
    q = deque()
    
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
        visited[0 * w + x] = 1
        visited[(h - 1) * w + x] = 1
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        visited[y * w + 0] = 1
        visited[y * w + (w - 1)] = 1
        
    while q:
        x, y = q.popleft()
        r, g, b, a = pixels[x, y]
        
        # Check if this pixel is background
        # Background is white or light off-white (brightness > 220 and saturation low)
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        is_bg = (min_c >= 210 and (max_c - min_c) <= 30) or (min_c >= 230)
        
        if is_bg:
            pixels[x, y] = (r, g, b, 0)
            for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                if 0 <= nx < w and 0 <= ny < h:
                    idx = ny * w + nx
                    if not visited[idx]:
                        visited[idx] = 1
                        q.append((nx, ny))

    # 2. For eyeglasses, also clear the lens interior (bright white areas inside the frame)
    if not item["is_sunglasses"]:
        # Find lens interior centers: left lens approx (w * 0.28, h * 0.50), right lens (w * 0.72, h * 0.50)
        lens_seeds = [
            (int(w * 0.28), int(h * 0.50)),
            (int(w * 0.72), int(h * 0.50))
        ]
        lens_q = deque(lens_seeds)
        lens_visited = bytearray(w * h)
        for sx, sy in lens_seeds:
            lens_visited[sy * w + sx] = 1
            
        while lens_q:
            x, y = lens_q.popleft()
            r, g, b, a = pixels[x, y]
            min_c = min(r, g, b)
            max_c = max(r, g, b)
            # If it's the white background of the lens
            is_lens_bg = (min_c >= 215 and (max_c - min_c) <= 32)
            if is_lens_bg:
                # Give subtle 10% AR anti-reflection green-blue coat sheen
                pixels[x, y] = (200, 240, 255, 12)
                for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        idx = ny * w + nx
                        if not lens_visited[idx] and not visited[idx]:
                            lens_visited[idx] = 1
                            lens_q.append((nx, ny))

    # 3. For sunglasses, make the dark tinted lenses semi-transparent (alpha ~ 210 / 82%) so the user's eyes show realistically through the tint!
    if item["is_sunglasses"]:
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    # Check if this pixel is inside the lens (not the metallic or acetate frame rim)
                    # For solstice aviator: green tint (g > r and g > b)
                    if "solstice" in item["name"]:
                        if g > r + 15 and g > b:
                            pixels[x, y] = (r, g, b, 205) # 80% opacity sunglasses lens
                    elif "amber" in item["name"]:
                        # For amber cateye: warm amber/brown lens
                        # Frame rim is high saturation orange (r > 200, g < 180)
                        # Lens is darker brown (r < 190, g < 130, b < 70)
                        if r < 190 and g < 140:
                            pixels[x, y] = (r, g, b, 215)

    # 4. Crop tight to the frame content
    bbox = im.getbbox()
    if bbox:
        mw = int((bbox[2] - bbox[0]) * 0.015)
        mh = int((bbox[3] - bbox[1]) * 0.015)
        crop_box = (
            max(0, bbox[0] - mw),
            max(0, bbox[1] - mh),
            min(w, bbox[2] + mw),
            min(h, bbox[3] + mh)
        )
        im = im.crop(crop_box)
        
    dst = os.path.join(OUT_DIR, item["name"])
    im.save(dst, "PNG")
    print(f"Processed perfect cutout for {item['name']}: {im.size}")

print("Completed all perfect cutouts!")
