import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import ReminderCard from '@/components/ReminderCard';

const COLORS = {
  background: '#0A1628',
  backgroundLight: '#1A2D4A',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#E6F0FF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

export default function PaymentReminderScreen() {
  const { language, t, reminders, policies, snoozeReminder, markReminderPaid } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'web' ? 60 : 80;
  
  const isWideScreen = windowWidth > 768;

  const text = t.guardian;

  const allReminders = reminders.filter(r => r.status !== 'completed');

  const nextPayment = allReminders.find(r => r.type === 'payment');
  const daysUntilPayment = nextPayment 
    ? Math.ceil((new Date(nextPayment.dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleSnooze = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    snoozeReminder(id, 1);
  };

  const handleMarkPaid = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    markReminderPaid(id);
  };

  const handlePause = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    snoozeReminder(id, 30);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{text.title}</Text>
            <View style={styles.freeBadge}>
              <Sparkles size={12} color={COLORS.success} />
              <Text style={styles.freeBadgeText}>{text.freeBadge}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{text.subtitle}</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {nextPayment && daysUntilPayment !== null && (
          <View style={[
            styles.upcomingCard,
            daysUntilPayment <= 3 ? styles.upcomingCardDanger : styles.upcomingCardWarning
          ]}>
            <View style={styles.upcomingHeader}>
              <View style={[
                styles.upcomingIcon,
                { backgroundColor: daysUntilPayment <= 3 ? COLORS.dangerLight : COLORS.warningLight }
              ]}>
                {daysUntilPayment <= 3 ? (
                  <AlertTriangle size={22} color={COLORS.danger} />
                ) : (
                  <Clock size={22} color={COLORS.warning} />
                )}
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingLabel}>{text.nextPayment}</Text>
                <Text style={styles.upcomingCarrier}>
                  {policies.find(p => p.id === nextPayment.policyId)?.carrier || nextPayment.carrierName || '—'}
                </Text>
              </View>
              <View style={styles.upcomingDays}>
                <Text style={[
                  styles.upcomingDaysValue,
                  { color: daysUntilPayment <= 3 ? COLORS.danger : COLORS.warning }
                ]}>
                  {daysUntilPayment}
                </Text>
                <Text style={styles.upcomingDaysLabel}>{text.days}</Text>
              </View>
            </View>
            <View style={styles.upcomingDivider} />
            <View style={styles.upcomingAmount}>
              <Text style={styles.upcomingAmountValue}>{nextPayment.amount ? `${nextPayment.amount}` : '—'}</Text>
              <Text style={styles.upcomingAmountLabel}>
                {text.due} {new Date(nextPayment.dueAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {allReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Bell size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>{text.empty}</Text>
            <Text style={styles.emptySubtitle}>
              {language === 'es' 
                ? 'Los recordatorios aparecerán aquí cuando agregues pólizas.' 
                : 'Reminders will appear here when you add policies.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <View style={isWideScreen ? styles.remindersGrid : undefined}>
              {allReminders.map(reminder => {
                const policy = policies.find(p => p.id === reminder.policyId);
                return (
                  <View key={reminder.id} style={isWideScreen ? styles.reminderCardWrapper : undefined}>
                    <ReminderCard
                      reminder={reminder}
                      policy={policy}
                      onSnooze={() => handleSnooze(reminder.id)}
                      onMarkPaid={() => handleMarkPaid(reminder.id)}
                      onPause={() => handlePause(reminder.id)}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <Bell size={18} color={COLORS.success} />
          </View>
          <Text style={styles.infoText}>{text.noSpam}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  listContainer: {
    gap: 12,
    marginBottom: 20,
  },
  upcomingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  upcomingCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  upcomingCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  upcomingLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  upcomingCarrier: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginTop: 2,
  },
  upcomingDays: {
    alignItems: 'center',
  },
  upcomingDaysValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  upcomingDaysLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: -4,
  },
  upcomingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  upcomingAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  upcomingAmountValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: COLORS.text,
    letterSpacing: -1,
  },
  upcomingAmountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  remindersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reminderCardWrapper: {
    width: 'calc(50% - 6px)' as any,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.successLight,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
