import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { TimelinePoint } from '../mock/mockData';

interface AttackTimelineProps {
  data: TimelinePoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    }}>
      <div style={{ color: '#6B7280', marginBottom: 8, fontSize: 12, fontWeight: '600' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 4, fontSize: 13, fontWeight: '700' }}>
          {p.name}: <span style={{ color: '#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AttackTimeline({ data }: AttackTimelineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Traffic Analysis</Text>
        <Text style={styles.subtitle}>Volume over trailing 24 hours</Text>
      </View>
      <View style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#D1D5DB"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              stroke="#D1D5DB"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="DDoS"
              stroke="#EF4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#EF4444', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="PortScan"
              stroke="#F97316"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#F97316', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="BruteForce"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chartWrapper: {
    flex: 1,
  },
});
