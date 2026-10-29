import numpy as np
from PIL import Image

def clean_graphite():
    im = Image.open('frontend/src/assets/tryon/graphite-squareline-front.png').convert('RGBA')
    arr = np.array(im)
    h, w, _ = arr.shape
    
    # Left lens arm: diagonal from (100, 60) down-right to (360, 215)
    # Inside lens area only: keep rim (x < 95, y < 45, y > 290, x > 470)
    for y in range(48, 225):
        for x in range(100, 370):
            # The arm is darker gray/black or silver
            # Check if this pixel is inside the lens and part of the arm
            if arr[y, x, 3] > 10:
                # Arm boundary condition: y starts at 50, x around 100-200; y up to 215, x around 330-360
                # Distance to arm line: from (120, 65) to (345, 205)
                # Let's check if it's not the outer rim
                # Rim is at x <= 95 or y <= 45
                if x >= 98 and y >= 48 and x <= 365:
                    arr[y, x] = [0, 0, 0, 0]

    # Right lens arm: from (1110, 60) down-left to (880, 215)
    for y in range(48, 225):
        for x in range(860, 1112):
            if arr[y, x, 3] > 10:
                if x <= 1110 and y >= 48 and x >= 870:
                    arr[y, x] = [0, 0, 0, 0]

    out = Image.fromarray(arr)
    out.save('frontend/src/assets/tryon/graphite-squareline-front.png')
    print("Graphite cleaned successfully!")

def clean_solstice():
    im = Image.open('frontend/src/assets/tryon/solstice-aviator-front.png').convert('RGBA')
    arr = np.array(im)
    h, w, _ = arr.shape

    # Solstice has arms inside [100, 360] x [90, 350] on left, and [810, 1070] x [90, 350] on right
    # For horizontal interpolation, inpaint where the arm is dark
    # For each row y between 90 and 345:
    for y in range(90, 345):
        # Left lens
        row_l = arr[y, 110:360]
        # Dark arm pixels
        is_arm_l = (row_l[:, 0] < 95) & (row_l[:, 1] < 125) & (row_l[:, 3] > 50)
        if np.any(is_arm_l):
            idx = np.where(is_arm_l)[0]
            start_x = 110 + max(0, idx[0] - 8)
            end_x = 110 + min(len(row_l) - 1, idx[-1] + 8)
            # Ensure start_x and end_x are in green lens
            if arr[y, start_x, 1] > 115 and arr[y, end_x, 1] > 115 and end_x > start_x:
                c0 = arr[y, start_x].astype(float)
                c1 = arr[y, end_x].astype(float)
                for i in range(end_x - start_x):
                    t = i / float(end_x - start_x)
                    arr[y, start_x + i] = (1 - t) * c0 + t * c1

        # Right lens
        row_r = arr[y, 810:1060]
        is_arm_r = (row_r[:, 0] < 95) & (row_r[:, 1] < 125) & (row_r[:, 3] > 50)
        if np.any(is_arm_r):
            idx = np.where(is_arm_r)[0]
            start_x = 810 + max(0, idx[0] - 8)
            end_x = 810 + min(len(row_r) - 1, idx[-1] + 8)
            if arr[y, start_x, 1] > 115 and arr[y, end_x, 1] > 115 and end_x > start_x:
                c0 = arr[y, start_x].astype(float)
                c1 = arr[y, end_x].astype(float)
                for i in range(end_x - start_x):
                    t = i / float(end_x - start_x)
                    arr[y, start_x + i] = (1 - t) * c0 + t * c1

    out = Image.fromarray(arr)
    out.save('frontend/src/assets/tryon/solstice-aviator-front.png')
    print("Solstice cleaned successfully!")

def clean_amber():
    im = Image.open('frontend/src/assets/tryon/amber-cateye-front.png').convert('RGBA')
    arr = np.array(im)
    h, w, _ = arr.shape

    # Amber has dark brown temple tips inside [220, 330] x [180, 330] on left, and [870, 980] x [180, 330] on right
    for y in range(180, 330):
        # Left lens
        row_l = arr[y, 200:340]
        # Dark brown tip: r < 140, g < 90, b < 60
        is_arm_l = (row_l[:, 0] < 145) & (row_l[:, 1] < 95) & (row_l[:, 3] > 100)
        if np.any(is_arm_l):
            idx = np.where(is_arm_l)[0]
            start_x = 200 + max(0, idx[0] - 8)
            end_x = 200 + min(len(row_l) - 1, idx[-1] + 8)
            if arr[y, start_x, 0] > 150 and arr[y, end_x, 0] > 150 and end_x > start_x:
                c0 = arr[y, start_x].astype(float)
                c1 = arr[y, end_x].astype(float)
                for i in range(end_x - start_x):
                    t = i / float(end_x - start_x)
                    arr[y, start_x + i] = (1 - t) * c0 + t * c1

        # Right lens
        row_r = arr[y, 860:1000]
        is_arm_r = (row_r[:, 0] < 145) & (row_r[:, 1] < 95) & (row_r[:, 3] > 100)
        if np.any(is_arm_r):
            idx = np.where(is_arm_r)[0]
            start_x = 860 + max(0, idx[0] - 8)
            end_x = 860 + min(len(row_r) - 1, idx[-1] + 8)
            if arr[y, start_x, 0] > 150 and arr[y, end_x, 0] > 150 and end_x > start_x:
                c0 = arr[y, start_x].astype(float)
                c1 = arr[y, end_x].astype(float)
                for i in range(end_x - start_x):
                    t = i / float(end_x - start_x)
                    arr[y, start_x + i] = (1 - t) * c0 + t * c1

    out = Image.fromarray(arr)
    out.save('frontend/src/assets/tryon/amber-cateye-front.png')
    print("Amber cateye cleaned successfully!")

def clean_bottom_reflections():
    for name in ['meridian-gold-front.png', 'aurelia-round-front.png', 'graphite-squareline-front.png', 'solstice-aviator-front.png', 'amber-cateye-front.png']:
        p = f'frontend/src/assets/tryon/{name}'
        im = Image.open(p).convert('RGBA')
        arr = np.array(im)
        h, w, _ = arr.shape
        bot_y = int(h * 0.88)
        for y in range(bot_y, h):
            for x in range(w):
                if arr[y, x, 3] > 0:
                    r, g, b = arr[y, x, :3]
                    brightness = (int(r) + int(g) + int(b)) / 3.0
                    max_c = max(r, g, b)
                    min_c = min(r, g, b)
                    if brightness > 155 and (max_c - min_c) < 35:
                        arr[y, x] = [0, 0, 0, 0]
                    elif brightness > 185:
                        arr[y, x] = [0, 0, 0, 0]
        out = Image.fromarray(arr)
        out.save(p)
        print(f"Cleaned reflections on {name}")

if __name__ == '__main__':
    clean_graphite()
    clean_solstice()
    clean_amber()
    clean_bottom_reflections()

