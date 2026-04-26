// ━━━ Attack History Screen — Full attack log with filters (Light Theme) ━━━
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { format } from 'date-fns';
import { useAlertContext } from './_layout';
import { getFlag, computeStats, type Attack, type AttackType, type Severity } from '../src/mock/mockData';

const ITEMS_PER_PAGE = 20;
const ATTACK_TYPES: (AttackType | 'All')[] = ['All', 'DDoS', 'PortScan', 'BruteForce', 'SQLInjection', 'XSS'];
const SEVERITIES: (Severity | 'All')[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: '#FEF2F2', text: '#EF4444' },
  HIGH: { bg: '#FFF7ED', text: '#F97316' },
  MEDIUM: { bg: '#FFFBEB', text: '#F59E0B' },
  LOW: { bg: '#ECFDF5', text: '#10B981' },
};

export default function AttackHistoryScreen() {
  const { allAttacks } = useAlertContext();
  const [searchIP, setSearchIP] = useState('');
  const [typeFilter, setTypeFilter] = useState<AttackType | 'All'>('All');
  const [sevFilter, setSevFilter] = useState<Severity | 'All'>('All');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...allAttacks];
    if (searchIP) result = result.filter(a => a.sourceIP.includes(searchIP));
    if (typeFilter !== 'All') result = result.filter(a => a.attackType === typeFilter);
    if (sevFilter !== 'All') result = result.filter(a => a.severity === sevFilter);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'timestamp') cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortCol === 'confidence') cmp = (a.confidence || 0) - (b.confidence || 0);
      else if (sortCol === 'sourceIP') cmp = (a.sourceIP || '').localeCompare(b.sourceIP || '');
      else if (sortCol === 'severity') {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        cmp = (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allAttacks, searchIP, typeFilter, sevFilter, sortCol, sortDir]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIndicator = ({ col }: { col: string }) => (
    <Text style={styles.sortArrow}>
      {sortCol === col ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
    </Text>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Incident Log</Text>
          <Text style={styles.pageSubtitle}>Full historical record of network security events</Text>
        </View>
        <Pressable style={styles.exportBtn}>
          <Text style={styles.exportText}>Export (CSV)</Text>
        </Pressable>
      </View>

      {/* Stats Summary Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TOTAL EVENTS</Text>
          <Text style={styles.statValue}>{stats.total.toLocaleString()}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DDOS</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.ddosPercent}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PORT SCAN</Text>
          <Text style={[styles.statValue, { color: '#F97316' }]}>{stats.portScanPercent}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BRUTE FORCE</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.bruteForcePercent}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BLOCKED RATE</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.blockedPercent}%</Text>
        </View>
      </View>

      {/* Filters Bar */}
      <View style={styles.filtersCard}>
        <View style={styles.searchSection}>
          <Text style={styles.filterGroupLabel}>SEARCH SOURCE IP</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. 192.168.1.1"
            placeholderTextColor="#9CA3AF"
            value={searchIP}
            onChangeText={(t) => { setSearchIP(t); setPage(0); }}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterGroupLabel}>ATTACK TYPE</Text>
          <View style={styles.filterChips}>
            {ATTACK_TYPES.map(t => (
              <Pressable
                key={t}
                style={[styles.chip, typeFilter === t && styles.chipActive]}
                onPress={() => { setTypeFilter(t); setPage(0); }}
              >
                <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterGroupLabel}>SEVERITY LEVEL</Text>
          <View style={styles.filterChips}>
            {SEVERITIES.map(s => (
              <Pressable
                key={s}
                style={[styles.chip, sevFilter === s && styles.chipActive]}
                onPress={() => { setSevFilter(s); setPage(0); }}
              >
                <Text style={[styles.chipText, sevFilter === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { width: 80 }]}>ID</Text>
              <Pressable style={{ width: 140 }} onPress={() => toggleSort('timestamp')}>
                <Text style={styles.thCell}>TIMESTAMP<SortIndicator col="timestamp" /></Text>
              </Pressable>
              <Pressable style={{ width: 140 }} onPress={() => toggleSort('sourceIP')}>
                <Text style={styles.thCell}>SOURCE IP<SortIndicator col="sourceIP" /></Text>
              </Pressable>
              <Text style={[styles.thCell, { width: 70 }]}>PORT</Text>
              <Text style={[styles.thCell, { width: 100 }]}>LOCATION</Text>
              <Text style={[styles.thCell, { width: 110 }]}>VECTOR</Text>
              <Pressable style={{ width: 100 }} onPress={() => toggleSort('severity')}>
                <Text style={styles.thCell}>SEVERITY<SortIndicator col="severity" /></Text>
              </Pressable>
              <Text style={[styles.thCell, { width: 110 }]}>STATUS</Text>
              <Text style={[styles.thCell, { width: 80 }]}>LATENCY</Text>
            </View>

            {/* Rows */}
            <ScrollView style={{ maxHeight: 600 }}>
              {pageData.length > 0 ? (
                pageData.map(attack => {
                  const sev = SEVERITY_COLORS[attack.severity] || SEVERITY_COLORS.LOW;
                  const isExpanded = expandedId === attack.id;

                  return (
                    <View key={attack.id}>
                      <Pressable
                        style={[styles.tableRow, isExpanded && styles.tableRowExpanded]}
                        onPress={() => setExpandedId(isExpanded ? null : attack.id)}
                      >
                        <Text style={[styles.tdCell, { width: 80, color: '#9CA3AF', fontSize: 10 }]}>
                          #{attack.id.split('-').pop()}
                        </Text>
                        <Text style={[styles.tdCell, { width: 140 }]}>
                          {format(new Date(attack.timestamp), 'MM/dd HH:mm:ss')}
                        </Text>
                        <Text style={[styles.tdCell, { width: 140, color: '#111827', fontWeight: '700', fontFamily: 'monospace' }]}>
                          {attack.sourceIP}
                        </Text>
                        <Text style={[styles.tdCell, { width: 70 }]}>{attack.destinationPort}</Text>
                        <Text style={[styles.tdCell, { width: 100 }]}>
                          {getFlag(attack.countryCode)} {attack.country}
                        </Text>
                        <Text style={[styles.tdCell, { width: 110, fontWeight: '600' }]}>
                          {attack.attackType}
                        </Text>
                        <View style={{ width: 100 }}>
                          <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                            <View style={[styles.sevDot, { backgroundColor: sev.text }]} />
                            <Text style={[styles.sevBadgeText, { color: sev.text }]}>
                              {attack.severity}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.tdCell, { width: 110, fontWeight: '700', color: attack.status === 'BLOCKED' ? '#EF4444' : '#10B981' }]}>
                          {attack.status}
                        </Text>
                        <Text style={[styles.tdCell, { width: 80 }]}>{attack.duration}</Text>
                      </Pressable>

                      {/* Expanded Section — Feature Breakdown */}
                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          <View style={styles.expandedHeader}>
                            <Text style={styles.expandedTitle}>FEATURES DISTRIBUTION ANALYSIS</Text>
                            <Text style={styles.confidenceText}>Confiance du modèle: {attack.confidence}%</Text>
                          </View>
                          <View style={styles.featureGrid}>
                            {attack.features.slice(0, 8).map((f, i) => (
                              <View key={i} style={styles.featureItem}>
                                <View style={styles.featureLabelRow}>
                                  <Text style={styles.featureName}>{f.name}</Text>
                                  <Text style={styles.featureVal}>{f.value.toFixed(1)}%</Text>
                                </View>
                                <View style={styles.featureBarBg}>
                                  <View style={[
                                    styles.featureBarFill,
                                    {
                                      width: `${f.value}%`,
                                      backgroundColor: f.value > 80 ? '#EF4444' : f.value > 50 ? '#F97316' : '#3B82F6',
                                    }
                                  ]} />
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyText}>No matching incidents found.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        <View style={styles.pagination}>
          <Pressable
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <Text style={styles.pageBtnText}>Previous</Text>
          </Pressable>
          
          <View style={styles.pageNumbers}>
             <Text style={styles.pageInfo}>
              Page <Text style={styles.bold}>{page + 1}</Text> of <Text style={styles.bold}>{totalPages || 1}</Text>
            </Text>
            <Text style={styles.resultsCount}>
              ({filtered.length} entries)
            </Text>
          </View>

          <Pressable
            style={[styles.pageBtn, (page >= totalPages - 1 || totalPages === 0) && styles.pageBtnDisabled]}
            onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || totalPages === 0}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </Pressable>
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
  // Header
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
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  exportBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  exportText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F3F4F6',
  },
  // Filters
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  searchSection: {
    width: 240,
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  filterSection: {
    flex: 1,
    minWidth: 300,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#EF4444',
  },
  // Table
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  sortArrow: {
    color: '#EF4444',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableRowExpanded: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 0,
  },
  tdCell: {
    fontSize: 13,
    color: '#4B5563',
  },
  sevBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  sevDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sevBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Expanded Content
  expandedContent: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 30,
    paddingBottom: 24,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  expandedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 1,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  featureItem: {
    width: '22%',
    minWidth: 150,
  },
  featureLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  featureName: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  featureVal: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '700',
  },
  featureBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Empty State
  emptyRow: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageNumbers: {
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 13,
    color: '#4B5563',
  },
  resultsCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  bold: {
    fontWeight: '800',
    color: '#111827',
  },
  pageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
