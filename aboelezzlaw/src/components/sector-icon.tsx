import {
  Briefcase,
  Building2,
  Car,
  Cpu,
  Droplets,
  Factory,
  Fuel,
  Gavel,
  GraduationCap,
  HardHat,
  HeartHandshake,
  HeartPulse,
  Hotel,
  Landmark,
  Leaf,
  Megaphone,
  Palette,
  Plane,
  Rocket,
  Shield,
  Ship,
  Shirt,
  ShoppingBag,
  Trophy,
  Truck,
  Umbrella,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import type { SectorIcon as SectorIconName } from '@/content/sectors';

/**
 * الأيقونة تُختار بالاسم من ملف البيانات لا بالاستيراد في كل صفحة: إضافة
 * قطاع لا تتطلّب لمس المكوّنات، والنوع يرفض اسماً بلا أيقونة مقابلة.
 */
const icons: Record<SectorIconName, LucideIcon> = {
  car: Car,
  'hard-hat': HardHat,
  fuel: Fuel,
  'heart-pulse': HeartPulse,
  building: Building2,
  landmark: Landmark,
  cpu: Cpu,
  palette: Palette,
  megaphone: Megaphone,
  ship: Ship,
  plane: Plane,
  factory: Factory,
  wheat: Wheat,
  'shopping-bag': ShoppingBag,
  hotel: Hotel,
  trophy: Trophy,
  'graduation-cap': GraduationCap,
  umbrella: Umbrella,
  gavel: Gavel,
  'heart-handshake': HeartHandshake,
  leaf: Leaf,
  droplets: Droplets,
  shirt: Shirt,
  rocket: Rocket,
  shield: Shield,
  truck: Truck,
  briefcase: Briefcase,
};

export function SectorIcon({ name, className }: { name: SectorIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
