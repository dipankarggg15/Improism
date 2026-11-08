import { notFound } from "next/navigation";
import { PageHeading } from "@/components/admin/page-heading";
import { SubjectForm } from "@/components/admin/subject-form";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function EditSubjectPage({ params }: PageProps<"/admin/subjects/[id]/edit">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: subject } = await supabase.from("subjects").select("id, name, description, is_active, image_url").eq("id", id).single();
  if (!subject) notFound();
  return <><PageHeading eyebrow="Subjects" title="Edit subject" description="Update how this subject appears and whether users can select it." /><SubjectForm initial={subject} /></>;
}
