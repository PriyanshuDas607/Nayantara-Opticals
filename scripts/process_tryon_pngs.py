import os
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
    
    # We want to identify the background outside and convert white to transparent
    # For sunglasses, the lenses have distinct colors (green or amber), so white pixels are background.
    # For eyeglasses, white pixels outside and inside are transparent.
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # White background threshold
            if r > 240 and g > 240 and b > 240:
                # Feather near pure white
                brightness = (r + g + b) / 3.0
                if brightness >= 248:
                    pixels[x, y] = (r, g, b, 0)
                else:
                    # Soft edge transition
                    alpha = int((248 - brightness) / 8.0 * 255)
                    pixels[x, y] = (r, g, b, max(0, min(255, alpha)))
            elif item["is_sunglasses"]:
                # For sunglasses lenses, keep the tint semi-translucent so the eyes are subtly visible through the lens
                # Check if it's the dark/tinted lens
                # Amber or green lens
                pass

    # Crop to content
    bbox = im.getbbox()
    if bbox:
        # Give 2% margin
        mw = int((bbox[2] - bbox[0]) * 0.02)
        mh = int((bbox[3] - bbox[1]) * 0.02)
        crop_box = (
            max(0, bbox[0] - mw),
            max(0, bbox[1] - mh),
            min(w, bbox[2] + mw),
            min(h, bbox[3] + mh)
        )
        im = im.crop(crop_box)
    
    dst_path = os.path.join(OUT_DIR, item["name"])
    im.save(dst_path, "PNG")
    print(f"Exported {item['name']}: {im.size}")

print("All front PNGs successfully processed!")
