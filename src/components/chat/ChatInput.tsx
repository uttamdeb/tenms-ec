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
    <div className="border-t border-border bg-card p-4 transition-all duration-300 ease-in-out animate-in fade-in">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about data... (Shift+Enter for new line)"
          disabled={disabled}
          className="resize-none min-h-[44px] max-h-[150px] transition-all duration-300 ease-out focus:ring-2 focus:ring-primary/50 focus:scale-[1.01] hover:bg-muted/50"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="shrink-0 h-11 w-11 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <Send className="h-4 w-4 transition-transform duration-200" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2 animate-in fade-in duration-500">
        Data Agent can make mistakes. Please verify important information.
      </p>
    </div>
  );
};

export default ChatInput;
