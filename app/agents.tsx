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
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  Target,
  PhoneOff,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";

const COLORS = {
  background: '#0F172A',
  backgroundLight: '#1E293B',
  surface: '#FFFFFF',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  text: '#FFFFFF',
  textDark: '#1E293B',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  success: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
};

const WHATSAPP_NUMBER = '+19567738844';

export default function AgentsScreen() {
  
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  const ctaScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleJoinPress = () => {
    animatePress(ctaScale);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
      descEn: 'Real drivers actively looking to save on auto insurance',
      descEs: 'Conductores reales buscando ahorrar en seguro de auto',
      color: COLORS.success,
    },
    {
      icon: PhoneOff,
      titleEn: 'No Cold Calls',
      titleEs: 'Sin Llamadas en Frío',
      descEn: 'Leads come to you — no dialing, no rejection',
      descEs: 'Los leads vienen a ti — sin marcar, sin rechazo',
      color: COLORS.warning,
    },
    {
      icon: MessageSquare,
      titleEn: 'WhatsApp Ready',
      titleEs: 'Listo para WhatsApp',
      descEn: 'Connect with leads on their preferred channel',
      descEs: 'Conecta con leads en su canal preferido',
      color: COLORS.accent,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 20, paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Users size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>
            {language === 'es' ? 'Agentes de\nSeguro de Auto' : 'Auto Insurance\nAgents'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {language === 'es'
              ? 'Únete a Saver y recibe leads de conductores que buscan ahorrar en su seguro de auto.'
              : 'Join Saver and receive leads from drivers looking to save on their auto insurance.'}
          </Text>
        </View>

        <View style={styles.valuePropsSection}>
          {valuePropItems.map((item, index) => (
            <View key={index} style={styles.valuePropCard}>
              <View style={[styles.valuePropIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon size={24} color={item.color} />
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
          <Text style={styles.benefitsTitle}>
            {language === 'es' ? '¿Por qué Saver?' : 'Why Saver?'}
          </Text>
          
          <View style={styles.benefitRow}>
            <CheckCircle size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>
              {language === 'es' ? 'Sin costo de plataforma' : 'No platform fees'}
            </Text>
          </View>
          
          <View style={styles.benefitRow}>
            <CheckCircle size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>
              {language === 'es' ? 'Leads pre-calificados con póliza' : 'Pre-qualified leads with policy'}
            </Text>
          </View>
          
          <View style={styles.benefitRow}>
            <CheckCircle size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>
              {language === 'es' ? 'Comunicación directa por WhatsApp' : 'Direct WhatsApp communication'}
            </Text>
          </View>
          
          <View style={styles.benefitRow}>
            <CheckCircle size={18} color={COLORS.success} />
            <Text style={styles.benefitText}>
              {language === 'es' ? 'Solo agentes licenciados en Texas' : 'Licensed Texas agents only'}
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.ctaContainer, { transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleJoinPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryCTAText}>
                {language === 'es' ? 'Únete como Agente' : 'Join as an Agent'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footerNote}>
          <Shield size={16} color={COLORS.textMuted} />
          <Text style={styles.footerText}>
            {language === 'es'
              ? 'Por ahora solo aceptamos agentes P&C con licencia activa en Texas.'
              : 'Currently accepting Texas P&C licensed agents only.'}
          </Text>
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
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 40,
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
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valuePropIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePropContent: {
    flex: 1,
  },
  valuePropTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  valuePropDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  benefitsCard: {
    backgroundColor: COLORS.backgroundLight,
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
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ctaContainer: {
    marginBottom: 20,
  },
  primaryCTA: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryCTAText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    flex: 1,
  },
});
