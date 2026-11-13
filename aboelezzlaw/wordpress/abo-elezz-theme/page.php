<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$is_shop_page = function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page());
abz_page_hero('', get_the_title(), '', [[get_the_title(), '']]);
?>
<section class="py-14 sm:py-20">
  <div class="<?php echo $is_shop_page ? 'mx-auto max-w-7xl px-5 sm:px-8' : 'prose-page mx-auto max-w-3xl px-5 sm:px-8'; ?>"><?php the_content(); ?></div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
