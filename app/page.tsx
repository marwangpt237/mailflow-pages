// Root route — friendly placeholder that explains what this app is.
export default function Home() {
  return (
    <main style={{ maxWidth: 560, margin: '80px auto', padding: '32px', textAlign: 'center' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>MailFlow Pages</h1>
        <p style={{ color: '#71717a', margin: 0 }}>
          This project hosts public landing pages for MailFlow templates.
          <br />
          All routes look like <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: 4 }}>/lp/&lt;template-id&gt;</code>.
        </p>
      </div>
    </main>
  );
}
