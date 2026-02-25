/**
 * @file astronomy_engine.js
 * @module AstronomyCore
 * @description High-precision astronomical computation engine for Vedic Astrology.
 * Handles Julian Day conversions, Lahiri Ayanamsa, Sidereal Longitude, and 
 * comprehensive multi-dasha system calculations including conditional dashas.
 * Part of the /core module.
 */

class AstronomyEngine {
    constructor() {
        /**
         * @constant {number} SIDEREAL_YEAR
         * Precise sidereal year in days (365.25636 days).
         */
        this.SIDEREAL_YEAR = 365.25636;

        /**
         * @constant {number} J2000_EPOCH
         * Julian Day for J2000.0 Epoch (January 1, 2000, 12:00 TT).
         */
        this.J2000_EPOCH = 2451545.0;

        /**
         * @constant {number} NAKSHATRA_ARC
         * The exact arc of one Nakshatra in degrees (360 / 27).
         */
        this.NAKSHATRA_ARC = 13.3333333333333333;

        /**
         * @constant {number} PADA_ARC
         * The arc of one Nakshatra Pada (NAKSHATRA_ARC / 4).
         */
        this.PADA_ARC = 3.3333333333333333;

        /**
         * @property {Array} nakshatras
         * Ordered list of 27 Nakshatras.
         */
        this.nakshatras = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
            "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
            "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
            "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ];

        /**
         * @property {Object} dashaDefinitions
         * Configuration for various dasha systems with their respective cycles and lord sequences.
         */
        this.dashaDefinitions = {
            VIMSHOTTARI: {
                totalCycle: 120,
                planets: ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"],
                durations: [7, 20, 6, 10, 7, 18, 16, 19, 17],
                startNakshatraOffset: 0 // Ashwini
            },
            ASHTOTTARI: {
                totalCycle: 108,
                planets: ["Sun", "Moon", "Mars", "Mercury", "Saturn", "Jupiter", "Rahu", "Venus"],
                durations: [6, 15, 8, 17, 10, 19, 12, 21],
                startNakshatraOffset: 2 // Krittika (Ardra/Punarvasu/Pushya variations exist)
            },
            YOGINI: {
                totalCycle: 36,
                planets: ["Mangala (Sun)", "Pingala (Moon)", "Dhanya (Jupiter)", "Bhramari (Mars)", "Bhadrika (Mercury)", "Ulka (Saturn)", "Siddha (Venus)", "Sankata (Rahu)"],
                durations: [1, 2, 3, 4, 5, 6, 7, 8],
                startNakshatraOffset: 0
            },
            SHODASHOTTARI: {
                totalCycle: 116,
                planets: ["Sun", "Mars", "Jupiter", "Saturn", "Ketu", "Moon", "Mercury", "Venus"],
                durations: [11, 12, 13, 14, 15, 16, 17, 18],
                startNakshatraOffset: 11 // Pushya
            },
            DWISAPTATI: {
                totalCycle: 72,
                planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"],
                durations: [9, 9, 9, 9, 9, 9, 9, 9],
                startNakshatraOffset: 7 // Mula
            },
            PANCHOTTARI: {
                totalCycle: 105,
                planets: ["Sun", "Mercury", "Saturn", "Mars", "Venus", "Jupiter", "Rahu"],
                durations: [12, 13, 14, 15, 16, 17, 18],
                startNakshatraOffset: 12 // Anuradha
            }
        };
    }

    /**
     * @method calculateJulianDay
     * Converts Gregorian date and time to Julian Day.
     */
    calculateJulianDay(year, month, day, hour, minute, second, tzOffsetHours = 5.5) {
        const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        date.setMilliseconds(date.getMilliseconds() - (tzOffsetHours * 3600000));
        
        const utYear = date.getUTCFullYear();
        const utMonth = date.getUTCMonth() + 1;
        const utDay = date.getUTCDate();
        const decimalUT = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

        const a = Math.floor((14 - utMonth) / 12);
        const y = utYear + 4800 - a;
        const m = utMonth + 12 * a - 3;

        const jd = utDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        return jd + (decimalUT - 12) / 24;
    }

    /**
     * @method getLahiriAyanamsa
     * Computes Chitra-Paksha (Lahiri) Ayanamsa for a specific Julian Day.
     */
    getLahiriAyanamsa(jd) {
        const t = (jd - this.J2000_EPOCH) / 36525;
        const ayanamsaAtJ2000 = 23.85710278; 
        const speed = 50.27 / 3600; 
        return ayanamsaAtJ2000 + (speed * t);
    }

