#!/usr/bin/env python3
"""Bigudi Club · biletimGO etkinlik senkronu.

biletimGO'daki mekan sayfasını okur, yaklaşan etkinlikleri ve afişleri çeker,
panelden eklenen etkinliklerle (ek-etkinlikler.json) birleştirip etkinlikler.json yazar.
Site bu dosyayı okur. GitHub Actions ile her gün otomatik çalışır; elle de çalıştırılabilir:
    python3 etkinlik-guncelle.py
"""
import html, json, os, re, sys, urllib.request
from datetime import datetime, timedelta, timezone

VENUE = 'https://www.biletimgo.com/mekan/bigudi-club-274'
BASE = 'https://www.biletimgo.com/'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
HERE = os.path.dirname(os.path.abspath(__file__))
AFIS_DIR = os.path.join(HERE, 'gorseller', 'afis', 'oto')
IST = timezone(timedelta(hours=3))
AYLAR = {'Ocak': 1, 'Şubat': 2, 'Mart': 3, 'Nisan': 4, 'Mayıs': 5, 'Haziran': 6, 'Temmuz': 7, 'Ağustos': 8, 'Eylül': 9, 'Ekim': 10, 'Kasım': 11, 'Aralık': 12}
KATEGORI = [('tr', r'tr[- ]?pop|manifam|manifest|aura|crush|türkçe|mantra|radikal'),
            ('world', r'k-?pop|latin|reggaeton|bad bunny|afro|j-?pop'),
            ('pop', r'britney|gaga|ariana|taylor|diva|beyonc|charli|brat|lana|sabrina|dua|rihanna|pop')]


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Referer': BASE})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def text(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    return re.sub(r'[ \t]+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def parse_venue(page):
    out = []
    for card in re.findall(r'<div data-sira="\d+" class="etkinlikarakutu".*?etkinlikarakutubuton[^>]*>', page, re.S):
        link = re.search(r'href="(?:\.\./)*(etkinlik/[^"]+)"', card)
        img = re.search(r"url\('(?:\.\./)*(images/[^']+)'\)", card)
        title = re.search(r'<h2>(.*?)</h2>', card, re.S)
        dates = re.findall(r'etkinlikaragun">(\d+)</span>\s*<span class="etkinlikaraay">\s*([^<\s]+)<br>.*?etkinlikarayil">\s*(\d{4})<br>\s*<span class="etkinlikarasaat">(\d\d:\d\d)', card, re.S)
        if not (link and title and dates):
            continue
        def dt(d):
            g, ay, y, saat = d
            h, m = map(int, saat.split(':'))
            return datetime(int(y), AYLAR.get(ay, 1), int(g), h, m, tzinfo=IST)
        bas = dt(dates[0]); bit = dt(dates[1]) if len(dates) > 1 else bas + timedelta(hours=5)
        out.append({'baslik': text(title.group(1)), 'baslangic': bas, 'bitis': bit,
                    'bilet': BASE + link.group(1), 'afis_url': BASE + img.group(1) if img else '', 'slug': link.group(1).split('/')[-1]})
    return out


def ozet(url):
    try:
        t = text(get(url).decode('utf-8', 'ignore'))
    except Exception:
        return ''
    m = re.search(r'Etkinlik Detay(.*?)Etkinlik Kuralları', t, re.S)
    s = re.sub(r'\s+', ' ', m.group(1)).strip() if m else ''
    if len(s) > 190:
        s = s[:190].rsplit(' ', 1)[0] + '…'
    return s


def kucult(raw, path):
    """Afişi 900 px JPEG olarak kaydeder (Pillow ya da macOS sips varsa)."""
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((900, 900))
        im.save(path, 'JPEG', quality=76, optimize=True); return
    except ImportError:
        pass
    tmp = path + '.src'
    open(tmp, 'wb').write(raw)
    if os.system(f'sips -s format jpeg -s formatOptions 76 -Z 900 "{tmp}" --out "{path}" >/dev/null 2>&1') != 0:
        os.replace(tmp, path)
    elif os.path.exists(tmp):
        os.remove(tmp)


def kategori(s):
    s = s.lower()
    for k, rx in KATEGORI:
        if re.search(rx, s):
            return k
    return 'theme'


def main():
    now = datetime.now(IST)
    page = get(VENUE).decode('utf-8', 'ignore')
    evs = [e for e in parse_venue(page) if e['bitis'] > now]
    os.makedirs(AFIS_DIR, exist_ok=True)
    keep = set()
    for e in evs:
        e['ozet'] = ozet(e['bilet'])
        k = kategori(e['baslik'])
        e['kategori'] = k if k != 'theme' else kategori(e['ozet'])
        if e['afis_url']:
            fn = e['slug'] + '.jpg'
            path = os.path.join(AFIS_DIR, fn)
            if not os.path.exists(path):
                try:
                    kucult(get(e['afis_url']), path)
                except Exception as x:
                    print('afiş indirilemedi', e['slug'], x, file=sys.stderr)
            if os.path.exists(path):
                e['afis'] = 'gorseller/afis/oto/' + fn
                keep.add(fn)
    for f in os.listdir(AFIS_DIR):  # geçmiş etkinliklerin afişlerini temizle
        if f not in keep:
            os.remove(os.path.join(AFIS_DIR, f))

    # panelden elle eklenenler ve gizlenenler
    ek, gizli = [], set()
    p = os.path.join(HERE, 'ek-etkinlikler.json')
    if os.path.exists(p):
        data = json.load(open(p, encoding='utf-8'))
        ek = [x for x in data.get('etkinlikler', []) if datetime.fromisoformat(x['bitis']).replace(tzinfo=IST) > now]
        gizli = set(data.get('gizli', []))

    liste = [{'baslik': e['baslik'], 'baslangic': e['baslangic'].strftime('%Y-%m-%dT%H:%M'), 'bitis': e['bitis'].strftime('%Y-%m-%dT%H:%M'),
              'bilet': e['bilet'], 'afis': e.get('afis') or e['afis_url'], 'ozet': e['ozet'], 'kategori': e['kategori'], 'kaynak': 'biletimgo', 'id': e['slug']}
             for e in evs if e['slug'] not in gizli] + [dict(x, kaynak='panel') for x in ek]
    liste.sort(key=lambda x: x['baslangic'])
    json.dump({'guncelleme': now.strftime('%Y-%m-%dT%H:%M'), 'kaynak': VENUE, 'etkinlikler': liste},
              open(os.path.join(HERE, 'etkinlikler.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(liste)} etkinlik yazıldı ({len(evs)} biletimGO, {len(ek)} panel).')


if __name__ == '__main__':
    main()
