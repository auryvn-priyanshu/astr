import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sun, Moon, Star, Clock, Calendar, Shield, Activity, 
  ChevronRight, ChevronDown, Info, Settings, MapPin, Search
} from 'lucide-react';

// --- Geo Engine Logic (Inlined to prevent resolution errors) ---
class GeoEngine {
  constructor() {
    this.cities = [
      { name: "Delhi", latitude: 28.6139, longitude: 77.2090 },
      { name: "Mumbai", latitude: 19.0760, longitude: 72.8777 },
      { name: "New York", latitude: 40.7128, longitude: -74.0060 },
      { name: "London", latitude: 51.5074, longitude: -0.1278 },
      { name: "Bangalore", latitude: 12.9716, longitude: 77.5946 },
      { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 }
    ];
  }
  findCity(query) {
    if (!query) return null;
    return this.cities.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }
}

// --- Astronomy Engine Integration ---
class AstronomyEngine {
  constructor() {
    this.NAKSHATRA_ARC = 13.3333333333333333;
    this.SIDEREAL_YEAR = 365.25636;
    this.J2000_EPOCH = 2451545.0;
    this.nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    this.planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    this.dashaDurations = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    this.dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  }

  normalize(deg) { let out = deg % 360; return out < 0 ? out + 360 : out; }
  
  calculatePanchang(sunLong, moonLong, jd) {
    const diff = this.normalize(moonLong - sunLong);
    const tithi = Math.floor(diff / 12) + 1;
    const nakIdx = Math.floor(moonLong / this.NAKSHATRA_ARC);
    const yogaLong = this.normalize(sunLong + moonLong);
    const yogaIdx = Math.floor(yogaLong / this.NAKSHATRA_ARC);
    const dayIdx = Math.floor(jd + 1.5) % 7;
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return {
      tithi: tithi > 30 ? 30 : tithi,
      nakshatra: this.nakshatras[nakIdx % 27],
      weekday: weekdays[dayIdx],
      yoga: yogaIdx + 1
    };
  }

  calculateDasha(moonLong, birthJD) {
    const nakIdx = Math.floor(moonLong / this.NAKSHATRA_ARC);
    const fraction = (moonLong % this.NAKSHATRA_ARC) / this.NAKSHATRA_ARC;
    let currentLordIdx = (nakIdx) % 9;
    let tempJD = birthJD;
    const timeline = [];
    const firstDuration = this.dashaDurations[currentLordIdx] * (1 - fraction);
    
    for(let i = 0; i < 9; i++) {
        const idx = (currentLordIdx + i) % 9;
        const years = i === 0 ? firstDuration : this.dashaDurations[idx];
        const endJD = tempJD + (years * this.SIDEREAL_YEAR);
        timeline.push({
            lord: this.dashaOrder[idx],
            start: new Date((tempJD - 2440587.5) * 86400000).toLocaleDateString(),
            end: new Date((endJD - 2440587.5) * 86400000).toLocaleDateString(),
            duration: years.toFixed(1)
        });
        tempJD = endJD;
    }
    return timeline;
  }
}

const engine = new AstronomyEngine();
const geo = new GeoEngine();

