import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Send,
  Camera,
  Image as ImageIcon,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { validateVin, validateDob } from '@/utils/quoteReadiness';
import { trpc } from '@/lib/trpc';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
}

interface CollectedData {
  phone?: string;
  isMarried?: boolean;
  spouseDriving?: boolean;
  primaryDriverName?: string;
  primaryDriverDob?: string;
  spouseName?: string;
  spouseDob?: string;
  idUploaded?: boolean;
  idType?: string;
  vehicleCount?: number;
  vehicles?: { vin: string; index: number }[];
  coverageType?: 'minimum' | 'full';
  collisionDeductible?: number;
  compDeductible?: number;
  zip?: string;
  notifyOnlyIfCheaper?: boolean;
  currentPremiumApprox?: number;
  targetMonthly?: number;
  targetSavings?: number;
}

type FlowStep =
  | 'greeting'
  | 'awaiting_phone'
  | 'awaiting_name'
  | 'awaiting_dob'
  | 'awaiting_married'
  | 'awaiting_spouse_driving'
  | 'awaiting_spouse_name'
  | 'awaiting_spouse_dob'
  | 'awaiting_id_upload'
  | 'awaiting_vehicle_count'
  | 'awaiting_vin'
  | 'awaiting_zip'
  | 'awaiting_coverage_type'
  | 'awaiting_collision_deductible'
  | 'awaiting_comp_deductible'
  | 'awaiting_price_gate'
  | 'awaiting_current_premium'
  | 'awaiting_target_price'
  | 'awaiting_confirmation'
  | 'complete';

const COLORS = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111111',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#1275FF',
  primaryLight: '#E8F2FF',
  userBubble: '#1275FF',
  botBubble: '#F3F4F6',
};

