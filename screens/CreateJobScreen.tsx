import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/hooks/useAuth';
import DropDownPicker from 'react-native-dropdown-picker';
import { AppConfig } from '@config/hirovo-config';

const schema = z.object({
    title: z.string().min(1, { message: 'ui.jobs.jobTitleRequired' }),
    type: z.enum(['full-time', 'part-time', 'contract'], {
        errorMap: () => ({ message: 'ui.jobs.jobTypeRequired' }),
    }),
    salary: z.coerce.number().gt(0, { message: 'ui.jobs.salaryRequired' }),
    description: z.string().min(10, { message: 'ui.jobs.jobDescriptionRequired' }),
    requiredSkills: z.string().optional(),
    deadline: z.string().optional(),
    notifyRadiusKm: z.coerce.number().min(1, { message: 'ui.jobs.notificationRadiusRequired' }).max(100, { message: 'ui.jobs.notificationRadiusMax' }),
    employerId: z.string().min(1, { message: 'ui.jobs.employerId' }),
});

type FormValues = z.infer<typeof schema>;

export default function CreateJobScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            notifyRadiusKm: 10,
        },
    });

    useEffect(() => {
        if (user?.id) {
            setValue('employerId', user.id);
        }
    }, [user]);

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: t('jobType.FullTime'), value: 'full-time' },
        { label: t('jobType.PartTime'), value: 'part-time' },
        { label: t('jobType.Freelance'), value: 'contract' },
    ]);

    const onSubmit = async (data: FormValues) => {
        try {
            const jobTypeMap = {
                'full-time': HirovoAPI.Enums.HirovoJobType.FullTime,
                'part-time': HirovoAPI.Enums.HirovoJobType.PartTime,
                'contract': HirovoAPI.Enums.HirovoJobType.Freelance,
            };

            const payload = {
                ...data,
                type: jobTypeMap[data.type],
                companyId: AppConfig.DefaultCompanyId,
                employerId: user.id,
                location: 'Auto',
                latitude: 41.015137,
                longitude: 28.97953,
                notifyRadiusKm: data.notifyRadiusKm,
                requiredSkills: data.requiredSkills?.split(',').map(s => s.trim()) ?? [],
            };

            const response = await HirovoAPI.Jobs.Create.Request(payload);

            if ('jobId' in response || 'id' in response) {
                Alert.alert(t('ui.success'), t('ui.jobs.createdSuccessfully'));
                navigation.goBack();
            } else {
                Alert.alert(t('ui.error'), t('ui.jobs.createError'));
            }
        } catch (err) {
            Alert.alert(t('ui.error'), t('ui.jobs.createError'));
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('ui.jobs.createJobTitle')}</Text>
                </View>

                <Text style={styles.label}>{t('ui.jobs.title')} <Text style={{ color: 'red' }}>*</Text></Text>
                <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder={t('ui.jobs.titlePlaceholder')}
                            onChangeText={text => onChange(text.trim())}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.jobs.type')} <Text style={{ color: 'red' }}>*</Text></Text>
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <DropDownPicker
                            open={open}
                            value={field.value}
                            items={items}
                            setOpen={setOpen}
                            setValue={callback => {
                                const value = typeof callback === 'function' ? callback(field.value) : callback;
                                field.onChange(value);
                            }}
                            setItems={setItems}
                            onChangeValue={field.onChange}
                            placeholder={t('ui.jobs.type')}
                            style={styles.dropdown}
                            dropDownContainerStyle={{ borderColor: '#d1d5db' }}
                            zIndex={1000}
                            zIndexInverse={1000}
                            listMode="MODAL"
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.jobs.salary')} <Text style={{ color: 'red' }}>*</Text></Text>
                <Controller
                    control={control}
                    name="salary"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="75000"
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const parsed = parseFloat(text);
                                onChange(text.trim() === '' ? undefined : !isNaN(parsed) ? parsed : 0);
                            }}
                            onBlur={onBlur}
                            value={value ? value.toString() : ''}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.jobs.description')} <Text style={{ color: 'red' }}>*</Text></Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            placeholder={t('ui.jobs.descriptionPlaceholder')}
                            multiline
                            onChangeText={text => onChange(text.trim())}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.jobs.requiredSkills')}</Text>
                <Controller
                    control={control}
                    name="requiredSkills"
                    render={({ field }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="React, TypeScript"
                            onChangeText={text => field.onChange(text.trim())}
                            value={field.value}
                        />
                    )}
                />

                <Text style={styles.label}>{t('ui.jobs.notifyRadiusKm')}</Text>
                <View style={styles.sliderRow}>
                    <TouchableOpacity
                        style={styles.stepButton}
                        onPress={() => setValue('notifyRadiusKm', Math.max(1, watch('notifyRadiusKm') - 1))}
                    >
                        <Text style={styles.stepText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.radiusValue}>{watch('notifyRadiusKm')} km</Text>

                    <TouchableOpacity
                        style={styles.stepButton}
                        onPress={() => setValue('notifyRadiusKm', Math.min(100, watch('notifyRadiusKm') + 1))}
                    >
                        <Text style={styles.stepText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{t('ui.jobs.submitJob')}</Text>
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
    header: {
        marginBottom: 16,
        marginTop: 18,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
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
    dropdown: {
        marginBottom: 16,
        borderColor: '#d1d5db',
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
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 12,
    },
    stepButton: {
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    stepText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    radiusValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007bff',
    },
});
