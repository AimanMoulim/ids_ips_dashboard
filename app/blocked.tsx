// ━━━ Blocked IPs Screen — IP management (Light Theme) ━━━
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAlertContext } from './_layout';
import BlockedIPTable from '../src/components/BlockedIPTable';

export default function BlockedIPScreen() {
  const { blockedIPs, unblockIP } = useAlertContext();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Access Control</Text>
          <Text style={styles.pageSubtitle}>
            Review and manage restricted network sources and traffic rules
          </Text>
        </View>
        
        {/* Quick Summary Pills */}
        <View style={styles.summaryPills}>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>PROTECTED ENDPOINTS</Text>
            <Text style={styles.pillValue}>14</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>ACTIVE RESTRICTIONS</Text>
            <Text style={[styles.pillValue, { color: '#EF4444' }]}>{blockedIPs.length}</Text>
          </View>
        </View>
      </View>

      {/* Main Filterable Table Component */}
      <BlockedIPTable blockedIPs={blockedIPs} onUnblock={unblockIP} />
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
    flexGrow: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    maxWidth: 500,
  },
  summaryPills: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
});
