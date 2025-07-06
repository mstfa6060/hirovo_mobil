import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useAuth } from 'src/hooks/useAuth';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/RootNavigator';
import TopBar from 'components/TopBar';
import i18n from '@config/i18n';

type Job = HirovoAPI.Jobs.All.IResponseModel;

const MyJobListScreen = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const response = await HirovoAPI.Jobs.All.Request({
                languageCode: i18n.language,
                sorting: {
                    key: 'createdAt',
                    direction: HirovoAPI.Enums.XSortingDirection.Descending,
                },
                filters: [
                    {
                        key: 'hirovoEmployer_Id',
                        type: 'guid',
                        isUsed: true,
                        values: [user.id],
                        conditionType: 'equals',
                        min: false,
                        max: false,
                    },
                ],
                pageRequest: {
                    currentPage: 1,
                    perPageCount: 20,
                    listAll: false,
                },
            });

            setJobs(response);
            setError(null);
        } catch (err) {
            console.error('İlanlar alınamadı:', err);
            setError(t('ui.myjobslist.loadError') || 'İlanlar alınırken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        if (!user?.id) return;
        setRefreshing(true);
        await fetchJobs();
        setRefreshing(false);
    }, [user?.id]);

    const goToJobDetail = (jobId: string) => {
        navigation.navigate('JobsDetail', { id: jobId });
    };

    useEffect(() => {
        if (user?.id) {
            fetchJobs();
        }
    }, [user?.id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 8 }}>{t('common.loading')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <TopBar title={t('ui.myjobslist.title')} showBackButton />
            <Text style={styles.subHeader}>{t('ui.myjobslist.myJobsSubtitle')}</Text>

            <FlatList
                style={{ marginTop: 12 }}
                data={jobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => goToJobDetail(item.id)} style={styles.card}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.subInfo}>Hirovo Inc.</Text>
                        <Text style={styles.description}>
                            {item.salary}₺ – {t(`jobType.${HirovoAPI.Enums.HirovoJobType[item.type]}`)}, {t(`jobStatus.${HirovoAPI.Enums.HirovoJobStatus[item.status]}`)}
                        </Text>
                        <Text style={styles.applicationText}>
                            {t('ui.myjobslist.applicationCount', { count: item.application })}
                        </Text>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditJobScreen', { jobId: item.id })}
                                style={[styles.roundButton, styles.lightButton]}
                            >
                                <Text style={styles.lightButtonText}>{t('ui.myjobslist.editJob')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('JobApplicationsScreen', { jobId: item.id })}
                                style={[styles.roundButton, styles.primaryButton]}
                            >
                                <Text style={styles.primaryButtonText}>{t('ui.myjobslist.viewApplications')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    subHeader: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        marginHorizontal: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    subInfo: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    description: {
        fontSize: 14,
        color: '#374151',
        marginTop: 8,
    },
    applicationText: {
        fontSize: 13,
        color: '#10b981',
        marginTop: 6,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        flexWrap: 'wrap',
    },
    roundButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    lightButton: {
        backgroundColor: '#f1f5f9',
    },
    lightButtonText: {
        color: '#1f2937',
        fontWeight: '500',
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: '#007bff',
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    container: {
        paddingBottom: 16,
    },
});

export default MyJobListScreen;
