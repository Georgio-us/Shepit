#!/usr/bin/env python3
"""Create the three downloadable SHEPIT HOUSE residence brochures."""

from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "output" / "pdf"
CACHE = ROOT / "tmp" / "pdfs" / "images"
PAGE_W, PAGE_H = A4
OLIVE = HexColor("#252C19")
OLIVE_LIGHT = HexColor("#E8E9D6")
INK = HexColor("#20211D")
MUTED = HexColor("#73766C")
LINE = HexColor("#D8D9D1")
GRAPHITE = HexColor("#202123")
GRAPHITE_SOFT = HexColor("#303234")
CONTACTS = {
    "address": "Київська область, Вишгородський район, с. Нові Петрівці, вул. Лісова",
    "hours": "Щодня 09:00–19:00",
    "phone": "+38 (095) 073 43 76",
    "email": "shepit.house@gmail.com",
}
TITLE_IMAGE = "duplex_visual_1.webp"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

MODELS = {
    "T92": {
        "type": "Таунхаус", "area": "100 м²", "parcel": "1,5 сотки", "bedrooms": "3", "price": "Ціна за запитом",
        "description": "Компактна приватна резиденція для сім'ї: три спальні, власний двір, тераса та два паркомісця.",
        "gallery": ["townhouse-front-night.webp", "townhouse-back-day.webp", "townhouse-back-night.webp"],
        "plans": ["92_Tаунхаус_3_1 этаж.png", "92_Tаунхаус_3_2 этаж.png"],
        "current": "05", "pin_v2": (0.54, 0.258),
        "rooms": [[("Тамбур", "2,24 м²"), ("Кабінет", "8,21 м²"), ("Хол", "3,00 м²"), ("Санвузол", "5,99 м²"), ("Сходи", "2,16 м²"), ("Кухня-студія", "23,73 м²")], [("Хол", "3,17 м²"), ("Спальня 01", "9,89 м²"), ("Спальня 02", "10,85 м²"), ("Спальня 03", "12,12 м²"), ("Сходи", "4,32 м²"), ("Санвузол", "6,63 м²")]],
    },
    "T102": {
        "type": "Таунхаус", "area": "120 м²", "parcel": "2,8 сотки", "bedrooms": "4", "price": "Ціна за запитом",
        "description": "Збільшений формат таунхауса з просторою денною зоною, чотирма спальнями та приватною територією.",
        "gallery": ["townhouse-front-day.webp", "townhouse-back-day.webp", "townhouse-back-night.webp"],
        "plans": ["102_Tаунхаус_4_1 этаж.png", "102_Tаунхаус_4_2 этаж.png"],
        "current": "03", "pin_v2": (0.39, 0.258),
        "rooms": [[("Спальня", "12,04 м²"), ("Тамбур", "2,36 м²"), ("Санвузол", "5,99 м²"), ("Сходи", "2,16 м²"), ("Хол", "3,21 м²"), ("Кухня-студія", "28,7 м²")], [("Сходи", "4,32 м²"), ("Хол", "3,17 м²"), ("Спальня 01", "14,63 м²"), ("Спальня 02", "15,33 м²"), ("Спальня 03", "12,12 м²"), ("Санвузол", "6,63 м²")]],
    },
    "D101": {
        "type": "Дуплекс", "area": "101 м²", "parcel": "1,6 сотки", "bedrooms": "4", "price": "Ціна за запитом",
        "description": "Просторий дуплекс для великої родини: чотири спальні, власний двір, тераса та окремий вхід.",
        "gallery": ["duplex-front-night.webp", "duplex-back-day.webp", "duplex-back-night.webp"],
        "plans": ["101_Дуплекс_2_1этаж.png", "101_Дуплекс_2_2этаж.png"],
        "current": "01", "pin_v2": (0.385, 0.52),
        "rooms": [[("Тамбур", "2,36 м²"), ("Кухня-вітальня", "26,67 м²"), ("Гостьова спальня", "9,26 м²"), ("Санвузол", "4,4 м²"), ("Хол", "3,21 м²"), ("Сходи", "2,16 м²")], [("Хол", "3,17 м²"), ("Спальня 01", "11,47 м²"), ("Спальня 02", "13,01 м²"), ("Спальня 03", "12,77 м²"), ("Сходи", "4,32 м²"), ("Санвузол", "6,63 м²")]],
    },
}

