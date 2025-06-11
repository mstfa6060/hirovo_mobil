import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Linking,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/RootNavigator';
import TopBar from '../components/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';

type Worker = HirovoAPI.Workers.Detail.IResponseModel & { displayName?: string };
type WorkerDetailRouteProp = RouteProp<RootStackParamList, 'WorkerProfile'>;

export default function WorkerProfileScreen() {
    const { t } = useTranslation();
    const route = useRoute<WorkerDetailRouteProp>();
    const userId = route.params.id;

    const [worker, setWorker] = useState<Worker | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkerDetail = async () => {
            try {
                const response = await HirovoAPI.Workers.Detail.Request({ userId });
                setWorker({
                    ...response,
                    birthDate: response.birthDate ? new Date(response.birthDate) : undefined,
                });
            } catch (err) {
                setError(t('ui.workerProfileScreen.detailError'));
            } finally {
                setLoading(false);
            }
        };

        fetchWorkerDetail();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0b80ee" />
            </View>
        );
    }

    if (error || !worker) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: 'red' }}>{error || t('ui.workerProfileScreen.notFound')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={worker.displayName || t('ui.workerProfileScreen.title')} showBackButton />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('ui.workerProfileScreen.description')}</Text>
                        <Text style={styles.value}>{worker.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>{t('ui.workerProfileScreen.phoneNumber')}</Text>
                        <Text style={styles.value}>
                            {worker.isAvailable ? worker.phoneNumber : '-'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>{t('ui.workerProfileScreen.birthDate')}</Text>
                        <Text style={styles.value}>
                            {worker.birthDate?.toLocaleDateString() || '-'}
                        </Text>
                    </View>

                    <View style={styles.cityDistrict}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('ui.workerProfileScreen.city')}</Text>
                            <Text style={styles.value}>{worker.city}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('ui.workerProfileScreen.district')}</Text>
                            <Text style={styles.value}>{worker.district}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>{t('ui.workerProfileScreen.availabilityStatus')}</Text>
                    <View style={styles.statusSwitchContainer}>
                        <Text
                            style={[
                                styles.statusText,
                                worker.isAvailable ? styles.available : styles.unavailable,
                            ]}
                        >
                            {worker.isAvailable ? t('ui.workerProfileScreen.available') : t('ui.workerProfileScreen.unavailable')}
                        </Text>
                        <Switch
                            value={worker.isAvailable}
                            disabled
                            thumbColor="#fff"
                            trackColor={{
                                false: '#d1d5db',
                                true: '#0b80ee',
                            }}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        !worker.isAvailable && { backgroundColor: '#d1d5db' }
                    ]}
                    disabled={!worker.isAvailable}
                    onPress={() => {
                        if (worker.isAvailable && worker.phoneNumber) {
                            Linking.openURL(`tel:${worker.phoneNumber}`);
                        }
                    }}
                >
                    <Text style={styles.buttonText}>{t('ui.workerProfileScreen.contactWorker')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    value: {
        fontSize: 15,
        color: '#111827',
        marginTop: 4,
    },
    hidden: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#9ca3af',
        marginTop: 4,
    },
    hint: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
    },
    cityDistrict: {
        flexDirection: 'row',
        gap: 16,
    },
    statusCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    statusSwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
        marginRight: 8,
    },
    available: {
        color: '#065f46',
    },
    unavailable: {
        color: '#991b1b',
    },
    footer: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
    },
    button: {
        backgroundColor: '#0b80ee',
        height: 48,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
