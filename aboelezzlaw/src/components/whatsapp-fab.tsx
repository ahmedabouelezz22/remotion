'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { site, waLink } from '@/content/site';

/** زر واتساب عائم — يظهر بعد تمرير قصير حتى لا يزاحم القسم الأول */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={waLink(`السلام عليكم، تواصلت معكم عبر موقع ${site.url}`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="مراسلتنا عبر واتساب"
      className={`fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1eb955] ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
