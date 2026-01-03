import { Badge } from "@/components/ui/badge";
import { getIconForCategory } from "@/lib/iconMap";
import { useCategories } from "@/hooks/useCategories";

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

interface CategoryBadgeProps {
  category: string;
  testId?: string;
}

export function CategoryBadge({ category, testId }: CategoryBadgeProps) {
  const { data: categories = [] } = useCategories();
  const categoryData = categories.find((c) => c.name.toLowerCase() === category.toLowerCase());
  
  const Icon = categoryData ? getIconForCategory(categoryData.icon) : getIconForCategory("tag");
  const label = categoryData?.name || category;

  return (
    <Badge variant="outline" className="gap-1.5" data-testid={testId}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
