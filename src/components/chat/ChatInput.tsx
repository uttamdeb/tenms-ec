import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string, attachment?: File) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!input.trim() && !attachment) || disabled) return;
    onSend(input.trim(), attachment || undefined);
    setInput("");
    setAttachment(null);
    setPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return; // 5MB limit
    }
    setAttachment(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  return (
    <div className="surface-panel px-3 pb-3 pt-2 sm:px-6 sm:pb-6 sm:pt-3 transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-5xl">
        {/* Image preview */}
        {preview && (
          <div className="mb-3 inline-block rounded-[1.25rem] bg-card p-2 shadow-sm">
            <div className="relative inline-block">
            <img
              src={preview}
              alt="Attachment preview"
              className="h-20 w-20 rounded-xl object-cover"
            />
            <button
              onClick={removeAttachment}
              type="button"
              aria-label="Remove attachment"
              title="Remove attachment"
              className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground transition-transform hover:scale-110"
            >
              <X className="h-3 w-3" />
            </button>
            </div>
          </div>
        )}
        <div className="surface-recessed flex items-end gap-2 rounded-[1.75rem] px-3 py-3 shadow-[inset_0_0_0_1px_hsl(var(--outline-ghost)/0.15)] transition-all duration-300 focus-within:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)] sm:px-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Upload image attachment"
            title="Upload image attachment"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !!attachment}
            className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            disabled={disabled}
            className="min-h-[40px] max-h-[150px] resize-none border-0 bg-transparent px-0 text-sm text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || disabled}
            size="icon"
            className="shrink-0 h-11 w-11"
          >
            <Send className="h-4 w-4 transition-transform duration-200" />
          </Button>
        </div>
        <div className="mt-3 hidden items-center justify-between sm:flex">
          <p className="label-tech">System status: operational</p>
          <p className="label-tech">Data Agent can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
