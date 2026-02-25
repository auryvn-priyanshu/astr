import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sun, Moon, Star, Clock, Compass, Activity, 
  ChevronRight, Zap, Wind, Orbit, Layers, 
  Eye, Target, ShieldAlert, Cpu, Search, Send, Loader2, MapPin,
  Calendar, Info, TrendingUp, Sparkles, Brain, Lock, Unlock,
  RotateCcw, MousePointer2, BarChart3, Fingerprint, Heart, ZapOff,
  Globe, Timer, Milestone, Navigation, Map, SearchCode, Waves
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
      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];
    this.cityRegistry = new Map();
    this._init();
  }

  _init() {
    const rawData = [
      ["Mumbai", 13, 19.0760, 72.8777, ["Bombay"]],
      ["Delhi", 31, 28.6139, 77.2090, ["New Delhi", "NCR"]],
      ["Bengaluru", 10, 12.9716, 77.5946, ["Bangalore"]],
      ["Hyderabad", 23, 17.3850, 78.4867, []],
      ["Ahmedabad", 6, 23.0225, 72.5714, []],
      ["Chennai", 22, 13.0827, 80.2707, ["Madras"]],
      ["Kolkata", 27, 22.5726, 88.3639, ["Calcutta"]],
      ["Surat", 6, 21.1702, 72.8311, []],
      ["Pune", 13, 18.5204, 73.8567, []],
      ["Jaipur", 20, 26.9124, 75.7873, []],
      ["Lucknow", 25, 26.8467, 80.9462, []],
      ["Kanpur", 25, 26.4499, 80.3319, []],
      ["Nagpur", 13, 21.1458, 79.0882, []],
      ["Indore", 12, 22.7196, 75.8577, []],
      ["Thane", 13, 19.2183, 72.9781, []],
      ["Bhopal", 12, 23.2599, 77.4126, []],
      ["Visakhapatnam", 0, 17.6868, 83.2185, ["Vizag"]],
      ["Patna", 3, 25.5941, 85.1376, []],
      ["Vadodara", 6, 22.3072, 73.1812, ["Baroda"]],
      ["Ghaziabad", 25, 28.6692, 77.4538, []],
      ["Ludhiana", 19, 30.9010, 75.8573, []],
      ["Agra", 25, 27.1767, 78.0081, []],
      ["Nashik", 13, 19.9975, 73.7898, []],
      ["Faridabad", 7, 28.4089, 77.3178, []],
      ["Meerut", 25, 28.9845, 77.7064, []],
      ["Rajkot", 6, 22.3039, 70.8022, []],
      ["Varanasi", 25, 25.3176, 82.9739, ["Benares", "Kashi"]],
      ["Srinagar", 32, 34.0837, 74.7973, []],
      ["Amritsar", 19, 31.6340, 74.8723, []],
      ["Navi Mumbai", 13, 19.0330, 73.0297, []],
      ["Allahabad", 25, 25.4358, 81.8463, ["Prayagraj"]],
      ["Ranchi", 9, 23.3441, 85.3096, []],
      ["Jodhpur", 20, 26.2389, 73.0243, []],
      ["Guwahati", 2, 26.1445, 91.7362, []],
      ["Chandigarh", 29, 30.7333, 76.7794, []],
      ["Mysore", 10, 12.2958, 76.6394, ["Mysuru"]],
      ["Gurgaon", 7, 28.4595, 77.0266, ["Gurugram"]],
      ["Kochi", 11, 9.9312, 76.2673, ["Cochin"]],
      ["Dehradun", 26, 30.3165, 78.0322, []],
      ["Ujjain", 12, 23.1760, 75.7885, []]
    ];

    rawData.forEach(([name, stateIdx, lat, lon, aliases]) => {
      const cityObj = {
        name,
        state: this.states[stateIdx],
        lat,
        lon,
        timezone: this.DEFAULT_TIMEZONE,
        aliases: aliases.map(a => a.toLowerCase())
      };
      this.cityRegistry.set(name.toLowerCase(), cityObj);
      aliases.forEach(alias => {
        this.cityRegistry.set(alias.toLowerCase(), cityObj);
      });
    });
  }

  search(q) {
    if (!q) return [];
    const query = q.toLowerCase();
    const results = [];
    const seen = new Set();
    for (const [key, city] of this.cityRegistry) {
      if (key.includes(query) && !seen.has(city.name)) {
        results.push(city);
        seen.add(city.name);
      }
    }
    return results.slice(0, 8);
  }
}

