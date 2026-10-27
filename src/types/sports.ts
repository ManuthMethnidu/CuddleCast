/**
 * Sports Streaming, Motorsport Sessions, Telemetry & API Contract Types
 * CuddleCast Live Sports & Formula 1 Center
 */

// ---------------------------------------------------------------------------
// Core Session & Stream Domain Types
// ---------------------------------------------------------------------------

export type SessionState =
  | 'upcoming'
  | 'live'
  | 'ended'
  | 'interrupted'
  | 'postponed'
  | 'cancelled';

export type SeriesSlug = 'f1' | 'f2' | 'f3' | 'motogp' | 'moto2' | 'moto3';

export interface SeriesMeta {
  id: string;
  name: string;        // "Formula 1", "Formula 2", "Formula 3", "MotoGP"
  slug: SeriesSlug;
  color: string;       // F1: #FF1801, F2: #1C78FB, F3: #102D5C, MotoGP: #EF0000
}

export type StreamChannelType = 'hls' | 'embed';

export interface StreamChannel {
  id: string;
  name: string;        // "Sky Sports F1 [ENG]", "Sky Sports F1 [IT]", "Onboard Cam"
  available: boolean;  // true during session broadcast
  playlist?: string;   // direct HLS: ".m3u8"
  player: string;      // embed fallback: "https://live.watchitbetter.com/embed/watch/..."
  bitrate?: string;    // "1080p 60fps"
  type: StreamChannelType;
}

export interface CircuitSpecs {
  lengthKm: string;
  laps: number;
  lapRecord: string;
  recordHolder: string;
  drsZones: number;
}

export type SessionCategory =
  | 'practice'
  | 'qualifying'
  | 'sprint'
  | 'race'
  | 'warmup';

export interface MotorsportSession {
  id: string;
  name: string;        // "FP1", "FP2", "FP3", "Qualifying", "Sprint", "Race"
  category: SessionCategory;
  event: string;       // e.g. "Mexico Grand Prix"
  circuit: string;     // e.g. "Autódromo Hermanos Rodríguez"
  country: string;     // e.g. "Mexico City, Mexico"
  cover_image_url: string; // official FOM Racehub 16x9 banner
  starts_at: string;   // ISO 8601 UTC timestamp: "2026-10-30T18:30:00+00:00"
  state: SessionState;
  series: SeriesMeta;
  channels: StreamChannel[];
  circuitSpecs?: CircuitSpecs;
}

export type SportCategory =
  | 'ALL'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'MOTOGP'
  | 'FOOTBALL'
  | 'BASKETBALL'
  | 'COMBAT'
  | 'NFL'
  | 'TENNIS';

// ---------------------------------------------------------------------------
// Telemetry & Timing Types
// ---------------------------------------------------------------------------

export type TyreCompound =
  | 'SOFT'
  | 'MEDIUM'
  | 'HARD'
  | 'INTERMEDIATE'
  | 'WET';

export type SectorColor = 'purple' | 'green' | 'yellow';

export interface DriverTiming {
  position: number;
  driverNumber: number;
  code: string;
  fullName: string;
  team: string;
  teamColor: string;
  gapToLeader: string;
  interval: string;
  lastLapTime: string;
  bestLapTime: string;
  sector1: string;
  sector2: string;
  sector3: string;
  sector1Color: SectorColor;
  sector2Color: SectorColor;
  sector3Color: SectorColor;
  tyreCompound: TyreCompound;
  tyreAge: number;
  inPit: boolean;
  drsActive: boolean;
}

export type TrackStatus = 'GREEN' | 'YELLOW' | 'RED' | 'SC' | 'VSC';

export interface TelemetrySnapshot {
  speed: number;       // km/h
  rpm: number;
  gear: number;
  throttle: number;    // percentage 0-100
  brake: number;       // percentage 0-100
  drs: boolean;
  airTemp: number;     // °C
  trackTemp: number;   // °C
  weatherCondition: string;
  trackStatus: TrackStatus;
}

// ---------------------------------------------------------------------------
// Semantic Color Palette Constants (conforming to 01-UI-SPEC.md)
// ---------------------------------------------------------------------------

