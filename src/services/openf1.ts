/**
 * OpenF1 Real-Time Telemetry & Timing Client
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Implements resilient data fetching with abort timeouts, in-memory caching,
 * anonymous requests (no credential leakage), and graceful fallbacks for off-track periods.
 */

import {
  OpenF1Meeting,
  OpenF1Session,
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Stint,
  OpenF1CarData,
  OpenF1Weather,
  OpenF1Lap,
} from '../types/sports';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class OpenF1Client {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(baseUrl = 'https://api.openf1.org/v1', timeoutMs = 5000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  /**
   * Internal fetch wrapper with timeout, CORS safety, and error handling.
   */
  private async fetchJson<T>(endpoint: string, cacheTtlMs = 0): Promise<T | null> {
    const cacheKey = endpoint;
    const now = Date.now();

    if (cacheTtlMs > 0) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data as T;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'omit',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 404 or other HTTP error codes indicate missing or off-track session
        return null;
      }

      const raw = await response.json();
      if (!Array.isArray(raw) && typeof raw !== 'object') {
        return null;
      }

      if (cacheTtlMs > 0) {
        this.cache.set(cacheKey, {
          data: raw,
          expiresAt: now + cacheTtlMs,
        });
      }

      return raw as T;
    } catch {
      // Handles AbortError (timeout), network disconnection, or CORS failures gracefully
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Clears the in-memory cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get the latest or active Grand Prix weekend meeting metadata.
   * Cached for 15 minutes.
   */
  public async getLatestMeeting(): Promise<OpenF1Meeting | null> {
    const list = await this.fetchJson<OpenF1Meeting[]>('/meetings?meeting_key=latest', 15 * 60 * 1000);
    if (!list || !Array.isArray(list) || list.length === 0) {
      return null;
    }
    const meeting = list[0];
    return {
      ...meeting,
      meeting_key: Number(meeting.meeting_key) || 0,
      circuit_key: Number(meeting.circuit_key) || 0,
      year: Number(meeting.year) || new Date().getFullYear(),
    };
  }

  /**
   * Get all sessions for a given meeting (or 'latest').
   * Cached for 5 minutes.
   */
  public async getSessions(meetingKey: number | 'latest' = 'latest'): Promise<OpenF1Session[]> {
    const endpoint = `/sessions?meeting_key=${meetingKey}`;
    const list = await this.fetchJson<OpenF1Session[]>(endpoint, 5 * 60 * 1000);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list.map((s) => ({
      ...s,
      session_key: Number(s.session_key) || 0,
      meeting_key: Number(s.meeting_key) || 0,
      year: Number(s.year) || new Date().getFullYear(),
    }));
  }

  /**
   * Get driver lineup for a specific session (or 'latest').
   * Cached for 5 minutes.
   */
  public async getDrivers(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Driver[]> {
    const endpoint = `/drivers?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1Driver[]>(endpoint, 5 * 60 * 1000);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list.map((d) => ({
      ...d,
      session_key: Number(d.session_key) || 0,
      meeting_key: Number(d.meeting_key) || 0,
      driver_number: Number(d.driver_number) || 0,
      team_colour: d.team_colour ? `#${d.team_colour.replace(/^#/, '')}` : '#FFFFFF',
    }));
  }

  /**
   * Get live interval timings between drivers during a session.
   * Low TTL cache (3 seconds) to prevent redundant parallel requests.
   */
  public async getIntervals(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Interval[]> {
    const endpoint = `/intervals?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1Interval[]>(endpoint, 3000);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list.map((item) => ({
      ...item,
      driver_number: Number(item.driver_number) || 0,
      gap_to_leader: Number.isFinite(item.gap_to_leader) ? Number(item.gap_to_leader) : null,
      interval: Number.isFinite(item.interval) ? Number(item.interval) : null,
    }));
  }

  /**
   * Get tire stint history and current tyre compounds.
   * Cached for 15 seconds.
   */
  public async getStints(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Stint[]> {
    const endpoint = `/stints?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1Stint[]>(endpoint, 15000);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list.map((stint) => ({
      ...stint,
      driver_number: Number(stint.driver_number) || 0,
      stint_number: Number(stint.stint_number) || 0,
      lap_start: Number(stint.lap_start) || 0,
      lap_end: Number(stint.lap_end) || 0,
      tyre_age_at_start: Number(stint.tyre_age_at_start) || 0,
      compound: (stint.compound || 'UNKNOWN').toUpperCase(),
    }));
  }

  /**
   * Get real-time car telemetry (speed, RPM, gear, throttle, brake, DRS).
   * Validates and sanitizes all telemetry metrics against prototype pollution & NaN.
   * Cached for 2 seconds.
   */
  public async getCarTelemetry(
    sessionKey: number | 'latest' = 'latest',
    driverNumber?: number
  ): Promise<OpenF1CarData[]> {
    const query = driverNumber
      ? `/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`
      : `/car_data?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1CarData[]>(query, 2000);
    if (!list || !Array.isArray(list)) {
      return [];
    }

    return list.map((entry) => ({
      session_key: Number(entry.session_key) || 0,
      meeting_key: Number(entry.meeting_key) || 0,
      date: entry.date || new Date().toISOString(),
      driver_number: Number(entry.driver_number) || 0,
      speed: Number.isFinite(entry.speed) ? Math.max(0, Math.min(380, Number(entry.speed))) : 0,
      rpm: Number.isFinite(entry.rpm) ? Math.max(0, Math.min(15000, Number(entry.rpm))) : 0,
      n_gear: Number.isFinite(entry.n_gear) ? Math.max(0, Math.min(8, Number(entry.n_gear))) : 0,
      throttle: Number.isFinite(entry.throttle) ? Math.max(0, Math.min(100, Number(entry.throttle))) : 0,
      brake: Number.isFinite(entry.brake) ? Math.max(0, Math.min(100, Number(entry.brake))) : 0,
      drs: Number.isFinite(entry.drs) ? Number(entry.drs) : 0,
    }));
  }

  /**
   * Get track weather and ambient conditions.
   * Cached for 30 seconds.
   */
  public async getWeather(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Weather | null> {
    const endpoint = `/weather?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1Weather[]>(endpoint, 30000);
    if (!list || !Array.isArray(list) || list.length === 0) {
      return null;
    }
    // Latest weather sample is usually the last element
    const latest = list[list.length - 1];
    return {
      session_key: Number(latest.session_key) || 0,
      meeting_key: Number(latest.meeting_key) || 0,
      date: latest.date || new Date().toISOString(),
      air_temperature: Number.isFinite(latest.air_temperature) ? Number(latest.air_temperature) : 25,
      track_temperature: Number.isFinite(latest.track_temperature) ? Number(latest.track_temperature) : 35,
      humidity: Number.isFinite(latest.humidity) ? Number(latest.humidity) : 50,
      pressure: Number.isFinite(latest.pressure) ? Number(latest.pressure) : 1013,
      rainfall: Number.isFinite(latest.rainfall) ? Number(latest.rainfall) : 0,
      wind_direction: Number.isFinite(latest.wind_direction) ? Number(latest.wind_direction) : 0,
      wind_speed: Number.isFinite(latest.wind_speed) ? Number(latest.wind_speed) : 0,
    };
  }

  /**
   * Get completed laps for a session.
   * Cached for 10 seconds.
   */
  public async getLaps(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Lap[]> {
    const endpoint = `/laps?session_key=${sessionKey}`;
    const list = await this.fetchJson<OpenF1Lap[]>(endpoint, 10000);
    if (!list || !Array.isArray(list)) {
      return [];
    }
    return list.map((lap) => ({
      ...lap,
      session_key: Number(lap.session_key) || 0,
      meeting_key: Number(lap.meeting_key) || 0,
      driver_number: Number(lap.driver_number) || 0,
      lap_number: Number(lap.lap_number) || 0,
      lap_duration: Number.isFinite(lap.lap_duration) ? Number(lap.lap_duration) : null,
      duration_sector_1: Number.isFinite(lap.duration_sector_1) ? Number(lap.duration_sector_1) : null,
      duration_sector_2: Number.isFinite(lap.duration_sector_2) ? Number(lap.duration_sector_2) : null,
      duration_sector_3: Number.isFinite(lap.duration_sector_3) ? Number(lap.duration_sector_3) : null,
      is_pit_out_lap: Boolean(lap.is_pit_out_lap),
    }));
  }
}

export const openF1Service = new OpenF1Client();
