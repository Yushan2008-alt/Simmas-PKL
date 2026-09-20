"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticateUser } from "@/lib/supabase/services";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@simmas.sch.id",
      label: "Administrator Sekolah",
    },
    {
      role: "Guru",
      email: "guru@simmas.sch.id",
      label: "Guru Pembimbing",
    },
    {
      role: "Siswa",
      email: "siswa@simmas.sch.id",
      label: "Siswa Magang",
    },
  ];

  const handleSelectDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword("smk12345");
    setSelectedDemoRole(demo.role);
    toast.success(`Akun demo ${demo.role} dipilih`, {
      description: `Email otomatis diisi: ${demo.email}`,
      duration: 3000,
    });
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email sekolah wajib diisi", {
        description: "Silakan masukkan email Anda atau pilih salah satu akun demo.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authenticateUser(email, password);

      if (!res.success) {
        toast.error("Gagal Masuk", {
          description: res.error || "Email atau password yang Anda masukkan tidak sesuai.",
        });
        setIsLoading(false);
        return;
      }

      const roleLabel =
        res.user?.role === "Admin"
          ? "Administrator"
          : res.user?.role === "Guru"
          ? "Guru Pembimbing"
          : "Siswa Magang";

      toast.success(`Login Berhasil sebagai ${roleLabel}`, {
        description: `Selamat datang kembali, ${res.user?.name || "Pengguna"}!`,
      });

      if (res.user?.role === "Admin") {
        router.push("/admin/dashboard");
      } else if (res.user?.role === "Guru") {
        router.push("/guru/dashboard");
      } else {
        router.push("/siswa/dashboard");
      }
    } catch (err) {
      toast.error("Terjadi Kesalahan", {
        description: "Gagal memproses autentikasi. Silakan coba beberapa saat lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col justify-center bg-background px-6 sm:px-12 lg:px-14 xl:px-20 py-12">
      <div className="mx-auto w-full max-w-[380px]">
        {/* Mobile Header Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 mb-10 lg:hidden group"
        >
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm h-9 w-9 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SIMMAS
          </span>
        </Link>

        {/* Form Title & Subtitle */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3">
            Portal Masuk
          </p>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-2">
            Masuk ke
            <br />
            <span className="text-primary">akun Anda.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gunakan email sekolah dan password yang diberikan oleh admin sekolah Anda.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground block"
            >
              Email Sekolah
            </label>
            <Input
              id="email"
              type="email"
              placeholder="nama@sekolah.sch.id"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedDemoRole(null);
              }}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Lupa Password?", {
                    description: "Silakan hubungi Administrator Sekolah untuk mereset kata sandi Anda.",
                  })
                }
                className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary hover:text-primary/70 transition-colors"
              >
                Lupa?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            id="btn-login-submit"
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full h-12 text-sm font-bold tracking-wide mt-3 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="mt-9 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
              Akun Demo
            </p>
            <span className="text-[10px] text-muted-foreground font-medium">
              Auto-fill 1-klik
            </span>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((demo) => {
              const isSelected = selectedDemoRole === demo.role;
              return (
                <button
                  id={`btn-demo-${demo.role.toLowerCase()}`}
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all group text-left ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-muted/30 hover:bg-muted hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="text-xs font-mono text-foreground font-medium">
                      {demo.email}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-0.5 rounded transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary bg-background border border-border"
                    }`}
                  >
                    {demo.role}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground mt-3.5 leading-relaxed">
            Klik salah satu akun demo di atas untuk mengisi email secara otomatis.
          </p>
        </div>
      </div>
    </main>
  );
}
