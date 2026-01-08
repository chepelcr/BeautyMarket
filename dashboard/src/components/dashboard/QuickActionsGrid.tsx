import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

export function QuickActionsGrid({ actions, columns = 3 }: QuickActionsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => !action.disabled && action.onClick()}
          >
            <CardContent className="p-6">
              <Button
                variant={action.variant || 'outline'}
                className="w-full h-auto flex flex-col items-center gap-3 py-6"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">{action.label}</div>
                  {action.description && (
                    <div className="text-xs text-muted-foreground mt-1 font-normal">
                      {action.description}
                    </div>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
