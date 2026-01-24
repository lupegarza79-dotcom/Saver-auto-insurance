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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  Upload,
  FileText,
  MessageSquare,
  CheckCircle,
  Users,
  Lock,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
};

const WHATSAPP_NUMBER = '+19567738844';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  const ctaScale = useRef(new Animated.Value(1)).current;
  const agentScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUpload = () => {
    animatePress(ctaScale);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    router.push("/upload-document" as any);
  };

  const handleWhatsAppPress = () => {
    const message = language === 'es'
      ? 'Hola, quiero subir mi póliza de auto para ver si puedo ahorrar.'
      : 'Hi, I want to upload my auto policy to see if I can save.';
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleAgentsPress = () => {
    animatePress(agentScale);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    router.push("/agents" as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.safeTop, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Shield size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>Saver</Text>
          </View>
          <LanguageSwitcher variant="pill" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {language === 'es' ? 'Ahorra Dinero en\nSeguro de Auto' : 'Save Money on\nAuto Insurance'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {language === 'es'
              ? 'Sube tu póliza. Recibe cotizaciones reales. Sin llamadas de spam.'
              : 'Upload your policy. Get real quotes. No spam calls.'}
          </Text>
        </View>

        <Animated.View style={[styles.ctaContainer, { transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Upload size={22} color="#FFFFFF" />
              <Text style={styles.primaryCTAText}>
                {language === 'es' ? 'Sube tu póliza' : 'Upload your policy'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>
            {language === 'es' ? 'Cómo funciona' : 'How it works'}
          </Text>

          <View style={styles.stepItem}>
            <View style={styles.stepIconWrapper}>
              <FileText size={20} color={COLORS.primary} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                {language === 'es' ? 'Sube foto de tu póliza actual' : 'Upload a photo of your current policy'}
              </Text>
            </View>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={styles.stepIconWrapper}>
              <CheckCircle size={20} color={COLORS.success} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                {language === 'es' ? 'Agentes licenciados revisan tu póliza' : 'Licensed agents review your policy'}
              </Text>
            </View>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={styles.stepIconWrapper}>
              <MessageSquare size={20} color={COLORS.accent} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                {language === 'es' ? 'Recibe cotizaciones reales por WhatsApp' : 'Get real quotes via WhatsApp'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.securityBadge}>
          <Lock size={14} color={COLORS.success} />
          <Text style={styles.securityText}>
            {language === 'es'
              ? 'Tu póliza se envía de forma segura a agentes licenciados'
              : 'Your policy is sent securely to licensed agents'}
          </Text>
        </View>

        <TouchableOpacity style={styles.whatsappLink} onPress={handleWhatsAppPress}>
          <Text style={styles.whatsappText}>
            {language === 'es' ? '¿Prefieres WhatsApp? ' : 'Prefer WhatsApp? '}
          </Text>
          <Text style={styles.whatsappLinkText}>
            {language === 'es' ? 'Manda tu póliza aquí' : 'Send your policy here'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Animated.View style={{ transform: [{ scale: agentScale }] }}>
          <TouchableOpacity
            style={styles.agentCard}
            onPress={handleAgentsPress}
            activeOpacity={0.8}
          >
            <View style={styles.agentCardContent}>
              <View style={styles.agentIconWrapper}>
                <Users size={24} color={COLORS.primary} />
              </View>
              <View style={styles.agentTextContent}>
                <Text style={styles.agentCardTitle}>
                  {language === 'es' ? '¿Eres agente de seguros?' : 'Are you an insurance agent?'}
                </Text>
                <Text style={styles.agentCardSubtitle}>
                  {language === 'es' ? 'Únete a Saver y recibe leads calificados' : 'Join Saver and get qualified leads'}
                </Text>
              </View>
            </View>
            <View style={styles.agentCardArrow}>
              <Text style={styles.agentCardArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeTop: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  ctaContainer: {
    marginBottom: 32,
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
    gap: 12,
  },
  primaryCTAText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  howItWorksCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.primaryLight,
    width: 20,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  stepDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
    marginLeft: 60,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  whatsappLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  whatsappText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  whatsappLinkText: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 32,
  },
  agentCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  agentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  agentIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
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
    marginBottom: 4,
  },
  agentCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  agentCardArrow: {
    marginLeft: 12,
  },
  agentCardArrowText: {
    fontSize: 20,
    color: COLORS.primaryLight,
    fontWeight: '600' as const,
  },
});
