<?php
if (!defined('ABSPATH')) {
    exit;
}
$nav = abz_nav();
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
    <ul class="flex items-center gap-5 whitespace-nowrap">
      <li class="flex items-center gap-1.5 font-semibold text-gold-300"><?php echo abz_icon('globe', 'h-3.5 w-3.5'); ?>منصّة قانونية دولية عن بُعد</li>
      <?php if ($hours) : ?><li class="hidden items-center gap-1.5 2xl:flex"><?php echo abz_icon('clock', 'h-3.5 w-3.5 text-gold-400'); ?><?php echo esc_html($hours); ?></li><?php endif; ?>
      <li><a class="flex items-center gap-1.5 hover:text-gold-300" target="_blank" rel="noopener" href="<?php echo esc_url(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.')); ?>"><?php echo abz_icon('message-circle', 'h-3.5 w-3.5 text-gold-400'); ?>واتساب <span dir="ltr" class="numeric">+<?php echo esc_html(abz_digits((string) abz_setting('whatsapp', '201157844664'))); ?></span></a></li>
      <li class="hidden items-center gap-1.5 xl:flex"><?php echo abz_icon('mail', 'h-3.5 w-3.5 text-gold-400'); ?><a dir="ltr" class="hover:text-gold-300" href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></li>
    </ul>
    <div class="flex shrink-0 items-center gap-4 whitespace-nowrap [&_ul]:flex-nowrap">
      <?php abz_social_icons('dark', 'h-7 w-7'); ?>
      <a class="flex items-center gap-1.5 font-bold text-white hover:text-gold-300" href="<?php echo esc_url(is_user_logged_in() ? abz_account_url() : abz_url('register')); ?>"><?php echo abz_icon(is_user_logged_in() ? 'user' : 'log-in', 'h-3.5 w-3.5'); ?><?php echo is_user_logged_in() ? 'حسابي' : 'دخول / حساب جديد'; ?></a>
    </div>
  </div>
</div>

<header class="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/95 shadow-[0_1px_0_rgba(11,31,58,0.04)] supports-[backdrop-filter]:bg-sand-50/90 supports-[backdrop-filter]:backdrop-blur">
  <div class="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="flex shrink-0 items-center gap-3" aria-label="<?php echo esc_attr(get_bloginfo('name')); ?> — الرئيسية">
      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 p-1.5"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/logo-256.png'); ?>" alt="شعار مؤسسة أبو العز للمحاماة والاستشارات القانونية" width="48" height="43" class="h-full w-full object-contain"></span>
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
                  <?php elseif (!empty($item['groups'])) : ?>
                    <div class="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
                      <?php foreach ($item['groups'] as $group) : ?>
                        <div>
                          <p class="mb-2 border-b border-sand-200 pb-2 text-xs font-bold tracking-[0.08em] text-gold-600"><?php echo esc_html($group['title']); ?></p>
                          <ul class="grid gap-0.5">
                            <?php foreach ($group['items'] as $sector) : ?>
                              <li><a class="flex min-h-[36px] items-center gap-2.5 rounded-lg px-2 text-[0.88rem] font-semibold text-navy-900 hover:bg-sand-100 hover:text-gold-600" href="<?php echo esc_url(get_permalink($sector)); ?>"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-4 w-4 shrink-0 text-gold-600'); ?><?php echo esc_html($sector->post_title); ?></a></li>
                            <?php endforeach; ?>
                          </ul>
                        </div>
                      <?php endforeach; ?>
                    </div>
                    <a class="mt-4 inline-flex min-h-[40px] items-center gap-1.5 px-2 font-bold text-navy-900 hover:text-gold-600" href="<?php echo esc_url(get_post_type_archive_link('abz_sector') ?: abz_url('sectors')); ?>">كل القطاعات <?php echo abz_arrow('h-3.5 w-3.5'); ?></a>
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
        <a href="<?php echo esc_url(is_user_logged_in() ? wc_get_page_permalink('myaccount') : abz_url('register')); ?>" class="hidden h-11 w-11 items-center justify-center rounded-xl text-navy-900 hover:bg-sand-100 sm:inline-flex" aria-label="<?php echo is_user_logged_in() ? 'حسابي' : 'دخول أو حساب جديد'; ?>"><?php echo abz_icon('user'); ?></a>
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
                        if (!empty($item['groups'])) {
                            $entries = [['كل القطاعات (' . array_sum(array_map(fn($g) => count($g['items']), $item['groups'])) . ')', get_post_type_archive_link('abz_sector') ?: abz_url('sectors')]];
                            foreach ($item['groups'] as $g) {
                                $entries[] = [$g['title'], (get_post_type_archive_link('abz_sector') ?: abz_url('sectors')) . '#' . $g['key']];
                            }
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
            <?php echo abz_button(is_user_logged_in() ? abz_account_url() : abz_url('register'), is_user_logged_in() ? 'حسابي' : 'دخول / حساب جديد', 'outline', 'md', 'w-full'); ?>
            <?php echo abz_button(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.'), abz_icon('message-circle', 'h-4 w-4') . ' واتساب', 'whatsapp', 'md', 'w-full', true); ?>
          </div>
          <div class="mt-6"><?php abz_social_icons('light', 'h-11 w-11'); ?></div>
        </div>
      </details>
    </div>
  </div>
</header>
<main id="main" class="flex-1">
