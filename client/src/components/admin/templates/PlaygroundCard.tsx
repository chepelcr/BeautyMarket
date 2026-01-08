import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Plus, Palette } from "lucide-react";

interface PlaygroundCardProps {
  onSelect: () => void;
}

export function PlaygroundCard({ onSelect }: PlaygroundCardProps) {
  return (
    <Card className="group relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-dashed border-primary/50 hover:border-primary bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col h-full">
      <div className="absolute -top-3 -right-3 z-10">
        <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg">
          Start Fresh
        </Badge>
      </div>

      <CardHeader className="flex-grow">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full w-fit transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Plus className="h-5 w-5 text-secondary animate-pulse" />
            </div>
          </div>
        </div>

        <CardTitle className="text-2xl text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Playground
        </CardTitle>
        <CardDescription className="text-center text-base">
          Start from scratch and build your unique store with complete creative freedom. Perfect for those who want full control over their design.
        </CardDescription>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Palette className="h-4 w-4 mr-2 text-primary" />
            <span>Empty canvas ready for your creativity</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Plus className="h-4 w-4 mr-2 text-primary" />
            <span>No pre-built pages or products</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Rocket className="h-4 w-4 mr-2 text-primary" />
            <span>Full customization capabilities</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-lg"
          size="lg"
        >
          <Rocket className="mr-2 h-5 w-5" />
          Start from Scratch
        </Button>
      </CardContent>
    </Card>
  );
}
