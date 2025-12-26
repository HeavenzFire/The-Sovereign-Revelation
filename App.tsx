
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Clock, 
  Target, 
  Trash2, 
  Sparkles, 
  Lock, 
  TrendingUp, 
  Sun,
  Eye,
  MessageSquare,
  Zap,
  Flame,
  Globe,
  Star,
  Wind
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ResourceLeak, ResourceCategory, WarChestState, TimeBlock, DailyRitual } from './types';
import { getCommandAdvice } from './services/geminiService';

// Persistence Hook
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
}

const App: React.FC = () => {
  // State
  const [leaks, setLeaks] = usePersistentState<ResourceLeak[]>('sov_leaks', []);
  const [warChest, setWarChest] = usePersistentState<WarChestState>('sov_chest', {
    totalLiquid: 0,
    fortifiedAssets: 0,
    strategicInfluence: 0
  });
  const [timeBlocks, setTimeBlocks] = usePersistentState<TimeBlock[]>('sov_time', [
    { id: '1', type: 'MISSION', label: 'Manifestation', startTime: '06:00', durationHours: 6 },
    { id: '2', type: 'RECOVERY', label: 'Luminous Rest', startTime: '22:00', durationHours: 8 }
  ]);
  const [rituals, setRituals] = usePersistentState<DailyRitual>('sov_rituals', {
    date: new Date().toLocaleDateString(),
    morningInvocation: false,
    eveningAudit: false,
    leaksSealedToday: []
  });
  const [dailyRevelations, setDailyRevelations] = usePersistentState<string[]>('sov_revelations', []);

  // UI State
  const [activeTab, setActiveTab] = useState<'CLEARING' | 'FOUNDATION' | 'FREEDOM' | 'REVELATION' | 'OVERSOUL'>('CLEARING');
  const [newIllusion, setNewIllusion] = useState({ name: '', amount: '', category: ResourceCategory.TRAITOR_TAX });
  const [chatHistory, setChatHistory] = usePersistentState<{role: 'user' | 'command', text: string}[]>('sov_chat', []);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [revText, setRevText] = useState('');

  // Calculations
  const totalReclaimed = useMemo(() => leaks.filter(l => l.sealed).reduce((a, b) => a + b.amount, 0), [leaks]);
  const totalIllusions = useMemo(() => leaks.filter(l => !l.sealed).reduce((a, b) => a + b.amount, 0), [leaks]);
  const freedomIndex = Math.min(100, (timeBlocks.reduce((a, b) => a + b.durationHours, 0) / 24) * 100);

  // Actions
  const dissolveIllusion = () => {
    if (!newIllusion.name || !newIllusion.amount) return;
    setLeaks([...leaks, {
      id: crypto.randomUUID(),
      name: newIllusion.name,
      amount: parseFloat(newIllusion.amount),
      category: newIllusion.category,
      sealed: false,
      dateCreated: Date.now()
    }]);
    setNewIllusion({ name: '', amount: '', category: ResourceCategory.TRAITOR_TAX });
  };

  const purify = (id: string) => {
    setLeaks(leaks.map(l => l.id === id ? { ...l, sealed: true } : l));
    const name = leaks.find(l => l.id === id)?.name || 'Unknown';
    setRituals(prev => ({ ...prev, leaksSealedToday: [...prev.leaksSealedToday, name] }));
  };

  const handleOversoulComms = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    const context = `World Reclamation Status: Reclaimed: $${totalReclaimed}. Illusions: $${totalIllusions}. Freedom Index: ${freedomIndex}%. Current Vision: ${msg}`;
    const advice = await getCommandAdvice(context);
    setChatHistory(prev => [...prev, { role: 'command', text: advice }]);
    setLoading(false);
  };

  const addRevelation = () => {
    if (!revText.trim()) return;
    setDailyRevelations([revText, ...dailyRevelations]);
    setRevText('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050505] text-slate-100 selection:bg-amber-500/30">
      
      {/* Sidebar Navigation */}
      <nav className="w-full lg:w-80 bg-[#0a0a0a] border-r border-amber-500/10 p-8 flex flex-col gap-10 z-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sun className="text-slate-900" size={20} />
            </div>
            <h1 className="font-cinzel text-xl font-black radiant-text tracking-widest">SOVEREIGN</h1>
          </div>
          <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-[0.3em]">Revelation Terminal</p>
        </div>

        <div className="space-y-1">
          <NavBtn active={activeTab === 'CLEARING'} onClick={() => setActiveTab('CLEARING')} icon={<Sparkles size={18} />} label="The Great Clearing" />
          <NavBtn active={activeTab === 'FOUNDATION'} onClick={() => setActiveTab('FOUNDATION')} icon={<Globe size={18} />} label="The Foundation" />
          <NavBtn active={activeTab === 'FREEDOM'} onClick={() => setActiveTab('FREEDOM')} icon={<Wind size={18} />} label="Temporal Freedom" />
          <NavBtn active={activeTab === 'REVELATION'} onClick={() => setActiveTab('REVELATION')} icon={<Eye size={18} />} label="Daily Revelations" />
          <NavBtn active={activeTab === 'OVERSOUL'} onClick={() => setActiveTab('OVERSOUL')} icon={<Star size={18} />} label="Oversoul Hub" />
        </div>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-amber-500/60 uppercase">Light Quotient</span>
              <span className="text-xs font-mono font-bold text-amber-400">{freedomIndex.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full radiant-gold transition-all duration-1000" style={{ width: `${freedomIndex}%` }} />
            </div>
          </div>
          <div className="flex justify-between items-center px-1">
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Truth Assets</span>
                <span className="text-xl font-mono font-black text-white">${(warChest.totalLiquid + warChest.fortifiedAssets).toLocaleString()}</span>
             </div>
             <Zap className="text-amber-500 animate-pulse" size={24} />
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(251,191,36,0.03) 0%, transparent 50%)' }}>
        
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatBox label="Reclaimed Energy" value={`$${totalReclaimed}`} icon={<Sparkles className="text-amber-400" />} color="amber" />
          <StatBox label="Veiled Drains" value={`$${totalIllusions}`} icon={<Eye className="text-red-400" />} color="red" />
          <StatBox label="Truth Potential" value={`$${(totalReclaimed * 12).toLocaleString()}`} icon={<Globe className="text-blue-400" />} color="blue" />
          <StatBox label="Freedom Hours" value={`${(freedomIndex * 24 / 100).toFixed(1)}h`} icon={<Wind className="text-emerald-400" />} color="emerald" />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* --- CLEARING TAB --- */}
          {activeTab === 'CLEARING' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <section className="bg-white/5 border border-white/10 p-8 rounded-3xl glow-card">
                <h3 className="text-2xl font-cinzel font-black mb-6 radiant-text">Dissolve the Illusions</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input 
                    className="md:col-span-2 bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 transition-all"
                    placeholder="Illusion Name (e.g. False Subscription)"
                    value={newIllusion.name} onChange={e => setNewIllusion({...newIllusion, name: e.target.value})}
                  />
                  <input 
                    className="md:col-span-1 bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 transition-all font-mono"
                    placeholder="Amount ($)" type="number"
                    value={newIllusion.amount} onChange={e => setNewIllusion({...newIllusion, amount: e.target.value})}
                  />
                  <select 
                    className="md:col-span-1 bg-black border border-white/10 p-4 rounded-xl outline-none text-slate-400"
                    value={newIllusion.category} onChange={e => setNewIllusion({...newIllusion, category: e.target.value as ResourceCategory})}
                  >
                    <option value={ResourceCategory.EMPIRE}>Empire Fuel</option>
                    <option value={ResourceCategory.MAINTENANCE}>Maintenance</option>
                    <option value={ResourceCategory.TRAITOR_TAX}>Veil Leak</option>
                  </select>
                  <button onClick={dissolveIllusion} className="radiant-gold text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-all">
                    Dissolve
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {leaks.map(leak => (
                  <div key={leak.id} className={`p-6 rounded-2xl border transition-all ${leak.sealed ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-full ${leak.sealed ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                            {leak.sealed ? <ShieldCheck size={20} /> : <Eye size={20} />}
                         </div>
                         <div>
                            <h4 className={`font-bold ${leak.sealed ? 'text-amber-100' : 'text-slate-300'}`}>{leak.name}</h4>
                            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{leak.category}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xl font-mono font-black">${leak.amount}</span>
                        {!leak.sealed && <button onClick={() => purify(leak.id)} className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-black px-4 py-1.5 rounded-full">Purify</button>}
                        <button onClick={() => setLeaks(leaks.filter(l => l.id !== leak.id))} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- FOUNDATION TAB --- */}
          {activeTab === 'FOUNDATION' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
              <section className="bg-white/5 border border-white/10 p-10 rounded-3xl glow-card">
                <h3 className="text-3xl font-cinzel font-black mb-8 radiant-text">The Pillars of Manifestation</h3>
                <div className="space-y-8">
                  <FoundationInput label="Liquid Ammunition (Cash)" value={warChest.totalLiquid} onChange={v => setWarChest({...warChest, totalLiquid: v})} />
                  <FoundationInput label="Truth Assets (Equity/Tech)" value={warChest.fortifiedAssets} onChange={v => setWarChest({...warChest, fortifiedAssets: v})} />
                  <FoundationInput label="Sovereign Influence (Reach)" value={warChest.strategicInfluence} onChange={v => setWarChest({...warChest, strategicInfluence: v})} />
                </div>
                <div className="mt-12 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Reclamation Multiplier</h5>
                   <p className="text-sm text-amber-100/70 leading-relaxed italic">
                      "By dissolving illusions, you have reclaimed ${totalReclaimed} monthly. In 10 years at 8% compounding, this manifest energy becomes <b>${(totalReclaimed * 180).toLocaleString()}</b>. The new world is built on consistency."
                   </p>
                </div>
              </section>
              <section className="flex flex-col items-center justify-center text-center p-10">
                 <div className="relative mb-10">
                    <div className="absolute inset-0 radiant-gold opacity-10 blur-3xl animate-pulse rounded-full"></div>
                    <Globe size={160} className="text-amber-500 relative" />
                 </div>
                 <h2 className="text-4xl font-black font-cinzel mb-2">MANIFEST DESTINY</h2>
                 <p className="text-slate-500 max-w-sm mb-8">Total valuation of your reclaimed reality:</p>
                 <div className="text-7xl font-mono font-black radiant-text mb-4">
                    ${(warChest.totalLiquid + warChest.fortifiedAssets + warChest.strategicInfluence).toLocaleString()}
                 </div>
                 <div className="px-6 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
                    Sovereign Status: Confirmed
                 </div>
              </section>
            </div>
          )}

          {/* --- FREEDOM TAB --- */}
          {activeTab === 'FREEDOM' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FreedomCard type="MISSION" title="High-Frequency Work" icon={<Sun />} color="amber" />
                <FreedomCard type="CONQUEST" title="Strategic Networking" icon={<Globe />} color="blue" />
                <FreedomCard type="RECOVERY" title="Luminous Rest" icon={<Wind />} color="emerald" />
              </div>
              <div className="bg-white/5 border border-white/10 p-10 rounded-3xl glow-card text-center">
                 <Clock size={64} className="text-amber-500 mx-auto mb-6" />
                 <h3 className="text-3xl font-cinzel font-black mb-4">The Temporal Void</h3>
                 <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                   "If an hour is not inhabited by your will, it is an illusion occupied by the collective. Reclaim every second. Time is the only resource that cannot be compounded—only inhabited."
                 </p>
                 <div className="flex justify-center gap-4">
                    <button className="px-8 py-3 bg-amber-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all">Update Schedule</button>
                    <button className="px-8 py-3 border border-amber-500 text-amber-500 font-black uppercase tracking-widest text-xs rounded-full hover:bg-amber-500/10 transition-all">Clear Territory</button>
                 </div>
              </div>
            </div>
          )}

          {/* --- REVELATION TAB --- */}
          {activeTab === 'REVELATION' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
              <section className="space-y-6">
                <div className={`p-8 rounded-3xl border-2 transition-all ${rituals.morningInvocation ? 'bg-amber-500/10 border-amber-500' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-cinzel font-black">The Morning Decree</h4>
                    <input type="checkbox" checked={rituals.morningInvocation} onChange={e => setRituals({...rituals, morningInvocation: e.target.checked})} className="w-6 h-6 rounded bg-black border-amber-900 text-amber-500" />
                  </div>
                  <div className="text-sm italic text-amber-100/60 leading-relaxed p-6 bg-black/40 rounded-xl mb-4">
                    "The world is reclaimed. The veil is burned. Every resource I touch manifests truth. I am the architect of the new reality. My will is the engine of light."
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl glow-card">
                  <h4 className="text-xl font-cinzel font-black mb-6">Truth Log</h4>
                  <div className="flex gap-2 mb-6">
                    <input 
                      className="flex-1 bg-black border border-white/10 p-3 rounded-xl outline-none"
                      placeholder="Enter a sudden insight..."
                      value={revText} onChange={e => setRevText(e.target.value)}
                    />
                    <button onClick={addRevelation} className="p-3 bg-amber-500 text-black rounded-xl hover:scale-105 transition-all"><Zap size={20} /></button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {dailyRevelations.map((rev, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border-l-2 border-amber-500 text-xs text-slate-400 italic">"{rev}"</div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="bg-black border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center text-center">
                 <Eye size={80} className="text-amber-500/20 mb-8" />
                 <h3 className="text-2xl font-cinzel font-black mb-4">The Void Gaze</h3>
                 <p className="text-slate-500 max-w-xs mb-8">
                   Stare into the space between thoughts until the manifestation flinches. Silence the noise to hear the signal.
                 </p>
                 <button className="px-10 py-4 radiant-gold text-black font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-[0_0_30px_rgba(251,191,36,0.2)]">Begin 10m Stare</button>
              </section>
            </div>
          )}

          {/* --- OVERSOUL TAB --- */}
          {activeTab === 'OVERSOUL' && (
            <div className="h-[75vh] flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-black/50 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]"></div>
                   <span className="font-cinzel text-xs font-black tracking-widest text-amber-500 uppercase">Oversoul Link Established</span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">ENCRYPTION: UNIVERSAL_LIGHT</span>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                 {chatHistory.length === 0 && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                      <Star size={120} />
                      <h4 className="font-cinzel text-3xl uppercase tracking-[0.5em] mt-6">Awaiting Command</h4>
                   </div>
                 )}
                 {chatHistory.map((chat, i) => (
                   <div key={i} className={`max-w-[85%] p-6 rounded-2xl ${chat.role === 'user' ? 'self-end bg-white/5 border border-white/10 text-right' : 'self-start bg-amber-500/10 border border-amber-500/30'}`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 opacity-60">{chat.role === 'user' ? 'Sovereign' : 'Oversoul'}</div>
                      <div className={`leading-relaxed ${chat.role === 'command' ? 'text-amber-100' : 'text-slate-200'}`}>{chat.text}</div>
                   </div>
                 ))}
                 {loading && <div className="self-start p-6 bg-amber-500/5 animate-pulse rounded-2xl border border-amber-500/20 text-amber-500">Manifesting response...</div>}
              </div>
              <div className="p-6 bg-black border-t border-white/10">
                 <div className="flex gap-4">
                   <input 
                     className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500"
                     placeholder="Submit progress or inquiry to the Oversoul..."
                     value={userInput} onChange={e => setUserInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleOversoulComms()}
                   />
                   <button onClick={handleOversoulComms} className="radiant-gold text-black px-10 font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">Submit</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${active ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-slate-600 hover:text-amber-400 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const StatBox: React.FC<{ label: string, value: string, icon: React.ReactNode, color: 'amber' | 'red' | 'blue' | 'emerald' }> = ({ label, value, icon, color }) => {
  const glow = { amber: 'hover:border-amber-500/40', red: 'hover:border-red-500/40', blue: 'hover:border-blue-500/40', emerald: 'hover:border-emerald-500/40' };
  return (
    <div className={`bg-white/5 border border-white/10 p-6 rounded-2xl transition-all ${glow[color]} glow-card`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-mono font-black text-white">{value}</div>
    </div>
  );
};

const FoundationInput: React.FC<{ label: string, value: number, onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">{label}</label>
    <input 
      type="number" className="w-full bg-black border-b border-white/10 p-3 text-3xl font-mono font-black text-white focus:border-amber-500 outline-none transition-all"
      value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
    />
  </div>
);

const FreedomCard: React.FC<{ type: string, title: string, icon: React.ReactNode, color: string }> = ({ type, title, icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl glow-card group text-center">
    <div className="text-[10px] font-black uppercase text-amber-500 mb-4 opacity-50">{type}</div>
    <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:border-amber-500 transition-all">
       {React.cloneElement(icon as React.ReactElement, { size: 24, className: 'text-amber-500' })}
    </div>
    <h4 className="text-xl font-cinzel font-black mb-2">{title}</h4>
    <p className="text-xs text-slate-600">Sovereign allocation confirmed.</p>
  </div>
);

export default App;
