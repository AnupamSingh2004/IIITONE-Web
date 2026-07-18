import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface MaterialSummary {
  id: string;
  title: string;
  type: "notes" | "pyq" | "assignment";
  courseName: string;
  hasTextLayer: boolean;
}

const typeStyles: Record<MaterialSummary["type"], string> = {
  notes: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pyq: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  assignment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function MaterialCard({ material }: { material: MaterialSummary }) {
  return (
    <Link href={`/app/materials/${material.id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Badge className={typeStyles[material.type]} variant="secondary">
            {material.type}
          </Badge>
        </CardHeader>
        <CardContent>
          <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
            {material.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{material.courseName}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
