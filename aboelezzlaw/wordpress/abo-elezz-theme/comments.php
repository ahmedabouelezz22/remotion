<?php
/* أسئلة القرّاء وردود المؤسسة — كل مشاركة تُراجع قبل نشرها */
if (!defined('ABSPATH') || post_password_required()) {
    return;
}
$count = get_comments_number();
?>
<section id="comments" class="bg-sand-100 py-14 sm:py-20" aria-labelledby="comments-title">
  <div class="mx-auto max-w-3xl px-5 sm:px-8">
    <h2 id="comments-title" class="text-2xl text-navy-900">أسئلة القرّاء وردود المؤسسة</h2>
    <p class="mt-2 text-sm text-slate-600"><?php echo $count ? esc_html(sprintf('%s مشاركة على هذا المقال', number_format_i18n($count))) : 'لا مشاركات بعد — كن أوّل من يطرح سؤاله.'; ?></p>
    <?php if ($count) : ?>
      <ol class="comment-list mt-6"><?php wp_list_comments(['style' => 'ol', 'avatar_size' => 40, 'short_ping' => true]); ?></ol>
      <?php the_comments_navigation(); ?>
    <?php endif; ?>
    <?php if (comments_open()) :
        comment_form([
            'title_reply' => 'اطرح سؤالك أو اترك تعليقاً',
            'title_reply_to' => 'الردّ على %s',
            'label_submit' => 'أرسل المشاركة',
            'comment_notes_before' => '<p class="comment-notes">تُراجَع المشاركات قبل نشرها، ولا يُنشر بريدك. للاستشارة العاجلة تواصل مع المؤسسة مباشرة عبر <a class="font-bold underline" href="' . esc_url(abz_wa_link()) . '" target="_blank" rel="noopener">واتساب</a>.</p>',
            'comment_field' => '<p class="comment-form-comment"><label for="comment">سؤالك أو تعليقك</label><textarea id="comment" name="comment" rows="5" maxlength="3000" required></textarea></p>',
            'fields' => [
                'author' => '<p class="comment-form-author"><label for="author">الاسم</label><input id="author" name="author" type="text" autocomplete="name" required></p>',
                'email' => '<p class="comment-form-email"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" autocomplete="email" required></p>',
            ],
        ]);
    endif; ?>
  </div>
</section>
