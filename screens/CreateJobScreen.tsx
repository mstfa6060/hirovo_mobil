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
    Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { HirovoAPI } from '@api/business_modules/hirovo';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/hooks/useAuth';
import { AppConfig } from '@config/hirovo-config';
import Slider from '@react-native-community/slider';
import { RadioButton } from 'react-native-paper';
import TopBar from '../components/TopBar';

const schema = z.object({
    title: z.string().min(1, { message: 'ui.jobs.jobTitleRequired' }),
    type: z.enum(['full-time', 'part-time', 'contract'], {
        errorMap: () => ({ message: 'ui.jobs.jobTypeRequired' }),
    }),
    salary: z.coerce.number().gt(0, { message: 'ui.jobs.salaryRequired' }),
    description: z.string().min(10, { message: 'ui.jobs.jobDescriptionRequired' }),
    requiredSkills: z.array(z.string().min(1)).min(1, { message: 'ui.jobs.skillsRequired' }),
    deadline: z.string().optional(),
    notifyRadiusKm: z.coerce
        .number()
        .min(1, { message: 'ui.jobs.notificationRadiusRequired' })
        .max(100, { message: 'ui.jobs.notificationRadiusMax' }),
    employerId: z.string().min(1, { message: 'ui.jobs.employerId' }),
});

type FormValues = z.infer<typeof schema>;

