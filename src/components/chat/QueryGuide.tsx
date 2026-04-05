import { useState, useEffect, useCallback, useRef } from "react";
import { BookOpen, Pencil, Save, X, Bold, Italic, Heading1, Heading2, List, ListOrdered, Code, Minus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mirror } from "@/integrations/supabase/mirrorClient";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DOC_KEY = "query-guide";

const DEFAULT_GUIDE = `# How to Ask Questions Effectively

Getting the best results from EC Data Agent starts with asking the right questions. Follow these guidelines:

---

## 1. Be Specific About What You Want

**Good:** "Show branch-wise admissions for March 2026"
**Bad:** "Show admissions"

Always include:
- **Metric:** registrations, attendance, admissions, RTA, ATA, revenue, walk-ins, etc.
- **Time range:** today, yesterday, last 7 days, this month, March 2026, Jan 1 - Mar 30, etc.
- **Scope:** all branches, Uttara branch, all programmes, IELTS only, etc.

---

## 2. One Question at a Time

Ask for one data point per message. The agent works best with focused questions.

**Good:** "What is the ATA for Uttara branch this month?"
**Not ideal:** "What is the ATA and RTA for all branches this month and compare with last month and also show revenue?"

If you need multiple metrics, ask them in separate messages within the same session.

---

## 3. Specify the Date Clearly

The agent understands natural language dates, but being explicit avoids confusion.

- **"today"** and **"yesterday"** are understood in Dhaka time (BST).
- Use **"this month"**, **"last 7 days"**, **"March 2026"**, or explicit ranges like **"Feb 1 - Feb 28, 2026"**.
- Avoid vague terms like "recently" or "sometime back."

---

## 4. Name People and Branches Correctly

When asking about a specific person (ADO, BM, FDO), use their **full name** as it appears in the system.

**Good:** "Show admissions by Raheta Sadeka this month"
**Bad:** "Show admissions by Raheta"

For branches, use the full name: **Uttara Branch**, **Panthapath Branch**, **Mirpur Branch**, **Moghbazar Branch**, **Chawkbazar Branch**.

---

## 5. Ask for Charts When You Need Visual Clarity

The agent can generate bar charts, line charts, and pie charts. Just ask:

- "Show branch-wise regs for today in a **bar chart**"
- "Show RTA trend for last 7 days in a **line chart**"
- "Show payment method distribution as a **pie chart**"

---

## 6. Use Follow-Up Questions

The agent remembers the current conversation. You can build on previous answers:

1. "Show today's admissions by branch"
2. "Break that down by programme"
3. "Which ADO contributed most in Uttara?"

---

## 7. Ask for Analysis, Not Just Numbers

The agent can go beyond raw data:

- "Which branch improved most this week?"
- "Do a deep analysis of Uttara branch performance in 2026"
- "Which lead source gives the best ATA?"
- "What should Uttara branch focus on today?"

---

## 8. Validate Data When It Matters

If a number looks off, ask the agent to cross-check:

- "Is this data right? Cross-check with the transactions table"
- "Validate this against yesterday's Metabase dashboard"

---

## 9. What the Agent Cannot Do

- It cannot modify any data — it is read-only.
- It cannot access data outside the EC BigQuery datasets.
- It cannot remember conversations from previous sessions.
- It may occasionally return approximate numbers — always verify critical decisions.

---

## 10. Example Questions to Get Started

| Category | Example Question |
|---|---|
| Registrations | "Show today's registrations by branch" |
| Attendance | "Show IELTS attendance this month" |
| Admissions | "Top 5 ADOs by admissions this month" |
| Revenue | "Payment method-wise collection this month" |
| RTA/ATA | "Which branch has the best ATA trend?" |
| Walk-ins | "Show walk-in count for February by branch" |
| Comparison | "Compare today vs yesterday registrations" |
| Deep Analysis | "Conduct a deep analysis of branch performance in 2026" |
| Person-specific | "Do a deep dive on Raheta Sadeka's last 6 months" |
`;

interface QueryGuideProps {
  isBIUser: boolean;
}

