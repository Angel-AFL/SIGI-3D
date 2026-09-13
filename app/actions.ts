"use server";

import { getUser } from "@/lib/auth";
import { sendPushToAll, type PushSubscriptionInput } from "@/lib/push";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function subscribeUser(subscription: PushSubscriptionInput) {
  const user = await getUser();

  if (!user) {
    return { success: false as const, error: "No autenticado" };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: subscription.userAgent ?? null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function unsubscribeUser(endpoint: string) {
  const user = await getUser();

  if (!user) {
    return { success: false as const, error: "No autenticado" };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function sendNotification(message: string) {
  const user = await getUser();

  if (!user) {
    return { success: false as const, error: "No autenticado" };
  }

  try {
    const result = await sendPushToAll({ title: "SIGI 3D", body: message });
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
