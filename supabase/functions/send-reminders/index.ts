// Supabase Edge Function: send-reminders
//
// Called by a pg_cron schedule every 15 minutes. For each user who has the daily
// reminder enabled, it works out whether their chosen local time has just passed
// (using their stored timezone) and, if so, sends them a push via the Expo Push
// API. A per-day "already sent" stamp prevents duplicates.
//
// Runs in Deno (not React Native) — different runtime, hence the URL imports and
// Deno.env. This file is excluded from the app's tsconfig.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Send if the user's local time is within this many minutes AFTER their reminder
// time. Slightly larger than the 15-min cron cadence so a late/jittered run can't
// skip a reminder; the per-day stamp stops it ever sending twice.
const WINDOW_MINUTES = 20;

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type Profile = {
  id: string;
  push_token: string | null;
  reminder_hour: number | null;
  reminder_minute: number | null;
  timezone: string | null;
  last_reminder_sent_on: string | null;
};

// The user's local date ("YYYY-MM-DD") and time (hour/minute) right now.
function localNow(timezone: string, now: Date) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // e.g. "2026-06-24"

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now); // e.g. "20:07"

  const [hour, minute] = time.split(':').map(Number);
  return { date, hour, minute };
}

// True if "now" (in the user's tz) is in [reminderTime, reminderTime + window),
// handling midnight wrap.
function isDue(
  localHour: number,
  localMinute: number,
  reminderHour: number,
  reminderMinute: number,
): boolean {
  const nowMin = localHour * 60 + localMinute;
  const remindMin = reminderHour * 60 + reminderMinute;
  const diff = ((nowMin - remindMin) % 1440 + 1440) % 1440;
  return diff < WINDOW_MINUTES;
}

Deno.serve(async (req) => {
  // Only the cron job may call this. We deploy with --no-verify-jwt and check our
  // own shared secret instead.
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Service-role client bypasses RLS so we can read every profile and stamp sends.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'id, push_token, reminder_hour, reminder_minute, timezone, last_reminder_sent_on',
    )
    .eq('reminder_enabled', true)
    .not('push_token', 'is', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = new Date();
  const messages: unknown[] = [];
  const sentUsers: { id: string; date: string }[] = [];

  for (const p of (profiles ?? []) as Profile[]) {
    if (
      !p.push_token ||
      p.reminder_hour == null ||
      p.reminder_minute == null
    ) {
      continue;
    }
    const tz = p.timezone ?? 'UTC';
    const { date, hour, minute } = localNow(tz, now);

    // Skip if we already sent today (in the user's own date) or it isn't due.
    if (p.last_reminder_sent_on === date) continue;
    if (!isDue(hour, minute, p.reminder_hour, p.reminder_minute)) continue;

    messages.push({
      to: p.push_token,
      title: 'Log your spending',
      body: "Add today's income and expenses to keep your ledger up to date.",
      data: { kind: 'daily-reminder' },
      channelId: 'default',
      priority: 'high',
    });
    sentUsers.push({ id: p.id, date });
  }

  if (messages.length > 0) {
    const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    // Optional hardening: if set, Expo only accepts pushes carrying this token.
    if (expoAccessToken) headers.Authorization = `Bearer ${expoAccessToken}`;

    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    // Stamp each sent user so the next cron run today skips them.
    for (const u of sentUsers) {
      await supabase
        .from('profiles')
        .update({ last_reminder_sent_on: u.date })
        .eq('id', u.id);
    }
  }

  return new Response(JSON.stringify({ sent: messages.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
