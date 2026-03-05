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
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about data... (Shift+Enter for new line)"
          disabled={disabled}
          className="resize-none min-h-[44px] max-h-[150px]"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="shrink-0 h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Data Agent can make mistakes. Please verify important information.
      </p>
    </div>
  );
};

export default ChatInput;
