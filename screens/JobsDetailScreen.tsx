import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/RootNavigator';

// Tip tanımı
type JobsDetailRouteProp = RouteProp<RootStackParamList, 'JobsDetail'>;

export default function JobsDetailScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<JobsDetailRouteProp>();
    const { id } = route.params;

    const [job, setJob] = useState<HirovoAPI.Jobs.Detail.IResponseModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const response = await HirovoAPI.Jobs.Detail.Request({ jobId: id });
                setJob(response);
            } catch (err) {
                console.error(err);
                setError(t('ui.jobs.detailLoadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>{t('common.loading')}</Text>
            </View>
        );
    }

    if (error || !job) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error || t('ui.jobs.notFound')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.subInfo}>{job.employerDisplayName}</Text>
                <Text style={styles.description}>{job.description}</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.label}>{t('ui.jobs.salary')}:</Text>
                    <Text style={styles.value}>{job.salary.toLocaleString()} ₺</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.label}>{t('ui.jobs.type')}:</Text>
                    <Text style={styles.value}>{t(`jobType.${HirovoAPI.Enums.HirovoJobType[job.type]}`)}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.label}>{t('ui.jobs.status')}:</Text>
                    <Text style={styles.value}>{t(`jobStatus.${HirovoAPI.Enums.HirovoJobStatus[job.status]}`)}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { color: 'red', fontSize: 16 },
    card: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    jobTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    subInfo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    description: { fontSize: 16, color: '#374151', marginVertical: 12 },
    infoBox: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    label: { fontSize: 14, color: '#6b7280' },
    value: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
});
