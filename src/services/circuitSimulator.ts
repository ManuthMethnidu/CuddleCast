/**
 * Autonomous High-Fidelity Circuit Simulation Engine
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Implements an autonomous 20-car 2026 Formula 1 grid simulation loop (~1Hz ticks)
 * with sector delta tracking, tyre degradation curves, pit stop time deltas,
 * DRS zone calculations, and lead car telemetry generation.
 */

import {
  DriverTiming,
  SectorColor,
  TelemetrySnapshot,
  TrackStatus,
  TyreCompound,
} from '../types/sports';

export interface CircuitConfig {
  id: string;
  name: string;
  country: string;
  laps: number;
  lengthKm: string;
  baseLapTimeSeconds: number; // e.g. 72.909 for Monaco
  lapRecord: string;
  recordHolder: string;
  drsZones: number;
  sectorSplits: [number, number, number]; // Percentages summing to 1.0 (e.g. [0.28, 0.40, 0.32])
}

export const CIRCUITS: Record<string, CircuitConfig> = {
  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco',
    country: 'Monaco',
    laps: 78,
    lengthKm: '3.337 km',
    baseLapTimeSeconds: 72.909,
    lapRecord: '1:12.909',
    recordHolder: 'Lewis Hamilton',
    drsZones: 1,
    sectorSplits: [0.28, 0.40, 0.32],
  },
  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    country: 'United Kingdom',
    laps: 52,
    lengthKm: '5.891 km',
    baseLapTimeSeconds: 87.097,
    lapRecord: '1:27.097',
    recordHolder: 'Max Verstappen',
    drsZones: 2,
    sectorSplits: [0.30, 0.42, 0.28],
  },
  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    country: 'Italy',
    laps: 53,
    lengthKm: '5.793 km',
    baseLapTimeSeconds: 81.046,
    lapRecord: '1:21.046',
    recordHolder: 'Rubens Barrichello',
    drsZones: 2,
    sectorSplits: [0.34, 0.36, 0.30],
  },
  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    laps: 44,
    lengthKm: '7.004 km',
    baseLapTimeSeconds: 104.701,
    lapRecord: '1:44.701',
    recordHolder: 'Valtteri Bottas',
    drsZones: 2,
    sectorSplits: [0.33, 0.38, 0.29],
  },
  cota: {
    id: 'cota',
    name: 'Circuit of the Americas',
    country: 'United States',
    laps: 56,
    lengthKm: '5.513 km',
    baseLapTimeSeconds: 96.169,
    lapRecord: '1:36.169',
    recordHolder: 'Charles Leclerc',
    drsZones: 2,
    sectorSplits: [0.29, 0.41, 0.30],
  },
  mexico: {
    id: 'mexico',
    name: 'Autódromo Hermanos Rodríguez',
    country: 'Mexico',
    laps: 71,
    lengthKm: '4.304 km',
    baseLapTimeSeconds: 77.774,
    lapRecord: '1:17.774',
    recordHolder: 'Valtteri Bottas',
    drsZones: 3,
    sectorSplits: [0.32, 0.38, 0.30],
  },
  sepang: {
    id: 'sepang',
    name: 'Petronas Sepang International Circuit',
    country: 'Malaysia',
    laps: 20,
    lengthKm: '5.543 km',
    baseLapTimeSeconds: 117.491,
    lapRecord: '1:57.491',
    recordHolder: 'Francesco Bagnaia',
    drsZones: 2,
    sectorSplits: [0.33, 0.36, 0.31],
  },
};

interface DriverInitState {
  driverNumber: number;
  code: string;
  fullName: string;
  team: string;
  teamColor: string;
  paceOffset: number; // Base pace delta relative to pole
  preferredTyre: TyreCompound;
}

