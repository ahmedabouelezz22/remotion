// يولّد inc/icons.php من أيقونات lucide (رخصة ISC) — فقط الأيقونات المستخدمة.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const names = {
  car: 'car', 'hard-hat': 'hard-hat', fuel: 'fuel', 'heart-pulse': 'heart-pulse', building: 'building-2',
  landmark: 'landmark', cpu: 'cpu', palette: 'palette', megaphone: 'megaphone', ship: 'ship', plane: 'plane',
  factory: 'factory', wheat: 'wheat', 'shopping-bag': 'shopping-bag', hotel: 'hotel', trophy: 'trophy',
  'graduation-cap': 'graduation-cap', umbrella: 'umbrella', gavel: 'gavel', 'heart-handshake': 'heart-handshake',
  leaf: 'leaf', droplets: 'droplets', shirt: 'shirt', rocket: 'rocket', shield: 'shield', truck: 'truck',
  briefcase: 'briefcase', 'file-text': 'file-text', calculator: 'calculator', users: 'users', scale: 'scale',
  'shield-check': 'shield-check', user: 'user', 'badge-check': 'badge-check', 'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right', 'arrow-up-left': 'arrow-up-left', check: 'check', 'chevron-down': 'chevron-down',
  phone: 'phone', mail: 'mail', 'map-pin': 'map-pin', clock: 'clock', 'message-circle': 'message-circle',
  'shopping-cart': 'shopping-cart', menu: 'menu', x: 'x', search: 'search', 'calendar-check': 'calendar-check',
  'file-down': 'file-down', 'book-open': 'book-open', 'layout-grid': 'layout-grid', star: 'star', quote: 'quote',
  send: 'send', 'list-ordered': 'list-ordered', share: 'share-2', link: 'link', 'external-link': 'external-link',
  sparkles: 'sparkles', target: 'target', eye: 'eye', 'hand-heart': 'hand-heart', lock: 'lock', award: 'award',
  lightbulb: 'lightbulb', 'clipboard-check': 'clipboard-check', store: 'store', armchair: 'armchair',
  printer: 'printer', laptop: 'laptop', 'pen-tool': 'pen-tool', globe: 'globe', 'help-circle': 'circle-help',
  info: 'info', facebook: 'facebook', instagram: 'instagram', youtube: 'youtube', linkedin: 'linkedin', 'library': 'library', video: 'video', newspaper: 'newspaper', 'user-plus': 'user-plus',
};
const attr = (o) => Object.entries(o).filter(([k]) => k !== 'key').map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}="${v}"`).join(' ');
let php = "<?php\n// مولَّد من lucide (ISC) بالأداة wordpress/tools/build-icons.mjs — لا تعدّله يدوياً.\nif (!defined('ABSPATH')) exit;\nfunction abz_icon_paths(): array {\n  return [\n";
for (const [name, file] of Object.entries(names)) {
  const src = readFileSync(path.join(root, 'node_modules/lucide-react/dist/esm/icons', `${file}.js`), 'utf8');
  const body = src.slice(src.indexOf('[', src.indexOf('createLucideIcon(')), src.lastIndexOf(']') + 1);
  const nodes = Function(`return ${body}`)();
  const inner = nodes.map(([tag, a]) => `<${tag} ${attr(a)}/>`).join('');
  php += `    '${name}' => '${inner.replace(/'/g, "\\'")}',\n`;
}
// علامتا X وتيك توك غير موجودتين في lucide: رسم مبسّط بنفس أسلوب الخط
php += `    'x-brand' => '<path d="M4 4l16 16"/><path d="M20 4L4 20"/>',\n`;
php += `    'tiktok' => '<path d="M15 3v11a4 4 0 1 1-4-4"/><path d="M15 3c.5 2.6 2.4 4.4 5 4.5"/>',\n`;
php += `    'telegram' => '<path d="m22 3-9.5 18-2.5-8-7-3z"/><path d="M10 13 22 3"/>',\n`;
php += "  ];\n}\n";
writeFileSync(path.join(root, 'wordpress/abo-elezz-theme/inc/icons.php'), php);
console.log(Object.keys(names).length, 'icons');
