/**
 * Timezone Auto-Detection, Dual Time Conversion, and Session Countdown Engine
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Implements D-09: Local Timezone Conversion & Session Countdowns
 */

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formattedString: string; // e.g. "2d 14h 30m" (>24h), "02:45:18" (<24h), or "LIVE NOW"
}

export interface DualTimeResult {
  localTime: string;
  localTz: string;
  trackTime: string;
  trackTz: string;
  localFormatted: string;
  trackFormatted: string;
}

/**
 * Standard IANA timezones mapped to premier circuits & host countries
 */
export const CIRCUIT_TIMEZONES: Record<string, string> = {
  // Formula 1 2026 circuits & venues
  'albert park': 'Australia/Melbourne',
  'melbourne': 'Australia/Melbourne',
  'australia': 'Australia/Melbourne',
  'shanghai': 'Asia/Shanghai',
  'china': 'Asia/Shanghai',
  'suzuka': 'Asia/Tokyo',
  'japan': 'Asia/Tokyo',
  'bahrain': 'Asia/Bahrain',
  'sakhir': 'Asia/Bahrain',
  'jeddah': 'Asia/Riyadh',
  'saudi arabia': 'Asia/Riyadh',
  'miami': 'America/New_York',
  'imola': 'Europe/Rome',
  'monaco': 'Europe/Monaco',
  'monte carlo': 'Europe/Monaco',
  'catalunya': 'Europe/Madrid',
  'barcelona': 'Europe/Madrid',
  'spain': 'Europe/Madrid',
  'gilles villeneuve': 'America/Toronto',
  'montreal': 'America/Toronto',
  'canada': 'America/Toronto',
  'red bull ring': 'Europe/Vienna',
  'spielberg': 'Europe/Vienna',
  'austria': 'Europe/Vienna',
  'silverstone': 'Europe/London',
  'britain': 'Europe/London',
  'great britain': 'Europe/London',
  'hungaroring': 'Europe/Budapest',
  'budapest': 'Europe/Budapest',
  'hungary': 'Europe/Budapest',
  'spa': 'Europe/Brussels',
  'spa-francorchamps': 'Europe/Brussels',
  'belgium': 'Europe/Brussels',
  'zandvoort': 'Europe/Amsterdam',
  'netherlands': 'Europe/Amsterdam',
  'monza': 'Europe/Rome',
  'italy': 'Europe/Rome',
  'baku': 'Asia/Baku',
  'azerbaijan': 'Asia/Baku',
  'marina bay': 'Asia/Singapore',
  'singapore': 'Asia/Singapore',
  'cota': 'America/Chicago',
  'austin': 'America/Chicago',
  'circuit of the americas': 'America/Chicago',
  'united states': 'America/Chicago',
  'autódromo hermanos rodríguez': 'America/Mexico_City',
  'mexico': 'America/Mexico_City',
  'mexico city': 'America/Mexico_City',
  'interlagos': 'America/Sao_Paulo',
  'são paulo': 'America/Sao_Paulo',
  'brazil': 'America/Sao_Paulo',
  'las vegas': 'America/Los_Angeles',
  'losail': 'Asia/Qatar',
  'qatar': 'Asia/Qatar',
  'yas marina': 'Asia/Dubai',
  'abu dhabi': 'Asia/Dubai',
  'uae': 'Asia/Dubai',

  // MotoGP specific venues
  'portimao': 'Europe/Lisbon',
  'portugal': 'Europe/Lisbon',
  'termas de rio hondo': 'America/Argentina/Buenos_Aires',
  'argentina': 'America/Argentina/Buenos_Aires',
  'jerez': 'Europe/Madrid',
  'le mans': 'Europe/Paris',
  'france': 'Europe/Paris',
  'mugello': 'Europe/Rome',
  'sachsenring': 'Europe/Berlin',
  'germany': 'Europe/Berlin',
  'assen': 'Europe/Amsterdam',
  'sokol': 'Asia/Almaty',
  'kazakhstan': 'Asia/Almaty',
  'mandalika': 'Asia/Makassar',
  'indonesia': 'Asia/Makassar',
  'motegi': 'Asia/Tokyo',
  'buriram': 'Asia/Bangkok',
  'thailand': 'Asia/Bangkok',
  'sepang': 'Asia/Kuala_Lumpur',
  'malaysia': 'Asia/Kuala_Lumpur',
  'valencia': 'Europe/Madrid',
};

