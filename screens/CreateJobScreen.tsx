import React from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';

const schema = z.object({
    title: z.string().min(3),
    type: z.enum(['full-time', 'part-time', 'contract']),
    salary: z.coerce.number().min(1),
    description: z.string().min(10),
    requiredSkills: z.string().optional(),
    deadline: z.string().optional(),
    notifyRadiusKm: z.coerce.number().min(1).max(100),
});

type FormValues = z.infer<typeof schema>;

export default function CreateJobScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const jobTypeMap: Record<'full-time' | 'part-time' | 'contract', HirovoAPI.Enums.HirovoJobType> = {
                'full-time': HirovoAPI.Enums.HirovoJobType.FullTime,
                'part-time': HirovoAPI.Enums.HirovoJobType.PartTime,
                'contract': HirovoAPI.Enums.HirovoJobType.Freelance,
            };

            const payload = {
                ...data,
                type: jobTypeMap[data.type],
                companyId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
                employerId: 'c9d8c846-10fc-466d-8f45-a4fa4e856abd',
                location: 'Auto',
                latitude: 41.015137,
                longitude: 28.979530,
                notifyRadiusKm: 10,
                requiredSkills: data.requiredSkills?.split(',').map((s) => s.trim()) ?? [],
            };

            const response = await HirovoAPI.Jobs.Create.Request(payload);

            if ('jobId' in response) {
                Alert.alert(t('ui.success'), t('ui.jobs.createdSuccessfully'));
                navigation.goBack();
            } else {
                Alert.alert(t('ui.error'), t('ui.jobs.createError'));
            }
        } catch (err) {
            console.error(err);
            Alert.alert(t('ui.error'), t('ui.jobs.createError'));
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <TopBar title={t('ui.jobs.createJobTitle')} showBackButton />


            <Text style={styles.label}>{t('ui.jobs.title')}</Text>
            <Controller
                control={control}
                name="title"
                render={({ field }) => (
                    <TextInput style={styles.input} placeholder={t('ui.jobs.titlePlaceholder')} {...field} />
                )}
            />

            <Text style={styles.label}>{t('ui.jobs.type')}</Text>
            <Controller
                control={control}
                name="type"
                render={({ field }) => (
                    <TextInput style={styles.input} placeholder="full-time / part-time / contract" {...field} />
                )}
            />

            <Text style={styles.label}>{t('ui.jobs.salary')}</Text>
            <Controller
                control={control}
                name="salary"
                render={({ field }) => (
                    <TextInput
                        {...field}
                        value={field.value?.toString()}
                        keyboardType="numeric"
                        placeholder="75000"
                        style={styles.input}
                    />
                )}
            />

            <Text style={styles.label}>{t('ui.jobs.description')}</Text>
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        placeholder={t('ui.jobs.descriptionPlaceholder')}
                        multiline
                        {...field}
                    />
                )}
            />

            <Text style={styles.label}>{t('ui.jobs.requiredSkills')}</Text>
            <Controller
                control={control}
                name="requiredSkills"
                render={({ field }) => (
                    <TextInput style={styles.input} placeholder="React, TypeScript" {...field} />
                )}
            />
            <Text style={styles.label}>{t('ui.jobs.notifyRadiusKm')}</Text>
            <Controller
                control={control}
                name="notifyRadiusKm"
                defaultValue={10}
                render={({ field }) => (
                    <View style={styles.radiusContainer}>
                        <TextInput
                            style={styles.radiusInput}
                            keyboardType="numeric"
                            value={field.value.toString()}
                            onChangeText={(val) => field.onChange(Number(val))}
                        />
                        <Text style={{ marginHorizontal: 8 }}>km</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                {t('ui.jobs.notifyRadiusExplanation')}
                            </Text>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{t('ui.jobs.submitJob')}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#f9f9f9' },
    label: { fontSize: 14, color: '#333', marginBottom: 6 },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 9999,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    }, radiusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radiusInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        width: 80,
        textAlign: 'center',
    },

});
