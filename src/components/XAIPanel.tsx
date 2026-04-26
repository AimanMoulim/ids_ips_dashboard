import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Attack } from '../mock/mockData';

interface XAIPanelProps {
  attack: Attack | null;
}

function FeatureBar({ name, value }: { name: string; value: number }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureName}>{name}</Text>
      <View style={styles.featureBarBg}>
        <View
          style={[
            styles.featureBarFill,
            {
              width: `${value}%`,
              backgroundColor:
                value > 75 ? '#EF4444' :
                value > 50 ? '#F97316' :
                value > 30 ? '#F59E0B' : '#3B82F6',
            },
          ]}
        />
      </View>
      <Text style={styles.featureValue}>{value.toFixed(1)}%</Text>
    </View>
  );
}

export default function XAIPanel({ attack }: XAIPanelProps) {
  if (!attack) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inference Analysis</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🔍</Text>
          </View>
          <Text style={styles.emptyText}>Select an event to view analysis</Text>
          <Text style={styles.emptySubtext}>Shapley feature breakdowns will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inference Breakdown</Text>
        <Text style={styles.inferenceId}>Event: {attack.id}</Text>
      </View>

      <Text style={styles.question}>Model Decision Pathway</Text>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Analyzed Target</Text>
          <Text style={styles.infoValue}>{attack.sourceIP}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Inference Base</Text>
          <View style={styles.decisionBadge}>
            <Text style={styles.decisionText}>
              {attack.status} — Conf: {attack.confidence}%
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>SHAPLEY FEATURE IMPORTANCE</Text>
      <View style={styles.featuresContainer}>
        {attack.features && attack.features.length > 0 ? (
          attack.features.slice(0, 6).map((f, i) => (
            <FeatureBar key={i} name={f.name} value={f.value} />
          ))
        ) : (
          <Text style={styles.noFeatures}>No features retrieved for this event.</Text>
        )}
      </View>

      <View style={styles.modelInfo}>
        <View style={styles.modelRow}>
          <Text style={styles.modelIcon}>•</Text>
          <Text style={styles.modelText}>Random Forest Ensemble Model</Text>
        </View>
        <View style={styles.modelRow}>
          <Text style={styles.modelIcon}>•</Text>
          <Text style={styles.modelText}>Eval Duration: {attack.duration}</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  inferenceId: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  question: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  infoValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  decisionBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  decisionText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  featureName: {
    fontSize: 12,
    color: '#4B5563',
    width: 130,
    fontWeight: '500',
  },
  featureValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
    width: 45,
    textAlign: 'right',
  },
  noFeatures: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  modelInfo: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelIcon: {
    fontSize: 14,
  },
  modelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
