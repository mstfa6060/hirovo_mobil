import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import TopBar from 'components/TopBar';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Feather } from '@expo/vector-icons';

type JobApplication = HirovoAPI.JobApplications.All.IResponseModel;
type JobApplicationsRouteProp = RouteProp<RootStackParamList, 'JobApplicationsScreen'>;

const JobApplicationsScreen = () => {
    const { t } = useTranslation();
    const route = useRoute<JobApplicationsRouteProp>();
    const { jobId } = route.params;

    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await HirovoAPI.JobApplications.All.Request({
                sorting: {
                    key: 'appliedAt',
                    direction: HirovoAPI.Enums.XSortingDirection.Descending,
                },
                filters: [
                    {
                        key: 'jobId',
                        type: 'guid',
                        isUsed: true,
                        values: [jobId],
                        min: false,
                        max: false,
                        conditionType: 'equals',
                    },
                ],
                pageRequest: {
                    currentPage: 1,
                    perPageCount: 20,
                    listAll: false,
                },
            });

            setApplications(response);
        } catch (error) {
            console.error('Başvurular alınamadı:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const handleStatusChange = async (applicationId: string, newStatus: HirovoAPI.Enums.ApplicationStatus) => {
        try {
            await HirovoAPI.JobApplications.UpdateStatus.Request({
                jobApplicationId: applicationId,
                status: newStatus,
            });
            fetchApplications();
        } catch (error) {
            console.error('Durum güncellenemedi:', error);
        }
    };

    const handleCall = (phoneNumber: string) => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const renderItem = ({ item }: { item: JobApplication }) => {
        const isAccepted = item.status === HirovoAPI.Enums.ApplicationStatus.Accepted;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>
                    {item.displayName || t('ui.jobApplications.unknownUser')}
                </Text>

                {isAccepted && (
                    <View style={styles.phoneRow}>
                        <Text style={styles.phoneText}>📞 {item.phoneNumber}</Text>
                        <TouchableOpacity
                            onPress={() => handleCall(item.phoneNumber)}
                            style={styles.callButton}
                        >
                            <Feather name="phone" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {!isAccepted && (
                    <Text style={styles.hiddenText}>
                        📞 {t('ui.jobApplications.hiddenPhone')}
                    </Text>
                )}

                <Text style={styles.sub}>
                    {item.city}, {item.district}
                </Text>
                <Text style={styles.status}>
                    {t(`ui.jobApplications.applicationStatus.${HirovoAPI.Enums.ApplicationStatus[item.status]}`)}
                </Text>
                <Text style={styles.date}>
                    {t('ui.jobApplications.appliedAt')}: {new Date(item.appliedAt).toLocaleDateString()}
                </Text>

                {item.status === HirovoAPI.Enums.ApplicationStatus.Pending && (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                            onPress={() => handleStatusChange(item.id, HirovoAPI.Enums.ApplicationStatus.Accepted)}
                        >
                            <Text style={styles.buttonText}>{t('common.confirm')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                            onPress={() => handleStatusChange(item.id, HirovoAPI.Enums.ApplicationStatus.Rejected)}
                        >
                            <Text style={styles.buttonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <TopBar title={t('ui.jobApplications.title')} showBackButton />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    phoneText: {
        fontSize: 14,
        color: '#374151',
    },
    callButton: {
        backgroundColor: '#10b981',
        borderRadius: 9999,
        padding: 8,
    },
    hiddenText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    },
    sub: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 4,
    },
    status: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#007bff',
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 9999,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default JobApplicationsScreen;
