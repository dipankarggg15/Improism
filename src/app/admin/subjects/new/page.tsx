import { PageHeading } from "@/components/admin/page-heading";
import { SubjectForm } from "@/components/admin/subject-form";

export const instant = false;

export default function NewSubjectPage() {
  return <><PageHeading eyebrow="Subjects" title="Create subject" description="Add a topic for organizing posts, articles, and user interests." /><SubjectForm /></>;
}
