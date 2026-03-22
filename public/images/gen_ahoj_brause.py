from PIL import Image, ImageDraw, ImageFilter
import math, random

W, H = 1200, 800

# --- base gradient: deep magenta -> electric orange ---
img = Image.new("RGB", (W, H))
px = img.load()

c1 = (61, 10, 46)    # #3d0a2e  deep magenta
c2 = (122, 31, 0)    # #7a1f00  electric orange

for y in range(H):
    for x in range(W):
        # diagonal gradient
        t = (x / W * 0.6 + y / H * 0.4)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        px[x, y] = (r, g, b)

# --- bubble layer (semi-transparent circles) ---
bubble_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(bubble_layer)

random.seed(42)
bubbles = [
    # (cx, cy, radius, color RGBA)
    (180,  200, 220, (255, 80, 180, 55)),
    (480,  120, 300, (255, 160, 30, 45)),
    (820,  350, 260, (220, 30, 120, 50)),
    (1050, 150, 180, (255, 200, 60, 40)),
    (350,  550, 240, (255, 100, 30, 45)),
    (700,  620, 200, (200, 20, 100, 40)),
    (950,  580, 170, (255, 140, 80, 50)),
    (100,  600, 150, (255, 60, 160, 35)),
    (600,  300, 140, (255, 210, 50, 30)),
    (1100, 400, 130, (220, 60, 30, 40)),
]

for cx, cy, r, color in bubbles:
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

bubble_layer = bubble_layer.filter(ImageFilter.GaussianBlur(radius=18))

img_rgba = img.convert("RGBA")
img_rgba = Image.alpha_composite(img_rgba, bubble_layer)

# second pass: smaller sharper accent circles
accent_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw2 = ImageDraw.Draw(accent_layer)

accents = [
    (280, 360, 60,  (255, 220, 80, 70)),
    (650, 200, 45,  (255, 80, 200, 65)),
    (900, 250, 55,  (255, 160, 40, 60)),
    (150, 450, 50,  (255, 100, 180, 55)),
    (1050, 600, 65, (255, 200, 70, 60)),
    (450, 680, 40,  (255, 80, 40, 55)),
]
for cx, cy, r, color in accents:
    draw2.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

accent_layer = accent_layer.filter(ImageFilter.GaussianBlur(radius=5))
img_rgba = Image.alpha_composite(img_rgba, accent_layer)

# vignette
vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(vignette)
for i in range(120):
    alpha = int(120 * (i / 120) ** 1.5)
    margin = i * 3
    vd.rectangle([margin, margin, W - margin, H - margin],
                 outline=(0, 0, 0, alpha), width=1)
img_rgba = Image.alpha_composite(img_rgba, vignette)

out = img_rgba.convert("RGB")
out.save("/Users/tinelli/Workstation/PlasticSurf/02 Online/PlasticSurf-KI WebSite/plastic-surf-website/public/images/ahoj-brause-marketing-werbedesign-dose.png")
print("Saved ahoj-brause image.")
