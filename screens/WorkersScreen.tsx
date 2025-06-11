import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';


type Worker = {
    id: string;
    displayName: string;
    phoneNumber: string;
    city: string;
    district: string;
    birthDate?: string;
    isAvailable?: boolean;
    description: string;
};

export default function WorkersScreen() {
    const { t } = useTranslation();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    const fetchWorkers = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const response = await HirovoAPI.Workers.All.Request({
                sorting: {
                    key: 'createdAt',
                    direction: HirovoAPI.Enums.XSortingDirection.Descending,
                },
                filters: [],
                pageRequest: {
                    currentPage: 1,
                    perPageCount: 20,
                    listAll: false,
                },
            });

            const normalizedWorkers = response
                .map((item: HirovoAPI.Workers.All.IResponseModel) => ({
                    ...item,
                    birthDate: item.birthDate
                        ? new Date(item.birthDate).toISOString().substring(0, 10)
                        : undefined,
                }))
                .filter(
                    (item) =>
                        item.displayName?.trim() ||
                        item.phoneNumber?.trim() ||
                        item.city?.trim() ||
                        item.district?.trim() ||
                        item.description?.trim()
                );

            setWorkers(normalizedWorkers);
        } catch (err) {
            setError(t('ui.workers.loadError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [t]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWorkers(true);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{t('ui.workers')}</Text>
            <View style={styles.searchBox}>
                <TextInput
                    placeholder={t('ui.searchWorkers')}
                    style={styles.searchInput}
                />
            </View>
            <FlatList
                data={workers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('WorkerProfile', { id: item.id })}
                    >
                        <View style={styles.cardContent}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.displayName}</Text>
                                <Text style={styles.line}>
                                    <Text style={styles.label}>Telefon:</Text> {item.phoneNumber}
                                </Text>
                                <Text style={styles.line}>
                                    <Text style={styles.label}>Şehir:</Text> {item.city}
                                </Text>
                                <Text style={styles.line}>
                                    <Text style={styles.label}>İlçe:</Text> {item.district}
                                </Text>
                                {item.birthDate && (
                                    <Text style={styles.line}>
                                        <Text style={styles.label}>Doğum Tarihi:</Text> {item.birthDate}
                                    </Text>
                                )}
                                {item.description && (
                                    <Text style={styles.line}>
                                        <Text style={styles.label}>Açıklama:</Text> {item.displayName}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.statusContainer}>
                                <Text
                                    style={[
                                        styles.status,
                                        item.isAvailable ? styles.available : styles.unavailable,
                                    ]}
                                >
                                    {item.isAvailable ? t('ui.available') : t('ui.unavailable')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        color: '#111827',
    },
    searchBox: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    searchInput: {
        fontSize: 14,
        color: '#111827',
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    line: {
        fontSize: 13,
        color: '#4b5563',
        marginTop: 4,
    },
    label: {
        fontWeight: 'bold',
        color: '#374151',
    },
    statusContainer: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    status: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        fontWeight: '600',
        overflow: 'hidden',
    },
    available: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    unavailable: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
});
