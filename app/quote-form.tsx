import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Animated,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Globe,
  Info,
  Phone,
  User,
  MapPin,
  Car,
  Shield,
  Users,
  Home,
  CheckCircle,
  MessageCircle,
  PhoneCall,
  MessageSquare,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { submitQuoteForm, type ContactPreference } from '@/services/IntakeService';

type WizardStep =
  | 'phone'
  | 'name'
  | 'zip'
  | 'driversCount'
  | 'driverInfo'
  | 'vehiclesCount'
  | 'vin'
  | 'coverage'
  | 'discounts'
  | 'contactPref'
  | 'consent';

interface DriverEntry {
  name: string;
  dob: string;
}

interface FormData {
  phone: string;
  fullName: string;
  zip: string;
  driversCount: number;
  drivers: DriverEntry[];
  vehiclesCount: number;
  vins: string[];
  coverage: 'minimum' | 'full' | null;
  currentlyInsured: boolean | null;
  insuredMonths: string | null;
  homeowner: boolean | null;
  contactPreference: ContactPreference | null;
  consentGiven: boolean;
}

const DARK = {
  bg: '#0A1120',
  surface: '#111B2E',
  surfaceLight: '#162035',
  text: '#F0F4F8',
  textSecondary: '#8B9DC3',
  textMuted: '#5A6E8A',
  border: '#1E2D45',
  accent: '#0066FF',
  accentLight: 'rgba(0,102,255,0.12)',
  green: '#00C96F',
  greenLight: 'rgba(0,201,111,0.12)',
  error: '#FF4D6A',
  errorLight: 'rgba(255,77,106,0.12)',
  white: '#FFFFFF',
  whatsapp: '#25D366',
  whatsappLight: 'rgba(37,211,102,0.12)',
};