const geo = new GeoEngine();

// --- Components ---

const GlassCard = ({ children, className = "", glow = false, intensity = "low" }) => (
  <div className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c121e]/60 backdrop-blur-3xl transition-all duration-700 hover:border-blue-500/30 ${glow ? 'shadow-[0_0_50px_rgba(37,99,235,0.15)]' : ''} ${className}`}>
    <div className={`absolute -top-[120px] -right-[120px] w-[300px] h-[300px] bg-blue-600/${intensity === 'high' ? '10' : '5'} blur-[120px] pointer-events-none`} />
    <div className="relative z-10">{children}</div>
  </div>
);

const TransitRadar = ({ active = false }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <div className="absolute inset-0 border border-blue-500/10 rounded-full" />
      <div className="absolute inset-[15%] border border-blue-500/10 rounded-full" />
      <div className="absolute inset-[30%] border border-blue-500/10 rounded-full" />
      
      {/* Radar Hand */}
      <div className={`absolute w-1/2 h-1 bg-gradient-to-r from-transparent to-blue-500/40 origin-left top-1/2 left-1/2 ${active ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
      
      {/* Planetary Blips */}
      {[
        { t: '10%', l: '20%', label: 'JU', color: 'bg-amber-400' },
        { t: '40%', l: '75%', label: 'SA', color: 'bg-blue-600' },
        { t: '80%', l: '35%', label: 'MA', color: 'bg-red-500' },
        { t: '15%', l: '60%', label: 'VE', color: 'bg-pink-400' },
      ].map((p, i) => (
        <div key={i} className="absolute flex flex-col items-center gap-1" style={{ top: p.t, left: p.l }}>
          <div className={`w-2 h-2 ${p.color} rounded-full shadow-[0_0_10px_currentColor] animate-pulse`} />
          <span className="text-[8px] font-black text-white/40 uppercase">{p.label}</span>
        </div>
      ))}
      
      <div className="relative z-10 flex flex-col items-center">
        <Compass size={32} className={`${active ? 'text-blue-500' : 'text-slate-600'} transition-colors`} />
        <span className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-tighter">Ascendant</span>
      </div>
    </div>
  );
};

const PanchangStrip = ({ city }) => {
  const data = [
    { label: 'Tithi', val: 'Shukla Navami', icon: <Moon size={14} /> },
    { label: 'Nakshatra', val: 'Rohini', icon: <Star size={14} /> },
    { label: 'Yoga', val: 'Sadhya', icon: <Waves size={14} /> },
    { label: 'Karana', val: 'Kaulava', icon: <Activity size={14} /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((item, i) => (
        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-2 text-blue-500 mb-1 group-hover:scale-110 transition-transform">
            {item.icon}
            <span className="text-[9px] font-black uppercase text-slate-500">{item.label}</span>
          </div>
          <p className="text-xs font-bold text-white tracking-tight">{item.val}</p>
        </div>
      ))}
    </div>
  );
};

