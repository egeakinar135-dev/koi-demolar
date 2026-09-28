/* Klinik Psikolog Burak Bolat · Koi Ajans */
(() => {
const WA = '905316818785';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* Dosyadan açılınca klasör bağlantıları index.html'e gitsin */
if (location.protocol === 'file:') $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (/^(?!https?:|mailto:|tel:|#).*\/(#.*)?$/.test(h)) a.setAttribute('href', h.replace(/\/(#.*)?$/, '/index.html$1')); });

/* WhatsApp bağlantıları */
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || 'Merhaba Burak Bey, web sitenizden ulaşıyorum. Randevu hakkında bilgi almak istiyorum.'); a.target = '_blank'; a.rel = 'noopener'; });
$$('#yil').forEach(e => e.textContent = new Date().getFullYear());

/* Açılış (oturumdaki ilk ziyaret) */
const intro = $('.intro'), fab = $('.wa');
const ready = () => { root.classList.add('loaded'); setTimeout(() => fab && fab.classList.add('show'), 900); };
let seen = false; try { seen = sessionStorage.getItem('bb-intro'); sessionStorage.setItem('bb-intro', 1); } catch { }
if (intro && !reduce && !seen) { setTimeout(() => { intro.classList.add('done'); ready(); setTimeout(() => intro.remove(), 1100); }, 1700); }
else { intro && intro.remove(); requestAnimationFrame(ready); }

/* Çizim animasyonu için yol uzunlukları */
$$('.draw').forEach(svg => $$('path,circle,line,polyline,rect', svg).forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch { } }));

/* Görünür olunca */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const t = e.target; t.classList.add('is-in'); io.unobserve(t);
  $$('.clip', t).forEach(c => c.classList.add('is-in'));
}), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal,.draw,.steps li,.tl li,.styles li').forEach(el => io.observe(el));

/* Düşünce ipleri: karışık çizgiler kaydırdıkça sakinleşir */
function threads(cv) {
  const ctx = cv.getContext('2d'), mode = cv.dataset.threads || 'tangle';
  const cfg = { tangle: [16, 1, 0], calm: [10, .35, 0], pair: [2, .7, 1], rings: [9, .6, 2], waves: [7, .45, 0], grow: [2, .5, 3], tri: [3, .5, 4] }[mode] || [12, .8, 0];
  const [N, chaos, kind] = cfg, dark = cv.closest('.dark');
  const col = dark ? [156, 199, 181] : [47, 93, 80], clay = [184, 118, 75];
  const L = Array.from({ length: N }, (_, i) => ({ p: [Math.random() * 6, Math.random() * 6, Math.random() * 6], s: .6 + Math.random() * .8, o: i / Math.max(N - 1, 1) }));
  let w, h, dpr, t = Math.random() * 100, on = true, calm = 0, mx = .5, my = .5;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(([e]) => on = e.isIntersecting).observe(cv);
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; });
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    if (mode === 'tangle') { const r = cv.getBoundingClientRect(); calm += (Math.min(Math.max(-r.top / (r.height * .7), 0), 1) - calm) * .08; }
    const k = chaos * (1 - calm * .85);
    if (kind === 2) { /* iç içe halkalar: şema */
      const cx = w * .72, cy = h * .45, R = Math.min(w, h) * .42;
      L.forEach((l, i) => { ctx.beginPath(); for (let a = 0; a <= 64; a++) { const th = a / 64 * Math.PI * 2, rr = R * (.25 + l.o * .75) * (1 + k * .08 * Math.sin(th * 3 + t * l.s + l.p[0]) + k * .05 * Math.sin(th * 5 - t * .7 + l.p[1])); const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = rgba(i === N - 1 ? clay : col, .14 + l.o * .22); ctx.lineWidth = 1.2; ctx.stroke(); });
    } else if (kind === 3 || kind === 4) { /* büyüyen daireler (ebeveyn) / üçgen (BDT) */
      const cx = w * .74, cy = h * .5, R = Math.min(w, h) * .34;
      const pts = kind === 3 ? [[cx - R * .35, cy + R * .1, R * .62], [cx + R * .45, cy + R * .32, R * .34]] : [0, 1, 2].map(j => { const a = -Math.PI / 2 + j * Math.PI * 2 / 3 + Math.sin(t * .3) * .06; return [cx + Math.cos(a) * R * .8, cy + Math.sin(a) * R * .8, R * .26]; });
      if (kind === 4) { ctx.beginPath(); pts.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.setLineDash([4, 8]); ctx.lineDashOffset = -t * 20; ctx.strokeStyle = rgba(clay, .5); ctx.stroke(); ctx.setLineDash([]); }
      pts.forEach(([x, y, r], j) => { for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(x + Math.sin(t * .5 + j + q) * 3, y + Math.cos(t * .4 + q) * 3, r * (1 + q * .12 + Math.sin(t * .8 + j * 2 + q) * .03), 0, Math.PI * 2); ctx.strokeStyle = rgba(q ? col : clay, q ? .22 - q * .04 : .45); ctx.lineWidth = 1.2; ctx.stroke(); } });
    } else { /* çizgiler */
      L.forEach((l, i) => {
        ctx.beginPath();
        const base = kind === 1 ? h * .5 : h * (.18 + l.o * .64);
        for (let x = -10; x <= w + 10; x += 12) {
          const u = x / w;
          let y = base + Math.sin(u * 3 + t * .5 * l.s + l.p[0]) * h * .05 * (kind === 1 ? 1.4 : 1)
            + k * (Math.sin(u * 7.3 + t * l.s + l.p[1]) * h * .16 + Math.sin(u * 13.1 - t * .8 + l.p[2]) * h * .07);
          if (kind === 1) y += (i ? 1 : -1) * Math.sin(u * Math.PI) * h * .14 * (1 - calm) * Math.cos(t * .4);
          y += (my - .5) * 30 * Math.exp(-((u - mx) ** 2) * 30);
          x > -10 ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = rgba(i === Math.floor(N / 2) ? clay : col, kind === 1 ? .5 : .12 + (1 - Math.abs(l.o - .5) * 2) * .22);
        ctx.lineWidth = kind === 1 ? 1.6 : 1.1; ctx.stroke();
      });
    }
  };
  const loop = () => { if (on && !document.hidden) { t += .006; draw(); } requestAnimationFrame(loop); };
  reduce ? draw() : loop();
}
$$('canvas[data-threads]').forEach(threads);

