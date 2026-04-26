// ━━━ BlockedIPTable — Blocked IP management with side panel (Light Theme) ━━━
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { format } from 'date-fns';
import type { BlockedIP } from '../mock/mockData';
import { getFlag } from '../mock/mockData';

interface BlockedIPTableProps {
  blockedIPs: BlockedIP[];
  onUnblock: (ip: string) => void;
}

function ThreatIntelPanel({ ip, onClose }: { ip: BlockedIP; onClose: () => void }) {
  const scoreColor = ip.abuseScore > 80 ? '#EF4444' : ip.abuseScore > 50 ? '#F97316' : '#F59E0B';
  const scoreBg = ip.abuseScore > 80 ? '#FEF2F2' : ip.abuseScore > 50 ? '#FFF7ED' : '#FFFBEB';

  return (
    <View style={styles.sidePanel}>
      <View style={styles.sidePanelHeader}>
        <View>
          <Text style={styles.sidePanelTitle}>Threat Intelligence</Text>
          <Text style={styles.sidePanelSubtitle}>{ip.ip}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={[styles.scoreCard, { backgroundColor: scoreBg }]}>
        <Text style={[styles.scoreNumber, { color: scoreColor }]}>{ip.abuseScore}</Text>
        <Text style={styles.scoreLabel}>Abuse Confidence Score</Text>
        <View style={styles.scoreBarBg}>
           <View style={[styles.scoreBarFill, { width: `${ip.abuseScore}%`, backgroundColor: scoreColor }]} />
        </View>
      </View>

      <View style={styles.intelSection}>
        <Text style={styles.sectionLabel}>NETWORK DETAILS</Text>
        <InfoRow label="Origin Country" value={`${getFlag(ip.countryCode)} ${ip.country}`} />
        <InfoRow label="ISP Provider" value={ip.isp} />
        <InfoRow label="Domain" value={ip.ip} />
      </View>

       <View style={styles.intelSection}>
        <Text style={styles.sectionLabel}>INCIDENT HISTORY</Text>
        <InfoRow label="Total Detections" value={ip.attackCount.toLocaleString()} />
        <InfoRow label="First Detected" value={format(new Date(ip.firstSeen), 'yyyy-MM-dd')} />
        <InfoRow label="Most Recent" value={format(new Date(ip.lastSeen), 'yyyy-MM-dd HH:mm')} />
      </View>

      <Text style={styles.categoriesLabel}>THREAT CATEGORIES</Text>
      <View style={styles.categoriesRow}>
        {ip.categories.map((cat, i) => (
          <View key={i} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{cat}</Text>
          </View>
        ))}
        {ip.categories.length === 0 && <Text style={styles.noData}>No known categories</Text>}
      </View>

      <Pressable style={styles.fullReportBtn}>
        <Text style={styles.fullReportText}>Full AbuseIPDB Profile ↗</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function BlockedIPTable({ blockedIPs, onUnblock }: BlockedIPTableProps) {
  const [search, setSearch] = useState('');
  const [selectedIP, setSelectedIP] = useState<BlockedIP | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

  const filteredIPs = blockedIPs.filter(ip =>
    ip.ip.includes(search) ||
    ip.country.toLowerCase().includes(search.toLowerCase()) ||
    ip.isp.toLowerCase().includes(search.toLowerCase())
  );

  const autoBlocked = blockedIPs.filter(b => b.blockedBy === 'Auto').length;
  const manual = blockedIPs.filter(b => b.blockedBy === 'Manual').length;

  return (
    <View style={styles.container}>
      {/* Search and Quick Filters */}
      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by IP, Country or ISP..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.toolbarActions}>
           <Pressable style={styles.toolBtn}>
            <Text style={styles.toolBtnText}>Manual Block</Text>
          </Pressable>
          <Pressable style={[styles.toolBtn, styles.toolBtnPrimary]}>
            <Text style={styles.toolBtnPrimaryText}>Export List</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Layout (Table + Side Panel) */}
      <View style={styles.mainLayout}>
        <View style={styles.tableSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.thCell, { width: 140 }]}>IP ADDRESS</Text>
                <Text style={[styles.thCell, { width: 120 }]}>COUNTRY</Text>
                <Text style={[styles.thCell, { width: 150 }]}>ISP</Text>
                <Text style={[styles.thCell, { width: 110 }]}>LAST SEEN</Text>
                <Text style={[styles.thCell, { width: 80 }]}>HITS</Text>
                <Text style={[styles.thCell, { width: 100 }]}>REASON</Text>
                <Text style={[styles.thCell, { width: 100 }]}>SCORE</Text>
                <Text style={[styles.thCell, { width: 220 }]}>CONTROLS</Text>
              </View>

              <ScrollView style={styles.tableBody}>
                {filteredIPs.map(ip => (
                  <View key={ip.ip} style={[styles.tableRow, selectedIP?.ip === ip.ip && styles.rowSelected]}>
                    <Text style={[styles.tdCell, styles.ipText, { width: 140 }]}>{ip.ip}</Text>
                    <Text style={[styles.tdCell, { width: 120 }]}>
                      {getFlag(ip.countryCode)} {ip.country}
                    </Text>
                    <Text style={[styles.tdCell, { width: 150 }]}>{ip.isp}</Text>
                    <Text style={[styles.tdCell, { width: 110 }]}>
                      {format(new Date(ip.lastSeen), 'MM-dd HH:mm')}
                    </Text>
                    <Text style={[styles.tdCell, { width: 80, fontWeight: '700', color: '#EF4444' }]}>
                      {ip.attackCount}
                    </Text>
                    <Text style={[styles.tdCell, { width: 100, fontSize: 11 }]}>
                      {ip.reason}
                    </Text>
                    <View style={[{ width: 100 }, styles.tdCellContainer]}>
                      <View style={[styles.scoreBadge, { backgroundColor: ip.abuseScore > 80 ? '#FEF2F2' : '#FFF7ED' }]}>
                        <Text style={[styles.scoreBadgeText, { color: ip.abuseScore > 80 ? '#EF4444' : '#F97316' }]}>
                           {ip.abuseScore}/100
                        </Text>
                      </View>
                    </View>
                    <View style={[{ width: 220 }, styles.actionsCell]}>
                      <Pressable
                        style={[styles.actionBtn, styles.unblockBtn]}
                        onPress={() => setConfirmUnblock(ip.ip)}
                      >
                        <Text style={styles.unblockText}>Whitelist</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, styles.intelBtn]}
                        onPress={() => setSelectedIP(ip)}
                      >
                        <Text style={styles.intelText}>Threat Intel</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
                {filteredIPs.length === 0 && (
                   <View style={styles.emptyTable}>
                      <Text style={styles.emptyTableText}>No results matching your search.</Text>
                   </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        {/* Threat Intel Side Panel */}
        {selectedIP && (
          <ThreatIntelPanel ip={selectedIP} onClose={() => setSelectedIP(null)} />
        )}
      </View>

      {/* Unblock Confirmation Modal */}
      {confirmUnblock && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalIcon}>
                 <View style={styles.modalDot} />
              </View>
              <Text style={styles.modalTitle}>Confirm Whitelist</Text>
              <Text style={styles.modalText}>
                Are you sure you want to lift the block on{'\n'}
                <Text style={styles.ipHighlight}>{confirmUnblock}</Text>?
              </Text>
              <Text style={styles.modalWarn}>
                Lifting this block will resume all traffic from this source immediately.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setConfirmUnblock(null)}
                >
                  <Text style={styles.cancelBtnText}>Keep Blocked</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={() => {
                    onUnblock(confirmUnblock);
                    setConfirmUnblock(null);
                  }}
                >
                  <Text style={styles.confirmBtnText}>Yes, Whitelist</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  toolBtnPrimary: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  toolBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Table Section
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  tableSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  rowSelected: {
    backgroundColor: '#EEF2FF',
  },
  tdCell: {
    fontSize: 13,
    color: '#4B5563',
  },
  tdCellContainer: {
    justifyContent: 'center',
  },
  ipText: {
    color: '#111827',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsCell: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  unblockBtn: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  intelBtn: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  unblockText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  intelText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  emptyTable: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTableText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  // Side Panel
  sidePanel: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sidePanelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sidePanelSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    marginBottom: 12,
  },
  scoreBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  intelSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  categoriesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 24,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  noData: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  fullReportBtn: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  fullReportText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F97316',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  ipHighlight: {
    color: '#111827',
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  modalWarn: {
    fontSize: 12,
    color: '#F97316',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#111827',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '700',
  },
  confirmBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
