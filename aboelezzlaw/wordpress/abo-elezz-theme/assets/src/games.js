/*
 * ألعاب صفحة «ألعاب وألغاز قانونية» — سكربت مستقل بلا اعتماديات.
 *  الألعاب القديمة: اختبر معلوماتك، رتّب الحروف، طابق المصطلح بمعناه
 *  الألعاب الجديدة: صح أم خطأ؟، خمّن المصطلح، اكتشف البند الخطر، رتّب الخطوات
 * كل المحتوى معلومات قانونية عامة للتسلية والتعلّم، لا استشارة قانونية.
 * الحركة متوقّفة لمن فعّل «تقليل الحركة» في جهازه.
 */
(function () {
  'use strict';
  var gamesRoot = document.querySelector('[data-abz-games]');
  if (!gamesRoot) return;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

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
  function btn(cls, text) {
    var b = el('button', cls, text);
    b.type = 'button';
    return b;
  }
  function show(node, on) {
    if (on) node.classList.remove('hidden'); else node.classList.add('hidden');
  }
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, String(value));
    } catch (err) { /* التخزين غير متاح — اللعبة تعمل بدونه */ }
    return null;
  }
  var pill = 'numeric rounded-full bg-sand-100 px-4 py-1.5 text-sm font-bold text-navy-900';
  var btnPrimary = 'min-h-[48px] rounded-xl bg-navy-900 px-6 font-bold text-white';
  var btnGold = 'min-h-[48px] rounded-xl bg-gold-500 px-6 font-bold text-navy-950';
  var btnOutline = 'min-h-[48px] rounded-xl border-2 border-navy-900 px-6 font-bold text-navy-900';
  var fbBase = 'mt-5 min-h-[2rem] font-bold ';
  function header(title, pillNode) {
    var h = el('div', 'flex flex-wrap items-center justify-between gap-3');
    h.appendChild(el('h2', 'text-2xl text-navy-900', title));
    h.appendChild(pillNode);
    return h;
  }

  /* ───────────── محتوى الألعاب الجديدة ───────────── */

  // صح أم خطأ — معلومات قانونية عامة
  var TF = [
    { s: 'العقد الصحيح يُلزم طرفيه، ولا يُعدَّل بإرادة أحدهما وحده.', ok: true, why: 'الأصل أن العقد شريعة المتعاقدين، فلا يتغيّر إلا باتفاقهما أو بنصّ القانون.' },
    { s: 'المتهم بريء حتى تثبت إدانته.', ok: true, why: 'قرينة البراءة مبدأ أساسي في المحاكمة العادلة في معظم الأنظمة.' },
    { s: 'الجهل بالقانون عذر يُعفي صاحبه من تطبيقه.', ok: false, why: 'الأصل أنه لا يُعذر أحد بجهله بالقانون بعد نشره.' },
    { s: 'توقيعك على عقد دون قراءته يعفيك من الالتزام به.', ok: false, why: 'التوقيع دليل على القبول، فاقرأ العقد جيداً قبل توقيعه.' },
    { s: 'كل عقد لا يصحّ إلا إذا كُتب على ورق.', ok: false, why: 'كثير من العقود تنعقد بالتراضي، والكتابة تفيد غالباً في الإثبات.' },
    { s: 'من يدّعي أمراً فعليه في الأصل أن يثبته.', ok: true, why: 'البيّنة على من ادّعى، وهذه قاعدة عامة في الإثبات.' },
    { s: 'الاتفاق الذي يخالف النظام العام يكون باطلاً.', ok: true, why: 'لا يملك الأطراف الاتفاق على ما يمسّ النظام العام أو الآداب العامة.' },
    { s: 'الشركة التي لها شخصية اعتبارية تملك ذمة مالية مستقلة في الأصل.', ok: true, why: 'الشخصية الاعتبارية تجعل الشركة كياناً قانونياً قائماً بذاته.' },
    { s: 'القاصر يستطيع إبرام أي عقد بنفسه دون وليّه أو وصيّه.', ok: false, why: 'القاصر محمي بقواعد الأهلية، وتصرفاته تخضع لإذن وليّه أو وصيّه.' },
    { s: 'يمكن للأطراف الاتفاق على التحكيم بدل القضاء في نزاع محدّد.', ok: true, why: 'التحكيم قائم على اتفاق الأطراف عليه ضمن ما يجيزه النظام.' },
    { s: 'الصلح ينهي النزاع بتنازل متبادل بين الطرفين.', ok: true, why: 'الصلح عقد يحسم الخلاف بتنازل كل طرف عن جزء من مطالبه.' },
    { s: 'الإنذار المكتوب قد يفيد في إثبات أنك طالبت بحقّك.', ok: true, why: 'التوثيق الكتابي يساعد في إثبات المطالبة وتاريخها.' },
    { s: 'مرور الزمن لا يؤثر إطلاقاً على إمكانية رفع الدعاوى.', ok: false, why: 'للقوانين مدد تقادم قد تمنع سماع الدعوى بعد مرور الوقت.' },
    { s: 'توقيعك على إيصال استلام يُعدّ دليلاً على أنك استلمت.', ok: true, why: 'الإيصال الموقّع دليل مكتوب يصعب إنكاره لاحقاً.' },
    { s: 'الوكيل يتصرف باسم موكّله وفي حدود ما أُذن له به.', ok: true, why: 'نطاق الوكالة يُحدَّده نصّها، ولا يتجاوزه الوكيل.' },
    { s: 'الوكيل يملك التصرف في كل أموال موكّله مهما كان نصّ الوكالة.', ok: false, why: 'سلطة الوكيل مقيّدة بما نصّت عليه الوكالة.' },
    { s: 'حق الدفاع يعني أن يسمع القاضي الطرفين قبل الحكم.', ok: true, why: 'تمكين كل خصم من عرض دفاعه أصل من أصول التقاضي.' },
    { s: 'من حقّ المتهم الاستعانة بمحامٍ.', ok: true, why: 'الاستعانة بمحامٍ ضمانة معترف بها في معظم الأنظمة.' },
    { s: 'الأمانة التي استلمتها من غيرك يجوز لك استعمالها دون إذنه.', ok: false, why: 'المؤتمن يحفظ الأمانة ولا يستعملها إلا بإذن صاحبها.' },
    { s: 'الإكراه على التوقيع يعيب رضا الموقّع ويتيح طلب إبطال العقد.', ok: true, why: 'الرضا الحر شرط أساسي لصحة العقد.' },
    { s: 'شاهد واحد يكفي دائماً لإثبات أي واقعة مهما كانت.', ok: false, why: 'تقدير الأدلة يرجع إلى القاضي وقواعد الإثبات المقرّرة.' },
    { s: 'الحكم النهائي يمنع في الأصل إعادة رفع الدعوى نفسها بين الخصوم أنفسهم.', ok: true, why: 'هذه حجية الأمر المقضي، وتحمي استقرار الأحكام.' },
    { s: 'التعويض يقوم عادةً على خطأ وضرر وعلاقة سببية بينهما.', ok: true, why: 'هذه عناصر المسؤولية التقصيرية في معظم الأنظمة المدنية.' },
    { s: 'من اشترى شيئاً من شخص لا يملكه صار مالكاً له دائماً دون استثناء.', ok: false, why: 'الأصل أن البائع لا ينقل أكثر مما يملك، فتحقّق من ملكية البائع.' },
    { s: 'الأحكام القضائية لا يجوز الطعن عليها أبداً.', ok: false, why: 'الأنظمة تتيح طرق طعن ضمن الشروط والمواعيد التي تحدّدها.' },
    { s: 'يحمي العقد المكتوب الطرفين لأنه يوثّق الشروط المتفق عليها.', ok: true, why: 'الكتابة تقلّل الخلاف حول ما اتُّفق عليه.' }
  ];

  // خمّن المصطلح — المصطلح + تلميح (تعريف مبسّط)
  var TERMS = [
    { w: 'عقد', h: 'اتفاق بين طرفين أو أكثر يُنشئ التزامات متبادلة.' },
    { w: 'وكالة', h: 'تفويض شخص لآخر بالتصرف نيابةً عنه فيما يحدّده.' },
    { w: 'تحكيم', h: 'حلّ النزاع أمام محكَّمين يختارهم الأطراف بدل القضاء.' },
    { w: 'ميراث', h: 'انتقال أموال المتوفى إلى ورثته وفق القواعد المقررة.' },
    { w: 'كفالة', h: 'التزام شخص بضمان وفاء التزام غيره إن عجز عنه.' },
    { w: 'رهن', h: 'حبس مال ضماناً لوفاء دين.' },
    { w: 'تقادم', h: 'مرور مدة يحدّدها القانون فيتأثر بها حق المطالبة.' },
    { w: 'استئناف', h: 'طعن في حكم أمام محكمة أعلى لإعادة النظر فيه.' },
    { w: 'صلح', h: 'اتفاق ينهي نزاعاً بتنازل متبادل بين الطرفين.' },
    { w: 'إيجار', h: 'تمكين شخص من الانتفاع بشيء مقابل أجرة.' },
    { w: 'تعويض', h: 'مقابل يجبر الضرر الذي لحق بالمتضرر.' },
    { w: 'بطلان', h: 'جزاء يلحق التصرف المخالف لشروطه فيزيل أثره.' },
    { w: 'حجز', h: 'وضع مال تحت يد القضاء منعاً من التصرف فيه.' },
    { w: 'وصية', h: 'تصرف في المال يُنفَّذ بعد وفاة صاحبه.' },
    { w: 'شركة', h: 'كيان يجمع شخصين أو أكثر لتحقيق نشاط وربح مشترك.' },
    { w: 'مدعي', h: 'الطرف الذي يرفع الدعوى ويطلب حقاً.' },
    { w: 'قاصر', h: 'شخص لم يبلغ سن الأهلية الكاملة بعد.' },
    { w: 'إنذار', h: 'إخطار رسمي مكتوب يُطالَب فيه بتنفيذ التزام.' },
    { w: 'حكم', h: 'القرار الفاصل في النزاع الصادر عن المحكمة.' },
    { w: 'فسخ', h: 'إنهاء العقد عادةً بسبب إخلال أحد طرفيه بالتزامه.' },
    { w: 'شاهد', h: 'من يدلي أمام الجهة المختصة بما علمه عن واقعة.' }
  ];

  // اكتشف البند الخطر — عقود تعليمية مبسّطة
  var CONTRACTS = [
    {
      title: 'عقد إيجار سكني', role: 'أنت المستأجر',
      clauses: [
        { t: 'تُحدَّد الأجرة وموعد سدادها بوضوح في العقد.', risky: false },
        { t: 'يحق للمؤجر زيادة الأجرة في أي وقت وبالمقدار الذي يراه دون موافقة المستأجر.', risky: true, why: 'تعديل الأجرة من طرف واحد وبلا ضابط يخلّ بتوازن العقد.' },
        { t: 'يُسلَّم السكن للمستأجر بحالته الموصوفة في محضر استلام موقّع من الطرفين.', risky: false },
        { t: 'يتحمّل المستأجر وحده كل إصلاح، حتى ما يخصّ الهيكل الأساسي للعقار.', risky: true, why: 'الإصلاحات الجوهرية تقع عادةً على المالك لا على المستأجر.' },
        { t: 'للمؤجر إنهاء العقد فوراً ودون إخطار، حتى لو التزم المستأجر بكل شروطه.', risky: true, why: 'الإنهاء المفاجئ بلا سبب يهدّد استقرار السكن.' },
        { t: 'يُردّ مبلغ التأمين للمستأجر عند التسليم إذا خلا السكن من أضرار غير الاستعمال المعتاد.', risky: false },
        { t: 'يُخطر كل طرف الآخر كتابةً قبل مدة معقولة إن رغب في عدم التجديد.', risky: false },
        { t: 'يتنازل المستأجر مسبقاً عن حقه في الاعتراض على أي أمر يتعلق بهذا العقد.', risky: true, why: 'التنازل المسبق عن الحقوق بصيغة مطلقة بند مجحف وقد لا يُعتدّ به.' }
      ]
    },
    {
      title: 'عقد خدمات تصميم', role: 'أنت مقدّم الخدمة',
      clauses: [
        { t: 'يُحدَّد نطاق العمل والمخرجات المطلوبة في ملحق مكتوب.', risky: false },
        { t: 'للطرف الأول تعديل نطاق العمل متى شاء دون زيادة في الأجر أو المدة.', risky: true, why: 'توسيع العمل دون مقابل يجعل الالتزام مفتوحاً وغير محدّد.' },
        { t: 'تُدفع الأجرة على دفعات مرتبطة بتسليم مراحل محدّدة.', risky: false },
        { t: 'لا تستحق الأجرة إلا إذا رضي الطرف الأول عن العمل بتقديره المنفرد، دون معايير واضحة.', risky: true, why: 'ربط الأجر برضا شخصي غير منضبط يتيح التهرّب من الدفع.' },
        { t: 'تنتقل حقوق الملكية الفكرية للعمل إلى الطرف الأول بعد سداد كامل الأجرة.', risky: false },
        { t: 'يتحمّل مقدّم الخدمة أي خسارة غير محدودة تلحق بالطرف الأول لأي سبب كان.', risky: true, why: 'المسؤولية غير المحدودة وغير المرتبطة بخطئك بند خطر.' },
        { t: 'يلتزم الطرفان بسرية المعلومات المتبادلة طوال مدة العقد وبعدها بمدة معقولة.', risky: false },
        { t: 'يحق للطرف الأول إنهاء العقد بإخطار مكتوب مع سداد أجر ما أُنجز فعلاً.', risky: false }
      ]
    },
    {
      title: 'عقد توريد بضائع', role: 'أنت المشتري',
      clauses: [
        { t: 'تُحدَّد مواصفات البضاعة وكمياتها في جدول مرفق بالعقد.', risky: false },
        { t: 'يحق للمورّد تسليم البضاعة في أي وقت يناسبه دون التزام بموعد.', risky: true, why: 'غياب موعد ملزم للتسليم يعطّل خطتك ولا يمنحك حقاً عند التأخير.' },
        { t: 'يفحص المشتري البضاعة عند الاستلام ويُثبت ملاحظاته كتابةً.', risky: false },
        { t: 'يُعدّ المشتري قابلاً للبضاعة بمجرد وصولها، ويسقط حقه في الاعتراض على أي عيب لاحقاً حتى الخفي.', risky: true, why: 'إسقاط الحق في الاعتراض على العيوب الخفية يضرّ بالمشتري.' },
        { t: 'يُسدَّد الثمن وفق جدول متفق عليه مرتبط بالتسليم.', risky: false },
        { t: 'للمورّد رفع الأسعار بعد توقيع العقد بحسب تقديره حتى على الطلبات المؤكدة.', risky: true, why: 'تعديل الثمن من طرف واحد بعد الاتفاق يهدم أساس التعاقد.' },
        { t: 'يضمن المورّد خلو البضاعة من العيوب وفق ما يقرّره القانون.', risky: false },
        { t: 'يُحال أي نزاع إلى جهة يختارها المورّد وحده عند نشوء النزاع.', risky: true, why: 'انفراد أحد الطرفين باختيار جهة الفصل يخلّ بالحياد.' }
      ]
    },
    {
      title: 'عقد عمل', role: 'أنت الموظف',
      clauses: [
        { t: 'يُحدَّد المسمّى الوظيفي والمهام الأساسية في العقد.', risky: false },
        { t: 'للشركة نقلك إلى أي وظيفة أو مدينة أو تخفيض أجرك دون موافقتك.', risky: true, why: 'تغيير جوهر عقد العمل عادةً يحتاج إلى اتفاق الطرفين.' },
        { t: 'تُصرف الأجرة في موعد دوري محدّد.', risky: false },
        { t: 'يُحظر عليك العمل في أي مجال وفي أي مكان بعد انتهاء العقد، دون حدّ زمني.', risky: true, why: 'قيود المنافسة تُقبل غالباً إذا كانت محدّدة المدة والنطاق، لا مطلقة.' },
        { t: 'يُخطر كل طرف الآخر كتابةً قبل إنهاء العقد وفق ما يقرّره النظام.', risky: false },
        { t: 'يُعدّ توقيعك تنازلاً مسبقاً عن كل حقوقك النظامية الناشئة عن العمل.', risky: true, why: 'الحقوق التي يقرّرها النظام للعامل لا يصحّ التنازل عنها مقدّماً.' },
        { t: 'يحافظ الموظف على سرية بيانات الشركة التجارية.', risky: false }
      ]
    }
  ];

  // رتّب الخطوات — خطوات مبسّطة وعامة (بالترتيب الصحيح)
  var PROCESSES = [
    { title: 'مراحل رفع دعوى مدنية (مبسّطة)', steps: [
      'تحديد الحق المطلوب والخصم المدّعى عليه',
      'جمع المستندات والأدلة',
      'كتابة صحيفة الدعوى وتقديمها للمحكمة المختصة',
      'إعلان المدّعى عليه بالدعوى',
      'تبادل المذكرات وسماع الطرفين',
      'صدور الحكم',
      'تنفيذ الحكم'
    ] },
    { title: 'تأسيس شركة (مبسّط)', steps: [
      'تحديد نوع الشركة ونشاطها',
      'الاتفاق بين الشركاء على الحصص والإدارة',
      'صياغة عقد التأسيس وتوقيعه',
      'القيد والتوثيق لدى الجهة المختصة واستخراج التراخيص',
      'بدء النشاط'
    ] },
    { title: 'إجراءات التحكيم (مبسّطة)', steps: [
      'وجود اتفاق تحكيم بين الطرفين',
      'إخطار الطرف الآخر وتقديم طلب التحكيم',
      'تشكيل هيئة التحكيم',
      'تبادل المذكرات وتقديم الأدلة',
      'جلسات الاستماع',
      'صدور حكم التحكيم'
    ] },
    { title: 'إبرام عقد مدروس', steps: [
      'تحديد الاحتياجات والأهداف',
      'التفاوض على الشروط',
      'صياغة العقد كتابةً',
      'مراجعة العقد مراجعة قانونية',
      'التوقيع',
      'تنفيذ الالتزامات ومتابعتها'
    ] },
    { title: 'المطالبة الودية بحق (مبسّطة)', steps: [
      'تحديد المطلوب بدقة',
      'توثيق الأدلة والمستندات',
      'توجيه إخطار مكتوب للطرف الآخر',
      'التفاوض أو الوساطة',
      'توقيع اتفاق صلح مكتوب'
    ] }
  ];

  /* ───────────── التهيئة ───────────── */

  var dataTag = document.getElementById('abz-games-data');
  var data = null;
  if (dataTag) { try { data = JSON.parse(dataTag.textContent); } catch (err) { data = null; } }
  initGames(gamesRoot, data || {});

  function initGames(root, data) {
    var q = function (sel) { return root.querySelector(sel); };
    var leaveHooks = {};

    // التبويبات
    root.querySelectorAll('[data-game-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-game-tab');
        root.querySelectorAll('[data-game-tab]').forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        root.querySelectorAll('[data-game]').forEach(function (g) { g.hidden = g.getAttribute('data-game') !== key; });
        Object.keys(leaveHooks).forEach(function (k) { if (k !== key) leaveHooks[k](); });
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

    /* ───── 4) صح أم خطأ؟ — جولة سريعة ───── */
    (function () {
      var host = q('[data-game="truefalse"]');
      if (!host) return;
      var DURATION = 60, KEY = 'abz_tf_best';
      var st = { list: [], i: 0, score: 0, left: DURATION, timer: null, answered: false, over: false };

      var scoreEl = el('span', null, '0'), timeEl = el('span', null, String(DURATION)), bestEl = el('span', null, '0');
      var stats = el('p', pill);
      stats.appendChild(document.createTextNode('الوقت: ')); stats.appendChild(timeEl);
      stats.appendChild(document.createTextNode(' · النقاط: ')); stats.appendChild(scoreEl);
      stats.appendChild(document.createTextNode(' · الأفضل: ')); stats.appendChild(bestEl);
      host.appendChild(header('صح أم خطأ؟', stats));

      var intro = el('div', 'mt-4');
      intro.appendChild(el('p', 'leading-8 text-slate-600', 'جولة سريعة مدّتها ٦٠ ثانية: تظهر عبارة قانونية، وتحكم عليها بـ«صح» أو «خطأ». كم عبارة تُصيب قبل انتهاء الوقت؟'));
      var startBtn = btn(btnGold + ' mt-5', 'ابدأ الجولة');
      intro.appendChild(startBtn);
      host.appendChild(intro);

      var play = el('div', 'mt-6 hidden');
      var stmt = el('p', 'min-h-[5rem] rounded-2xl bg-forest-50 p-5 text-xl leading-10 text-forest-900');
      var row = el('div', 'mt-5 grid grid-cols-2 gap-3');
      var tfBtn = 'min-h-[64px] rounded-2xl border-2 px-5 text-xl font-black transition-colors ';
      var tfIdle = tfBtn + 'border-navy-900 bg-white text-navy-900 enabled:hover:bg-gold-50';
      var tfOk = tfBtn + 'border-forest-600 bg-forest-50 text-forest-900';
      var tfBad = tfBtn + 'border-red-600 bg-red-50 text-red-800';
      var tfDim = tfBtn + 'border-sand-200 bg-white text-slate-500';
      var yes = btn(tfIdle, 'صح');
      var no = btn(tfIdle, 'خطأ');
      row.appendChild(yes); row.appendChild(no);
      var fb = el('p', fbBase); fb.setAttribute('aria-live', 'polite');
      var why = el('p', 'min-h-[1.5rem] leading-8 text-slate-600');
      var actions = el('div', 'mt-4 flex flex-wrap gap-3');
      var nextBtn = btn(btnPrimary + ' hidden', 'العبارة التالية');
      var againBtn = btn(btnGold + ' hidden', 'العب مرة أخرى');
      actions.appendChild(nextBtn); actions.appendChild(againBtn);
      [stmt, row, fb, why, actions].forEach(function (n) { play.appendChild(n); });
      host.appendChild(play);

      function best() { var v = parseInt(store(KEY), 10); return isNaN(v) ? 0 : v; }
      bestEl.textContent = best();

      function stopTimer() { if (st.timer) { clearInterval(st.timer); st.timer = null; } }
      function showItem() {
        var item = st.list[st.i];
        stmt.textContent = item.s;
        fb.textContent = ''; why.textContent = '';
        yes.disabled = false; no.disabled = false;
        yes.className = tfIdle; no.className = tfIdle;
        show(nextBtn, false);
        st.answered = false;
      }
      function finish(reason) {
        stopTimer();
        st.over = true;
        yes.disabled = true; no.disabled = true;
        show(nextBtn, false); show(againBtn, true);
        var isBest = st.score > best();
        if (isBest) { store(KEY, st.score); bestEl.textContent = st.score; }
        var prev = st.answered && fb.textContent ? fb.textContent + ' — ' : '';
        fb.className = fbBase + 'text-navy-900';
        fb.textContent = prev + reason + ' نقاطك: ' + st.score + (isBest && st.score > 0 ? ' — رقم قياسي جديد!' : '.');
      }
      function answer(val) {
        if (st.over || st.answered) return;
        st.answered = true;
        var item = st.list[st.i];
        var okAns = val === item.ok;
        var chosen = val ? yes : no, other = val ? no : yes;
        yes.disabled = true; no.disabled = true;
        chosen.className = okAns ? tfOk : tfBad;
        other.className = okAns ? tfDim : tfOk;
        if (okAns) {
          st.score++;
          scoreEl.textContent = st.score;
          fb.className = fbBase + 'text-forest-600';
          fb.textContent = 'إجابة صحيحة ✓';
        } else {
          fb.className = fbBase + 'text-red-700';
          fb.textContent = 'ليست هذه — العبارة ' + (item.ok ? 'صحيحة' : 'خاطئة') + '.';
        }
        why.textContent = item.why;
        if (st.i < st.list.length - 1) show(nextBtn, true);
        else finish('أنهيت كل العبارات!');
      }
      function tick() {
        st.left--;
        timeEl.textContent = st.left;
        if (st.left <= 0) finish('انتهى الوقت!');
      }
      function start() {
        stopTimer();
        st.list = shuffle(TF); st.i = 0; st.score = 0; st.left = DURATION; st.over = false;
        scoreEl.textContent = '0'; timeEl.textContent = DURATION; bestEl.textContent = best();
        show(intro, false); show(play, true); show(againBtn, false);
        showItem();
        st.timer = setInterval(tick, 1000);
      }
      yes.addEventListener('click', function () { answer(true); });
      no.addEventListener('click', function () { answer(false); });
      nextBtn.addEventListener('click', function () { if (st.over) return; st.i++; showItem(); });
      startBtn.addEventListener('click', start);
      againBtn.addEventListener('click', start);
      leaveHooks.truefalse = function () {
        if (!st.timer) return;
        stopTimer();
        st.over = true;
        show(play, false); show(intro, true);
        timeEl.textContent = DURATION;
      };
    })();

    /* ───── 5) خمّن المصطلح — ميزان العدالة ───── */
    (function () {
      var host = q('[data-game="guess"]');
      if (!host) return;
      var MAX = 6;
      var LETTERS = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ى أ إ آ ء ئ ؤ'.split(' ');
      function norm(c) {
        if (c === 'أ' || c === 'إ' || c === 'آ') return 'ا';
        if (c === 'ة') return 'ه';
        if (c === 'ى') return 'ي';
        return c;
      }
      var g = { order: [], n: -1, word: '', chars: [], shown: [], used: {}, wrong: 0, over: false, wins: 0 };

      var winsEl = el('span', null, '0');
      var stats = el('p', pill);
      stats.appendChild(document.createTextNode('مصطلحات حللتها: ')); stats.appendChild(winsEl);
      host.appendChild(header('خمّن المصطلح', stats));
      host.appendChild(el('p', 'mt-4 leading-8 text-slate-600', 'خمّن حروف المصطلح من التعريف. كل حرف خاطئ يُميل كفّة الميزان، وبعد ستة أخطاء تخسر الجولة.'));

      var hint = el('p', 'mt-5 rounded-2xl bg-forest-50 p-5 text-lg leading-9 text-forest-900');
      host.appendChild(hint);

      var scaleBox = el('div', 'mt-6 flex flex-col items-center gap-3');
      var scale = el('span', 'select-none text-7xl leading-none' + (reduce ? '' : ' transition-transform duration-500'), '⚖');
      scale.setAttribute('aria-hidden', 'true');
      scale.style.display = 'inline-block';
      var pips = el('div', 'flex gap-2');
      pips.setAttribute('aria-hidden', 'true');
      var pipEls = [];
      for (var p = 0; p < MAX; p++) { var pe = el('span', 'h-3 w-3 rounded-full bg-sand-200'); pipEls.push(pe); pips.appendChild(pe); }
      scaleBox.appendChild(scale); scaleBox.appendChild(pips);
      host.appendChild(scaleBox);

      var slots = el('div', 'mt-6 flex flex-wrap justify-center gap-2');
      slots.setAttribute('aria-label', 'المصطلح');
      host.appendChild(slots);

      var fb = el('p', 'mt-5 min-h-[2rem] text-center font-bold text-navy-900');
      fb.setAttribute('aria-live', 'polite');
      host.appendChild(fb);

      var kb = el('div', 'mt-4 flex flex-wrap justify-center gap-1.5');
      kb.setAttribute('aria-label', 'لوحة الحروف');
      var keyEls = [];
      LETTERS.forEach(function (ch) {
        var k = btn('min-h-[44px] min-w-[44px] rounded-xl bg-navy-900 px-2 text-lg font-black text-gold-300 transition-colors hover:bg-navy-800 disabled:opacity-25', ch);
        k.addEventListener('click', function () { guess(ch, k); });
        keyEls.push({ ch: ch, el: k });
        kb.appendChild(k);
      });
      host.appendChild(kb);

      var more = el('div', 'mt-5 text-center');
      var nextBtn = btn(btnPrimary, 'مصطلح آخر');
      more.appendChild(nextBtn);
      host.appendChild(more);

      function render() {
        slots.textContent = '';
        g.chars.forEach(function (ch, i) {
          var cls = 'inline-flex h-12 w-10 items-center justify-center border-b-4 text-2xl font-black ';
          var text = '';
          if (g.shown[i]) { cls += 'border-forest-600 text-navy-900'; text = ch; }
          else if (g.over && g.wrong >= MAX) { cls += 'border-red-600 text-red-700'; text = ch; }
          else { cls += 'border-navy-900 text-navy-900'; }
          slots.appendChild(el('span', cls, text));
        });
        scale.style.transform = 'rotate(' + (g.wrong * 9) + 'deg)';
        pipEls.forEach(function (pe, i) { pe.className = 'h-3 w-3 rounded-full ' + (i < g.wrong ? 'bg-red-600' : 'bg-sand-200'); });
      }
      function begin() {
        if (!g.order.length || g.n >= g.order.length - 1) { g.order = shuffle(TERMS); g.n = -1; }
        g.n++;
        var t = g.order[g.n];
        g.word = t.w; g.chars = Array.from(t.w);
        g.shown = g.chars.map(function () { return false; });
        g.used = {}; g.wrong = 0; g.over = false;
        hint.textContent = 'التلميح: ' + t.h;
        fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-navy-900';
        fb.textContent = 'عدد الحروف: ' + g.chars.length + ' — الأخطاء المسموحة: ' + MAX;
        keyEls.forEach(function (k) { k.el.disabled = false; });
        render();
      }
      function endGame(won) {
        g.over = true;
        keyEls.forEach(function (k) { k.el.disabled = true; });
        if (won) {
          g.wins++; winsEl.textContent = g.wins;
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-forest-600';
          fb.textContent = 'أحسنت! المصطلح: «' + g.word + '»';
        } else {
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-red-700';
          fb.textContent = 'مالت الكفّة! المصطلح هو: «' + g.word + '»';
        }
        render();
      }
      function guess(ch) {
        if (g.over) return;
        var n = norm(ch);
        if (g.used[n]) return;
        g.used[n] = true;
        keyEls.forEach(function (k) { if (norm(k.ch) === n) k.el.disabled = true; });
        var hit = false;
        g.chars.forEach(function (c, i) { if (norm(c) === n) { g.shown[i] = true; hit = true; } });
        if (hit) {
          var done = g.shown.every(function (s) { return s; });
          if (done) { endGame(true); return; }
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-forest-600';
          fb.textContent = 'حرف صحيح ✓ — الأخطاء المتبقية: ' + (MAX - g.wrong);
        } else {
          g.wrong++;
          if (g.wrong >= MAX) { endGame(false); return; }
          fb.className = 'mt-5 min-h-[2rem] text-center font-bold text-red-700';
          fb.textContent = 'ليس في المصطلح — الأخطاء المتبقية: ' + (MAX - g.wrong);
        }
        render();
      }
      nextBtn.addEventListener('click', begin);
      begin();
    })();

    /* ───── 6) اكتشف البند الخطر ───── */
    (function () {
      var host = q('[data-game="clauses"]');
      if (!host) return;
      var c = { order: shuffle(CONTRACTS), n: -1, picked: [], checked: false, score: 0 };

      var scoreEl = el('span', null, '0');
      var stats = el('p', pill);
      stats.appendChild(document.createTextNode('النقاط: ')); stats.appendChild(scoreEl);
      host.appendChild(header('اكتشف البند الخطر', stats));
      host.appendChild(el('p', 'mt-4 leading-8 text-slate-600', 'اقرأ بنود العقد المبسّط، واضغط البنود التي ترى أنها خطرة عليك، ثم اضغط «تحقّق».'));

      var title = el('p', 'mt-6 flex flex-wrap items-center gap-2 text-lg font-black text-navy-900');
      var titleText = el('span'); var roleTag = el('span', 'rounded-full bg-gold-50 px-3 py-1 text-sm font-bold text-navy-900');
      title.appendChild(titleText); title.appendChild(roleTag);
      host.appendChild(title);

      var list = el('ol', 'mt-4 grid gap-3');
      host.appendChild(list);
      var fb = el('p', fbBase + 'text-navy-900'); fb.setAttribute('aria-live', 'polite');
      host.appendChild(fb);
      var actions = el('div', 'mt-2 flex flex-wrap gap-3');
      var checkBtn = btn(btnPrimary, 'تحقّق');
      var nextBtn = btn(btnOutline, 'عقد آخر');
      actions.appendChild(checkBtn); actions.appendChild(nextBtn);
      host.appendChild(actions);

      var cardBase = 'flex min-h-[48px] w-full items-start gap-3 rounded-2xl border-2 p-4 text-start leading-8 transition-colors ';
      function cardCls(state) {
        if (state === 'picked') return cardBase + 'border-gold-500 bg-gold-50 text-navy-900';
        return cardBase + 'border-sand-200 bg-white text-navy-900 hover:border-gold-500';
      }
      function begin() {
        c.n = (c.n + 1) % c.order.length;
        c.picked = []; c.checked = false;
        var k = c.order[c.n];
        titleText.textContent = k.title;
        roleTag.textContent = k.role;
        fb.className = fbBase + 'text-navy-900';
        fb.textContent = '';
        checkBtn.disabled = false;
        list.textContent = '';
        k.clauses.forEach(function (cl, i) {
          c.picked.push(false);
          var li = el('li');
          var b = btn(cardCls('idle'));
          b.setAttribute('aria-pressed', 'false');
          b.appendChild(el('span', 'numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-black text-white', String(i + 1)));
          b.appendChild(el('span', 'flex-1', cl.t));
          var note = el('p', 'mt-2 hidden rounded-xl px-4 py-2 text-sm font-bold leading-7');
          b.addEventListener('click', function () {
            if (c.checked) return;
            c.picked[i] = !c.picked[i];
            b.setAttribute('aria-pressed', c.picked[i] ? 'true' : 'false');
            b.className = cardCls(c.picked[i] ? 'picked' : 'idle');
          });
          li._b = b; li._note = note;
          li.appendChild(b); li.appendChild(note);
          list.appendChild(li);
        });
      }
      function check() {
        if (c.checked) return;
        c.checked = true;
        checkBtn.disabled = true;
        var k = c.order[c.n];
        var hits = 0, total = 0, wrong = 0, missed = 0;
        k.clauses.forEach(function (cl, i) {
          var li = list.children[i];
          var picked = c.picked[i];
          li._b.disabled = true;
          if (cl.risky) {
            total++;
            li._note.classList.remove('hidden');
            li._note.textContent = cl.why;
            if (picked) {
              hits++;
              li._b.className = cardBase + 'border-red-600 bg-red-50 text-red-800';
              li._note.className = 'mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold leading-7 text-red-800';
              li._note.textContent = 'بند خطر ✓ ' + cl.why;
            } else {
              missed++;
              li._b.className = cardBase + 'border-dashed border-red-600 bg-white text-navy-900';
              li._note.className = 'mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold leading-7 text-red-800';
              li._note.textContent = 'فاتك هذا البند الخطر: ' + cl.why;
            }
          } else if (picked) {
            wrong++;
            li._b.className = cardBase + 'border-slate-500 bg-sand-100 text-navy-900';
            li._note.classList.remove('hidden');
            li._note.className = 'mt-2 rounded-xl bg-sand-100 px-4 py-2 text-sm font-bold leading-7 text-slate-700';
            li._note.textContent = 'هذا البند معتاد ولا يشكّل خطراً بذاته.';
          } else {
            li._b.className = cardBase + 'border-forest-600 bg-forest-50 text-forest-900';
          }
        });
        var pts = Math.max(0, hits - wrong);
        c.score += pts;
        scoreEl.textContent = c.score;
        fb.className = fbBase + (hits === total && wrong === 0 ? 'text-forest-600' : 'text-navy-900');
        fb.textContent = 'اكتشفت ' + hits + ' من ' + total + ' بنود خطرة' +
          (wrong ? '، وعلّمت ' + wrong + (wrong === 1 ? ' بنداً معتاداً' : ' بنوداً معتادة') : '') +
          (missed ? '، وفاتك ' + missed : '') + '. أضفت ' + pts + ' إلى نقاطك.';
      }
      checkBtn.addEventListener('click', check);
      nextBtn.addEventListener('click', begin);
      begin();
    })();

    /* ───── 7) رتّب الخطوات ───── */
    (function () {
      var host = q('[data-game="order"]');
      if (!host) return;
      var o = { order: shuffle(PROCESSES), n: -1, items: [], checked: false, done: 0, counted: false };

      var doneEl = el('span', null, '0');
      var stats = el('p', pill);
      stats.appendChild(document.createTextNode('عمليات أتممتها: ')); stats.appendChild(doneEl);
      host.appendChild(header('رتّب الخطوات', stats));
      host.appendChild(el('p', 'mt-4 leading-8 text-slate-600', 'خطوات مبسّطة وعامة قد تختلف تفاصيلها من نظام إلى آخر. رتّبها بأزرار ▲ ▼ (أو اسحبها على الحاسوب)، ثم اضغط «تحقّق».'));
      var title = el('p', 'mt-6 text-lg font-black text-navy-900');
      host.appendChild(title);

      var list = el('ol', 'mt-4 grid gap-3');
      host.appendChild(list);
      var fb = el('p', fbBase + 'text-navy-900'); fb.setAttribute('aria-live', 'polite');
      host.appendChild(fb);
      var actions = el('div', 'mt-2 flex flex-wrap gap-3');
      var checkBtn = btn(btnPrimary, 'تحقّق');
      var showBtn = btn(btnOutline + ' hidden', 'اعرض الترتيب الصحيح');
      var nextBtn = btn(btnOutline, 'عملية أخرى');
      actions.appendChild(checkBtn); actions.appendChild(showBtn); actions.appendChild(nextBtn);
      host.appendChild(actions);

      var rowBase = 'rounded-2xl border-2 p-3 ';
      var arrow = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-lg font-black text-gold-300 hover:bg-navy-800 disabled:opacity-25';
      var dragFrom = -1;

      function render(focus) {
        list.textContent = '';
        o.items.forEach(function (it, i) {
          var state = it.state || 'idle';
          var cls = rowBase + (state === 'ok' ? 'border-forest-600 bg-forest-50' : state === 'bad' ? 'border-red-600 bg-red-50' : 'border-sand-200 bg-white');
          var li = el('li', cls);
          var top = el('div', 'flex items-start gap-3');
          top.appendChild(el('span', 'numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-black text-white', String(i + 1)));
          top.appendChild(el('span', 'min-w-0 flex-1 leading-8 text-navy-900', it.text));
          li.appendChild(top);
          var bar = el('div', 'mt-2 flex items-center justify-end gap-2');
          bar.appendChild(el('span', 'me-auto text-sm font-black ' + (state === 'ok' ? 'text-forest-600' : 'text-red-700'), state === 'ok' ? '✓ صحيح' : state === 'bad' ? '✗ ليس هنا' : ''));
          var up = btn(arrow, '▲'); var down = btn(arrow, '▼');
          up.setAttribute('aria-label', 'نقل الخطوة «' + it.text + '» إلى أعلى');
          down.setAttribute('aria-label', 'نقل الخطوة «' + it.text + '» إلى أسفل');
          up.disabled = i === 0 || o.locked; down.disabled = i === o.items.length - 1 || o.locked;
          up.addEventListener('click', function () { move(i, i - 1, 'up'); });
          down.addEventListener('click', function () { move(i, i + 1, 'down'); });
          bar.appendChild(up); bar.appendChild(down);
          li.appendChild(bar);
          if (!o.locked) {
            li.draggable = true;
            li.addEventListener('dragstart', function (e) { dragFrom = i; try { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* بعض المتصفحات */ } });
            li.addEventListener('dragover', function (e) { e.preventDefault(); });
            li.addEventListener('drop', function (e) { e.preventDefault(); if (dragFrom > -1 && dragFrom !== i) move(dragFrom, i); dragFrom = -1; });
          }
          list.appendChild(li);
          if (focus && focus.idx === i) {
            var target = focus.dir === 'up' ? (up.disabled ? down : up) : (down.disabled ? up : down);
            if (!target.disabled) target.focus();
          }
        });
      }
      function move(from, to, dir) {
        if (o.locked || to < 0 || to >= o.items.length) return;
        var it = o.items.splice(from, 1)[0];
        o.items.splice(to, 0, it);
        o.items.forEach(function (x) { x.state = 'idle'; });
        o.checked = false;
        fb.className = fbBase + 'text-navy-900';
        fb.textContent = 'انتقلت الخطوة إلى الموضع ' + (to + 1) + ' من ' + o.items.length + '.';
        render(dir ? { idx: to, dir: dir } : null);
      }
      function begin() {
        o.n = (o.n + 1) % o.order.length;
        var proc = o.order[o.n];
        var items = proc.steps.map(function (text, idx) { return { text: text, pos: idx, state: 'idle' }; });
        var mixed = shuffle(items);
        var same = mixed.every(function (x, i) { return x.pos === i; });
        if (same && mixed.length > 1) mixed.reverse();
        o.items = mixed; o.checked = false; o.locked = false; o.counted = false;
        title.textContent = proc.title;
        fb.className = fbBase + 'text-navy-900';
        fb.textContent = '';
        checkBtn.disabled = false;
        show(showBtn, false);
        render();
      }
      function check() {
        var right = 0;
        o.items.forEach(function (x, i) { x.state = x.pos === i ? 'ok' : 'bad'; if (x.pos === i) right++; });
        o.checked = true;
        var all = right === o.items.length;
        if (all) {
          o.locked = true; checkBtn.disabled = true; show(showBtn, false);
          if (!o.counted) { o.counted = true; o.done++; doneEl.textContent = o.done; }
          fb.className = fbBase + 'text-forest-600';
          fb.textContent = 'أحسنت! الترتيب كله صحيح ✓';
        } else {
          show(showBtn, true);
          fb.className = fbBase + 'text-red-700';
          fb.textContent = right + ' من ' + o.items.length + ' في موضعها الصحيح. عدّل الترتيب وجرّب مجدّداً.';
        }
        render();
      }
      function reveal() {
        o.items.sort(function (a, b) { return a.pos - b.pos; });
        o.items.forEach(function (x) { x.state = 'ok'; });
        o.locked = true; checkBtn.disabled = true; show(showBtn, false);
        fb.className = fbBase + 'text-navy-900';
        fb.textContent = 'هذا هو الترتيب الصحيح. جرّب عملية أخرى!';
        render();
      }
      checkBtn.addEventListener('click', check);
      showBtn.addEventListener('click', reveal);
      nextBtn.addEventListener('click', begin);
      begin();
    })();
  }
})();
