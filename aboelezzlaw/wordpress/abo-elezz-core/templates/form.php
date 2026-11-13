<?php
/**
 * نموذج موحّد للتواصل والحجز وتسجيل الاهتمام وطلب عرض السعر.
 * المتغيّرات من الشورت كود: $type, $topic, $sent, $errors, $old, $atts
 */
if (!defined('ABSPATH')) {
    exit;
}
$val = fn(string $key) => esc_attr((string) ($old[$key] ?? ''));
$err = function (string $key) use ($errors) {
    if (!empty($errors[$key])) {
        printf('<p class="mt-1.5 text-sm font-semibold text-red-700" id="err-%1$s">%2$s</p>', esc_attr($key), esc_html($errors[$key]));
    }
};
$described = fn(string $key) => !empty($errors[$key]) ? ' aria-invalid="true" aria-describedby="err-' . esc_attr($key) . '"' : '';
$input = 'block w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30';
$label = 'mb-1.5 block text-sm font-bold text-navy-900';
$buttons = [
    'contact' => 'أرسل الرسالة',
    'booking' => 'أرسل طلب الحجز',
    'interest' => 'سجّل اهتمامي',
    'quote' => 'اطلب عرض السعر',
];
$general = '';
if (($_GET['abz_err'] ?? '') === 'rate') {
    $general = 'أرسلت طلبات كثيرة خلال وقت قصير. حاول بعد ساعة، أو راسلنا مباشرة على واتساب.';
} elseif (($_GET['abz_err'] ?? '') === 'expired') {
    $general = 'انتهت صلاحية النموذج. حدّث الصفحة وأعد الإرسال.';
}
?>
<div id="abz-form" class="scroll-mt-28">
<?php if ($sent) : ?>
  <div class="rounded-2xl border border-forest-100 bg-forest-50 p-6 text-forest-900" role="status">
    <p class="text-lg font-extrabold">وصل طلبك، شكراً لك.</p>
    <p class="mt-2 leading-8">نراجعه ونردّ عليك خلال يوم عمل على بريدك أو هاتفك. إرسال الطلب لا يعني بدء الخدمة أو قبول التكليف قبل الاتفاق على النطاق والأتعاب كتابةً.</p>
    <a class="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-whatsapp-600 px-5 font-bold text-white hover:bg-whatsapp-700" href="<?php echo esc_url(abz_wa_link('السلام عليكم، أرسلت طلباً عبر الموقع وأودّ المتابعة.')); ?>" target="_blank" rel="noopener">تابع معنا على واتساب</a>
  </div>
