import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Home, Car, Film, Utensils, Heart, GraduationCap, Plane, Zap, MoreHorizontal } from "lucide-react";

export type ExpenseCategory =
  | "groceries"
  | "utilities"
  | "transportation"
  | "entertainment"
  | "dining"
  | "healthcare"
  | "education"
  | "travel"
  | "bills"
  | "other";

const categoryConfig: Record<ExpenseCategory, { label: string; icon: React.ElementType }> = {
  groceries: { label: "Groceries", icon: ShoppingCart },
  utilities: { label: "Utilities", icon: Zap },
  transportation: { label: "Transportation", icon: Car },
  entertainment: { label: "Entertainment", icon: Film },
  dining: { label: "Dining", icon: Utensils },
  healthcare: { label: "Healthcare", icon: Heart },
  education: { label: "Education", icon: GraduationCap },
  travel: { label: "Travel", icon: Plane },
  bills: { label: "Bills", icon: Home },
  other: { label: "Other", icon: MoreHorizontal },
};

interface CategoryBadgeProps {
  category: ExpenseCategory;
  testId?: string;
}

export function CategoryBadge({ category, testId }: CategoryBadgeProps) {
  const { label, icon: Icon } = categoryConfig[category];

  return (
    <Badge variant="outline" className="gap-1.5" data-testid={testId}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
