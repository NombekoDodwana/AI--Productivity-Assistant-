import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown, { type Components } from "react-markdown";
import {
  ArrowUp,
  CalendarCheck,
  CircleAlert,
  Wrench,
} from "lucide-react";

const SUGGESTIONS = [
  "My laptop screen is cracked",
  "My hard drive is making a clicking noise",
  "My PC suddenly won't power on",
];

const markdownComponents: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="ml-4 list-disc space-y-1 leading-relaxed">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="ml-4 list-decimal space-y-1 leading-relaxed">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-accent-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="scrollbar-slim mt-2 overflow-x-auto rounded-lg border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  ),
};

type BookingRecord = {
  reference: string;
  full_name: string;
  email: string;
  phone: string;
  component: string;
  issue_description: string;
  category: string;
  consultant: string;
  consultant_title: string;
  status: string;
  created_at: string;
};

type BookingResult =
  | { ok: true; booking: BookingRecord }
  | { ok: false; error: string };

type AnyPart = {
  type: string;
  text?: string;
  state?: string;
  input?: Record<string, unknown>;
  output?: unknown;
};

function ToolActivity({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex gap-1">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      {label}
    </div>
  );
}

function BookingCard({ part }: { part: AnyPart }) {
  if (part.state === "output-error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <CircleAlert className="h-4 w-4 shrink-0" />
        Something went wrong while saving the booking.
      </div>
    );
  }

  if (part.state !== "output-available" || !part.output) {
    return <ToolActivity label="Saving booking…" />;
  }

  const result = part.output as BookingResult;

  if (!result.ok) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  const b = result.booking;
  return (
    <div className="animate-rise rounded-xl border border-success/40 bg-success/10 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-success">
        <CalendarCheck className="h-4 w-4" />
        Booking saved — reference {b.reference}
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Contact</dt>
        <dd className="truncate text-foreground">
          {b.email} · {b.phone}
        </dd>
        <dt className="text-muted-foreground">Component</dt>
        <dd className="text-foreground">{b.component}</dd>
        <dt className="text-muted-foreground">Assigned to</dt>
        <dd className="font-medium text-primary">
          {b.consultant}{" "}
          <span className="font-normal text-muted-foreground">
            ({b.consultant_title})
          </span>
        </dd>
      </dl>
    </div>
  );
}

function MessagePart({ part }: { part: AnyPart }) {
  if (part.type === "text" && part.text) {
    return (
      <div className="space-y-2 text-sm">
        <ReactMarkdown components={markdownComponents}>
          {part.text}
        </ReactMarkdown>
      </div>
    );
  }

  if (part.type.startsWith("tool-")) {
    return <BookingCard part={part} />;
  }

  return null;
}

export function BookingChat() {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, error]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <section
      aria-label="Booking assistant chat"
      className="flex h-full min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/30"
    >
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Wrench className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Booking Assistant
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Online — replies instantly
            </p>
          </div>
        </div>
        {busy && (
          <button
            onClick={stop}
            className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Stop
          </button>
        )}
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-slim flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6"
      >
        {messages.length === 0 && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-8 text-center">
            <div className="rounded-full border border-border bg-muted p-3">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base font-medium text-foreground">
              Hi, I'm the NOMBEKO-S-LEGACY repair assistant.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tell me what's gone wrong with your hardware and I'll collect a
              few details, then assign the right specialist for your repair.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex flex-col gap-2"
            }
          >
            <div
              className={
                message.role === "user"
                  ? "animate-rise max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                  : "animate-rise max-w-[92%] space-y-3 rounded-2xl rounded-bl-sm border border-border bg-muted/60 px-4 py-3 text-foreground"
              }
            >
              {message.parts.map((part, i) => (
                <MessagePart key={i} part={part as unknown as AnyPart} />
              ))}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-muted/60 px-4 py-3">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {error.message}
            </span>
            <button
              onClick={() => regenerate()}
              className="shrink-0 underline underline-offset-4 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <footer className="border-t border-border px-5 py-4">
        {messages.length === 0 && !busy && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Describe your hardware issue…"
            aria-label="Message the booking assistant"
            className="scrollbar-slim max-h-32 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </footer>
    </section>
  );
}
