import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessageBubble = ({ role, content }: ChatMessageBubbleProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 py-4 px-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="shrink-0 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:my-2 [&_pre]:bg-background/50 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:text-xs">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-border">
                    <Table>{children}</Table>
                  </div>
                ),
                thead: ({ children }) => <TableHeader>{children}</TableHeader>,
                tbody: ({ children }) => <TableBody>{children}</TableBody>,
                tr: ({ children }) => <TableRow>{children}</TableRow>,
                th: ({ children }) => <TableHead className="text-xs font-semibold">{children}</TableHead>,
                td: ({ children }) => <TableCell className="text-xs">{children}</TableCell>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
