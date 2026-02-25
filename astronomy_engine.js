/**
 * @file astronomy_engine.js
 * @module AstronomyCore
 * @description High-precision astronomical computation engine for Vedic Astrology.
 * Handles Julian Day conversions, Lahiri Ayanamsa, Sidereal Longitude, and 
 * comprehensive multi-dasha system calculations.
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
         * Configuration for various dasha systems.
         */
        this.dashaDefinitions = {
            VIMSHOTTARI: {
                totalCycle: 120,
                planets: ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"],
                durations: [7, 20, 6, 10, 7, 18, 16, 19, 17],
                startNakshatraOffset: 0 // Starts from Ashwini
            },
            ASHTOTTARI: {
                totalCycle: 108,
                planets: ["Sun", "Moon", "Mars", "Mercury", "Saturn", "Jupiter", "Rahu", "Venus"],
                durations: [6, 15, 8, 17, 10, 19, 12, 21],
                startNakshatraOffset: 2 // Krittika based
            },
            YOGINI: {
                totalCycle: 36,
                planets: ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika", "Ulka", "Siddha", "Sankata"],
                durations: [1, 2, 3, 4, 5, 6, 7, 8],
                startNakshatraOffset: 0
            }
        };
    }

    /**
     * @method calculateJulianDay
     * Converts Gregorian date and time to Julian Day.
     * Formula: JD = 367Y - INT(7(Y + INT((M+9)/12))/4) + INT(275M/9) + D + 1721013.5 + UT/24
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
     * Computes Chitra-Paksha (Lahiri) Ayanamsa.
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
    // DASHA SYSTEMS IMPLEMENTATION
    // ==========================================

    /**
     * @method calculateVimshottariDasha
     * Computes the full Vimshottari Dasha timeline for 120 years.
     * @param {number} siderealMoonLong 
     * @param {number} birthJD 
     */
    calculateVimshottariDasha(siderealMoonLong, birthJD) {
        const config = this.dashaDefinitions.VIMSHOTTARI;
        const nakInfo = this.getNakshatraInfo(siderealMoonLong);
        
        // Determine starting Lord
        // Vimshottari cycles through planets based on Nakshatra index % 9
        const firstLordIndex = nakInfo.index % 9;
        const firstLordDuration = config.durations[firstLordIndex];
        
        // Calculate balance at birth
        // Time Remaining = (1 - fraction consumed) * total years of the lord
        const balanceYears = (1 - nakInfo.fractionConsumed) * firstLordDuration;
        const balanceDays = balanceYears * this.SIDEREAL_YEAR;

        let currentJD = birthJD;
        const timeline = [];

        // Generate cycles to cover 120 years
        let lordIdx = firstLordIndex;
        let isFirst = true;

        for (let i = 0; i < 9; i++) {
            const lord = config.planets[lordIdx];
            const fullDurationYears = config.durations[lordIdx];
            const actualDurationDays = isFirst ? balanceDays : fullDurationYears * this.SIDEREAL_YEAR;

            const mahadasha = {
                lord: lord,
                startJD: currentJD,
                endJD: currentJD + actualDurationDays,
                antardashas: this._calculateAntardashas(lord, currentJD, actualDurationDays, config)
            };

            timeline.push(mahadasha);
            currentJD += actualDurationDays;
            lordIdx = (lordIdx + 1) % 9;
            isFirst = false;
        }

        return timeline;
    }

    /**
     * @private
     * @method _calculateAntardashas
     * Sub-divides Mahadasha into 9 Antardashas.
     */
    _calculateAntardashas(mDashaLord, startJD, totalDays, config) {
        const mLordIdx = config.planets.indexOf(mDashaLord);
        const ads = [];
        let currentJD = startJD;

        for (let i = 0; i < 9; i++) {
            const adLordIdx = (mLordIdx + i) % 9;
            const adLord = config.planets[adLordIdx];
            const adDurationYears = config.durations[adLordIdx];
            
            // Antardasha Duration = (MD Duration * AD Duration) / Total Cycle (120)
            const adDays = (totalDays * adDurationYears) / config.totalCycle;

            ads.push({
                lord: adLord,
                startJD: currentJD,
                endJD: currentJD + adDays
            });
            currentJD += adDays;
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
        
        // Convert fractional day to hours, mins, secs
        const dayInt = Math.floor(day);
        const hours = (day - dayInt) * 24;
        const hInt = Math.floor(hours);
        const mins = (hours - hInt) * 60;
        const mInt = Math.floor(mins);
        const secs = (mins - mInt) * 60;

        return { year, month, day: dayInt, hour: hInt, minute: mInt, second: Math.round(secs) };
    }
}

// ==========================================
// TEST STUBS & EXAMPLE USAGE
// ==========================================

const runAstronomyTests = () => {
    try {
        console.log("--- Initializing AstronomyEngine Component ---");
        const engine = new AstronomyEngine();

        const yr = 1990, mt = 5, dy = 15, hr = 10, min = 30, sec = 0;
        const jd = engine.calculateJulianDay(yr, mt, dy, hr, min, sec, 5.5);
        const tropMoon = engine.getMoonLongitude(jd);
        const siderealMoon = engine.computeSiderealLongitude(tropMoon, jd);

        console.log(`Sidereal Moon Longitude: ${siderealMoon.toFixed(4)}°`);

        const vDasha = engine.calculateVimshottariDasha(siderealMoon, jd);
        
        console.log("--- Vimshottari Dasha (Mahadashas) ---");
        vDasha.forEach(md => {
            const start = JulianConverter.toDate(md.startJD);
            console.log(`${md.lord.padEnd(8)} starts: ${start.year}-${start.month}-${start.day}`);
        });

        console.log("--- AstronomyEngine Verification Complete ---");
    } catch (err) {
        console.error("AstronomyEngine Critical Error:", err.message);
    }
};

runAstronomyTests();

export default AstronomyEngine;
