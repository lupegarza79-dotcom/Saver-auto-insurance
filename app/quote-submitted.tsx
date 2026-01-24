import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const COLORS = {
    background: '#FFFFFF',
    text: '#111111',
    textSecondary: '#6B7280',
    primaryBlue: '#1275FF',
    success: '#0BBE7D',
    successLight: '#DCFCE7',
};

export default function QuoteSubmittedScreen() {
    const router = useRouter();
    const { language } = useApp();
    const scaleAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);

    const text = {
        title: language === 'es' ? '¡Enviado!' : 'Submitted!',
        message: language === 'es'
            ? 'Tu información ha sido recibida. Estamos preparando tus cotizaciones y te avisaremos pronto.'
            : 'Your information has been received. We\'re preparing your quotes and will notify you soon.',
        subMessage: language === 'es'
            ? 'Esto usualmente toma menos de 24 horas.'
            : 'This usually takes less than 24 hours.',
        button: language === 'es' ? 'Volver al inicio' : 'Go to Home',
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <CheckCircle size={80} color={COLORS.success} />
                </Animated.View>

                <Text style={styles.title}>{text.title}</Text>
                <Text style={styles.message}>{text.message}</Text>
                <Text style={styles.subMessage}>{text.subMessage}</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/')}
                >
                    <Text style={styles.buttonText}>{text.button}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    subMessage: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 48,
    },
    button: {
        backgroundColor: COLORS.primaryBlue,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 16,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
