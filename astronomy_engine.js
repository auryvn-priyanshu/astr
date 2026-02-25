/**
 * @file astronomy_engine.js
 * @module AstronomyCore
 * @description High-precision astronomical computation engine for Vedic Astrology.
 * Integrated Version: Dasha Systems + Shadbala + Ashtakavarga + Varga + Panchang + Muhurta.
 */

class AstronomyEngine {
    constructor() {
        /** @constant {number} SIDEREAL_YEAR Precise sidereal year in days */
        this.SIDEREAL_YEAR = 365.25636;
        /** @constant {number} J2000_EPOCH Reference epoch */
        this.J2000_EPOCH = 2451545.0;
        /** @constant {number} NAKSHATRA_ARC Arc of one Nakshatra (360/27) */
        this.NAKSHATRA_ARC = 13.3333333333333333;
        /** @constant {number} PADA_ARC Arc of one Pada (1/4 of Nakshatra) */
        this.PADA_ARC = 3.3333333333333333;

        this.nakshatras = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
            "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
            "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
            "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ];

        this.yogas = [
            "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda",
            "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
            "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha",
            "Shiva", "Siddha", "Sadhya", "Subha", "Sukla", "Brahma", "Indra", "Vaidhriti"
        ];

        this.karanas = [
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Shakuni", "Chatushpada", "Naga", "Kintughna"
        ];

        this.tithis = [
            "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi",
            "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
            "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
        ];

        this.exaltationPoints = {
            "Sun": 10, "Moon": 33, "Mars": 298, "Mercury": 165,
            "Jupiter": 95, "Venus": 357, "Saturn": 200
        };

        this.naisargikaBalaValues = {
            "Sun": 60.00, "Moon": 51.43, "Venus": 42.86, "Jupiter": 34.29,
            "Mercury": 25.71, "Mars": 17.14, "Saturn": 8.57
        };

        // Ashtakavarga Benefic Points (relative to planet's position)
        this.ashtakavargaRules = {
            Sun: {
                Sun: [1, 2, 4, 7, 8, 9, 10, 11],
                Moon: [3, 6, 10, 11],
                Mars: [1, 2, 4, 7, 8, 9, 10, 11],
                Mercury: [3, 5, 6, 9, 10, 11, 12],
                Jupiter: [5, 6, 9, 11],
                Venus: [6, 7, 12],
                Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
                Asc: [3, 4, 6, 10, 11, 12]
            },
            Moon: {
                Sun: [3, 6, 7, 8, 10, 11],
                Moon: [1, 3, 6, 7, 10, 11],
                Mars: [2, 3, 5, 6, 9, 10, 11],
                Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
                Jupiter: [1, 4, 7, 8, 10, 11, 12],
                Venus: [3, 4, 5, 7, 9, 10, 11],
                Saturn: [3, 5, 6, 11],
                Asc: [3, 6, 10, 11]
            },
            Mars: {
                Sun: [3, 5, 6, 10, 11],
                Moon: [3, 6, 11],
                Mars: [1, 2, 4, 7, 8, 10, 11],
                Mercury: [3, 5, 6, 11],
                Jupiter: [6, 10, 11, 12],
                Venus: [6, 8, 11, 12],
                Saturn: [1, 4, 7, 8, 9, 10, 11],
                Asc: [1, 3, 6, 10, 11]
            },
            Mercury: {
                Sun: [5, 6, 9, 11, 12],
                Moon: [2, 4, 6, 8, 10, 11],
                Mars: [1, 2, 4, 7, 8, 9, 10, 11],
                Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
                Jupiter: [6, 8, 11, 12],
                Venus: [1, 2, 3, 4, 5, 8, 9, 11],
                Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
                Asc: [1, 2, 4, 6, 8, 10, 11]
            },
            Jupiter: {
                Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
                Moon: [2, 5, 7, 9, 11],
                Mars: [1, 2, 4, 7, 8, 10, 11],
                Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
                Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
                Venus: [2, 5, 6, 9, 10, 11],
                Saturn: [3, 5, 6, 12],
                Asc: [1, 2, 4, 5, 6, 7, 9, 10, 11]
            },
            Venus: {
                Sun: [8, 11, 12],
                Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
                Mars: [3, 5, 6, 9, 11, 12],
                Mercury: [3, 5, 6, 9, 11],
                Jupiter: [5, 8, 9, 10, 11],
                Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
                Saturn: [3, 4, 5, 8, 9, 10, 11],
                Asc: [1, 2, 3, 4, 5, 8, 9, 11]
            },
            Saturn: {
                Sun: [1, 2, 4, 7, 8, 10, 11],
                Moon: [3, 6, 11],
                Mars: [3, 5, 6, 10, 11, 12],
                Mercury: [6, 8, 9, 10, 11, 12],
                Jupiter: [5, 6, 11, 12],
                Venus: [6, 11, 12],
                Saturn: [3, 5, 6, 11],
                Asc: [1, 3, 4, 6, 10, 11]
            }
        };

        this.dashaDefinitions = {
            VIMSHOTTARI: { totalCycle: 120, planets: ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"], durations: [7, 20, 6, 10, 7, 18, 16, 19, 17], startNakshatraOffset: 0 },
            ASHTOTTARI: { totalCycle: 108, planets: ["Sun", "Moon", "Mars", "Mercury", "Saturn", "Jupiter", "Rahu", "Venus"], durations: [6, 15, 8, 17, 10, 19, 12, 21], startNakshatraOffset: 2 },
            YOGINI: { totalCycle: 36, planets: ["Mangala (Sun)", "Pingala (Moon)", "Dhanya (Jupiter)", "Bhramari (Mars)", "Bhadrika (Mercury)", "Ulka (Saturn)", "Siddha (Venus)", "Sankata (Rahu)"], durations: [1, 2, 3, 4, 5, 6, 7, 8], startNakshatraOffset: 0 },
            SHODASHOTTARI: { totalCycle: 116, planets: ["Sun", "Mars", "Jupiter", "Saturn", "Ketu", "Moon", "Mercury", "Venus"], durations: [11, 12, 13, 14, 15, 16, 17, 18], startNakshatraOffset: 11 },
            DWISAPTATI: { totalCycle: 72, planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"], durations: [9, 9, 9, 9, 9, 9, 9, 9], startNakshatraOffset: 7 },
            PANCHOTTARI: { totalCycle: 105, planets: ["Sun", "Mercury", "Saturn", "Mars", "Venus", "Jupiter", "Rahu"], durations: [12, 13, 14, 15, 16, 17, 18], startNakshatraOffset: 12 },
            DWADASHOTTARI: { totalCycle: 112, planets: ["Sun", "Jupiter", "Ketu", "Mercury", "Rahu", "Mars", "Saturn", "Venus"], durations: [7, 9, 11, 13, 15, 17, 19, 21], startNakshatraOffset: 13 },
            CHATURVIMSATI: { totalCycle: 24, planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"], durations: [2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67], startNakshatraOffset: 0 },
            SHATTRIMSHAT: { totalCycle: 36, planets: ["Moon", "Sun", "Jupiter", "Mars", "Mercury", "Saturn", "Venus", "Rahu"], durations: [1, 2, 3, 4, 5, 6, 7, 8], startNakshatraOffset: 0 },
            KALACHAKRA: {
                rashiDurations: { "Aries": 7, "Taurus": 16, "Gemini": 9, "Cancer": 21, "Leo": 5, "Virgo": 9, "Libra": 16, "Scorpio": 7, "Sagittarius": 10, "Capricorn": 4, "Aquarius": 4, "Pisces": 10 },
                sequenceSavya: [
                    ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"],
                    ["Capricorn", "Aquarius", "Pisces", "Scorpio", "Libra", "Virgo", "Cancer", "Leo", "Gemini"],
                    ["Taurus", "Aries", "Sagittarius", "Capricorn", "Aquarius", "Pisces", "Scorpio", "Libra", "Virgo"],
                    ["Cancer", "Leo", "Gemini", "Taurus", "Aries", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
                ]
            }
        };
    }

    /**
     * @method calculatePanchang
     * Computes the five limbs of the day.
     * @param {number} sunLong - Sidereal Sun longitude.
     * @param {number} moonLong - Sidereal Moon longitude.
     * @param {number} jd - Julian Day.
     * @returns {Object} Panchang details.
     */
    calculatePanchang(sunLong, moonLong, jd) {
        // 1. Tithi (12 degrees per Tithi)
        const diff = this._normalizeDegrees(moonLong - sunLong);
        const tithiVal = Math.floor(diff / 12);
        const tithiName = this.tithis[tithiVal % 15];
        const paksha = diff < 180 ? "Shukla" : "Krishna";

        // 2. Vara (Weekday)
        const dayIdx = Math.floor(jd + 1.5) % 7;
        const varaNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // 3. Nakshatra
        const nakInfo = this.getNakshatraInfo(moonLong);

        // 4. Yoga (Sun + Moon, 13deg 20min arc)
        const yogaLong = this._normalizeDegrees(sunLong + moonLong);
        const yogaIdx = Math.floor(yogaLong / this.NAKSHATRA_ARC);

        // 5. Karana (Half of Tithi, 6 degrees)
        // First Karana (Kintughna) starts at the beginning of the lunar month
        const karanaVal = Math.floor(diff / 6);
        let karanaName;
        if (karanaVal === 0) karanaName = "Kintughna";
        else if (karanaVal >= 57) karanaName = this.karanas[karanaVal - 50]; // Fixed Karanas
        else karanaName = this.karanas[(karanaVal - 1) % 7]; // Cyclical Karanas

        return {
            tithi: { index: tithiVal + 1, name: tithiName, paksha },
            vara: varaNames[dayIdx],
            nakshatra: nakInfo,
            yoga: { index: yogaIdx + 1, name: this.yogas[yogaIdx] },
            karana: { index: karanaVal + 1, name: karanaName }
        };
    }

    /**
     * @method calculateMuhurtaPeriods
     * Calculates Rahu Kaal and other temporal periods.
     * @param {number} sunriseJD - JD of Sunrise.
     * @param {number} sunsetJD - JD of Sunset.
     * @param {number} jd - Reference Julian Day (for weekday).
     * @returns {Object} Time slots for various Kaals.
     */
    calculateMuhurtaPeriods(sunriseJD, sunsetJD, jd) {
        const dayDuration = sunsetJD - sunriseJD;
        const part = dayDuration / 8;
        const dayIdx = Math.floor(jd + 1.5) % 7; // 0=Sun, 1=Mon...

        // Rahu Kaal sequences by weekday
        const rahuSeq = [7, 1, 6, 4, 5, 2, 3]; // Sun=8th part, Mon=2nd, etc. (0-indexed sequence)
        const gulikaSeq = [6, 5, 4, 3, 2, 1, 0];
        const yamagandaSeq = [4, 3, 2, 1, 0, 6, 5];

        const getSlot = (seq) => {
            const start = sunriseJD + (part * seq[dayIdx]);
            return { start, end: start + part };
        };

        return {
            rahuKaal: getSlot(rahuSeq),
            gulikaKaal: getSlot(gulikaSeq),
            yamagandaKaal: getSlot(yamagandaSeq)
        };
    }

    /**
     * @method calculateVargaLongitude
     * Computes the divisional chart (Varga) position for a planet.
     */
    calculateVargaLongitude(longitude, division) {
        const signSize = 30;
        const vargaArc = signSize / division;
        const totalArc = longitude % signSize;
        const vargaSector = Math.floor(totalArc / vargaArc);
        const sourceRashi = Math.floor(longitude / signSize);
        let targetRashi = 0;

        switch (division) {
            case 2: // Hora (D-2)
                const isEvenSign = sourceRashi % 2 !== 0; 
                if (!isEvenSign) { 
                    targetRashi = (totalArc <= 15) ? 4 : 3; 
                } else { 
                    targetRashi = (totalArc <= 15) ? 3 : 4; 
                }
                break;
            case 3: // Drekkana (D-3)
                targetRashi = (sourceRashi + (vargaSector * 4)) % 12;
                break;
            case 9: // Navamsa (D-9)
                const startRashis = [0, 8, 4, 0, 8, 4, 0, 8, 4, 0, 8, 4];
                targetRashi = (startRashis[sourceRashi] + vargaSector) % 12;
                break;
            case 10: // Dashamsa (D-10)
                const isSourceEven = sourceRashi % 2 !== 0;
                const startSign = isSourceEven ? (sourceRashi + 8) % 12 : sourceRashi;
                targetRashi = (startSign + vargaSector) % 12;
                break;
            default:
                targetRashi = (sourceRashi * division + vargaSector) % 12;
        }

        return {
            rashiIndex: targetRashi,
            degreesInRashi: (vargaSector * signSize) + (totalArc % vargaArc) * division
        };
    }

    /**
     * @method calculateAshtakavarga
     * Computes the Bhinna Ashtakavarga (BAV) for a planet.
     */
    calculateAshtakavarga(targetPlanet, planetaryPositions, ascendantRashi) {
        const result = new Array(12).fill(0);
        const rules = this.ashtakavargaRules[targetPlanet];
        if (!rules) return result;

        const planetToRashi = (long) => Math.floor(long / 30) + 1;

        for (const [sourcePlanet, beneficHouses] of Object.entries(rules)) {
            let sourceRashi;
            if (sourcePlanet === "Asc") {
                sourceRashi = ascendantRashi;
            } else {
                sourceRashi = planetToRashi(planetaryPositions[sourcePlanet]);
            }

            beneficHouses.forEach(houseOffset => {
                const targetRashiIndex = (sourceRashi + houseOffset - 2) % 12;
                result[targetRashiIndex]++;
            });
        }
        return result;
    }

    /**
     * @method calculateShadbala
     * Computes final Shadbala (Six-fold strength).
     */
    calculateShadbala(planetName, allPlanetaryLongs, moonLong, sunLong, cusps, birthDetails) {
        const planetLong = allPlanetaryLongs[planetName];
        const sthana = this._calculateUchaBala(planetName, planetLong) + 30; 
        const dig = this._calculateDigBala(planetName, planetLong, cusps);
        const kala = this._calculateKalaBala(planetName, sunLong, moonLong, birthDetails);
        const drig = this._calculateDrigBala(planetName, planetLong, allPlanetaryLongs);
        const naisargika = this.naisargikaBalaValues[planetName] || 0;
        const cheshta = this._calculateCheshtaBala(planetName, birthDetails.velocity);
        const total = sthana + dig + kala.total + drig + naisargika + cheshta;

        return {
            planet: planetName,
            breakdown: { sthana, dig, kala: kala.total, drig, naisargika, cheshta },
            totalVirupas: total,
            shadbalaPinda: (total / 60).toFixed(2)
        };
    }

    /**
     * @method calculateDashaTimeline
     * Handles all dasha systems including conditional starting logic.
     */
    calculateDashaTimeline(systemKey, siderealMoonLong, birthJD, projectionYears = 120) {
        if (systemKey === "KALACHAKRA") return this.calculateKalachakraDasha(siderealMoonLong, birthJD);
        const config = this.dashaDefinitions[systemKey];
        const nakInfo = this.getNakshatraInfo(siderealMoonLong);
        let startingNakIndex = nakInfo.index;

        if (systemKey === "SHATTRIMSHAT") startingNakIndex = (nakInfo.index - 3 + 27) % 27;
        else if (systemKey === "DWADASHOTTARI") startingNakIndex = (nakInfo.index - 13 + 27) % 27;
        else startingNakIndex = (nakInfo.index - config.startNakshatraOffset + 27) % 27;

        let lordIdx = startingNakIndex % config.planets.length;
        let currentJD = birthJD;
        const timeline = [];
        let isFirst = true;
        const endGoalJD = birthJD + (projectionYears * this.SIDEREAL_YEAR);

        while (currentJD < endGoalJD) {
            const fullDur = config.durations[lordIdx];
            const actualDays = (isFirst ? (1 - nakInfo.fractionConsumed) * fullDur : fullDur) * this.SIDEREAL_YEAR;
            timeline.push({ lord: config.planets[lordIdx], startJD: currentJD, endJD: currentJD + actualDays, years: fullDur });
            currentJD += actualDays;
            lordIdx = (lordIdx + 1) % config.planets.length;
            isFirst = false;
        }
        return timeline;
    }

    calculateKalachakraDasha(siderealMoonLong, birthJD) {
        const config = this.dashaDefinitions.KALACHAKRA;
        const totalPadas = Math.floor(siderealMoonLong / this.PADA_ARC);
        const cycleIdx = Math.floor(totalPadas / 9) % 4;
        const rashiSequence = config.sequenceSavya[cycleIdx]; 
        let currentJD = birthJD;
        const fraction = (siderealMoonLong % this.PADA_ARC) / this.PADA_ARC;

        return rashiSequence.map((rashi, i) => {
            const years = (i === 0) ? config.rashiDurations[rashi] * (1 - fraction) : config.rashiDurations[rashi];
            const days = years * this.SIDEREAL_YEAR;
            currentJD += days;
            return { lord: rashi, startJD: currentJD - days, endJD: currentJD, years };
        });
    }

    // --- Private Calculation Helpers ---

    _calculateCheshtaBala(planet, velocity) {
        if (planet === "Sun" || planet === "Moon") return 30;
        let strength = 0;
        if (velocity < 0) strength = 60;
        else {
            const avgVelocities = { "Mars": 0.5, "Mercury": 1.2, "Jupiter": 0.08, "Venus": 1.2, "Saturn": 0.03 };
            const avg = avgVelocities[planet] || 1;
            strength = Math.max(0, 60 - (velocity / avg) * 30);
        }
        return Math.min(60, strength);
    }

    _calculateUchaBala(planet, longitude) {
        const uchaPoint = this.exaltationPoints[planet];
        if (uchaPoint === undefined) return 0;
        let diff = Math.abs(longitude - uchaPoint);
        if (diff > 180) diff = 360 - diff;
        return (180 - diff) / 3;
    }

    _calculateDigBala(planet, longitude, cusps) {
        const digPoints = { "Jupiter": cusps[0], "Mercury": cusps[0], "Moon": cusps[3], "Venus": cusps[3], "Saturn": cusps[6], "Sun": cusps[9], "Mars": cusps[9] };
        const target = digPoints[planet];
        if (target === undefined) return 0;
        let diff = Math.abs(longitude - target);
        if (diff > 180) diff = 360 - diff;
        return (180 - diff) / 3;
    }

    _calculateKalaBala(planet, sunLong, moonLong, details) {
        const { isDayBirth } = details;
        let nathonnata = (isDayBirth && ["Sun", "Jupiter", "Venus", "Mercury"].includes(planet)) || (!isDayBirth && ["Moon", "Mars", "Saturn", "Mercury"].includes(planet)) ? 60 : 0;
        let diff = this._normalizeDegrees(moonLong - sunLong);
        if (diff > 180) diff = 360 - diff; 
        return { nathonnata, pakshaBala: diff / 3, total: nathonnata + (diff / 3) + 15 };
    }

    _calculateDrigBala(targetPlanet, targetLong, allLongs) {
        let totalDrigBala = 0;
        const benefics = ["Jupiter", "Venus", "Moon", "Mercury"];
        for (const [aspPlanet, aspLong] of Object.entries(allLongs)) {
            if (aspPlanet === targetPlanet) continue;
            let diff = this._normalizeDegrees(targetLong - aspLong);
            let val = 0;
            if (diff >= 30 && diff <= 300) {
                if (diff <= 60) val = (diff - 30) / 2;
                else if (diff <= 90) val = 15 + (diff - 60);
                else if (diff <= 120) val = 45 - (diff - 90) * 1.5;
                else if (diff <= 180) val = (diff - 150) * 2;
                else if (diff <= 300) val = 60 - (diff - 180) / 2;
            }
            totalDrigBala += (benefics.includes(aspPlanet) ? val : -val) / 4;
        }
        return totalDrigBala;
    }

    // --- Astronomical Utilities ---

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

    getLahiriAyanamsa(jd) {
        return 23.85710278 + (50.27 / 3600 * ((jd - this.J2000_EPOCH) / 36525));
    }

    computeSiderealLongitude(tropicalLong, jd) {
        return this._normalizeDegrees(tropicalLong - this.getLahiriAyanamsa(jd));
    }

    getNakshatraInfo(siderealMoonLong) {
        const idx = Math.floor(siderealMoonLong / this.NAKSHATRA_ARC);
        return { index: idx, name: this.nakshatras[idx], fractionConsumed: (siderealMoonLong % this.NAKSHATRA_ARC) / this.NAKSHATRA_ARC };
    }

    _normalizeDegrees(deg) { let out = deg % 360; return out < 0 ? out + 360 : out; }
}

export default AstronomyEngine;
