import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Iniciar sesión
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Accede a tu panel de gestión de impresoras 3D.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-brand hover:underline dark:text-sky-300"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
