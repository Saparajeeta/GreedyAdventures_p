"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Menu, X, Database } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-teal/10 bg-brand-sand/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-sm"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight uppercase">
            Greedy Adventures
          </span>
          <span className="hidden md:inline-block text-xs font-semibold uppercase tracking-widest text-brand-amber bg-brand-teal/5 px-2 py-0.5 rounded">
            Pattaya
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          <a
            href="#packages"
            className="transition-colors hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded py-1 px-1"
          >
            Packages
          </a>
          <a
            href="#the-plan"
            className="transition-colors hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded py-1 px-1"
          >
            The Plan
          </a>
          <a
            href="#highlights"
            className="transition-colors hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded py-1 px-1"
          >
            Highlights
          </a>
          <a
            href="#location"
            className="transition-colors hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded py-1 px-1"
          >
            Location
          </a>
          <Link
            href="/knowledge"
            className="flex items-center gap-1.5 text-brand-accent hover:text-brand-teal font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded py-1 px-1"
          >
            <Database className="w-4 h-4" aria-hidden="true" />
            <span>Knowledge View</span>
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#chat-assistant"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-teal px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
          >
            <MessageSquare className="w-4 h-4 text-brand-amber" aria-hidden="true" />
            <span>Ask Assistant</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-teal hover:bg-brand-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="border-b border-brand-teal/10 bg-brand-sand px-4 pb-6 pt-2 md:hidden space-y-3"
        >
          <a
            href="#packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-brand-teal"
          >
            Packages & Pricing
          </a>
          <a
            href="#the-plan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-brand-teal"
          >
            The 5-Step Plan
          </a>
          <a
            href="#highlights"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-brand-teal"
          >
            Highlights & Info
          </a>
          <a
            href="#location"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-brand-teal"
          >
            Where You Jump
          </a>
          <Link
            href="/knowledge"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-base font-semibold text-brand-accent hover:text-brand-teal"
          >
            <Database className="w-5 h-5" aria-hidden="true" />
            <span>Knowledge View & Pipeline Test</span>
          </Link>
          <div className="pt-2">
            <a
              href="#chat-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand-teal px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white"
            >
              <MessageSquare className="w-4 h-4 text-brand-amber" aria-hidden="true" />
              <span>Ask Our Assistant</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
