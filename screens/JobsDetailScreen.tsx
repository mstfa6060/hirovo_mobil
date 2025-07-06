import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Share,
    Platform
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/RootNavigator';
import TopBar from '../components/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../src/hooks/useAuth';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppConfig } from '@config/hirovo-config';
import Toast from 'react-native-root-toast';
import * as Clipboard from 'expo-clipboard';
import i18n from '@config/i18n';


type JobsDetailRouteProp = RouteProp<RootStackParamList, 'JobsDetail'>;

export default function JobsDetailScreen() {
    const { t } = useTranslation();
    const route = useRoute<JobsDetailRouteProp>();
    const { id } = route.params;

    const [job, setJob] = useState<HirovoAPI.Jobs.Detail.IResponseModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const response = await HirovoAPI.Jobs.Detail.Request({ jobId: id, languageCode: i18n.language });
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


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { user } = useAuth();

    const handleApply = async () => {
        try {
            if (!user?.id || !job?.id) return;

            await HirovoAPI.JobApplications.Create.Request({
                jobId: job.id,
                workerId: user.id,
                companyId: AppConfig.DefaultCompanyId,
            });

            Alert.alert(
                t('ui.jobs.applicationSuccess'),
                t('ui.jobs.applicationSubmitted'),
                [
                    {
                        text: t('ui.success'),
                        onPress: () => {
                            navigation.navigate('Drawer', {
                                screen: 'HomeTabs',
                                params: {
                                    screen: 'Applications',
                                },
                            });
                        },
                    },
                ]
            );
        } catch (err) {
            console.error('Başvuru hatası:', err);
            Alert.alert(t('ui.jobs.applicationError'), t('ui.jobs.pleaseTryAgain'));
        }
    };

    const handleShare = async () => {
        try {
            if (!job) return;

            const jobId = job.id;
            const deepLink = `hirovo://jobs/${jobId}`;
            const fallbackLink = `https://mstfa6060.github.io/hirovo-link/?jobId=${jobId}`;

            const shareMessage =
                `${job.title} - ${job.employerDisplayName}\n\n` +
                `${t('ui.jobs.description')}: ${job.description}\n` +
                `${t('ui.jobs.salary')}: ${job.salary.toLocaleString()} ₺\n\n` +
                `${t('ui.jobs.viewLink')}: ${fallbackLink}`;

            await Clipboard.setStringAsync(fallbackLink);
            Toast.show('🔗 ' + t('ui.link.copied'), {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });

            await Share.share({
                title: job.title,
                message: shareMessage,
            });
        } catch (err) {
            console.error('Paylaşım hatası:', err);
        }
    };


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
        <SafeAreaView style={styles.container}>
            <TopBar title={t('ui.jobs.detailTitle')} showBackButton />

            <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
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

            {/* Alt sabit butonlar */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="favorite-border" size={24} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                    <MaterialIcons name="share" size={24} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        user.id === job.employerId && { backgroundColor: '#d1d5db' }
                    ]}
                    onPress={handleApply}
                    disabled={user.id === job.employerId}
                >
                    <Text style={[
                        styles.primaryButtonText,
                        user.id === job.employerId && { color: '#9ca3af' }
                    ]}>
                        {user.id === job.employerId
                            ? t('ui.jobs.cannotApplyOwn') // örneğin: "Kendi ilanınıza başvuramazsınız"
                            : t('ui.jobs.applyNow')}
                    </Text>
                </TouchableOpacity>


            </View>
        </SafeAreaView>
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

    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 20 : 12, // yukarı alındı
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
        elevation: 8,
    },
    iconButton: {
        padding: 10,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
    },
    primaryButton: {
        flex: 1,
        height: 48,
        borderRadius: 9999,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