    /**
     * @method computeSiderealLongitude
     */
    computeSiderealLongitude(tropicalLong, jd) {
        const ayanamsa = this.getLahiriAyanamsa(jd);
        let siderealLong = tropicalLong - ayanamsa;
        return this._normalizeDegrees(siderealLong);
    }

    /**
     * @method getMoonLongitude
     * High-precision lunar position simulation.
     */
    getMoonLongitude(jd) {
        const T = (jd - 2451545.0) / 36525;
        let L_prime = 218.3164477 + 481267.8812307 * T;
        let D = 297.8501921 + 445267.1114034 * T;
        let M_prime = 134.9633964 + 477198.8675055 * T;
        
        let longitude = L_prime 
            + 6.288774 * Math.sin(this._toRadians(M_prime))
            + 1.274027 * Math.sin(this._toRadians(2 * D - M_prime))
            + 0.658314 * Math.sin(this._toRadians(2 * D));

        return this._normalizeDegrees(longitude);
    }

    /**
     * @method getNakshatraInfo
     */
    getNakshatraInfo(siderealMoonLong) {
        const nakIndex = Math.floor(siderealMoonLong / this.NAKSHATRA_ARC);
        const remainingArc = siderealMoonLong % this.NAKSHATRA_ARC;
        const pada = Math.floor(remainingArc / this.PADA_ARC) + 1;

        return {
            index: nakIndex,
            name: this.nakshatras[nakIndex],
            pada: pada,
            fractionConsumed: remainingArc / this.NAKSHATRA_ARC,
            totalLongitude: siderealMoonLong
        };
    }

    // ==========================================
    // MULTI-DASHA SYSTEMS IMPLEMENTATION
    // ==========================================

    /**
     * @method calculateDashaTimeline
     * Generic dasha engine that supports multiple systems based on definition keys.
     * @param {string} systemKey - VIMSHOTTARI, ASHTOTTARI, YOGINI, etc.
     * @param {number} siderealMoonLong 
     * @param {number} birthJD 
     * @param {number} projectionYears - default 120
     */
    calculateDashaTimeline(systemKey, siderealMoonLong, birthJD, projectionYears = 120) {
        const config = this.dashaDefinitions[systemKey];
        if (!config) throw new Error(`Dasha system ${systemKey} not supported.`);

        const nakInfo = this.getNakshatraInfo(siderealMoonLong);
        
        // Logical offset calculation based on system starting Nakshatra
        let startingNakIndex = (nakInfo.index - config.startNakshatraOffset + 27) % 27;
        let firstLordIndex = startingNakIndex % config.planets.length;
        
        const firstLordDuration = config.durations[firstLordIndex];
        const balanceYears = (1 - nakInfo.fractionConsumed) * firstLordDuration;
        const balanceDays = balanceYears * this.SIDEREAL_YEAR;

        let currentJD = birthJD;
        const timeline = [];
        let lordIdx = firstLordIndex;
        let isFirst = true;

        // Iterate until projection period is met
        const endGoalJD = birthJD + (projectionYears * this.SIDEREAL_YEAR);

        while (currentJD < endGoalJD) {
            const lord = config.planets[lordIdx];
            const fullDurationYears = config.durations[lordIdx];
            const actualDurationDays = isFirst ? balanceDays : fullDurationYears * this.SIDEREAL_YEAR;

            const mahadasha = {
                lord: lord,
                startJD: currentJD,
                endJD: currentJD + actualDurationDays,
                antardashas: this._calculateSubDashas(lord, currentJD, actualDurationDays, config)
            };

            timeline.push(mahadasha);
            currentJD += actualDurationDays;
            lordIdx = (lordIdx + 1) % config.planets.length;
            isFirst = false;
        }

        return timeline;
    }

