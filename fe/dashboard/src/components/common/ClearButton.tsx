import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  onClick: () => void;
}

export function ClearButton({ onClick }: ClearButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
