export interface HighScoreRecord {
  id: string;
  mapId: string;
  difficultyId: string;
  score: number;
  wavesCompleted: number;
  totalWaves: number;
  outcome: 'VICTORY' | 'DEFEAT';
  date: string;
}

const STORAGE_KEY = 'cyber_immunology_high_scores_v1';
const MAX_SCORES_PER_BUCKET = 20;

function isValidRecord(entry: unknown): entry is HighScoreRecord {
  if (typeof entry !== 'object' || entry === null) return false;
  const r = entry as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.mapId === 'string' &&
    typeof r.difficultyId === 'string' &&
    typeof r.score === 'number' &&
    Number.isFinite(r.score) &&
    typeof r.wavesCompleted === 'number' &&
    Number.isFinite(r.wavesCompleted) &&
    typeof r.totalWaves === 'number' &&
    Number.isFinite(r.totalWaves) &&
    (r.outcome === 'VICTORY' || r.outcome === 'DEFEAT') &&
    typeof r.date === 'string'
  );
}

export class HighScoreManager {
  private static parseRecords(): HighScoreRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidRecord);
      }
      return [];
    } catch {
      return [];
    }
  }

  public static getScores(mapId?: string, difficultyId?: string): HighScoreRecord[] {
    const all = this.parseRecords();
    return all.filter((r) => {
      if (mapId && r.mapId !== mapId) return false;
      if (difficultyId && r.difficultyId !== difficultyId) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }

  public static getBestScore(mapId: string, difficultyId: string): number {
    const scores = this.getScores(mapId, difficultyId);
    return scores.length > 0 ? scores[0]!.score : 0;
  }

  public static saveScore(record: Omit<HighScoreRecord, 'id' | 'date'>): HighScoreRecord {
    const all = this.parseRecords();
    const newRecord: HighScoreRecord = {
      ...record,
      id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    all.push(newRecord);
    // Trim within each (mapId, difficultyId) bucket: keep top N per bucket
    const buckets = new Map<string, HighScoreRecord[]>();
    for (const r of all) {
      const key = `${r.mapId}\u0000${r.difficultyId}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.push(r);
      } else {
        buckets.set(key, [r]);
      }
    }
    const trimmed: HighScoreRecord[] = [];
    for (const bucket of buckets.values()) {
      bucket.sort((a, b) => b.score - a.score);
      trimmed.push(...bucket.slice(0, MAX_SCORES_PER_BUCKET));
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore
    }

    return newRecord;
  }
}
