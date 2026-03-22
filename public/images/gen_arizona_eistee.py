from PIL import Image, ImageDraw, ImageFilter
import math

W, H = 1200, 800

# --- diagonal gradient: warm amber -> deep teal ---
img = Image.new("RGB", (W, H))
px = img.load()

c1 = (45, 21, 0)    # #2d1500  warm amber
c2 = (0, 61, 45)    # #003d2d  deep teal

for y in range(H):
    for x in range(W):
        # diagonal: top-left = amber, bottom-right = teal
        t = x / W * 0.55 + y / H * 0.45
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        px[x, y] = (r, g, b)

layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(layer)

# Southwestern diamond / tile patterns
def diamond(draw, cx, cy, size, color):
    pts = [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)]
    draw.polygon(pts, fill=color)

def aztec_cross(draw, cx, cy, size, color):
    # plus / stepped cross
    s = size
    pts_h = [(cx - s*2, cy - s//2), (cx + s*2, cy - s//2),
             (cx + s*2, cy + s//2), (cx - s*2, cy + s//2)]
    pts_v = [(cx - s//2, cy - s*2), (cx + s//2, cy - s*2),
             (cx + s//2, cy + s*2), (cx - s//2, cy + s*2)]
    draw.polygon(pts_h, fill=color)
    draw.polygon(pts_v, fill=color)

# grid of diamonds
dia_color_amber = (200, 120, 30, 35)
dia_color_teal  = (30, 160, 120, 30)
dia_color_mid   = (120, 140, 80, 25)

grid_positions = [
    (150, 150), (450, 150), (750, 150), (1050, 150),
    (300, 300), (600, 300), (900, 300),
    (150, 450), (450, 450), (750, 450), (1050, 450),
    (300, 600), (600, 600), (900, 600),
    (150, 720), (450, 720), (750, 720), (1050, 720),
]

for i, (cx, cy) in enumerate(grid_positions):
    t = cx / W
    color = (
        int(dia_color_amber[0] + (dia_color_teal[0] - dia_color_amber[0]) * t),
        int(dia_color_amber[1] + (dia_color_teal[1] - dia_color_amber[1]) * t),
        int(dia_color_amber[2] + (dia_color_teal[2] - dia_color_amber[2]) * t),
        32,
    )
    diamond(draw, cx, cy, 80, color)
    # inner diamond
    inner_color = (color[0]+20, color[1]+20, color[2]+10, 20)
    diamond(draw, cx, cy, 45, inner_color)

# aztec cross accents
cross_positions = [(300, 225), (900, 225), (600, 450), (300, 675), (900, 675)]
for cx, cy in cross_positions:
    t = cx / W
    color = (
        int(180 + (0 - 180) * t),
        int(100 + (140 - 100) * t),
        int(20 + (100 - 20) * t),
        22,
    )
    aztec_cross(draw, cx, cy, 18, color)

layer = layer.filter(ImageFilter.GaussianBlur(radius=6))

# large soft diagonal stripe accent
stripe_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(stripe_layer)
stripe_pts = [(0, H*0.2), (W*0.6, 0), (W, H*0.15), (W*0.4, H*0.45)]
sd.polygon(stripe_pts, fill=(180, 140, 50, 18))
stripe_layer = stripe_layer.filter(ImageFilter.GaussianBlur(radius=40))

img_rgba = img.convert("RGBA")
img_rgba = Image.alpha_composite(img_rgba, stripe_layer)
img_rgba = Image.alpha_composite(img_rgba, layer)

# vignette
vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(vignette)
for i in range(120):
    alpha = int(130 * (i / 120) ** 1.7)
    margin = i * 3
    vd.rectangle([margin, margin, W - margin, H - margin],
                 outline=(0, 0, 0, alpha), width=1)
img_rgba = Image.alpha_composite(img_rgba, vignette)

out = img_rgba.convert("RGB")
out.save("/Users/tinelli/Workstation/PlasticSurf/02 Online/PlasticSurf-KI WebSite/plastic-surf-website/public/images/arizona-eistee-design-marketing.png")
print("Saved arizona eistee image.")
