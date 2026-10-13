#!/usr/bin/env python3
"""Atlante · trasforma un export GeoJSON di OpenStreetMap in una città in pixel art.

Uso:  python3 tools/atlante_build.py export.geojson pesaro "Pesaro" [px_per_metro]

Produce in atlante/:  <id>_day.png, <id>_night.png, <id>.json (etichette, luoghi, vie).
Un pixel = 1 metro (di default). Niente antialiasing: ogni pixel è scelto a mano dall'algoritmo.
Richiede: Pillow, numpy.
"""
import json, math, sys, os, random
import numpy as np
from PIL import Image, ImageDraw

SRC = sys.argv[1]
CID = sys.argv[2]
CNAME = sys.argv[3] if len(sys.argv) > 3 else CID.title()
SC = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'atlante')
os.makedirs(OUT, exist_ok=True)
rnd = random.Random(hash(CID) & 0xffff)
nrs = np.random.RandomState(7)

d = json.load(open(SRC))
F = d['features']

# ---------------------------------------------------------------- proiezione
lons, lats = [], []
def walk(c):
    if isinstance(c[0], (int, float)):
        lons.append(c[0]); lats.append(c[1]); return
    for h in c: walk(h)
for f in F: walk(f['geometry']['coordinates'])
lon0, lon1, lat0, lat1 = min(lons), max(lons), min(lats), max(lats)
kx = 111320 * math.cos(math.radians((lat0 + lat1) / 2)) * SC
ky = 110574 * SC
W = int(math.ceil((lon1 - lon0) * kx)) + 1
H = int(math.ceil((lat1 - lat0) * ky)) + 1
P = lambda c: ((c[0] - lon0) * kx, (lat1 - c[1]) * ky)
print('immagine', W, 'x', H)

def ring(f): return [P(c) for c in f['geometry']['coordinates'][0]]
def line(f): return [P(c) for c in f['geometry']['coordinates']]

polys, lines = [], []
for i, f in enumerate(F):
    p = f['properties']; g = f['geometry']['type']
    if g == 'Polygon': polys.append((i, p, ring(f)))
    elif g == 'LineString': lines.append((i, p, line(f)))

def mask_of(rings, shape=None):
    im = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(im)
    for r in rings:
        if len(r) >= 3: dr.polygon(r, fill=255)
    return np.array(im) > 0

def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
def lerp(a, b, t): return a + (b - a) * t

