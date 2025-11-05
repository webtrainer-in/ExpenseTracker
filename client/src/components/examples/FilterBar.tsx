import { useState } from "react";
import { FilterBar } from "../FilterBar";

export default function FilterBarExample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <div className="p-8 bg-background">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Search: {searchQuery || "(none)"} | Category: {category}
      </div>
    </div>
  );
}
