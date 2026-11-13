<?php
if (!defined('ABSPATH')) {
    exit;
}
$nav = abz_nav();
$phone = (string) abz_setting('phone', '01157844664');
$phone2 = (string) abz_setting('phone2', '');
$email = (string) abz_setting('email', 'ahmed@aboelezzlaw.com');
$hours = (string) abz_setting('hours', '');
$cart_count = function_exists('WC') && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0;
$link = 'inline-flex h-full items-center gap-1 px-3 text-[0.95rem] font-bold text-navy-900 transition-colors hover:text-gold-600 xl:px-3.5';
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class('flex min-h-dvh flex-col antialiased'); ?>>
<?php wp_body_open(); ?>
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-bold focus:text-navy-950">تخطَّ إلى المحتوى</a>

<!-- الشريط العلوي: وسائل التواصل -->
<div class="hidden bg-navy-950 text-[0.82rem] text-navy-100 lg:block">
  <div class="mx-auto flex h-10 max-w-7xl items-center justify-between gap-6 px-8">
    <ul class="flex items-center gap-5">
      <li class="flex items-center gap-1.5"><?php echo abz_icon('phone', 'h-3.5 w-3.5 text-gold-400'); ?><?php echo abz_phone_link($phone, 'hover:text-gold-300'); ?></li>
      <?php if ($phone2) : ?><li class="flex items-center gap-1.5"><?php echo abz_icon('message-circle', 'h-3.5 w-3.5 text-gold-400'); ?><?php echo abz_phone_link($phone2, 'hover:text-gold-300'); ?></li><?php endif; ?>
      <li class="flex items-center gap-1.5"><?php echo abz_icon('mail', 'h-3.5 w-3.5 text-gold-400'); ?><a dir="ltr" class="hover:text-gold-300" href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></li>
      <?php if ($hours) : ?><li class="hidden items-center gap-1.5 xl:flex"><?php echo abz_icon('clock', 'h-3.5 w-3.5 text-gold-400'); ?><?php echo esc_html($hours); ?></li><?php endif; ?>
    </ul>
    <?php abz_social_icons('dark', 'h-7 w-7'); ?>
  </div>
</div>

