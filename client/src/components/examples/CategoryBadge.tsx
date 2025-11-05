import { CategoryBadge, type ExpenseCategory } from "../CategoryBadge";

export default function CategoryBadgeExample() {
  const categories: ExpenseCategory[] = [
    "groceries",
    "utilities",
    "transportation",
    "entertainment",
    "dining",
    "healthcare",
    "education",
    "travel",
    "bills",
    "other",
  ];

  return (
    <div className="p-8 bg-background">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
    </div>
  );
}