const QueryGuide = ({ isBIUser }: QueryGuideProps) => {
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(DEFAULT_GUIDE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const loaded = useRef(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Load guide from storage on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const load = async () => {
      try {
        if (!mirror) return;
        const { data } = await mirror.from("app_documents").select("content").eq("key", DOC_KEY).single();
        if (data?.content) setGuide(data.content);
      } catch { /* use default */ }
    };
    load();
  }, []);

  const handleEdit = () => {
    setDraft(guide);
    setEditing(true);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (!mirror) throw new Error("Mirror not configured");
      const { error } = await mirror.from("app_documents").upsert(
        { key: DOC_KEY, content: draft, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      if (error) throw error;

      setGuide(draft);
      setEditing(false);
      toast.success("Guide saved");
    } catch (err) {
      console.error("Failed to save guide:", err);
      toast.error("Failed to save guide");
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const handleCancel = () => {
    setDraft("");
    setEditing(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass-hover surface-card group flex w-full flex-col rounded-[1.5rem] p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_hsl(var(--primary)/0.08)] sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="label-tech">GUIDE</span>
        </div>
        <h3 className="headline-agent text-lg sm:text-xl">How to Ask Questions</h3>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--on-surface-variant))]">Tips, examples, and best practices to get accurate answers from the Data Agent.</p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel max-h-[90vh] border-0 shadow-[0_0_40px_hsl(var(--on-surface)/0.06)] sm:max-w-3xl p-0 gap-0 rounded-[1.75rem]">
          <DialogHeader className="px-8 pt-8 pb-4 sm:px-10 sm:pt-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="label-tech">DOCUMENTATION</p>
                <DialogTitle className="headline-agent text-2xl sm:text-3xl">Query Guide</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-[hsl(var(--on-surface-variant))]">
                  Best practices for getting accurate, useful answers from EC Data Agent.
                </DialogDescription>
              </div>
              {isBIUser && !editing && (
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-full" onClick={handleEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>

          {editing ? (
            <div className="flex flex-1 flex-col overflow-hidden px-8 pb-8 sm:px-10">
              <FormatToolbar textareaRef={editorRef} draft={draft} setDraft={setDraft} />
              <Textarea
                ref={editorRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[50vh] flex-1 resize-none rounded-xl border-border/60 bg-background/60 font-mono text-sm leading-relaxed"
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleCancel} disabled={saving}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" className="rounded-full" onClick={handleSave} disabled={saving}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="px-8 pb-10 sm:px-10">
                <div className="prose dark:prose-invert max-w-none text-[0.9rem] leading-[1.8] text-[hsl(var(--on-surface-variant))] prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-lg prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:my-4 prose-p:leading-[1.8] prose-ul:my-4 prose-ul:space-y-2 prose-ol:my-4 prose-ol:space-y-2 prose-li:leading-[1.7] prose-table:my-6 prose-th:text-left prose-th:text-foreground prose-th:pb-3 prose-td:py-2.5 prose-td:pr-4 prose-hr:my-8 prose-hr:border-border/40 prose-strong:text-foreground prose-em:text-foreground/80 prose-code:rounded-md prose-code:bg-background/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:text-primary/90 prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:text-[hsl(var(--on-surface-variant))] prose-blockquote:italic prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide}</ReactMarkdown>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FormatToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  draft: string;
  setDraft: (value: string) => void;
}

function FormatToolbar({ textareaRef, draft, setDraft }: FormatToolbarProps) {
  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = draft.slice(start, end);
    const replacement = `${before}${selected || "text"}${after}`;
    const next = draft.slice(0, start) + replacement + draft.slice(end);
    setDraft(next);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + (selected || "text").length;
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = draft.lastIndexOf("\n", start - 1) + 1;
    const next = draft.slice(0, lineStart) + prefix + draft.slice(lineStart);
    setDraft(next);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    }, 0);
  };

  const actions: { icon: React.ReactNode; label: string; action: () => void }[] = [
    { icon: <Heading1 className="h-4 w-4" />, label: "Heading 1", action: () => insertLinePrefix("# ") },
    { icon: <Heading2 className="h-4 w-4" />, label: "Heading 2", action: () => insertLinePrefix("## ") },
    { icon: <Bold className="h-4 w-4" />, label: "Bold", action: () => wrapSelection("**", "**") },
    { icon: <Italic className="h-4 w-4" />, label: "Italic", action: () => wrapSelection("*", "*") },
    { icon: <Code className="h-4 w-4" />, label: "Inline code", action: () => wrapSelection("`", "`") },
    { icon: <List className="h-4 w-4" />, label: "Bullet list", action: () => insertLinePrefix("- ") },
    { icon: <ListOrdered className="h-4 w-4" />, label: "Numbered list", action: () => insertLinePrefix("1. ") },
    { icon: <Quote className="h-4 w-4" />, label: "Blockquote", action: () => insertLinePrefix("> ") },
    { icon: <Minus className="h-4 w-4" />, label: "Horizontal rule", action: () => insertLinePrefix("\n---\n") },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-lg border border-border/40 bg-background/40 px-1 py-1">
        {actions.map((a, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={a.action}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={a.label}
                title={a.label}
              >
                {a.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{a.label}</TooltipContent>
          </Tooltip>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <span className="px-1 text-[0.625rem] text-muted-foreground/60">Markdown supported</span>
      </div>
    </TooltipProvider>
  );
}

export default QueryGuide;
