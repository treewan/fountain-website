// TEMP debug endpoint — reports whether the dealflow webhook env vars are
// visible to the runtime, without leaking their values. Delete once
// the integration is confirmed working.
export default function handler(req, res) {
  const url = process.env.DEALFLOW_WEBHOOK_URL || "";
  const secret = process.env.DEALFLOW_WEBHOOK_SECRET || "";
  res.status(200).json({
    DEALFLOW_WEBHOOK_URL: {
      present: url.length > 0,
      length: url.length,
      prefix: url.slice(0, 30),
    },
    DEALFLOW_WEBHOOK_SECRET: {
      present: secret.length > 0,
      length: secret.length,
      // First 4 chars only — enough to confirm it's the right secret
      // without fully exposing it.
      prefix: secret.slice(0, 4),
    },
    RESEND_API_KEY_present: Boolean(process.env.RESEND_API_KEY),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
  });
}
