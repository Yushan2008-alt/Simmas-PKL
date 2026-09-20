import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm h-9 w-9 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                SIMMAS
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
              Sistem Informasi Manajemen Magang Siswa untuk SMK modern terpadu.
            </p>
          </div>

          {/* Produk Column */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
              Produk
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="#panduan"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Panduan
                </Link>
              </li>
              <li>
                <Link
                  href="#keamanan"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Keamanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Akses Column */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
              Akses
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Siswa
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Guru Pembimbing
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Administrator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">
              Legal
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Ketentuan Layanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} SIMMAS — Yushan-Thoriq Edition. Didesain untuk pendidikan Indonesia.
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Versi 2.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}
