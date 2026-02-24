"use client";

import { Check, Filter } from "lucide-react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./_adapter";
import type { POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";

interface CategoryFilterMenuProps {
  categories: POICategory[];
  categoryFilter: POICategory | null;
  onFilterCategory: (category: POICategory | null) => void;
}

export function CategoryFilterMenu({
  categories,
  categoryFilter,
  onFilterCategory,
}: CategoryFilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 rounded-lg transition-colors",
            categoryFilter && "bg-primary/10 text-primary",
          )}
        >
          <Filter className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onFilterCategory(null)}>
          <span className="flex-1">All categories</span>
          {categoryFilter === null && <Check className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() => onFilterCategory(category)}
          >
            <span className="flex-1">{CATEGORY_LABELS[category]}</span>
            {categoryFilter === category && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
