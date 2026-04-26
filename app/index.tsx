// ━━━ Dashboard Screen — Main SOC overview (Light Theme) ━━━
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAlertContext } from './_layout';
import KPICard from '../src/components/KPICard';
import AttackMap from '../src/components/AttackMap';
import AttackTimeline from '../src/components/AttackTimeline';
import AttackTable from '../src/components/AttackTable';
import XAIPanel from '../src/components/XAIPanel';

export default function DashboardScreen() {
  const {
    recentAttacks, kpi, timeline,
    selectedAttack, setSelectedAttack,
    blockIP, allAttacks,
  } = useAlertContext();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Platform Overview</Text>
          <Text style={styles.pageSubtitle}>
            Incident response & network monitoring — {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Sync</Text>
        </View>
      </View>

      {/* TOP ROW — KPI Cards */}
      <View style={styles.kpiRow}>
        <KPICard
          title="Attacks / Hour"
          value={kpi.attacksPerHour || 0} // Fallback to 0 to fix the crash safely if API fails
          subtitle="vs last hour"
          trend={kpi.attackDelta || 0}
          danger={kpi.attacksPerHour && kpi.attacksPerHour > 200 ? true : false}
          icon=""
        />
        <KPICard
          title="Active Blocks"
          value={kpi.ipsBlocked || 0}
          subtitle="Global IP ban list"
          danger={true}
          icon=""
        />
        <KPICard
          title="API Latency"
          value={kpi.latencyMs || 0}
          suffix="ms"
          subtitle="System response time"
          danger={kpi.latencyMs && kpi.latencyMs > 100 ? true : false}
          icon=""
        />
        <KPICard
          title="False Positives"
          value={kpi.falsePositiveRate || 0}
          suffix="%"
          decimals={1}
          subtitle={`Model precision metrics`}
          danger={kpi.falsePositiveRate && kpi.falsePositiveRate > 3 ? true : false}
          icon=""
        />
      </View>

      {/* MIDDLE ROW — Map + Timeline */}
      <View style={styles.middleRow}>
        <View style={styles.mapContainer}>
          <AttackMap attacks={allAttacks || []} />
        </View>
        <View style={styles.timelineContainer}>
          <AttackTimeline data={timeline || []} />
        </View>
      </View>

      {/* BOTTOM ROW — Table + XAI */}
      <View style={styles.bottomRow}>
        <View style={styles.tableContainer}>
          <AttackTable
            attacks={recentAttacks || []}
            onSelectAttack={setSelectedAttack}
            selectedId={selectedAttack?.id}
            onBlock={blockIP}
          />
        </View>
        <View style={styles.xaiContainer}>
          <XAIPanel attack={selectedAttack} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  // ── Header ──
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // ── KPI Row ──
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  // ── Middle Row ──
  middleRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
    minHeight: 380,
  },
  mapContainer: {
    flex: 6,
  },
  timelineContainer: {
    flex: 4,
  },
  // ── Bottom Row ──
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 350,
  },
  tableContainer: {
    flex: 55,
  },
  xaiContainer: {
    flex: 45,
  },
});
