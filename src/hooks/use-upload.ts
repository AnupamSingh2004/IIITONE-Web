"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface UploadInput {
  file: File;
  title: string;
  type: "notes" | "pyq" | "assignment";
  courseId: string | null;
  courseName: string;
  branch: string;
  year: number;
  semester: number;
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadInput) => {
      const form = new FormData();
      form.append("file", input.file);
      form.append("title", input.title);
      form.append("type", input.type);
      if (input.courseId) form.append("course_id", input.courseId);
      else {
        form.append("course_name", input.courseName);
        form.append("branch", input.branch);
        form.append("year", String(input.year));
        form.append("semester", String(input.semester));
      }
      return apiFetch<{ id: string }>("/api/materials", { method: "POST", body: form });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
