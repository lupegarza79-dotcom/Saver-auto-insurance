import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Phone, 
  Globe,
  ChevronRight,
  LogOut,
  Shield,
  UserPlus,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, language, t, setLanguage, logout, policies, userRole, agentProfile } = useApp();

  const text = {
    title: t.profile.title,
    defaultName: t.profile.defaultName,
    sectionAccount: t.profile.sectionAccount,
    name: t.profile.name,
    phone: t.profile.phone,
    language: t.profile.language,
    sectionAgent: t.profile.sectionAgent,
    agentQuestion: t.profile.agentQuestion,
    agentLearnMore: t.profile.agentLearnMore,
    policiesLabel: t.profile.policiesUploaded,
    savingsLabel: t.profile.estimatedSavings,
    onTimeLabel: t.profile.onTimePayments,
    logout: t.profile.logout,
    privacy: t.profile.privacyPolicy,
    terms: t.profile.termsOfUse,
    myLeads: t.home.myLeads,
    viewDashboard: t.home.viewDashboard,
    pending: language === 'es' ? 'En revisión' : 'Under review',
    thirtyDaysFree: t.agents.thirtyDaysFree,
    english: 'English',
    spanish: 'Español',
    legalSection: language === 'es' ? 'Legal' : 'Legal',
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'es' ? 'Cerrar sesión' : 'Sign out',
      language === 'es' ? '¿Seguro que quieres salir?' : 'Are you sure you want to sign out?',
      [
        { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'es' ? 'Salir' : 'Sign out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        },
      ]
    );
  };

  const handleLanguageToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const isAgent = userRole === 'agent' || !!agentProfile;
  const isVerifiedAgent = agentProfile?.status === 'verified';
  const isPendingAgent = agentProfile?.status === 'pending';

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
          <Text style={styles.title}>{text.title}</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Shield size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.avatarName}>{user?.name || text.defaultName}</Text>
          <Text style={styles.avatarPhone}>{user?.phone || '—'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{policies.length}</Text>
              <Text style={styles.statLabel}>{text.policiesLabel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>{text.savingsLabel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>{text.onTimeLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.sectionAccount}</Text>
          <View style={styles.sectionContent}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <User size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemLabel}>{text.name}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{user?.name || text.defaultName}</Text>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </View>
            <View style={styles.menuDivider} />
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <Phone size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemLabel}>{text.phone}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{user?.phone || '—'}</Text>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </View>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLanguageToggle}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <Globe size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemLabel}>{text.language}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <View style={styles.languageToggle}>
                  <View style={[
                    styles.languageOption,
                    language === 'en' && styles.languageOptionActive
                  ]}>
                    <Text style={[
                      styles.languageOptionText,
                      language === 'en' && styles.languageOptionTextActive
                    ]}>EN</Text>
                  </View>
                  <View style={[
                    styles.languageOption,
                    language === 'es' && styles.languageOptionActive
                  ]}>
                    <Text style={[
                      styles.languageOptionText,
                      language === 'es' && styles.languageOptionTextActive
                    ]}>ES</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.sectionAgent}</Text>
          <View style={styles.sectionContent}>
            {isAgent ? (
              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemHighlight]} 
                onPress={() => router.push('/agent-dashboard')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, styles.menuItemIconHighlight]}>
                    <UserPlus size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.menuItemLabelRow}>
                    <Text style={styles.menuItemLabel}>{text.myLeads}</Text>
                    {isVerifiedAgent && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle size={14} color={COLORS.success} />
                      </View>
                    )}
                    {isPendingAgent && (
                      <View style={styles.pendingBadge}>
                        <Clock size={14} color={COLORS.warning} />
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemValueHighlight}>
                    {isPendingAgent ? text.pending : text.viewDashboard}
                  </Text>
                  <ChevronRight size={18} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemHighlight]} 
                onPress={() => router.push('/agent-onboarding')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, styles.menuItemIconHighlight]}>
                    <UserPlus size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemLabel}>{text.agentLearnMore}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>{text.thirtyDaysFree}</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.legalSection}</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <Shield size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.menuItemLabel}>{text.privacy}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <FileText size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.menuItemLabel}>{text.terms}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>{text.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Saver v1.0.0</Text>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  avatarPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  menuItemHighlight: {
    backgroundColor: COLORS.primaryLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIconHighlight: {
    backgroundColor: COLORS.surface,
  },
  menuItemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuItemValueHighlight: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
  },
  languageOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary,
  },
  languageOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
  },
  freeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 24,
  },
});
