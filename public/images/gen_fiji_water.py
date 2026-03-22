from PIL import Image, ImageDraw, ImageFilter
import math

W, H = 1200, 800

# --- gradient: deep ocean blue -> tropical aqua ---
img = Image.new("RGB", (W, H))
px = img.load()

c1 = (2, 13, 31)    # #020d1f  deep ocean blue
c2 = (10, 45, 61)   # #0a2d3d  tropical aqua

for y in range(H):
    for x in range(W):
        # radial-ish: darker corners, lighter center-right
        tx = x / W
        ty = y / H
        t = tx * 0.45 + (1 - abs(ty - 0.5) * 2) * 0.35 + 0.1
        t = max(0.0, min(1.0, t))
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        px[x, y] = (r, g, b)

# --- wave shapes ---
wave_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
wd = ImageDraw.Draw(wave_layer)

def wave_band(draw, y_base, amplitude, frequency, phase, color, thickness=60):
    pts_top = []
    pts_bot = []
    for x in range(W + 1):
        y_off = amplitude * math.sin(2 * math.pi * x / (W * frequency) + phase)
        pts_top.append((x, int(y_base + y_off)))
        pts_bot.append((x, int(y_base + y_off + thickness)))
    poly = pts_top + list(reversed(pts_bot))
    draw.polygon(poly, fill=color)

wave_configs = [
    (160,  30, 0.8, 0.0,  (20, 120, 160, 30)),
    (260,  35, 0.9, 0.5,  (15, 100, 140, 25)),
    (380,  28, 0.75, 1.1, (25, 130, 170, 22)),
    (500,  40, 1.0, 0.3,  (10, 90,  130, 20)),
    (620,  32, 0.85, 0.8, (30, 140, 180, 25)),
    (720,  38, 0.7, 1.4,  (20, 110, 155, 22)),
]
for y_base, amp, freq, phase, color in wave_configs:
    wave_band(wd, y_base, amp, freq, phase, color, thickness=55)

wave_layer = wave_layer.filter(ImageFilter.GaussianBlur(radius=20))

# --- tropical hibiscus-inspired petal geometry (abstract) ---
petal_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(petal_layer)

def petal_shape(draw, cx, cy, r, angle, color):
    """Elongated ellipse rotated to simulate a petal."""
    # Use polygon approximation of a rotated ellipse
    pts = []
    for i in range(36):
        a = math.radians(i * 10)
        # ellipse: x-radius r, y-radius r*0.35
        ex = r * math.cos(a)
        ey = r * 0.35 * math.sin(a)
        # rotate
        ra = math.radians(angle)
        rx = ex * math.cos(ra) - ey * math.sin(ra)
        ry = ex * math.sin(ra) + ey * math.cos(ra)
        pts.append((cx + rx, cy + ry))
    draw.polygon(pts, fill=color)

# abstract flower clusters
flowers = [
    (150,  200, 90),
    (1050, 150, 80),
    (200,  650, 85),
    (1050, 620, 95),
    (600,  120, 75),
    (580,  700, 80),
]

petal_color = (20, 160, 200, 22)
petal_color2 = (30, 80,  120, 18)

for cx, cy, r in flowers:
    for angle in range(0, 360, 72):
        petal_shape(pd, cx, cy, r, angle, petal_color)
    # smaller inner
    for angle in range(36, 396, 72):
        petal_shape(pd, cx, cy, r * 0.55, angle, petal_color2)

petal_layer = petal_layer.filter(ImageFilter.GaussianBlur(radius=14))

# --- crystal light caustic effect: small bright glints ---
glint_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glint_layer)

glints = [
    (320, 180, 40),
    (720, 240, 35),
    (500, 450, 30),
    (900, 350, 45),
    (200, 550, 28),
    (1000, 500, 32),
    (650, 650, 38),
    (100, 350, 25),
]
for cx, cy, r in glints:
    gd.ellipse([cx - r, cy - r, cx + r, cy + r],
               fill=(80, 200, 240, 28))
glint_layer = glint_layer.filter(ImageFilter.GaussianBlur(radius=18))

img_rgba = img.convert("RGBA")
img_rgba = Image.alpha_composite(img_rgba, wave_layer)
img_rgba = Image.alpha_composite(img_rgba, petal_layer)
img_rgba = Image.alpha_composite(img_rgba, glint_layer)

# aqua center glow
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd2 = ImageDraw.Draw(glow)
for i in range(100):
    alpha = int(22 * (1 - i / 100))
    r2 = 40 + i * 7
    gd2.ellipse([W*0.55 - r2, H*0.45 - r2, W*0.55 + r2, H*0.45 + r2],
                fill=(20, 120, 180, alpha))
glow = glow.filter(ImageFilter.GaussianBlur(radius=35))
img_rgba = Image.alpha_composite(img_rgba, glow)

# vignette
vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd2 = ImageDraw.Draw(vignette)
for i in range(120):
    alpha = int(155 * (i / 120) ** 1.9)
    margin = i * 3
    vd2.rectangle([margin, margin, W - margin, H - margin],
                  outline=(0, 0, 0, alpha), width=1)
img_rgba = Image.alpha_composite(img_rgba, vignette)

out = img_rgba.convert("RGB")
out.save("/Users/tinelli/Workstation/PlasticSurf/02 Online/PlasticSurf-KI WebSite/plastic-surf-website/public/images/fiji-artesian-water-design-marketing.png")
print("Saved FIJI water image.")
