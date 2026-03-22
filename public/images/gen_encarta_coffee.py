from PIL import Image, ImageDraw, ImageFilter
import math

W, H = 1200, 800

# --- base gradient: deep espresso -> warm caramel ---
img = Image.new("RGB", (W, H))
px = img.load()

c1 = (26, 10, 4)    # #1a0a04  deep espresso
c2 = (61, 31, 10)   # #3d1f0a  warm caramel

for y in range(H):
    for x in range(W):
        t = (x / W * 0.5 + y / H * 0.5)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        px[x, y] = (r, g, b)

# --- hex/cylindrical packaging shapes ---
layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(layer)

def hex_points(cx, cy, r, angle_offset=0):
    pts = []
    for i in range(6):
        a = math.radians(60 * i + angle_offset)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

# Large faint hexagons
hexagons = [
    (200,  180, 180, 0,  (180, 110, 50, 30)),
    (600,  100, 220, 15, (160, 90,  30, 25)),
    (980,  250, 160, 5,  (200, 130, 60, 28)),
    (350,  550, 200, 10, (170, 100, 40, 22)),
    (800,  600, 190, 20, (190, 120, 55, 25)),
    (1100, 500, 140, 0,  (155, 85,  25, 20)),
    (100,  650, 130, 30, (180, 110, 45, 18)),
]

for cx, cy, r, ao, color in hexagons:
    pts = hex_points(cx, cy, r, ao)
    draw.polygon(pts, fill=color)
    # inner ring
    inner = hex_points(cx, cy, r * 0.7, ao)
    draw.polygon(inner, fill=(0, 0, 0, 0))
    draw.line(inner + [inner[0]], fill=(color[0]+20, color[1]+10, color[2], color[3]+15), width=2)

layer = layer.filter(ImageFilter.GaussianBlur(radius=12))

# Cylindrical can shapes (rectangles with rounded top/bottom)
cyl_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw2 = ImageDraw.Draw(cyl_layer)

cylinders = [
    (500,  300, 80, 200, (200, 140, 70, 22)),
    (750,  200, 70, 180, (180, 120, 55, 18)),
    (900,  450, 90, 220, (210, 150, 80, 20)),
    (250,  400, 65, 160, (170, 105, 40, 16)),
    (1050, 350, 75, 190, (195, 135, 65, 18)),
]

for cx, cy, rw, rh, color in cylinders:
    # body
    draw2.rectangle([cx - rw, cy - rh//2, cx + rw, cy + rh//2], fill=color)
    # top ellipse
    draw2.ellipse([cx - rw, cy - rh//2 - rw//3, cx + rw, cy - rh//2 + rw//3],
                  fill=(color[0]+15, color[1]+10, color[2], color[3]+10))
    # bottom ellipse
    draw2.ellipse([cx - rw, cy + rh//2 - rw//3, cx + rw, cy + rh//2 + rw//3],
                  fill=(color[0]-10, color[1]-5, color[2], color[3]+5))

cyl_layer = cyl_layer.filter(ImageFilter.GaussianBlur(radius=16))

img_rgba = img.convert("RGBA")
img_rgba = Image.alpha_composite(img_rgba, layer)
img_rgba = Image.alpha_composite(img_rgba, cyl_layer)

# warm highlight center
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for i in range(80):
    alpha = int(18 * (1 - i / 80))
    r2 = 30 + i * 6
    gd.ellipse([W//2 - r2, H//2 - r2, W//2 + r2, H//2 + r2],
               fill=(180, 100, 30, alpha))
glow = glow.filter(ImageFilter.GaussianBlur(radius=30))
img_rgba = Image.alpha_composite(img_rgba, glow)

# vignette
vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(vignette)
for i in range(120):
    alpha = int(140 * (i / 120) ** 1.8)
    margin = i * 3
    vd.rectangle([margin, margin, W - margin, H - margin],
                 outline=(0, 0, 0, alpha), width=1)
img_rgba = Image.alpha_composite(img_rgba, vignette)

out = img_rgba.convert("RGB")
out.save("/Users/tinelli/Workstation/PlasticSurf/02 Online/PlasticSurf-KI WebSite/plastic-surf-website/public/images/encarta-coffee-cups-verpackungsdesign.png")
print("Saved encarta coffee image.")
