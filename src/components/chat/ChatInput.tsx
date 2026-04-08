import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, attachmentUrl?: string) => void;
  disabled?: boolean;
  userId?: string | null;
}

const ChatInput = ({ onSend, disabled, userId }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!userId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from("chat-images").upload(filePath, file);

    if (error) {
      console.error("Failed to upload attachment:", error);
      toast.error("Failed to upload image");
      removeAttachment();
      return;
    }

    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(filePath);
    setUploadedUrl(urlData.publicUrl);
    setIsUploading(false);
  }, [userId]);

  const handleSend = () => {
    if (!input.trim() || disabled || isUploading) return;
    onSend(input.trim(), uploadedUrl || undefined);
    setInput("");
    removeAttachment();
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
    uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setUploadedUrl(null);
    setIsUploading(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  return (
    <div className="px-3 pb-3 pt-2 sm:px-6 sm:pb-6 sm:pt-3 transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-5xl">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col rounded-[1.75rem] px-3 py-3 sm:px-4
            bg-[hsl(var(--surface-container-high))]/60
            shadow-[0_40px_80px_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.10)]
            backdrop-blur-2xl
            transition-all duration-300
            focus-within:shadow-[0_40px_80px_rgba(255,255,255,0.07),inset_0_0_0_1.5px_hsl(var(--primary)/0.45)]
            ${isDragOver ? "bg-primary/10 shadow-[0_40px_80px_rgba(255,255,255,0.08),inset_0_0_0_1.5px_hsl(var(--primary)/0.6)]" : ""}`}
        >
          {/* Image preview inside input area */}
          {preview && (
            <div className="mb-2 inline-flex items-start">
              <div className="relative inline-block rounded-xl bg-card p-1.5">
                <img src={preview} alt="Attachment preview" className="h-16 w-16 rounded-lg object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
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
          <div className="flex items-end gap-2">
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
              disabled={disabled || !!preview}
              className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={preview ? "Add a message to send with the image..." : "Ask about your data..."}
              disabled={disabled}
              className="min-h-[40px] max-h-[150px] resize-none border-0 bg-transparent px-0 text-sm text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || disabled || isUploading}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-full shadow-[0_8px_24px_rgba(251,191,36,0.25)] transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(251,191,36,0.4)]"
            >
              <Send className="h-4 w-4 transition-transform duration-200" />
            </Button>
          </div>
        </div>
        <div className="mt-3 hidden items-center justify-between sm:flex">
          <p className="label-tech text-muted-foreground/60">
            10MS Data Agent — <span className="font-semibold tracking-widest">Research Preview v0.8</span>
          </p>
          <p className="label-tech text-muted-foreground/60">10MS Data Agent can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
