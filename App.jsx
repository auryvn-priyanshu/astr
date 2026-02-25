import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Moon, Star, Clock, Compass, Activity, 
  ChevronRight, Orbit, Layers, 
  Target, Brain, Send, Loader2, 
  Calendar, Info, TrendingUp, Sparkles,
  Navigation, Map, SearchCode, Waves,
  BarChart3, Zap, MapPin, LayoutGrid,
  Clock3, ShieldCheck, Heart, Flame,
  Dna, Award, ZapOff, Fingerprint,
  Timeline, History, Timer, Zap as Bolt
} from 'lucide-react';

// --- GeoEngine Implementation ---
class GeoEngine {
  constructor() {
    this.DEFAULT_TIMEZONE = 'Asia/Kolkata';
    this.states = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
      "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
      "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
      "Delhi", "Jammu and Kashmir"
    ];
    this.cityRegistry = new Map();
    this._init();
  }

  _init() {
    const rawData = [
      ["Mumbai", 13, 19.0760, 72.8777], ["Delhi", 28, 28.6139, 77.2090],
      ["Bengaluru", 10, 12.9716, 77.5946], ["Hyderabad", 13, 17.3850, 78.4867],
      ["Ahmedabad", 6, 23.0225, 72.5714], ["Chennai", 22, 13.0827, 80.2707],
      ["Kolkata", 27, 22.5726, 88.3639], ["Pune", 13, 18.5204, 73.8567],
      ["Jaipur", 20, 26.9124, 75.7873], ["Lucknow", 25, 26.8467, 80.9462],
      ["Patna", 3, 25.5941, 85.1376], ["Ujjain", 12, 23.1760, 75.7885]
    ];
    rawData.forEach(([name, stateIdx, lat, lon]) => {
      const cityObj = { name, state: this.states[stateIdx], lat, lon };
      this.cityRegistry.set(name.toLowerCase(), cityObj);
    });
  }

  search(q) {
    if (!q) return [];
    const query = q.toLowerCase();
    const results = [];
    for (const [key, city] of this.cityRegistry) {
      if (key.includes(query)) results.push(city);
    }
    return results.slice(0, 5);
  }
}

const geo = new GeoEngine();

// --- UI Components ---

