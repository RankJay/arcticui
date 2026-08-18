"use client";

import { Check, ChevronDown, Copy, ExternalLink, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PageActionsProps {
  title: string;
  markdownUrl: string;
  markdownContent: string;
}

export function PageActions({ title, markdownUrl, markdownContent }: PageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(
    `Here is the documentation for ${title}:\n\n${markdownContent}`,
  )}`;

  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(
    `Here is the documentation for ${title}:\n\n${markdownContent}`,
  )}`;

  return (
    <div className="not-prose my-3 flex items-center gap-2">
      {/* 1. Copy Markdown Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-green-500" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="text-muted-foreground size-3.5" />
            <span>Copy Markdown</span>
          </>
        )}
      </button>

      {/* 2. Dropdown Menu for Open In / View as Markdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <span>Open</span>
          <ChevronDown
            className={`text-muted-foreground size-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="border-border bg-popover animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-48 origin-top-left rounded-lg border p-1 shadow-lg ring-1 ring-black/5">
            <a
              href={chatGptUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <span>Open in ChatGPT</span>
              <ExternalLink className="text-muted-foreground size-3" />
            </a>

            <a
              href={claudeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <span>Open in Claude</span>
              <ExternalLink className="text-muted-foreground size-3" />
            </a>

            <div className="border-border my-1 border-t" />

            <a
              href={markdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="text-muted-foreground size-3.5" />
                <span>View as Markdown</span>
              </div>
              <span className="text-muted-foreground font-mono text-[10px]">.md</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
