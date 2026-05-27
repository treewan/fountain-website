import { Resend } from 'resend';
import crypto from 'node:crypto';

const TEAM_RECIPIENTS = [
  'tree@fountainbuild.ai',
  'miki@fountainbuild.ai',
  'apply@fountainbuild.ai',
];

// Until fountainbuild.ai is verified in Resend, send from the sandbox sender.
// After verification, set FROM_EMAIL in Vercel env to e.g. "FOUNTAIN <apply@fountainbuild.ai>"
const DEFAULT_FROM = 'FOUNTAIN <onboarding@resend.dev>';

const STAGE_LABEL = {
  idea: 'Idea',
  demo: 'Demo or prototype',
  testing: 'Early user testing',
  shipped: 'Shipped product',
  paying: 'Paying customers',
};
const FUNDING_LABEL = {
  bootstrapped: 'Bootstrapped / not yet raised',
  preseed: 'Pre-seed',
  seed: 'Seed',
  seriesa: 'Series A',
  other: 'Other',
};
const FORM_LABEL = {
  wearable: 'Wearable',
  handheld: 'Handheld or desktop device',
  robotics: 'Robotics',
  software_only: 'Software only — hardware TBD',
  other: 'Other',
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label, value) {
  const safe = value && String(value).trim() ? escapeHtml(value) : '<span style="color:#999">—</span>';
  return `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;color:#666;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;width:200px;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eee;color:#111;font-size:14px;line-height:1.6;white-space:pre-wrap">${safe}</td>
    </tr>`;
}

function sectionHeader(title) {
  return `
    <tr>
      <td colspan="2" style="padding:20px 14px 8px;color:#0050b0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;border-bottom:1px solid #0f172a">${escapeHtml(title)}</td>
    </tr>`;
}

function formLabel(d) {
  const base = FORM_LABEL[d.form] || d.form;
  return d.form === 'other' && d.form_other ? `Other — ${d.form_other}` : base;
}
function fundingLabel(d) {
  const base = FUNDING_LABEL[d.funding] || d.funding;
  return d.funding_other ? `${base} (${d.funding_other})` : base;
}
function sourceLabel(d) {
  return d.source_detail ? `${d.source} (${d.source_detail})` : d.source;
}

function buildHtml(d) {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafbfc;padding:32px 0;color:#0f172a">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e5e7ec">
      <tr>
        <td style="padding:28px 24px;border-bottom:1px solid #0f172a">
          <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0050b0;font-weight:700">🔹 New Accelerator Application</div>
          <div style="margin-top:8px;font-size:22px;font-weight:700;color:#0f172a">${escapeHtml(d.project || 'Untitled project')} — ${escapeHtml(d.name || 'Anonymous')}</div>
          <div style="margin-top:6px;font-size:13px;color:#64748b">${escapeHtml(d.oneliner || '')}</div>
        </td>
      </tr>
      <tr><td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
          ${sectionHeader('Who you are')}
          ${row('Name', d.name)}
          ${row('Email', d.email)}
          ${row('LinkedIn / Website', d.link)}
          ${row('Location', d.location)}
          ${row('Education', d.founder_education)}

          ${sectionHeader("What you're building")}
          ${row('Project name', d.project)}
          ${row('Project website', d.project_site)}
          ${row('Social (X / LinkedIn)', d.project_social)}
          ${row('One-liner', d.oneliner)}
          ${row('Target customer', d.target_customer)}
          ${row('Market size', d.market_size)}
          ${row('Competitors & differentiation', d.competitors)}
          ${row('AI / technology layer', d.ai_layer)}
          ${row('Form factor', formLabel(d))}
          ${row('Current stage', STAGE_LABEL[d.stage] || d.stage)}
          ${row('Funding stage', fundingLabel(d))}
          ${row('Pitch deck', d.deck)}
          ${row('Demo video / photo', d.demo)}

          ${sectionHeader('You and FOUNTAIN')}
          ${row('Why FOUNTAIN', d.why)}
          ${row('How did you hear', sourceLabel(d))}
          ${row('Anything else', d.extra)}
        </table>
      </td></tr>
      <tr>
        <td style="padding:20px 24px;border-top:1px solid #e5e7ec;color:#94a3b8;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
          Submitted via fountainbuild.ai/apply · ${new Date().toISOString()}
        </td>
      </tr>
    </table>
  </div>`;
}

function buildText(d) {
  const line = (k, v) => `${k}: ${v || '—'}`;
  return [
    'FOUNTAIN — New Accelerator Application',
    '═══════════════════════════════════════',
    '',
    '— Who you are —',
    line('Name', d.name),
    line('Email', d.email),
    line('LinkedIn / Website', d.link),
    line('Location', d.location),
    line('Education', d.founder_education),
    '',
    "— What you're building —",
    line('Project name', d.project),
    line('Project website', d.project_site),
    line('Social', d.project_social),
    line('One-liner', d.oneliner),
    line('Target customer', d.target_customer),
    line('Market size', d.market_size),
    line('Competitors & differentiation', d.competitors),
    line('AI / technology layer', d.ai_layer),
    line('Form factor', formLabel(d)),
    line('Current stage', STAGE_LABEL[d.stage] || d.stage),
    line('Funding stage', fundingLabel(d)),
    line('Pitch deck', d.deck),
    line('Demo', d.demo),
    '',
    '— You and FOUNTAIN —',
    'Why FOUNTAIN:',
    d.why || '—',
    '',
    line('How did you hear', sourceLabel(d)),
    '',
    'Anything else:',
    d.extra || '—',
    '',
    `— Submitted ${new Date().toISOString()} via fountainbuild.ai/apply —`,
  ].join('\n');
}

function buildConfirmationHtml(d) {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafbfc;padding:40px 0;color:#0f172a">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7ec;padding:40px 32px">
      <tr><td>
        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0050b0;font-weight:700">🔹 FOUNTAIN</div>
        <h1 style="margin:20px 0 16px;font-size:24px;font-weight:700;line-height:1.3;letter-spacing:-0.015em">Thanks, ${escapeHtml((d.name || 'founder').split(' ')[0])}. We've received your application.</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155">
          We'll respond within <strong>one week</strong> — either with an invite to a first call, or with substantive feedback.
        </p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155">
          In the meantime, if anything changes about <strong>${escapeHtml(d.project || 'your project')}</strong>, just reply to this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7ec;margin:28px 0">
        <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8">
          FOUNTAIN — Physical AI Accelerator & Ventures<br>
          Bay Area × Shenzhen · <a href="https://fountainbuild.ai" style="color:#0050b0;text-decoration:none">fountainbuild.ai</a>
        </p>
      </td></tr>
    </table>
  </div>`;
}

