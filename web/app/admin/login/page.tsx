import { VaultDial } from "@/components/ui/VaultDial";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <VaultDial className="h-9 w-9 text-brass-500" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100">
          Admin Console
        </h1>
        <p className="text-sm text-ink-400">Authorized personnel only.</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-graphite-700 bg-graphite-800/60 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <LoginForm />
      </div>
    </main>
  );
}
