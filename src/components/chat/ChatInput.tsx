import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  return (
    <div className="border-t border-border bg-card p-2 sm:p-4 transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto flex items-end gap-1.5 sm:gap-2">
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
          disabled={!input.trim() || disabled}
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
  );
};

export default ChatInput;
