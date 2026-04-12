import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const quoteToEmail = process.env.QUOTE_TO_EMAIL;
const quoteFromEmail = process.env.QUOTE_FROM_EMAIL || 'ThirdSpace <onboarding@resend.dev>';

type QuoteRequestBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  projectType?: unknown;
  message?: unknown;
};

const textEncoder = new TextEncoder();

function json(status: number, body: Record<string, unknown>) {
  return new Response(textEncoder.encode(JSON.stringify(body)), {
    status,
    headers: {
      'Content-Type': 'application/json',
      Allow: 'OPTIONS, POST',
    },
  });
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMultilineHtml(value: string) {
  return escapeHtml(value).replaceAll('\n', '<br />');
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildPlainTextEmail(data: Required<QuoteRequestBody> & {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}) {
  return [
    'New ThirdSpace quote request',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Project Type: ${data.projectType}`,
    '',
    'Project Details:',
    data.message,
  ].join('\n');
}

function buildHtmlEmail(data: {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New ThirdSpace quote request</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
      <p style="margin: 0 0 16px;"><strong>Project Type:</strong> ${escapeHtml(data.projectType)}</p>
      <p style="margin: 0 0 8px;"><strong>Project Details:</strong></p>
      <p style="margin: 0;">${formatMultilineHtml(data.message)}</p>
    </div>
  `;
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'OPTIONS, POST',
    },
  });
}

export async function POST(request: Request) {
  if (!resendApiKey || !quoteToEmail) {
    return json(500, {
      error: 'Quote form email delivery is not configured yet.',
    });
  }

  let body: QuoteRequestBody;

  try {
    body = await request.json();
  } catch {
    return json(400, {
      error: 'Invalid request body.',
    });
  }

  const name = normalizeString(body.name);
  const email = normalizeString(body.email).toLowerCase();
  const phone = normalizeString(body.phone);
  const projectType = normalizeString(body.projectType);
  const message = normalizeString(body.message);

  if (!name || !email || !phone || !projectType || !message) {
    return json(400, {
      error: 'Please complete all required fields.',
    });
  }

  if (!isValidEmail(email)) {
    return json(400, {
      error: 'Please enter a valid email address.',
    });
  }

  if (name.length > 120 || email.length > 160 || phone.length > 60 || projectType.length > 80 || message.length > 4000) {
    return json(400, {
      error: 'One or more fields are too long.',
    });
  }

  const resend = new Resend(resendApiKey);
  const subject = `New ThirdSpace quote request from ${name}`;

  const { error } = await resend.emails.send({
    from: quoteFromEmail,
    to: [quoteToEmail],
    subject,
    replyTo: email,
    text: buildPlainTextEmail({
      name,
      email,
      phone,
      projectType,
      message,
    }),
    html: buildHtmlEmail({
      name,
      email,
      phone,
      projectType,
      message,
    }),
  });

  if (error) {
    console.error('Failed to send quote request email', error);

    return json(502, {
      error: 'We could not send your request right now. Please try again in a moment.',
    });
  }

  return json(200, { ok: true });
}