const OFFICIAL_2026_GRID: DriverInitState[] = [
  { driverNumber: 1, code: 'VER', fullName: 'Max Verstappen', team: 'Red Bull Racing', teamColor: '#3671C6', paceOffset: 0.00, preferredTyre: 'MEDIUM' },
  { driverNumber: 4, code: 'NOR', fullName: 'Lando Norris', team: 'McLaren', teamColor: '#FF8000', paceOffset: 0.02, preferredTyre: 'MEDIUM' },
  { driverNumber: 16, code: 'LEC', fullName: 'Charles Leclerc', team: 'Ferrari', teamColor: '#E8002D', paceOffset: 0.05, preferredTyre: 'SOFT' },
  { driverNumber: 81, code: 'PIA', fullName: 'Oscar Piastri', team: 'McLaren', teamColor: '#FF8000', paceOffset: 0.08, preferredTyre: 'MEDIUM' },
  { driverNumber: 44, code: 'HAM', fullName: 'Lewis Hamilton', team: 'Ferrari', teamColor: '#E8002D', paceOffset: 0.12, preferredTyre: 'SOFT' },
  { driverNumber: 63, code: 'RUS', fullName: 'George Russell', team: 'Mercedes', teamColor: '#27F4D2', paceOffset: 0.16, preferredTyre: 'MEDIUM' },
  { driverNumber: 55, code: 'SAI', fullName: 'Carlos Sainz', team: 'Williams', teamColor: '#00A0DE', paceOffset: 0.25, preferredTyre: 'HARD' },
  { driverNumber: 14, code: 'ALO', fullName: 'Fernando Alonso', team: 'Aston Martin', teamColor: '#229971', paceOffset: 0.30, preferredTyre: 'MEDIUM' },
  { driverNumber: 23, code: 'ALB', fullName: 'Alexander Albon', team: 'Williams', teamColor: '#00A0DE', paceOffset: 0.35, preferredTyre: 'HARD' },
  { driverNumber: 12, code: 'ANT', fullName: 'Andrea Kimi Antonelli', team: 'Mercedes', teamColor: '#27F4D2', paceOffset: 0.38, preferredTyre: 'SOFT' },
  { driverNumber: 27, code: 'HUL', fullName: 'Nico Hülkenberg', team: 'Kick Sauber', teamColor: '#52E252', paceOffset: 0.45, preferredTyre: 'MEDIUM' },
  { driverNumber: 10, code: 'GAS', fullName: 'Pierre Gasly', team: 'Alpine', teamColor: '#0093CC', paceOffset: 0.48, preferredTyre: 'MEDIUM' },
  { driverNumber: 22, code: 'TSU', fullName: 'Yuki Tsunoda', team: 'Racing Bulls', teamColor: '#6692FF', paceOffset: 0.52, preferredTyre: 'SOFT' },
  { driverNumber: 31, code: 'OCO', fullName: 'Esteban Ocon', team: 'Haas', teamColor: '#B6BABD', paceOffset: 0.55, preferredTyre: 'MEDIUM' },
  { driverNumber: 18, code: 'STR', fullName: 'Lance Stroll', team: 'Aston Martin', teamColor: '#229971', paceOffset: 0.60, preferredTyre: 'HARD' },
  { driverNumber: 87, code: 'BEA', fullName: 'Oliver Bearman', team: 'Haas', teamColor: '#B6BABD', paceOffset: 0.64, preferredTyre: 'SOFT' },
  { driverNumber: 30, code: 'LAW', fullName: 'Liam Lawson', team: 'Racing Bulls', teamColor: '#6692FF', paceOffset: 0.68, preferredTyre: 'MEDIUM' },
  { driverNumber: 7, code: 'DOO', fullName: 'Jack Doohan', team: 'Alpine', teamColor: '#0093CC', paceOffset: 0.72, preferredTyre: 'MEDIUM' },
  { driverNumber: 5, code: 'BOR', fullName: 'Gabriel Bortoleto', team: 'Kick Sauber', teamColor: '#52E252', paceOffset: 0.78, preferredTyre: 'HARD' },
  { driverNumber: 6, code: 'HAD', fullName: 'Isack Hadjar', team: 'Red Bull Racing', teamColor: '#3671C6', paceOffset: 0.82, preferredTyre: 'MEDIUM' },
];

// Tyre degradation factors per lap (seconds added to lap time)
const TYRE_DEGRADATION: Record<TyreCompound, number> = {
  SOFT: 0.085,
  MEDIUM: 0.045,
  HARD: 0.022,
  INTERMEDIATE: 0.060,
  WET: 0.090,
};

// Recommended maximum stint length before pitting
const TYRE_OPTIMAL_LAPS: Record<TyreCompound, number> = {
  SOFT: 16,
  MEDIUM: 26,
  HARD: 42,
  INTERMEDIATE: 22,
  WET: 25,
};

const PIT_STOP_TIME_PENALTY = 21.5; // Seconds lost in pit lane

