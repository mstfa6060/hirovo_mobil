import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../src/hooks/useAuth';
import { AppConfig } from '@config/hirovo-config';
import Slider from '@react-native-community/slider';
import { RadioButton } from 'react-native-paper';
import { RootStackParamList } from '../navigation/RootNavigator';
import TopBar from 'components/TopBar'; // varsa


const schema = z.object({
    title: z.string().min(1, { message: 'ui.EditJobScreen.jobTitleRequired' }),
    type: z.enum(['full-time', 'part-time', 'contract'], {
        errorMap: () => ({ message: 'ui.EditJobScreen.jobTypeRequired' }),
    }),
    salary: z.coerce.number().gt(0, { message: 'ui.EditJobScreen.salaryRequired' }),
    description: z.string().min(10, { message: 'ui.EditJobScreen.jobDescriptionRequired' }),
    requiredSkills: z.string().optional(),
    deadline: z.string().optional(),
    notifyRadiusKm: z.coerce.number().min(1, { message: 'ui.EditJobScreen.notificationRadiusRequired' }).max(100, { message: 'ui.EditJobScreen.notificationRadiusMax' }),
    employerId: z.string().min(1, { message: 'ui.EditJobScreen.employerId' }),
});

type FormValues = z.infer<typeof schema>;
type EditJobRouteProp = RouteProp<RootStackParamList, 'EditJobScreen'>;

export default function EditJobScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<EditJobRouteProp>();
    const { user } = useAuth();
    const { jobId } = route.params;
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            notifyRadiusKm: 10,
        },
    });

    useEffect(() => {
        if (user?.id) setValue('employerId', user.id);
        if (jobId) {
            HirovoAPI.Jobs.Detail.Request({ jobId })
                .then(res => {
                    const typeMap = {
                        [HirovoAPI.Enums.HirovoJobType.FullTime]: 'full-time',
                        [HirovoAPI.Enums.HirovoJobType.PartTime]: 'part-time',
                        [HirovoAPI.Enums.HirovoJobType.Freelance]: 'contract',
                    } as const;

                    setValue('title', res.title);
                    setValue('description', res.description);
                    setValue('salary', res.salary);
                    setValue('type', typeMap[res.type]);
                    setValue('notifyRadiusKm', res.notifyRadiusKm);
                })
                .catch(() => {
                    Alert.alert(t('ui.error'), t('ui.EditJobScreen.loadError'));
                });
        }
    }, [user, jobId]);

    const onUpdate = async (data: FormValues) => {
        try {
            const jobTypeMap = {
                'full-time': HirovoAPI.Enums.HirovoJobType.FullTime,
                'part-time': HirovoAPI.Enums.HirovoJobType.PartTime,
                'contract': HirovoAPI.Enums.HirovoJobType.Freelance,
            };

            const payload = {
                jobId,
                title: data.title,
                description: data.description,
                salary: data.salary,
                type: jobTypeMap[data.type],
                status: HirovoAPI.Enums.HirovoJobStatus.Active,
                latitude: 41.015137,
                longitude: 28.97953,
                notifyRadiusKm: data.notifyRadiusKm,
            };

            await HirovoAPI.Jobs.Update.Request(payload);
            Alert.alert(t('ui.success'), t('ui.EditJobScreen.updatedSuccessfully'));
            navigation.goBack();
        } catch (err) {
            Alert.alert(t('ui.error'), t('ui.EditJobScreen.updateError'));
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <TopBar title={t('ui.EditJobScreen.editJobTitle')} showBackButton />

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

                <Text style={styles.label}>{t('ui.EditJobScreen.title')} *</Text>
                <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder={t('ui.EditJobScreen.titlePlaceholder')}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.EditJobScreen.salary')} *</Text>
                <Controller
                    control={control}
                    name="salary"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="75000"
                            keyboardType="numeric"
                            onChangeText={text => onChange(parseFloat(text))}
                            value={value ? value.toString() : ''}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.EditJobScreen.description')} *</Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder={t('ui.EditJobScreen.descriptionPlaceholder')}
                            multiline
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.EditJobScreen.type')} *</Text>
                <Controller
                    control={control}
                    name="type"
                    render={({ field: { value, onChange } }) => (
                        <RadioButton.Group onValueChange={onChange} value={value}>
                            <View style={styles.radioRow}>
                                <RadioButton value="full-time" />
                                <Text style={styles.radioLabel}>{t('jobType.FullTime')}</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="part-time" />
                                <Text style={styles.radioLabel}>{t('jobType.PartTime')}</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="contract" />
                                <Text style={styles.radioLabel}>{t('jobType.Freelance')}</Text>
                            </View>
                        </RadioButton.Group>
                    )}
                />

                <Text style={styles.label}>{t('ui.EditJobScreen.notifyRadiusKm')} *</Text>
                <Controller
                    control={control}
                    name="notifyRadiusKm"
                    render={({ field: { value, onChange } }) => (
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={1}
                                maximumValue={100}
                                step={1}
                                minimumTrackTintColor="#007bff"
                                maximumTrackTintColor="#d3d3d3"
                                thumbTintColor="#007bff"
                                value={value}
                                onValueChange={onChange}
                            />
                            <Text style={styles.radiusValue}>{value} km</Text>
                        </View>
                    )}
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onUpdate)} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{t('ui.EditJobScreen.updateJob')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#007bff',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
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
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    radiusValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007bff',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    radioLabel: {
        fontSize: 14,
        color: '#333',
    },
});