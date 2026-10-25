import os
from PIL import Image
import rembg

os.makedirs('frontend/src/assets/cutouts', exist_ok=True)

images = [
    ('frame-01.jpg', 'aurelia-round.png'),
    ('frame-02.jpg', 'meridian-gold.png'),
    ('frame-03.jpg', 'graphite-squareline.png'),
    ('sun-01.jpg', 'solstice-aviator.png'),
    ('sun-02.jpg', 'amber-cateye.png')
]

for src_name, dst_name in images:
    src_path = os.path.join('frontend/src/assets', src_name)
    dst_path = os.path.join('frontend/src/assets/cutouts', dst_name)
    print(f"Processing {src_name}...")
    img = Image.open(src_path)
    output = rembg.remove(img)
    
    # Get bounding box of non-alpha content
    bbox = output.getbbox()
    if bbox:
        # Crop tight with small padding
        cropped = output.crop(bbox)
        # Add 5% padding around frame
        w, h = cropped.size
        pad_w, pad_h = int(w * 0.05), int(h * 0.05)
        canvas = Image.new('RGBA', (w + pad_w * 2, h + pad_h * 2), (0, 0, 0, 0))
        canvas.paste(cropped, (pad_w, pad_h))
        canvas.save(dst_path, 'PNG')
        print(f"Saved {dst_name}: {canvas.size}")
    else:
        output.save(dst_path, 'PNG')
        print(f"Saved {dst_name} full: {output.size}")

print("All cutouts completed!")
