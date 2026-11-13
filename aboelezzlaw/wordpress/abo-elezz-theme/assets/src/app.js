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
})();
