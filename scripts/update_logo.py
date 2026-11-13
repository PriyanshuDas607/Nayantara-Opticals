import os
import base64
from PIL import Image

src = r"C:/Users/Priya/.gemini/antigravity/brain/72207e85-4d2a-4446-81d3-414879040649/.user_uploaded/media_1794562125233_16c82618.png"
im = Image.open(src)
bbox = im.getbbox()

# 1. Full logo (emblem + text)
pad = 12
w, h = im.size
crop_box = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad))
full_logo = im.crop(crop_box)

# 2. Square favicon emblem
emblem_box = (bbox[0], 0, bbox[2], 200)
emblem = im.crop(emblem_box)
emblem_tight = emblem.crop(emblem.getbbox())
ew, eh = emblem_tight.size
max_dim = max(ew, eh)
square_size = int(max_dim * 1.15)
fav = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 0))
paste_x = (square_size - ew) // 2
paste_y = (square_size - eh) // 2
fav.paste(emblem_tight, (paste_x, paste_y), mask=emblem_tight.split()[3])

dirs = ["frontend/public", "frontend/dist/client"]

for d in dirs:
    if not os.path.exists(d):
        continue
    # Save logo.png
    full_logo.save(os.path.join(d, "logo.png"), "PNG")
    full_logo.save(os.path.join(d, "hero-logo.png"), "PNG")
    
    # Save favicon.png (64x64)
    fav64 = fav.resize((64, 64), Image.Resampling.LANCZOS)
    fav64.save(os.path.join(d, "favicon.png"), "PNG")
    
    # Save favicon.ico with multiple sizes
    fav.save(os.path.join(d, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Generate SVG wrappers with embedded high-res PNG for perfect fidelity
with open("frontend/public/logo.png", "rb") as f:
    b64_logo = base64.b64encode(f.read()).decode("utf-8")
svg_logo = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {full_logo.width} {full_logo.height}" width="{full_logo.width}" height="{full_logo.height}">
  <image href="data:image/png;base64,{b64_logo}" width="{full_logo.width}" height="{full_logo.height}" />
</svg>"""

with open("frontend/public/favicon.png", "rb") as f:
    b64_fav = base64.b64encode(f.read()).decode("utf-8")
svg_fav = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <image href="data:image/png;base64,{b64_fav}" width="64" height="64" />
</svg>"""

for d in dirs:
    if os.path.exists(d):
        with open(os.path.join(d, "logo.svg"), "w", encoding="utf-8") as f:
            f.write(svg_logo)
        with open(os.path.join(d, "favicon.svg"), "w", encoding="utf-8") as f:
            f.write(svg_fav)

print(f"Successfully updated all logo and favicon assets! Logo size: {full_logo.size}, Favicon size: {fav64.size}")

