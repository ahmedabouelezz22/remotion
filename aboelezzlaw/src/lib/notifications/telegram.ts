/**
 * إشعار تيليجرام — قناة احتياطية مجانية تماماً وفورية على الهاتف.
 * تُضبط بإنشاء بوت عبر @BotFather ثم وضع TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID.
 */

export type TelegramResult =
  | { ok: true; provider: 'telegram' }
  | { ok: false; provider: 'telegram'; error: string };

export async function sendTelegram(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, provider: 'telegram', error: 'لم يُضبط بوت تيليجرام.' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      return { ok: false, provider: 'telegram', error: `HTTP ${res.status}: ${await res.text()}` };
    }
    return { ok: true, provider: 'telegram' };
  } catch (error) {
    return { ok: false, provider: 'telegram', error: (error as Error).message };
  }
}
