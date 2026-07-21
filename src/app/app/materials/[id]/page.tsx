"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Download, Flag } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PdfViewer = dynamic(() => import("@/components/materials/PdfViewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

interface MaterialDetail {
  id: string;
  title: string;
  type: string;
  courseName: string;
  fileUrl: string;
}

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["material", params.id],
    queryFn: () => apiFetch<MaterialDetail>(`/api/materials/${params.id}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
        This material couldn&apos;t be found. It may have been removed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            {data.type}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
          <p className="text-muted-foreground">{data.courseName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<a href={data.fileUrl} download className="gap-2" />}>
            <Download className="h-4 w-4" /> Download
          </Button>
          {/* TODO(Task 8+): wire report dialog */}
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <Flag className="h-4 w-4" /> Report
          </Button>
        </div>
      </div>
      <PdfViewer fileUrl={data.fileUrl} />
    </div>
  );
}