SPECIFICATION_GROUPS = [
    ("Конструктивні елементи", [
        ("Фундамент", "залізобетонний, монолітний, стрічковий"),
        ("Стіни", "піноблок"),
        ("Сходи", "внутрішні монолітні"),
        ("Фасад", "утеплення мінеральною ватою"),
        ("Вікна", "енергозберігаючі, двокамерний склопакет"),
        ("Дах", "металочерепиця, утеплення мінеральною ватою"),
    ]),
    ("Інженерні мережі", [
        ("Водопостачання", "ввід холодної води від власних свердловин комплексу"),
        ("Водовідведення", "підведене до резиденції"),
        ("Електрика", "ввід електричної мережі до 10 кВт"),
        ("Газ", "ввід газу з лічильником"),
        ("Інтернет", "оптоволоконний кабель швидкісного інтернету"),
    ]),
    ("Енергоефективність", [
        ("Сонячні панелі", "плаский дах із можливістю монтажу сонячних панелей"),
        ("Резервне живлення", "технічне приміщення для гібридного інвертора та акумуляторних батарей"),
    ]),
]


def register_fonts():
    pdfmetrics.registerFont(TTFont("Shepit", FONT_REGULAR))
    pdfmetrics.registerFont(TTFont("ShepitBold", FONT_BOLD))


def prepared_image(filename):
    """Downsample source renders before embedding them in a screen PDF."""
    source = ASSETS / filename
    target = CACHE / f"{source.stem}.jpg"
    CACHE.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        with Image.open(source) as source_image:
            source_image = source_image.convert("RGB")
            source_image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            source_image.save(target, "JPEG", quality=84, optimize=True, progressive=True)
    return target