export class TimezoneCountdownService {
  /**
   * Auto-detect the user's local IANA timezone name.
   * Falls back safely to 'UTC' if environment lacks Intl or fails.
   */
  public getUserTimezone(): string {
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected && typeof detected === 'string') {
          return detected;
        }
      }
    } catch (e) {
      console.warn('[TimezoneCountdown] Failed to resolve user timezone via Intl:', e);
    }
    return 'UTC';
  }

  /**
   * Resolves circuit IANA timezone by matching circuit name, country, or event name.
   */
  public resolveCircuitTimezone(circuitOrCountry?: string): string {
    if (!circuitOrCountry) return 'UTC';
    const clean = circuitOrCountry.trim().toLowerCase();

    // Direct match in registry
    if (CIRCUIT_TIMEZONES[clean]) {
      return CIRCUIT_TIMEZONES[clean];
    }

    // Partial substring match
    for (const [key, tz] of Object.entries(CIRCUIT_TIMEZONES)) {
      if (clean.includes(key)) {
        return tz;
      }
    }

    return 'UTC';
  }

  /**
   * Safe parser for ISO date strings, timestamps, or Date instances.
   */
  private parseDate(dateInput: string | number | Date): Date {
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }
    if (typeof dateInput === 'number') {
      const d = new Date(dateInput);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    if (typeof dateInput === 'string') {
      const parsed = Date.parse(dateInput);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    }
    return new Date();
  }

  /**
   * Format an ISO timestamp in the user's local timezone.
   */
  public formatLocalTime(
    isoDate: string | number | Date,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = this.parseDate(isoDate);
    const userTz = this.getUserTimezone();
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: userTz,
      ...options,
    };

    try {
      return new Intl.DateTimeFormat('default', defaultOptions).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  }

  /**
   * Format an ISO timestamp in the circuit host timezone.
   */
  public formatTrackTime(
    isoDate: string | number | Date,
    circuitTimezone: string = 'UTC',
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = this.parseDate(isoDate);
    const resolvedTz = circuitTimezone.includes('/')
      ? circuitTimezone
      : this.resolveCircuitTimezone(circuitTimezone);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: resolvedTz,
      ...options,
    };

    try {
      return new Intl.DateTimeFormat('default', defaultOptions).format(date);
    } catch {
      return date.toUTCString();
    }
  }

  /**
   * Returns a dual time object comparing local user time with track time.
   */
  public getDualTime(
    isoDate: string | number | Date,
    circuitOrCountry: string = 'UTC'
  ): DualTimeResult {
    const date = this.parseDate(isoDate);
    const localTz = this.getUserTimezone();
    const trackTz = circuitOrCountry.includes('/')
      ? circuitOrCountry
      : this.resolveCircuitTimezone(circuitOrCountry);

    // Format short times (e.g. "14:00")
    const shortOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    // Format short timezone abbreviations or offsets
    const tzNameOptions: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short',
    };

    let localShort = '--:--';
    let trackShort = '--:--';
    let localTzAbbr = 'Local';
    let trackTzAbbr = 'Track';

    try {
      localShort = new Intl.DateTimeFormat('default', {
        ...shortOptions,
        timeZone: localTz,
      }).format(date);
      const localTzParts = new Intl.DateTimeFormat('en-US', {
        ...tzNameOptions,
        timeZone: localTz,
      }).formatToParts(date);
      localTzAbbr = localTzParts.find((p) => p.type === 'timeZoneName')?.value || localTz;
    } catch {
      localShort = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    try {
      trackShort = new Intl.DateTimeFormat('default', {
        ...shortOptions,
        timeZone: trackTz,
      }).format(date);
      const trackTzParts = new Intl.DateTimeFormat('en-US', {
        ...tzNameOptions,
        timeZone: trackTz,
      }).formatToParts(date);
      trackTzAbbr = trackTzParts.find((p) => p.type === 'timeZoneName')?.value || trackTz;
    } catch {
      trackShort = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const localFormatted = this.formatLocalTime(date);
    const trackFormatted = this.formatTrackTime(date, trackTz);

    return {
      localTime: localShort,
      localTz: localTzAbbr,
      trackTime: trackShort,
      trackTz: trackTzAbbr,
      localFormatted,
      trackFormatted,
    };
  }

  /**
   * Calculates live countdown delta from current time to session start time.
   *
   * Rules:
   * - If delta <= 0: isPast: true, formattedString: 'LIVE NOW'
   * - If delta > 24h (86400000ms): formattedString: `${days}d ${hours}h ${minutes}m`
   * - If delta <= 24h: formattedString: `${HH}:${MM}:${SS}`
   */
  public calculateCountdown(
    targetIsoDate: string | number | Date,
    currentTimestamp: number = Date.now()
  ): CountdownResult {
    const target = this.parseDate(targetIsoDate);
    const deltaMs = target.getTime() - currentTimestamp;

    if (deltaMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: true,
        formattedString: 'LIVE NOW',
      };
    }

    const totalSeconds = Math.floor(deltaMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    let formattedString: string;
    if (deltaMs > 86400000) {
      // > 24 hours
      formattedString = `${days}d ${hours}h ${minutes}m`;
    } else {
      // <= 24 hours (race day / final countdown)
      formattedString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      isPast: false,
      formattedString,
    };
  }
}

export const timezoneCountdown = new TimezoneCountdownService();
