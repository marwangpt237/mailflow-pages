// Public landing-page route: /lp/[templateId]
//
// Server-renders the template HTML inside a clean wrapper, then calls
// the backend to record a pageview. The backend's /api/templates/:id/public
// endpoint returns the rendered HTML (with merge tags replaced by sample
// data) so we don't need any auth here.

const BACKEND_URL =
  process.env.BACKEND_URL ?? 'http://localhost:3001';

interface PublicTemplate {
  found: boolean;
  message?: string;
  id?: string;
  name?: string;
  description?: string;
  version?: number;
  updatedAt?: string;
  html?: string;
  landingUrl?: string;
}

async function fetchTemplate(templateId: string): Promise<PublicTemplate> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/templates/${templateId}/public`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { found: false, message: 'Template not found' };
    return res.json();
  } catch (err) {
    return { found: false, message: 'Could not reach the server.' };
  }
}

async function recordVisit(templateId: string): Promise<void> {
  // Fire-and-forget — we don't want pageview tracking to slow the page
  // load or fail the render.
  try {
    await fetch(`${BACKEND_URL}/api/templates/${templateId}/visit`, {
      method: 'POST',
      cache: 'no-store',
    });
  } catch {}
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const tpl = await fetchTemplate(templateId);

  if (!tpl.found) {
    return (
      <main style={{ maxWidth: 560, margin: '80px auto', padding: 32 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h1 style={{ fontSize: 22, margin: '0 0 8px', color: '#18181b' }}>
            Page not found
          </h1>
          <p style={{ color: '#71717a', margin: 0 }}>
            {tpl.message ?? 'This template is no longer available.'}
          </p>
        </div>
      </main>
    );
  }

  // Record the pageview. We do this AFTER the page renders so the user
  // sees their content even if tracking is slow.
  recordVisit(templateId);

  return (
    <main style={{ minHeight: '100vh', background: '#f4f4f5', padding: '40px 20px' }}>
      {/* Email-safe wrapper — most email clients strip styles from
          arbitrary HTML, but this wrapper provides good defaults. */}
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            background: '#fafafa',
            borderBottom: '1px solid #e5e7eb',
            fontSize: 11,
            color: '#71717a',
            textAlign: 'center',
          }}
        >
          {tpl.name} · rendered by MailFlow
        </div>
        <div
          style={{ padding: '32px 24px' }}
          dangerouslySetInnerHTML={{ __html: tpl.html ?? '' }}
        />
      </div>
    </main>
  );
}
