<?php
/*
 * غلاف المقال: الصورة البارزة إن وُجدت، وإلا غلاف مرسوم من التصنيف —
 * لا صور مخزّنة من مواقع أخرى.
 */
if (!defined('ABSPATH')) {
    exit;
}
$large = ($args['size'] ?? 'card') === 'large';
if (has_post_thumbnail()) {
    the_post_thumbnail($large ? 'large' : 'abz-card', ['class' => 'aspect-[16/9] w-full object-cover', 'alt' => '']);
    return;
}
$category = get_the_category()[0] ?? null;
$palettes = [['#11293a', '#1c6b57'], ['#1a3a52', '#86670f'], ['#0d3b30', '#1a3a52'], ['#2a4a62', '#124a3c']];
$palette = $palettes[($category ? $category->term_id : get_the_ID()) % count($palettes)];
$icons = ['العقود والمنازعات' => 'file-text', 'الزكاة والضرائب' => 'calculator', 'الامتثال والتنظيم' => 'shield-check', 'القانون والاقتصاد' => 'scale'];
$icon = $icons[$category->name ?? ''] ?? 'scale';
?>
<div class="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden" style="background:linear-gradient(135deg,<?php echo esc_attr($palette[0]); ?>,<?php echo esc_attr($palette[1]); ?>)" aria-hidden="true">
  <div class="abz-grid absolute inset-0 opacity-60"></div>
  <span class="relative flex <?php echo $large ? 'h-24 w-24' : 'h-16 w-16'; ?> items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-gold-300"><?php echo abz_icon($icon, $large ? 'h-12 w-12' : 'h-8 w-8'); ?></span>
</div>