<?php else : ?>
  <?php if ($general) : ?>
    <p class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert"><?php echo esc_html($general); ?></p>
  <?php elseif ($errors) : ?>
    <p class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">راجع الحقول المشار إليها ثم أعد الإرسال.</p>
  <?php endif; ?>
  <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="grid gap-5 sm:grid-cols-2" novalidate>
    <input type="hidden" name="action" value="abz_form">
    <input type="hidden" name="abz_type" value="<?php echo esc_attr($type); ?>">
    <input type="hidden" name="abz_t" value="<?php echo esc_attr((string) time()); ?>">
    <?php wp_nonce_field('abz_form_' . $type, '_abz_nonce'); ?>
    <div class="hidden" aria-hidden="true"><label>الموقع<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

    <div>
      <label class="<?php echo $label; ?>" for="abz-name">الاسم الكامل</label>
      <input class="<?php echo $input; ?>" id="abz-name" name="name" autocomplete="name" required value="<?php echo $val('name'); ?>"<?php echo $described('name'); ?>>
      <?php $err('name'); ?>
    </div>
    <div>
      <label class="<?php echo $label; ?>" for="abz-phone">رقم الهاتف / واتساب</label>
      <input class="<?php echo $input; ?>" id="abz-phone" name="phone" type="tel" dir="ltr" autocomplete="tel" required value="<?php echo $val('phone'); ?>"<?php echo $described('phone'); ?>>
      <?php $err('phone'); ?>
    </div>
    <div class="sm:col-span-2">
      <label class="<?php echo $label; ?>" for="abz-email">البريد الإلكتروني</label>
      <input class="<?php echo $input; ?>" id="abz-email" name="email" type="email" dir="ltr" autocomplete="email" required value="<?php echo $val('email'); ?>"<?php echo $described('email'); ?>>
      <?php $err('email'); ?>
    </div>

    <?php if ($type === 'contact') : ?>
      <div class="sm:col-span-2">
        <label class="<?php echo $label; ?>" for="abz-subject">موضوع الرسالة</label>
        <input class="<?php echo $input; ?>" id="abz-subject" name="subject" required value="<?php echo $val('subject') ?: esc_attr($topic); ?>"<?php echo $described('subject'); ?>>
        <?php $err('subject'); ?>
      </div>
    <?php else : ?>
      <input type="hidden" name="topic" value="<?php echo esc_attr($topic ?: ($old['topic'] ?? '')); ?>">
      <?php if ($topic) : ?>
        <p class="sm:col-span-2 rounded-xl bg-sand-100 px-4 py-3 text-sm font-semibold text-navy-900">بخصوص: <?php echo esc_html($topic); ?></p>
      <?php endif; ?>
    <?php endif; ?>

    <?php if ($type === 'booking') : ?>
      <div>
        <label class="<?php echo $label; ?>" for="abz-ctype">نوع الاستشارة</label>
        <select class="<?php echo $input; ?>" id="abz-ctype" name="consultation_type" required<?php echo $described('consultation_type'); ?>>
          <option value="">— اختر —</option>
          <?php foreach (abz_consultation_types() as $option) : ?>
            <option <?php selected($old['consultation_type'] ?? '', $option); ?>><?php echo esc_html($option); ?></option>
          <?php endforeach; ?>
        </select>
        <?php $err('consultation_type'); ?>
      </div>
      <div>
        <label class="<?php echo $label; ?>" for="abz-channel">وسيلة الاستشارة</label>
        <select class="<?php echo $input; ?>" id="abz-channel" name="channel" required<?php echo $described('channel'); ?>>
          <option value="">— اختر —</option>
          <?php foreach (abz_channels() as $key => $option) : ?>
            <option value="<?php echo esc_attr($key); ?>" <?php selected($old['channel'] ?? '', $key); ?>><?php echo esc_html($option); ?></option>
          <?php endforeach; ?>
        </select>
        <?php $err('channel'); ?>
      </div>
      <div>
        <label class="<?php echo $label; ?>" for="abz-date">التاريخ المفضّل</label>
        <input class="<?php echo $input; ?>" id="abz-date" name="preferred_date" type="date" min="<?php echo esc_attr(wp_date('Y-m-d')); ?>" required value="<?php echo $val('preferred_date'); ?>"<?php echo $described('preferred_date'); ?>>
        <?php $err('preferred_date'); ?>
      </div>
      <div>
        <label class="<?php echo $label; ?>" for="abz-time">الوقت المفضّل (بتوقيت القاهرة)</label>
        <select class="<?php echo $input; ?>" id="abz-time" name="preferred_time">
          <?php foreach (['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] as $slot) : ?>
            <option <?php selected($old['preferred_time'] ?? '', $slot); ?>><?php echo esc_html($slot); ?></option>
          <?php endforeach; ?>
        </select>
      </div>
    <?php endif; ?>

    <div class="sm:col-span-2">
      <label class="<?php echo $label; ?>" for="abz-message"><?php echo $type === 'booking' ? 'ملخّص الموضوع' : ($type === 'interest' ? 'ملاحظات (اختياري)' : 'تفاصيل طلبك'); ?></label>
      <textarea class="<?php echo $input; ?> min-h-[140px]" id="abz-message" name="message" rows="5"<?php echo $described('message'); ?>><?php echo esc_textarea((string) ($old['message'] ?? '')); ?></textarea>
      <?php $err('message'); ?>
    </div>

    <div class="sm:col-span-2">
      <label class="flex items-start gap-3 text-sm leading-7 text-slate-700">
        <input type="checkbox" name="consent" value="1" class="mt-1.5 h-5 w-5 accent-navy-900" required<?php echo $described('consent'); ?>>
        <span>أوافق على معالجة بياناتي للردّ على طلبي وفق <a class="font-bold text-navy-900 underline" href="<?php echo esc_url(home_url('/privacy/')); ?>">سياسة الخصوصية</a>. إرسال الطلب لا يعني قبول التكليف قبل الاتفاق على النطاق والأتعاب كتابةً.</span>
      </label>
      <?php $err('consent'); ?>
    </div>

    <div class="sm:col-span-2 flex flex-wrap items-center gap-3">
      <button type="submit" class="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-navy-900 px-8 font-bold text-white transition hover:bg-navy-800"><?php echo esc_html($atts['button'] ?: $buttons[$type]); ?></button>
      <a class="inline-flex min-h-[52px] items-center gap-2 rounded-xl border-2 border-whatsapp-600 px-6 font-bold text-whatsapp-700 hover:bg-whatsapp-600 hover:text-white" href="<?php echo esc_url(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.')); ?>" target="_blank" rel="noopener">أو راسلنا على واتساب</a>
    </div>
  </form>
<?php endif; ?>
</div>