<header class="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/95 shadow-[0_1px_0_rgba(11,31,58,0.04)] supports-[backdrop-filter]:bg-sand-50/90 supports-[backdrop-filter]:backdrop-blur">
  <div class="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="flex shrink-0 items-center gap-3" aria-label="<?php echo esc_attr(get_bloginfo('name')); ?> — الرئيسية">
      <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/logo-eagle.svg'); ?>" alt="" width="48" height="48" class="h-12 w-12">
      <span class="leading-tight">
        <span class="block font-display text-[1.05rem] font-black text-navy-900">مؤسسة أبو العز</span>
        <span class="block text-[0.72rem] font-semibold text-slate-600">للمحاماة والاستشارات القانونية</span>
      </span>
    </a>

    <!-- التنقّل على الحاسب -->
    <nav aria-label="التنقّل الرئيسي" class="hidden h-full lg:block">
      <ul class="flex h-full items-center">
        <?php foreach ($nav as $item) : ?>
          <?php if (!empty($item['href'])) : ?>
            <li class="h-full"><a class="<?php echo esc_attr($link); ?>" href="<?php echo esc_url($item['href']); ?>"><?php echo esc_html($item['label']); ?></a></li>
          <?php else : $wide = !empty($item['wide']); ?>
            <li class="group/menu h-full <?php echo $wide ? 'static' : 'relative'; ?>" data-abz-dropdown>
              <button type="button" aria-haspopup="true" class="<?php echo esc_attr($link); ?>">
                <?php echo esc_html($item['label']); ?>
                <?php echo abz_icon('chevron-down', 'h-3.5 w-3.5 transition-transform duration-200 group-hover/menu:rotate-180 group-focus-within/menu:rotate-180'); ?>
              </button>
              <div class="invisible absolute top-full z-50 pt-2 opacity-0 transition duration-200 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100 <?php echo $wide ? 'inset-x-5 sm:inset-x-8' : 'start-0 w-72'; ?>">
                <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-[0_24px_60px_rgba(11,31,58,0.18)]">
                  <?php if (!empty($item['columns'])) : ?>
                    <div class="grid gap-8 md:grid-cols-2">
                      <?php foreach ($item['columns'] as $column) : ?>
                        <div>
                          <p class="mb-3 text-xs font-bold tracking-[0.15em] text-gold-600"><?php echo esc_html($column['title']); ?></p>
                          <ul class="grid gap-0.5">
                            <?php foreach ($column['items'] as [$label, $href]) : ?>
                              <li><a class="flex min-h-[40px] items-center rounded-lg px-3 text-[0.92rem] font-semibold text-navy-900 hover:bg-sand-100 hover:text-gold-600" href="<?php echo esc_url($href); ?>"><?php echo esc_html($label); ?></a></li>
                            <?php endforeach; ?>
                          </ul>
                        </div>
                      <?php endforeach; ?>
                    </div>
                  <?php elseif (!empty($item['sectors'])) : ?>
                    <p class="mb-3 text-xs font-bold tracking-[0.15em] text-gold-600">القطاعات التي نخدمها</p>
                    <ul class="grid gap-x-6 gap-y-0.5 sm:grid-cols-2 xl:grid-cols-3">
                      <?php foreach ($item['sectors'] as $sector) : ?>
                        <li><a class="flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 text-[0.9rem] font-semibold text-navy-900 hover:bg-sand-100 hover:text-gold-600" href="<?php echo esc_url(get_permalink($sector)); ?>"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-4 w-4 shrink-0 text-gold-600'); ?><?php echo esc_html($sector->post_title); ?></a></li>
                      <?php endforeach; ?>
                    </ul>
                    <a class="mt-3 inline-flex min-h-[40px] items-center gap-1.5 px-3 font-bold text-navy-900 hover:text-gold-600" href="<?php echo esc_url(get_post_type_archive_link('abz_sector') ?: abz_url('sectors')); ?>">كل القطاعات <?php echo abz_arrow('h-3.5 w-3.5'); ?></a>
                  <?php else : ?>
                    <ul class="grid gap-0.5">
                      <?php foreach ($item['items'] as $entry) : [$label, $href] = $entry; $soon = $entry[2] ?? ''; ?>
                        <li>
                          <?php if ($href) : ?>
                            <a class="flex min-h-[40px] items-center rounded-lg px-3 text-[0.92rem] font-semibold text-navy-900 hover:bg-sand-100 hover:text-gold-600" href="<?php echo esc_url($href); ?>"><?php echo esc_html($label); ?></a>
                          <?php else : ?>
                            <span class="flex min-h-[40px] items-center justify-between gap-2 px-3 text-[0.92rem] font-semibold text-slate-500"><?php echo esc_html($label); ?><span class="rounded-full bg-sand-100 px-2 py-0.5 text-[0.7rem] font-bold text-slate-600"><?php echo esc_html($soon); ?></span></span>
                          <?php endif; ?>
                        </li>
                      <?php endforeach; ?>
                    </ul>
                  <?php endif; ?>
                </div>
              </div>
            </li>
          <?php endif; ?>
        <?php endforeach; ?>
      </ul>
    </nav>

    <div class="flex items-center gap-1.5">
      <?php if (function_exists('wc_get_cart_url')) : ?>
        <a href="<?php echo esc_url(wc_get_cart_url()); ?>" class="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-navy-900 hover:bg-sand-100" aria-label="السلة<?php echo $cart_count ? ' — ' . esc_attr((string) $cart_count) . ' عناصر' : ''; ?>">
          <?php echo abz_icon('shopping-cart'); ?>
          <?php if ($cart_count) : ?><span class="numeric absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.7rem] font-black text-navy-950"><?php echo esc_html((string) $cart_count); ?></span><?php endif; ?>
        </a>
        <a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>" class="hidden h-11 w-11 items-center justify-center rounded-xl text-navy-900 hover:bg-sand-100 sm:inline-flex" aria-label="حسابي"><?php echo abz_icon('user'); ?></a>
      <?php endif; ?>
      <span class="hidden xl:block"><?php echo abz_button(abz_url('booking'), 'احجز استشارة', 'primary', 'sm'); ?></span>

      <!-- قائمة الهاتف: تعمل بلا جافاسكربت -->
      <details class="group/mm lg:hidden" data-abz-menu>
        <summary class="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl text-navy-900 hover:bg-sand-100 [&::-webkit-details-marker]:hidden" aria-label="القائمة"><?php echo abz_icon('menu', 'h-6 w-6'); ?></summary>
        <div class="absolute inset-x-0 top-full hidden h-[calc(100dvh-72px)] group-open/mm:block overflow-y-auto border-t border-sand-200 bg-sand-50 px-5 pb-10 pt-4">
          <nav aria-label="قائمة الجوال">
            <ul class="grid gap-1">
              <?php foreach ($nav as $item) : ?>
                <?php if (!empty($item['href'])) : ?>
                  <li><a class="flex min-h-[52px] items-center rounded-xl px-3 text-[1.02rem] font-extrabold text-navy-900 hover:bg-sand-100" href="<?php echo esc_url($item['href']); ?>"><?php echo esc_html($item['label']); ?></a></li>
                <?php else : ?>
                  <li>
                    <details class="group/m">
                      <summary class="flex min-h-[52px] cursor-pointer list-none items-center justify-between rounded-xl px-3 text-[1.02rem] font-extrabold text-navy-900 hover:bg-sand-100 [&::-webkit-details-marker]:hidden"><?php echo esc_html($item['label']); ?><?php echo abz_icon('chevron-down', 'h-4 w-4 text-gold-600 transition-transform group-open/m:rotate-180'); ?></summary>
                      <ul class="mb-2 grid gap-0.5 border-s-2 border-gold-400 ps-3 ms-3">
                        <?php
                        $entries = $item['items'] ?? [];
                        if (!empty($item['columns'])) {
                            $entries = array_merge(...array_map(fn($c) => $c['items'], $item['columns']));
                        }
                        if (!empty($item['sectors'])) {
                            $entries = array_merge(array_map(fn($s) => [$s->post_title, get_permalink($s)], $item['sectors']), [['كل القطاعات', get_post_type_archive_link('abz_sector') ?: abz_url('sectors')]]);
                        }
                        foreach ($entries as $entry) : [$label, $href] = $entry;
                            if (!$href) { continue; } ?>
                          <li><a class="flex min-h-[44px] items-center rounded-lg px-3 font-semibold text-navy-800 hover:bg-sand-100" href="<?php echo esc_url($href); ?>"><?php echo esc_html($label); ?></a></li>
                        <?php endforeach; ?>
                      </ul>
                    </details>
                  </li>
                <?php endif; ?>
              <?php endforeach; ?>
            </ul>
          </nav>
          <div class="mt-6 grid gap-3">
            <?php echo abz_button(abz_url('booking'), 'احجز استشارة', 'primary', 'md', 'w-full'); ?>
            <?php echo abz_button(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.'), abz_icon('message-circle', 'h-4 w-4') . ' واتساب', 'whatsapp', 'md', 'w-full', true); ?>
          </div>
          <div class="mt-6"><?php abz_social_icons('light', 'h-11 w-11'); ?></div>
        </div>
      </details>
    </div>
  </div>
</header>
<main id="main" class="flex-1">
