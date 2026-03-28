import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  fullScreen?: boolean;
}

export function PageLoader({ fullScreen = true }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen bg-background" : "py-20"}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