interface InternalCarState {
  driverNumber: number;
  code: string;
  fullName: string;
  team: string;
  teamColor: string;
  paceOffset: number;
  position: number;
  totalTime: number; // Accumulated race time
  lap: number;
  progressInLap: number; // 0.0 to 1.0
  lastLapTime: number;
  bestLapTime: number;
  sector1Time: number;
  sector2Time: number;
  sector3Time: number;
  sector1Color: SectorColor;
  sector2Color: SectorColor;
  sector3Color: SectorColor;
  tyreCompound: TyreCompound;
  tyreAge: number;
  inPit: boolean;
  pitStops: number;
  drsActive: boolean;
  gapToLeader: number;
  interval: number;
}

export interface SimulationSnapshot {
  timing: DriverTiming[];
  telemetry: TelemetrySnapshot;
  lap: number;
  totalLaps: number;
  circuit: string;
  trackStatus: TrackStatus;
  speedMultiplier: number;
}

type SimulationListener = (snapshot: SimulationSnapshot) => void;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--:--.---';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

function formatSectorTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--.---';
  return seconds.toFixed(3);
}

function formatGap(gap: number): string {
  if (!Number.isFinite(gap) || gap <= 0) return 'LEADER';
  return `+${gap.toFixed(3)}`;
}

function formatInterval(interval: number): string {
  if (!Number.isFinite(interval) || interval <= 0) return 'INTERVAL';
  return `+${interval.toFixed(3)}`;
}

export class CircuitSimulatorEngine {
  private circuit: CircuitConfig;
  private currentLap = 1;
  private cars: InternalCarState[] = [];
  private sessionBestS1 = Infinity;
  private sessionBestS2 = Infinity;
  private sessionBestS3 = Infinity;
  private sessionBestLap = Infinity;
  private trackStatus: TrackStatus = 'GREEN';

  // Lead car telemetry state
  private telemetrySpeed = 265;
  private telemetryRpm = 11200;
  private telemetryGear = 6;
  private telemetryThrottle = 100;
  private telemetryBrake = 0;
  private telemetryDrs = false;
  private airTemp = 25.4;
  private trackTemp = 37.8;

  private isRunning = false;
  private isPausedByVisibility = false;
  private speedMultiplier = 1;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private readonly subscribers = new Set<SimulationListener>();

  constructor(circuitId: string = 'monaco') {
    this.circuit = CIRCUITS[circuitId] || CIRCUITS.monaco;
    this.initializeGrid();
    this.attachVisibilityListener();
  }

  /**
   * Initializes or resets the 20-driver starting grid.
   */
  private initializeGrid(): void {
    this.currentLap = 1;
    this.sessionBestS1 = Infinity;
    this.sessionBestS2 = Infinity;
    this.sessionBestS3 = Infinity;
    this.sessionBestLap = Infinity;
    this.trackStatus = 'GREEN';

    this.cars = OFFICIAL_2026_GRID.map((d, index) => {
      const initialGap = index * 0.45; // Simulated grid spacing at lights out
      const baseLap = this.circuit.baseLapTimeSeconds + d.paceOffset;
      const s1 = baseLap * this.circuit.sectorSplits[0];
      const s2 = baseLap * this.circuit.sectorSplits[1];
      const s3 = baseLap * this.circuit.sectorSplits[2];

      return {
        driverNumber: d.driverNumber,
        code: d.code,
        fullName: d.fullName,
        team: d.team,
        teamColor: d.teamColor,
        paceOffset: d.paceOffset,
        position: index + 1,
        totalTime: initialGap,
        lap: 1,
        progressInLap: Math.max(0, 0.95 - index * 0.03), // Spread around the track
        lastLapTime: baseLap,
        bestLapTime: baseLap,
        sector1Time: s1,
        sector2Time: s2,
        sector3Time: s3,
        sector1Color: 'yellow',
        sector2Color: 'yellow',
        sector3Color: 'yellow',
        tyreCompound: d.preferredTyre,
        tyreAge: Math.floor(Math.random() * 3) + 1,
        inPit: false,
        pitStops: 0,
        drsActive: false,
        gapToLeader: initialGap,
        interval: index === 0 ? 0 : 0.45,
      };
    });
  }

