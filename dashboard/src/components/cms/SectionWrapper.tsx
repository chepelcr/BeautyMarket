import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SectionWrapperProps {
  children: ReactNode;
}

export function SectionWrapper({
  children,
}: SectionWrapperProps) {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">{children}</CardContent>
    </Card>
  );
}