/* Kaydırma: header, ilerleme çubuğu, süreç ve zaman çizgileri */
const hdr = $('.header'), bar = $('.progress'), lines = $$('.steps-line,.tl');
let lastY = 0, tick = false;
const onScroll = () => {
  const y = scrollY, h = innerHeight, max = root.scrollHeight - h;
  bar && (bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`);
  hdr.classList.toggle('solid', y > 30);
  hdr.classList.toggle('hide', y > lastY && y > h * .8 && !document.body.classList.contains('menu-open'));
  lastY = y;
  lines.forEach(l => { const r = l.getBoundingClientRect(); l.style.setProperty('--p', Math.min(Math.max((h * .75 - r.top) / r.height, 0), 1)); });
  tick = false;
};
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Mobil menü */
const burger = $('.burger');
const menu = o => { document.body.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Menüyü kapat' : 'Menüyü aç'); };
burger && (burger.onclick = () => menu(!document.body.classList.contains('menu-open')));
$$('.mnav a').forEach(a => a.addEventListener('click', () => menu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });

/* Nefes molası */
const orb = $('.orb');
if (orb) {
  const btn = $('#breathBtn'), lab = $('span', orb); let run = false, timer, n = 0;
  const step = inh => { orb.classList.toggle('in', inh); orb.classList.toggle('out', !inh); lab.innerHTML = inh ? 'Nefes al<small>4 saniye</small>' : 'Yavaşça ver<small>6 saniye</small>'; if (!inh) n++; timer = setTimeout(() => { if (n >= 5 && !inh) return stop(true); step(!inh); }, inh ? 4000 : 6000); };
  const stop = done => { run = false; clearTimeout(timer); orb.classList.remove('in', 'out'); lab.innerHTML = done ? 'Teşekkürler<small>5 nefes tamamlandı</small>' : 'Hazır olduğunda<small>başlat</small>'; btn.textContent = 'Başlat'; };
  btn.onclick = () => { if (run) return stop(); run = true; n = 0; btn.textContent = 'Durdur'; step(true); };
}

/* ACT altıgeni */
const hexa = $('.hexa');
if (hexa) {
  const nodes = $$('.node', hexa), info = $('.center small', hexa); let idx = 0, auto;
  const pick = i => { nodes.forEach((n, j) => n.classList.toggle('on', i === j)); info.style.opacity = 0; setTimeout(() => { info.textContent = nodes[i].dataset.t; info.style.opacity = 1; }, 180); idx = i; };
  nodes.forEach((n, i) => { n.addEventListener('mouseenter', () => { clearInterval(auto); pick(i); }); n.addEventListener('click', () => { clearInterval(auto); pick(i); }); });
  pick(0); if (!reduce) auto = setInterval(() => pick((idx + 1) % nodes.length), 3200);
}

/* Çalışma saatleri: bugünü vurgula */
const today = new Date().getDay();
$$('.hours tr[data-d]').forEach(tr => tr.classList.toggle('today', +tr.dataset.d === today));

/* İletişim formu → WhatsApp */
const toast = t => { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); } el.textContent = t; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 3000); };
const form = $('#form');
form && form.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, ad = f.ad.value.trim();
  if (!ad) { f.ad.focus(); toast('Adınızı yazar mısınız?'); return; }
  const t = `Merhaba Burak Bey, web sitenizden ulaşıyorum.\n\nAdım: ${ad}\nİlgilendiğim hizmet: ${f.hizmet.value}\nGörüşme tercihi: ${f.tercih.value}\nUygun zaman: ${f.zaman.value}${f.not.value.trim() ? '\nNot: ' + f.not.value.trim() : ''}`;
  open(wa(t), '_blank', 'noopener');
});
})();
