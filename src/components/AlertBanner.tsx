import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { Attack } from '../mock/mockData';
import { getFlag } from '../mock/mockData';

interface AlertBannerProps {
  attack: Attack | null;
  onDismiss: () => void;
  onViewDetails?: (attack: Attack) => void;
}

const SEVERITY_COLORS: Record<string, { border: string; bg: string, text: string }> = {
  CRITICAL: { border: '#EF4444', bg: '#FEF2F2', text: '#B91C1C' },
  HIGH:     { border: '#F97316', bg: '#FFF7ED', text: '#C2410C' },
  MEDIUM:   { border: '#F59E0B', bg: '#FFFBEB', text: '#B45309' },
  LOW:      { border: '#3B82F6', bg: '#EFF6FF', text: '#1D4ED8' },
};

export default function AlertBanner({ attack, onDismiss, onViewDetails }: AlertBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-120));

  useEffect(() => {
    if (attack) {
      Animated.spring(slideAnim, {
        toValue: 20, // Float slightly down from top
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [attack]);

  if (!attack) return null;

  const colors = SEVERITY_COLORS[attack.severity] || SEVERITY_COLORS.LOW;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.headerRow}>
            <Text style={[styles.severityBadge, { backgroundColor: colors.border }]}>
              {attack.severity} DETECTED
            </Text>
            <Text style={styles.confidence}>
              Model Confidence: {attack.confidence}%
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.detailTitle}>IP ADDRESS</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{attack.sourceIP}</Text>
            
            <Text style={styles.separator}>|</Text>
            
            <Text style={styles.detailTitle}>ATTACK VECTOR</Text>
            <Text style={[styles.detailValue]}>{attack.attackType}</Text>
            
            <Text style={styles.separator}>|</Text>
            
            <Text style={styles.detailTitle}>ORIGIN</Text>
            <Text style={styles.detailValue}>
              {getFlag(attack.countryCode)} {attack.country}
            </Text>

            <Text style={styles.separator}>|</Text>
            <Text style={styles.detailTitle}>PORT</Text>
            <Text style={styles.detailValue}>{attack.destinationPort}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.viewBtn]} onPress={() => onViewDetails?.(attack)}>
            <Text style={styles.viewBtnText}>Inspect Details</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.dismissBtn]} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    zIndex: 9999,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  severityBadge: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidence: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  separator: {
    color: '#D1D5DB',
    fontSize: 14,
    marginHorizontal: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  viewBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dismissBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },
  viewBtnText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtnText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
});
