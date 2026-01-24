import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  Upload,
  FileSearch,
  MessageCircle,
  CheckCircle2,
  Users,
  ChevronRight,
  Zap,
  Clock,
  DollarSign,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const COLORS = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  accent: '#0EA5E9',
};

const WHATSAPP_NUMBER = '+19567738844';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  const ctaScale = useRef(new Animated.Value(1)).current;
  const whatsappScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUpload = () => {
    animatePress(ctaScale);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/upload-document" as any);
  };

  const handleWhatsApp = () => {
    animatePress(whatsappScale);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const message = language === 'es'
      ? 'Hola, quiero comparar mi seguro de auto. Adjunto mi póliza.'
      : 'Hi, I want to compare my auto insurance. Attaching my policy.';
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleAgentsPress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    router.push("/agents" as any);
  };

  const t = {
    heroTitle: language === 'es' ? 'Ahorra en Seguro de Auto' : 'Save on Auto Insurance',
    heroSubtitle: language === 'es' 
      ? 'Sube tu póliza. Recibe cotizaciones reales. Sin spam.'
      : 'Upload your policy. Get real quotes. No spam.',
    uploadCta: language === 'es' ? 'Sube tu póliza' : 'Upload your policy',
    trustFree: language === 'es' ? 'GRATIS' : 'FREE',
    trustEasy: language === 'es' ? 'FÁCIL' : 'EASY',
    trustFast: language === 'es' ? 'RÁPIDO' : 'FAST',
    howItWorks: language === 'es' ? 'Cómo funciona' : 'How it works',
    step1: language === 'es' ? 'Sube foto de tu póliza' : 'Upload a photo of your policy',
    step2: language === 'es' ? 'Agentes licenciados la revisan' : 'Licensed agents review it',
    step3: language === 'es' ? 'Recibe cotizaciones por WhatsApp' : 'Get real quotes via WhatsApp',
    whatsappCta: language === 'es' ? 'Enviar por WhatsApp' : 'Send via WhatsApp',
    agentTitle: language === 'es' ? 'Agentes de seguros' : 'Insurance Agents',
    agentSubtitle: language === 'es' ? 'Recibe leads calificados.' : 'Get qualified leads.',
    agentCta: language === 'es' ? 'Acceso agentes' : 'Agent sign in',
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Shield size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>Saver</Text>
          </View>
          <LanguageSwitcher variant="pill" />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
        </View>

        <Animated.View style={[styles.ctaContainer, { transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            <Upload size={20} color={COLORS.primary} />
            <Text style={styles.primaryCTAText}>{t.uploadCta}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <DollarSign size={14} color={COLORS.success} />
            <Text style={styles.trustText}>{t.trustFree}</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Zap size={14} color={COLORS.accent} />
            <Text style={styles.trustText}>{t.trustEasy}</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Clock size={14} color={COLORS.primary} />
            <Text style={styles.trustText}>{t.trustFast}</Text>
          </View>
        </View>

        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>{t.howItWorks}</Text>
          
          <View style={styles.stepsCard}>
            <View style={styles.stepRow}>
              <View style={styles.stepIconWrapper}>
                <FileSearch size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.stepText}>1. {t.step1}</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepIconWrapper}>
                <CheckCircle2 size={18} color={COLORS.success} />
              </View>
              <Text style={styles.stepText}>2. {t.step2}</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepIconWrapper}>
                <MessageCircle size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.stepText}>3. {t.step3}</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.whatsappContainer, { transform: [{ scale: whatsappScale }] }]}>
          <TouchableOpacity
            style={styles.whatsappCTA}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <MessageCircle size={18} color="#25D366" />
            <Text style={styles.whatsappCTAText}>{t.whatsappCta}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.agentSection}>
          <TouchableOpacity
            style={styles.agentCard}
            onPress={handleAgentsPress}
            activeOpacity={0.7}
          >
            <View style={styles.agentCardLeft}>
              <View style={styles.agentIconWrapper}>
                <Users size={20} color={COLORS.primary} />
              </View>
              <View style={styles.agentTextContent}>
                <Text style={styles.agentCardTitle}>{t.agentTitle}</Text>
                <Text style={styles.agentCardSubtitle}>{t.agentSubtitle}</Text>
              </View>
            </View>
            <View style={styles.agentCtaWrapper}>
              <Text style={styles.agentCtaText}>{t.agentCta}</Text>
              <ChevronRight size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  ctaContainer: {
    marginBottom: 12,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  howItWorksSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  whatsappContainer: {
    marginBottom: 12,
  },
  whatsappCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#25D366',
  },
  whatsappCTAText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#25D366',
  },
  agentSection: {
    marginTop: 'auto',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  agentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  agentIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentTextContent: {
    flex: 1,
  },
  agentCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  agentCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  agentCtaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  agentCtaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
});
