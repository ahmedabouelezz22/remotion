/*
 * سكربت القالب — صغير ومستقل، والموقع يعمل كاملاً بدونه.
 *  1) تفاعل الواجهة مع المؤشّر واللمس (الطبقات، الضوء، إمالة البطاقات)
 *  2) ظهور الأقسام عند التمرير
 *  3) عدّاد الأرقام
 *  4) نسخ رابط المقال
 *  5) إغلاق القوائم بـ Escape وعند اختيار رابط
 * كل الحركة متوقّفة لمن فعّل «تقليل الحركة» في جهازه.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) التفاعل مع المؤشّر واللمس
  if (!reduce) {
    document.querySelectorAll('[data-abz-interactive]').forEach(function (area) {
      var frame = null;
      function update(clientX, clientY) {
        var rect = area.getBoundingClientRect();
        var x = (clientX - rect.left) / rect.width;
        var y = (clientY - rect.top) / rect.height;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          area.style.setProperty('--mx', ((x - 0.5) * 2).toFixed(3));
          area.style.setProperty('--my', ((y - 0.5) * 2).toFixed(3));
          area.style.setProperty('--px', (x * 100).toFixed(1) + '%');
          area.style.setProperty('--py', (y * 100).toFixed(1) + '%');
        });
      }
      area.addEventListener('pointermove', function (e) { update(e.clientX, e.clientY); }, { passive: true });
      area.addEventListener('touchmove', function (e) {
        if (e.touches[0]) update(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      area.addEventListener('pointerleave', function () {
        area.style.setProperty('--mx', '0');
        area.style.setProperty('--my', '0');
      });
    });

    document.querySelectorAll('[data-abz-tilt]').forEach(function (card) {
      card.classList.add('abz-tilt');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        card.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--tx', '0');
        card.style.setProperty('--ty', '0');
      });
    });
  }

  // 2) الظهور عند التمرير
  var reveals = document.querySelectorAll('.abz-reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // 3) عدّاد الأرقام: data-count="86" — للأرقام الحقيقية فقط
  if (!reduce && 'IntersectionObserver' in window) {
    var counters = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
        var prefix = el.getAttribute('data-prefix') || '';
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1200, 1);
          el.textContent = prefix + (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counters.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { counters.observe(el); });
  }

  // 4) نسخ الرابط
  document.querySelectorAll('[data-abz-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var url = button.getAttribute('data-abz-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var label = button.querySelector('[data-label]');
          if (label) {
            var old = label.textContent;
            label.textContent = 'تمّ النسخ';
            setTimeout(function () { label.textContent = old; }, 1800);
          }
        });
      }
    });
  });

  // 5) القوائم
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('details[open][data-abz-menu]').forEach(function (d) { d.removeAttribute('open'); });
    if (document.activeElement && document.activeElement.closest('[data-abz-dropdown]')) document.activeElement.blur();
  });
  document.querySelectorAll('details[data-abz-menu] a').forEach(function (a) {
    a.addEventListener('click', function () {
      var d = a.closest('details[data-abz-menu]');
      if (d) d.removeAttribute('open');
    });
  });

  // 6) زر العودة إلى الأعلى
  var topBtn = document.querySelector('[data-abz-top]');
  if (topBtn) {
    var onScroll = function () {
      var show = window.scrollY > 700;
      topBtn.classList.toggle('hidden', !show);
      topBtn.classList.toggle('inline-flex', show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 7) لوحة الواجهة: تميل نحو المؤشّر ويتبعها الضوء (CSS يقرأ ‎--mx/--my‎)
  //    وعند اللمس يُسحب الإصبع فتدور الحلقات في اتجاهه.
  document.querySelectorAll('[data-abz-orbit]').forEach(function (orbit) {
    if (reduce) return;
    var area = orbit.closest('[data-abz-interactive]') || orbit;
    var last = null;
    area.addEventListener('pointermove', function (e) {
      if (last !== null) {
        var dx = e.clientX - last;
        if (Math.abs(dx) > 2) orbit.style.setProperty('--dir', dx > 0 ? 'normal' : 'reverse');
      }
      last = e.clientX;
    }, { passive: true });
  });

  // 8) الألعاب
  var gamesRoot = document.querySelector('[data-abz-games]');
  var gamesData = document.getElementById('abz-games-data');
  if (gamesRoot && gamesData) {
    var data;
    try { data = JSON.parse(gamesData.textContent); } catch (err) { data = null; }
    if (data) initGames(gamesRoot, data);
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function initGames(root, data) {
    var q = function (sel) { return root.querySelector(sel); };
    // التبويبات
    root.querySelectorAll('[data-game-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        root.querySelectorAll('[data-game-tab]').forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        root.querySelectorAll('[data-game]').forEach(function (g) { g.hidden = g.getAttribute('data-game') !== tab.getAttribute('data-game-tab'); });
      });
    });

    // — اختبر معلوماتك —
    var quiz = { list: [], i: 0, score: 0 };
    var btnBase = 'min-h-[52px] rounded-2xl border-2 px-5 py-3 text-start font-bold transition-colors ';
    function quizStart() {
      quiz.list = shuffle(data.quiz || []);
      quiz.i = 0; quiz.score = 0;
      q('[data-quiz-total]').textContent = quiz.list.length;
      q('[data-quiz-restart]').classList.add('hidden');
      quizShow();
    }
    function quizShow() {
      var item = quiz.list[quiz.i];
      q('[data-quiz-progress]').textContent = quiz.i + 1;
      q('[data-quiz-score]').textContent = quiz.score;
      q('[data-quiz-question]').textContent = item.q;
      q('[data-quiz-feedback]').textContent = '';
      q('[data-quiz-next]').classList.add('hidden');
      var box = q('[data-quiz-answers]');
      box.textContent = '';
      shuffle(item.a.map(function (text, idx) { return { text: text, ok: idx === item.c }; })).forEach(function (ans) {
        var b = el('button', btnBase + 'border-sand-200 bg-white text-navy-900 hover:border-gold-500', ans.text);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (box.getAttribute('data-done')) return;
          box.setAttribute('data-done', '1');
          box.querySelectorAll('button').forEach(function (other) { other.disabled = true; });
          if (ans.ok) {
            quiz.score++;
            b.className = btnBase + 'border-forest-600 bg-forest-50 text-forest-900';
            q('[data-quiz-feedback]').textContent = 'إجابة صحيحة ✓';
            q('[data-quiz-feedback]').className = 'mt-5 min-h-[2rem] font-bold text-forest-600';
          } else {
            b.className = btnBase + 'border-red-600 bg-red-50 text-red-800';
            q('[data-quiz-feedback]').textContent = 'ليست هذه. الصحيح: ' + item.a[item.c];
            q('[data-quiz-feedback]').className = 'mt-5 min-h-[2rem] font-bold text-red-700';
          }
          q('[data-quiz-score]').textContent = quiz.score;
          if (quiz.i < quiz.list.length - 1) {
            q('[data-quiz-next]').classList.remove('hidden');
          } else {
            q('[data-quiz-feedback]').textContent += ' — انتهى الاختبار: ' + quiz.score + ' من ' + quiz.list.length + '.';
            q('[data-quiz-restart]').classList.remove('hidden');
          }
        });
        box.appendChild(b);
      });
      box.removeAttribute('data-done');
    }
    q('[data-quiz-next]').addEventListener('click', function () { quiz.i++; quizShow(); });
    q('[data-quiz-restart]').addEventListener('click', quizStart);
    if ((data.quiz || []).length) quizStart();

    // — رتّب الحروف —
    var scr = { order: [], i: -1, score: 0, picked: [], solved: false };
    var tile = 'flex h-12 w-12 items-center justify-center rounded-xl font-display text-xl font-black ';
    function scrNext() {
      if (!scr.order.length || scr.i >= scr.order.length - 1) { scr.order = shuffle(data.glossary || []); scr.i = -1; }
      scr.i++; scr.picked = []; scr.solved = false;
      var item = scr.order[scr.i];
      q('[data-scramble-def]').textContent = item.def;
      q('[data-scramble-feedback]').textContent = '';
      var letters = shuffle(Array.from(item.term));
      if (letters.join('') === item.term && letters.length > 1) letters.reverse();
      var box = q('[data-scramble-letters]');
      box.textContent = '';
      letters.forEach(function (ch) {
        var b = el('button', tile + 'bg-navy-900 text-gold-300 hover:bg-navy-800 disabled:opacity-25', ch);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (scr.solved) return;
          b.disabled = true;
          scr.picked.push({ ch: ch, btn: b });
          scrRender();
        });
        box.appendChild(b);
      });
      scrRender();
    }
    function scrRender() {
      var item = scr.order[scr.i];
      var slots = q('[data-scramble-slots]');
      slots.textContent = '';
      scr.picked.forEach(function (p) { slots.appendChild(el('span', tile + 'bg-gold-500 text-navy-950', p.ch)); });
      var word = scr.picked.map(function (p) { return p.ch; }).join('');
      var fb = q('[data-scramble-feedback]');
      if (word.length === Array.from(item.term).length) {
        if (word === item.term) {
          scr.solved = true; scr.score++;
          q('[data-scramble-score]').textContent = scr.score;
          fb.textContent = 'أحسنت! «' + item.term + '»';
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-forest-600';
        } else {
          fb.textContent = 'ليس صحيحاً. اضغط «امسح» وحاول مجدّداً.';
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-red-700';
        }
      } else { fb.textContent = ''; }
    }
    q('[data-scramble-clear]').addEventListener('click', function () {
      if (scr.solved) return;
      scr.picked.forEach(function (p) { p.btn.disabled = false; });
      scr.picked = []; scrRender();
    });
    q('[data-scramble-next]').addEventListener('click', scrNext);
    if ((data.glossary || []).length) scrNext();

    // — المطابقة —
    var mem = { open: [], moves: 0, matched: 0, lock: false, pairs: 0 };
    function memStart() {
      var picks = shuffle(data.glossary || []).slice(0, 4);
      var cards = [];
      picks.forEach(function (item, id) { cards.push({ id: id, text: item.term, kind: 'term' }); cards.push({ id: id, text: item.def, kind: 'def' }); });
      mem.open = []; mem.moves = 0; mem.matched = 0; mem.lock = false; mem.pairs = picks.length;
      q('[data-memory-moves]').textContent = '0';
      q('[data-memory-feedback]').textContent = '';
      var grid = q('[data-memory-grid]');
      grid.textContent = '';
      shuffle(cards).forEach(function (card) {
        var b = el('button', 'abz-mem flex min-h-[7.5rem] items-center justify-center rounded-2xl border-2 border-navy-900 bg-navy-900 p-3 text-center text-sm font-bold leading-6 text-transparent transition-colors');
        b.type = 'button';
        b.setAttribute('aria-label', 'بطاقة مقلوبة');
        b.textContent = card.text;
        b.addEventListener('click', function () {
          if (mem.lock || b.getAttribute('data-open')) return;
          b.setAttribute('data-open', '1');
          b.setAttribute('aria-label', card.text);
          b.className = b.className.replace('bg-navy-900', card.kind === 'term' ? 'bg-gold-50' : 'bg-white').replace('text-transparent', 'text-navy-900');
          mem.open.push({ card: card, btn: b });
          if (mem.open.length < 2) return;
          mem.moves++;
          q('[data-memory-moves]').textContent = mem.moves;
          var a = mem.open[0], c = mem.open[1];
          if (a.card.id === c.card.id && a.card.kind !== c.card.kind) {
            [a, c].forEach(function (o) { o.btn.disabled = true; o.btn.className = o.btn.className.replace('border-navy-900', 'border-forest-600'); });
            mem.open = []; mem.matched++;
            if (mem.matched === mem.pairs) q('[data-memory-feedback]').textContent = 'أتممت المطابقة في ' + mem.moves + ' محاولة!';
          } else {
            mem.lock = true;
            setTimeout(function () {
              [a, c].forEach(function (o) {
                o.btn.removeAttribute('data-open');
                o.btn.setAttribute('aria-label', 'بطاقة مقلوبة');
                o.btn.className = o.btn.className.replace('bg-gold-50', 'bg-navy-900').replace('bg-white', 'bg-navy-900').replace('text-navy-900', 'text-transparent');
              });
              mem.open = []; mem.lock = false;
            }, 1100);
          }
        });
        grid.appendChild(b);
      });
    }
    q('[data-memory-restart]').addEventListener('click', memStart);
    if ((data.glossary || []).length) memStart();
  }
})();
