<?php
/* كرة أرضية زخرفية — لا تدّعي مواقع ولا فروعاً */
if (!defined('ABSPATH')) {
    exit;
}
$nodes = [[132, 150, '0s'], [262, 118, '.9s'], [228, 232, '1.7s'], [118, 262, '2.4s'], [300, 262, '.4s']];
?>
<svg viewBox="0 0 400 400" class="h-full w-full" aria-hidden="true">
  <defs>
    <radialGradient id="abz-globe-fill" cx="38%" cy="32%" r="75%"><stop offset="0%" stop-color="#1c6b57" stop-opacity=".55"/><stop offset="55%" stop-color="#124a3c" stop-opacity=".28"/><stop offset="100%" stop-color="#11293a" stop-opacity="0"/></radialGradient>
    <linearGradient id="abz-arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0c25e" stop-opacity="0"/><stop offset="50%" stop-color="#e0c25e" stop-opacity=".9"/><stop offset="100%" stop-color="#e0c25e" stop-opacity="0"/></linearGradient>
  </defs>
  <circle cx="200" cy="200" r="170" fill="url(#abz-globe-fill)"/>
  <g fill="none" stroke="#e8cf7c" stroke-opacity=".22" stroke-width="1">
    <circle cx="200" cy="200" r="170" stroke-opacity=".45"/>
    <?php foreach ([30, 78, 124, 160] as $rx) : ?><ellipse cx="200" cy="200" rx="<?php echo (int) $rx; ?>" ry="170"/><?php endforeach; ?>
    <?php foreach ([-110, -55, 0, 55, 110] as $offset) : $half = sqrt(170 * 170 - $offset * $offset); ?>
      <ellipse cx="200" cy="<?php echo (int) (200 + $offset); ?>" rx="<?php echo esc_attr(round($half, 1)); ?>" ry="<?php echo esc_attr(round($half * 0.16, 1)); ?>"/>
    <?php endforeach; ?>
  </g>
  <g fill="none" stroke="url(#abz-arc)" stroke-width="1.6" stroke-linecap="round">
    <path d="M132 150 Q200 70 262 118"/><path d="M262 118 Q290 180 228 232"/><path d="M118 262 Q170 210 228 232"/><path d="M228 232 Q270 270 300 262"/>
  </g>
  <?php foreach ($nodes as [$cx, $cy, $delay]) : ?>
    <circle cx="<?php echo (int) $cx; ?>" cy="<?php echo (int) $cy; ?>" r="9" fill="#e0c25e" fill-opacity=".18" class="abz-pulse" style="animation-delay:<?php echo esc_attr($delay); ?>"/>
    <circle cx="<?php echo (int) $cx; ?>" cy="<?php echo (int) $cy; ?>" r="3.2" fill="#e8cf7c"/>
  <?php endforeach; ?>
</svg>
