import { Clock, Users, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  title: string;
  description: string;
  image: string;
  prepTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  featured?: boolean;
}

export default function RecipeCard({
  title,
  description,
  image,
  prepTime,
  servings,
  difficulty,
  featured = false,
}: RecipeCardProps) {
  return (
    <div className="recipe-card group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        {featured && (
          <div className="absolute top-4 right-4 bg-gourmet-gold text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            Featured Recipe
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-stone-900 mb-2 group-hover:text-gourmet-red transition-colors">
          {title}
        </h3>
        <p className="text-sm text-stone-600 mb-4 line-clamp-2">{description}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gourmet-gold" />
            <span>{prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gourmet-green" />
            <span>{servings} servings</span>
          </div>
          <div className="ml-auto">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                difficulty === 'Easy'
                  ? 'bg-green-100 text-green-700'
                  : difficulty === 'Medium'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