function TypingIndicator() {
  const dotAnim1 = useRef(new Animated.Value(0.4)).current;
  const dotAnim2 = useRef(new Animated.Value(0.4)).current;
  const dotAnim3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.4, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dotAnim1, 0);
    animate(dotAnim2, 150);
    animate(dotAnim3, 300);
  }, [dotAnim1, dotAnim2, dotAnim3]);

  return (
    <View style={[styles.row, styles.rowLeft]}>
      <View style={[styles.bubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[styles.typingDot, { opacity: anim }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function MessageBubble({ role, text, image }: { role: 'user' | 'assistant'; text: string; image?: string }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {image && (
          <Image source={{ uri: image }} style={styles.bubbleImage} resizeMode="cover" />
        )}
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>{text}</Text>
      </View>
    </View>
  );
}

export default function QuoteFormScreen() {
  const { language, setConsentGiven, user } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [flowStep, setFlowStep] = useState<FlowStep>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [showIdUpload, setShowIdUpload] = useState(false);
  const [currentVinIndex, setCurrentVinIndex] = useState(0);
  const [isProcessing] = useState(false);
  
  const collectedData = useRef<CollectedData>({});

  const submitIntakeMutation = trpc.intake.submit.useMutation({
    onSuccess: (data) => {
      console.log('[QUOTE_FORM] Intake submitted:', data.status);
    },
    onError: (error) => {
      console.error('[QUOTE_FORM] Intake error:', error);
    },
  });

  const isEs = language === 'es';

  const copy = useMemo(() => {
    if (isEs) {
      return {
        headerTitle: 'Obtener Cotización',
        greeting: '¡Hola! Soy tu asistente de seguros. Te ayudaré a obtener cotizaciones de auto. Empecemos con tu número de teléfono.',
        askPhone: '¿Cuál es tu número de teléfono? (10 dígitos)',
        askName: '¿Cuál es tu nombre completo?',
        askDob: '¿Cuál es tu fecha de nacimiento? (MM/DD/AAAA)',
        askMarried: '¿Estás casado/a? (Sí/No)',
        askSpouseDriving: '¿Tu esposo/a manejará el vehículo? (Sí/No)',
        askSpouseName: '¿Cuál es el nombre de tu esposo/a?',
        askSpouseDob: '¿Cuál es la fecha de nacimiento de tu esposo/a? (MM/DD/AAAA)',
        askIdUpload: 'Por favor sube una foto de tu licencia de conducir.',
        askVehicleCount: '¿Cuántos vehículos quieres asegurar?',
        askVin: (i: number) => `¿Cuál es el VIN del vehículo ${i + 1}? (17 caracteres)`,
        askZip: '¿Cuál es tu código postal donde guardas el auto?',
        askCoverage: '¿Qué tipo de cobertura prefieres?\n1. Mínima (solo responsabilidad)\n2. Completa (colisión + comprensiva)',
        askCollisionDeductible: '¿Cuál deducible de colisión prefieres?\n1. $500\n2. $1000\n3. $2000',
        askCompDeductible: '¿Cuál deducible comprensivo prefieres?\n1. $500\n2. $1000\n3. $2000',
        askPriceGate: '¿Solo quieres que te notifiquemos si encontramos un precio más bajo? (Sí/No)',
        askCurrentPremium: '¿Cuánto pagas actualmente al mes (aproximado)?',
        askTargetPrice: '¿Cuánto te gustaría pagar al mes?',
        confirmation: '¡Gracias! Hemos recibido tu información. Un agente te contactará pronto con cotizaciones.',
        invalidPhone: 'Por favor ingresa un número de teléfono válido de 10 dígitos.',
        invalidDob: 'Por favor ingresa una fecha válida (MM/DD/AAAA).',
        invalidVin: 'El VIN debe tener exactamente 17 caracteres.',
        invalidZip: 'Por favor ingresa un código postal válido de 5 dígitos.',
        placeholder: 'Escribe tu respuesta...',
        send: 'Enviar',
      };
    }
    return {
      headerTitle: 'Get a Quote',
      greeting: "Hi! I'm your insurance assistant. I'll help you get auto insurance quotes. Let's start with your phone number.",
      askPhone: 'What is your phone number? (10 digits)',
      askName: 'What is your full name?',
      askDob: 'What is your date of birth? (MM/DD/YYYY)',
      askMarried: 'Are you married? (Yes/No)',
      askSpouseDriving: 'Will your spouse be driving the vehicle? (Yes/No)',
      askSpouseName: "What is your spouse's name?",
      askSpouseDob: "What is your spouse's date of birth? (MM/DD/YYYY)",
      askIdUpload: 'Please upload a photo of your driver\'s license.',
      askVehicleCount: 'How many vehicles do you want to insure?',
      askVin: (i: number) => `What is the VIN of vehicle ${i + 1}? (17 characters)`,
      askZip: 'What is your ZIP code where you park the car?',
      askCoverage: 'What type of coverage do you prefer?\n1. Minimum (liability only)\n2. Full (collision + comprehensive)',
      askCollisionDeductible: 'What collision deductible do you prefer?\n1. $500\n2. $1000\n3. $2000',
      askCompDeductible: 'What comprehensive deductible do you prefer?\n1. $500\n2. $1000\n3. $2000',
      askPriceGate: 'Only notify you if we find a lower price? (Yes/No)',
      askCurrentPremium: 'How much do you currently pay per month (approximately)?',
      askTargetPrice: 'How much would you like to pay per month?',
      confirmation: "Thank you! We've received your information. An agent will contact you soon with quotes.",
      invalidPhone: 'Please enter a valid 10-digit phone number.',
      invalidDob: 'Please enter a valid date (MM/DD/YYYY).',
      invalidVin: 'VIN must be exactly 17 characters.',
      invalidZip: 'Please enter a valid 5-digit ZIP code.',
      placeholder: 'Type your answer...',
      send: 'Send',
    };
  }, [isEs]);

  const addBotMessage = useCallback((text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        text,
      }]);
    }, 800);
  }, []);

  const addUserMessage = useCallback((text: string, image?: string) => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      role: 'user',
      text,
      image,
    }]);
  }, []);

  useEffect(() => {
    if (flowStep === 'greeting') {
      addBotMessage(copy.greeting);
      setTimeout(() => {
        addBotMessage(copy.askPhone);
        setFlowStep('awaiting_phone');
      }, 1500);
    }
  }, [flowStep, copy, addBotMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSubmit = useCallback(async () => {
    const data = collectedData.current;
    
    try {
      await submitIntakeMutation.mutateAsync({
        userId: user?.id || `user_${Date.now()}`,
        intake: {
          phone: data.phone,
          insuredFullName: data.primaryDriverName,
          garagingAddress: { zip: data.zip, state: 'TX' },
          contactPreference: 'whatsapp',
          language: language === 'es' ? 'es' : 'en',
          consentContactAllowed: true,
          drivers: [
            ...(data.primaryDriverName ? [{
              fullName: data.primaryDriverName,
              dob: data.primaryDriverDob,
            }] : []),
            ...(data.spouseName ? [{
              fullName: data.spouseName,
              dob: data.spouseDob,
            }] : []),
          ],
          vehicles: (data.vehicles || []).map(v => ({ vin: v.vin })),
          coverageType: data.coverageType,
          collisionDeductible: data.collisionDeductible,
          compDeductible: data.compDeductible,
          currentPremium: data.currentPremiumApprox,
        },
      });
      
      setConsentGiven(true);
      router.push('/quote-submitted');
    } catch (error) {
      console.error('[QUOTE_FORM] Submit error:', error);
      Alert.alert(
        isEs ? 'Error' : 'Error',
        isEs ? 'No pudimos enviar tu información. Intenta de nuevo.' : 'We couldn\'t submit your information. Please try again.'
      );
    }
  }, [user, language, isEs, submitIntakeMutation, setConsentGiven, router]);

  const processUserInput = useCallback((text: string) => {
    const trimmed = text.trim();
    addUserMessage(trimmed);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (flowStep) {
      case 'awaiting_phone': {
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length === 10) {
          collectedData.current.phone = digits;
          addBotMessage(copy.askName);
          setFlowStep('awaiting_name');
        } else {
          addBotMessage(copy.invalidPhone);
        }
        break;
      }
      case 'awaiting_name': {
        if (trimmed.length >= 2) {
          collectedData.current.primaryDriverName = trimmed;
          addBotMessage(copy.askDob);
          setFlowStep('awaiting_dob');
        }
        break;
      }
      case 'awaiting_dob': {
        if (validateDob(trimmed)) {
          collectedData.current.primaryDriverDob = trimmed;
          addBotMessage(copy.askMarried);
          setFlowStep('awaiting_married');
        } else {
          addBotMessage(copy.invalidDob);
        }
        break;
      }
      case 'awaiting_married': {
        const yes = isEs ? ['si', 'sí', 's'] : ['yes', 'y'];
        const no = isEs ? ['no', 'n'] : ['no', 'n'];
        const lower = trimmed.toLowerCase();
        if (yes.some(y => lower.includes(y))) {
          collectedData.current.isMarried = true;
          addBotMessage(copy.askSpouseDriving);
          setFlowStep('awaiting_spouse_driving');
        } else if (no.some(n => lower === n)) {
          collectedData.current.isMarried = false;
          addBotMessage(copy.askIdUpload);
          setFlowStep('awaiting_id_upload');
          setShowIdUpload(true);
        }
        break;
      }
      case 'awaiting_spouse_driving': {
        const yes = isEs ? ['si', 'sí', 's'] : ['yes', 'y'];
        const no = isEs ? ['no', 'n'] : ['no', 'n'];
        const lower = trimmed.toLowerCase();
        if (yes.some(y => lower.includes(y))) {
          collectedData.current.spouseDriving = true;
          addBotMessage(copy.askSpouseName);
          setFlowStep('awaiting_spouse_name');
        } else if (no.some(n => lower === n)) {
          collectedData.current.spouseDriving = false;
          addBotMessage(copy.askIdUpload);
          setFlowStep('awaiting_id_upload');
          setShowIdUpload(true);
        }
        break;
      }
      case 'awaiting_spouse_name': {
        if (trimmed.length >= 2) {
          collectedData.current.spouseName = trimmed;
          addBotMessage(copy.askSpouseDob);
          setFlowStep('awaiting_spouse_dob');
        }
        break;
      }
      case 'awaiting_spouse_dob': {
        if (validateDob(trimmed)) {
          collectedData.current.spouseDob = trimmed;
          addBotMessage(copy.askIdUpload);
          setFlowStep('awaiting_id_upload');
          setShowIdUpload(true);
        } else {
          addBotMessage(copy.invalidDob);
        }
        break;
      }
      case 'awaiting_id_upload': {
        addBotMessage(copy.askVehicleCount);
        setFlowStep('awaiting_vehicle_count');
        setShowIdUpload(false);
        break;
      }
      case 'awaiting_vehicle_count': {
        const count = parseInt(trimmed, 10);
        if (count >= 1 && count <= 5) {
          collectedData.current.vehicleCount = count;
          collectedData.current.vehicles = [];
          addBotMessage(copy.askVin(0));
          setFlowStep('awaiting_vin');
          setCurrentVinIndex(0);
        }
        break;
      }
      case 'awaiting_vin': {
        const vin = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (validateVin(vin)) {
          collectedData.current.vehicles = collectedData.current.vehicles || [];
          collectedData.current.vehicles.push({ vin, index: currentVinIndex });
          const nextIndex = currentVinIndex + 1;
          if (nextIndex < (collectedData.current.vehicleCount || 1)) {
            setCurrentVinIndex(nextIndex);
            addBotMessage(copy.askVin(nextIndex));
          } else {
            addBotMessage(copy.askZip);
            setFlowStep('awaiting_zip');
          }
        } else {
          addBotMessage(copy.invalidVin);
        }
        break;
      }
      case 'awaiting_zip': {
        const zip = trimmed.replace(/\D/g, '');
        if (zip.length === 5) {
          collectedData.current.zip = zip;
          addBotMessage(copy.askCoverage);
          setFlowStep('awaiting_coverage_type');
        } else {
          addBotMessage(copy.invalidZip);
        }
        break;
      }
      case 'awaiting_coverage_type': {
        const lower = trimmed.toLowerCase();
        if (lower.includes('1') || lower.includes('min')) {
          collectedData.current.coverageType = 'minimum';
          addBotMessage(copy.askPriceGate);
          setFlowStep('awaiting_price_gate');
        } else if (lower.includes('2') || lower.includes('full') || lower.includes('compl')) {
          collectedData.current.coverageType = 'full';
          addBotMessage(copy.askCollisionDeductible);
          setFlowStep('awaiting_collision_deductible');
        }
        break;
      }
      case 'awaiting_collision_deductible': {
        if (trimmed.includes('1') || trimmed.includes('500')) {
          collectedData.current.collisionDeductible = 500;
        } else if (trimmed.includes('2') || trimmed.includes('1000')) {
          collectedData.current.collisionDeductible = 1000;
        } else if (trimmed.includes('3') || trimmed.includes('2000')) {
          collectedData.current.collisionDeductible = 2000;
        }
        if (collectedData.current.collisionDeductible) {
          addBotMessage(copy.askCompDeductible);
          setFlowStep('awaiting_comp_deductible');
        }
        break;
      }
      case 'awaiting_comp_deductible': {
        if (trimmed.includes('1') || trimmed.includes('500')) {
          collectedData.current.compDeductible = 500;
        } else if (trimmed.includes('2') || trimmed.includes('1000')) {
          collectedData.current.compDeductible = 1000;
        } else if (trimmed.includes('3') || trimmed.includes('2000')) {
          collectedData.current.compDeductible = 2000;
        }
        if (collectedData.current.compDeductible) {
          addBotMessage(copy.askPriceGate);
          setFlowStep('awaiting_price_gate');
        }
        break;
      }
      case 'awaiting_price_gate': {
        const yes = isEs ? ['si', 'sí', 's'] : ['yes', 'y'];
        const lower = trimmed.toLowerCase();
        if (yes.some(y => lower.includes(y))) {
          collectedData.current.notifyOnlyIfCheaper = true;
          addBotMessage(copy.askCurrentPremium);
          setFlowStep('awaiting_current_premium');
        } else {
          collectedData.current.notifyOnlyIfCheaper = false;
          addBotMessage(copy.confirmation);
          setFlowStep('complete');
          handleSubmit();
        }
        break;
      }
      case 'awaiting_current_premium': {
        const num = parseInt(trimmed.replace(/\D/g, ''), 10);
        if (num > 0) {
          collectedData.current.currentPremiumApprox = num;
          addBotMessage(copy.askTargetPrice);
          setFlowStep('awaiting_target_price');
        }
        break;
      }
      case 'awaiting_target_price': {
        const num = parseInt(trimmed.replace(/\D/g, ''), 10);
        if (num > 0) {
          collectedData.current.targetMonthly = num;
          addBotMessage(copy.confirmation);
          setFlowStep('complete');
          handleSubmit();
        }
        break;
      }
      default:
        break;
    }
  }, [flowStep, copy, isEs, addBotMessage, addUserMessage, currentVinIndex, handleSubmit]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isProcessing) return;
    const text = input.trim();
    setInput('');
    processUserInput(text);
  }, [input, isProcessing, processUserInput]);

  const handleIdUpload = useCallback(async (source: 'camera' | 'library') => {
    
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            isEs ? 'Permiso requerido' : 'Permission needed',
            isEs ? 'Se necesita acceso a la cámara' : 'Camera access is required'
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            isEs ? 'Permiso requerido' : 'Permission needed',
            isEs ? 'Se necesita acceso a las fotos' : 'Photo library access is required'
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        collectedData.current.idUploaded = true;
        collectedData.current.idType = 'license';
        addUserMessage(isEs ? 'Licencia subida' : 'License uploaded', result.assets[0].uri);
        setShowIdUpload(false);
        addBotMessage(copy.askVehicleCount);
        setFlowStep('awaiting_vehicle_count');
      }
    } catch (error) {
      console.error('[QUOTE_FORM] Image picker error:', error);
    }
  }, [isEs, addUserMessage, addBotMessage, copy]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: copy.headerTitle,
          headerBackTitle: isEs ? 'Atrás' : 'Back',
        }}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageBubble role={item.role} text={item.text} image={item.image} />
        )}
        contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + 100 }]}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />

      {showIdUpload && (
        <View style={styles.uploadBar}>
          <Pressable
            style={styles.uploadOption}
            onPress={() => handleIdUpload('camera')}
          >
            <Camera size={24} color={COLORS.primary} />
            <Text style={styles.uploadOptionText}>{isEs ? 'Cámara' : 'Camera'}</Text>
          </Pressable>
          <Pressable
            style={styles.uploadOption}
            onPress={() => handleIdUpload('library')}
          >
            <ImageIcon size={24} color={COLORS.primary} />
            <Text style={styles.uploadOptionText}>{isEs ? 'Galería' : 'Gallery'}</Text>
          </Pressable>
          <Pressable
            style={styles.uploadOption}
            onPress={() => {
              setShowIdUpload(false);
              processUserInput('skip');
            }}
          >
            <X size={24} color={COLORS.textSecondary} />
            <Text style={styles.uploadOptionText}>{isEs ? 'Saltar' : 'Skip'}</Text>
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={copy.placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={flowStep !== 'complete' && flowStep !== 'greeting'}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || flowStep === 'complete') && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || flowStep === 'complete'}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageList: {
    padding: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: COLORS.botBubble,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: COLORS.text,
  },
  bubbleImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  uploadBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  uploadOption: {
    alignItems: 'center',
    gap: 4,
  },
  uploadOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
