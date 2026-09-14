import type { Metadata } from "next";
import { ViewerView } from "@/components/viewer/viewer-view";
import { requireUser } from "@/lib/auth";
import { getModels } from "@/lib/models";

export const metadata: Metadata = {
  title: "Visor 3D",
};

export default async function ModelosPage() {
  const user = await requireUser();
  const models = await getModels();

  const stats = {
    total: models.length,
    recentViews: models.filter((model) => model.lastViewedAt !== null).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Visor 3D
      </h1>

      <ViewerView
        models={models}
        userId={user.id}
        ownerEmail={user.email ?? ""}
        stats={stats}
      />
    </div>
  );
}
