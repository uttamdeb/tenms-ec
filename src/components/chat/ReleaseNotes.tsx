import { useState, useEffect, useCallback, useRef } from "react";
import { Megaphone, Pencil, Save, X, Bold, Italic, Heading1, Heading2, List, ListOrdered, Code, Minus, Quote } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_BUCKET = "chat-images";
const NOTES_PATH = "system/release-notes.md";

const DEFAULT_NOTES = `# EC Data Agent — Release Notes

---

## v0.8 — April 5, 2026

### New Features
- **Gallery Panel** — View all charts and tables generated across sessions in one place. Resizable on desktop, fullscreen on mobile.
- **Drag & Drop Image Upload** — Drag images directly into the chat input. Images upload instantly in the background.
- **Image Preview in Chat** — Attached images now display inline within user messages.
- **Chart Copy** — Copy any chart as a PNG image to clipboard with one click.
- **Session Rename** — Rename chat sessions from the three-dot menu in the sidebar.
- **Query Guide** — A built-in guide with tips on how to ask effective questions. Editable by BI users.
- **Release Notes** — You're reading them! Also editable by BI users.

### Improvements
- **Send requires text** — Messages with only an image can no longer be sent without accompanying text.
- **Eager image upload** — Images are uploaded to storage immediately on selection, not when the message is sent — making send near-instant.
- **Gallery loads all sessions** — The gallery panel now shows charts and tables from all sessions, not just the current one. Infinite scroll for lazy loading.
- **Table actions in Gallery** — Tables in the gallery now have copy and download (xlsx) buttons.

### Fixes
- Fixed sidebar session list overflow clipping the three-dot menu button.
- Fixed mobile gallery not supporting touch scrolling.

---

## v0.7 — March 31, 2026

### Features
- **Tenergy System** — Daily character usage tracking with 100K limit per day. BI users get unlimited access.
- **Chat Feedback** — Like/dislike assistant responses with optional notes for dislike.
- **SQL Run Tracking** — BigQuery SQL queries and results are saved per message. BI users can view them via the code/database icons.
- **Profile System** — User profiles with avatar upload, name, and role.

### Improvements
- Thinking indicator shows elapsed seconds and rotating context-aware notes.
- Session soft-delete (status: deleted) instead of hard delete.

---

## v0.6 — March 18, 2026

### Features
- **Image Attachments** — Upload images in chat to share screenshots with the agent.
- **Chat Message Feedback** — Thumbs up/down with dislike notes.

---

## v0.5 — March 17, 2026

### Features
- **Agent SQL Runs** — View the BigQuery SQL the agent executed and the raw results.
- **Profile Avatars** — Upload and display user avatars.
- **Suggested Messages** — Random suggested prompts on the empty chat screen.

---

## v0.4 — March 12, 2026

### Features
- **Multi-session Chat** — Create, switch, and manage multiple chat sessions.
- **Markdown Rendering** — Full markdown support in assistant responses including tables, code blocks, and charts.
- **Chart Rendering** — Bar, line, and pie charts rendered from agent responses with download support.

---

## v0.3 — March 8, 2026

### Features
- **Chat Interface** — Real-time chat with the EC Data Agent via n8n webhook proxy.
- **Authentication** — Email/password login with Supabase Auth.
- **Edge Function Proxy** — Secure webhook relay through Supabase Edge Functions.

---

## v0.2 — March 5, 2026

### Initial Release
- Basic chat with the EC Data Agent.
- Profile creation on signup.
- Session persistence in Supabase.
`;

interface ReleaseNotesProps {
  isBIUser: boolean;
}

const ReleaseNotes = ({ isBIUser }: ReleaseNotesProps) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const loaded = useRef(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(NOTES_PATH);
        if (!error && data) {
          const text = await data.text();
          if (text.trim()) setNotes(text);
        }
      } catch { /* use default */ }
    };
    load();
  }, []);

  const handleEdit = () => {
    setDraft(notes);
    setEditing(true);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const blob = new Blob([draft], { type: "text/markdown" });
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(NOTES_PATH, blob, { upsert: true });
      if (error) throw error;
      setNotes(draft);
      setEditing(false);
      toast.success("Release notes saved");
    } catch (err) {
      console.error("Failed to save release notes:", err);
      toast.error("Failed to save release notes");
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
        className="surface-card flex w-full items-center gap-3 rounded-[1.5rem] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 text-left">
          <h3 className="headline-agent text-lg sm:text-xl">Release Notes</h3>
          <p className="mt-1 text-sm text-[hsl(var(--on-surface-variant))]">See what's new in EC Data Agent.</p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel max-h-[85vh] border-0 sm:max-w-2xl p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="headline-agent text-2xl">Release Notes</DialogTitle>
                <DialogDescription className="mt-1">What's new in EC Data Agent</DialogDescription>
              </div>
              {isBIUser && !editing && (
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>

          {editing ? (
            <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
              <FormatToolbar textareaRef={editorRef} draft={draft} setDraft={setDraft} />
              <Textarea
                ref={editorRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[50vh] flex-1 resize-none rounded-xl border-border/60 bg-background/60 font-mono text-sm"
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="mr-1 h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[65vh] px-6 pb-6">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-2 prose-h3:text-base prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-3 prose-hr:my-4 prose-hr:border-border prose-strong:text-foreground prose-em:text-foreground/90 prose-code:rounded prose-code:bg-background/70 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
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

export default ReleaseNotes;
