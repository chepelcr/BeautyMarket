import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DOCUMENT_TYPES } from '@/types/invoice';
import { ComplexSearchModal } from './ComplexSearchModal';
import type { ComplexSearchFilters } from '@/types/document';

interface DocumentsFiltersProps {
  selectedTypes: number[];
  search: ComplexSearchFilters;
  onTypesChange: (types: number[]) => void;
  onSearchChange: (search: ComplexSearchFilters) => void;
}

export function DocumentsFilters({
  selectedTypes,
  search,
  onTypesChange,
  onSearchChange,
}: DocumentsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [term, setTerm] = useState(search.searchTerm ?? '');

  const toggleType = (code: number) => {
    onTypesChange(
      selectedTypes.includes(code)
        ? selectedTypes.filter((c) => c !== code)
        : [...selectedTypes, code]
    );
  };

  const hasAdvancedFilters =
    search.status || search.start_date || search.end_date || search.sort;

  return (
    <div className="p-3 space-y-2 border-b border-border shrink-0">
      {/* Search + advanced */}
      <div className="flex gap-2">
        <input
          value={term}
          onChange={(e) => { setTerm(e.target.value); onSearchChange({ ...search, searchTerm: e.target.value || undefined }); }}
          placeholder="Buscar por número, nombre…"
          className="flex-1 h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => setShowAdvanced(true)}
          className={cn(
            'h-10 px-3 rounded-md border text-[12px] font-semibold transition-colors',
            hasAdvancedFilters
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40'
          )}
        >
          Filtros{hasAdvancedFilters ? ' ●' : ''}
        </button>
      </div>

      {/* Document type chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onTypesChange([])}
          className={cn(
            'h-7 px-3 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border',
            selectedTypes.length === 0
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40'
          )}
        >
          Todos
        </button>
        {DOCUMENT_TYPES.map((dt) => (
          <button
            key={dt.code}
            onClick={() => toggleType(dt.code)}
            className={cn(
              'h-7 px-3 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border',
              selectedTypes.includes(dt.code)
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            {dt.short}
          </button>
        ))}
      </div>

      {showAdvanced && (
        <ComplexSearchModal
          filters={search}
          onApply={onSearchChange}
          onClose={() => setShowAdvanced(false)}
        />
      )}
    </div>
  );
}