const GlassCard = ({ children, className = "", glow = false }) => (
  <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c121e]/60 backdrop-blur-3xl transition-all duration-500 hover:border-blue-500/30 ${glow ? 'shadow-[0_0_40px_rgba(37,99,235,0.1)]' : ''} ${className}`}>
    <div className="relative z-10">{children}</div>
  </div>
);

const DashaTimeline = () => {
  const dashas = [
    { planet: 'Jupiter', end: '2028', progress: 85, color: 'bg-amber-500' },
    { planet: 'Saturn', end: '2047', progress: 0, color: 'bg-indigo-500' },
    { planet: 'Mercury', end: '2064', progress: 0, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-4">
      {dashas.map((d, i) => (
        <div key={i} className="relative pl-6 border-l-2 border-white/5 pb-4 last:pb-0">
          <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${d.progress > 0 ? d.color : 'bg-slate-800'} border-4 border-[#0c121e] shadow-lg`} />
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <h5 className="text-[10px] font-black text-white uppercase tracking-tight">{d.planet} Mahadasha</h5>
              <p className="text-[9px] font-bold text-slate-500">Until {d.end}</p>
            </div>
            {d.progress > 0 && <span className="text-[8px] font-black text-amber-500 animate-pulse">ACTIVE</span>}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${d.color} transition-all duration-1000`} 
              style={{ width: `${d.progress}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const BioResonance = () => {
  const bio = [
    { label: 'Physical', value: 78, icon: <Bolt size={10} />, color: 'text-orange-400' },
    { label: 'Emotional', value: 42, icon: <Heart size={10} />, color: 'text-pink-400' },
    { label: 'Intellectual', value: 91, icon: <Brain size={10} />, color: 'text-blue-400' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {bio.map((b, i) => (
        <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5">
          <div className={`${b.color} mb-2 bg-white/5 p-2 rounded-lg`}>{b.icon}</div>
          <div className="text-[14px] font-black text-white">{b.value}%</div>
          <div className="text-[8px] font-bold text-slate-500 uppercase">{b.label}</div>
        </div>
      ))}
    </div>
  );
};

const KundliChart = ({ houseData }) => {
  const houses = houseData || [
    { id: 1, planets: ['ASC', 'JU'] }, { id: 2, planets: [] }, { id: 3, planets: ['MA'] },
    { id: 4, planets: ['RA'] }, { id: 5, planets: [] }, { id: 6, planets: ['SA'] },
    { id: 7, planets: ['MO'] }, { id: 8, planets: [] }, { id: 9, planets: ['SU', 'ME'] },
    { id: 10, planets: ['KE'] }, { id: 11, planets: ['VE'] }, { id: 12, planets: [] }
  ];

  return (
    <div className="relative w-full aspect-square bg-[#0a0f18] rounded-xl border border-white/5 overflow-hidden p-2">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-blue-500/30 fill-none">
        <rect x="10" y="10" width="380" height="380" strokeWidth="2" />
        <line x1="10" y1="10" x2="390" y2="390" strokeWidth="1" />
        <line x1="390" y1="10" x2="10" y2="390" strokeWidth="1" />
        <polygon points="200,10 390,200 200,390 10,200" strokeWidth="2" stroke="rgba(59, 130, 246, 0.6)" />
        {[
          { id: 1, x: 200, y: 100 }, { id: 2, x: 100, y: 50 }, { id: 3, x: 50, y: 100 },
          { id: 4, x: 100, y: 200 }, { id: 5, x: 50, y: 300 }, { id: 6, x: 100, y: 350 },
          { id: 7, x: 200, y: 300 }, { id: 8, x: 300, y: 350 }, { id: 9, x: 350, y: 300 },
          { id: 10, x: 300, y: 200 }, { id: 11, x: 350, y: 100 }, { id: 12, x: 300, y: 50 }
        ].map(h => (
          <g key={h.id}>
            <text x={h.x} y={h.y} textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">{h.id}</text>
            <text x={h.x} y={h.y + 15} textAnchor="middle" className="fill-blue-400 text-[12px] font-black">
              {houses[h.id - 1].planets.join(' ')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [aiResponse, setAiResponse] = useState("Veda Engine Ready. Select geo-coordinates for dasha sync...");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const handleSearch = (q) => {
    setQuery(q);
    if (q.length > 1) setSearchResults(geo.search(q));
    else setSearchResults([]);
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    setQuery("");
    setSearchResults([]);
    triggerAi(`Provide a summary of the current Mahadasha effects for ${city.name} transit. Correlate bio-resonance peaks with Nakshatra transits.`, city);
  };

  const triggerAi = async (prompt, city = selectedCity) => {
    if (!prompt) return;
    setLoading(true);
    const apiKey = "";
    const systemPrompt = `You are Veda.Intel. Expertise: Vimshottari Dasha, Biorhythms, and Geodetic Transits. Be professional, clinical, yet Vedic in essence. Current Observation: ${city?.name || 'Global'}.`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await res.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Celestial communication link unstable.");
    } catch {
      setAiResponse("Signal dropped by planetary interference.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#04070b] text-slate-300 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <header className="flex flex-col xl:flex-row items-center gap-8 bg-white/[0.02] border border-white/5 p-6 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Orbit size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none">VEDA<span className="text-indigo-500">.INTEL</span></h1>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Dasha Chronology Engine</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl relative">
            <div className="relative">
              <SearchCode className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500/50" size={20} />
              <input 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Target Geocode (e.g., Delhi, Pune)..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-indigo-500/40"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                {searchResults.map((city, i) => (
                  <button 
                    key={i}
                    onClick={() => selectCity(city)}
                    className="w-full px-6 py-4 text-left hover:bg-indigo-600/20 border-b border-white/5 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-xs font-black text-white uppercase">{city.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{city.state}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <span className="text-[9px] font-black text-slate-500 uppercase block">Local Tithi</span>
              <span className="text-xs font-bold text-white uppercase">Navami</span>
            </div>
            <div className="px-5 py-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-center">
              <span className="text-[9px] font-black text-indigo-400 uppercase block">Phase</span>
              <span className="text-xs font-bold text-indigo-200 uppercase">Synchronized</span>
            </div>
          </div>
        </header>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Column 1: Time & Bio State */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Timer size={18} className="text-indigo-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Vimshottari Dasha</h3>
              </div>
              <DashaTimeline />
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={18} className="text-pink-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Bio-Resonance</h3>
              </div>
              <BioResonance />
            </GlassCard>
          </div>

          {/* Column 2: Cognitive Processor */}
          <div className="lg:col-span-6 space-y-6">
            <GlassCard className="min-h-[500px] flex flex-col bg-[#0f172a]/95">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-3">
                  <Fingerprint size={20} className="text-indigo-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Neural Transit Analysis</h3>
                </div>
                {loading && <Loader2 className="animate-spin text-indigo-500" size={18} />}
              </div>
              <div className="flex-1 p-8 overflow-y-auto max-h-[500px] custom-scrollbar">
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-indigo-500/40">
                    {aiResponse}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && triggerAi(input)}
                    placeholder="Inquire about Mahadasha transitions or lunar peaks..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-5 pl-6 pr-16 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                  <button 
                    onClick={() => triggerAi(input)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Column 3: Telemetry & Spatial Mapping */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <LayoutGrid size={18} className="text-indigo-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Celestial Matrix</h3>
              </div>
              <KundliChart />
            </GlassCard>

            <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <Star size={120} className="text-white" />
              </div>
              <div className="relative z-10">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sade Sati Alert</span>
                <h4 className="text-2xl font-black text-white mt-1 leading-tight">Shani <br/> Transiting 12th</h4>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Impact Level: Moderate</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