export default function QuoteFormScreen() {
  const { language, setLanguage, setConsentGiven: setAppConsent } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<WizardStep>('phone');
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const [currentVinIndex, setCurrentVinIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoverageInfo, setShowCoverageInfo] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    fullName: '',
    zip: '',
    driversCount: 1,
    drivers: [{ name: '', dob: '' }],
    vehiclesCount: 1,
    vins: [],
    coverage: null,
    currentlyInsured: null,
    insuredMonths: null,
    homeowner: null,
    contactPreference: null,
    consentGiven: false,
  });
  const [error, setError] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isEs = language === 'es';

  const copy = useMemo(() => {
    if (isEs) {
      return {
        headerTitle: 'Obtener Cotización',
        back: 'Atrás',
        next: 'Siguiente',
        submit: 'Enviar',
        stepOf: 'de',
        phoneTitle: '¿Cuál es tu teléfono?',
        phoneSubtitle: 'Te contactaremos por WhatsApp o texto.',
        phonePlaceholder: '(555) 123-4567',
        phoneError: 'Ingresa un número de 10 dígitos',
        nameTitle: '¿Cuál es tu nombre?',
        nameSubtitle: 'Como aparece en tu licencia.',
        namePlaceholder: 'Juan Pérez',
        nameError: 'Ingresa tu nombre completo',
        zipTitle: '¿Cuál es tu código postal?',
        zipSubtitle: 'Donde guardas tu vehículo.',
        zipPlaceholder: '78501',
        zipError: 'Código postal de 5 dígitos',
        driversCountTitle: '¿Cuántos conductores?',
        driversCountSubtitle: 'Todos los que manejan regularmente.',
        driverInfoTitle: (i: number, t: number) => `Conductor ${i + 1} de ${t}`,
        driverInfoSubtitle: 'Nombre y fecha de nacimiento.',
        driverNamePlaceholder: 'Nombre completo',
        driverDobPlaceholder: 'MM/DD/AAAA',
        driverNameError: 'Ingresa el nombre del conductor',
        driverDobError: 'Ingresa fecha de nacimiento válida',
        vehiclesCountTitle: '¿Cuántos vehículos?',
        vehiclesCountSubtitle: 'Selecciona cuántos quieres asegurar.',
        vinTitle: (i: number, t: number) => `VIN del vehículo ${i + 1} de ${t}`,
        vinSubtitle: 'Encuentra el VIN en el tablero o puerta.',
        vinPlaceholder: '1HGBH41JXMN109186',
        vinError: 'El VIN debe tener 17 caracteres',
        vinDuplicateError: 'Este VIN ya fue ingresado',
        coverageTitle: '¿Qué cobertura prefieres?',
        coverageSubtitle: 'Elige tu nivel de protección.',
        minimumLabel: 'Mínimo (30/60/25)',
        minimumDesc: 'Lo que exige la ley en Texas',
        fullLabel: 'Cobertura Completa',
        fullDesc: 'Incluye colisión y comprensivo',
        whatIs306025: '¿Qué significa 30/60/25?',
        coverageInfoTitle: 'Mínimo en Texas: 30/60/25',
        coverageInfoBody: 'Texas te pide tener al menos este seguro:\n\n🏥 $30,000 — Si lastimas a una persona en un accidente, cubre sus gastos médicos.\n\n🏥🏥 $60,000 — Si hay varias personas heridas en el mismo accidente, este es el máximo total.\n\n🚗 $25,000 — Si le pegas al carro de alguien o dañas su propiedad, cubre los arreglos.\n\nEsto es solo lo mínimo que la ley exige. No protege TU carro.\n\n💡 La "Cobertura Completa" agrega protección para tu propio vehículo si chocas o si te lo roban.',
        coverageInfoClose: 'Entendido',
        discountsTitle: 'Descuentos',
        discountsSubtitle: 'Esto nos ayuda a conseguirte mejor precio.',
        currentlyInsured: '¿Tienes seguro actualmente?',
        insuredMonths: '¿Cuántos meses de seguro continuo?',
        months3: '3 meses',
        months6: '6 meses',
        months12: '12+ meses',
        homeownerQ: '¿Eres propietario de casa?',
        yes: 'Sí',
        no: 'No',
        contactPrefTitle: '¿Cómo prefieres que te contactemos?',
        contactPrefSubtitle: 'Solo te contactamos si encontramos ahorro real.',
        contactWhatsApp: 'WhatsApp',
        contactWhatsAppDesc: 'Respuestas rápidas por chat',
        contactText: 'Mensaje de texto',
        contactTextDesc: 'Te enviamos un SMS',
        contactCall: 'Llamada',
        contactCallDesc: 'Un agente te llama',
        contactPrefError: 'Selecciona cómo prefieres ser contactado',
        consentTitle: 'Listo para cotizar',
        consentSubtitle: 'Revisa y confirma.',
        consentText: 'Acepto que Saver y sus agentes me contacten para cotizaciones de seguro. Solo me contactarán si encuentran ahorros reales.',
        consentCheck: 'Acepto ser contactado',
        submitting: 'Enviando...',
        submitError: 'Error al enviar. Intenta de nuevo.',
        readyStatus: 'LISTO PARA COTIZAR',
      };
    }
    return {
      headerTitle: 'Get a Quote',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      stepOf: 'of',
      phoneTitle: "What's your phone number?",
      phoneSubtitle: "We'll contact you via WhatsApp or text.",
      phonePlaceholder: '(555) 123-4567',
      phoneError: 'Enter a valid 10-digit number',
      nameTitle: "What's your full name?",
      nameSubtitle: 'As it appears on your license.',
      namePlaceholder: 'John Smith',
      nameError: 'Enter your full name',
      zipTitle: "What's your ZIP code?",
      zipSubtitle: 'Where you park your vehicle.',
      zipPlaceholder: '78501',
      zipError: '5-digit ZIP code required',
      driversCountTitle: 'How many drivers?',
      driversCountSubtitle: 'Everyone who drives regularly.',
      driverInfoTitle: (i: number, t: number) => `Driver ${i + 1} of ${t}`,
      driverInfoSubtitle: 'Name and date of birth.',
      driverNamePlaceholder: 'Full name',
      driverDobPlaceholder: 'MM/DD/YYYY',
      driverNameError: "Enter the driver's name",
      driverDobError: 'Enter a valid date of birth',
      vehiclesCountTitle: 'How many vehicles?',
      vehiclesCountSubtitle: 'Select how many you want to insure.',
      vinTitle: (i: number, t: number) => `VIN for vehicle ${i + 1} of ${t}`,
      vinSubtitle: 'Find your VIN on the dashboard or door jamb.',
      vinPlaceholder: '1HGBH41JXMN109186',
      vinError: 'VIN must be exactly 17 characters',
      vinDuplicateError: 'This VIN was already entered',
      coverageTitle: 'What coverage do you prefer?',
      coverageSubtitle: 'Choose your level of protection.',
      minimumLabel: 'Minimum (30/60/25)',
      minimumDesc: 'State required minimum in Texas',
      fullLabel: 'Full Coverage',
      fullDesc: 'Includes collision and comprehensive',
      whatIs306025: 'What does 30/60/25 mean?',
      coverageInfoTitle: 'Texas Minimum: 30/60/25',
      coverageInfoBody: 'Texas requires you to carry at least this much insurance:\n\n🏥 $30,000 — If you hurt someone in an accident, this covers their medical bills.\n\n🏥🏥 $60,000 — If multiple people are injured in the same accident, this is the total max.\n\n🚗 $25,000 — If you damage someone\'s car or property, this covers the repairs.\n\nThis is just the legal minimum. It does NOT protect YOUR car.\n\n💡 "Full Coverage" adds protection for your own vehicle if you crash or it gets stolen.',
      coverageInfoClose: 'Got it',
      discountsTitle: 'Discounts',
      discountsSubtitle: 'This helps us get you a better rate.',
      currentlyInsured: 'Are you currently insured?',
      insuredMonths: 'How many months of continuous insurance?',
      months3: '3 months',
      months6: '6 months',
      months12: '12+ months',
      homeownerQ: 'Are you a homeowner?',
      yes: 'Yes',
      no: 'No',
      contactPrefTitle: 'How should we contact you?',
      contactPrefSubtitle: 'We only reach out if we find real savings.',
      contactWhatsApp: 'WhatsApp',
      contactWhatsAppDesc: 'Quick chat replies',
      contactText: 'Text Message',
      contactTextDesc: 'We send you an SMS',
      contactCall: 'Phone Call',
      contactCallDesc: 'An agent calls you',
      contactPrefError: 'Choose how you prefer to be contacted',
      consentTitle: 'Ready to quote',
      consentSubtitle: 'Review and confirm.',
      consentText: 'I agree that Saver and its partner agents may contact me for insurance quotes. They will only contact me if real savings are found.',
      consentCheck: 'I agree to be contacted',
      submitting: 'Submitting...',
      submitError: 'Failed to submit. Please try again.',
      readyStatus: 'READY TO QUOTE',
    };
  }, [isEs]);

  const steps = useMemo<WizardStep[]>(
    () => [
      'phone',
      'name',
      'zip',
      'driversCount',
      'driverInfo',
      'vehiclesCount',
      'vin',
      'coverage',
      'discounts',
      'contactPref',
      'consent',
    ],
    []
  );
  const currentStepIndex = steps.indexOf(step);
  const totalSteps = steps.length;

  const toggleLanguage = useCallback(() => {
    setLanguage(isEs ? 'en' : 'es');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isEs, setLanguage]);

  const animateSlide = useCallback(
    (direction: 'forward' | 'back') => {
      slideAnim.setValue(direction === 'forward' ? 40 : -40);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [slideAnim]
  );

  const validateCurrentStep = useCallback((): boolean => {
    setError('');
    switch (step) {
      case 'phone': {
        const digits = formData.phone.replace(/\D/g, '');
        if (digits.length !== 10) {
          setError(copy.phoneError);
          return false;
        }
        return true;
      }
      case 'name':
        if (formData.fullName.trim().length < 2) {
          setError(copy.nameError);
          return false;
        }
        return true;
      case 'zip': {
        const zipDigits = formData.zip.replace(/\D/g, '');
        if (zipDigits.length !== 5) {
          setError(copy.zipError);
          return false;
        }
        return true;
      }
      case 'driversCount':
        return formData.driversCount >= 1 && formData.driversCount <= 4;
      case 'driverInfo': {
        const d = formData.drivers[currentDriverIndex];
        if (!d || d.name.trim().length < 2) {
          setError(copy.driverNameError);
          return false;
        }
        const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
        if (!dobRegex.test(d.dob)) {
          setError(copy.driverDobError);
          return false;
        }
        return true;
      }
      case 'vehiclesCount':
        return formData.vehiclesCount >= 1 && formData.vehiclesCount <= 4;
      case 'vin': {
        const currentVin = formData.vins[currentVinIndex] || '';
        const cleanVin = currentVin.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleanVin.length !== 17) {
          setError(copy.vinError);
          return false;
        }
        const otherVins = formData.vins.filter((_, i) => i !== currentVinIndex);
        if (otherVins.includes(cleanVin)) {
          setError(copy.vinDuplicateError);
          return false;
        }
        return true;
      }
      case 'coverage':
        return formData.coverage !== null;
      case 'discounts':
        return true;
      case 'contactPref':
        if (!formData.contactPreference) {
          setError(copy.contactPrefError);
          return false;
        }
        return true;
      case 'consent':
        return formData.consentGiven;
      default:
        return true;
    }
  }, [step, formData, currentDriverIndex, currentVinIndex, copy]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (step === 'driversCount') {
      const newDrivers = [...formData.drivers];
      while (newDrivers.length < formData.driversCount) {
        newDrivers.push({ name: '', dob: '' });
      }
      setFormData((prev) => ({
        ...prev,
        drivers: newDrivers.slice(0, formData.driversCount),
      }));
      setCurrentDriverIndex(0);
    }

    if (step === 'driverInfo') {
      if (currentDriverIndex < formData.driversCount - 1) {
        setCurrentDriverIndex(currentDriverIndex + 1);
        animateSlide('forward');
        setError('');
        return;
      }
    }

    if (step === 'vin') {
      const cleanVin = (formData.vins[currentVinIndex] || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const updatedVins = [...formData.vins];
      updatedVins[currentVinIndex] = cleanVin;
      setFormData((prev) => ({ ...prev, vins: updatedVins }));
      if (currentVinIndex < formData.vehiclesCount - 1) {
        setCurrentVinIndex(currentVinIndex + 1);
        animateSlide('forward');
        setError('');
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
      setError('');
      animateSlide('forward');
    }
  }, [
    step,
    currentStepIndex,
    steps,
    formData,
    currentDriverIndex,
    currentVinIndex,
    validateCurrentStep,
    animateSlide,
  ]);

  const goBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (step === 'driverInfo' && currentDriverIndex > 0) {
      setCurrentDriverIndex(currentDriverIndex - 1);
      setError('');
      animateSlide('back');
      return;
    }

    if (step === 'vin' && currentVinIndex > 0) {
      setCurrentVinIndex(currentVinIndex - 1);
      setError('');
      animateSlide('back');
      return;
    }

    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
      setError('');
      animateSlide('back');
      if (steps[prevIndex] === 'driverInfo') {
        setCurrentDriverIndex(formData.driversCount - 1);
      }
      if (steps[prevIndex] === 'vin') {
        setCurrentVinIndex(formData.vehiclesCount - 1);
      }
    } else {
      router.back();
    }
  }, [
    step,
    currentStepIndex,
    steps,
    currentDriverIndex,
    currentVinIndex,
    formData.driversCount,
    formData.vehiclesCount,
    router,
    animateSlide,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const result = await submitQuoteForm({
        phone: formData.phone,
        fullName: formData.fullName,
        zip: formData.zip,
        drivers: formData.drivers,
        vehiclesCount: formData.vehiclesCount,
        vins: formData.vins,
        coverage: formData.coverage!,
        currentlyInsured: formData.currentlyInsured,
        insuredMonths: formData.insuredMonths,
        homeowner: formData.homeowner,
        contactPreference: formData.contactPreference || 'whatsapp',
        language: isEs ? 'es' : 'en',
        consentGiven: formData.consentGiven,
      });

      if (!result.success) {
        console.error('[QUOTE_FORM] Submit error:', result.error);
        setIsSubmitting(false);
        Alert.alert(isEs ? 'Error' : 'Error', copy.submitError);
        return;
      }

      console.log('[QUOTE_FORM] Lead submitted successfully');
      setAppConsent(true);
      router.push('/quote-submitted' as any);
    } catch (err: any) {
      console.error('[QUOTE_FORM] Submit failed:', err);
      setIsSubmitting(false);
      Alert.alert(isEs ? 'Error' : 'Error', err?.message || copy.submitError);
    }
  }, [formData, isEs, validateCurrentStep, setAppConsent, router, copy.submitError]);

  const updateDriver = useCallback(
    (field: 'name' | 'dob', value: string) => {
      const updated = [...formData.drivers];
      if (!updated[currentDriverIndex]) {
        updated[currentDriverIndex] = { name: '', dob: '' };
      }
      updated[currentDriverIndex] = { ...updated[currentDriverIndex], [field]: value };
      setFormData((prev) => ({ ...prev, drivers: updated }));
      setError('');
    },
    [currentDriverIndex, formData.drivers]
  );

  const updateVin = useCallback(
    (text: string) => {
      const updatedVins = [...formData.vins];
      updatedVins[currentVinIndex] = text.toUpperCase();
      setFormData((prev) => ({ ...prev, vins: updatedVins }));
      setError('');
    },
    [currentVinIndex, formData.vins]
  );

  const getStepIcon = (s: WizardStep) => {
    const iconProps = { size: 20, color: DARK.accent, strokeWidth: 2 };
    switch (s) {
      case 'phone':
        return <Phone {...iconProps} />;
      case 'name':
        return <User {...iconProps} />;
      case 'zip':
        return <MapPin {...iconProps} />;
      case 'driversCount':
      case 'driverInfo':
        return <Users {...iconProps} />;
      case 'vehiclesCount':
      case 'vin':
        return <Car {...iconProps} />;
      case 'coverage':
        return <Shield {...iconProps} />;
      case 'discounts':
        return <Home {...iconProps} />;
      case 'contactPref':
        return <MessageCircle {...iconProps} />;
      case 'consent':
        return <CheckCircle {...iconProps} />;
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'phone':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('phone')}</View>
            <Text style={styles.stepTitle}>{copy.phoneTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.phoneSubtitle}</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder={copy.phonePlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.phone}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, phone: text }));
                setError('');
              }}
              keyboardType="phone-pad"
              autoFocus
              testID="phone-input"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('name')}</View>
            <Text style={styles.stepTitle}>{copy.nameTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.nameSubtitle}</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder={copy.namePlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.fullName}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, fullName: text }));
                setError('');
              }}
              autoCapitalize="words"
              autoFocus
              testID="name-input"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'zip':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('zip')}</View>
            <Text style={styles.stepTitle}>{copy.zipTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.zipSubtitle}</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder={copy.zipPlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.zip}
              onChangeText={(text) => {
                setFormData((prev) => ({
                  ...prev,
                  zip: text.replace(/\D/g, '').slice(0, 5),
                }));
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={5}
              autoFocus
              testID="zip-input"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'driversCount':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('driversCount')}</View>
            <Text style={styles.stepTitle}>{copy.driversCountTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.driversCountSubtitle}</Text>
            <View style={styles.countSelector}>
              {[1, 2, 3].map((count) => {
                const label = count === 3 ? '3+' : `${count}`;
                return (
                  <Pressable
                    key={count}
                    style={[
                      styles.countOption,
                      formData.driversCount === count && styles.countOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, driversCount: count }));
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                    }}
                    testID={`driver-count-${count}`}
                  >
                    <Text
                      style={[
                        styles.countText,
                        formData.driversCount === count && styles.countTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      case 'driverInfo':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('driverInfo')}</View>
            <Text style={styles.stepTitle}>
              {copy.driverInfoTitle(currentDriverIndex, formData.driversCount)}
            </Text>
            <Text style={styles.stepSubtitle}>{copy.driverInfoSubtitle}</Text>
            <TextInput
              style={[styles.input, error && error.includes(copy.driverNameError) ? styles.inputError : null]}
              placeholder={copy.driverNamePlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.drivers[currentDriverIndex]?.name || ''}
              onChangeText={(text) => updateDriver('name', text)}
              autoCapitalize="words"
              autoFocus
              testID={`driver-name-${currentDriverIndex}`}
            />
            <View style={styles.inputSpacer} />
            <TextInput
              style={[styles.input, error && error.includes(copy.driverDobError) ? styles.inputError : null]}
              placeholder={copy.driverDobPlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.drivers[currentDriverIndex]?.dob || ''}
              onChangeText={(text) => {
                let formatted = text.replace(/[^\d/]/g, '');
                if (formatted.length === 2 && !formatted.includes('/')) {
                  formatted += '/';
                } else if (formatted.length === 5 && formatted.split('/').length === 2) {
                  formatted += '/';
                }
                updateDriver('dob', formatted.slice(0, 10));
              }}
              keyboardType="number-pad"
              maxLength={10}
              testID={`driver-dob-${currentDriverIndex}`}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'vehiclesCount':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('vehiclesCount')}</View>
            <Text style={styles.stepTitle}>{copy.vehiclesCountTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.vehiclesCountSubtitle}</Text>
            <View style={styles.countSelector}>
              {[1, 2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  style={[
                    styles.countOption,
                    formData.vehiclesCount === count && styles.countOptionSelected,
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      vehiclesCount: count,
                      vins: prev.vins.slice(0, count),
                    }));
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                  }}
                  testID={`vehicle-count-${count}`}
                >
                  <Text
                    style={[
                      styles.countText,
                      formData.vehiclesCount === count && styles.countTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'vin':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('vin')}</View>
            <Text style={styles.stepTitle}>
              {copy.vinTitle(currentVinIndex, formData.vehiclesCount)}
            </Text>
            <Text style={styles.stepSubtitle}>{copy.vinSubtitle}</Text>
            <TextInput
              style={[styles.input, styles.vinInput, error ? styles.inputError : null]}
              placeholder={copy.vinPlaceholder}
              placeholderTextColor={DARK.textMuted}
              value={formData.vins[currentVinIndex] || ''}
              onChangeText={updateVin}
              autoCapitalize="characters"
              maxLength={17}
              autoFocus
              testID={`vin-input-${currentVinIndex}`}
            />
            <Text style={styles.vinCounter}>
              {(formData.vins[currentVinIndex] || '').replace(/[^A-Z0-9]/gi, '').length}
              /17
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'coverage':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('coverage')}</View>
            <Text style={styles.stepTitle}>{copy.coverageTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.coverageSubtitle}</Text>
            <View style={styles.coverageOptions}>
              <Pressable
                style={[
                  styles.coverageCard,
                  formData.coverage === 'minimum' && styles.coverageCardSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, coverage: 'minimum' }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                testID="coverage-minimum"
              >
                <View style={styles.coverageHeader}>
                  <Text
                    style={[
                      styles.coverageLabel,
                      formData.coverage === 'minimum' && styles.coverageLabelSelected,
                    ]}
                  >
                    {copy.minimumLabel}
                  </Text>
                  {formData.coverage === 'minimum' && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={styles.coverageDesc}>{copy.minimumDesc}</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.coverageCard,
                  formData.coverage === 'full' && styles.coverageCardSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, coverage: 'full' }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                testID="coverage-full"
              >
                <View style={styles.coverageHeader}>
                  <Text
                    style={[
                      styles.coverageLabel,
                      formData.coverage === 'full' && styles.coverageLabelSelected,
                    ]}
                  >
                    {copy.fullLabel}
                  </Text>
                  {formData.coverage === 'full' && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={styles.coverageDesc}>{copy.fullDesc}</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.infoLink}
              onPress={() => setShowCoverageInfo(true)}
            >
              <Info size={14} color={DARK.accent} />
              <Text style={styles.infoLinkText}>{copy.whatIs306025}</Text>
            </Pressable>
          </View>
        );

      case 'discounts':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('discounts')}</View>
            <Text style={styles.stepTitle}>{copy.discountsTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.discountsSubtitle}</Text>

            <Text style={styles.fieldLabel}>{copy.currentlyInsured}</Text>
            <View style={styles.yesNoRow}>
              <Pressable
                style={[
                  styles.yesNoBtn,
                  formData.currentlyInsured === true && styles.yesNoBtnSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, currentlyInsured: true }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    formData.currentlyInsured === true && styles.yesNoTextSelected,
                  ]}
                >
                  {copy.yes}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.yesNoBtn,
                  formData.currentlyInsured === false && styles.yesNoBtnSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({
                    ...prev,
                    currentlyInsured: false,
                    insuredMonths: null,
                  }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    formData.currentlyInsured === false && styles.yesNoTextSelected,
                  ]}
                >
                  {copy.no}
                </Text>
              </Pressable>
            </View>

            {formData.currentlyInsured === true && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
                  {copy.insuredMonths}
                </Text>
                <View style={styles.monthsRow}>
                  {['3', '6', '12+'].map((m) => {
                    const label =
                      m === '3'
                        ? copy.months3
                        : m === '6'
                          ? copy.months6
                          : copy.months12;
                    return (
                      <Pressable
                        key={m}
                        style={[
                          styles.monthBtn,
                          formData.insuredMonths === m && styles.monthBtnSelected,
                        ]}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, insuredMonths: m }));
                          if (Platform.OS !== 'web') Haptics.selectionAsync();
                        }}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            formData.insuredMonths === m && styles.monthTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
              {copy.homeownerQ}
            </Text>
            <View style={styles.yesNoRow}>
              <Pressable
                style={[
                  styles.yesNoBtn,
                  formData.homeowner === true && styles.yesNoBtnSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, homeowner: true }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    formData.homeowner === true && styles.yesNoTextSelected,
                  ]}
                >
                  {copy.yes}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.yesNoBtn,
                  formData.homeowner === false && styles.yesNoBtnSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, homeowner: false }));
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    formData.homeowner === false && styles.yesNoTextSelected,
                  ]}
                >
                  {copy.no}
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case 'contactPref':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('contactPref')}</View>
            <Text style={styles.stepTitle}>{copy.contactPrefTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.contactPrefSubtitle}</Text>
            <View style={styles.contactOptions}>
              <Pressable
                style={[
                  styles.contactCard,
                  formData.contactPreference === 'whatsapp' && styles.contactCardWhatsApp,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, contactPreference: 'whatsapp' }));
                  setError('');
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                testID="contact-whatsapp"
              >
                <View style={[
                  styles.contactIconWrap,
                  formData.contactPreference === 'whatsapp' && styles.contactIconWhatsApp,
                ]}>
                  <MessageCircle
                    size={22}
                    color={formData.contactPreference === 'whatsapp' ? '#FFFFFF' : DARK.whatsapp}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[
                    styles.contactLabel,
                    formData.contactPreference === 'whatsapp' && styles.contactLabelActive,
                  ]}>
                    {copy.contactWhatsApp}
                  </Text>
                  <Text style={styles.contactDesc}>{copy.contactWhatsAppDesc}</Text>
                </View>
                {formData.contactPreference === 'whatsapp' && (
                  <View style={styles.contactCheck}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.contactCard,
                  formData.contactPreference === 'text' && styles.contactCardSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, contactPreference: 'text' }));
                  setError('');
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                testID="contact-text"
              >
                <View style={[
                  styles.contactIconWrap,
                  formData.contactPreference === 'text' && styles.contactIconSelected,
                ]}>
                  <MessageSquare
                    size={22}
                    color={formData.contactPreference === 'text' ? '#FFFFFF' : DARK.accent}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[
                    styles.contactLabel,
                    formData.contactPreference === 'text' && styles.contactLabelActive,
                  ]}>
                    {copy.contactText}
                  </Text>
                  <Text style={styles.contactDesc}>{copy.contactTextDesc}</Text>
                </View>
                {formData.contactPreference === 'text' && (
                  <View style={[styles.contactCheck, { backgroundColor: DARK.accent }]}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.contactCard,
                  formData.contactPreference === 'call' && styles.contactCardSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, contactPreference: 'call' }));
                  setError('');
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                testID="contact-call"
              >
                <View style={[
                  styles.contactIconWrap,
                  formData.contactPreference === 'call' && styles.contactIconSelected,
                ]}>
                  <PhoneCall
                    size={22}
                    color={formData.contactPreference === 'call' ? '#FFFFFF' : DARK.accent}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[
                    styles.contactLabel,
                    formData.contactPreference === 'call' && styles.contactLabelActive,
                  ]}>
                    {copy.contactCall}
                  </Text>
                  <Text style={styles.contactDesc}>{copy.contactCallDesc}</Text>
                </View>
                {formData.contactPreference === 'call' && (
                  <View style={[styles.contactCheck, { backgroundColor: DARK.accent }]}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case 'consent':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIconRow}>{getStepIcon('consent')}</View>
            <Text style={styles.stepTitle}>{copy.consentTitle}</Text>
            <Text style={styles.stepSubtitle}>{copy.consentSubtitle}</Text>

            <View style={styles.readyBadge}>
              <CheckCircle size={16} color={DARK.green} strokeWidth={2.5} />
              <Text style={styles.readyBadgeText}>{copy.readyStatus}</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{isEs ? 'Teléfono' : 'Phone'}</Text>
                <Text style={styles.summaryValue}>{formData.phone}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{isEs ? 'Nombre' : 'Name'}</Text>
                <Text style={styles.summaryValue}>{formData.fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ZIP</Text>
                <Text style={styles.summaryValue}>{formData.zip}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {isEs ? 'Conductores' : 'Drivers'}
                </Text>
                <Text style={styles.summaryValue}>{formData.driversCount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {isEs ? 'Vehículos' : 'Vehicles'}
                </Text>
                <Text style={styles.summaryValue}>{formData.vehiclesCount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {isEs ? 'Cobertura' : 'Coverage'}
                </Text>
                <Text style={styles.summaryValue}>
                  {formData.coverage === 'minimum' ? '30/60/25' : isEs ? 'Completa' : 'Full'}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>
                  {isEs ? 'Contacto' : 'Contact'}
                </Text>
                <Text style={styles.summaryValue}>
                  {formData.contactPreference === 'whatsapp'
                    ? 'WhatsApp'
                    : formData.contactPreference === 'text'
                      ? isEs ? 'Texto' : 'Text'
                      : isEs ? 'Llamada' : 'Call'}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.consentRow}
              onPress={() =>
                setFormData((prev) => ({ ...prev, consentGiven: !prev.consentGiven }))
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.consentGiven && styles.checkboxChecked,
                ]}
              >
                {formData.consentGiven && (
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
              <Text style={styles.consentLabel}>{copy.consentCheck}</Text>
            </Pressable>
            <Text style={styles.consentText}>{copy.consentText}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const isLastStep = step === 'consent';
  const canProceed = (() => {
    switch (step) {
      case 'phone':
        return formData.phone.replace(/\D/g, '').length === 10;
      case 'name':
        return formData.fullName.trim().length >= 2;
      case 'zip':
        return formData.zip.replace(/\D/g, '').length === 5;
      case 'driversCount':
        return true;
      case 'driverInfo': {
        const d = formData.drivers[currentDriverIndex];
        return (
          d &&
          d.name.trim().length >= 2 &&
          /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/.test(d.dob)
        );
      }
      case 'vehiclesCount':
        return true;
      case 'vin':
        return (
          (formData.vins[currentVinIndex] || '').replace(/[^A-Z0-9]/gi, '').length ===
          17
        );
      case 'coverage':
        return formData.coverage !== null;
      case 'discounts':
        return true;
      case 'contactPref':
        return formData.contactPreference !== null;
      case 'consent':
        return formData.consentGiven;
      default:
        return false;
    }
  })();

  const getProgress = () => {
    let progress = currentStepIndex;
    if (step === 'driverInfo') {
      progress =
        currentStepIndex + currentDriverIndex / Math.max(formData.driversCount, 1);
    }
    if (step === 'vin') {
      progress =
        currentStepIndex + currentVinIndex / Math.max(formData.vehiclesCount, 1);
    }
    return (progress + 1) / totalSteps;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: copy.headerTitle,
          headerBackTitle: copy.back,
          headerStyle: { backgroundColor: DARK.bg },
          headerTintColor: DARK.text,
          headerTitleStyle: { color: DARK.text, fontWeight: '700' as const },
          headerRight: () => (
            <Pressable onPress={toggleLanguage} style={styles.langButton} hitSlop={8}>
              <Globe size={16} color={DARK.accent} />
              <Text style={styles.langText}>{isEs ? 'EN' : 'ES'}</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${getProgress() * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStepIndex + 1} {copy.stepOf} {totalSteps}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable style={styles.backButton} onPress={goBack} testID="back-button">
            <ChevronLeft size={20} color={DARK.textSecondary} />
            <Text style={styles.backButtonText}>{copy.back}</Text>
          </Pressable>

          <Pressable
            style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
            onPress={isLastStep ? handleSubmit : goNext}
            disabled={!canProceed || isSubmitting}
            testID="next-button"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {isLastStep ? copy.submit : copy.next}
                </Text>
                {!isLastStep && <ChevronRight size={18} color="#FFFFFF" />}
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showCoverageInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverageInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconRow}>
              <Shield size={28} color={DARK.accent} />
            </View>
            <Text style={styles.modalTitle}>{copy.coverageInfoTitle}</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>{copy.coverageInfoBody}</Text>
            </ScrollView>
            <Pressable
              style={styles.modalBtn}
              onPress={() => setShowCoverageInfo(false)}
            >
              <Text style={styles.modalBtnText}>{copy.coverageInfoClose}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  flex: {
    flex: 1,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: DARK.accentLight,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: DARK.accent,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: DARK.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DARK.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: DARK.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepIconRow: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: DARK.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 15,
    color: DARK.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    backgroundColor: DARK.surface,
    borderWidth: 1.5,
    borderColor: DARK.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: DARK.text,
  },
  inputError: {
    borderColor: DARK.error,
    backgroundColor: DARK.errorLight,
  },
  inputSpacer: {
    height: 14,
  },
  vinInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  vinCounter: {
    fontSize: 12,
    color: DARK.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: DARK.error,
    marginTop: 8,
  },
  countSelector: {
    flexDirection: 'row',
    gap: 14,
  },
  countOption: {
    flex: 1,
    paddingVertical: 24,
    borderRadius: 16,
    backgroundColor: DARK.surface,
    borderWidth: 2,
    borderColor: DARK.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOptionSelected: {
    borderColor: DARK.accent,
    backgroundColor: DARK.accentLight,
  },
  countText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: DARK.textSecondary,
  },
  countTextSelected: {
    color: DARK.accent,
  },
  coverageOptions: {
    gap: 14,
  },
  coverageCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: DARK.surface,
    borderWidth: 2,
    borderColor: DARK.border,
  },
  coverageCardSelected: {
    borderColor: DARK.accent,
    backgroundColor: DARK.accentLight,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coverageLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: DARK.text,
  },
  coverageLabelSelected: {
    color: DARK.accent,
  },
  coverageDesc: {
    fontSize: 14,
    color: DARK.textSecondary,
    lineHeight: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DARK.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  infoLinkText: {
    fontSize: 14,
    color: DARK.accent,
    fontWeight: '500' as const,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: DARK.text,
    marginBottom: 12,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  yesNoBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: DARK.surface,
    borderWidth: 2,
    borderColor: DARK.border,
    alignItems: 'center',
  },
  yesNoBtnSelected: {
    borderColor: DARK.accent,
    backgroundColor: DARK.accentLight,
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DARK.textSecondary,
  },
  yesNoTextSelected: {
    color: DARK.accent,
  },
  monthsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  monthBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: DARK.surface,
    borderWidth: 1.5,
    borderColor: DARK.border,
    alignItems: 'center',
  },
  monthBtnSelected: {
    borderColor: DARK.green,
    backgroundColor: DARK.greenLight,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: DARK.textSecondary,
  },
  monthTextSelected: {
    color: DARK.green,
  },
  contactOptions: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: DARK.surface,
    borderWidth: 2,
    borderColor: DARK.border,
    gap: 14,
  },
  contactCardWhatsApp: {
    borderColor: DARK.whatsapp,
    backgroundColor: DARK.whatsappLight,
  },
  contactCardSelected: {
    borderColor: DARK.accent,
    backgroundColor: DARK.accentLight,
  },
  contactIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIconWhatsApp: {
    backgroundColor: DARK.whatsapp,
  },
  contactIconSelected: {
    backgroundColor: DARK.accent,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DARK.text,
  },
  contactLabelActive: {
    fontWeight: '700' as const,
  },
  contactDesc: {
    fontSize: 13,
    color: DARK.textMuted,
    marginTop: 2,
  },
  contactCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DARK.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DARK.greenLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  readyBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: DARK.green,
    letterSpacing: 1,
  },
  summaryCard: {
    backgroundColor: DARK.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DARK.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: DARK.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: DARK.text,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: DARK.border,
    backgroundColor: DARK.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: DARK.accent,
    borderColor: DARK.accent,
  },
  consentLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: DARK.text,
    flex: 1,
  },
  consentText: {
    fontSize: 13,
    color: DARK.textMuted,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DARK.border,
    backgroundColor: DARK.bg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 15,
    color: DARK.textSecondary,
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: DARK.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: DARK.surface,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: DARK.border,
  },
  modalIconRow: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: DARK.text,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 320,
    marginBottom: 20,
  },
  modalBody: {
    fontSize: 15,
    color: DARK.textSecondary,
    lineHeight: 24,
  },
  modalBtn: {
    backgroundColor: DARK.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
