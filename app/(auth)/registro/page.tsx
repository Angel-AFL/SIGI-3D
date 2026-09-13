import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Crear cuenta
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Empieza a gestionar tu inventario, pedidos y producción.
        </p>
      </header>

      <SignupForm />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-brand hover:underline dark:text-sky-300"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