# ---------------------------------------------------------------- terreno
bld = [(i, p, r) for i, p, r in polys if 'building' in p]
bmask = mask_of([r for _, _, r in bld])
# densità edilizia (integral image) per distinguere centro, periferia e campagna
r_ = int(30 * SC)
ii = np.pad(bmask.astype(np.float32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
ys_, xs_ = np.mgrid[0:H, 0:W]
y0 = np.clip(ys_ - r_, 0, H); y1 = np.clip(ys_ + r_, 0, H); x0 = np.clip(xs_ - r_, 0, W); x1 = np.clip(xs_ + r_, 0, W)
dens = (ii[y1, x1] - ii[y0, x1] - ii[y1, x0] + ii[y0, x0]) / ((y1 - y0) * (x1 - x0) + 1)
del ii, y0, y1, x0, x1
noise = nrs.rand(H, W).astype(np.float32)
bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16
bay = np.tile(bayer, (H // 4 + 1, W // 4 + 1))[:H, :W]

PAVE = [hexc('#cbc1a8'), hexc('#c3b99f')]
GRASS = [hexc('#8fb56a'), hexc('#86ad63'), hexc('#97bc72')]
FIELD = [hexc('#b3b86b'), hexc('#a9b064'), hexc('#bfb16a')]
arr = np.zeros((H, W, 3), np.float32)
checker = ((xs_ // 2 + ys_ // 2) % 2).astype(bool)
pave = np.where(checker[..., None], PAVE[0], PAVE[1])
grass = np.where((noise < .5)[..., None], GRASS[0], np.where((noise < .8)[..., None], GRASS[1], GRASS[2]))
field = np.where(((ys_ // 3) % 2).astype(bool)[..., None], FIELD[0], FIELD[1])
t_dens = dens + (bay - .5) * .10
arr[:] = pave
arr = np.where((t_dens < .20)[..., None], np.where((t_dens < .08)[..., None], field, grass), arr)
# giardini sparsi in zone medie
garden = (t_dens < .30) & (t_dens >= .20) & (noise > .55)
arr = np.where(garden[..., None], grass, arr)
del xs_, ys_, checker, pave, grass, field

# parchi, sabbia, acqua
park_r = [r for _, p, r in polys if p.get('leisure') in ('park', 'garden', 'pitch', 'playground')]
sports_r = [r for _, p, r in polys if p.get('leisure') in ('sports_centre', 'sports_hall', 'stadium')]
sand_r = [r for _, p, r in polys if p.get('natural') == 'beach']
water_r = [r for _, p, r in polys if p.get('natural') == 'water' and p.get('amenity') != 'fountain']
fount_r = [r for _, p, r in polys if p.get('amenity') == 'fountain']
pedpl_r = [r for _, p, r in polys if p.get('highway') in ('pedestrian', 'footway', 'service')]
park_m = mask_of(park_r); sand_m = mask_of(sand_r); water_m = mask_of(water_r); fount_m = mask_of(fount_r)
pedpl_m = mask_of(pedpl_r); sports_m = mask_of(sports_r)
PARKG = [hexc('#6faa58'), hexc('#78b25e'), hexc('#68a252')]
pk = np.where((noise < .45)[..., None], PARKG[0], np.where((noise < .8)[..., None], PARKG[1], PARKG[2]))
arr = np.where(park_m[..., None], pk, arr)
arr = np.where((sports_m & ~bmask)[..., None], hexc('#c4755a'), arr)
arr = np.where(pedpl_m[..., None], np.where((((np.arange(W)[None, :] // 3 + np.arange(H)[:, None] // 3) % 2) == 0)[..., None], hexc('#e3d8bd'), hexc('#d8cdb0')), arr)

# mare: lato esterno della costa ricavato dalle spiagge (PCA lungo la linea di costa)
sea_m = np.zeros((H, W), bool)
dist_sea = np.zeros((H, W), np.float32)
bv = np.array([p for r in sand_r for p in r], np.float64)
if len(bv) > 10:
    c = bv.mean(0)
    u = np.linalg.svd(bv - c, full_matrices=False)[2][0]
    v = np.array([-u[1], u[0]])
    if v[0] - v[1] < 0: v = -v          # il mare sta verso nord-est
    al = (bv - c) @ u; ac = (bv - c) @ v
    nb = 40; edges = np.linspace(al.min(), al.max(), nb + 1)
    fx, fy = [], []
    for b in range(nb):
        s = (al >= edges[b]) & (al <= edges[b + 1])
        if s.any(): fx.append((edges[b] + edges[b + 1]) / 2); fy.append(ac[s].max())
    yy, xx = np.mgrid[0:H, 0:W]
    A = (xx - c[0]) * u[0] + (yy - c[1]) * u[1]; B = (xx - c[0]) * v[0] + (yy - c[1]) * v[1]
    edge = np.interp(A, fx, fy)
    sea_m = B > edge
    dist_sea = np.where(sea_m, B - edge, 0).astype(np.float32)
    del yy, xx, A, B, edge
sea_m &= ~bmask
SEA = [hexc('#2f6fa6'), hexc('#3a7fb5'), hexc('#4a91c4'), hexc('#5ba3d2')]
depth = np.clip(dist_sea / 90, 0, 1)
sea_col = np.zeros((H, W, 3), np.float32)
for ch in range(3): sea_col[..., ch] = lerp(SEA[3][ch], SEA[0][ch], depth) if True else 0
wave = ((np.arange(W)[None, :] // 5 + np.arange(H)[:, None] // 2 * 3) % 11 == 0) & (noise > .35)
sea_col = np.where(wave[..., None], sea_col + 22, sea_col)
arr = np.where(sea_m[..., None], sea_col, arr)
# battigia e schiuma
def shift(m, dx, dy):
    o = np.zeros_like(m)
    ys0, ys1 = max(0, dy), H + min(0, dy); xs0, xs1 = max(0, dx), W + min(0, dx)
    o[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return o
near = np.zeros((H, W), bool)
for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 0), (0, 2), (0, -2)]: near |= shift(sea_m, dx, dy)
foam = near & ~sea_m & (sand_m | ~bmask)
arr = np.where(foam[..., None], hexc('#f4f1e6'), arr)
sandc = np.where((noise < .5)[..., None], hexc('#ecd9a6'), hexc('#e4cf98'))
arr = np.where((sand_m & ~sea_m & ~foam)[..., None], sandc, arr)
# fiume
riv = np.where(((noise < .3) & (np.arange(W)[None, :] % 3 == 0))[..., None], hexc('#5d9fcd'), hexc('#4a8bbd'))
arr = np.where(water_m[..., None], riv, arr)
arr = np.where(fount_m[..., None], hexc('#7cc0e8'), arr)

img = Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); dr = ImageDraw.Draw(img)

# ---------------------------------------------------------------- strade
WID = {'motorway': 12, 'trunk': 11, 'primary': 11, 'secondary': 9, 'tertiary': 8, 'unclassified': 6, 'residential': 6,
       'living_street': 5, 'service': 3.5, 'pedestrian': 5, 'track': 2.5, 'road': 5}
ORDER = ['track', 'service', 'living_street', 'residential', 'unclassified', 'road', 'pedestrian', 'tertiary', 'secondary', 'primary', 'trunk', 'motorway']
SMALL = {'footway': 1.6, 'cycleway': 2, 'path': 1.1, 'steps': 1.8, 'bridleway': 1}
ASPH = hexc('#585c64'); ASPH2 = hexc('#50545c'); SIDE = (0xd8, 0xcf, 0xb6); PEDC = (0xe4, 0xd9, 0xbe)
def tup(c): return tuple(int(x) for x in c)

def thick(dr, pts, w, fill):
    w = max(1, w * SC)
    for a, b in zip(pts, pts[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
        if L < 1e-6: continue
        nx, ny = -dy / L * w / 2, dx / L * w / 2
        dr.polygon([(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)], fill=fill)
    if w >= 2.5:
        r = w / 2
        for p in pts: dr.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=fill)

def layer_of(p):
    try: return int(p.get('layer', 0))
    except: return 0
veh = [(i, p, l) for i, p, l in lines if p.get('highway') in WID and p.get('tunnel') not in ('yes',) and p.get('area') != 'yes']
veh.sort(key=lambda t: (layer_of(t[1]), ORDER.index(t[1]['highway']) if t[1]['highway'] in ORDER else 0))
for i, p, l in veh:
    w = WID[p['highway']]
    thick(dr, l, w + 2.6, PEDC if p['highway'] == 'pedestrian' else SIDE)
for i, p, l in veh:
    w = WID[p['highway']]
    col = tup(hexc('#e9dec3') if p['highway'] == 'pedestrian' else (ASPH if (i % 3) else ASPH2))
    thick(dr, l, w, col)
# ponti: parapetto
for i, p, l in veh:
    if p.get('bridge') in ('yes', 'viaduct'):
        w = WID[p['highway']]
        thick(dr, l, w + 1.2, (0x7b, 0x73, 0x66)); thick(dr, l, w - 1.2, tup(ASPH))
small = [(i, p, l) for i, p, l in lines if p.get('highway') in SMALL and p.get('tunnel') != 'yes']
for i, p, l in small:
    h = p['highway']
    col = {'cycleway': (0xb8, 0x62, 0x4a), 'steps': (0xb6, 0xa9, 0x8c)}.get(h, (0xb0, 0xa4, 0x88))
    if h in ('footway', 'path') and p.get('footway') == 'crossing': col = (0xe8, 0xe4, 0xd0)
    thick(dr, l, SMALL[h], col)
arr = np.array(img).astype(np.float32)

# tratteggio centrale sulle strade principali
img = Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); dr = ImageDraw.Draw(img)
def dashes(pts, on, off):
    out = []; acc = 0; draw = True; seg_on = []
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        if L < 1e-6: continue
        t = 0
        while t < L:
            step = min((on if draw else off) - acc, L - t)
            p0 = (a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L)
            p1 = (a[0] + (b[0] - a[0]) * (t + step) / L, a[1] + (b[1] - a[1]) * (t + step) / L)
            if draw: out.append((p0, p1))
            t += step; acc += step
            if acc >= (on if draw else off) - 1e-6: draw = not draw; acc = 0
    return out
for i, p, l in veh:
    if p['highway'] in ('primary', 'secondary', 'tertiary', 'trunk') and p.get('oneway') != 'yes':
        for a, b in dashes(l, 4 * SC, 4 * SC): dr.line([a, b], fill=(0xd9, 0xd3, 0xae), width=1)
    elif p['highway'] in ('primary', 'secondary', 'tertiary', 'trunk') and p.get('oneway') == 'yes':
        pass
arr = np.array(img).astype(np.float32)
road_m = None

# ---------------------------------------------------------------- auto
CARS = ['#c0392b', '#2c6fb0', '#2f8f4f', '#e6c229', '#e9e9e9', '#2b2f36', '#7a3b8f', '#d9792b', '#8d939b', '#1f8f7f']
img = Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); dr = ImageDraw.Draw(img)
def along(pts, step):
    res = []; acc = step * rnd.random()
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        if L < 1e-6: continue
        while acc < L:
            res.append(((a[0] + (b[0] - a[0]) * acc / L, a[1] + (b[1] - a[1]) * acc / L), math.atan2(b[1] - a[1], b[0] - a[0])))
            acc += step
        acc -= L
    return res
def car(dr, x, y, ang, col):
    c, s = math.cos(ang), math.sin(ang); hl, hw = 2.2, 1.05
    def q(l, w): return (x + c * l - s * w, y + s * l + c * w)
    dr.polygon([q(-hl, -hw), q(hl, -hw), q(hl, hw), q(-hl, hw)], fill=col)
    dr.polygon([q(-.6, -hw + .2), q(.7, -hw + .2), q(.7, hw - .2), q(-.6, hw - .2)], fill=(0x25, 0x2c, 0x3a))
for i, p, l in veh:
    h = p['highway']
    if h not in ('primary', 'secondary', 'tertiary', 'residential', 'unclassified'): continue
    w = WID[h]; gap = {'primary': 24, 'secondary': 30, 'tertiary': 34}.get(h, 60)
    for (x, y), a in along(l, gap * SC):
        if rnd.random() < .5: continue
        off = w * .22 * (1 if rnd.random() < .5 else -1) * SC
        nx, ny = -math.sin(a) * off, math.cos(a) * off
        car(dr, x + nx, y + ny, a, tup(hexc(rnd.choice(CARS))))
arr = np.array(img).astype(np.float32)

# ---------------------------------------------------------------- ombre degli edifici
def levels_of(p, area):
    try:
        if 'building:levels' in p: return max(1, int(float(str(p['building:levels']).split(';')[0])))
    except: pass
    b = p.get('building')
    base = {'apartments': 5, 'hotel': 6, 'residential': 4, 'house': 2, 'detached': 2, 'church': 5, 'cathedral': 6, 'government': 4, 'civic': 4,
            'school': 3, 'hospital': 5, 'industrial': 2, 'retail': 2, 'commercial': 3, 'office': 4, 'shed': 1, 'kiosk': 1, 'roof': 1,
            'garage': 1, 'garages': 1, 'train_station': 3, 'tower': 7}.get(b)
    if base is None: base = 2 if area < 140 else 3 if area < 420 else 4
    return base
bl = []
for i, p, r in bld:
    xs = [a for a, b in r]; ys = [b for a, b in r]
    area = abs(sum(r[k][0] * r[(k + 1) % len(r)][1] - r[(k + 1) % len(r)][0] * r[k][1] for k in range(len(r)))) / 2 / (SC * SC)
    lv = levels_of(p, area)
    hpx = int(round(min(9, max(2, lv * 1.35))) * SC) if SC > 0 else 3
    bl.append(dict(i=i, p=p, r=r, area=area, lv=lv, h=hpx, y=max(ys), x0=min(xs), x1=max(xs), y0=min(ys), y1=max(ys)))
sh = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(sh)
for b in bl:
    for t in range(1, b['h'] + 1):
        dx, dy = t * .75, t * .42
        sd.polygon([(x + dx, y + dy) for x, y in b['r']], fill=255)
shm = np.array(sh) > 0
arr = np.where(shm[..., None], arr * np.array([.74, .76, .86], np.float32), arr)

# ---------------------------------------------------------------- edifici
ROOF_PITCH = ['#b9573c', '#a94b34', '#c4683f', '#9d4a38', '#c8764a', '#b0553f', '#d07b4f']
ROOF_FLAT = ['#bdb9b0', '#aaa69d', '#c7c2b5', '#b3aca0', '#cfc9ba']
ROOF_SPECIAL = {'church': '#7d8e91', 'cathedral': '#86989b', 'hotel': '#e6dcc2', 'industrial': '#9aa1a8', 'shed': '#a3a9ae', 'government': '#c9a35c',
                'civic': '#c9a35c', 'school': '#d9b87a', 'hospital': '#dde3e6', 'retail': '#b7bcc2', 'commercial': '#b9bcc0', 'roof': '#a8786a',
                'train_station': '#9aa7b3', 'kiosk': '#c2a063'}
WALLS = ['#eadcb6', '#e0c79b', '#ede2c6', '#d4be92', '#e6d0a4', '#f0e6cf', '#d9a98a']
bl.sort(key=lambda b: b['y'])
winmask = np.zeros((H, W), np.uint8)
outline = np.zeros((H, W), bool)
bid_img = np.zeros((H, W), np.int32)
for n, b in enumerate(bl):
    r = b['r']; hpx = b['h']; p = b['p']
    mx0 = max(0, int(b['x0']) - 2); my0 = max(0, int(b['y0']) - 2); mx1 = min(W, int(b['x1']) + 3); my1 = min(H, int(b['y1']) + hpx + 3)
    if mx1 <= mx0 or my1 <= my0: continue
    w_, h_ = mx1 - mx0, my1 - my0
    loc = [(x - mx0, y - my0) for x, y in r]
    wall_im = Image.new('L', (w_, h_), 0); wd = ImageDraw.Draw(wall_im)
    for t in range(hpx, 0, -1):
        wd.polygon([(x, y + t) for x, y in loc], fill=min(255, t * 10 + 10))
    roof_im = Image.new('L', (w_, h_), 0); ImageDraw.Draw(roof_im).polygon(loc, fill=255)
    wall = np.array(wall_im); roof = np.array(roof_im) > 0
    wallm = (wall > 0) & ~roof
    rng = random.Random(b['i'] * 7919)
    bt = p.get('building')
    pitched = (p.get('roof:shape') in ('gabled', 'hipped', 'pyramidal', 'half-hipped', 'gambrel')) or (
        'roof:shape' not in p and bt in ('house', 'detached', 'residential', 'yes', 'church', 'cathedral', None) and b['area'] < 420 and b['lv'] <= 3)
    if bt in ROOF_SPECIAL and bt not in ('residential',): base = hexc(ROOF_SPECIAL[bt]) * (.93 + rng.random() * .14)
    elif pitched: base = hexc(rng.choice(ROOF_PITCH))
    else: base = hexc(rng.choice(ROOF_FLAT))
    if bt in ('church', 'cathedral'): pitched = True
    region = arr[my0:my1, mx0:mx1]
    # pareti: sfumatura chiara in alto, scura in basso
    wc = hexc(rng.choice(WALLS))
    tt = (wall.astype(np.float32) - 10) / 10 / max(hpx, 1)
    wallcol = wc[None, None, :] * (1.0 - .30 * tt[..., None])
    region[wallm] = wallcol[wallm]
    winmask[my0:my1, mx0:mx1][wallm] = max(hpx, 1)
    bid_img[my0:my1, mx0:mx1][roof] = n + 1
    # tetto
    ys_l, xs_l = np.nonzero(roof)
    if len(xs_l) == 0: continue
    roofcol = np.broadcast_to(base, (h_, w_, 3)).copy()
    if pitched:
        pts = np.array(loc); c0 = pts.mean(0); cv = np.cov((pts - c0).T) if len(pts) > 2 else np.eye(2)
        ev, evec = np.linalg.eigh(cv); main = evec[:, 1]; cross = np.array([-main[1], main[0]])
        yy, xx = np.mgrid[0:h_, 0:w_]
        cd = (xx - c0[0]) * cross[0] + (yy - c0[1]) * cross[1]
        half = max(np.abs(cd[roof]).max(), 1)
        k = cd / half
        shade = np.where(k < -.12, 1.16, np.where(k > .12, .80, 1.32))
        roofcol = base[None, None, :] * shade[..., None]
        # coppi: righe sottili
        lines_ = ((np.round((xx * main[0] + yy * main[1])) % 2) == 0)
        roofcol = np.where((lines_ & (k.__abs__() > .12))[..., None], roofcol * .95, roofcol)
    else:
        er = roof.copy()
        for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            s = np.zeros_like(roof); ys0, ys1 = max(0, dy), h_ + min(0, dy); xs0, xs1 = max(0, dx), w_ + min(0, dx)
            s[ys0:ys1, xs0:xs1] = roof[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]; er &= s
        inner = er
        roofcol = np.where(roof[..., None], base[None, None, :] * .94, roofcol)
        roofcol = np.where(inner[..., None], base[None, None, :], roofcol)
        # volumi tecnici sul tetto piano
        if b['area'] > 110:
            for _ in range(int(b['area'] / 90)):
                j = rng.randrange(len(xs_l)); px, py = xs_l[j], ys_l[j]
                if inner[min(py + 1, h_ - 1), min(px + 1, w_ - 1)] and inner[py, px]:
                    roofcol[py:py + 2, px:px + 2] = base * (.74 if rng.random() < .5 else 1.07)
    region[roof] = roofcol[roof]
    # contorno scuro
    er2 = roof.copy()
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        s = np.zeros_like(roof); ys0, ys1 = max(0, dy), h_ + min(0, dy); xs0, xs1 = max(0, dx), w_ + min(0, dx)
        s[ys0:ys1, xs0:xs1] = roof[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]; er2 &= s
    edge = roof & ~er2
    region[edge] = region[edge] * .62
    # base della parete
    bottom = wallm & (wall <= 20)
    region[(wall > 0) & ~roof & (wall >= 10 * hpx)] *= .8
    outline[my0:my1, mx0:mx1] |= edge

# finestre sulle pareti (solo se alte almeno 3 px)
yy, xx = np.mgrid[0:H, 0:W]
win = (winmask >= 3) & ((xx % 3) == 1) & ((yy % 3) == 1)
arr = np.where(win[..., None], arr * np.array([.55, .6, .72], np.float32) + np.array([8, 14, 28]), arr)
del yy, xx

# ---------------------------------------------------------------- alberi
def poly_pts(r, gap, mask_ok):
    xs = [a for a, b in r]; ys = [b for a, b in r]; m = Image.new('L', (W, H), 0)
    return None
tree_cols = [hexc('#3b7a3a'), hexc('#4a8a40'), hexc('#32693a'), hexc('#58963f')]
trees = []
occupied = bmask | road_m if road_m is not None else bmask
# maschera strade per evitare alberi in carreggiata
rm_im = Image.new('L', (W, H), 0); rd_ = ImageDraw.Draw(rm_im)
for i, p, l in veh: thick(rd_, l, WID[p['highway']] + 1.5, 255)
for i, p, l in small: thick(rd_, l, SMALL[p['highway']] + 1, 255)
roadm = np.array(rm_im) > 0
for r in park_r:
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(r, fill=255)
    xs = [a for a, b in r]; ys = [b for a, b in r]
    ox, oy = int(min(xs)), int(min(ys)); sub = np.array(m.crop((ox, oy, int(max(xs)) + 1, int(max(ys)) + 1))) > 0
    area = sub.sum(); n_try = int(area / 38)
    pts = np.argwhere(sub)
    if len(pts) == 0: continue
    for _ in range(n_try):
        py, px = pts[rnd.randrange(len(pts))]; x, y = ox + px, oy + py
        if bmask[y, x] or roadm[y, x] or water_m[y, x]: continue
        trees.append((x, y, rnd.uniform(2.0, 3.6) * SC, rnd.randrange(4)))
# alberi sui viali
for i, p, l in veh:
    if p['highway'] in ('primary', 'secondary', 'tertiary') and p.get('name', '').startswith('Viale'):
        w = WID[p['highway']]
        for (x, y), a in along(l, 13 * SC):
            for sgn in (-1, 1):
                off = (w / 2 + 2.6) * SC * sgn
                tx, ty = x - math.sin(a) * off, y + math.cos(a) * off
                if 0 <= tx < W and 0 <= ty < H and not bmask[int(ty), int(tx)] and rnd.random() < .85:
                    trees.append((tx, ty, rnd.uniform(1.8, 2.6) * SC, rnd.randrange(4)))
# alberi sparsi nelle zone verdi/campagna
for _ in range(int(W * H / 5200)):
    x, y = rnd.randrange(W), rnd.randrange(H)
    if dens[y, x] < .22 and not (bmask[y, x] or roadm[y, x] or water_m[y, x] or sea_m[y, x] or sand_m[y, x]):
        trees.append((x, y, rnd.uniform(1.8, 3.2) * SC, rnd.randrange(4)))
trees.sort(key=lambda t: t[1])
# ombre degli alberi
sh = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(sh)
for x, y, r_, c in trees: sd.ellipse([x - r_ + 1.4, y - r_ + 1.6, x + r_ + 1.4, y + r_ + 1.6], fill=255)
arr = np.where((np.array(sh) > 0)[..., None] & ~bmask[..., None], arr * np.array([.7, .74, .82], np.float32), arr)
img = Image.fromarray(np.clip(arr,0,255).astype(np.uint8)); dr = ImageDraw.Draw(img)
for x, y, r_, c in trees:
    col = tup(tree_cols[c])
    dr.ellipse([x - r_, y - r_ - 1, x + r_, y + r_ - 1], fill=col)
    hl = tup(np.clip(tree_cols[c] * 1.28, 0, 255))
    dr.ellipse([x - r_ * .65, y - r_ * .95 - 1, x + r_ * .15, y - r_ * .15 - 1], fill=hl)
    dk = tup(tree_cols[c] * .72)
    dr.arc([x - r_, y - r_ - 1, x + r_, y + r_ - 1], 20, 160, fill=dk)
arr = np.array(img).astype(np.float32)

# ---------------------------------------------------------------- lampioni e notte
lamps = []
for i, p, l in veh:
    if p['highway'] in ('primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street', 'pedestrian'):
        w = WID[p['highway']]
        for (x, y), a in along(l, 26 * SC):
            off = (w / 2 + 1.3) * SC
            lamps.append((x - math.sin(a) * off, y + math.cos(a) * off))
day = arr.clip(0, 255).astype(np.uint8)

def quant(a, n):
    im = Image.fromarray(a).quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return im

night = arr.copy() * np.array([.30, .38, .62], np.float32) + np.array([4, 8, 22], np.float32)
# vetrine e finestre accese
yy, xx = np.mgrid[0:H, 0:W]
lit = (winmask >= 3) & ((xx % 3) == 1) & ((yy % 3) == 1) & (nrs.rand(H, W) < .55)
night = np.where(lit[..., None], np.array([255, 214, 120], np.float32), night)
del yy, xx
glow = np.zeros((H, W, 3), np.float32)
R = int(11 * SC)
gy, gx = np.mgrid[-R:R + 1, -R:R + 1]
gd = np.hypot(gx, gy); g = np.clip(1 - gd / R, 0, 1) ** 2
for x, y in lamps:
    xi, yi = int(x), int(y)
    ya, yb, xa, xb = max(0, yi - R), min(H, yi + R + 1), max(0, xi - R), min(W, xi + R + 1)
    if ya >= yb or xa >= xb: continue
    gg = g[ya - (yi - R):yb - (yi - R), xa - (xi - R):xb - (xi - R)]
    glow[ya:yb, xa:xb] += gg[..., None] * np.array([255, 190, 100], np.float32) * .55
night = night + glow * (1 - bmask[..., None] * .6)
night = np.where(sea_m[..., None], night * .85 + np.array([0, 4, 14]), night)
for x, y in lamps:
    xi, yi = int(x), int(y)
    if 0 <= xi < W and 0 <= yi < H: night[yi, xi] = [255, 236, 170]
night = night.clip(0, 255).astype(np.uint8)

quant(day, 96).save(os.path.join(OUT, CID + '_day.png'), optimize=True)
quant(night, 96).save(os.path.join(OUT, CID + '_night.png'), optimize=True)

# ---------------------------------------------------------------- dati: vie e luoghi
def centroid(r):
    a = 0; cx = 0; cy = 0
    for k in range(len(r) - 1):
        f = r[k][0] * r[k + 1][1] - r[k + 1][0] * r[k][1]; a += f; cx += (r[k][0] + r[k + 1][0]) * f; cy += (r[k][1] + r[k + 1][1]) * f
    if abs(a) < 1e-6: return (sum(x for x, y in r) / len(r), sum(y for x, y in r) / len(r))
    return (cx / (3 * a), cy / (3 * a))
streets = {}
for i, p, l in lines:
    nm = p.get('name')
    if not nm or p.get('highway') not in WID and p.get('highway') not in SMALL: continue
    L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(l, l[1:]))
    streets.setdefault(nm, []).append((L, l, p.get('highway')))
st_out = []
for nm, ws in streets.items():
    ws.sort(key=lambda t: -t[0])
    tot = sum(t[0] for t in ws)
    for L, l, hw in ws[:6]:
        if L < 40 * SC: continue
        n_an = max(1, int(L // (200 * SC)))
        for k in range(n_an):
            target = L * (k + .5) / n_an; acc = 0
            for a_, b_ in zip(l, l[1:]):
                sl = math.hypot(b_[0] - a_[0], b_[1] - a_[1])
                if sl > 0 and acc + sl >= target:
                    t = (target - acc) / sl; x = a_[0] + (b_[0] - a_[0]) * t; y = a_[1] + (b_[1] - a_[1]) * t
                    ang = math.degrees(math.atan2(b_[1] - a_[1], b_[0] - a_[0]))
                    if ang > 90: ang -= 180
                    if ang < -90: ang += 180
                    st_out.append(dict(n=nm, x=round(x, 1), y=round(y, 1), a=round(ang, 1), c=hw, l=round(tot / SC)))
                    break
                acc += sl
KIND = {'hotel': 'hotel', 'church': 'chiesa', 'cathedral': 'chiesa', 'school': 'scuola', 'kindergarten': 'scuola', 'government': 'palazzo', 'civic': 'palazzo',
        'hospital': 'ospedale', 'retail': 'negozio', 'commercial': 'negozio', 'office': 'ufficio', 'train_station': 'stazione', 'industrial': 'industria'}
pois = []
for i, p, r in polys:
    nm = p.get('name')
    if not nm: continue
    k = None
    if p.get('leisure') == 'park': k = 'parco'
    elif p.get('natural') == 'beach': k = 'spiaggia'
    elif p.get('natural') == 'water' and not p.get('amenity'): k = 'acqua'
    elif p.get('amenity') == 'theatre': k = 'teatro'
    elif p.get('amenity') == 'place_of_worship': k = 'chiesa'
    elif p.get('amenity') == 'school' or p.get('building') in ('school',): k = 'scuola'
    elif p.get('tourism') == 'hotel' or p.get('building') == 'hotel': k = 'hotel'
    elif p.get('historic'): k = 'storico'
    elif p.get('amenity'): k = p['amenity']
    elif 'building' in p: k = KIND.get(p['building'])
    if not k: continue
    cx, cy = centroid(r)
    ad = ' '.join(x for x in [p.get('addr:street'), p.get('addr:housenumber')] if x)
    pois.append(dict(n=nm, k=k, x=round(cx, 1), y=round(cy, 1), a=ad))
meta = dict(id=CID, name=CNAME, w=W, h=H, scale=SC, bbox=[lon0, lat0, lon1, lat1], streets=st_out, pois=pois,
            copyright='© Contributori di OpenStreetMap (ODbL)')
json.dump(meta, open(os.path.join(OUT, CID + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('vie', len(st_out), 'luoghi', len(pois), 'alberi', len(trees), 'lampioni', len(lamps))
