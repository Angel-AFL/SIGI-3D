import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getAvatarUrl } from "@/lib/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell email={user.email ?? ""} avatarUrl={getAvatarUrl(user)}>
      {children}
    </AppShell>
  );
}
