import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { fetchComplaints, updateComplaint } from '../services/authService';

export default function ComplaintQueue({ officerSession, theme }) {
  const isDark = theme === 'dark';
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({});

  async function load() {
    const result = await fetchComplaints();
    setComplaints(result.data || []);
  }

  useEffect(() => { load().catch(() => {}); }, []);

  const selected = complaints.find((item) => item.id === selectedId);
  const save = async (updates) => {
    const result = await updateComplaint(selected.id, updates);
    setComplaints((items) => items.map((item) => item.id === result.data.id ? result.data : item));
    setDraft({});
  };

  return (
    <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-400" /> Consumer Complaints</h2>
        <span className="text-[10px] font-mono text-zinc-500">{complaints.length} total</span>
      </div>
      {complaints.length === 0 && <p className="text-xs text-zinc-500">No consumer complaints received.</p>}
      {complaints.map((complaint) => (
        <div key={complaint.id} className="border border-zinc-800 rounded-xl p-3 space-y-2 text-xs">
          <button className="w-full text-left" onClick={() => { setSelectedId(complaint.id); setDraft(complaint); }}>
            <div className="flex justify-between font-bold"><span>{complaint.id}</span><span className="text-amber-400">{complaint.status}</span></div>
            <p className="text-zinc-400 mt-1">{complaint.description}</p>
            <p className="text-zinc-500">{complaint.location} · {new Date(complaint.created_at).toLocaleString()}</p>
          </button>
          {selectedId === complaint.id && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <select value={draft.status || complaint.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full bg-zinc-900 rounded p-2">
                {['NEW', 'ASSIGNED', 'UNDER_INVESTIGATION', 'REPORT_SUBMITTED', 'RESOLVED'].map((status) => <option key={status}>{status}</option>)}
              </select>
              {['investigationNotes', 'findings', 'actionTaken'].map((field) => <textarea key={field} value={draft[field] || ''} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} placeholder={field} className="w-full bg-zinc-900 rounded p-2" rows={2} />)}
              <button onClick={() => save({ status: draft.status, investigationNotes: draft.investigationNotes, findings: draft.findings, actionTaken: draft.actionTaken, assignedOfficer: officerSession?.officerId || 'OFFICER001', reportStatus: draft.status === 'REPORT_SUBMITTED' ? 'SUBMITTED' : complaint.reportStatus })} className="flex items-center gap-2 text-emerald-400 font-semibold"><Save className="w-3.5 h-3.5" /> Save investigation</button>
            </div>
          )}
        </div>
      ))}
      {complaints.length > 0 && <p className="text-[10px] text-emerald-400 flex gap-1 items-center"><CheckCircle2 className="w-3 h-3" /> All authorized officers can view this queue.</p>}
    </div>
  );
}