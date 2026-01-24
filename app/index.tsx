import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Shield,
  Upload,
  Users,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const COLORS = {
  background: '#FFFFFF',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  const ctaScale = useRef(new Animated.Value(1)).current;
  const agentScale = useRef(new Animated.Value(1)).current;

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

  const handleAgentsPress = () => {
    animatePress(agentScale);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    router.push("/agents" as any);
  };

  const t = {
    heroTitle: language === 'es' ? 'Ahorra en Seguro de Auto' : 'Save on Auto Insurance',
    heroSubtitle: language === 'es' ? 'Sube tu póliza' : 'Upload your policy',
    uploadCta: language === 'es' ? 'Sube tu póliza' : 'Upload your policy',
    trustFree: language === 'es' ? 'GRATIS' : 'FREE',
    trustEasy: language === 'es' ? 'FÁCIL' : 'EASY',
    trustFast: language === 'es' ? 'RÁPIDO' : 'FAST',
    agentCta: language === 'es' ? 'Soy Agente' : "I'm an Agent",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
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

      <View style={styles.trustBadges}>
        <Text style={styles.trustChip}>{t.trustFree}</Text>
        <Text style={styles.trustDot}>•</Text>
        <Text style={styles.trustChip}>{t.trustEasy}</Text>
        <Text style={styles.trustDot}>•</Text>
        <Text style={styles.trustChip}>{t.trustFast}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            <Upload size={20} color="#FFFFFF" />
            <Text style={styles.primaryCTAText}>{t.uploadCta}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: agentScale }] }}>
          <TouchableOpacity
            style={styles.secondaryCTA}
            onPress={handleAgentsPress}
            activeOpacity={0.8}
          >
            <Users size={18} color={COLORS.primary} />
            <Text style={styles.secondaryCTAText}>{t.agentCta}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
    marginTop: 12,
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 10,
  },
  trustChip: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  trustDot: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  buttonsContainer: {
    gap: 14,
    marginBottom: 16,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  secondaryCTAText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
});
