// 📁 screens/EditJobScreen.tsx

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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../src/hooks/useAuth';
import { AppConfig } from '@config/hirovo-config';
import Slider from '@react-native-community/slider';
import { RadioButton } from 'react-native-paper';
import { RootStackParamList } from '../navigation/RootNavigator';
import TopBar from 'components/TopBar';

const schema = z.object({
    title: z.string().min(1, { message: 'ui.EditJobScreen.jobTitleRequired' }),
    type: z.enum(['full-time', 'part-time', 'contract'], {
        errorMap: () => ({ message: 'ui.EditJobScreen.jobTypeRequired' }),
    }),
    salary: z.coerce.number().gt(0, { message: 'ui.EditJobScreen.salaryRequired' }),
    description: z.string().min(10, { message: 'ui.EditJobScreen.jobDescriptionRequired' }),
    requiredSkills: z.array(z.string().min(1)).min(1, { message: 'ui.EditJobScreen.skillsRequired' }),
    notifyRadiusKm: z.coerce.number().min(1).max(100),
    employerId: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;
type EditJobRouteProp = RouteProp<RootStackParamList, 'EditJobScreen'>;

export default function EditJobScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<EditJobRouteProp>();
    const { user } = useAuth();
    const { jobId } = route.params;
    const [skillInput, setSkillInput] = useState('');
    const skillInputRef = useRef<TextInput | null>(null);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            notifyRadiusKm: 10,
            requiredSkills: [],
        },
    });

    useEffect(() => {
        if (user?.id) setValue('employerId', user.id);

        if (jobId) {
            HirovoAPI.Jobs.Detail.Request({ jobId })
                .then((res) => {
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
                    // setValue('requiredSkills', res.requiredSkills); ❌ kaldırıldı, çünkü API'de yok
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

            // Skill isimlerinden skillId üret
            const skillIds: string[] = [];
            for (const skillName of data.requiredSkills) {
                const res = await HirovoAPI.Skills.Create.Request({ name: skillName });
                skillIds.push(res.id);
            }

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
                skillIds,
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
                {/* Diğer alanlar aynı kalıyor */}

                {/* Required Skills */}
                <Text style={styles.label}>{t('ui.EditJobScreen.requiredSkills')} *</Text>
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
                                placeholder={t('ui.EditJobScreen.addSkill')}
                                value={skillInput}
                                onChangeText={setSkillInput}
                                onSubmitEditing={() => {
                                    const trimmed = skillInput.trim();
                                    if (trimmed.length > 0 && !value.includes(trimmed)) {
                                        onChange([...value, trimmed]);
                                        setSkillInput('');
                                        setTimeout(() => {
                                            skillInputRef.current?.focus();
                                        }, 10);
                                    }
                                }}
                                returnKeyType="done"
                            />
                        </>
                    )}
                />
                {errors.requiredSkills && <Text style={styles.error}>{t(errors.requiredSkills.message || '')}</Text>}

                {/* Submit */}
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
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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
    skillText: { fontSize: 13, color: '#1e40af' },
    removeSkill: { marginLeft: 6, color: '#1e3a8a', fontWeight: 'bold' },
    error: { color: 'red', marginBottom: 8, marginTop: -8 },
});
