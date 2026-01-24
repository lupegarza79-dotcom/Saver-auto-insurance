import React, { useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Linking,
  TextInput,
  KeyboardAvoidingView,
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
  Phone,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  accent: '#0EA5E9',
};

const WHATSAPP_NUMBER = '+19567738844';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');

  const ctaScale = useRef(new Animated.Value(1)).current;
  const phoneScale = useRef(new Animated.Value(1)).current;

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

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) return;
    animatePress(phoneScale);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const message = language === 'es'
      ? `Hola, mi número es ${phoneNumber}. Quiero que me contacten para comparar mi seguro de auto.`
      : `Hi, my number is ${phoneNumber}. I want to be contacted to compare my auto insurance.`;
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
    heroTitle: language === 'es' ? 'Ahorra en tu\nSeguro de Auto' : 'Save Money on\nAuto Insurance',
    heroSubtitle: language === 'es' 
      ? 'Sube tu póliza. Recibe cotizaciones reales.\nSin llamadas de spam.'
      : 'Upload your policy. Get real quotes.\nNo spam calls.',
    uploadCta: language === 'es' ? 'Sube tu póliza' : 'Upload your policy',
    orText: language === 'es' ? 'o déjanos tu número' : 'or leave your number',
    phonePlaceholder: language === 'es' ? 'Tu número de celular' : 'Your phone number',
    phoneCta: language === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp',
    howItWorks: language === 'es' ? 'Cómo funciona' : 'How it works',
    step1: language === 'es' ? 'Sube tu póliza actual' : 'Upload your current policy',
    step2: language === 'es' ? 'Agentes revisan y cotizan' : 'Agents review and quote',
    step3: language === 'es' ? 'Te contactamos por WhatsApp' : 'We contact you via WhatsApp',
    agentTitle: language === 'es' ? '¿Eres agente de seguros?' : 'Are you an insurance agent?',
    agentSubtitle: language === 'es' ? 'Recibe leads calificados' : 'Get qualified leads',
    free: language === 'es' ? 'GRATIS' : 'FREE',
    secure: language === 'es' ? 'Seguro y confidencial' : 'Secure and confidential',
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <View style={styles.freeBadge}>
              <Sparkles size={12} color={COLORS.primary} />
              <Text style={styles.freeBadgeText}>{t.free}</Text>
            </View>
            <Text style={styles.heroTitle}>{t.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
          </View>

          <Animated.View style={[styles.ctaContainer, { transform: [{ scale: ctaScale }] }]}>
            <TouchableOpacity
              style={styles.primaryCTA}
              onPress={handleUpload}
              activeOpacity={0.9}
            >
              <Upload size={20} color="#FFFFFF" />
              <Text style={styles.primaryCTAText}>{t.uploadCta}</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.orText}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.phoneSection}>
            <View style={styles.phoneInputWrapper}>
              <Phone size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.phoneInput}
                placeholder={t.phonePlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <Animated.View style={{ transform: [{ scale: phoneScale }] }}>
              <TouchableOpacity
                style={[styles.phoneCTA, !phoneNumber.trim() && styles.phoneCTADisabled]}
                onPress={handlePhoneSubmit}
                activeOpacity={0.8}
                disabled={!phoneNumber.trim()}
              >
                <MessageCircle size={18} color={phoneNumber.trim() ? COLORS.primary : COLORS.textMuted} />
                <Text style={[styles.phoneCTAText, !phoneNumber.trim() && styles.phoneCTATextDisabled]}>
                  {t.phoneCta}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>{t.howItWorks}</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepIconWrapper}>
                  <FileSearch size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.stepText}>{t.step1}</Text>
              </View>

              <View style={styles.stepConnector} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepIconWrapper}>
                  <CheckCircle2 size={22} color={COLORS.success} />
                </View>
                <Text style={styles.stepText}>{t.step2}</Text>
              </View>

              <View style={styles.stepConnector} />

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepIconWrapper}>
                  <MessageCircle size={22} color={COLORS.accent} />
                </View>
                <Text style={styles.stepText}>{t.step3}</Text>
              </View>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Shield size={14} color={COLORS.success} />
            <Text style={styles.securityText}>{t.secure}</Text>
          </View>

          <TouchableOpacity
            style={styles.agentCard}
            onPress={handleAgentsPress}
            activeOpacity={0.7}
          >
            <View style={styles.agentCardLeft}>
              <View style={styles.agentIconWrapper}>
                <Users size={22} color={COLORS.primary} />
              </View>
              <View style={styles.agentTextContent}>
                <Text style={styles.agentCardTitle}>{t.agentTitle}</Text>
                <Text style={styles.agentCardSubtitle}>{t.agentSubtitle}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 280,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
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
    letterSpacing: -0.3,
  },
  heroSection: {
    marginBottom: 28,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800" as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
  },
  ctaContainer: {
    marginBottom: 24,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  phoneSection: {
    marginBottom: 40,
    gap: 12,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  phoneCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGlow,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  phoneCTADisabled: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.border,
  },
  phoneCTAText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  phoneCTATextDisabled: {
    color: COLORS.textMuted,
  },
  howItWorksSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  stepIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 11,
    marginVertical: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  agentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  agentIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentTextContent: {
    flex: 1,
  },
  agentCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  agentCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
