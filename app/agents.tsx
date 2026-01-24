import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Users,
  Target,
  PhoneOff,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Shield,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";

const COLORS = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryGlow: 'rgba(37, 99, 235, 0.12)',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.12)',
  accent: '#0EA5E9',
  accentGlow: 'rgba(14, 165, 233, 0.12)',
  warning: '#F59E0B',
  warningGlow: 'rgba(245, 158, 11, 0.12)',
};

const WHATSAPP_NUMBER = '+19567738844';

export default function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  const ctaScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleJoinPress = () => {
    animatePress(ctaScale);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const message = language === 'es'
      ? 'Hola, soy agente de seguros de auto y quiero unirme a Saver.'
      : 'Hi, I am an auto insurance agent and I want to join Saver.';
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const valuePropItems = [
    {
      icon: Target,
      titleEn: 'Qualified Leads',
      titleEs: 'Leads Calificados',
      descEn: 'Real drivers actively looking to save',
      descEs: 'Conductores reales buscando ahorrar',
      color: COLORS.success,
      bgColor: COLORS.successGlow,
    },
    {
      icon: PhoneOff,
      titleEn: 'No Cold Calls',
      titleEs: 'Sin Llamadas en Frío',
      descEn: 'Leads come to you directly',
      descEs: 'Los leads vienen a ti directamente',
      color: COLORS.warning,
      bgColor: COLORS.warningGlow,
    },
    {
      icon: MessageSquare,
      titleEn: 'WhatsApp Ready',
      titleEs: 'Listo para WhatsApp',
      descEn: 'Connect on their preferred channel',
      descEs: 'Conecta en su canal preferido',
      color: COLORS.accent,
      bgColor: COLORS.accentGlow,
    },
  ];

  const t = {
    heroTitle: language === 'es' ? 'Agentes de\nSeguro de Auto' : 'Auto Insurance\nAgents',
    heroSubtitle: language === 'es'
      ? 'Únete a Saver y recibe leads de conductores que buscan ahorrar.'
      : 'Join Saver and receive leads from drivers looking to save.',
    whySaver: language === 'es' ? '¿Por qué Saver?' : 'Why Saver?',
    benefit1: language === 'es' ? 'Sin costo de plataforma' : 'No platform fees',
    benefit2: language === 'es' ? 'Leads pre-calificados con póliza' : 'Pre-qualified leads with policy',
    benefit3: language === 'es' ? 'Comunicación directa por WhatsApp' : 'Direct WhatsApp communication',
    benefit4: language === 'es' ? 'Solo agentes licenciados en Texas' : 'Licensed Texas agents only',
    joinCta: language === 'es' ? 'Únete como Agente' : 'Join as an Agent',
    footer: language === 'es'
      ? 'Por ahora solo aceptamos agentes P&C con licencia activa en Texas.'
      : 'Currently accepting Texas P&C licensed agents only.',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Users size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
        </View>

        <View style={styles.valuePropsSection}>
          {valuePropItems.map((item, index) => (
            <View key={index} style={styles.valuePropCard}>
              <View style={[styles.valuePropIcon, { backgroundColor: item.bgColor }]}>
                <item.icon size={22} color={item.color} />
              </View>
              <View style={styles.valuePropContent}>
                <Text style={styles.valuePropTitle}>
                  {language === 'es' ? item.titleEs : item.titleEn}
                </Text>
                <Text style={styles.valuePropDesc}>
                  {language === 'es' ? item.descEs : item.descEn}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>{t.whySaver}</Text>
          
          <View style={styles.benefitRow}>
            <CheckCircle2 size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>{t.benefit1}</Text>
          </View>
          
          <View style={styles.benefitRow}>
            <CheckCircle2 size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>{t.benefit2}</Text>
          </View>
          
          <View style={styles.benefitRow}>
            <CheckCircle2 size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>{t.benefit3}</Text>
          </View>
          
          <View style={[styles.benefitRow, { marginBottom: 0 }]}>
            <CheckCircle2 size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>{t.benefit4}</Text>
          </View>
        </View>

        <Animated.View style={[styles.ctaContainer, { transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleJoinPress}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryCTAText}>{t.joinCta}</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footerNote}>
          <Shield size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>{t.footer}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: COLORS.text,
    letterSpacing: -0.8,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  valuePropsSection: {
    gap: 12,
    marginBottom: 24,
  },
  valuePropCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valuePropIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePropContent: {
    flex: 1,
  },
  valuePropTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  valuePropDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  benefitsCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  benefitText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ctaContainer: {
    marginBottom: 20,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    flex: 1,
  },
});
