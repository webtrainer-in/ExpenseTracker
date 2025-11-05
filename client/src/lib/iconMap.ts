import {
  Tag,
  ShoppingCart,
  Zap,
  Car,
  Film,
  Utensils,
  Heart,
  GraduationCap,
  Plane,
  Home,
  MoreHorizontal,
  DollarSign,
  Briefcase,
  Smartphone,
  Shirt,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  "tag": Tag,
  "shopping-cart": ShoppingCart,
  "zap": Zap,
  "car": Car,
  "film": Film,
  "utensils": Utensils,
  "heart": Heart,
  "graduation-cap": GraduationCap,
  "plane": Plane,
  "home": Home,
  "more-horizontal": MoreHorizontal,
  "dollar-sign": DollarSign,
  "briefcase": Briefcase,
  "smartphone": Smartphone,
  "shirt": Shirt,
  "dumbbell": Dumbbell,
};

export function getIconForCategory(iconName: string): LucideIcon {
  return iconMap[iconName] || Tag;
}