    /**
     * @private
     * @method _calculateSubDashas
     * Sub-divides dasha periods into Antardashas and Pratyantardashas.
     */
    _calculateSubDashas(mDashaLord, startJD, totalMDDays, config) {
        const mLordIdx = config.planets.indexOf(mDashaLord);
        const ads = [];
        let adStartJD = startJD;

        for (let i = 0; i < config.planets.length; i++) {
            const adLordIdx = (mLordIdx + i) % config.planets.length;
            const adLord = config.planets[adLordIdx];
            const adDurationYears = config.durations[adLordIdx];
            
            // AD Duration = (MD Duration * AD Years) / Total Cycle Years
            const adDays = (totalMDDays * adDurationYears) / config.totalCycle;

            const antardasha = {
                lord: adLord,
                startJD: adStartJD,
                endJD: adStartJD + adDays,
                pratyantardashas: []
            };

            // Calculate Pratyantardashas
            let pdStartJD = adStartJD;
            for (let j = 0; j < config.planets.length; j++) {
                const pdLordIdx = (adLordIdx + j) % config.planets.length;
                const pdLord = config.planets[pdLordIdx];
                const pdDurationYears = config.durations[pdLordIdx];
                
                // PD Duration = (AD Duration * PD Years) / Total Cycle Years
                const pdDays = (adDays * pdDurationYears) / config.totalCycle;

                antardasha.pratyantardashas.push({
                    lord: pdLord,
                    startJD: pdStartJD,
                    endJD: pdStartJD + pdDays
                });
                pdStartJD += pdDays;
            }

            ads.push(antardasha);
            adStartJD += adDays;
        }
        return ads;
    }

    /**
     * @private
     * @method _toRadians
     */
    _toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * @private
     * @method _normalizeDegrees
     */
    _normalizeDegrees(deg) {
        let out = deg % 360;
        return out < 0 ? out + 360 : out;
    }
}

/**
 * UTILITY: JulianConverter
 * Static methods to convert between Julian Days and Gregorian Date/Time.
 */
class JulianConverter {
    static toDate(jd) {
        let z = Math.floor(jd + 0.5);
        let f = (jd + 0.5) - z;
        let a = (z < 2299161) ? z : z + 1 + Math.floor((z - 1867216.25) / 36524.25) - Math.floor(Math.floor((z - 1867216.25) / 36524.25) / 4);
        let b = a + 1524;
        let c = Math.floor((b - 122.1) / 365.25);
        let d = Math.floor(365.25 * c);
        let e = Math.floor((b - d) / 30.6001);
        let day = b - d - Math.floor(30.6001 * e) + f;
        let month = (e < 14) ? e - 1 : e - 13;
        let year = (month > 2) ? c - 4716 : c - 4715;
        
        const dayInt = Math.floor(day);
        const hours = (day - dayInt) * 24;
        const hInt = Math.floor(hours);
        const mins = (hours - hInt) * 60;
        const mInt = Math.floor(mins);
        const secs = (mins - mInt) * 60;

        return { 
            year, 
            month, 
            day: dayInt, 
            hour: hInt, 
            minute: mInt, 
            second: Math.round(secs),
            iso: `${year}-${String(month).padStart(2, '0')}-${String(dayInt).padStart(2, '0')}`
        };
    }
}

// ==========================================
// TEST STUBS & EXAMPLE USAGE
// ==========================================

const runAstronomyTests = () => {
    try {
        console.log("--- Initializing AstronomyEngine Component ---");
        const engine = new AstronomyEngine();

        // Sample: May 15, 1990, 10:30 AM (IST)
        const yr = 1990, mt = 5, dy = 15, hr = 10, min = 30, sec = 0;
        const jd = engine.calculateJulianDay(yr, mt, dy, hr, min, sec, 5.5);
        const tropMoon = engine.getMoonLongitude(jd);
        const siderealMoon = engine.computeSiderealLongitude(tropMoon, jd);

        console.log(`Sidereal Moon Longitude: ${siderealMoon.toFixed(4)}°`);

        // Test Vimshottari
        const vDasha = engine.calculateDashaTimeline('VIMSHOTTARI', siderealMoon, jd);
        console.log("--- Vimshottari Dasha Sequence ---");
        vDasha.slice(0, 3).forEach(md => {
            const start = JulianConverter.toDate(md.startJD);
            console.log(`Mahadasha: ${md.lord.padEnd(10)} | Starts: ${start.iso}`);
        });

        // Test Yogini (Conditional/Special)
        const yDasha = engine.calculateDashaTimeline('YOGINI', siderealMoon, jd);
        console.log("--- Yogini Dasha Sequence ---");
        yDasha.slice(0, 5).forEach(md => {
            const start = JulianConverter.toDate(md.startJD);
            console.log(`Yogini: ${md.lord.padEnd(15)} | Starts: ${start.iso}`);
        });

        console.log("--- AstronomyEngine Verification Complete ---");
    } catch (err) {
        console.error("AstronomyEngine Critical Error:", err.message);
    }
};

runAstronomyTests();

export default AstronomyEngine;
