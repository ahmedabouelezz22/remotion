<?php
/* فيديوهات قناة يوتيوب */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
abz_page_hero('المعرفة', 'فيديوهات القناة', 'شروحات قانونية مرئية من قناة المؤسسة على يوتيوب، تُحدَّث تلقائياً عند نشر فيديو جديد.', [['المكتبة القانونية', abz_url('library')], ['فيديوهات القناة', '']], 'conference');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php if (function_exists('abz_render_videos')) { abz_render_videos(15); } ?>
    <div class="mt-10 text-center"><?php echo abz_button(function_exists('abz_youtube_channel_url') ? abz_youtube_channel_url() : 'https://www.youtube.com/@-ahmedaboelezz', 'القناة كاملة على يوتيوب', 'primary', 'md', '', true); ?></div>
  </div>
</section>
<?php get_footer();
