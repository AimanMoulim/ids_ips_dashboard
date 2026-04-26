import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { format } from 'date-fns';
import type { Attack } from '../mock/mockData';
import { getFlag } from '../mock/mockData';

interface AttackTableProps {
  attacks: Attack[];
  onSelectAttack: (attack: Attack) => void;
  selectedId?: string;
  onBlock?: (ip: string) => void;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CRITICAL: { bg: '#FEF2F2', text: '#EF4444', label: 'CRITICAL' },
  HIGH:     { bg: '#FFF7ED', text: '#F97316', label: 'HIGH' },
  MEDIUM:   { bg: '#FFFBEB', text: '#F59E0B', label: 'MEDIUM' },
  LOW:      { bg: '#ECFDF5', text: '#10B981', label: 'LOW' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BLOCKED:   { bg: '#FEF2F2', text: '#EF4444' },
  ANALYZING: { bg: '#FFFBEB', text: '#F59E0B' },
  ALLOWED:   { bg: '#ECFDF5', text: '#10B981' },
};

export default function AttackTable({ attacks, onSelectAttack, selectedId, onBlock }: AttackTableProps) {
  const [flashId, setFlashId] = useState<string | null>(null);
  const prevFirstIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (attacks.length > 0 && attacks[0].id !== prevFirstIdRef.current) {
      setFlashId(attacks[0].id);
      setTimeout(() => setFlashId(null), 1000);
      prevFirstIdRef.current = attacks[0].id;
    }
  }, [attacks]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Events</Text>
      </View>

      <ScrollView horizontal style={styles.scrollContainer}>
        <View>
          {/* Table Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: 80 }]}>Time</Text>
            <Text style={[styles.headerCell, { width: 140 }]}>Source IP</Text>
            <Text style={[styles.headerCell, { width: 90 }]}>Location</Text>
            <Text style={[styles.headerCell, { width: 110 }]}>Vector</Text>
            <Text style={[styles.headerCell, { width: 90 }]}>Severity</Text>
            <Text style={[styles.headerCell, { width: 90 }]}>Status</Text>
            <Text style={[styles.headerCell, { width: 150 }]}>Actions</Text>
          </View>

          {/* Table Body */}
          <ScrollView style={styles.body} nestedScrollEnabled>
            {attacks.map(attack => {
              const sev = SEVERITY_COLORS[attack.severity] || SEVERITY_COLORS.LOW;
              const stat = STATUS_COLORS[attack.status] || STATUS_COLORS.ALLOWED;
              const isSelected = attack.id === selectedId;
              const isFlashing = attack.id === flashId;

              return (
                <Pressable
                  key={attack.id}
                  style={[
                    styles.row,
                    isSelected && styles.selectedRow,
                    isFlashing && styles.flashRow,
                  ]}
                  onPress={() => onSelectAttack(attack)}
                >
                  <Text style={[styles.cell, { width: 80, color: '#6B7280' }]}>
                    {format(new Date(attack.timestamp), 'HH:mm:ss')}
                  </Text>
                  <Text style={[styles.cell, styles.ipCell, { width: 140 }]}>
                    {attack.sourceIP}
                  </Text>
                  <Text style={[styles.cell, { width: 90 }]}>
                    {getFlag(attack.countryCode)} {attack.countryCode}
                  </Text>
                  <Text style={[styles.cell, { width: 110, fontWeight: '500', color: '#111827' }]}>
                    {attack.attackType}
                  </Text>
                  <View style={[{ width: 90 }, styles.cellContainer]}>
                    <View style={[styles.badge, { backgroundColor: sev.bg }]}>
                      <View style={[styles.dot, { backgroundColor: sev.text }]} />
                      <Text style={[styles.badgeText, { color: sev.text }]}>
                        {sev.label}
                      </Text>
                    </View>
                  </View>
                  <View style={[{ width: 90 }, styles.cellContainer]}>
                    <View style={[styles.badge, { backgroundColor: stat.bg }]}>
                      <Text style={[styles.badgeText, { color: stat.text }]}>
                        {attack.status}
                      </Text>
                    </View>
                  </View>
                  <View style={[{ width: 150 }, styles.actionCell]}>
                    <Pressable
                      style={[styles.actionBtn, styles.blockBtn]}
                      onPress={() => onBlock?.(attack.sourceIP)}
                    >
                      <Text style={styles.blockBtnText}>Block IP</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtn, styles.detailBtn]}
                      onPress={() => onSelectAttack(attack)}
                    >
                      <Text style={styles.detailBtnText}>Analyze</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  body: {
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedRow: {
    backgroundColor: '#EEF2FF',
  },
  flashRow: {
    backgroundColor: '#FEF2F2',
  },
  cell: {
    fontSize: 13,
    color: '#4B5563',
  },
  ipCell: {
    fontFamily: 'monospace',
    color: '#111827',
    fontWeight: '600',
  },
  cellContainer: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  blockBtn: {
    borderColor: '#FCCCA7',
    backgroundColor: '#FFF7ED',
  },
  detailBtn: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  blockBtnText: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '600',
  },
  detailBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
});
