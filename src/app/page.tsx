export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Quote & Invoice Builder
            </h1>
            <p className="text-xl text-slate-600">
              MVP Development Environment
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              ✓ Setup Complete
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-slate-900">Database Connected</p>
                  <p className="text-sm text-slate-600">PostgreSQL configured and ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-slate-900">Prisma Schema Loaded</p>
                  <p className="text-sm text-slate-600">Users, Business, Customers, Products, Quotes, Invoices</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-slate-900">Next.js 15 Running</p>
                  <p className="text-sm text-slate-600">TypeScript strict mode enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-slate-900">Tailwind CSS + shadcn/ui</p>
                  <p className="text-sm text-slate-600">UI components ready to use</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-3xl mb-2">🔐</p>
              <h3 className="font-semibold text-slate-900 mb-2">Authentication</h3>
              <p className="text-sm text-slate-600">
                Auth.js + JWT for web & mobile
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-3xl mb-2">📄</p>
              <h3 className="font-semibold text-slate-900 mb-2">PDF Export</h3>
              <p className="text-sm text-slate-600">
                pdfkit for quote & invoice PDFs
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-3xl mb-2">💰</p>
              <h3 className="font-semibold text-slate-900 mb-2">Financial</h3>
              <p className="text-sm text-slate-600">
                NUMERIC types for accuracy
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
            <ol className="text-left space-y-2 text-sm text-blue-800">
              <li>1. Review <code className="bg-white px-2 py-1 rounded">.env.local</code> configuration</li>
              <li>2. Run <code className="bg-white px-2 py-1 rounded">npm run db:studio</code> to view database</li>
              <li>3. Implement authentication endpoints</li>
              <li>4. Build business profile setup</li>
              <li>5. Create quote & invoice workflows</li>
            </ol>
          </div>

          <div className="space-y-3 text-sm">
            <p>
              <a 
                href="/docs" 
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                → Read SETUP.md for detailed instructions
              </a>
            </p>
            <p className="text-slate-600">
              Version 0.1.0 • Development Mode
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
