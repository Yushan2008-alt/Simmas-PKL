"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed left-0 right-0 z-50 flex w-full justify-center pointer-events-none top-4 px-4 sm:px-6 transition-all duration-300">
      <div className="w-full pointer-events-auto flex items-center justify-between max-w-6xl rounded-full border shadow-lg shadow-black/[0.03] bg-background/90 backdrop-blur-md border-border/80 py-3 px-6 transition-all">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group"
          aria-label="SIMMAS home"
        >
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm h-8 w-8 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SIMMAS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-semibold transition-all text-foreground/75 hover:text-primary"
          >
            Fitur
          </Link>
          <Link
            href="#panduan"
            className="text-sm font-semibold transition-all text-foreground/75 hover:text-primary"
          >
            Panduan
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-xs font-semibold h-9 px-4 rounded-full border border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all bg-transparent"
          >
            Masuk
          </Link>
          <Link
            href="/login"
            className="group/btn inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-9 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm hover:shadow transition-all"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md rounded-2xl border border-border shadow-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col space-y-3 pb-3 border-b border-border">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-foreground/80 hover:text-primary py-1.5"
            >
              Fitur
            </Link>
            <Link
              href="#panduan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-foreground/80 hover:text-primary py-1.5"
            >
              Panduan
            </Link>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-primary/20 text-xs font-bold text-primary hover:bg-primary/5 transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
