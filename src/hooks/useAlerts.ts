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
    countryCode: 'UN', // Mocked as backend doesn't provide
    attackType: api.attack_type || 'Unknown',
    severity: api.severity || 'LOW',
    confidence: api.confidence || 0,
    status: api.status || 'ALLOWED',
    features: Object.entries(api.features || {}).map(([name, value]) => ({ name, value: value as number })),
    duration: api.latency_ms ? `${api.latency_ms}ms` : '0ms',
    lat: (Math.random() * 80) - 40, // Random lat/lon for the map if unknown
    lng: (Math.random() * 180) - 90,
    actionTaken: api.status === 'BLOCKED' ? 'Auto-blocked' : 'Monitoring',
  };
}

export function useAlerts(): AlertState {
  // Data states (Init empty, fully relying on API)
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

  // Handle adding new alert (WS pushes)
  const handleAddAlert = useCallback((newAttack: Attack) => {
    setAllAttacks(prev => [newAttack, ...prev].slice(0, 1000));
    setLatestAlert(newAttack);
    setUnreadCount(prev => prev + 1);
    setAlertHistory(prev => [newAttack, ...prev].slice(0, 50));
    
    // Auto-dismiss
    setTimeout(() => {
      setLatestAlert(prev => (prev?.id === newAttack.id ? null : prev));
    }, 6000);
  }, []);

  // ── REAL API SYNC ──
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
          // Parse alerts
          if (Array.isArray(recentRes.data)) {
            setAllAttacks(recentRes.data.map(mapApiAttack));
          }
          // Parse stats
          if (statsRes.data) {
            setKpi(prev => ({
              ...prev,
              attacksPerHour: statsRes.data.attacks_per_hour || 0,
              ipsBlocked: statsRes.data.total_blocked || 0,
              latencyMs: statsRes.data.latency_ms || 0,
              falsePositiveRate: statsRes.data.fpr || 0,
            }));
          }
          // Parse blockeds
          if (Array.isArray(blockedRes.data)) {
            setBlockedIPs(blockedRes.data.map(ipData => ({
              ip: typeof ipData === 'string' ? ipData : ipData.ip,
              country: 'Unknown',
              countryCode: 'UN',
              isp: 'Unknown',
              firstSeen: new Date(),
              lastSeen: new Date(),
              attackCount: 1,
              reason: 'API Blocked',
              blockedBy: 'Auto',
              abuseScore: 80,
              categories: [],
              totalReports: 1,
            })));
          }
        }
      } catch (err) {
        console.warn('Backend offline, check connection to Suricata Flask API.');
      }
    };

    fetchInitialData();
    pollInterval = setInterval(fetchInitialData, POLL_INTERVAL);

    // Setup WS
    const connectWS = () => {
      try {
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
          setTimeout(connectWS, 2000); // Always try to reconnect
        };
      } catch (e) {
        console.warn('WS Connect failed', e);
      }
    };

    connectWS();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [handleAddAlert]);

  const dismissAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  const blockIP = useCallback(async (ip: string) => {
    try {
      await axios.post(`${API_URL}/api/block`, { ip });
    } catch (e) { console.error('Block IP failed', e); }
    
    // Optimistic UI update
    setAllAttacks(prev =>
      prev.map(a => (a.sourceIP === ip ? { ...a, status: 'BLOCKED' as const } : a))
    );
  }, []);

  const unblockIP = useCallback(async (ip: string) => {
    try {
      await axios.post(`${API_URL}/api/unblock`, { ip });
    } catch (e) { console.error('Unblock IP failed', e); }
    
    // Optimistic UI update
    setBlockedIPs(prev => prev.filter(b => b.ip !== ip));
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

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
    isDemoMode: false, // Hardcoded to false, entirely real
    setSelectedAttack,
    dismissAlert,
    blockIP,
    unblockIP,
    clearUnread,
  };
}
