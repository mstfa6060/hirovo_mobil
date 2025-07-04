import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '../src/hooks/useAuth';

type ApplicationItem = {
    id: string;
    title: string;
    salary: number;
    jobType: string;
    status: HirovoAPI.Enums.ApplicationStatus;
    appliedDate: string;
};

export default function ApplicationsScreen() {
    const { t } = useTranslation();
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return; // user hazır değilse bekle

        const fetchApplications = async () => {
            try {
                const response = await HirovoAPI.JobApplications.AppliedJobs.Request({
                    workerId: user.id,
                });

                if (!response || !Array.isArray(response)) {
                    setApplications([]); // boş liste ata
                    return;
                }

                const mapped = response.map((item) => ({
                    id: item.jobId,
                    title: item.title,
                    salary: item.salary,
                    jobType: HirovoAPI.Enums.HirovoJobType[item.type] ?? 'Unknown',
                    status: item.applicationStatus,
                    appliedDate: format(new Date(item.appliedAt), 'MMM d, yyyy'),
                }));


                setApplications(mapped);
            } catch (error) {
                console.error('Başvurular alınamadı:', error);
            } finally {
                setLoading(false);
            }
        };


        fetchApplications();
    }, [user?.id]);


    const getStatusStyle = (status: HirovoAPI.Enums.ApplicationStatus) => {
        switch (status) {
            case HirovoAPI.Enums.ApplicationStatus.Accepted:
                return [styles.statusBadge, styles.accepted];
            case HirovoAPI.Enums.ApplicationStatus.Pending:
                return [styles.statusBadge, styles.pending];
            case HirovoAPI.Enums.ApplicationStatus.Rejected:
                return [styles.statusBadge, styles.rejected];
            case HirovoAPI.Enums.ApplicationStatus.Cancelled:
                return [styles.statusBadge, styles.cancelled];
            default:
                return styles.statusBadge;
        }
    };

    const renderItem = ({ item }: { item: ApplicationItem }) => (
        <View style={styles.card}>
            <View style={styles.iconBox}>
                <Text style={styles.iconText}>💼</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>
                    {item.salary} · {t(`jobType.${item.jobType}`)}
                </Text>
                <Text style={styles.date}>
                    {t('ui.ApplicationsScreen.appliedDate')}: {item.appliedDate}
                </Text>
            </View>
            <View style={getStatusStyle(item.status)}>
                <Text style={styles.statusText}>
                    {t(`ui.ApplicationsScreen.statuses.${HirovoAPI.Enums.ApplicationStatus[item.status]}`)}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{t('ui.ApplicationsScreen.myApplications')}</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    list: {
        paddingBottom: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 48,
        height: 48,
        backgroundColor: '#007bff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        color: '#fff',
        fontSize: 20,
    },
    info: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
        color: '#121417',
    },
    subtitle: {
        fontSize: 14,
        color: '#677683',
    },
    date: {
        fontSize: 12,
        color: '#A0A4A8',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    accepted: {
        backgroundColor: '#d4edda',
    },
    pending: {
        backgroundColor: '#fff3cd',
    },
    rejected: {
        backgroundColor: '#f8d7da',
    },
    cancelled: {
        backgroundColor: '#ececec',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#121417',
    },
});
