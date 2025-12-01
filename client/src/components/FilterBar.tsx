import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import type { User } from "@shared/schema";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedUser?: string;
  onUserChange?: (userId: string) => void;
  users?: User[];
  showUserFilter?: boolean;
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
  selectedUser = "all",
  onUserChange,
  users = [],
  showUserFilter = false,
}: FilterBarProps) {
  const { data: categories = [] } = useCategories();

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
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name.toLowerCase()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showUserFilter && onUserChange && (
        <Select value={selectedUser} onValueChange={onUserChange}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-user">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
