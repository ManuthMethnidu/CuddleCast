import { RadioBrowserStation } from './radioBrowser';
import { authStorage } from './storage';

export interface RadioRecordingItem {
  id: string;
  stationuuid: string;
  stationName: string;
  country: string;
  countrycode: string;
  favicon?: string;
  timestamp: number;
  durationSeconds: number;
  sizeBytes: number;
  codec: string;
  mimeType: string;
  filename: string;
}

export interface ActiveRecordingState {
  isRecording: boolean;
  station: RadioBrowserStation | null;
  startedAt: number;
  durationSeconds: number;
  bytesRecorded: number;
}

const DB_NAME = 'echora_radio_recordings_db';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

// IndexedDB Helper for audio blobs
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, blob });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to store audio blob in IndexedDB:', err);
  }
}

export async function getBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteBlob(id: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

class RadioRecorderService {
  private abortController: AbortController | null = null;
  private currentStation: RadioBrowserStation | null = null;
  private startedAt = 0;
  private durationSeconds = 0;
  private bytesRecorded = 0;
  private isRecordingActive = false;
  private chunks: Uint8Array[] = [];
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Set<(state: ActiveRecordingState) => void>();

  public getState(): ActiveRecordingState {
    return {
      isRecording: this.isRecordingActive,
      station: this.currentStation,
      startedAt: this.startedAt,
      durationSeconds: this.durationSeconds,
      bytesRecorded: this.bytesRecorded,
    };
  }

  public subscribe(callback: (state: ActiveRecordingState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Recorder subscriber error:', err);
      }
    });
  }

  public async start(station: RadioBrowserStation): Promise<boolean> {
    if (this.isRecordingActive) {
      await this.stop();
    }

    const streamUrl = station.url_resolved || station.url;
    if (!streamUrl) return false;

    this.currentStation = station;
    this.startedAt = Date.now();
    this.durationSeconds = 0;
    this.bytesRecorded = 0;
    this.chunks = [];
    this.abortController = new AbortController();
    this.isRecordingActive = true;
    this.notify();

    // Start timer interval
    this.timerInterval = setInterval(() => {
      if (this.isRecordingActive) {
        this.durationSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
        this.notify();
      }
    }, 1000);

    // Stream reader worker
    (async () => {
      let response: Response | null = null;

      // 1. Try direct fetch
      try {
        response = await fetch(streamUrl, {
          signal: this.abortController?.signal,
        });
      } catch {
        // 2. Fallback to Vite dev proxy if direct fetch fails (e.g. CORS)
        try {
          const proxyUrl = `/api/radio-stream?url=${encodeURIComponent(streamUrl)}`;
          response = await fetch(proxyUrl, {
            signal: this.abortController?.signal,
          });
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn('Radio recording stream fetch failed:', err);
          }
        }
      }

      if (!response || !response.body) {
        if (this.isRecordingActive) {
          this.stop();
        }
        return;
      }

      const reader = response.body.getReader();

      try {
        while (this.isRecordingActive) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value && value.length > 0) {
            this.chunks.push(value);
            this.bytesRecorded += value.length;
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error reading stream chunks:', err);
        }
      } finally {
        reader.cancel().catch(() => {});
      }
    })();

    return true;
  }

  public async stop(): Promise<{ item: RadioRecordingItem; blob: Blob } | null> {
    if (!this.isRecordingActive || !this.currentStation) {
      this.isRecordingActive = false;
      this.notify();
      return null;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.isRecordingActive = false;
    const station = this.currentStation;
    const duration = Math.max(1, this.durationSeconds);
    const size = this.bytesRecorded;
    const timestamp = Date.now();

    // Determine extension and mime type based on station codec
    const codecUpper = (station.codec || '').toUpperCase();
    let ext = 'mp3';
    let mimeType = 'audio/mpeg';

    if (codecUpper.includes('AAC')) {
      ext = 'aac';
      mimeType = 'audio/aac';
    } else if (codecUpper.includes('OGG')) {
      ext = 'ogg';
      mimeType = 'audio/ogg';
    }

    const cleanName = station.name
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const dateStr = new Date(timestamp)
      .toISOString()
      .slice(0, 19)
      .replace(/T/, '_')
      .replace(/:/g, '-');
    const filename = `${cleanName || 'radio'}_${dateStr}.${ext}`;

    const blob = new Blob(this.chunks as unknown as BlobPart[], { type: mimeType });
    const recordingId = `rec_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

    const recordingItem: RadioRecordingItem = {
      id: recordingId,
      stationuuid: station.stationuuid,
      stationName: station.name,
      country: station.country,
      countrycode: station.countrycode,
      favicon: station.favicon,
      timestamp,
      durationSeconds: duration,
      sizeBytes: size,
      codec: station.codec || 'MP3',
      mimeType,
      filename,
    };

    // 1. Immediately trigger browser download locally
    if (blob.size > 0) {
      triggerDownload(blob, filename);
    }

    // 2. Persist in IndexedDB and storage metadata
    await storeBlob(recordingId, blob);
    this.saveRecordingMetadata(recordingItem);

    // Reset state
    this.currentStation = null;
    this.durationSeconds = 0;
    this.bytesRecorded = 0;
    this.chunks = [];
    this.notify();

    return { item: recordingItem, blob };
  }

  // Local storage metadata methods
  private getStorageKey(): string {
    const uid = authStorage.getUserId() || 'guest';
    return `echora_radio_recordings_${uid}`;
  }

  public getRecordings(): RadioRecordingItem[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private saveRecordingMetadata(item: RadioRecordingItem): void {
    const current = this.getRecordings();
    const updated = [item, ...current.filter((r) => r.id !== item.id)];
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    } catch {}
  }

  public async deleteRecording(id: string): Promise<void> {
    await deleteBlob(id);
    const current = this.getRecordings();
    const updated = current.filter((r) => r.id !== id);
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    } catch {}
  }

  public async downloadSaved(item: RadioRecordingItem): Promise<boolean> {
    const blob = await getBlob(item.id);
    if (!blob) return false;
    triggerDownload(blob, item.filename);
    return true;
  }
}

export const radioRecorder = new RadioRecorderService();