  /**
   * Listen for document visibility changes to avoid battery & CPU drain.
   */
  private attachVisibilityListener(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.isRunning) {
            this.isPausedByVisibility = true;
            this.stopTicker();
          }
        } else if (this.isPausedByVisibility) {
          this.isPausedByVisibility = false;
          if (this.subscribers.size > 0) {
            this.startTicker();
          }
        }
      });
    }
  }

  /**
   * Start the simulation tick loop.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTicker();
  }

  /**
   * Stop the simulation tick loop.
   */
  public stop(): void {
    this.isRunning = false;
    this.stopTicker();
  }

  private startTicker(): void {
    this.stopTicker();
    const intervalMs = Math.max(100, Math.floor(1000 / this.speedMultiplier));
    this.timerId = setInterval(() => this.tick(), intervalMs);
  }

  private stopTicker(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Set simulation speed multiplier (1x, 2x, 5x, 10x).
   */
  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.5, Math.min(20, multiplier));
    if (this.isRunning && !this.isPausedByVisibility) {
      this.startTicker();
    }
  }

  /**
   * Switch the active circuit and reset simulation for the new track.
   */
  public setCircuit(circuitId: string): void {
    if (CIRCUITS[circuitId]) {
      this.circuit = CIRCUITS[circuitId];
      this.initializeGrid();
      this.broadcast();
    }
  }

  /**
   * Reset simulation state to Lap 1.
   */
  public reset(): void {
    this.initializeGrid();
    this.broadcast();
  }

  /**
   * Simulation core calculation loop executed every tick (~1Hz).
   */
  private tick(): void {
    const basePace = this.circuit.baseLapTimeSeconds;
    // Advance progress for each car: each second represents (1 / basePace) fraction of a lap
    const progressDelta = 1 / basePace;

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];

      // Tyre degradation effect
      const degRate = TYRE_DEGRADATION[car.tyreCompound] || 0.045;
      const tyreWearPenalty = car.tyreAge * degRate;

      // Micro variation per tick (+- 0.04s)
      const randomJitter = (Math.random() - 0.5) * 0.08;

      // Pit stop check
      const maxStint = TYRE_OPTIMAL_LAPS[car.tyreCompound] || 25;
      if (!car.inPit && car.tyreAge >= maxStint && car.progressInLap > 0.88) {
        car.inPit = true;
        car.pitStops += 1;
        car.totalTime += PIT_STOP_TIME_PENALTY;
        // Switch tyre compound
        if (car.tyreCompound === 'SOFT') {
          car.tyreCompound = 'MEDIUM';
        } else if (car.tyreCompound === 'MEDIUM') {
          car.tyreCompound = 'HARD';
        } else {
          car.tyreCompound = 'SOFT';
        }
        car.tyreAge = 0;
      } else if (car.inPit && car.progressInLap < 0.1) {
        car.inPit = false;
      }

      car.progressInLap += progressDelta;
      car.totalTime += 1 + randomJitter;

      // Lap completion boundary
      if (car.progressInLap >= 1.0) {
        car.progressInLap -= 1.0;
        car.lap += 1;
        car.tyreAge += 1;

        // Calculate lap sector times
        const s1Base = basePace * this.circuit.sectorSplits[0];
        const s2Base = basePace * this.circuit.sectorSplits[1];
        const s3Base = basePace * this.circuit.sectorSplits[2];

        const s1 = s1Base + car.paceOffset * 0.3 + tyreWearPenalty * 0.3 + (Math.random() - 0.5) * 0.12;
        const s2 = s2Base + car.paceOffset * 0.4 + tyreWearPenalty * 0.4 + (Math.random() - 0.5) * 0.15;
        const s3 = s3Base + car.paceOffset * 0.3 + tyreWearPenalty * 0.3 + (Math.random() - 0.5) * 0.12;
        const fullLap = s1 + s2 + s3 + (car.inPit ? PIT_STOP_TIME_PENALTY : 0);

        car.sector1Time = s1;
        car.sector2Time = s2;
        car.sector3Time = s3;
        car.lastLapTime = fullLap;

        if (fullLap < car.bestLapTime) {
          car.bestLapTime = fullLap;
        }

        // Color coding for sectors (purple: overall best, green: personal best, yellow: normal)
        if (s1 < this.sessionBestS1) {
          this.sessionBestS1 = s1;
          car.sector1Color = 'purple';
        } else if (s1 <= s1Base + 0.1) {
          car.sector1Color = 'green';
        } else {
          car.sector1Color = 'yellow';
        }

        if (s2 < this.sessionBestS2) {
          this.sessionBestS2 = s2;
          car.sector2Color = 'purple';
        } else if (s2 <= s2Base + 0.1) {
          car.sector2Color = 'green';
        } else {
          car.sector2Color = 'yellow';
        }

        if (s3 < this.sessionBestS3) {
          this.sessionBestS3 = s3;
          car.sector3Color = 'purple';
        } else if (s3 <= s3Base + 0.1) {
          car.sector3Color = 'green';
        } else {
          car.sector3Color = 'yellow';
        }

        if (fullLap < this.sessionBestLap) {
          this.sessionBestLap = fullLap;
        }
      }
    }

    // Sort cars by race distance completed: (lap + progressInLap) descending
    this.cars.sort((a, b) => {
      const scoreA = a.lap + a.progressInLap;
      const scoreB = b.lap + b.progressInLap;
      return scoreB - scoreA;
    });

    // Update positions, gaps, and DRS actuation
    const leader = this.cars[0];
    this.currentLap = Math.min(this.circuit.laps, leader.lap);

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      car.position = i + 1;

      if (i === 0) {
        car.gapToLeader = 0;
        car.interval = 0;
        car.drsActive = false;
      } else {
        const carAhead = this.cars[i - 1];
        // Approximate time interval from distance delta
        const deltaLaps = (carAhead.lap + carAhead.progressInLap) - (car.lap + car.progressInLap);
        const intervalSecs = Math.max(0.05, deltaLaps * basePace);
        car.interval = intervalSecs;

        const leaderDelta = (leader.lap + leader.progressInLap) - (car.lap + car.progressInLap);
        car.gapToLeader = Math.max(0, leaderDelta * basePace);

        // DRS: active if gap to car ahead <= 1.000s and simulated car is on DRS straight
        // DRS straights are typically near start/finish (progress > 0.88 or < 0.12)
        const isDrsZone = car.progressInLap > 0.88 || car.progressInLap < 0.12;
        car.drsActive = intervalSecs <= 1.000 && isDrsZone && !car.inPit;
      }
    }

    // Update lead car telemetry physics model
    this.updateLeadTelemetry(leader);

    // Broadcast snapshot to all active subscribers
    this.broadcast();
  }

  /**
   * Simulates continuous telemetry instrumentation for the lead car.
   */
  private updateLeadTelemetry(leader: InternalCarState): void {
    const progress = leader.progressInLap;

    // Simulate track segments:
    // 0.0 - 0.2: Turn 1 chicane & uphill
    // 0.2 - 0.5: Technical mid-sector bends
    // 0.5 - 0.7: Hairpin deceleration zone
    // 0.7 - 0.85: Acceleration out of corners
    // 0.85 - 1.0: Main high-speed straight
    if (progress > 0.85 || progress < 0.08) {
      // High speed straight
      this.telemetrySpeed = Math.min(340, this.telemetrySpeed + 14);
      this.telemetryGear = this.telemetrySpeed > 310 ? 8 : this.telemetrySpeed > 270 ? 7 : 6;
      this.telemetryRpm = Math.min(12400, 10000 + (this.telemetrySpeed % 50) * 48);
      this.telemetryThrottle = 100;
      this.telemetryBrake = 0;
      this.telemetryDrs = leader.drsActive || progress > 0.88;
    } else if (progress >= 0.48 && progress <= 0.55) {
      // Heavy braking hairpin
      this.telemetrySpeed = Math.max(82, this.telemetrySpeed - 35);
      this.telemetryGear = 2;
      this.telemetryRpm = 9400;
      this.telemetryThrottle = 10;
      this.telemetryBrake = 95;
      this.telemetryDrs = false;
    } else {
      // Medium speed flowing corners
      const targetSpeed = 160 + Math.sin(progress * Math.PI * 6) * 45;
      if (this.telemetrySpeed < targetSpeed) {
        this.telemetrySpeed += 8;
        this.telemetryThrottle = 75;
        this.telemetryBrake = 0;
      } else {
        this.telemetrySpeed -= 8;
        this.telemetryThrottle = 20;
        this.telemetryBrake = 40;
      }
      this.telemetryGear = Math.max(3, Math.min(6, Math.floor(this.telemetrySpeed / 45)));
      this.telemetryRpm = 10500 + Math.floor(Math.random() * 800);
      this.telemetryDrs = false;
    }

    // Gentle ambient temperature drift
    this.airTemp += (Math.random() - 0.5) * 0.05;
    this.trackTemp += (Math.random() - 0.5) * 0.08;
  }

  /**
   * Broadcast current snapshot to all subscribers.
   */
  private broadcast(): void {
    if (this.subscribers.size === 0) return;

    const timing: DriverTiming[] = this.cars.map((car) => ({
      position: car.position,
      driverNumber: car.driverNumber,
      code: car.code,
      fullName: car.fullName,
      team: car.team,
      teamColor: car.teamColor,
      gapToLeader: formatGap(car.gapToLeader),
      interval: formatInterval(car.interval),
      lastLapTime: formatTime(car.lastLapTime),
      bestLapTime: formatTime(car.bestLapTime),
      sector1: formatSectorTime(car.sector1Time),
      sector2: formatSectorTime(car.sector2Time),
      sector3: formatSectorTime(car.sector3Time),
      sector1Color: car.sector1Color,
      sector2Color: car.sector2Color,
      sector3Color: car.sector3Color,
      tyreCompound: car.tyreCompound,
      tyreAge: car.tyreAge,
      inPit: car.inPit,
      drsActive: car.drsActive,
    }));

    const telemetry: TelemetrySnapshot = {
      speed: Math.round(this.telemetrySpeed),
      rpm: Math.round(this.telemetryRpm),
      gear: this.telemetryGear,
      throttle: this.telemetryThrottle,
      brake: this.telemetryBrake,
      drs: this.telemetryDrs,
      airTemp: Math.round(this.airTemp * 10) / 10,
      trackTemp: Math.round(this.trackTemp * 10) / 10,
      weatherCondition: 'Dry / Clear',
      trackStatus: this.trackStatus,
    };

    const snapshot: SimulationSnapshot = {
      timing,
      telemetry,
      lap: this.currentLap,
      totalLaps: this.circuit.laps,
      circuit: this.circuit.name,
      trackStatus: this.trackStatus,
      speedMultiplier: this.speedMultiplier,
    };

    for (const listener of this.subscribers) {
      try {
        listener(snapshot);
      } catch {
        // Prevent listener exceptions from breaking the simulation loop
      }
    }
  }

  /**
   * Subscribe to real-time simulation updates.
   * Auto-starts the engine if not already running.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: SimulationListener): () => void {
    this.subscribers.add(listener);

    // Emit initial snapshot immediately to avoid blank flash
    this.broadcast();

    if (!this.isRunning && !this.isPausedByVisibility) {
      this.start();
    }

    return () => {
      this.subscribers.delete(listener);
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  /**
   * Get current state snapshot synchronously without subscribing.
   */
  public getSnapshot(): SimulationSnapshot {
    const timing: DriverTiming[] = this.cars.map((car) => ({
      position: car.position,
      driverNumber: car.driverNumber,
      code: car.code,
      fullName: car.fullName,
      team: car.team,
      teamColor: car.teamColor,
      gapToLeader: formatGap(car.gapToLeader),
      interval: formatInterval(car.interval),
      lastLapTime: formatTime(car.lastLapTime),
      bestLapTime: formatTime(car.bestLapTime),
      sector1: formatSectorTime(car.sector1Time),
      sector2: formatSectorTime(car.sector2Time),
      sector3: formatSectorTime(car.sector3Time),
      sector1Color: car.sector1Color,
      sector2Color: car.sector2Color,
      sector3Color: car.sector3Color,
      tyreCompound: car.tyreCompound,
      tyreAge: car.tyreAge,
      inPit: car.inPit,
      drsActive: car.drsActive,
    }));

    const telemetry: TelemetrySnapshot = {
      speed: Math.round(this.telemetrySpeed),
      rpm: Math.round(this.telemetryRpm),
      gear: this.telemetryGear,
      throttle: this.telemetryThrottle,
      brake: this.telemetryBrake,
      drs: this.telemetryDrs,
      airTemp: Math.round(this.airTemp * 10) / 10,
      trackTemp: Math.round(this.trackTemp * 10) / 10,
      weatherCondition: 'Dry / Clear',
      trackStatus: this.trackStatus,
    };

    return {
      timing,
      telemetry,
      lap: this.currentLap,
      totalLaps: this.circuit.laps,
      circuit: this.circuit.name,
      trackStatus: this.trackStatus,
      speedMultiplier: this.speedMultiplier,
    };
  }
}

export const circuitSimulator = new CircuitSimulatorEngine();
