import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, 
  FileText, 
  CreditCard, 
  Share2, 
  Plus,
  ChevronRight,
  Check,
  Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Document, Policy } from '@/types';

type TabType = 'idCards' | 'policies' | 'documents';

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

export default function VaultScreen() {
  const router = useRouter();
  const { language, t, policies, documents } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('idCards');
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 84 : 64;
  const fabBottom = Math.max(16, tabBarHeight + 12);
  
  const isWideScreen = windowWidth > 768;

  const text = {
    title: t.vault.title,
    subtitle: t.vault.subtitle,
    idCards: t.vault.tabs.idCards,
    policies: t.vault.tabs.policies,
    documents: t.vault.tabs.documents,
    emptyTitle: t.vault.emptyTitle,
    emptySubtitle: t.vault.emptySubtitle,
    emptyCta: t.vault.emptyCta,
    shareIdCard: t.vault.shareIdCard,
    active: t.vault.active,
    expired: t.vault.expired,
    policyNumber: t.vault.policyNumber,
    vehicle: t.vault.vehicle,
    expires: t.vault.expires,
    noDocuments: t.vault.noDocuments,
    uploadFirst: t.vault.uploadFirst,
  };

  const handleShare = async (item: Policy | Document) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({
        message: `Sharing insurance document from Saver.Insurance`,
        title: 'Share ID Card',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const tabs: { key: TabType; label: string; icon: typeof Shield }[] = [
    { key: 'idCards', label: text.idCards, icon: CreditCard },
    { key: 'policies', label: text.policies, icon: Shield },
    { key: 'documents', label: text.documents, icon: FileText },
  ];

  const idCards = documents.filter(d => d.type === 'ID_CARD');
  const otherDocs = documents.filter(d => !['ID_CARD', 'DEC_PAGE'].includes(d.type));

  const renderIDCards = () => (
    <View style={[styles.cardsContainer, isWideScreen && styles.cardsContainerWide]}>
      {policies.length === 0 && idCards.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <CreditCard size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{text.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{text.emptySubtitle}</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/upload-document')}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>{text.emptyCta}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        policies.map(policy => {
          const isActive = new Date(policy.expirationDate) > new Date();
          return (
            <View key={policy.id} style={[styles.idCard, isWideScreen && styles.idCardWide]}>
              <View style={styles.idCardHeader}>
                <View style={styles.idCardLogo}>
                  <Shield size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.idCardCarrier}>{policy.carrier}</Text>
                <View style={[
                  styles.statusChip,
                  { backgroundColor: isActive ? COLORS.successLight : COLORS.dangerLight }
                ]}>
                  {isActive ? (
                    <Check size={12} color={COLORS.success} />
                  ) : (
                    <Clock size={12} color={COLORS.danger} />
                  )}
                  <Text style={[
                    styles.statusText,
                    { color: isActive ? COLORS.success : COLORS.danger }
                  ]}>
                    {isActive ? text.active : text.expired}
                  </Text>
                </View>
              </View>
              <View style={styles.idCardBody}>
                <View style={styles.idCardRow}>
                  <Text style={styles.idCardLabel}>{text.policyNumber}</Text>
                  <Text style={styles.idCardValue}>{policy.policyNumber}</Text>
                </View>
                {policy.vehicles[0] && (
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>{text.vehicle}</Text>
                    <Text style={styles.idCardValue}>
                      {policy.vehicles[0].year} {policy.vehicles[0].make}
                    </Text>
                  </View>
                )}
                <View style={styles.idCardRow}>
                  <Text style={styles.idCardLabel}>{text.expires}</Text>
                  <Text style={styles.idCardValue}>
                    {new Date(policy.expirationDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => handleShare(policy)}
              >
                <Share2 size={18} color={COLORS.primary} />
                <Text style={styles.shareButtonText}>{text.shareIdCard}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );

  const renderPolicies = () => (
    <View style={[styles.listContainer, isWideScreen && styles.listContainerWide]}>
      {policies.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Shield size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{text.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{text.emptySubtitle}</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/upload-document')}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>{text.emptyCta}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        policies.map(policy => (
          <TouchableOpacity 
            key={policy.id} 
            style={[styles.listItem, isWideScreen && styles.listItemWide]}
            onPress={() => router.push({ pathname: '/policy-detail', params: { id: policy.id } })}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIcon}>
                <Shield size={20} color={COLORS.primary} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{policy.carrier}</Text>
                <Text style={styles.listItemSubtitle}>
                  {policy.vehicles[0]?.year} {policy.vehicles[0]?.make} {policy.vehicles[0]?.model}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderDocuments = () => (
    <View style={[styles.listContainer, isWideScreen && styles.listContainerWide]}>
      {otherDocs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <FileText size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{text.noDocuments}</Text>
          <Text style={styles.emptySubtitle}>{text.uploadFirst}</Text>
        </View>
      ) : (
        otherDocs.map(doc => (
          <TouchableOpacity key={doc.id} style={[styles.listItem, isWideScreen && styles.listItemWide]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.listItemIcon, { backgroundColor: COLORS.primaryLight }]}>
                <FileText size={20} color={COLORS.primary} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{doc.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

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
          <Text style={styles.subtitle}>{text.subtitle}</Text>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon size={16} color={isActive ? '#FFFFFF' : COLORS.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: fabBottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'idCards' && renderIDCards()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'documents' && renderDocuments()}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/upload-document')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  cardsContainerWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  idCardWide: {
    width: 'calc(50% - 8px)' as any,
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    backgroundColor: COLORS.text,
  },
  idCardLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardCarrier: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  idCardBody: {
    padding: 18,
    gap: 12,
  },
  idCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idCardLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  idCardValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  listContainer: {
    gap: 10,
  },
  listContainerWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  listItemWide: {
    width: 'calc(50% - 5px)' as any,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});
