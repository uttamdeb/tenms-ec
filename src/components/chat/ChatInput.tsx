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
    <div className="border-t border-border bg-card p-2 sm:p-4 transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto">
        {/* Image preview */}
        {preview && (
          <div className="mb-2 relative inline-block">
            <img
              src={preview}
              alt="Attachment preview"
              className="h-20 w-20 object-cover rounded-lg border border-border"
            />
            <button
              onClick={removeAttachment}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:scale-110 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !!attachment}
            className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 text-muted-foreground hover:text-foreground transition-colors"
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
            className="resize-none min-h-[40px] sm:min-h-[44px] max-h-[120px] sm:max-h-[150px] text-sm transition-all duration-300 ease-out focus:ring-2 focus:ring-primary/50"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || disabled}
            size="icon"
            className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4 transition-transform duration-200" />
          </Button>
        </div>
        <p className="hidden sm:block text-center text-xs text-muted-foreground mt-2">
          Data Agent can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
