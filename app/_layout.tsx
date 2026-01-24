import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableOpacity, Platform } from "react-native";
import { Globe } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function HeaderLanguageButton() {
  const { language, setLanguage } = useApp();

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 8,
        marginRight: 8,
      }}
    >
      <Globe size={14} color={Colors.secondary} />
    </TouchableOpacity>
  );
}

function RootLayoutNav() {
  const { language } = useApp();

  const backTitle = language === 'es' ? 'Atrás' : 'Back';

  return (
    <Stack
      screenOptions={{
        headerBackTitle: backTitle,
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
        headerRight: () => <HeaderLanguageButton />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="accident-report"
        options={{
          title: language === 'es' ? 'Kit de Emergencia' : 'Roadside Kit',
          presentation: 'modal',
          headerStyle: { backgroundColor: Colors.danger },
          headerTintColor: Colors.textInverse,
          headerRight: () => null,
        }}
      />
      <Stack.Screen
        name="upload-document"
        options={{
          title: language === 'es' ? 'Subir Documento' : 'Upload Document',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="policy-detail"
        options={{
          title: language === 'es' ? 'Detalles de Póliza' : 'Policy Details',
        }}
      />
      <Stack.Screen
        name="quotes"
        options={{
          title: language === 'es' ? 'Comparar Cotizaciones' : 'Compare Quotes',
        }}
      />
      <Stack.Screen
        name="evidence-wizard"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          title: language === 'es' ? 'Panel de Admin' : 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="agent-onboarding"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="ai-assistant"
        options={{
          title: language === 'es' ? 'Asistente IA' : 'AI Assistant',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="agent-subscription"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="agent-dashboard"
        options={{
          title: language === 'es' ? 'Panel de Agente' : 'Agent Dashboard',
        }}
      />
      <Stack.Screen
        name="quote-submitted"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <AppProvider>
              <AnalyticsProvider>
                <RootLayoutNav />
              </AnalyticsProvider>
            </AppProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </SafeAreaProvider>
  );
}
