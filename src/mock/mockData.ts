// ━━━ SOC Dashboard Types ━━━
// Kept in this file location to avoid breaking component imports, but stripped of all mock data.

export type AttackType = 'DDoS' | 'PortScan' | 'BruteForce' | 'SQLInjection' | 'XSS' | string;
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
export type Status = 'BLOCKED' | 'ANALYZING' | 'ALLOWED' | string;

export interface FeatureContribution {
  name: string;
  value: number; // 0–100
}

export interface Attack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  destinationPort: number;
  country: string;
  countryCode: string;
  attackType: AttackType;
  severity: Severity;
  confidence: number;
  status: Status;
  features: FeatureContribution[];
  duration: string;
  lat: number;
  lng: number;
  actionTaken: string;
}

export interface BlockedIP {
  ip: string;
  country: string;
  countryCode: string;
  isp: string;
  firstSeen: Date;
  lastSeen: Date;
  attackCount: number;
  reason: string;
  blockedBy: string;
  abuseScore: number;
  categories: string[];
  totalReports: number;
}

export interface KPIData {
  attacksPerHour: number;
  ipsBlocked: number;
  latencyMs: number;
  falsePositiveRate: number;
  f1Score: number;
  attackDelta: number;
}

export interface TimelinePoint {
  time: string;
  hour: number;
  DDoS: number;
  PortScan: number;
  BruteForce: number;
}

const FLAG_EMOJIS: Record<string, string> = {
  CN: '🇨🇳', RU: '🇷🇺', US: '🇺🇸', BR: '🇧🇷', IN: '🇮🇳',
  IR: '🇮🇷', KP: '🇰🇵', NG: '🇳🇬', VN: '🇻🇳', TR: '🇹🇷',
  DE: '🇩🇪', RO: '🇷🇴', UA: '🇺🇦', ID: '🇮🇩', PK: '🇵🇰',
  UN: '🏳️' // Unknown
};

export function getFlag(code: string): string {
  return FLAG_EMOJIS[code] || '🏳️';
}

// Stats helper
export interface AttackStats {
  total: number;
  ddosPercent: number;
  portScanPercent: number;
  bruteForcePercent: number;
  otherPercent: number;
  blockedPercent: number;
}

export function computeStats(attacks: Attack[]): AttackStats {
  const total = attacks.length;
  const ddos = attacks.filter(a => a.attackType === 'DDoS').length;
  const portScan = attacks.filter(a => a.attackType === 'PortScan').length;
  const bruteForce = attacks.filter(a => a.attackType === 'BruteForce').length;
  const blocked = attacks.filter(a => a.status === 'BLOCKED').length;
  const other = total - ddos - portScan - bruteForce;

  return {
    total,
    ddosPercent: total ? Math.round((ddos / total) * 100) : 0,
    portScanPercent: total ? Math.round((portScan / total) * 100) : 0,
    bruteForcePercent: total ? Math.round((bruteForce / total) * 100) : 0,
    otherPercent: total ? Math.round((other / total) * 100) : 0,
    blockedPercent: total ? parseFloat(((blocked / total) * 100).toFixed(1)) : 0,
  };
}
