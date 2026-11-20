(function () {
  'use strict';

  /* ------------------------------------------------------------------
     ПИСЬМА ЗАКАЗЧИКОВ. Новое письмо = файл скана + одна запись в массиве.
     1. Сканы положить в assets/docs/: <id>.webp (990x1400), <id>-zoom.webp (крупный),
        thumb/<id>.webp (превью ~400px). Банковские реквизиты на скане закрыть.
     2. Добавить запись ниже. Все поля - дословно с письма.
        id      - имя файла без расширения
        company - название с формой собственности
        city    - город
        date    - дата письма
        no      - исходящий номер (можно '')
        quote   - ключевая строка, одно предложение дословно
        second  - вторая строка дословно (можно '')
        sign    - должность, фамилия и инициалы подписавшего
        marks   - где на листе стоит ключевая строка: по одному прямоугольнику
                  на каждую строку текста, в процентах от ширины и высоты листа
                  { x: слева, y: сверху, w: ширина, h: высота }
     Переводы для KZ и EN - ключами letters.<id>.<поле> в assets/lang/kk.js и en.js;
     если перевода нет, показывается русский текст.
     ------------------------------------------------------------------ */
  var LETTERS = [
    {
      id: 'letter-gasstroyproject-2026-11-18',
      company: 'ТОО «Газстройпроект»',
      city: 'Атырау',
      date: '18 ноября 2026 года',
      no: '379/26',
      quote: '«Особо отмечаем компетентность, тщательный подход к изучению документации, глубокое знание законодательства Республики Казахстан и международных стандартов аудита.»',
      second: '«Предоставленные по результатам аудита рекомендации имеют практическую значимость для дальнейшего совершенствования деятельности нашего предприятия.»',
      sign: 'директор Буранбаев И.Е.',
      marks: [{ x: 14.4, y: 43.95, w: 78.2, h: 1.95 }, { x: 14.4, y: 45.75, w: 73.8, h: 1.95 }]
    },
    {
      id: 'letter-evavet-2026-11-18',
      company: 'ТОО «ЭваВет»',
      city: 'Уральск',
      date: '18 ноября 2026 года',
      no: '33',
      quote: '«Особо отмечаем высокий уровень профессионализма, компетентность, объективность и ответственный подход к выполнению поставленных задач.»',
      second: '',
      sign: 'директор Нуралиева Г.М.',
      marks: [{ x: 10.8, y: 48.6, w: 79.8, h: 1.95 }, { x: 8, y: 50.45, w: 76.8, h: 1.95 }]
    }
  ];

  /* Сертификаты о повышении квалификации (порядок - как в ленте) */
  var CERTS = [
    { id: 'cert-002857-kabdulova-isa315', no: '002857', topic: 'isa315', hours: 'h15', who: 'kabdulova', year: 2021 },
    { id: 'cert-002851-kabdulova-isa540', no: '002851', topic: 'isa540', hours: 'h10', who: 'kabdulova', year: 2021 },
    { id: 'cert-002866-kabdulova-mssu4400', no: '002866', topic: 'mssu4400', hours: 'h5', who: 'kabdulova', year: 2021 },
    { id: 'cert-002817-kabdulova-consolidation', no: '002817', topic: 'cons', hours: 'h20', who: 'kabdulova', year: 2021 },
    { id: 'cert-002858-kabdolov-isa315', no: '002858', topic: 'isa315', hours: 'h15', who: 'kabdolov', year: 2021 },
    { id: 'cert-002852-kabdolov-isa540', no: '002852', topic: 'isa540', hours: 'h10', who: 'kabdolov', year: 2021 },
    { id: 'cert-002867-kabdolov-mssu4400', no: '002867', topic: 'mssu4400', hours: 'h5', who: 'kabdolov', year: 2021 },
    { id: 'cert-002818-kabdolov-consolidation', no: '002818', topic: 'cons', hours: 'h20', who: 'kabdolov', year: 2021 },
    { id: 'cert-002335-kabdolov-isa', no: '002335', topic: 'isa', hours: 'h40a', who: 'kabdolov', year: 2020 },
    { id: 'cert-002293-kabdolov-ethics', no: '002293', topic: 'ethics', hours: 'h16a', who: 'kabdolov', year: 2020 },
    { id: 'cert-002390-kabdolov-independence', no: '002390', topic: 'indep', hours: 'h16a', who: 'kabdolov', year: 2020 }
  ];

  /* Русские строки, которые собирает скрипт */
  var RU = {
    'meta.desc': 'Аудит финансовой отчётности от 1 000 000 тг, бухгалтерское сопровождение от 150 000 тг, консультация 5 000 тг. Лицензия № 20005100, членство в Союзе аудиторов Казахстана. Работаем по всему Казахстану.',
    'wa.general': 'Здравствуйте! Пишу с сайта «Баланс Аудит». Прошу связаться со мной.',
    'wa.service': 'Здравствуйте! Пишу с сайта «Баланс Аудит». Интересует услуга:',
    'cert.isa315': 'Изменения в Международных стандартах аудита - МСА (ISA) 315',
    'cert.isa540': 'Изменения в Международных стандартах аудита - МСА (ISA) 540',
    'cert.mssu4400': 'Изменения в Международных стандартах аудита - МССУ 4400',
    'cert.cons': 'Консолидация финансовой отчётности',
    'cert.isa': 'Международные стандарты аудита',
    'cert.ethics': 'Профессиональная этика аудиторов',
    'cert.indep': 'Правила независимости аудиторов и аудиторских организаций',
    'cert.h5': '5 часов', 'cert.h10': '10 часов', 'cert.h15': '15 часов', 'cert.h20': '20 часов',
    'cert.h40a': '40 академических часов', 'cert.h16a': '16 академических часов',
    'cert.kabdulova': 'Кабдулова З.Т.', 'cert.kabdolov': 'Кабдолов М.Т.',
    'pis.no': 'Исх. №',
    'pis.signed': 'Подписал:'
  };

  var DOC = 'assets/docs/';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqDesk = matchMedia('(min-width: 961px)');
  var canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!window.gsap;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var VER = (function () {
    var s = document.currentScript && document.currentScript.src || '';
    var m = s.match(/[?&]v=([^&]+)/); return m ? m[1] : '1';
  })();
  root.classList.add('js');

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (window.CustomEase) { /* не используется */ }
    gsap.defaults({ ease: 'power3.out', duration: 1 });
  }
  var ease = hasGsap ? gsap.parseEase('0.2,0.7,0.2,1') : null;
  if (hasGsap && !ease) ease = 'power3.out';
  var E = 'expo.out';

  /* ============ ЯЗЫКИ ============ */
  var lang = 'ru';
  var dicts = { ru: RU };
  var ruDom = {};
  $$('[data-i18n]').forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (!(k in ruDom)) ruDom[k] = el.innerHTML;
  });
  function t(key, fallback) {
    var d = dicts[lang] || {};
    if (d[key] != null) return d[key];
    if (RU[key] != null) return RU[key];
    if (ruDom[key] != null) return ruDom[key];
    return fallback != null ? fallback : '';
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/ /g, ' '); }

  var splits = [];
  function killSplits() {
    splits.forEach(function (s) { try { s.revert(); } catch (e) {} });
    splits = [];
    $$('[data-split]').forEach(function (el) { el.style.opacity = ''; el.dataset.done = '1'; });
  }

  function applyLang() {
    killSplits();
    root.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = (lang === 'ru') ? ruDom[k] : (dicts[lang] && dicts[lang][k] != null ? dicts[lang][k] : ruDom[k]);
      if (el.tagName === 'TITLE') { document.title = plain(v); return; }
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    swapLangDocs();
    setWaLinks();
    renderDeckCap();
    renderLetter(curLetter, false);
    hallLabels();
    if (hasGsap) ScrollTrigger.refresh();
  }
  function setLang(l, save) {
    if (['ru', 'kk', 'en'].indexOf(l) < 0) l = 'ru';
    if (save) { try { localStorage.setItem('ba-lang', l); } catch (e) {} }
    if (l === 'ru' || dicts[l]) { lang = l; applyLang(); return; }
    var s = document.createElement('script');
    s.src = 'assets/lang/' + l + '.js?v=' + VER;
    s.onload = function () {
      dicts.kk = window.SITE_KK || dicts.kk; dicts.en = window.SITE_EN || dicts.en;
      if (dicts[l]) { lang = l; applyLang(); }
    };
    document.head.appendChild(s);
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang, true); });
  });

  /* документы, у которых есть версия на казахском */
  function docId(el) { return (lang === 'kk' && el.getAttribute('data-doc-kk')) || el.getAttribute('data-doc'); }
  function swapLangDocs() {
    $$('img[data-full-kk]').forEach(function (img) {
      var kk = lang === 'kk', full = img.dataset.upgraded === '1';
      var src = kk ? (full ? img.dataset.fullKk : img.dataset.thumbKk) : (full ? img.dataset.full : img.dataset.thumb0);
      if (src && img.getAttribute('src') !== src) img.src = src;
    });
  }
  $$('img[data-full-kk]').forEach(function (img) { img.dataset.thumb0 = img.getAttribute('src'); });

  /* ============ WHATSAPP ============ */
  var WA = 'https://wa.me/77011711752?text=';
  function setWaLinks() {
    $$('a[data-wa]').forEach(function (a) {
      var k = a.getAttribute('data-wa-service');
      var txt = k ? t('wa.service') + '\n' + plain(t(k)) : t('wa.general');
      a.href = WA + encodeURIComponent(txt);
    });
  }

  /* ============ ПЛАВНАЯ ПРОКРУТКА ============ */
  var lenis = null;
  if (hasGsap && !reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function hdrH() { return $('#hdr').offsetHeight; }
  function scrollToY(y, instant) {
    if (lenis && !instant) lenis.scrollTo(y, { duration: 1.3 });
    else window.scrollTo({ top: y, behavior: 'auto' });
  }

  /* ============ ЗАЛ ДОКУМЕНТОВ ============ */
  var hall = $('.hall'), pin = $('.hall-pin');
  var stops = $$('.stop');
  var movers = stops.map(function (s) { return $('.mover', s); });
  var rail = $('#rail'), railLinks = $$('#rail a');
  var lettersSec = $('#pisma');
  var anchorDocs = $('#dokumenty');
  var vw = 1440, vh = 900;
  var LAST = stops.length;          /* остановок в сцене: p = 1..LAST */
  var scene = { intro: reduce ? 0 : 1, mx: 0, my: 0, tmx: 0, tmy: 0 };
  var flat = stops.map(function () { return { v: 0, t: 0 }; });
  var lastKey = '';
  var hallVisible = true;

  function layoutHall() {
    vw = window.innerWidth; vh = window.innerHeight;
    if (mqDesk.matches) {
      hall.style.height = '';
      anchorDocs.style.top = hdrH() + 'px';
    } else {
      hall.style.height = '';
      stops.forEach(function (s, i) {
        s.style.zIndex = ''; movers[i].style.cssText = '';
      });
      var hh = $('.hall-head');
      anchorDocs.style.top = (hh.offsetTop - 10) + 'px';
      lazyStops();
    }
    lastKey = '';
  }
  /* слайдшоу по времени: p = номер остановки + 1, камера доезжает за ~1.1 с */
  var SLIDE_MS = 7000;
  var cur = 0, anim = { v: 1, from: 1, to: 1, t0: 0, dur: 0 };
  var playing = !reduce, elapsed = 0, lastT = 0, ctrlHover = false;
  var hallCtrl = { prev: $('#hallPrev'), next: $('#hallNext'), play: $('#hallPlay') };
  function goTo(k) {
    k = (k + LAST) % LAST;
    elapsed = 0;
    if (k === cur && anim.to === k + 1) return;
    anim.from = anim.v; anim.to = k + 1; anim.t0 = performance.now();
    anim.dur = reduce ? 0 : (Math.abs(anim.to - anim.from) > 1.5 ? 1600 : 1100);
    if (!anim.dur) anim.v = anim.to;
    cur = k;
  }
  function stepAnim(now) {
    if (!anim.dur) return;
    var f = clamp((now - anim.t0) / anim.dur, 0, 1);
    var e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    anim.v = anim.from + (anim.to - anim.from) * e;
    if (f >= 1) { anim.v = anim.to; anim.dur = 0; }
  }
  function hallInView() {
    var top = hall.offsetTop - window.scrollY;
    return top < vh * 0.45 && top + hall.offsetHeight > vh * 0.55;
  }
  function setPlaying(on) {
    playing = on; elapsed = 0;
    rail.classList.toggle('stopped', !on);
    hallLabels();
  }
  function stepAuto(now) {
    var dt = lastT ? Math.min(now - lastT, 100) : 0;
    lastT = now;
    var a = document.activeElement;
    var hold = !playing || lbOpen || document.hidden || anim.dur || ctrlHover || flat[cur].t === 1 ||
      (a && a !== document.body && hall.contains(a) && a.matches(':focus-visible')) || !hallInView();
    if (!hold) {
      elapsed += dt;
      if (elapsed >= SLIDE_MS) goTo(cur + 1);
    }
    var pr = playing ? clamp(elapsed / SLIDE_MS, 0, 1) : 1;
    var ri = railLinks[cur] && $('i', railLinks[cur]);
    if (ri) ri.style.setProperty('--prog', pr.toFixed(3));
  }

  function upgrade(stop) {
    $$('img[data-full]', stop).forEach(function (img) {
      if (img.dataset.upgraded === '1' || img.closest('#deck')) return;
      img.dataset.upgraded = '1';
      var src = (lang === 'kk' && img.dataset.fullKk) || img.dataset.full;
      var pre = new Image();
      pre.onload = function () { img.src = src; };
      pre.src = src;
    });
  }
  var stopIO = null;
  function lazyStops() {
    if (stopIO) return;
    if (!('IntersectionObserver' in window)) { stops.forEach(upgrade); return; }
    stopIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { upgrade(e.target); stopIO.unobserve(e.target); } });
    }, { rootMargin: '500px 0px' });
    stops.forEach(function (st) { stopIO.observe(st); });
  }

  var activeStop = -1, inDocs = false;
  function renderHall() {
    if (!mqDesk.matches) return;
    var p = anim.v;
    scene.mx += (scene.tmx - scene.mx) * 0.07;
    scene.my += (scene.tmy - scene.my) * 0.07;
    var flatKey = '';
    flat.forEach(function (f) { f.v += (f.t - f.v) * 0.14; if (Math.abs(f.t - f.v) < 0.002) f.v = f.t; flatKey += f.v.toFixed(3); });
    var key = p.toFixed(4) + '|' + scene.mx.toFixed(3) + '|' + scene.my.toFixed(3) + '|' + scene.intro.toFixed(3) + '|' + flatKey;
    if (key === lastKey) return;
    lastKey = key;

    var q = Math.max(p - 1, 0);
    var h = 1 - clamp(p, 0, 1);
    var D = 1500, SX = vw * 0.42, SY = vh * 0.08;

    for (var i = 0; i < stops.length; i++) {
      var d = i - q + scene.intro * (0.9 + i * 0.5);
      var x, yy, z, ry, rx = 0, op, blur, s = 1;
      if (d >= 0) {
        z = -d * D; x = d * SX; yy = -d * SY;
        ry = 9 + Math.min(d, 2) * 4;
        op = clamp(1 - d * 0.13, 0.4, 1);
        blur = Math.min(d * 2.2, 6);
      } else {
        var tt = -d;
        x = tt * vw * 0.75; yy = tt * vh * 0.04; z = tt * 420;
        ry = 9 - tt * 58; op = 1 - tt * 2.3; blur = 0;
      }
      if (scene.intro > 0.001) op *= clamp(1 - scene.intro * (0.9 + i * 0.3), 0, 1);
      if (i === 0) { ry += h * 13; rx += h * 3; s = 1 + h * 0.03; }
      var near = clamp(1 - Math.abs(d) * 1.4, 0, 1);
      var fl = 1 - flat[i].v;
      ry = (ry + scene.mx * 5 * near) * fl;
      rx = (rx - scene.my * 3.5 * near) * fl;
      var m = movers[i];
      if (op <= 0.01) { m.style.visibility = 'hidden'; continue; }
      m.style.visibility = '';
      m.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + yy.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      m.style.opacity = op.toFixed(3);
      m.style.filter = blur > 0.25 ? 'blur(' + blur.toFixed(1) + 'px)' : '';
      stops[i].style.zIndex = d >= 0 ? String(100 - Math.round(d * 10)) : '200';
      if (d < 1.4) upgrade(stops[i]);
    }

    var nowDocs = p >= 0.35;
    var a = nowDocs ? clamp(Math.round(q), 0, stops.length - 1) : -1;
    if (nowDocs !== inDocs) { inDocs = nowDocs; hall.classList.toggle('in-docs', inDocs); }
    if (a !== activeStop) {
      activeStop = a;
      stops.forEach(function (s, j) { s.classList.toggle('is-on', j === a); });
      flat.forEach(function (f) { f.t = 0; });
      hideLoupe();
    }
  }

  function updateRail() {
    if (!mqDesk.matches) return;
    var y = window.scrollY;
    var lettersTop = lettersSec.offsetTop, lettersBottom = lettersTop + lettersSec.offsetHeight;
    var show = y > hall.offsetTop - vh * 0.5 && y < hall.offsetTop + hall.offsetHeight - vh * 0.4;
    rail.classList.toggle('show', show);
    var idx = cur;
    railLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
  }

  if (pin) {
    pin.addEventListener('mousemove', function (e) {
      scene.tmx = (e.clientX / vw) * 2 - 1;
      scene.tmy = (e.clientY / vh) * 2 - 1;
    });
    pin.addEventListener('mouseleave', function () { scene.tmx = 0; scene.tmy = 0; });
  }
  stops.forEach(function (s, i) {
    $$('.sheet', s).forEach(function (sh) {
      sh.addEventListener('mouseenter', function () { if (s.classList.contains('is-on')) flat[i].t = 1; });
      sh.addEventListener('mouseleave', function () { flat[i].t = 0; });
    });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      hallVisible = en[0].isIntersecting;
      hall.classList.toggle('paused', !hallVisible);
    }, { rootMargin: '100px' }).observe(hall);
  }
  function tick() {
    if (mqDesk.matches) { var now = performance.now(); stepAnim(now); stepAuto(now); }
    if (hallVisible) renderHall();
    updateRail();
  }
  if (hasGsap) gsap.ticker.add(tick);
  else { (function loop() { tick(); requestAnimationFrame(loop); })(); }

  railLinks.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (i === 4) { scrollToY(lettersSec.offsetTop - hdrH() + 2); return; }
      if (!hallInView()) scrollToY(hall.offsetTop);
      goTo(i);
    });
  });
  hallCtrl.prev.addEventListener('click', function () { goTo(cur - 1); });
  hallCtrl.next.addEventListener('click', function () { goTo(cur + 1); });
  hallCtrl.play.addEventListener('click', function () { setPlaying(!playing); });
  rail.addEventListener('mouseenter', function () { ctrlHover = true; });
  rail.addEventListener('mouseleave', function () { ctrlHover = false; });
  $$('.stop-cap').forEach(function (c) {
    c.addEventListener('mouseenter', function () { ctrlHover = true; });
    c.addEventListener('mouseleave', function () { ctrlHover = false; });
  });
  hall.addEventListener('keydown', function (e) {
    if (!mqDesk.matches || e.target.closest('#deck')) return;
    if (e.key === 'ArrowRight') { goTo(cur + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { goTo(cur - 1); e.preventDefault(); }
  });
  function hallLabels() {
    hallCtrl.prev.setAttribute('aria-label', plain(t('ui.docprev', 'Предыдущий документ')));
    hallCtrl.next.setAttribute('aria-label', plain(t('ui.docnext', 'Следующий документ')));
    hallCtrl.play.setAttribute('aria-label', playing ? plain(t('ui.pause', 'Пауза')) : plain(t('ui.play', 'Листать автоматически')));
  }
  setPlaying(playing);

  /* ============ КОЛОДА СЕРТИФИКАТОВ ============ */
  var deck = $('#deck'), deckCur = 0, deckSheets = [];
  CERTS.forEach(function (c, j) {
    var f = document.createElement('figure');
    f.className = 'sheet land';
    f.setAttribute('data-doc', c.id);
    f.style.setProperty('--ar', '1400/990');
    var img = document.createElement('img');
    img.width = 1400; img.height = 990; img.decoding = 'async'; img.loading = 'lazy';
    img.alt = '';
    img.dataset.thumb = DOC + 'thumb/' + c.id + '.webp';
    img.dataset.full = DOC + c.id + '.webp';
    if (j < 4) img.src = img.dataset.thumb;
    f.appendChild(img);
    deck.appendChild(f);
    deckSheets.push(f);
    f.addEventListener('click', function () {
      if (j === deckCur) openDoc(c.id, certCaption(c));
      else setDeck(j);
    });
  });
  function certCaption(c) {
    return '№ ' + c.no + '. ' + t('cert.' + c.topic) + '. ' + t('cert.' + c.hours) + '. ' + t('cert.' + c.who) + ', ' + c.year;
  }
  function renderDeckCap() {
    var c = CERTS[deckCur];
    $('#deckCap').textContent = certCaption(c);
    $('#deckCur').textContent = deckCur + 1;
    $('#deckAll').textContent = CERTS.length;
    deckSheets.forEach(function (f, j) { $('img', f).alt = certCaption(CERTS[j]); });
  }
  /* полные сканы колоды - только когда колода рядом с экраном, иначе телефон тянет 350 КБ на первом экране */
  var deckNear = false;
  if ('IntersectionObserver' in window) {
    var deckIO = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { deckNear = true; deckIO.disconnect(); layoutDeck(); }
    }, { rootMargin: '600px 0px' });
    setTimeout(function () { deckIO.observe(deck); }, 0);
  } else deckNear = true;
  function layoutDeck() {
    deckSheets.forEach(function (f, j) {
      var rel = j - deckCur, img = $('img', f);
      if (rel > -2 && rel < 5 && !img.getAttribute('src')) img.src = img.dataset.thumb;
      if (deckNear && rel >= 0 && rel <= 1 && img.dataset.up !== '1') {
        img.dataset.up = '1';
        var pre = new Image(); pre.onload = function () { img.src = img.dataset.full; }; pre.src = img.dataset.full;
      }
      if (rel < 0) {
        f.classList.add('gone');
        f.style.transform = 'translate3d(64%,5%,140px) rotateY(-42deg) rotateZ(5deg)';
        f.style.opacity = '0'; f.style.zIndex = String(60 + rel);
        f.style.filter = '';
      } else {
        f.classList.remove('gone');
        f.style.transform = 'translate3d(' + (rel * 7.5) + '%,' + (-rel * 10) + '%,' + (-rel * 130) + 'px)';
        f.style.opacity = rel > 5 ? '0' : String(1 - rel * 0.1);
        f.style.filter = rel ? 'brightness(' + (1 - rel * 0.09) + ')' : '';
        f.style.zIndex = String(50 - rel);
        f.style.pointerEvents = rel > 2 ? 'none' : '';
        f.style.cursor = rel === 0 ? '' : 'pointer';
      }
    });
    $('#deckPrev').disabled = deckCur === 0;
    $('#deckNext').disabled = deckCur === CERTS.length - 1;
  }
  function setDeck(n) {
    elapsed = 0;
    n = clamp(n, 0, CERTS.length - 1);
    if (n === deckCur) return;
    deckCur = n; hideLoupe(); layoutDeck(); renderDeckCap();
  }
  $('#deckPrev').addEventListener('click', function () { setDeck(deckCur - 1); });
  $('#deckNext').addEventListener('click', function () { setDeck(deckCur + 1); });
  $('#deckOpen').addEventListener('click', function () { openDoc(CERTS[deckCur].id, certCaption(CERTS[deckCur])); });
  deck.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { setDeck(deckCur + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { setDeck(deckCur - 1); e.preventDefault(); }
  });
  (function swipe(el, next, prev) {
    var x0 = null, y0 = 0;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) { (dx < 0 ? next : prev)(); }
      x0 = null;
    }, { passive: true });
  })(deck, function () { setDeck(deckCur + 1); }, function () { setDeck(deckCur - 1); });
  layoutDeck();

  /* ============ ЛУПА ============ */
  var loupe = $('#loupe'), zoomReady = {}, loupeSheet = null;
  function zoomSrc(id) { return DOC + id + '-zoom.webp'; }
  function loadZoom(id, cb) {
    if (zoomReady[id] === true) { cb && cb(); return; }
    if (zoomReady[id]) { cb && zoomReady[id].push(cb); return; }
    zoomReady[id] = cb ? [cb] : [];
    var im = new Image();
    im.onload = function () { var q = zoomReady[id]; zoomReady[id] = true; q.forEach(function (f) { f(); }); };
    im.src = zoomSrc(id);
  }
  function hideLoupe() { if (loupe) { loupe.classList.remove('on'); loupeSheet = null; } }
  function sheetActive(sh) {
    if (sh.classList.contains('gone')) return false;
    var st = sh.closest('.stop');
    if (st) {
      if (!mqDesk.matches || !st.classList.contains('is-on')) return false;
      if (sh.parentNode === deck) return deckSheets[deckCur] === sh;
      return true;
    }
    return true;
  }
  function bindLoupe(sh) {
    if (!canHover) return;
    sh.addEventListener('mousemove', function (e) {
      if (!sheetActive(sh) || lbOpen) { if (loupeSheet === sh) hideLoupe(); return; }
      var id = docId(sh); if (!id) return;
      var r = sh.getBoundingClientRect();
      var rx = (e.clientX - r.left) / r.width, ry = (e.clientY - r.top) / r.height;
      if (rx < 0 || rx > 1 || ry < 0 || ry > 1) { hideLoupe(); return; }
      var Z = 2.5, bw = r.width * Z, bh = r.height * Z, R = 125;
      if (loupeSheet !== sh || loupe.dataset.id !== id) {
        loupeSheet = sh; loupe.dataset.id = id;
        var cur = $('img', sh);
        loupe.style.backgroundImage = 'url("' + (zoomReady[id] === true ? zoomSrc(id) : (cur.currentSrc || cur.src)) + '")';
        loadZoom(id, function () { if (loupe.dataset.id === id) loupe.style.backgroundImage = 'url("' + zoomSrc(id) + '")'; });
      }
      loupe.style.backgroundSize = bw + 'px ' + bh + 'px';
      loupe.style.backgroundPosition = (-(rx * bw - R)) + 'px ' + (-(ry * bh - R)) + 'px';
      loupe.style.setProperty('--x', e.clientX + 'px');
      loupe.style.setProperty('--y', e.clientY + 'px');
      loupe.classList.add('on');
    });
    sh.addEventListener('mouseleave', function () { if (loupeSheet === sh) hideLoupe(); });
  }
  window.addEventListener('scroll', function () { if (loupeSheet) hideLoupe(); }, { passive: true });

  /* ============ ПОЛНЫЙ ПРОСМОТР ============ */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbScroll = $('#lbScroll'), lbOpen = false, lbReturn = null;
  function openDoc(id, title) {
    lbReturn = document.activeElement;
    lbOpen = true; hideLoupe();
    $('#lbTitle').textContent = title || '';
    lb.classList.remove('zoomed');
    lbImg.alt = title || '';
    lbImg.src = DOC + id + '.webp';
    loadZoom(id, function () { if (lbOpen && lbImg.getAttribute('src').indexOf(id + '.webp') > -1) lbImg.src = zoomSrc(id); });
    lb.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('on'); }); });
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeDoc() {
    if (!lbOpen) return;
    lbOpen = false; lb.classList.remove('on');
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 400);
    if (lenis) lenis.start();
    document.body.style.overflow = '';
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }
  function toggleZoom(e) {
    var on = !lb.classList.contains('zoomed');
    var fx = 0.5, fy = 0.3;
    if (e && e.target === lbImg) {
      var r = lbImg.getBoundingClientRect();
      fx = (e.clientX - r.left) / r.width; fy = (e.clientY - r.top) / r.height;
    }
    lb.classList.toggle('zoomed', on);
    if (on) requestAnimationFrame(function () {
      lbScroll.scrollLeft = lbImg.offsetWidth * fx - lbScroll.clientWidth / 2;
      lbScroll.scrollTop = lbImg.offsetHeight * fy - lbScroll.clientHeight / 2;
    });
  }
  $('#lbClose').addEventListener('click', closeDoc);
  $('#lbZoom').addEventListener('click', function () { toggleZoom(); });
  var dragMoved = false;
  lbImg.addEventListener('click', function (e) { if (!dragMoved) toggleZoom(e); });
  lbScroll.addEventListener('click', function (e) { if (e.target === lbScroll) closeDoc(); });
  (function drag() {
    var down = false, sx, sy, sl, st;
    lbScroll.addEventListener('mousedown', function (e) {
      if (!lb.classList.contains('zoomed')) return;
      down = true; dragMoved = false; sx = e.clientX; sy = e.clientY; sl = lbScroll.scrollLeft; st = lbScroll.scrollTop; e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 5) dragMoved = true;
      lbScroll.scrollLeft = sl - (e.clientX - sx); lbScroll.scrollTop = st - (e.clientY - sy);
    });
    window.addEventListener('mouseup', function () { down = false; setTimeout(function () { dragMoved = false; }, 0); });
  })();
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (lbOpen) closeDoc(); else if (document.body.classList.contains('menu-open')) toggleMenu(false); }
  });

  function sheetTitle(sh) {
    var k = sh.getAttribute('data-title-key');
    return k ? plain(t(k)) : ($('img', sh) && $('img', sh).alt) || '';
  }
  $$('.stop .sheet[data-doc]').forEach(function (sh) {
    if (sh.parentNode === deck) return;
    sh.addEventListener('click', function () {
      var st = sh.closest('.stop');
      if (mqDesk.matches && st && !st.classList.contains('is-on')) return;
      openDoc(docId(sh), sheetTitle(sh));
    });
  });
  $$('.sheet').forEach(bindLoupe);
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = (lang === 'kk' && b.getAttribute('data-open-kk')) || b.getAttribute('data-open');
      var k = b.getAttribute('data-title-key');
      var cap = b.closest('.stop-cap');
      openDoc(id, k ? plain(t(k)) : (cap ? $('h3', cap).textContent : ''));
    });
  });

  /* ============ ПИСЬМА ============ */
  var curLetter = 0, letterBusy = false, lettersSeen = false;
  var lSheet = $('#letterSheet'), lImg = $('#letterImg'), lMarks = $('#letterMarks');
  function lt(L, f) { return t('letters.' + L.id + '.' + f, L[f]) || L[f]; }
  function fillLetter(i) {
    var L = LETTERS[i];
    lSheet.setAttribute('data-doc', L.id);
    lImg.src = DOC + L.id + '.webp';
    lImg.alt = plain(t('pis.h2')) + ': ' + lt(L, 'company');
    lMarks.innerHTML = '';
    L.marks.forEach(function (m) {
      var s = document.createElement('span');
      s.className = 'mk';
      s.style.cssText = 'left:' + m.x + '%;top:' + m.y + '%;width:' + m.w + '%;height:' + m.h + '%';
      lMarks.appendChild(s);
    });
    var parts = [lt(L, 'city'), lt(L, 'date')];
    if (L.no) parts.push(t('pis.no') + '\u00a0' + L.no);
    $('#letterMeta').innerHTML = '<b>' + lt(L, 'company') + '</b><span>' + parts.join(' \u00b7 ') + '</span>';
    $('#letterQuote').textContent = lt(L, 'quote');
    $('#letterSecond').textContent = L.second ? lt(L, 'second') : '';
    $('#letterSign').textContent = t('pis.signed') + ' ' + lt(L, 'sign');
    /* цитата не на языке оригинала - пометка «перевод», на скане остаётся оригинал */
    var tr = lang !== 'ru' && dicts[lang] && dicts[lang]['letters.' + L.id + '.quote'] != null;
    var trEl = $('#letterTr'); trEl.hidden = !tr; trEl.textContent = tr ? t('pis.tr') : '';
    $('#letterCur').textContent = i + 1;
    $('#letterAll').textContent = LETTERS.length;
    $('#letterPrev').disabled = i === 0;
    $('#letterNext').disabled = i === LETTERS.length - 1;
    $$('#letterThumbs button').forEach(function (b, j) { b.setAttribute('aria-current', String(j === i)); });
  }
  function markIn(delay) {
    var mk = $$('.mk', lMarks);
    if (!hasGsap || reduce) { mk.forEach(function (m) { m.style.transform = 'none'; }); return; }
    gsap.fromTo(mk, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.42, delay: delay || 0 });
  }
  function quoteIn(delay) {
    if (!hasGsap || reduce) return;
    var q = $('#letterQuote');
    var sp = new SplitText(q, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(sp.lines, { yPercent: 105, duration: 0.9, ease: E, stagger: 0.07, delay: delay || 0, onComplete: function () { sp.revert(); } });
    gsap.from(['#letterMeta', '#letterSecond', '#letterSign'], { opacity: 0, y: 18, duration: 0.6, ease: E, stagger: 0.08, delay: delay || 0 });
  }
  function renderLetter(i, animate, dir) {
    if (!LETTERS.length) return;
    i = clamp(i, 0, LETTERS.length - 1);
    if (!animate || !hasGsap || reduce) {
      curLetter = i; fillLetter(i);
      if (lettersSeen || !hasGsap || reduce) $$('.mk', lMarks).forEach(function (m) { m.style.transform = 'none'; });
      return;
    }
    if (letterBusy || i === curLetter) return;
    letterBusy = true; hideLoupe();
    var out = dir > 0 ? { xPercent: 70, rotationY: -40, z: 160 } : { xPercent: -30, rotationY: 30, z: -500 };
    var tl = gsap.timeline({ onComplete: function () { letterBusy = false; gsap.set(lSheet, { clearProps: 'all' }); } });
    tl.to(lSheet, { xPercent: out.xPercent, rotationY: out.rotationY, z: out.z, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to(['#letterMeta', '#letterQuote', '#letterSecond', '#letterSign'], { opacity: 0, y: -14, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, 0)
      .add(function () {
        curLetter = i; fillLetter(i);
        gsap.set(['#letterMeta', '#letterQuote', '#letterSecond', '#letterSign'], { clearProps: 'all' });
        quoteIn(0.25); markIn(0.75);
      })
      .fromTo(lSheet, dir > 0 ? { xPercent: 8, yPercent: -4, z: -620, rotationY: 9, opacity: 0 } : { xPercent: 70, rotationY: -40, z: 160, opacity: 0 },
        { xPercent: 0, yPercent: 0, z: 0, rotationY: 9, rotationX: 1.5, opacity: 1, duration: 1, ease: E });
  }
  (function buildThumbs() {
    var box = $('#letterThumbs');
    LETTERS.forEach(function (L, j) {
      var b = document.createElement('button');
      b.type = 'button';
      b.style.backgroundImage = 'url("' + DOC + 'thumb/' + L.id + '.webp")';
      b.setAttribute('aria-label', L.company);
      b.addEventListener('click', function () { renderLetter(j, true, j > curLetter ? 1 : -1); });
      box.appendChild(b);
    });
    if (LETTERS.length < 2) { box.classList.add('single'); $('.letter-arrows').hidden = true; $$('.letter-ghost').forEach(function (g) { g.hidden = true; }); }
  })();
  $('#letterPrev').addEventListener('click', function () { renderLetter(curLetter - 1, true, -1); });
  $('#letterNext').addEventListener('click', function () { renderLetter(curLetter + 1, true, 1); });
  $('#letterOpen').addEventListener('click', function () { var L = LETTERS[curLetter]; openDoc(L.id, lt(L, 'company') + ', ' + lt(L, 'date')); });
  lSheet.addEventListener('click', function () { var L = LETTERS[curLetter]; openDoc(L.id, lt(L, 'company') + ', ' + lt(L, 'date')); });
  if (canHover) {
    lSheet.addEventListener('mouseenter', function () { lSheet.classList.add('flat'); });
    lSheet.addEventListener('mouseleave', function () { lSheet.classList.remove('flat'); });
  }

  /* ============ УЗОРЫ (гильош с защитной сетки документов) ============ */
  function guilloche() {
    var NS = 'http://www.w3.org/2000/svg';
    function add(svg, d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); svg.appendChild(p); }
    function ring(svg, R, A, N, K, steps, mod) {
      for (var k = 0; k < K; k++) {
        var ph = k * 2 * Math.PI / K, d = '';
        for (var s = 0; s <= steps; s++) {
          var a = s / steps * 2 * Math.PI;
          var r = R + A * Math.sin(N * a + ph) * (mod ? (0.6 + 0.4 * Math.cos(mod * a)) : 1);
          d += (s ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1);
        }
        add(svg, d + 'Z');
      }
    }
    $$('svg.guilloche').forEach(function (svg) {
      var g = svg.getAttribute('data-g');
      if (g === 'rosette') { ring(svg, 438, 46, 30, 6, 420); ring(svg, 350, 16, 48, 3, 420); }
      else if (g === 'rosette2') { ring(svg, 330, 150, 9, 9, 360, 3); ring(svg, 150, 40, 14, 4, 240); }
      else if (g === 'rosette3') { ring(svg, 400, 90, 12, 8, 360, 4); ring(svg, 250, 60, 20, 5, 300); }
      else if (g === 'ribbon' || g === 'ribbon2') {
        var K = 9, f = g === 'ribbon' ? 7 : 5;
        for (var k = 0; k < K; k++) {
          var d = '', ph = k * 2 * Math.PI / K;
          for (var x = 0; x <= 1600; x += 8) {
            var env = 0.55 + 0.45 * Math.sin(x / 1600 * Math.PI * 3 + 1);
            d += (x ? 'L' : 'M') + x + ' ' + (110 + 78 * env * Math.sin(x / 1600 * 2 * Math.PI * f + ph)).toFixed(1);
          }
          add(svg, d);
        }
      } else if (g === 'frame') {
        var W = 400, H = 560, per = 2 * (W + H);
        for (var k2 = 0; k2 < 3; k2++) {
          var d2 = '', ph2 = k2 * 2 * Math.PI / 3;
          for (var s2 = 0; s2 <= 900; s2++) {
            var u = s2 / 900 * per, off = 7 + 5 * Math.sin(u / per * 2 * Math.PI * 120 + ph2), px, py;
            if (u < W) { px = u; py = off; }
            else if (u < W + H) { px = W - off; py = u - W; }
            else if (u < 2 * W + H) { px = W - (u - W - H); py = H - off; }
            else { px = off; py = H - (u - 2 * W - H); }
            d2 += (s2 ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
          }
          add(svg, d2);
        }
        add(svg, 'M16 16H384V544H16Z');
      }
    });
  }
  guilloche();

  /* ============ ШАПКА, МЕНЮ, ЯКОРЯ ============ */
  function toggleMenu(open) {
    var b = document.body, on = open == null ? !b.classList.contains('menu-open') : open;
    b.classList.toggle('menu-open', on);
    $('.burger').setAttribute('aria-expanded', String(on));
    $('#mmenu').setAttribute('aria-hidden', String(!on));
    if (lenis) { on ? lenis.stop() : lenis.start(); }
  }
  $('.burger').addEventListener('click', function () { toggleMenu(); });

  function anchorY(id) {
    if (id === 'top') return 0;
    if (id === 'dokumenty' && mqDesk.matches) return hall.offsetTop;
    var el = document.getElementById(id);
    if (!el) return null;
    var y = el.getBoundingClientRect().top + window.scrollY - hdrH();
    if (el.classList.contains('svc') || el.classList.contains('oneoff') || el.classList.contains('paper')) y -= 18;
    return Math.max(0, y + 1);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.closest('#rail') || a.hasAttribute('data-goto')) return;
    var id = a.getAttribute('href').slice(1);
    var y = anchorY(id);
    if (y == null) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) toggleMenu(false);
    var svc = a.getAttribute('data-service');
    if (svc) { var sel = $('#fService'); if (sel) sel.value = svc; }
    scrollToY(y);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  var navLinks = $$('.nav a');
  var navTargets = navLinks.map(function (a) { return a.getAttribute('href').slice(1); });
  function updateNav() {
    var y = window.scrollY + hdrH() + vh * 0.3, cur = -1, best = -1;
    navTargets.forEach(function (id, i) {
      var ty = id === 'dokumenty' && mqDesk.matches ? hall.offsetTop - vh * 0.3 : (function () { var el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : 1e9; })();
      if (ty <= y && ty > best) { best = ty; cur = i; }
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  var navT = 0;
  window.addEventListener('scroll', function () { if (!navT) navT = setTimeout(function () { navT = 0; updateNav(); }, 120); }, { passive: true });

  /* ============ ФОРМА ============ */
  var form = $('#leadForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name, phone = form.elements.phone, ok = true;
    [name, phone].forEach(function (f) {
      var bad = f === phone ? f.value.replace(/\D/g, '').length < 10 : !f.value.trim();
      f.closest('.fld').classList.toggle('err', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;
    var sel = form.elements.service;
    var lines = [
      t('wa.general'),
      plain(t('f.name')) + ': ' + name.value.trim(),
      plain(t('f.phone')) + ': ' + phone.value.trim(),
      plain(t('f.service')) + ': ' + sel.options[sel.selectedIndex].textContent
    ];
    var c = form.elements.comment.value.trim();
    if (c) lines.push(plain(t('f.comment')) + ': ' + c);
    window.open(WA + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    $('#formOk').hidden = false;
  });
  form.addEventListener('input', function (e) { var f = e.target.closest('.fld'); if (f) f.classList.remove('err'); });

  /* ============ ПОЯВЛЕНИЯ ============ */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function countUp(el, delay) {
    var to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
    if (!hasGsap || reduce) return;
    var o = { v: 0 };
    el.textContent = '0' + suf;
    gsap.to(o, { v: to, duration: 1.6, delay: delay || 0, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v) + suf; } });
  }

  function initMotion() {
    if (!hasGsap || reduce) { $$('.rv').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; }); return; }

    /* заголовки построчно */
    $$('[data-split]').forEach(function (el) {
      if (el.closest('.hero-copy')) return;
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          if (el.dataset.done) return;
          el.dataset.done = '1';
          var sp = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
          splits.push(sp);
          gsap.from(sp.lines, { yPercent: 108, duration: 1.1, ease: E, stagger: 0.09, onComplete: function () { var i = splits.indexOf(sp); if (i > -1) { splits.splice(i, 1); sp.revert(); } } });
        }
      });
    });
    $$('.sec-head .kicker i, .cons .kicker i').forEach(function (i) {
      gsap.from(i, { scaleX: 0, duration: 0.9, ease: E, scrollTrigger: { trigger: i, start: 'top 90%', once: true } });
    });
    $$('.sec-head .lead, .cons .lead').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 26, duration: 0.9, ease: E, delay: 0.15, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    ScrollTrigger.batch('.rv', {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: E, stagger: 0.08, overwrite: true }); }
    });

    /* цены: строка приходит из глубины, цифра набегает */
    var rows = $$('.price-row');
    gsap.set(rows, { opacity: 0, y: 46, scale: 0.97, transformOrigin: '50% 100%' });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: E, stagger: 0.09, clearProps: 'transform' });
        els.forEach(function (r, i) { var n = $('.num', r); if (n) countUp(n, i * 0.09); });
      }
    });
    $$('.cons .num[data-count], .stats .num[data-count]').forEach(function (n) {
      ScrollTrigger.create({ trigger: n, start: 'top 90%', once: true, onEnter: function () { countUp(n, 0.1); } });
    });
    gsap.from('.stats li', { opacity: 0, y: 40, duration: 0.9, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.stats', start: 'top 86%', once: true } });

    /* услуги аудита и лист «обязательный аудит» */
    gsap.from('.svc', { opacity: 0, y: 40, duration: 0.9, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.svc-list', start: 'top 84%', once: true } });
    gsap.from('.paper', { opacity: 0, y: 80, scale: 0.9, rotation: 5, duration: 1.2, ease: E, scrollTrigger: { trigger: '.audit-grid', start: 'top 78%', once: true } });
    gsap.from('.paper-form', { opacity: 0, y: 70, scale: 0.94, duration: 1.1, ease: E, scrollTrigger: { trigger: '.ct-grid', start: 'top 82%', once: true } });
    gsap.from('.ct-list li, .ct-btns, .map-card', { opacity: 0, y: 30, duration: 0.8, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.ct-side', start: 'top 84%', once: true } });

    /* ведомость: строки и галочки */
    var checks = $$('.checks li');
    checks.forEach(function (li) { li.style.setProperty('--ck', 0); });
    ScrollTrigger.batch(checks, {
      start: 'top 93%', once: true,
      onEnter: function (els) {
        gsap.from(els, { opacity: 0, x: -18, duration: 0.6, ease: E, stagger: 0.06 });
        gsap.to(els, { '--ck': 1, duration: 0.5, ease: 'back.out(2.4)', stagger: 0.06, delay: 0.25 });
      }
    });

    /* шаги: линия идёт за прокруткой */
    var sl = $('.step-list'), stepEls = $$('.step');
    ScrollTrigger.create({
      trigger: sl, start: 'top 80%', end: 'bottom 60%', scrub: 0.6,
      onUpdate: function (st) {
        sl.style.setProperty('--prog', st.progress.toFixed(3));
        stepEls.forEach(function (s, i) { s.classList.toggle('done', st.progress > i / stepEls.length + 0.04); });
      }
    });
    gsap.from(stepEls, { opacity: 0, y: 50, duration: 0.9, ease: E, stagger: 0.12, scrollTrigger: { trigger: sl, start: 'top 84%', once: true } });

    /* письмо: лист приходит из глубины, маркер проводит строку */
    gsap.set(lSheet, { opacity: 0 });
    ScrollTrigger.create({
      trigger: '.letter', start: 'top 72%', once: true,
      onEnter: function () {
        lettersSeen = true;
        gsap.fromTo(lSheet, { opacity: 0, z: -700, yPercent: 8, rotationY: 24 }, { opacity: 1, z: 0, yPercent: 0, rotationY: 9, rotationX: 1.5, duration: 1.3, ease: E, onComplete: function () { gsap.set(lSheet, { clearProps: 'all' }); } });
        gsap.from('.letter-ghost', { opacity: 0, duration: 1.2, delay: 0.3 });
        quoteIn(0.35); markIn(0.9);
        gsap.from('.letter-nav, .letter-thumbs', { opacity: 0, y: 20, duration: 0.7, ease: E, stagger: 0.08, delay: 0.7 });
      }
    });

    /* телефон: листы зала появляются тем же ходом */
    if (!mqDesk.matches) {
      $$('.stop').forEach(function (s) {
        gsap.from($('.mover', s), { opacity: 0, y: 70, scale: 0.86, duration: 1.1, ease: E, scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
        gsap.from($('.stop-cap', s), { opacity: 0, y: 30, duration: 0.8, ease: E, scrollTrigger: { trigger: $('.stop-cap', s), start: 'top 92%', once: true } });
      });
    }

    /* первый экран. На телефоне текст стоит сразу (он же LCP), движется только веер документов - CSS */
    if (!mqDesk.matches) return;
    var h1 = $('.hero-copy h1');
    var hs = new SplitText(h1, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    splits.push(hs);
    var tl = gsap.timeline({ delay: 0.15 });
    tl.from('.hero-copy .kicker i', { scaleX: 0, duration: 0.8, ease: E }, 0)
      .from('.hero-copy .kicker span', { opacity: 0, x: -12, duration: 0.7, ease: E }, 0.1)
      .from(hs.lines, { yPercent: 108, duration: 1.2, ease: E, stagger: 0.09, onComplete: function () { var i = splits.indexOf(hs); if (i > -1) { splits.splice(i, 1); hs.revert(); } } }, 0.15)
      .from('.hero-copy .lead', { opacity: 0, y: 24, duration: 0.9, ease: E }, 0.65)
      .from('.hero-copy .cta .btn', { opacity: 0, y: 20, duration: 0.8, ease: E, stagger: 0.09 }, 0.8)
      .from('.hero-scene', { opacity: 0, y: 40, duration: 1.4, ease: E }, 0.2)
      .from('.proofs li', { opacity: 0, y: 16, duration: 0.8, ease: E, stagger: 0.07 }, 0.9);
    /* листы зала въезжают, когда зал подходит к окну */
    ScrollTrigger.create({ trigger: hall, start: 'top 95%', once: true, onEnter: function () { gsap.to(scene, { intro: 0, duration: 2.2, ease: 'expo.out' }); } });
  }


  /* ============ ПЕРВЫЙ ЭКРАН: БАЛАНС СХОДИТСЯ ============ */
  (function heroLedger() {
    var L = $('#ledger'); if (!L) return;
    var heroSec = $('.hero'), stage = $('.ledger-stage');
    var rowsA = $$('.lg-a .lg-row:not(.lg-total)', L), rowsP = $$('.lg-p .lg-row:not(.lg-total)', L);
    var totA = $('.lg-a .lg-total', L), totP = $('.lg-p .lg-total', L);
    var sweep = $('.lg-sweep', L), delta = $('.lg-delta', L);
    var BAD = 3;
    function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
    function val(row) { return $('.lg-v', row); }
    function setV(el, n) { el.textContent = fmt(n); el.dataset.cur = n; }
    function roll(el, to, dur) {
      return new Promise(function (res) {
        var from = +el.dataset.cur || +el.dataset.start, t0 = performance.now();
        (function f(now) {
          var k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
          setV(el, from + (to - from) * e);
          if (k < 1) requestAnimationFrame(f); else res();
        })(t0);
      });
    }
    var visible = true;
    function wait(ms) {
      return new Promise(function (res) {
        var left = ms, last = performance.now();
        (function f(now) {
          if (visible) left -= now - last;
          last = now;
          if (left <= 0) res(); else requestAnimationFrame(f);
        })(last);
      });
    }
    function moveSweep(row) {
      sweep.style.height = row.offsetHeight + 'px';
      sweep.style.transform = 'translate3d(0,' + row.offsetTop + 'px,0)';
      L.classList.add('sweeping');
    }
    function reset() {
      L.classList.remove('sweeping', 'done', 'bad');
      $$('.lg-row', L).forEach(function (r) { r.classList.remove('ok', 'flag', 'match'); });
      $$('.lg-v', L).forEach(function (v) { setV(v, +v.dataset.start); });
      delta.classList.remove('on');
    }
    function finalState() {
      $$('.lg-row', L).forEach(function (r) { r.classList.add('ok'); });
      $$('.lg-v', L).forEach(function (v) { setV(v, +v.dataset.v); });
      totA.classList.add('match'); totP.classList.add('match'); L.classList.add('done');
    }
    $$('.lg-v', L).forEach(function (v) { v.dataset.cur = v.dataset.start; });
    if (reduce) { finalState(); return; }

    function step(i) {
      if (i >= rowsA.length) return finish();
      if (!rowsA[i].offsetParent) { rowsA[i].classList.add('ok'); rowsP[i].classList.add('ok'); return step(i + 1); }
      moveSweep(rowsA[i]);
      return wait(520).then(function () {
        rowsA[i].classList.add('ok');
        if (i !== BAD) return null;
        var r = rowsP[i];
        r.classList.add('flag');
        delta.style.transform = 'translate3d(0,' + (r.offsetTop + r.offsetHeight / 2) + 'px,0)';
        delta.classList.add('on');
        return wait(1150)
          .then(function () { return Promise.all([roll(val(r), +val(r).dataset.v, 900), roll(val(totP), +val(totP).dataset.v, 900)]); })
          .then(function () { delta.classList.remove('on'); r.classList.remove('flag'); return wait(160); });
      }).then(function () {
        rowsP[i].classList.add('ok');
        return wait(260);
      }).then(function () { return step(i + 1); });
    }
    function finish() {
      moveSweep(totA);
      return wait(520).then(function () {
        totA.classList.add('match'); totP.classList.add('match');
        L.classList.remove('bad'); L.classList.add('done');
        return wait(700);
      }).then(function () { L.classList.remove('sweeping'); return wait(4600); })
        .then(function () { L.classList.add('fade'); return wait(600); })
        .then(function () { reset(); L.classList.remove('fade'); return wait(900); });
    }
    function cycle() { L.classList.add('bad'); return step(0).then(cycle); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        heroSec.classList.toggle('paused', !visible);
      }).observe(heroSec);
    }
    wait(1300).then(cycle);

    /* наклон листа за курсором и уход по прокрутке (мышь, десктоп) */
    if (canHover) {
      var mx = 0, my = 0, tx = 0, ty = 0, raf = 0;
      var tilt = function () {
        mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
        stage.style.setProperty('--mx', mx.toFixed(3)); stage.style.setProperty('--my', my.toFixed(3));
        raf = (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) ? requestAnimationFrame(tilt) : 0;
      };
      heroSec.addEventListener('mousemove', function (e) {
        tx = (e.clientX / window.innerWidth) * 2 - 1; ty = (e.clientY / window.innerHeight) * 2 - 1;
        if (!raf) raf = requestAnimationFrame(tilt);
      });
      heroSec.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tilt); });
    }
    if (hasGsap && mqDesk.matches) {
      gsap.fromTo(stage, { '--sp': 0 }, { '--sp': 1, ease: 'none', scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom top', scrub: true } });
    }
  })();

  /* подтверждения под листом ведут к нужному документу */
  $$('.proofs a[data-goto]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var k = +a.getAttribute('data-goto');
      if (k === 4) { scrollToY(lettersSec.offsetTop - hdrH() + 2); return; }
      if (mqDesk.matches) { scrollToY(hall.offsetTop); goTo(k); return; }
      var st = stops[k]; if (st) scrollToY(st.getBoundingClientRect().top + window.scrollY - hdrH() - 8);
    });
  });

  /* ============ СТАРТ ============ */
  layoutHall();
  setWaLinks();
  renderDeckCap();
  renderLetter(0, false);
  if (!hasGsap || reduce) scene.intro = 0;
  renderHall(); updateRail(); updateNav();
  var started = false;
  function start() {
    if (started) return; started = true;
    root.classList.add('ready');
    initMotion();
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(start); setTimeout(start, 1200); }
  else start();

  var rw = window.innerWidth, rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var w = window.innerWidth;
      if (w === rw && !mqDesk.matches) return;   /* на телефоне адресная строка меняет только высоту */
      rw = w; layoutHall(); renderHall();
      if (hasGsap) ScrollTrigger.refresh();
    }, 150);
  });
  window.addEventListener('load', function () {
    layoutHall(); if (hasGsap) ScrollTrigger.refresh();
    if (location.hash.length > 1) { var y = anchorY(location.hash.slice(1)); if (y != null) scrollToY(y, true); }
  });

  /* язык: ?lang= главнее сохранённого выбора */
  (function initLang() {
    var m = location.search.match(/[?&]lang=(ru|kk|kz|en)\b/), l = null;
    if (m) l = m[1] === 'kz' ? 'kk' : m[1];
    else { try { l = localStorage.getItem('ba-lang'); } catch (e) {} }
    if (l && l !== 'ru') setLang(l, false);
  })();
})();