const DashaProgress = () => {
  const planets = [
    { name: 'Ketu', end: '2028', p: 30, color: 'bg-slate-400' },
    { name: 'Venus', end: '2048', p: 0, color: 'bg-pink-400' },
    { name: 'Sun', end: '2054', p: 0, color: 'bg-yellow-400' },
    { name: 'Moon', end: '2064', p: 0, color: 'bg-blue-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Mahadasha</h4>
          <p className="text-2xl font-black text-white tracking-tighter">Ketu Period</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-500 uppercase">Phase Completion</p>
          <p className="text-lg font-black text-emerald-400 tracking-tighter">30.2%</p>
        </div>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: '30%' }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {planets.map((p, i) => (
          <div key={i} className={`h-1 rounded-full ${i === 0 ? p.color : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [aiResponse, setAiResponse] = useState("Veda Engine initialized. Deploying geospatial sync...");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const handleSearch = (q) => {
    setQuery(q);
    if (q.length > 1) {
      setSearchResults(geo.search(q));
    } else {
      setSearchResults([]);
    }
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    setQuery("");
    setSearchResults([]);
    triggerAi(`Analyze the current astrological transits for ${city.name}, ${city.state}. Provide specific geodetic insights.`, city);
  };

  const triggerAi = async (prompt, city = selectedCity) => {
    if (!prompt) return;
    setLoading(true);
    const apiKey = "";
    const ctx = city ? `Location: ${city.name}, Lat: ${city.lat}, Lon: ${city.lon}. Current Time: ${new Date().toISOString()}.` : "";
    const systemPrompt = `You are a high-level Vedic Intelligence System. Use provided geodetic context: ${ctx}. Focus on Muhurta, Dashas, and Transits. Be professional, analytical, and precise.`;

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
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Link severed.");
    } catch {
      setAiResponse("Signal interference detected.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#04070b] text-slate-300 p-4 md:p-8 selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Navigation / Search Header */}
        <header className="flex flex-col xl:flex-row items-center gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-blue-500/10">
              <Orbit size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none">VEDA<span className="text-blue-500">.INTEL</span></h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Planetary Operation System</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl relative">
            <div className="relative group">
              <SearchCode className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-400" size={20} />
              <input 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter Birth City (e.g., Delhi, Bangalore, Madras)..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#111827] border border-white/10 rounded-3xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                {searchResults.map((city, i) => (
                  <button 
                    key={i}
                    onClick={() => selectCity(city)}
                    className="w-full px-6 py-4 text-left hover:bg-blue-600/20 border-b border-white/5 last:border-0 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase">{city.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{city.state}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
              <span className="text-[9px] font-black text-slate-500 uppercase">UTC Sync</span>
              <span className="text-xs font-bold text-white">09:12:44</span>
            </div>
            <div className="px-6 py-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex flex-col items-center min-w-[120px]">
              <span className="text-[9px] font-black text-blue-400 uppercase">Status</span>
              <span className="text-xs font-bold text-emerald-400">Live Grid</span>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Local Context */}
          <div className="lg:col-span-4 space-y-8">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Compass size={18} className="text-blue-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Geodetic Radar</h3>
                </div>
                {selectedCity && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Tracking
                  </div>
                )}
              </div>
              <TransitRadar active={!!selectedCity} />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Longitude</p>
                  <p className="text-sm font-bold text-white">{selectedCity ? `${selectedCity.lon.toFixed(4)}°E` : '---'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Latitude</p>
                  <p className="text-sm font-bold text-white">{selectedCity ? `${selectedCity.lat.toFixed(4)}°N` : '---'}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar size={18} className="text-indigo-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Current Panchang</h3>
              </div>
              <PanchangStrip city={selectedCity} />
            </GlassCard>
          </div>

          {/* Column 2: Intelligence Hub */}
          <div className="lg:col-span-5 space-y-8">
            <GlassCard className="p-8" glow intensity="high">
              <div className="flex items-center gap-3 mb-8">
                <Milestone size={18} className="text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Dasha Sequencing</h3>
              </div>
              <DashaProgress />
            </GlassCard>

            <GlassCard className="p-1 min-h-[400px] flex flex-col bg-[#0f172a]/80">
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain size={20} className="text-blue-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Neural Interpretation</h3>
                </div>
                {loading && <Loader2 className="animate-spin text-blue-500" size={18} />}
              </div>
              <div className="flex-1 p-8 pt-0 overflow-y-auto max-h-[400px] custom-scrollbar">
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {aiResponse}
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && triggerAi(input)}
                    placeholder="Query specific transit impact..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-xs focus:outline-none focus:border-blue-500 transition-all font-medium"
                  />
                  <button 
                    onClick={() => triggerAi(input)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Column 3: Biometric / Tactical */}
          <div className="lg:col-span-3 space-y-8">
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <Target size={18} className="text-emerald-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Muhurta Tactical</h3>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Business Growth', p: 85, color: 'bg-emerald-500' },
                  { label: 'Deep Focus', p: 42, color: 'bg-amber-500' },
                  { label: 'Communication', p: 91, color: 'bg-blue-500' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="text-white">{m.p}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color}`} style={{ width: `${m.p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 rounded-[2.5rem] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
                <Sparkles size={40} className="text-white" />
              </div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Auspicious Window</p>
              <h4 className="text-3xl font-black text-white tracking-tighter leading-tight">Amrita <br/> Siddhi</h4>
              <p className="text-xs font-bold text-slate-500 mt-4 leading-relaxed uppercase">
                Peak alignment in <span className="text-white">2h 14m</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
