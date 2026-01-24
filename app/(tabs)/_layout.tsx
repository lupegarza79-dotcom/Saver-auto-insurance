import { Tabs } from "expo-router";
import { Home, Shield, Bell, User } from "lucide-react-native";
import React from "react";
import { Platform, useWindowDimensions, View, StyleSheet } from "react-native";
import { useApp } from "@/contexts/AppContext";

const COLORS = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  primary: '#0066FF',
  text: '#1E293B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { language } = useApp();
  const isWideScreen = width > 768;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          height: Platform.OS === 'ios' ? 84 : 64,
          ...(Platform.OS === 'web' && isWideScreen ? {
            marginHorizontal: Math.max(0, (width - 600) / 2),
            marginBottom: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: COLORS.border,
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
          } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'es' ? 'Inicio' : 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Shield size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="guardian"
        options={{
          title: language === 'es' ? 'Recordatorios' : 'Reminders',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: language === 'es' ? 'Perfil' : 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary + '15',
  },
});
