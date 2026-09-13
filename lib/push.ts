import webpush, { type PushSubscription } from "web-push";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface SubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) {
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Faltan las claves VAPID: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y VAPID_SUBJECT.",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

async function deliver(
  rows: SubscriptionRow[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (rows.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const supabase = createAdminSupabaseClient();
  const expiredEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    rows.map(async (row) => {
      const subscription: PushSubscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      };

      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(row.endpoint);
        }
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return { sent, failed };
}

export async function sendPushToAll(payload: PushPayload) {
  ensureVapidConfigured();

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (error) {
    throw new Error(error.message);
  }

  return deliver(data ?? [], payload);
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureVapidConfigured();

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return deliver(data ?? [], payload);
}
