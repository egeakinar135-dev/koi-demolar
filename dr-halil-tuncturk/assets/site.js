/* Dr. Halil Tunçtürk · Koi Ajans */
(() => {
const WA = '905431340450';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, root = document.documentElement;

/* dosyadan açılınca klasör linkleri index.html'e gitsin */
if (location.protocol === 'file:') $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (/^(?!https?:|mailto:|tel:|#).*\/(#.*)?$/.test(h)) a.setAttribute('href', h.replace(/\/(#.*)?$/, '/index.html$1')); });

const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || 'Merhaba, web sitenizden ulaşıyorum. Muayene randevusu almak istiyorum.'); a.target = '_blank'; a.rel = 'noopener'; });
$$('#yil').forEach(e => e.textContent = new Date().getFullYear());

/* açılış */
const intro = $('.intro'), fab = $('.wa');
const ready = () => { root.classList.add('loaded'); setTimeout(() => fab && fab.classList.add('show'), 900); };
let seen = false; try { seen = sessionStorage.getItem('ht-intro'); sessionStorage.setItem('ht-intro', 1); } catch { }
if (intro && !reduce && !seen) setTimeout(() => { intro.classList.add('done'); ready(); setTimeout(() => intro.remove(), 1200); }, 1800);
else { intro && intro.remove(); requestAnimationFrame(ready); }

/* çizim uzunlukları */
$$('.draw').forEach(svg => $$('path,circle,line,ellipse,polyline', svg).forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch { } }));

/* görünür olunca */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const t = e.target; t.classList.add('is-in'); io.unobserve(t);
  $$('.clip', t).forEach(c => c.classList.add('is-in'));
}), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal,.draw').forEach(el => io.observe(el));

/* yüz haritası */
const face = $('.face'), card = $('.zone-card');
if (face && window.ZONES) {
  const zones = $$('.zone', face);
  const pick = i => {
    zones.forEach((z, j) => z.classList.toggle('on', i === j));
    const z = ZONES[i];
    card.innerHTML = `<div class="fx"><small>Bölge · ${z.b}</small><h3>${z.t}</h3><p>${z.d}</p><ul>${z.s.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div>`;
    if (location.protocol === 'file:') $$('a', card).forEach(a => a.setAttribute('href', a.getAttribute('href').replace(/\/$/, '/index.html')));
  };
  zones.forEach((z, i) => { z.addEventListener('click', () => { clearInterval(auto); pick(i); }); z.addEventListener('mouseenter', () => { clearInterval(auto); pick(i); }); });
  let k = 0; pick(0);
  let auto = reduce ? 0 : setInterval(() => { k = (k + 1) % zones.length; pick(k); }, 3400);
}

/* içindekiler: okunan bölüm */
const toc = $$('.toc ol a');
const secs = toc.map(a => $(a.getAttribute('href')));

/* büyük alıntı */
const bq = $('.bigq blockquote');
let qw = [];
if (bq) { bq.innerHTML = bq.dataset.q.split(' ').map(w => `<span class="qw">${w}</span>`).join(' '); qw = $$('.qw', bq); }

/* kaydırma */
const hdr = $('.header'), bar = $('.progress'), pimg = $('.portrait img');
let lastY = 0, tick = false;
const onScroll = () => {
  const y = scrollY, h = innerHeight, max = root.scrollHeight - h;
  bar && (bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`);
  hdr.classList.toggle('solid', y > 40);
  hdr.classList.toggle('hide', y > lastY && y > h * .8 && !document.body.classList.contains('menu-open'));
  lastY = y;
  if (pimg && !reduce && y < h * 1.2) pimg.style.transform = `translateY(${y * .08}px) scale(1.04)`;
  if (toc.length) { let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < h * .35) cur = i; }); toc.forEach((a, i) => a.classList.toggle('on', i === cur)); }
  if (qw.length) { const r = bq.getBoundingClientRect(), p = Math.min(Math.max((h * .85 - r.top) / (r.height + h * .3), 0), 1), n = Math.round(p * qw.length); qw.forEach((w, i) => w.classList.toggle('on', i < n)); }
  tick = false;
};
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* mobil menü */
const burger = $('.burger');
const menu = o => { document.body.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Menüyü kapat' : 'Menüyü aç'); };
burger && (burger.onclick = () => menu(!document.body.classList.contains('menu-open')));
$$('.mnav a').forEach(a => a.addEventListener('click', () => menu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });

/* saatler */
const today = new Date().getDay();
$$('.hours tr[data-d]').forEach(tr => tr.classList.toggle('today', +tr.dataset.d === today));

/* iletişim formu → WhatsApp */
const toast = t => { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); } el.textContent = t; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 3000); };
const form = $('#form');
form && form.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, ad = f.ad.value.trim();
  if (!ad) { f.ad.focus(); toast('Adınızı yazar mısınız?'); return; }
  const t = `Merhaba, web sitenizden ulaşıyorum.\n\nAdım: ${ad}\nİlgilendiğim uygulama: ${f.uygulama.value}${f.gun.value.trim() ? '\nUygun olduğum gün/saat: ' + f.gun.value.trim() : ''}${f.not.value.trim() ? '\nNot: ' + f.not.value.trim() : ''}`;
  open(wa(t), '_blank', 'noopener');
});

/* hero slayt gösterisi */
const sl = $$('.hl-slides img');
if (sl.length > 1 && !reduce) { let k = 0; setInterval(() => { sl[k].classList.remove('on'); k = (k + 1) % sl.length; sl[k].classList.add('on'); }, 5000); }
/* galeri */
const lb = $('#lb');
if (lb) { $$('.hl-gal .shot').forEach(b => b.addEventListener('click', () => { $('#lbImg').src = $('img', b).src; lb.showModal(); }));
  $('button', lb).onclick = () => lb.close(); lb.addEventListener('click', e => { if (e.target === lb) lb.close(); }); }
})();