/**
 * Build the payload for the Fountain deal flow webhook by mapping the
 * website form's snake_case fields into the dealflow's camelCase intake
 * schema. Nationality is intentionally NOT collected on the public form
 * — the dealflow team adds it later in the project record.
 */
function buildDealflowPayload(d) {
  const stageLabel = STAGE_LABEL[d.stage] || d.stage || '';
  const fundingDetail = fundingLabel(d);

  return {
    companyName: d.project,
    founderNames: d.name,
    productDescription: d.oneliner,
    targetCustomer: d.target_customer,
    marketSize: d.market_size,
    competitorsAndDifferentiation: d.competitors,
    aiLayer: d.ai_layer,
    currentTraction: stageLabel,
    fundingStatus: fundingDetail,
    productWebsite: d.project_site,
    founderLinkedIns: d.link,
    founderEducation: d.founder_education,
    // Synced extras
    founderEmail: d.email,
    pitchDeckUrl: d.deck,
    demoUrl: d.demo,
    whyFountain: d.why,
    additionalNotes: [
      d.location ? `Location: ${d.location}` : null,
      d.project_social ? `Social: ${d.project_social}` : null,
      `Form factor: ${formLabel(d)}`,
      sourceLabel(d) ? `Heard via: ${sourceLabel(d)}` : null,
      d.extra ? `\nApplicant note:\n${d.extra}` : null,
    ]
      .filter(Boolean)
      .join('\n') || undefined,
  };
}

async function postToDealflow(payload) {
  const url = process.env.DEALFLOW_WEBHOOK_URL;
  const secret = process.env.DEALFLOW_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.warn('[apply] dealflow webhook not configured (DEALFLOW_WEBHOOK_URL / DEALFLOW_WEBHOOK_SECRET missing) — skipping.');
    return { ok: false, skipped: true };
  }

  const body = JSON.stringify(payload);
  const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fountain-Signature': sig,
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[apply] dealflow webhook returned', res.status, text);
      return { ok: false, status: res.status, detail: text };
    }
    return { ok: true };
  } catch (err) {
    console.error('[apply] dealflow webhook request failed:', err);
    return { ok: false, error: String(err) };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const data = req.body || {};
  const required = [
    'name',
    'email',
    'link',
    'location',
    'project',
    'project_site',
    'oneliner',
    'target_customer',
    'market_size',
    'competitors',
    'ai_layer',
    'form',
    'stage',
    'funding',
    'why',
    'source',
  ];
  const missing = required.filter((k) => !data[k] || !String(data[k]).trim());
  if (missing.length) {
    return res.status(400).json({ error: 'Missing required fields', missing });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(data.email).trim())) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const resend = new Resend(apiKey);
  const from = process.env.FROM_EMAIL || DEFAULT_FROM;
  const subject = `[Apply] ${data.project} — ${data.name}`;
  const html = buildHtml(data);
  const text = buildText(data);

  try {
    // 1) Team notification (existing — primary record for humans)
    const teamResult = await resend.emails.send({
      from,
      to: TEAM_RECIPIENTS,
      reply_to: data.email,
      subject,
      html,
      text,
    });

    if (teamResult.error) {
      console.error('Resend team email error:', teamResult.error);
      return res.status(502).json({ error: 'Failed to send notification', detail: teamResult.error.message });
    }

    // 2) Applicant confirmation (best-effort)
    try {
      await resend.emails.send({
        from,
        to: data.email,
        reply_to: 'apply@fountainbuild.ai',
        subject: 'We received your FOUNTAIN application',
        html: buildConfirmationHtml(data),
        text: `Thanks, ${(data.name || 'founder').split(' ')[0]}. We've received your application for ${data.project || 'your project'} and will respond within one week.\n\n— FOUNTAIN`,
      });
    } catch (confirmErr) {
      console.warn('Confirmation email failed (non-fatal):', confirmErr);
    }

    // 3) Deal-flow system ingest (HMAC-signed, structured) — non-blocking
    const dealflowResult = await postToDealflow(buildDealflowPayload(data));

    return res.status(200).json({
      ok: true,
      id: teamResult.data?.id,
      dealflow: dealflowResult.ok ? 'ingested' : 'skipped',
    });
  } catch (err) {
    console.error('Apply submission error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
