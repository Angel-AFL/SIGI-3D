import webpush, { type PushSubscription } from "web-push";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function sendPushToAll(payload: PushPayload) {
  ensureVapidConfigured();

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const expiredEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    data.map(async (row) => {
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
