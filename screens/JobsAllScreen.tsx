import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Job = HirovoAPI.Jobs.All.IResponseModel;

export default function JobsAllScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await HirovoAPI.Jobs.All.Request({
          sorting: {
            key: 'createdAt',
            direction: HirovoAPI.Enums.XSortingDirection.Descending
          },
          filters: [],
          pageRequest: {
            currentPage: 1,
            perPageCount: 20,
            listAll: false
          }
        });
        setJobs(response);
      } catch (err) {
        console.error(err);
        setError(t('ui.jobs.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const goToJobDetail = (jobId: string) => {
    navigation.navigate('JobsDetail', { id: jobId });
  };

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
    <View style={styles.container}>
      <Text style={styles.header}>{t('ui.jobs.feedTitle')}</Text>
      <Text style={styles.subHeader}>{t('ui.jobs.feedSubtitle')}</Text>

      <FlatList
        style={{ marginTop: 24 }}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.subInfo}>Hirovo Inc. – Remote</Text>
            <Text style={styles.description}>
              Özet bilgi: {item.salary}₺, {t(`jobType.${HirovoAPI.Enums.HirovoJobType[item.type]}`)}, {t(`jobStatus.${HirovoAPI.Enums.HirovoJobStatus[item.status]}`)}
            </Text>

            <TouchableOpacity onPress={() => goToJobDetail(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>{t('ui.jobs.viewDetails')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  subHeader: { fontSize: 14, color: '#666', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3
  },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  subInfo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  description: { fontSize: 14, color: '#374151', marginTop: 8 },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center'
  },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '600' }
});
