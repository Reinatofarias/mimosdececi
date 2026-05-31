export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Fake Header */}
      <header style={{ height: '70px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '150px', height: '30px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </header>

      <main style={{ flex: 1, padding: 'var(--space-3xl) var(--space-md)' }} className="container">
        {/* Fake Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ width: '200px', height: '40px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out', marginBottom: '12px' }} />
          <div style={{ width: '300px', height: '20px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>

        {/* Fake Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-xl)' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Fake Image */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--color-bg-warm)', animation: 'pulse 1.5s infinite ease-in-out' }} />
              
              {/* Fake Content */}
              <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '80%', height: '24px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div style={{ width: '60%', height: '16px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40%', height: '28px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                  <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-bg-warm)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
}
