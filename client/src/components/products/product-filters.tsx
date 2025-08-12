import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProductFilters({ selectedCategory, onCategoryChange }: ProductFiltersProps) {
  const filters = [
    { value: "all", label: "Todos" },
    { value: "maquillaje", label: "Maquillaje" },
    { value: "skincare", label: "Skincare" },
    { value: "accesorios", label: "Accesorios" },
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
              ? "bg-pink-primary text-white hover:bg-pink-600"
              : "bg-white text-gray-700 hover:bg-pink-primary hover:text-white border-gray-200"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
