/* «مفيد» — نافذة المساعد الذكي. النصوص تُدرج كنصّ لا كـ HTML، والروابط الداخلية وحدها تُحوَّل إلى روابط. */
(function () {
  var root = document.querySelector('[data-abz-assistant]');
  var cfg = window.abzAssistant;
  if (!root || !cfg) return;
  var toggle = root.querySelector('[data-abz-assistant-toggle]');
  var panel = root.querySelector('[data-abz-assistant-panel]');
  var log = root.querySelector('[data-abz-assistant-log]');
  var form = root.querySelector('[data-abz-assistant-form]');
  var input = form.querySelector('textarea');
  var chips = root.querySelector('[data-abz-assistant-chips]');
  var history = [];
  var busy = false;
  var homeHost = new URL(cfg.home).host;

  try { history = JSON.parse(sessionStorage.getItem('abzAssistant') || '[]') || []; } catch (e) { history = []; }

  function linkify(container, text) {
    var parts = text.split(/(https?:\/\/[^\s)،,]+)/g);
    parts.forEach(function (part) {
      var internal = false;
      if (/^https?:\/\//.test(part)) {
        try { var u = new URL(part); internal = u.host === homeHost || u.host === 'wa.me'; } catch (e) {}
      }
      if (internal) {
        var a = document.createElement('a');
        a.href = part;
        a.textContent = part.indexOf('wa.me') > -1 ? 'واتساب' : decodeURI(new URL(part).pathname).replace(/^\/|\/$/g, '') || 'الرئيسية';
        a.className = 'font-bold underline underline-offset-4';
        if (part.indexOf('wa.me') > -1) { a.target = '_blank'; a.rel = 'noopener'; }
        container.appendChild(a);
      } else {
        container.appendChild(document.createTextNode(part));
      }
    });
  }

  function bubble(role, text, extra) {
    var div = document.createElement('div');
    div.className = role === 'user'
      ? 'ms-auto max-w-[90%] whitespace-pre-line rounded-2xl bg-navy-900 p-3 text-white'
      : 'max-w-[90%] whitespace-pre-line rounded-2xl bg-white p-3 text-navy-900' + (extra ? ' ' + extra : '');
    if (role === 'user') div.textContent = text; else linkify(div, text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  history.forEach(function (m) { bubble(m.role, m.content); });

  function save() {
    try { sessionStorage.setItem('abzAssistant', JSON.stringify(history.slice(-12))); } catch (e) {}
  }

  function open(state) {
    panel.hidden = !state;
    toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
    if (state) setTimeout(function () { input.focus(); }, 50);
  }
  toggle.addEventListener('click', function () { open(panel.hidden); });
  root.querySelector('[data-abz-assistant-close]').addEventListener('click', function () { open(false); toggle.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); toggle.focus(); } });

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    if (chips) chips.remove(), (chips = null);
    bubble('user', text);
    history.push({ role: 'user', content: text });
    save();
    var wait = bubble('assistant', '… يكتب مفيد', 'text-slate-500');
    fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ messages: history.slice(-8) })
    }).then(function (r) { return r.json().catch(function () { return {}; }); }).then(function (data) {
      wait.remove();
      if (data && data.reply) {
        bubble('assistant', data.reply);
        history.push({ role: 'assistant', content: data.reply });
        save();
      } else {
        history.pop();
        save();
        var err = bubble('assistant', (data && data.error) || 'تعذّر الردّ الآن.', 'border border-red-200');
        if (cfg.wa) { err.appendChild(document.createTextNode(' ')); var a = document.createElement('a'); a.href = cfg.wa; a.target = '_blank'; a.rel = 'noopener'; a.className = 'font-bold underline'; a.textContent = 'راسلنا على واتساب'; err.appendChild(a); }
      }
    }).catch(function () {
      wait.remove();
      history.pop();
      save();
      bubble('assistant', 'تعذّر الاتصال. تحقّق من الإنترنت وحاول مجدداً.', 'border border-red-200');
    }).then(function () { busy = false; });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value; input.value = ''; send(t); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });
  if (chips) chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) send(b.textContent); });
})();
