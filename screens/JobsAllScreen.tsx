import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function JobsAllScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<HirovoAPI.Jobs.All.IResponseModel[]>([]);
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

console.log('Fetched jobs:', response);

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

  if (jobs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>{t('ui.jobs.noJobs')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 10 }}
      renderItem={({ item }) => (
<TouchableOpacity style={styles.card} onPress={() => goToJobDetail(item.id)}>
  <Text style={styles.title}>{item.title}</Text>
  <Text>{t('ui.jobs.salary')}: {item.salary}</Text>
  <Text>
    {t('ui.jobs.type')}: {t(`ui.jobType.${HirovoAPI.Enums.HirovoJobType[item.type]}`)}
  </Text>
  <Text>
    {t('ui.jobs.status')}: {t(`ui.jobStatus.${HirovoAPI.Enums.HirovoJobStatus[item.status]}`)}
  </Text>
</TouchableOpacity>

      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    color: '#ef4444',
    fontSize: 16
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  }
});
