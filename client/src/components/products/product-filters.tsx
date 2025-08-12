import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@shared/schema";

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProductFilters({ selectedCategory, onCategoryChange }: ProductFiltersProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    );
  }

  const filters = [
    { value: "all", label: "Todos" },
    ...(categories || []).map(category => ({
      value: category.slug,
      label: category.name
    }))
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => onCategoryChange(filter.value)}
          variant={selectedCategory === filter.value ? "default" : "outline"}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === filter.value
              ? "bg-pink-primary text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-pink-primary hover:text-white dark:hover:bg-pink-600 dark:hover:text-white border-gray-200 dark:border-gray-600"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
