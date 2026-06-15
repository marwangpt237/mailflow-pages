// Public landing-page route: /lp/[templateId]
//
// Server-renders the template HTML directly as a full webpage.
// No card, no chrome, no max-width container — the template IS the page.
// If the template is a complete HTML document, we use it as-is.
// If it's just a fragment, we wrap it in a minimal HTML shell with
// proper viewport meta tags for responsive rendering.

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
  try {
    await fetch(`${BACKEND_URL}/api/templates/${templateId}/visit`, {
      method: 'POST',
      cache: 'no-store',
    });
  } catch {}
}

/**
 * Detect whether the template HTML is a complete HTML document.
 * If it contains <html>, <head>, or <body>, we treat it as full-page
 * and just inject the missing viewport meta tag.
 */
function looksLikeFullDocument(html: string): boolean {
  return /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
}

/**
 * Ensure the page has a viewport meta tag for responsive rendering on
 * mobile devices. If the template already has one, leave it alone.
 */
function ensureViewportMeta(html: string): string {
  if (/<meta\s+[^>]*name=["']viewport["']/i.test(html)) return html;
  return html.replace(
    /<head(\s[^>]*)?>/i,
    (match) =>
      `${match}<meta name="viewport" content="width=device-width, initial-scale=1" />`,
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const tpl = await fetchTemplate(templateId);

  if (!tpl.found) {
    // Fall back to the plain "not found" page (NOT inside any card).
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Page not found</title>
          <style>{`
            html, body { margin: 0; padding: 0; min-height: 100vh; }
            body { font-family: system-ui, -apple-system, sans-serif;
                   display: flex; align-items: center; justify-content: center;
                   background: #f4f4f5; color: #18181b; padding: 24px; }
            .wrap { max-width: 520px; text-align: center; }
            h1 { font-size: 22px; margin: 0 0 12px; }
            p { color: #71717a; margin: 0; line-height: 1.5; }
          `}</style>
        </head>
        <body>
          <div className="wrap">
            <h1>Page not found</h1>
            <p>{tpl.message ?? 'This template is no longer available.'}</p>
          </div>
        </body>
      </html>
    );
  }

  // Record the pageview (fire-and-forget).
  recordVisit(templateId);

  const rawHtml = tpl.html ?? '';

  if (looksLikeFullDocument(rawHtml)) {
    // Template is already a complete HTML page — render it directly.
    // We still inject a viewport meta tag if missing.
    return <div dangerouslySetInnerHTML={{ __html: ensureViewportMeta(rawHtml) }} />;
  }

  // Template is a fragment. Wrap it in a minimal HTML shell that:
  //  - takes 100% of the viewport (no card, no max-width)
  //  - removes default body margin so the template's own styles
  //    control layout precisely
  //  - sets a font-family fallback that doesn't break the template
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {tpl.name && <title>{tpl.name}</title>}
        <style>{`
          html, body { margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                  Roboto, "Helvetica Neue", Arial, sans-serif;
                  min-height: 100vh; }
          img { max-width: 100%; height: auto; }
        `}</style>
      </head>
      <body dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </html>
  );
}
