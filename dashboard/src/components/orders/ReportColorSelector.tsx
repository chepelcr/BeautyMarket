import { REPORT_COLOR_OPTIONS, type ReportColorScheme } from '@/models';

interface ReportColorSelectorProps {
  value?: ReportColorScheme;
  onChange: (color: ReportColorScheme) => void;
}

export function getDefaultColorForDepartment(dept: string): ReportColorScheme {
  if (dept === '22') return 'orange';
  if (dept === '26') return 'green_alt';
  return 'green';
}

export function ReportColorSelector({ value, onChange }: ReportColorSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {REPORT_COLOR_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-md transition-colors ${
              isSelected ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
          >
            <span
              className={`block w-6 h-6 rounded-full border-2 transition-shadow ${
                isSelected ? 'ring-2 ring-offset-2 ring-primary border-primary' : 'border-muted-foreground/30'
              }`}
              style={{ backgroundColor: option.hex }}
            />
            <span className={`text-xs ${isSelected ? 'font-medium' : 'text-muted-foreground'}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
