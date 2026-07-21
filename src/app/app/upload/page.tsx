"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCombobox, type CourseSelection } from "@/components/materials/CourseCombobox";
import { useCourses } from "@/hooks/use-materials";
import { useUploadMaterial } from "@/hooks/use-upload";
import { useSession } from "@/hooks/use-session";

export default function UploadPage() {
  const { user } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"notes" | "pyq" | "assignment">("notes");
  const [semester, setSemester] = useState(1);
  const [course, setCourse] = useState<CourseSelection | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const { data: courses = [] } = useCourses(user?.branch, user?.year, semester);
  const upload = useUploadMaterial();

  const canSubmit = file && title && course?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !course || !user?.branch || !user?.year) return;
    try {
      const result = await upload.mutateAsync({
        file,
        title,
        type,
        courseId: course.id,
        courseName: course.name,
        branch: user.branch,
        year: user.year,
        semester,
      });
      toast("Uploaded — pending admin review");
      router.push(`/app/materials/${result.id}`);
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload material</h1>
        <p className="text-muted-foreground">Share notes, PYQs, or assignments with your batch.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label
          htmlFor="file-input"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) setFile(dropped);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
          }`}
        >
          <UploadCloud className={`h-8 w-8 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-sm font-medium">
            {file ? file.name : "Drag & drop a PDF here, or click to choose"}
          </span>
          <span className="text-xs text-muted-foreground">PDF only</span>
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 3 - Deadlock Handling"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="pyq">PYQ</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={String(semester)} onValueChange={(v) => v && setSemester(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Course</Label>
          <CourseCombobox courses={courses} value={course} onChange={setCourse} />
        </div>

        <Button type="submit" className="w-full" disabled={!canSubmit || upload.isPending}>
          {upload.isPending ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
