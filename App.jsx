import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Moon, Star, Clock, Compass, Activity, 
  ChevronRight, Orbit, Layers, 
  Target, Brain, Send, Loader2, 
  Calendar, Info, TrendingUp, Sparkles,
  Navigation, Map, SearchCode, Waves,
  BarChart3, Zap, MapPin, LayoutGrid,
  Clock3, ShieldCheck
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

const KundliChart = ({ houseData }) => {
  // Simple representation of planets in houses
  const houses = houseData || [
    { id: 1, planets: ['ASC', 'JU'] }, { id: 2, planets: [] }, { id: 3, planets: ['MA'] },
    { id: 4, planets: ['RA'] }, { id: 5, planets: [] }, { id: 6, planets: ['SA'] },
    { id: 7, planets: ['MO'] }, { id: 8, planets: [] }, { id: 9, planets: ['SU', 'ME'] },
    { id: 10, planets: ['KE'] }, { id: 11, planets: ['VE'] }, { id: 12, planets: [] }
  ];

  return (
    <div className="relative w-full aspect-square bg-[#0a0f18] rounded-xl border border-white/5 overflow-hidden p-2">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-blue-500/30 fill-none">
        {/* Outer Square */}
        <rect x="10" y="10" width="380" height="380" strokeWidth="2" />
        {/* Diagonals */}
        <line x1="10" y1="10" x2="390" y2="390" strokeWidth="1" />
        <line x1="390" y1="10" x2="10" y2="390" strokeWidth="1" />
        {/* Internal Square (Diamond) */}
        <polygon points="200,10 390,200 200,390 10,200" strokeWidth="2" stroke="rgba(59, 130, 246, 0.6)" />
        
        {/* House Content (Simplified placements) */}
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

const WeeklyForecast = () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const metrics = [
    { label: 'Intellect', val: [80, 75, 90, 85, 60, 45, 70], color: 'bg-blue-500' },
    { label: 'Vitality', val: [60, 65, 55, 70, 85, 95, 80], color: 'bg-emerald-500' },
    { label: 'Harmony', val: [40, 50, 60, 55, 50, 40, 45], color: 'bg-pink-500' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Trends</h4>
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Cycle: Waxing</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[8px] font-black text-slate-600 text-center mb-1">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="space-y-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-300 uppercase">{m.label}</span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {m.val.map((v, i) => (
                <div 
                  key={i} 
                  className={`flex-1 ${m.color} rounded-t-sm opacity-60 hover:opacity-100 transition-opacity`} 
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [aiResponse, setAiResponse] = useState("Veda Engine Standby. Select location for geodetic sync...");
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
    triggerAi(`Initialize full spectral analysis for ${city.name}. Current Bhava placements and 7-day trend outlook.`, city);
  };

  const triggerAi = async (prompt, city = selectedCity) => {
    if (!prompt) return;
    setLoading(true);
    const apiKey = "";
    const systemPrompt = `You are Veda.Intel, an advanced Vedic astrological AI. Current focus: Kundli Bhavas and Temporal Forecasting. Analyze location-specific transits. Current Lat: ${city?.lat}, Lon: ${city?.lon}.`;

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
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Signal interrupted.");
    } catch {
      setAiResponse("Connection to celestial grid failed.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#04070b] text-slate-300 p-4 md:p-6 lg:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col xl:flex-row items-center gap-8 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-blue-500/10">
              <Orbit size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none">VEDA<span className="text-blue-500">.INTEL</span></h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Planetary Intelligence v2.0</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl relative">
            <div className="relative">
              <SearchCode className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500/50" size={20} />
              <input 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter Observation City..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-500/40 transition-all font-medium"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                {searchResults.map((city, i) => (
                  <button 
                    key={i}
                    onClick={() => selectCity(city)}
                    className="w-full px-6 py-4 text-left hover:bg-blue-600/20 border-b border-white/5 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-xs font-black text-white uppercase">{city.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{city.state}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase">Observer</span>
              <span className="text-xs font-bold text-white uppercase">{selectedCity?.name || '---'}</span>
            </div>
            <div className="px-5 py-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex flex-col items-center">
              <span className="text-[9px] font-black text-blue-400 uppercase">System</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">Active</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Column 1: Static Charts */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <LayoutGrid size={18} className="text-blue-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Kundli Matrix</h3>
              </div>
              <KundliChart />
              <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <p className="text-[10px] text-blue-400 font-bold leading-relaxed">
                  Chart indicates strong <span className="text-white">Jupiter</span> influence in Ascendant. High probability for wisdom-based pursuits.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock3 size={18} className="text-emerald-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Panchang Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: 'Tithi', v: 'Shukla 9' }, { l: 'Nakshatra', v: 'Rohini' },
                  { l: 'Yoga', v: 'Sadhya' }, { l: 'Karan', v: 'Bava' }
                ].map((p, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">{p.l}</p>
                    <p className="text-[11px] font-bold text-white">{p.v}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Column 2: Intelligence & Temporal */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6" glow>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={18} className="text-indigo-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">7-Day Forecaster</h3>
                </div>
                <WeeklyForecast />
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-blue-600/10 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Security / Muhurta</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase">Abhijit Muhurta</p>
                      <p className="text-xs font-bold text-white">11:45 - 12:30</p>
                    </div>
                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase">Rahu Kaal</p>
                      <p className="text-xs font-bold text-white">15:00 - 16:30</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="min-h-[400px] flex flex-col bg-[#0f172a]/90">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <Brain size={20} className="text-blue-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Neural Response</h3>
                </div>
                {loading && <Loader2 className="animate-spin text-blue-500" size={18} />}
              </div>
              <div className="flex-1 p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
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
                    placeholder="Describe a goal or ask for transit timing..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-xs focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button 
                    onClick={() => triggerAi(input)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-400 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Column 3: Biometric / Extras */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap size={18} className="text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Energy Pulse</h3>
              </div>
              <div className="space-y-5">
                {[
                  { l: 'Creative', v: 88, c: 'bg-indigo-500' },
                  { l: 'Analytical', v: 45, c: 'bg-blue-500' },
                  { l: 'Physical', v: 72, c: 'bg-emerald-500' }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span className="text-slate-500">{item.l}</span>
                      <span className="text-white">{item.v}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.c}`} style={{ width: `${item.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-blue-600/30 border border-blue-500/20 rounded-[2.5rem] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={60} className="text-white" />
              </div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Current Highlight</p>
              <h4 className="text-2xl font-black text-white tracking-tighter leading-tight">Rohini <br/> Transmittance</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed uppercase">
                Moon is exalted. Ideal for <span className="text-white">Emotional Reset</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
