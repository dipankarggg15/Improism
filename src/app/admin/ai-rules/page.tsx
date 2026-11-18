import type { Metadata } from "next";
import { AIRulesBook, type BrainPrinciple } from "@/components/admin/brain-book";
import { requireAdmin } from "@/lib/admin/auth";
import { sanitizeRichText } from "@/lib/admin/validation";

export const metadata: Metadata = {
  title: "AI Rules | Admin CMS",
};

export const instant = false;

type RuleRow = {
  id: string;
  rule_number: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default async function AIRulesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("ai_rules")
    .select("id, rule_number, title, content, created_at, updated_at")
    .order("rule_number", { ascending: true });

  if (error) throw new Error(`Could not load AI Rules: ${error.message}`);

  const rules: BrainPrinciple[] = ((data ?? []) as RuleRow[]).map((rule) => ({
    id: rule.id,
    principleNumber: rule.rule_number,
    title: rule.title,
    content: sanitizeRichText(rule.content),
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
  }));

  const notice = query.saved === "1"
    ? "AI rule saved successfully."
    : query.deleted === "1"
      ? "AI rule deleted."
      : undefined;

  return <AIRulesBook rules={rules} notice={notice} />;
}