def image(c, filename, x, y, width, height):
    source = prepared_image(filename)
    reader = ImageReader(str(source))
    iw, ih = reader.getSize()
    scale = max(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    path = c.beginPath()
    path.rect(x, y, width, height)
    c.clipPath(path, stroke=0, fill=0)
    c.drawImage(reader, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def image_contain(c, filename, x, y, width, height, source=False):
    """Place plans intact - never crop or resample their visual composition."""
    path = ASSETS / filename if source else prepared_image(filename)
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    scale = min(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(reader, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh, mask="auto")


def gradient(c, x, y, width, height, start, end, steps=100):
    for step in range(steps):
        t = step / (steps - 1)
        color = Color(start.red + (end.red - start.red) * t, start.green + (end.green - start.green) * t, start.blue + (end.blue - start.blue) * t)
        c.setFillColor(color)
        c.rect(x, y + height * step / steps, width, height / steps + 1, fill=1, stroke=0)


def small_rule(c, x, y, width, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(.55)
    c.line(x, y, x + width, y)


def text(c, value, x, y, size=10, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("ShepitBold" if bold else "Shepit", size)
    c.drawString(x, y, value)


def wrapped(c, value, x, y, width, leading=14, size=10, color=INK):
    c.setFillColor(color)
    c.setFont("Shepit", size)
    words, line, lines = value.split(), [], []
    for word in words:
        test = " ".join(line + [word])
        if c.stringWidth(test, "Shepit", size) > width and line:
            lines.append(" ".join(line))
            line = [word]
        else:
            line.append(word)
    if line:
        lines.append(" ".join(line))
    for index, line in enumerate(lines):
        c.drawString(x, y - index * leading, line)
    return y - len(lines) * leading


def header(c, code, page, dark=False):
    foreground = white if dark else INK
    rule_color = Color(1, 1, 1, alpha=.28) if dark else LINE
    text(c, "SHEPIT", 42, PAGE_H - 38, 11, foreground, True)
    text(c, "HOUSE", 88, PAGE_H - 38, 11, foreground)
    text(c, f"{code}  /  {page:02d}", PAGE_W - 95, PAGE_H - 38, 9, foreground)
    small_rule(c, 42, PAGE_H - 51, PAGE_W - 84, rule_color)


def cover(c, code, model):
    # The source is a 16:9 render. Keeping it in a matching frame prevents the
    # close-up crop that the previous full-page cover produced.
    c.setFillColor(OLIVE); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "SHEPIT", 42, PAGE_H - 51, 12, white, True); text(c, "HOUSE", 89, PAGE_H - 51, 12, white)
    text(c, "ПРИВАТНА РЕЗИДЕНЦІЯ  ·  НОВІ ПЕТРІВЦІ", 42, PAGE_H - 76, 8.5, white)
    image(c, TITLE_IMAGE, 0, 390, PAGE_W, 332)
    small_rule(c, 42, 359, PAGE_W - 84, Color(1, 1, 1, alpha=.32))
    text(c, code, 42, 264, 53, white)
    text(c, model["type"], 44, 238, 15, white)
    text(c, f"{model['area']}   /   {model['bedrooms']} СПАЛЬНІ   /   {model['parcel'].upper()}", 44, 205, 10, white)
    text(c, model["price"].upper(), 44, 122, 15, white)
    # A distinct contact card makes the lower part of the cover intentional,
    # rather than leaving the sales details as a small block of loose text.
    card_x, card_y, card_w, card_h = 342, 113, 211, 134
    c.setFillColor(Color(1, 1, 1, alpha=.075))
    c.roundRect(card_x, card_y, card_w, card_h, 10, fill=1, stroke=0)
    c.setStrokeColor(Color(1, 1, 1, alpha=.3)); c.setLineWidth(.6)
    c.roundRect(card_x, card_y, card_w, card_h, 10, fill=0, stroke=1)
    text(c, "ВІДДІЛ ПРОДАЖУ", card_x + 16, card_y + 105, 8.5, OLIVE_LIGHT, True)
    small_rule(c, card_x + 16, card_y + 91, card_w - 32, Color(1, 1, 1, alpha=.28))
    text(c, CONTACTS["hours"], card_x + 16, card_y + 70, 10.5, white, True)
    text(c, CONTACTS["phone"], card_x + 16, card_y + 43, 10.5, white, True)
    text(c, CONTACTS["email"], card_x + 16, card_y + 21, 9, white)


def lifestyle(c, code, model):
    c.setFillColor(OLIVE); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    header(c, code, 2, True)
    text(c, "Простір,", 42, PAGE_H - 118, 34, white)
    text(c, "продуманий для життя.", 42, PAGE_H - 155, 34, white)
    wrapped(c, model["description"], 42, PAGE_H - 190, 360, 15, 10.5, OLIVE_LIGHT)
    image(c, model["gallery"][0], 42, 294, 250, 174)
    image(c, model["gallery"][1], 307, 294, 246, 174)
    image(c, model["gallery"][2], 42, 61, 511, 202)
    small_rule(c, 42, 279, 511, Color(1, 1, 1, alpha=.24))
    text(c, "01", 42, 271, 6.5, OLIVE_LIGHT)
    text(c, "02", 307, 271, 6.5, OLIVE_LIGHT)
    text(c, "03", 42, 47, 6.5, OLIVE_LIGHT)
    metrics = [("Площа", model["area"]), ("Ділянка", model["parcel"]), ("Спальні", model["bedrooms"])]
    for index, (label, value) in enumerate(metrics):
        x = 42 + index * 171
        small_rule(c, x, 515, 138, Color(1, 1, 1, alpha=.35))
        text(c, value, x, 535, 18, white)
        text(c, label.upper(), x, 500, 8, OLIVE_LIGHT)


def plan_page(c, code, model, floor):
    gradient(c, 0, 0, PAGE_W, PAGE_H, GRAPHITE_SOFT, GRAPHITE)
    header(c, code, 3 + floor, True)
    text(c, f"0{floor + 1}", 42, PAGE_H - 140, 13, OLIVE_LIGHT)
    text(c, "Перший поверх" if floor == 0 else "Другий поверх", 42, PAGE_H - 182, 32, white)
    text(c, "Планування резиденції", 42, PAGE_H - 205, 10, OLIVE_LIGHT)
    c.setFillColor(HexColor("#F5F4EE")); c.roundRect(42, 178, PAGE_W - 84, 365, 20, fill=1, stroke=0)
    image_contain(c, model["plans"][floor], 70, 195, PAGE_W - 140, 330, source=True)
    small_rule(c, 42, 157, PAGE_W - 84, Color(1, 1, 1, alpha=.3))
    for index, (name, area) in enumerate(model["rooms"][floor]):
        x = 42 + (index % 2) * 255
        y = 128 - (index // 2) * 29
        text(c, name, x, y, 10, white, True)
        c.setFont("ShepitBold", 10); c.setFillColor(OLIVE_LIGHT); c.drawRightString(x + 230, y, area)


def details(c, code, model):
    c.setFillColor(HexColor("#F4F3EE")); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    header(c, code, 5)
    text(c, "Технічні характеристики", 42, PAGE_H - 106, 25, OLIVE)
    text(c, "та розташування.", 42, PAGE_H - 138, 25, OLIVE)
    # Three short columns retain the complete specification without turning
    # this final page into a long technical appendix.
    column_w = 156
    for column, (group_title, items) in enumerate(SPECIFICATION_GROUPS):
        x, y = 42 + column * 171, 615
        text(c, group_title.upper(), x, y, 8.1, OLIVE, True)
        small_rule(c, x, y - 10, column_w, LINE)
        cursor = y - 25
        for number, (title, body) in enumerate(items, start=1):
            text(c, f"{number:02d}", x, cursor, 6.8, MUTED, True)
            text(c, title, x + 18, cursor, 7.5, OLIVE, True)
            cursor = wrapped(c, body, x + 18, cursor - 10, column_w - 18, 8.3, 7.1, MUTED) - 8

    text(c, "Резиденція на генплані", 42, 365, 16, OLIVE)
    map_x, map_y, map_w, map_h = 42, 96, 390, 247
    image(c, "genplan-ajusted.webp", map_x, map_y, map_w, map_h)
    pin_x = map_x + map_w * model["pin_v2"][0]
    pin_y = map_y + map_h * (1 - model["pin_v2"][1])
    c.setFillColor(white)
    c.circle(pin_x, pin_y, 11, fill=1, stroke=0)
    c.setStrokeColor(OLIVE); c.setLineWidth(1.4); c.circle(pin_x, pin_y, 17, stroke=1, fill=0)
    c.setFillColor(OLIVE)
    c.setFont("Shepit", 7); c.drawCentredString(pin_x, pin_y - 2.5, model["current"])

    # Horizontal contact footer: a compact, readable closing element that
    # keeps the address, hours and sales contacts together.
    c.setFillColor(OLIVE)
    c.roundRect(42, 25, PAGE_W - 84, 53, 8, fill=1, stroke=0)
    footer_x = [58, 205, 330, 448]
    for divider_x in [190, 315, 433]:
        c.setStrokeColor(Color(1, 1, 1, alpha=.25)); c.setLineWidth(.5)
        c.line(divider_x, 39, divider_x, 64)
    text(c, "SHEPIT HOUSE", footer_x[0], 59, 7.2, OLIVE_LIGHT, True)
    wrapped(c, "Київська обл., Вишгородський р-н, Нові Петрівці, вул. Лісова", footer_x[0], 47, 120, 7.8, 6.8, white)
    text(c, "ВІДДІЛ ПРОДАЖУ", footer_x[1], 59, 7.2, OLIVE_LIGHT, True)
    text(c, CONTACTS["hours"], footer_x[1], 43, 8, white, True)
    text(c, CONTACTS["phone"], footer_x[2], 59, 8.1, white, True)
    text(c, CONTACTS["email"], footer_x[2], 43, 7.2, white)
    text(c, "Уточніть деталі", footer_x[3], 59, 7.2, OLIVE_LIGHT, True)
    wrapped(c, "у менеджера відділу продажу.", footer_x[3], 47, 88, 8.3, 7.1, white)


def build(code, model):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    filename = OUTPUT / f"shepit-house-{code.lower()}.pdf"
    c = canvas.Canvas(str(filename), pagesize=A4, pageCompression=1, title=f"SHEPIT HOUSE {code}", author="SHEPIT HOUSE")
    cover(c, code, model); c.showPage()
    lifestyle(c, code, model); c.showPage()
    plan_page(c, code, model, 0); c.showPage()
    plan_page(c, code, model, 1); c.showPage()
    details(c, code, model); c.showPage()
    c.save()
    print(filename.relative_to(ROOT))


if __name__ == "__main__":
    register_fonts()
    for residence_code, residence_model in MODELS.items():
        build(residence_code, residence_model)
