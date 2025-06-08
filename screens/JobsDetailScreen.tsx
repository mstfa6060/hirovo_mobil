import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/RootNavigator'; // doğru path

type JobsDetailRouteProp = RouteProp<RootStackParamList, 'JobsDetail'>;

export default function JobsDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<JobsDetailRouteProp>();
  const { id } = route.params; // ← id gönderiyorduk

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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>{t('ui.jobs.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.label}>
        {t('ui.jobs.description')}: {job.description}
      </Text>
      <Text style={styles.label}>
        {t('ui.jobs.salary')}: {job.salary}
      </Text>
      <Text style={styles.label}>
        {t('ui.jobs.type')}: {t(`jobType.${HirovoAPI.Enums.HirovoJobType[job.type]}`)}
      </Text>
      <Text style={styles.label}>
        {t('ui.jobs.status')}: {t(`jobStatus.${HirovoAPI.Enums.HirovoJobStatus[job.status]}`)}
      </Text>
      <Text style={styles.label}>
        {t('ui.jobs.employerId')}: {job.employerId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', fontSize: 16 },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 6 }
});
