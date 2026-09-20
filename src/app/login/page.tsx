import type { Metadata } from "next";
import { LoginBrandingPanel } from "@/components/login/login-branding-panel";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "Masuk | SIMMAS",
  description:
    "Portal masuk SIMMAS - Platform manajemen magang SMK untuk Siswa, Guru, dan Admin.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <LoginBrandingPanel />
      <LoginForm />
    </div>
  );
}
