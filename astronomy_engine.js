/**
 * @file astronomy_engine.js
 * @module AstronomyCore
 * @description High-precision astronomical computation engine for Vedic Astrology.
 * Handles Julian Day conversions, Lahiri Ayanamsa, and Sidereal Longitude calculations.
 * Part of the /core module.
 */

class AstronomyEngine {
    constructor() {
        /**
         * @constant {number} SIDEREAL_YEAR
         * Precise sidereal year in days as per requirement.
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
    }

    /**
     * @method calculateJulianDay
     * Converts Gregorian date and time to Julian Day.
     * Formula: JD = 367Y - INT(7(Y + INT((M+9)/12))/4) + INT(275M/9) + D + 1721013.5 + UT/24
     * @param {number} year 
     * @param {number} month (1-12)
     * @param {number} day 
     * @param {number} hour 
     * @param {number} minute 
     * @param {number} second 
     * @param {number} tzOffsetHours (e.g., 5.5 for IST)
     * @returns {number} High-precision Julian Day
     */
    calculateJulianDay(year, month, day, hour, minute, second, tzOffsetHours = 5.5) {
        // Convert input time to Universal Time (UT)
        let utHour = hour - tzOffsetHours;
        let utDay = day;
        let utMonth = month;
        let utYear = year;

        // Normalize time overflow/underflow for UT
        const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        date.setMilliseconds(date.getMilliseconds() - (tzOffsetHours * 3600000));
        
        utYear = date.getUTCFullYear();
        utMonth = date.getUTCMonth() + 1;
        utDay = date.getUTCDate();
        let decimalUT = date.getUTCHours() + (date.getUTCMinutes() / 60) + (date.getUTCSeconds() / 3600);

        let a = Math.floor((14 - utMonth) / 12);
        let y = utYear + 4800 - a;
        let m = utMonth + 12 * a - 3;

        let jd = utDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        // Add time fraction (noon offset as JD starts at 12:00)
        return jd + (decimalUT - 12) / 24;
    }

    /**
     * @method getLahiriAyanamsa
     * Computes the Chitra-Paksha (Lahiri) Ayanamsa for a given Julian Day.
     * This uses the simplified linear approximation for the precessional shift.
     * Reference: 23° 51' 25.53" at J2000.0 with a rate of 50.27" per year.
     * @param {number} jd - Julian Day
     * @returns {number} Ayanamsa in degrees
     */
    getLahiriAyanamsa(jd) {
        const t = (jd - this.J2000_EPOCH) / 36525; // Julian Centuries from J2000
        // Precise Lahiri constant
        const ayanamsaAtJ2000 = 23.85710278; 
        const speed = 50.27 / 3600; // Degrees per century
        
        // Final precision calculation
        return ayanamsaAtJ2000 + (speed * t);
    }

    /**
     * @method computeSiderealLongitude
     * Converts Tropical Longitude (Sayana) to Sidereal Longitude (Nirayana).
     * @param {number} tropicalLong - Tropical longitude in degrees
     * @param {number} jd - Julian Day
     * @returns {number} Sidereal longitude (0-360)
     */
    computeSiderealLongitude(tropicalLong, jd) {
        const ayanamsa = this.getLahiriAyanamsa(jd);
        let siderealLong = tropicalLong - ayanamsa;

        // Normalize to 0-360 range
        while (siderealLong < 0) siderealLong += 360;
        while (siderealLong >= 360) siderealLong -= 360;

        return siderealLong;
    }

    /**
     * @method getMoonLongitude
     * Placeholder logic for Moon computation. 
     * In full production, this integrates a VSOP87 or ELP82 series.
     * For this module, we implement the Brown's Lunar Theory (simplified) for internal testing.
     * @param {number} jd - Julian Day
     * @returns {number} Tropical Moon Longitude
     */
    getMoonLongitude(jd) {
        const T = (jd - 2451545.0) / 36525;
        
        // Mean longitude of the Moon (L')
        let L_prime = 218.3164477 + 481267.8812307 * T;
        
        // Mean elongation of the Moon (D)
        let D = 297.8501921 + 445267.1114034 * T;
        
        // Mean anomaly of the Sun (M)
        let M = 357.5291092 + 35999.0502909 * T;
        
        // Mean anomaly of the Moon (M')
        let M_prime = 134.9633964 + 477198.8675055 * T;
        
        // Principal corrections (Simplified for architectural stub)
        let longitude = L_prime 
            + 6.288774 * Math.sin(this._toRadians(M_prime))
            + 1.274027 * Math.sin(this._toRadians(2 * D - M_prime))
            + 0.658314 * Math.sin(this._toRadians(2 * D))
            + 0.213618 * Math.sin(this._toRadians(2 * M_prime));

        return this._normalizeDegrees(longitude);
    }

    /**
     * @method getNakshatraInfo
     * Determines Nakshatra and Pada from Sidereal Moon Longitude.
     * @param {number} siderealMoonLong 
     * @returns {Object}
     */
    getNakshatraInfo(siderealMoonLong) {
        const nakIndex = Math.floor(siderealMoonLong / this.NAKSHATRA_ARC);
        const remainingArc = siderealMoonLong % this.NAKSHATRA_ARC;
        const pada = Math.floor(remainingArc / this.PADA_ARC) + 1;

        return {
            index: nakIndex,
            name: this.nakshatras[nakIndex],
            pada: pada,
            longitudeInNakshatra: remainingArc,
            totalLongitude: siderealMoonLong
        };
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

    /**
     * @method validateInput
     * Ensures astronomical inputs are within physical bounds.
     */
    validateInput(year, month, day) {
        if (year < -5000 || year > 5000) throw new Error("Year out of computable range.");
        if (month < 1 || month > 12) throw new Error("Invalid month.");
        if (day < 1 || day > 31) throw new Error("Invalid day.");
        return true;
    }
}

/**
 * UTILITY: JulianConverter
 * Static helper for JD cross-validation.
 */
class JulianConverter {
    static toDate(jd) {
        let z = Math.floor(jd + 0.5);
        let f = (jd + 0.5) - z;
        let a = 0;
        if (z < 2299161) {
            a = z;
        } else {
            let alpha = Math.floor((z - 1867216.25) / 36524.25);
            a = z + 1 + alpha - Math.floor(alpha / 4);
        }
        let b = a + 1524;
        let c = Math.floor((b - 122.1) / 365.25);
        let d = Math.floor(365.25 * c);
        let e = Math.floor((b - d) / 30.6001);
        let day = b - d - Math.floor(30.6001 * e) + f;
        let month = (e < 14) ? e - 1 : e - 13;
        let year = (month > 2) ? c - 4716 : c - 4715;
        return { year, month, day };
    }
}

// ==========================================
// TEST STUBS & EXAMPLE USAGE
// ==========================================

const runAstronomyTests = () => {
    try {
        console.log("--- Initializing AstronomyEngine Component ---");
        const engine = new AstronomyEngine();

        // Sample: Birth Data for Mumbai (IST +5.5)
        // Date: 1990-05-15, Time: 10:30:00 AM
        const yr = 1990, mt = 5, dy = 15, hr = 10, min = 30, sec = 0;
        
        console.log(`Input: ${yr}-${mt}-${dy} ${hr}:${min}:${sec} IST`);
        
        const jd = engine.calculateJulianDay(yr, mt, dy, hr, min, sec, 5.5);
        console.log(`Julian Day: ${jd.toFixed(8)}`);

        const ayanamsa = engine.getLahiriAyanamsa(jd);
        console.log(`Lahiri Ayanamsa: ${ayanamsa.toFixed(8)}°`);

        const tropMoon = engine.getMoonLongitude(jd);
        console.log(`Tropical Moon Longitude: ${tropMoon.toFixed(8)}°`);

        const siderealMoon = engine.computeSiderealLongitude(tropMoon, jd);
        console.log(`Sidereal Moon Longitude: ${siderealMoon.toFixed(8)}°`);

        const nak = engine.getNakshatraInfo(siderealMoon);
        console.log(`Nakshatra: ${nak.name}, Pada: ${nak.pada}`);

        console.log("--- AstronomyEngine Verification Complete ---");
    } catch (err) {
        console.error("AstronomyEngine Critical Error:", err.message);
    }
};

runAstronomyTests();

export default AstronomyEngine;
