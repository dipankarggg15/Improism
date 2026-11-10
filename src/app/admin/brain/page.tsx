import type { Metadata } from "next";
import { BrainBook, type BrainPrinciple } from "@/components/admin/brain-book";
import { requireAdmin } from "@/lib/admin/auth";
import { sanitizeRichText } from "@/lib/admin/validation";

export const metadata: Metadata = {
  title: "Improism Brain | Admin CMS",
};

export const instant = false;

type PrincipleRow = {
  id: string;
  principle_number: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default async function BrainPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("brain_principles")
    .select("id, principle_number, title, content, created_at, updated_at")
    .order("principle_number", { ascending: true });

  if (error) throw new Error(`Could not load Improism Brain: ${error.message}`);

  const principles: BrainPrinciple[] = ((data ?? []) as PrincipleRow[]).map((principle) => ({
    id: principle.id,
    principleNumber: principle.principle_number,
    title: principle.title,
    content: sanitizeRichText(principle.content),
    createdAt: principle.created_at,
    updatedAt: principle.updated_at,
  }));

  const notice = query.saved === "1"
    ? "Principle saved successfully."
    : query.deleted === "1"
      ? "Principle deleted."
      : undefined;

  return <BrainBook principles={principles} notice={notice} />;
}
