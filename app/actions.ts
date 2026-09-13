"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendPushToAll, type PushSubscriptionInput } from "@/lib/push";

export async function subscribeUser(subscription: PushSubscriptionInput) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
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
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function sendNotification(message: string) {
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
