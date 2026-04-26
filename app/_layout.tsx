// ━━━ Root Layout — Sidebar navigation + alert system (Light Theme) ━━━
import React, { createContext, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useAlerts, AlertState } from '../src/hooks/useAlerts';
import AlertBanner from '../src/components/AlertBanner';

// Global alert context
const AlertContext = createContext<AlertState | null>(null);
export function useAlertContext(): AlertState {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider');
  return ctx;
}

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: '' },
  { path: '/history', label: 'Incidents log', icon: '' },
  { path: '/blocked', label: 'Access Control', icon: '' },
];

export default function RootLayout() {
  const alertState = useAlerts();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AlertContext.Provider value={alertState}>
      <View style={styles.root}>
        {/* Demo Mode Fallback Banner */}
        {alertState.isDemoMode && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>⚠️ Demo mode — backend offline</Text>
          </View>
        )}

        {/* Alert Banner */}
        <AlertBanner
          attack={alertState.latestAlert}
          onDismiss={alertState.dismissAlert}
          onViewDetails={(attack) => {
            alertState.setSelectedAttack(attack);
            alertState.dismissAlert();
          }}
        />

        <View style={styles.mainContainer}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <View style={styles.logoDot} />
              </View>
              <Text style={styles.logoTitle}>SOC Console</Text>
              <Text style={styles.logoSubtitle}>Enterprise Security</Text>
            </View>

            <View style={styles.divider} />

            {/* Nav Items */}
            <ScrollView style={styles.navList}>
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.path || 
                  (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <Pressable
                    key={item.path}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => router.push(item.path as any)}
                  >
                    {isActive && <View style={styles.navActiveBar} />}
                    <Text style={styles.navIcon}>{item.icon}</Text>
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.divider} />

            {/* Notification Bell */}
            <Pressable style={styles.bellButton} onPress={alertState.clearUnread}>
              <Text style={styles.bellIcon}>◎</Text>
              <Text style={styles.bellText}>Alerts</Text>
              {alertState.unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {alertState.unreadCount > 99 ? '99+' : alertState.unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>

            {/* System Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>System Online</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Slot />
          </View>
        </View>
      </View>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  demoBanner: {
    backgroundColor: '#FEF08A',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE047',
  },
  demoBannerText: {
    color: '#854D0E',
    fontSize: 12,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // ── Sidebar ──
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 100,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
  },
  logoIcon: {
    fontSize: 24,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  logoSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  navList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#FEF2F2',
  },
  navActiveBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    backgroundColor: '#EF4444',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#EF4444',
    fontWeight: '700',
  },
  bellButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  bellIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  bellText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },
  bellBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  bellBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  // ── Content ──
  content: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});
