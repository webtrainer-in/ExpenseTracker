import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { type ExpenseCategory } from "./CategoryBadge";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  dateRange?: {
    from: string;
    to: string;
  };
  onDateRangeChange?: (range: { from: string; to: string }) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-category">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="groceries">Groceries</SelectItem>
          <SelectItem value="utilities">Utilities</SelectItem>
          <SelectItem value="transportation">Transportation</SelectItem>
          <SelectItem value="entertainment">Entertainment</SelectItem>
          <SelectItem value="dining">Dining</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
          <SelectItem value="education">Education</SelectItem>
          <SelectItem value="travel">Travel</SelectItem>
          <SelectItem value="bills">Bills</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