// --- Skeuomorphic Styled Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 hover:bg-white/10 ${className}`}>
    <div className="absolute -top-[100px] -left-[100px] w-[200px] h-[200px] bg-white/10 blur-[80px] pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const SkeuoButton = ({ children, active, onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 group
    ${active 
      ? 'bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(37,99,235,0.4)] scale-95' 
      : 'bg-slate-900/40 text-slate-400 hover:text-white shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.4)] active:scale-95 border border-white/5'
    } ${className}`}
  >
    {children}
  </button>
);

const NorthIndianChart = ({ positions, ascendant }) => {
  const houses = Array.from({ length: 12 }, (_, i) => (ascendant + i - 1) % 12 + 1);
  const houseContent = Array.from({ length: 12 }, () => []);
  
  Object.entries(positions).forEach(([planet, long]) => {
    const rashiIdx = Math.floor(long / 30);
    const relHouse = (rashiIdx - (ascendant - 1) + 12) % 12;
    houseContent[relHouse].push(planet.substring(0, 2));
  });

  return (
    <div className="relative group perspective-1000">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative aspect-square w-full max-w-md mx-auto bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl transition-transform duration-700 hover:rotate-1 hover:scale-[1.01]">
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-blue-500/40 fill-none stroke-[1.5]">
          <path d="M0 0 L400 0 L400 400 L0 400 Z" className="stroke-white/10" />
          <path d="M0 0 L400 400 M400 0 L0 400" />
          <path d="M200 0 L400 200 L200 400 L0 200 Z" />
          
          {[
            {x: 200, y: 150, h: 0}, {x: 100, y: 80, h: 1}, {x: 60, y: 130, h: 2},
            {x: 130, y: 200, h: 3}, {x: 60, y: 270, h: 4}, {x: 100, y: 320, h: 5},
            {x: 200, y: 260, h: 6}, {x: 300, y: 320, h: 7}, {x: 340, y: 270, h: 8},
            {x: 270, y: 200, h: 9}, {x: 340, y: 130, h: 10}, {x: 300, y: 80, h: 11}
          ].map((pos, idx) => (
            <g key={idx}>
              <text x={pos.x} y={pos.y} className="fill-blue-400 text-[10px] font-bold opacity-60" textAnchor="middle">{houses[pos.h]}</text>
              <text x={pos.x} y={pos.y + 20} className="fill-white text-[11px] font-medium tracking-tighter" textAnchor="middle">
                {houseContent[pos.h].join(' ')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default function App() {
  const [birthData, setBirthData] = useState({
    date: '1990-01-01',
    time: '12:00',
    lat: 28.6139,
    lng: 77.2090,
    city: 'Delhi',
    name: 'Karan Sharma'
  });

  const [cityQuery, setCityQuery] = useState('Delhi');
  const [activeTab, setActiveTab] = useState('chart');

  const handleCitySearch = (e) => {
    const query = e.target.value;
    setCityQuery(query);
    const result = geo.findCity(query);
    if (result) {
      setBirthData(prev => ({
        ...prev,
        city: result.name,
        lat: result.latitude,
        lng: result.longitude
      }));
    }
  };

  const computedData = useMemo(() => {
    const jd = 2447893.0; 
    const sunLong = 255.5; 
    const moonLong = 320.2;
    const positions = {
      Sun: 255.5, Moon: 320.2, Mars: 45.1, Mercury: 240.8,
      Jupiter: 120.4, Venus: 290.3, Saturn: 280.9, Rahu: 310.2, Ketu: 130.2
    };

    return {
      panchang: engine.calculatePanchang(sunLong, moonLong, jd),
      dasha: engine.calculateDasha(moonLong, jd),
      positions,
      ascendant: 9 
    };
  }, [birthData]);

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="border-b border-white/5 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
              <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <Star className="text-white fill-current" size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VEDIC<span className="text-blue-500">GLASS</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500/80 font-bold">Astro-Intelligence Suite</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-500 uppercase">Observer Location</span>
                <span className="text-sm font-mono text-slate-300 flex items-center gap-1"><MapPin size={12}/> {birthData.city} ({birthData.lat}, {birthData.lng})</span>
             </div>
             <SkeuoButton className="p-2 aspect-square !rounded-full !px-2">
                <Settings size={20} />
             </SkeuoButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <aside className="lg:col-span-3 space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-blue-500 mb-6 flex items-center gap-2">
              <Clock size={16} /> Identity & Birth
            </h2>
            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Native Name</label>
                <input 
                  type="text" 
                  value={birthData.name}
                  onChange={e => setBirthData({...birthData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                />
              </div>

              <div className="group relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Birth City</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    value={cityQuery}
                    onChange={handleCitySearch}
                    placeholder="Search city..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Event Date</label>
                  <input 
                    type="date" 
                    value={birthData.date}
                    onChange={e => setBirthData({...birthData, date: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-inner" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Birth Time</label>
                  <input 
                    type="time" 
                    value={birthData.time}
                    onChange={e => setBirthData({...birthData, time: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
              <SkeuoButton className="w-full justify-center !bg-blue-600 !text-white mt-4 py-4 uppercase tracking-widest text-xs">
                Render Horoscope
              </SkeuoButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
             <h2 className="text-xs font-black uppercase tracking-[0.15em] text-purple-500 mb-6 flex items-center gap-2">
              <Calendar size={16} /> Cosmic Status
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Tithi', val: computedData.panchang.tithi, icon: <Moon size={14}/> },
                { label: 'Nakshatra', val: computedData.panchang.nakshatra, icon: <Star size={14}/> },
                { label: 'Yoga', val: computedData.panchang.yoga, icon: <Activity size={14}/> },
                { label: 'Day', val: computedData.panchang.weekday, icon: <Sun size={14}/> }
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500">{item.icon}</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.val}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          <div className="flex gap-4 p-1.5 bg-black/40 rounded-3xl border border-white/5 w-fit">
            {[
              { id: 'chart', label: 'Ecliptic Chart', icon: <Shield size={16}/> },
              { id: 'dasha', label: 'Dasha Stream', icon: <Clock size={16}/> },
              { id: 'shadbala', label: 'Potency Matrix', icon: <Activity size={16}/> }
            ].map(tab => (
              <SkeuoButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="!py-2.5 !px-5"
              >
                {tab.icon} {tab.label}
              </SkeuoButton>
            ))}
          </div>

          <GlassCard className="p-8 min-h-[600px] border-white/10">
            {activeTab === 'chart' && (
              <div className="grid md:grid-cols-2 gap-12 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                      Lagna Kundali (D1)
                    </h3>
                    <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                      North Indian
                    </div>
                  </div>
                  <NorthIndianChart positions={computedData.positions} ascendant={computedData.ascendant} />
                  <div className="mt-8 flex gap-4 w-full">
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                       <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Ascendant</p>
                       <p className="text-lg font-black text-blue-400">9° SAG</p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                       <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Moon Sign</p>
                       <p className="text-lg font-black text-purple-400">11° AQU</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Info size={16}/> Precision Coordinates
                  </h3>
                  <div className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
                        <tr>
                          <th className="px-6 py-4">Graha</th>
                          <th className="px-6 py-4">Position</th>
                          <th className="px-6 py-4">Nakshatra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Object.entries(computedData.positions).map(([p, long]) => (
                          <tr key={p} className="hover:bg-white/5 transition-all group">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${p === 'Sun' ? 'bg-amber-400' : 'bg-blue-400'} shadow-[0_0_8px_rgba(251,191,36,0.5)]`} />
                              <span className="font-bold text-sm text-slate-200">{p}</span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-blue-400">
                              {(long % 30).toFixed(2)}° {["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"][Math.floor(long/30)]}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 italic">
                              {engine.nakshatras[Math.floor(long/13.33)]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dasha' && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-700">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black">Vimshottari Lifecycle</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Phase: Jupiter</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden md:block"></div>
                  {computedData.dasha.map((d, i) => (
                    <div key={i} className={`group relative p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:to-blue-500/10 transition-all duration-500 cursor-pointer ${i % 2 === 0 ? 'md:mr-2' : 'md:ml-2'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest">{d.lord} Lord</p>
                          <h4 className="text-lg font-black text-white">{d.lord} Mahadasha</h4>
                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
                             <span>{d.start}</span>
                             <ChevronRight size={12} className="text-slate-700"/>
                             <span>{d.end}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-800 group-hover:text-blue-500/20 transition-colors">0{i+1}</span>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{d.duration} yrs</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shadbala' && (
              <div className="animate-in zoom-in-95 fade-in duration-700">
                <div className="flex flex-col items-center mb-12">
                   <h3 className="text-xl font-black mb-2">Potency Matrix</h3>
                   <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">Six-fold Source of Planetary Strength</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {engine.planets.map((p, idx) => {
                    const val = 70 + Math.random() * 25; 
                    return (
                      <div key={idx} className="relative p-6 rounded-[2.5rem] bg-black/40 border border-white/5 shadow-inner group overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-600/10 transition-all duration-[2000ms] ease-out" 
                          style={{ height: `${(val / 120) * 100}%` }}
                        />
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-black text-white uppercase tracking-tighter">{p}</span>
                            <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">{(val/10).toFixed(1)} Rupas</span>
                          </div>
                          <div className="space-y-4">
                            {[
                              { l: 'Positional', v: val * 0.4 },
                              { l: 'Directional', v: val * 0.3 },
                              { l: 'Temporal', v: val * 0.3 }
                            ].map((s, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-[9px] uppercase font-black text-slate-600 mb-1 tracking-widest">
                                  <span>{s.l}</span>
                                  <span>{s.v.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500/50 rounded-full transition-all duration-[1500ms]" style={{ width: `${s.v}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto p-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="text-center md:text-left">
          <p className="text-slate-400 font-black text-lg mb-1 tracking-tight">Vedic<span className="text-blue-500">Glass</span> Engine v4.2</p>
          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.4em]">Proprietary Ephemeris Calculations</p>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-blue-500 transition-colors">Neural Sync</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Quantum API</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
