import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  subtitle: string;
  trend?: number; // positive = up, negative = down
  danger?: boolean; // true = red accent, false = green
  icon?: string;
}

export default function KPICard({
  title, value, suffix = '', prefix = '', decimals = 0,
  subtitle, trend, danger = false, icon,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const startVal = 0;
    const finalValue = value || 0; // Guard against NaN/Undefined during fetch latency

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(startVal + (finalValue - startVal) * eased);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value]);

  const displayString = isNaN(displayValue) ? '0' : (decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString());
  const accentColor = danger ? '#EF4444' : '#10B981';
  const bgColor = danger ? '#FEF2F2' : '#ECFDF5';
  
  const trendColor = trend !== undefined ? (trend >= 0 ? '#EF4444' : '#10B981') : '#6B7280';
  const trendArrow = trend !== undefined ? (trend >= 0 ? '↗' : '↘') : '';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {prefix}{displayString}{suffix}
        </Text>
      </View>
      <View style={styles.subtitleRow}>
        {trend !== undefined && (
          <Text style={[styles.trend, { color: trendColor }]}>
            {trendArrow} {trend >= 0 ? '+' : ''}{trend}%
          </Text>
        )}
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minWidth: 200,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
  },
  icon: {
    fontSize: 16,
  },
  valueRow: {
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trend: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
