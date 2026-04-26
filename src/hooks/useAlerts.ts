import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Attack,
  BlockedIP,
  KPIData,
  TimelinePoint,
  AttackStats
} from '../mock/mockData'; // Now just a type file

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const WS_URL = API_URL.replace('http', 'ws') + '/ws/alerts';

const POLL_INTERVAL = 5000;

export interface AlertState {
  recentAttacks: Attack[];
  allAttacks: Attack[];
  blockedIPs: BlockedIP[];
  kpi: KPIData;
  timeline: TimelinePoint[];
  latestAlert: Attack | null;
  selectedAttack: Attack | null;
  unreadCount: number;
  alertHistory: Attack[];
  isDemoMode: boolean; // Retained for type compatibility but will be false
  setSelectedAttack: (attack: Attack | null) => void;
  dismissAlert: () => void;
  blockIP: (ip: string) => void;
  unblockIP: (ip: string) => void;
  clearUnread: () => void;
}

// ── Helpers for mapping backend to UI ──
function mapApiAttack(api: any): Attack {
  return {
    id: api.id || `ATK-${Math.floor(Math.random()*100000)}`,
    timestamp: api.timestamp ? new Date(api.timestamp) : new Date(),
    sourceIP: api.source_ip || '0.0.0.0',
    destinationPort: api.destination_port || 0,
    country: api.country || 'Unknown',
    countryCode: api.country_code || 'UN', 
    attackType: api.attack_type || 'Unknown',
    severity: api.severity || 'LOW',
    confidence: api.confidence || 0,
    status: api.status || 'ALLOWED',
    features: Object.entries(api.features || {}).map(([name, value]) => ({ name, value: value as number })),
    duration: api.latency_ms ? `${api.latency_ms}ms` : '0ms',
    lat: api.lat || (Math.random() * 80) - 40,
    lng: api.lon || (Math.random() * 180) - 90,
    actionTaken: api.status === 'BLOCKED' ? 'Auto-blocked' : 'Monitoring',
  };
}

function generateTimeline(attacks: Attack[]): TimelinePoint[] {
  const groups: Record<string, number> = {};
  // Take last 50 for trend
  const items = attacks.slice(0, 50);
  items.forEach(a => {
    const time = a.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    groups[time] = (groups[time] || 0) + 1;
  });
  
  return Object.entries(groups)
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-12);
}

export function useAlerts(): AlertState {
  const [allAttacks, setAllAttacks] = useState<Attack[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [kpi, setKpi] = useState<KPIData>({ attacksPerHour: 0, ipsBlocked: 0, latencyMs: 0, falsePositiveRate: 0, f1Score: 0, attackDelta: 0 });
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  
  const [latestAlert, setLatestAlert] = useState<Attack | null>(null);
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertHistory, setAlertHistory] = useState<Attack[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);

  const recentAttacks = allAttacks.slice(0, 10);

  useEffect(() => {
    setTimeline(generateTimeline(allAttacks));
  }, [allAttacks]);

  const handleAddAlert = useCallback((newAttack: Attack) => {
    setAllAttacks(prev => {
      const updated = [newAttack, ...prev].slice(0, 1000);
      return updated.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
    setLatestAlert(newAttack);
    setUnreadCount(prev => prev + 1);
    
    setTimeout(() => {
      setLatestAlert(prev => (prev?.id === newAttack.id ? null : prev));
    }, 6000);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: any;

    const fetchInitialData = async () => {
      try {
        const [recentRes, statsRes, blockedRes] = await Promise.all([
          axios.get(`${API_URL}/api/alerts/recent`),
          axios.get(`${API_URL}/api/stats`),
          axios.get(`${API_URL}/api/blocked`),
        ]);

        if (isMounted) {
          if (Array.isArray(recentRes.data)) {
            const mapped = recentRes.data.map(mapApiAttack);
            setAllAttacks(mapped.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
          }
          if (statsRes.data) {
            setKpi(prev => ({
              ...prev,
              attacksPerHour: statsRes.data.attacks_per_hour || 0,
              ipsBlocked: statsRes.data.total_blocked || 0,
              latencyMs: statsRes.data.latency_ms || 0,
              falsePositiveRate: statsRes.data.fpr || 0,
              attackDelta: statsRes.data.attack_delta || 0,
            }));
          }
          if (Array.isArray(blockedRes.data)) {
            setBlockedIPs(blockedRes.data.map(ipData => {
              const ip = typeof ipData === 'string' ? ipData : ipData.ip;
              return {
                ip,
                country: ipData.country || 'Unknown',
                countryCode: ipData.country_code || 'UN',
                isp: ipData.isp || 'Service Provider',
                firstSeen: ipData.first_seen ? new Date(ipData.first_seen) : new Date(),
                lastSeen: ipData.last_seen ? new Date(ipData.last_seen) : new Date(),
                attackCount: ipData.attack_count || 1,
                reason: ipData.reason || 'Security Policy',
                blockedBy: ipData.blocked_by || 'Auto',
                abuseScore: ipData.abuse_score || 85,
                categories: ipData.categories || ['Hacking'],
                totalReports: ipData.total_reports || 1,
              };
            }));
          }
        }
      } catch (err) {
        console.warn('Backend connection issue.');
      }
    };

    fetchInitialData();
    pollInterval = setInterval(fetchInitialData, POLL_INTERVAL);

    const connectWS = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleAddAlert(mapApiAttack(data));
        } catch (e) {
          console.error('WS parse error', e);
        }
      };

      ws.onclose = () => {
        setTimeout(connectWS, 3000);
      };
      
      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [handleAddAlert]);

  const dismissAlert = useCallback(() => setLatestAlert(null), []);

  const blockIP = useCallback(async (ip: string) => {
    try {
      await axios.post(`${API_URL}/api/block`, { ip });
      setAllAttacks(prev =>
        prev.map(a => (a.sourceIP === ip ? { ...a, status: 'BLOCKED' as const } : a))
      );
    } catch (e) { console.error('Block IP failed', e); }
  }, []);

  const unblockIP = useCallback(async (ip: string) => {
    try {
      await axios.post(`${API_URL}/api/unblock`, { ip });
      setBlockedIPs(prev => prev.filter(b => b.ip !== ip));
    } catch (e) { console.error('Unblock IP failed', e); }
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return {
    recentAttacks,
    allAttacks,
    blockedIPs,
    kpi,
    timeline,
    latestAlert,
    selectedAttack,
    unreadCount,
    alertHistory,
    isDemoMode: false,
    setSelectedAttack,
    dismissAlert,
    blockIP,
    unblockIP,
    clearUnread,
  };
}
