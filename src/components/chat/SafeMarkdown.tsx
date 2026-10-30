"use client";

import React from "react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";

const ALLOWED_HOSTS = ["greedyadventures.com", "www.greedyadventures.com"];

function SafeLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <span>{children}</span>;

  // Allow internal page jumps and relative links
  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <a
        href={href}
        className="font-medium text-brand-teal underline underline-offset-2 hover:text-brand-teal/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal rounded"
        {...props}
      >
        {children}
      </a>
    );
  }

  try {
    const url = new URL(href);
    if (ALLOWED_HOSTS.includes(url.hostname)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-teal underline underline-offset-2 hover:text-brand-teal/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal rounded"
          {...props}
        >
          {children}
        </a>
      );
    }
  } catch {
    // Malformed URL, fall through
  }

  // If host is not allowlisted, render as plain safe text
  return <span className="font-medium text-slate-700">{children}</span>;
}

export function SafeMarkdown() {
  return (
    <MarkdownTextPrimitive
      className="text-sm text-slate-800 leading-relaxed space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:leading-relaxed"
      components={{
        a: SafeLink,
      }}
    />
  );
}