export const SERIES_COLORS: Record<string, string> = {
  f1: '#FF1801',
  f2: '#1C78FB',
  f3: '#102D5C',
  motogp: '#EF0000',
  ucl: '#001D4A',
  nba: '#1D428A',
  ufc: '#D20A0A',
};

export const TYRE_COMPOUND_COLORS: Record<TyreCompound, string> = {
  SOFT: '#FF3333',
  MEDIUM: '#FFD700',
  HARD: '#FFFFFF',
  INTERMEDIATE: '#39B54A',
  WET: '#0099FF',
};

export const TRACK_STATUS_COLORS: Record<TrackStatus, string> = {
  GREEN: '#22C55E',
  YELLOW: '#EAB308',
  RED: '#EF4444',
  SC: '#F97316',
  VSC: '#F97316',
};

// ---------------------------------------------------------------------------
// OpenF1 REST API Raw DTOs (https://api.openf1.org/v1/)
// ---------------------------------------------------------------------------

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name?: string;
  location?: string;
  country_key?: number;
  country_code?: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
  gmt_offset?: string;
  year: number;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset?: string;
  meeting_key: number;
  year: number;
}

export interface OpenF1Driver {
  session_key: number;
  meeting_key: number;
  broadcast_name: string;
  country_code?: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  headshot_url?: string | null;
  name_acronym: string;
  driver_number: number;
  team_colour: string;
  team_name: string;
}

export interface OpenF1Interval {
  session_key: number;
  meeting_key: number;
  date: string;
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
}

export interface OpenF1Stint {
  session_key: number;
  meeting_key: number;
  stint_number: number;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export interface OpenF1CarData {
  session_key: number;
  meeting_key: number;
  date: string;
  driver_number: number;
  rpm: number;
  speed: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
}

export interface OpenF1Weather {
  session_key: number;
  meeting_key: number;
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure?: number;
  rainfall: number;
  wind_direction: number;
  wind_speed: number;
}

export interface OpenF1Lap {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  is_pit_out_lap: boolean;
  st_speed?: number | null;
}

// ---------------------------------------------------------------------------
// Jolpica / Ergast F1 REST API Raw DTOs (https://api.jolpi.ca/ergast/f1/)
// ---------------------------------------------------------------------------

export interface JolpicaCircuit {
  circuitId: string;
  url?: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface JolpicaSessionTime {
  date: string;
  time?: string;
}

export interface JolpicaRace {
  season: string;
  round: string;
  url?: string;
  raceName: string;
  Circuit: JolpicaCircuit;
  date: string;
  time?: string;
  FirstPractice?: JolpicaSessionTime;
  SecondPractice?: JolpicaSessionTime;
  ThirdPractice?: JolpicaSessionTime;
  Qualifying?: JolpicaSessionTime;
  Sprint?: JolpicaSessionTime;
  SprintQualifying?: JolpicaSessionTime;
}

export interface JolpicaDriver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality: string;
}

export interface JolpicaConstructor {
  constructorId: string;
  url?: string;
  name: string;
  nationality?: string;
  engine?: string;
}

export interface JolpicaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: JolpicaDriver;
  Constructors: JolpicaConstructor[];
}

export interface JolpicaConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: JolpicaConstructor;
}

export interface JolpicaMRData<T> {
  MRData: {
    xmlns?: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
  } & T;
}

export type JolpicaCalendarResponse = JolpicaMRData<{
  RaceTable: {
    season: string;
    Races: JolpicaRace[];
  };
}>;

export type JolpicaDriverStandingsResponse = JolpicaMRData<{
  StandingsTable: {
    season: string;
    StandingsLists: Array<{
      season: string;
      round: string;
      DriverStandings: JolpicaDriverStanding[];
    }>;
  };
}>;

export type JolpicaConstructorStandingsResponse = JolpicaMRData<{
  StandingsTable: {
    season: string;
    StandingsLists: Array<{
      season: string;
      round: string;
      ConstructorStandings: JolpicaConstructorStanding[];
    }>;
  };
}>;

// Generic standings response wrapper
export type JolpicaStandingsResponse =
  | JolpicaDriverStandingsResponse
  | JolpicaConstructorStandingsResponse;