export default function CreateJobScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user } = useAuth();
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const skillInputRef = useRef<TextInput | null>(null);
    const [skillInput, setSkillInput] = useState('');

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
        setFocus,
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            notifyRadiusKm: 10,
            requiredSkills: [],
        },
    });

    useEffect(() => {
        if (user?.id) {
            setValue('employerId', user.id);
        }
    }, [user]);

    const onSubmit = async (data: FormValues) => {
        try {
            const jobTypeMap = {
                'full-time': HirovoAPI.Enums.HirovoJobType.FullTime,
                'part-time': HirovoAPI.Enums.HirovoJobType.PartTime,
                'contract': HirovoAPI.Enums.HirovoJobType.Freelance,
            };

            // Beceri adlarını backend'e göndererek ID'lerini al
            const skillIds: string[] = [];
            for (const skillName of data.requiredSkills) {
                const res = await HirovoAPI.Skills.Create.Request({ name: skillName });
                skillIds.push(res.id);
            }

            const payload = {
                title: data.title,
                description: data.description,
                salary: data.salary,
                type: jobTypeMap[data.type],
                employerId: user.id,
                latitude: 41.015137,
                longitude: 28.97953,
                notifyRadiusKm: data.notifyRadiusKm,
                companyId: AppConfig.DefaultCompanyId,
                skillIds,
            };

            const response = await HirovoAPI.Jobs.Create.Request(payload);

            if ('jobId' in response || 'id' in response) {
                Alert.alert(t('ui.success'), t('ui.jobs.createdSuccessfully'));
                reset();
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert(t('ui.error'), t('ui.jobs.createError'));
        }
    };

    const onInvalid = () => {
        Keyboard.dismiss();
        const fieldOrder: (keyof FormValues)[] = [
            'title',
            'salary',
            'description',
            'requiredSkills',
            'type',
            'notifyRadiusKm',
            'employerId',
        ];

        for (const fieldName of fieldOrder) {
            if (errors[fieldName]) {
                const index = fieldOrder.indexOf(fieldName);
                const ref = inputRefs.current[index];
                if (ref?.focus) {
                    ref.focus();
                } else {
                    setFocus(fieldName);
                }
                break;
            }
        }
    };

    const handleAddSkill = (currentSkills: string[], onChange: (val: string[]) => void) => {
        const trimmed = skillInput.trim();
        if (trimmed.length > 0 && !currentSkills.includes(trimmed)) {
            onChange([...currentSkills, trimmed]);
            setSkillInput('');
            setTimeout(() => {
                skillInputRef.current?.focus(); // input açık kalmaya devam etsin
            }, 10);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TopBar title={t('ui.jobs.createJobTitle')} showBackButton />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Title */}
                    <Text style={styles.label}>{t('ui.jobs.title')} *</Text>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <TextInput
                                ref={(ref) => { inputRefs.current[0] = ref; }}
                                style={styles.input}
                                placeholder={t('ui.jobs.titlePlaceholder')}
                                onChangeText={field.onChange}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.title && <Text style={styles.error}>{t(errors.title.message || '')}</Text>}

                    {/* Salary */}
                    <Text style={styles.label}>{t('ui.jobs.salary')} *</Text>
                    <Controller
                        control={control}
                        name="salary"
                        render={({ field }) => (
                            <TextInput
                                ref={(ref) => { inputRefs.current[1] = ref; }}
                                style={styles.input}
                                placeholder="75000"
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const parsed = parseFloat(text);
                                    field.onChange(text === '' ? undefined : !isNaN(parsed) ? parsed : 0);
                                }}
                                value={field.value ? field.value.toString() : ''}
                            />
                        )}
                    />
                    {errors.salary && <Text style={styles.error}>{t(errors.salary.message || '')}</Text>}

                    {/* Description */}
                    <Text style={styles.label}>{t('ui.jobs.description')} *</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <TextInput
                                ref={(ref) => { inputRefs.current[2] = ref; }}
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder={t('ui.jobs.descriptionPlaceholder')}
                                multiline
                                onChangeText={field.onChange}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.description && <Text style={styles.error}>{t(errors.description.message || '')}</Text>}

                    {/* Required Skills */}
                    <Text style={styles.label}>{t('ui.jobs.requiredSkills')} *</Text>
                    <Controller
                        control={control}
                        name="requiredSkills"
                        render={({ field: { value, onChange } }) => (
                            <>
                                <View style={styles.skillTagContainer}>
                                    {value?.map((skill, idx) => (
                                        <View key={idx} style={styles.skillTag}>
                                            <Text style={styles.skillText}>{skill}</Text>
                                            <TouchableOpacity onPress={() => {
                                                const updated = value.filter((_, i) => i !== idx);
                                                onChange(updated);
                                            }}>
                                                <Text style={styles.removeSkill}>×</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                <TextInput
                                    ref={skillInputRef}
                                    style={styles.input}
                                    placeholder={t('ui.jobs.addSkill')}
                                    value={skillInput}
                                    onChangeText={setSkillInput}
                                    onSubmitEditing={() => handleAddSkill(value, onChange)}
                                    returnKeyType="done"
                                />
                            </>
                        )}
                    />
                    {errors.requiredSkills && <Text style={styles.error}>{t(errors.requiredSkills.message || '')}</Text>}

                    {/* Type */}
                    <Text style={styles.label}>{t('ui.jobs.type')} *</Text>
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
                    {errors.type && <Text style={styles.error}>{t(errors.type.message || '')}</Text>}

                    {/* Notify Radius */}
                    <Text style={styles.label}>{t('ui.jobs.notifyRadiusKm')} *</Text>
                    <Controller
                        control={control}
                        name="notifyRadiusKm"
                        render={({ field }) => (
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={1}
                                    maximumValue={100}
                                    step={1}
                                    minimumTrackTintColor="#007bff"
                                    maximumTrackTintColor="#d3d3d3"
                                    thumbTintColor="#007bff"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                />
                                <Text style={styles.radiusValue}>{field.value} km</Text>
                            </View>
                        )}
                    />
                    {errors.notifyRadiusKm && <Text style={styles.error}>{t(errors.notifyRadiusKm.message || '')}</Text>}

                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit(onSubmit, onInvalid)}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>{t('ui.jobs.submitJob')}</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        backgroundColor: '#f9f9f9',
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
    error: {
        color: 'red',
        marginBottom: 8,
        marginTop: -8,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 9999,
        alignItems: 'center',
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
    bottomButtonContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
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
    skillTagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        fontSize: 13,
        color: '#1e40af',
    },
    removeSkill: {
        marginLeft: 6,
        color: '#1e3a8a',
        fontWeight: 'bold',
    },
});
