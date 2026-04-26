import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Attack } from '../mock/mockData';
import { getFlag } from '../mock/mockData';

interface AttackMapProps {
  attacks: Attack[];
}

const SERVER_LAT = 34.0209;
const SERVER_LNG = -6.8416;

export default function AttackMap({ attacks }: AttackMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = async () => {
      const L = await import('leaflet');

      if (!mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [25, 20],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      });

      // Light tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
      }).addTo(map);

      // Server location marker
      const serverIcon = L.divIcon({
        className: 'server-marker',
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3B82F6;border:3px solid #FFFFFF;
          box-shadow:0 2px 5px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([SERVER_LAT, SERVER_LNG], { icon: serverIcon }).addTo(map)
        .bindTooltip('Protection Target — Rabat, Morocco', {
          className: 'light-tooltip',
          direction: 'top',
        });

      leafletMapRef.current = map;
      updateMarkers(L, map, attacks);
    };

    if (!document.getElementById('map-styles')) {
      const style = document.createElement('style');
      style.id = 'map-styles';
      style.textContent = `
        .light-tooltip {
          background: #FFFFFF !important;
          color: #111827 !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important;
          font-family: inherit !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        .light-tooltip::before { border-top-color: #E5E7EB !important; }
        .attack-pulse {
          animation: attackPulse 2s ease-out infinite;
        }
        @keyframes attackPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .attack-line {
          stroke-dasharray: 8 4;
          animation: dashMove 1s linear infinite;
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -12; }
        }
      `;
      document.head.appendChild(style);
    }

    initMap();
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    const initLeaflet = async () => {
      const L = await import('leaflet');
      updateMarkers(L, leafletMapRef.current, attacks);
    };
    initLeaflet();
  }, [attacks]);

  const updateMarkers = (L: any, map: any, attackList: Attack[]) => {
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const recent = attackList.slice(0, 15);
    recent.forEach(attack => {
      const color = attack.severity === 'CRITICAL' ? '#EF4444' : '#F97316';
      const attackIcon = L.divIcon({
        className: 'attack-marker',
        html: `
          <div style="position:relative;width:12px;height:12px;">
            <div style="
              position:absolute;width:12px;height:12px;border-radius:50%;
              background:${color};
              border: 2px solid #FFF;
              box-shadow:0 1px 3px rgba(0,0,0,0.2);
            "></div>
            <div class="attack-pulse" style="
              position:absolute;width:12px;height:12px;border-radius:50%;
              background:${color}55;
            "></div>
          </div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([attack.lat, attack.lng], { icon: attackIcon })
        .addTo(map)
        .bindTooltip(
          `<b>${getFlag(attack.countryCode)} ${attack.country}</b><br/>` +
          `IP: <span style="font-family:monospace">${attack.sourceIP}</span><br/>` +
          `Type: ${attack.attackType}`,
          { className: 'light-tooltip', direction: 'top' }
        );

      markersRef.current.push(marker);

      const line = L.polyline(
        [[attack.lat, attack.lng], [SERVER_LAT, SERVER_LNG]],
        {
          color: color,
          weight: 1.5,
          opacity: 0.5,
          className: 'attack-line',
        }
      ).addTo(map);
      markersRef.current.push(line);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Geographic Distribution</Text>
      </View>
      <View style={styles.mapWrapper}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden' }} />
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Critical</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Target</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  mapWrapper: {
    flex: 1,
    minHeight: 280,
  },
  legend: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
});
