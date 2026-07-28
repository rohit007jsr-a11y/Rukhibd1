import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, CheckCircle2, XCircle, Code, Copy, RefreshCw, Terminal } from 'lucide-react';

interface DatabaseTabProps {
  userId: string;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ userId }) => {
  const [dbHealth, setDbHealth] = useState<{ connected: boolean; version?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db-health');
      const data = await res.json();
      setDbHealth(data);
    } catch (err: any) {
      setDbHealth({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const sqlSnippet = `-- Execute in Supabase SQL Editor to assign Admin access:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify Admin Users in Database:
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div>
          <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#111111]">
            Database & Access Control Diagnostic
          </h2>
          <p className="text-xs text-gray-600 font-body">
            Verify PostgreSQL connection pool status, view database schema constraints, and execute admin role assignment SQL queries.
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="p-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          title="Refresh DB Connection Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3 font-body text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              PostgreSQL Pooler Status
            </h3>
          </div>

          {loading ? (
            <span className="text-gray-500 font-bold">Checking...</span>
          ) : dbHealth?.connected ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border-2 border-emerald-600 font-heading font-black px-2.5 py-1 text-xs uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Database Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 border-2 border-red-600 font-heading font-black px-2.5 py-1 text-xs uppercase">
              <XCircle className="w-4 h-4 text-red-600" /> Connection Failed
            </span>
          )}
        </div>

        {dbHealth?.version && (
          <div className="bg-[#F7F7F5] p-3 border-2 border-[#111111] font-mono text-[11px] text-gray-700">
            <strong>Server Version:</strong> {dbHealth.version}
          </div>
        )}

        {dbHealth?.error && (
          <div className="bg-red-50 p-3 border-2 border-red-600 text-red-900 font-mono text-[11px]">
            <strong>Error:</strong> {dbHealth.error}
          </div>
        )}
      </div>

      {/* Admin Role Assignment Guide */}
      <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-body text-xs">
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              Assign Admin Role via Supabase SQL Editor
            </h3>
          </div>

          <button
            onClick={copySql}
            className="flex items-center gap-1 bg-[#111111] text-white px-3 py-1 font-heading font-bold text-xs uppercase border border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied SQL!' : 'Copy SQL'}
          </button>
        </div>

        <p className="text-gray-600">
          In accordance with Rukhi security requirements, customer accounts cannot sign up as admins through the public user interface. Run this SQL query directly inside your Supabase project SQL Editor to promote your user account to <code className="font-mono font-bold bg-gray-200 px-1">admin</code>:
        </p>

        <pre className="bg-[#111111] text-emerald-400 p-4 border-2 border-[#111111] font-mono text-xs overflow-x-auto shadow-[4px_4px_0px_#E63946]">
          {sqlSnippet}
        </pre>
      </div>

      {/* RLS Policy Specs */}
      <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3 font-body text-xs">
        <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
          <ShieldCheck className="w-5 h-5 text-[#E63946]" />
          <h3 className="font-heading font-black text-base uppercase text-[#111111]">
            Active RLS Security & Server Gating Rules
          </h3>
        </div>

        <ul className="list-disc pl-5 space-y-2 text-gray-700 font-medium">
          <li>
            <strong>Server-Side Verification:</strong> Every <code className="font-mono text-[#E63946] font-bold">/api/admin/*</code> route queries <code className="font-mono font-bold">profiles.role</code> in PostgreSQL before returning data or processing mutations. Requests from customers receive <code className="font-mono font-bold text-red-600">403 Forbidden</code>.
          </li>
          <li>
            <strong>Frontend Route Guard:</strong> Navigating to <code className="font-mono text-[#E63946] font-bold">/admin</code> triggers a role fetch for the authenticated Supabase user. If <code className="font-mono font-bold">role !== 'admin'</code>, the user is immediately redirected to the home page.
          </li>
          <li>
            <strong>Soft Deletion:</strong> Products deactivated via the Admin Panel remain intact in the <code className="font-mono font-bold">products</code> table (<code className="font-mono font-bold">is_active = false</code>) to preserve historical referential integrity for customer receipt logs.
          </li>
        </ul>
      </div>
    </div>
  );
};
